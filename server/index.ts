import { config } from "dotenv";
config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupProductionVite } from "./production-vite";
import { setupAuth } from "./auth";
import path from "path";
import { setupWebSocket } from "./websocket";
import { seedDatabase } from "./seed-db";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { registerBusinessRoutes } from "./routes/business";
import { registerUserRoutes } from "./routes/user";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), "public")));

// 한글 파일명 처리를 위한 인코딩 설정
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// 정적 파일 제공 설정
app.use(express.static("public"));
app.use("/images", express.static("public/images"));

// Host bypass middleware - must come before Vite middleware
app.use((req, res, next) => {
  // Override host check for Replit environments
  if (req.headers.host && req.headers.host.includes('replit.dev')) {
    req.headers.host = 'localhost:5000';
  }
  next();
});

// CORS 설정
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Don't exit the process, just log the error
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // For uncaught exceptions, we should exit gracefully
  process.exit(1);
});

(async () => {
  try {
    // Seed database on startup (with better error handling)
    try {
      await seedDatabase();
      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Database seeding failed:", error);
      // Continue running even if seeding fails
    }

    // Setup authentication first
    setupAuth(app);

    // Setup business routes after auth
    registerBusinessRoutes(app);
    registerUserRoutes(app);

    // Then register other routes
    registerRoutes(app);

    // Setup WebSocket after server is created
    setupWebSocket(server);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('Error caught by middleware:', err);
      
      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    
    // Use production-optimized Vite server for deployment
    const isProduction = process.env.NODE_ENV === "production";
    
    if (isProduction) {
      await setupProductionVite(app, server);
    } else {
      await setupVite(app, server);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
