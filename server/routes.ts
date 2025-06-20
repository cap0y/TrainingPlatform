import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupWebSocket } from "./websocket";
import { insertCourseSchema, insertInstructorSchema, insertEnrollmentSchema, insertSeminarSchema, insertNoticeSchema, insertReviewSchema, insertPaymentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|ppt|pptx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const { category, type, level, search, page, limit } = req.query;
      const result = await storage.getCourses({
        category: category as string,
        type: type as string,
        level: level as string,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error fetching courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(parseInt(req.params.id));
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Error fetching course" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const course = insertCourseSchema.parse(req.body);
      const newCourse = await storage.createCourse(course);
      res.status(201).json(newCourse);
    } catch (error) {
      res.status(400).json({ message: "Invalid course data" });
    }
  });

  app.put("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const updatedCourse = await storage.updateCourse(parseInt(req.params.id), req.body);
      if (!updatedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ message: "Error updating course" });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      await storage.deleteCourse(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting course" });
    }
  });

  // Instructor routes
  app.get("/api/instructors", async (req, res) => {
    try {
      const instructors = await storage.getInstructors();
      res.json(instructors);
    } catch (error) {
      res.status(500).json({ message: "Error fetching instructors" });
    }
  });

  app.post("/api/instructors", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const instructor = insertInstructorSchema.parse(req.body);
      const newInstructor = await storage.createInstructor(instructor);
      res.status(201).json(newInstructor);
    } catch (error) {
      res.status(400).json({ message: "Invalid instructor data" });
    }
  });

  // Enrollment routes
  app.get("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const { courseId } = req.query;
      const enrollments = await storage.getEnrollments(
        req.user.id,
        courseId ? parseInt(courseId as string) : undefined
      );
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching enrollments" });
    }
  });

  app.post("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const enrollment = insertEnrollmentSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const newEnrollment = await storage.createEnrollment(enrollment);
      res.status(201).json(newEnrollment);
    } catch (error) {
      res.status(400).json({ message: "Invalid enrollment data" });
    }
  });

  // Seminar routes
  app.get("/api/seminars", async (req, res) => {
    try {
      const seminars = await storage.getSeminars();
      res.json(seminars);
    } catch (error) {
      res.status(500).json({ message: "Error fetching seminars" });
    }
  });

  app.post("/api/seminars", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const seminar = insertSeminarSchema.parse(req.body);
      const newSeminar = await storage.createSeminar(seminar);
      res.status(201).json(newSeminar);
    } catch (error) {
      res.status(400).json({ message: "Invalid seminar data" });
    }
  });

  app.post("/api/seminars/:id/register", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      await storage.registerForSeminar(req.user.id, parseInt(req.params.id));
      res.status(201).json({ message: "Successfully registered for seminar" });
    } catch (error) {
      res.status(500).json({ message: "Error registering for seminar" });
    }
  });

  // Notice routes
  app.get("/api/notices", async (req, res) => {
    try {
      const { category, page, limit } = req.query;
      const result = await storage.getNotices(
        category as string,
        page ? parseInt(page as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notices" });
    }
  });

  app.get("/api/notices/:id", async (req, res) => {
    try {
      const notice = await storage.getNotice(parseInt(req.params.id));
      if (!notice) {
        return res.status(404).json({ message: "Notice not found" });
      }
      res.json(notice);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notice" });
    }
  });

  app.post("/api/notices", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const notice = insertNoticeSchema.parse({
        ...req.body,
        authorId: req.user.id
      });
      const newNotice = await storage.createNotice(notice);
      res.status(201).json(newNotice);
    } catch (error) {
      res.status(400).json({ message: "Invalid notice data" });
    }
  });

  // Review routes
  app.get("/api/courses/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviews(parseInt(req.params.id));
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reviews" });
    }
  });

  app.post("/api/courses/:id/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const review = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id,
        courseId: parseInt(req.params.id)
      });
      const newReview = await storage.createReview(review);
      res.status(201).json(newReview);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const payments = await storage.getPayments(req.user.id);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const payment = insertPaymentSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const newPayment = await storage.createPayment(payment);
      res.status(201).json(newPayment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  // File upload route
  app.post("/api/upload", upload.single('file'), (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    res.json({
      message: "File uploaded successfully",
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  });

  // Statistics route for admin dashboard
  app.get("/api/stats", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    try {
      const [coursesResult, seminarsResult, paymentsResult] = await Promise.all([
        storage.getCourses(),
        storage.getSeminars(),
        storage.getPayments()
      ]);
      
      res.json({
        totalCourses: coursesResult.total,
        totalSeminars: seminarsResult.length,
        totalPayments: paymentsResult.length,
        // Add more statistics as needed
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching statistics" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket
  setupWebSocket(httpServer);

  return httpServer;
}
