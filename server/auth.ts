import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { sendAdminNotification } from "./websocket";
import { User as SelectUser } from "../shared/schema.js";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  if (!stored || !stored.includes(".")) {
    return false;
  }
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) {
    return false;
  }
  try {
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return (
      hashedBuf.length === suppliedBuf.length &&
      timingSafeEqual(hashedBuf, suppliedBuf)
    );
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "default-secret-key-for-development",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: false,
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax",
      domain: undefined,
    },
    name: "connect.sid",
    rolling: true,
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      // Try to find user by username first, then by email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }

      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("No email found in Google profile"));
            }

            // Check if user already exists
            let user = await storage.getUserByEmail(email);

            if (!user) {
              // Create new user
              user = await storage.createUser({
                username: email,
                email: email,
                name:
                  profile.displayName ||
                  profile.name?.givenName ||
                  "Google User",
                userType: "individual",
                password: await hashPassword(randomBytes(32).toString("hex")), // Random password for OAuth users
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        },
      ),
    );
  }

  // Kakao OAuth Strategy
  if (process.env.KAKAO_CLIENT_ID) {
    passport.use(
      new KakaoStrategy(
        {
          clientID: process.env.KAKAO_CLIENT_ID,
          callbackURL: "/api/auth/kakao/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile._json?.kakao_account?.email;
            const nickname = profile._json?.properties?.nickname;

            if (!email) {
              return done(new Error("No email found in Kakao profile"));
            }

            // Check if user already exists
            let user = await storage.getUserByEmail(email);

            if (!user) {
              // Create new user
              user = await storage.createUser({
                username: email,
                email: email,
                name: nickname || "Kakao User",
                userType: "individual",
                password: await hashPassword(randomBytes(32).toString("hex")), // Random password for OAuth users
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        },
      ),
    );
  }

  passport.serializeUser((user: any, done) => {
    console.log("Serializing user:", user);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log("Deserializing user ID:", id);
      const user = await storage.getUser(id);
      console.log("Deserialized user:", user ? "User found" : "User not found");
      if (user) {
        done(null, user);
      } else {
        console.log("User not found during deserialization");
        done(null, false);
      }
    } catch (error) {
      console.error("Error deserializing user:", error);
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    // Send notification to admins if it's a business registration
    if (req.body.userType === "business") {
      sendAdminNotification({
        type: "business_pending",
        title: "새로운 기관 승인 요청",
        message: `"${req.body.organizationName || req.body.name}" 기관이 승인을 기다리고 있습니다.`,
        data: { userId: user.id, organizationName: req.body.organizationName },
      });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Login error" });
      }
      if (!user) {
        console.log("Authentication failed - no user");
        return res.status(400).json({ message: "Invalid credentials" });
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error("Session login error:", err);
          return res.status(500).json({ message: "Login error" });
        }
        console.log("User logged in successfully:", user);
        console.log("Session after login:", req.session);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("User info - Session ID:", req.sessionID);
    console.log("User info - isAuthenticated:", req.isAuthenticated());
    console.log("User info - user:", req.user);
    console.log("User info - session:", req.session);

    if (!req.isAuthenticated()) {
      console.log("User not authenticated");
      return res.sendStatus(401);
    }
    res.json(req.user);
  });

  // OAuth Routes

  // Google OAuth
  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] }),
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/auth?error=google_login_failed",
    }),
    (req, res) => {
      // Successful authentication, redirect to home page
      res.redirect("/");
    },
  );

  // Kakao OAuth
  app.get("/api/auth/kakao", passport.authenticate("kakao"));

  app.get(
    "/api/auth/kakao/callback",
    passport.authenticate("kakao", {
      failureRedirect: "/auth?error=kakao_login_failed",
    }),
    (req, res) => {
      // Successful authentication, redirect to home page
      res.redirect("/");
    },
  );
}
