import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupWebSocket, sendAdminNotification } from "./websocket";
import { registerAdminRoutes } from "./routes/admin";
import { registerBusinessRoutes } from "./routes/business";
import {
  insertCourseSchema,
  insertInstructorSchema,
  insertEnrollmentSchema,
  insertSeminarSchema,
  insertNoticeSchema,
  insertReviewSchema,
  insertPaymentSchema,
  insertInquirySchema,
} from "@shared/schema";
import multer from "multer";
import path from "path";
import express from "express";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|ppt|pptx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Setup admin routes
  registerAdminRoutes(app);

  // Setup business routes
  registerBusinessRoutes(app);

  // Static file serving for uploads
  app.use("/uploads", express.static("uploads"));

  // Image upload endpoint
  app.post("/api/upload/image", upload.single("image"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ message: "Error uploading image" });
    }
  });

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const { category, type, level, search, page, limit, subcategory } =
        req.query;

      console.log("API /api/courses 요청 파라미터:");
      console.log("- category:", category);
      console.log("- type:", type);
      console.log("- level:", level);
      console.log("- search:", search);
      console.log("- subcategory:", subcategory);
      console.log("- page:", page);
      console.log("- limit:", limit);

      const result = await storage.getCourses({
        category: category as string,
        type: type as string,
        level: level as string,
        search: search as string,
        subcategory: subcategory as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      console.log("필터링 결과:", result.courses.length, "개 과정");
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
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const courseData = {
        ...req.body,
        providerId: req.user.id,
        enrolledCount: 0,
        isActive: false,
        approvalStatus: "pending",
      };

      const course = await storage.createCourse(courseData);

      // Send notification to admins about new course pending approval
      sendAdminNotification({
        type: "course_pending",
        title: "새로운 강의 승인 요청",
        message: `"${course.title}" 강의가 승인을 기다리고 있습니다.`,
        data: { courseId: course.id, courseName: course.title },
      });

      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Error creating course" });
    }
  });

  // Update course
  app.put("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const courseId = parseInt(req.params.id);

    // For admin users, allow editing any course
    if (req.user.isAdmin) {
      try {
        const updatedCourse = await storage.updateCourse(courseId, req.body);
        if (!updatedCourse) {
          return res.status(404).json({ message: "Course not found" });
        }
        res.json(updatedCourse);
        return;
      } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ message: "Error updating course" });
        return;
      }
    }

    // For non-admin users, check if they own the course
    const existingCourse = await storage.getCourse(courseId);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    const isOwner = existingCourse.providerId === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: "Access denied - not owner" });
    }

    try {
      const updatedCourse = await storage.updateCourse(courseId, req.body);
      if (!updatedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(updatedCourse);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Error updating course" });
    }
  });

  // Delete course
  app.delete("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const courseId = parseInt(req.params.id);

    // For admin users, allow deleting any course
    if (req.user.isAdmin) {
      try {
        await storage.deleteCourse(courseId);
        res.json({ message: "Course deleted successfully" });
        return;
      } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: "Error deleting course" });
        return;
      }
    }

    // For non-admin users, check if they own the course
    const existingCourse = await storage.getCourse(courseId);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    const isOwner = existingCourse.providerId === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: "Access denied - not owner" });
    }

    try {
      await storage.deleteCourse(courseId);
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
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

  app.get("/api/instructors/:id", async (req, res) => {
    try {
      const instructor = await storage.getInstructor(parseInt(req.params.id));
      if (!instructor) {
        return res.status(404).json({ message: "Instructor not found" });
      }
      res.json(instructor);
    } catch (error) {
      res.status(500).json({ message: "Error fetching instructor" });
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
        courseId ? parseInt(courseId as string) : undefined,
      );

      // 각 등록에 대해 강의 정보를 가져와서 type 필드 추가
      const enrichedEnrollments = await Promise.all(
        enrollments.map(async (enrollment) => {
          try {
            const course = await storage.getCourse(enrollment.courseId);
            return {
              ...enrollment,
              course: course
                ? {
                    ...course,
                    type: course.type, // type 필드를 직접 사용
                  }
                : null,
            };
          } catch (error) {
            console.error(
              `Error fetching course ${enrollment.courseId}:`,
              error,
            );
            return enrollment;
          }
        }),
      );

      res.json(enrichedEnrollments);
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
        userId: req.user.id,
        type: "course",
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

  app.get("/api/seminars/:id", async (req, res) => {
    try {
      const seminar = await storage.getSeminar(parseInt(req.params.id));
      if (!seminar) {
        return res.status(404).json({ message: "Seminar not found" });
      }
      res.json(seminar);
    } catch (error) {
      res.status(500).json({ message: "Error fetching seminar" });
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
      const seminarId = parseInt(req.params.id);
      const userId = req.user.id;

      // 세미나 존재 여부 확인
      const seminar = await storage.getSeminar(seminarId);
      if (!seminar) {
        return res.status(404).json({ error: "세미나를 찾을 수 없습니다." });
      }

      // 이미 신청했는지 확인
      const isAlreadyRegistered = await storage.isSeminarRegistered(
        userId,
        seminarId,
      );
      if (isAlreadyRegistered) {
        return res.status(400).json({ error: "이미 신청한 세미나입니다." });
      }

      // 정원 확인
      if (
        seminar.maxParticipants &&
        seminar.currentParticipants &&
        seminar.currentParticipants >= seminar.maxParticipants
      ) {
        return res.status(400).json({ error: "세미나 정원이 마감되었습니다." });
      }

      // 세미나 신청 등록
      await storage.registerForSeminar(userId, seminarId);

      // enrollments 테이블에도 등록 (세미나 타입 유지)
      const enrollment = await storage.createEnrollment({
        userId,
        courseId: seminarId,
        status: "enrolled",
        progress: 0,
        type: "seminar", // 타입을 'seminar'로 통일
        subtype: seminar.type, // 원래 타입을 subtype으로 저장
      });

      console.log(
        `User ${userId} successfully registered for seminar ${seminarId}`,
      );

      res.json({
        success: true,
        message: "세미나 신청이 완료되었습니다.",
        seminarId,
        userId,
      });
    } catch (error) {
      console.error("Seminar registration error:", error);
      res.status(500).json({ error: "세미나 신청 중 오류가 발생했습니다." });
    }
  });

  // Notice routes
  app.get("/api/notices", async (req, res) => {
    try {
      const { category, page, limit } = req.query;
      const result = await storage.getNotices(
        category as string,
        page ? parseInt(page as string) : undefined,
        limit ? parseInt(limit as string) : undefined,
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
        authorId: req.user.id,
      });
      const newNotice = await storage.createNotice(notice);
      res.status(201).json(newNotice);
    } catch (error) {
      res.status(400).json({ message: "Invalid notice data" });
    }
  });

  // Update notice
  app.put("/api/notices/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    console.log("Update notice - User:", req.user);
    console.log("Update notice - Is Admin:", req.user?.isAdmin);

    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const noticeId = parseInt(req.params.id);
      const updatedNotice = await storage.updateNotice(noticeId, req.body);
      if (!updatedNotice) {
        return res.status(404).json({ message: "Notice not found" });
      }
      res.json(updatedNotice);
    } catch (error) {
      console.error("Error updating notice:", error);
      res.status(500).json({ message: "Error updating notice" });
    }
  });

  // Delete notice
  app.delete("/api/notices/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const noticeId = parseInt(req.params.id);
      await storage.deleteNotice(noticeId);
      res.json({ message: "Notice deleted successfully" });
    } catch (error) {
      console.error("Error deleting notice:", error);
      res.status(500).json({ message: "Error deleting notice" });
    }
  });

  // Increment notice views
  app.post("/api/notices/:id/views", async (req, res) => {
    try {
      const noticeId = parseInt(req.params.id);
      await storage.incrementNoticeViews(noticeId);
      res.json({ message: "Views incremented successfully" });
    } catch (error) {
      console.error("Error incrementing views:", error);
      res.status(500).json({ message: "Error incrementing views" });
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
        courseId: parseInt(req.params.id),
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
        userId: req.user.id,
      });
      const newPayment = await storage.createPayment(payment);
      res.status(201).json(newPayment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  // File upload route
  app.post("/api/upload", upload.single("file"), (req, res) => {
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
      size: req.file.size,
    });
  });

  // Statistics route for admin dashboard
  app.get("/api/stats", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const [coursesResult, seminarsResult, paymentsResult] = await Promise.all(
        [storage.getCourses(), storage.getSeminars(), storage.getPayments()],
      );

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

  // Overseas Programs public routes
  app.get("/api/overseas-programs", async (req, res) => {
    try {
      const { search, category, country, level } = req.query;

      console.log("API /api/overseas-programs 요청 파라미터:");
      console.log("- search:", search);
      console.log("- category:", category);
      console.log("- country:", country);
      console.log("- level:", level);

      const allPrograms = await storage.getOverseasPrograms();

      // 필터링 적용
      let filteredPrograms = allPrograms.filter(
        (program) =>
          program.status === "active" &&
          program.approvalStatus === "approved" &&
          program.isActive,
      );

      // 검색 필터
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredPrograms = filteredPrograms.filter(
          (program) =>
            program.title.toLowerCase().includes(searchTerm) ||
            program.destination.toLowerCase().includes(searchTerm) ||
            (program.description &&
              program.description.toLowerCase().includes(searchTerm)),
        );
      }

      // 카테고리 필터
      if (category && category !== "all") {
        filteredPrograms = filteredPrograms.filter(
          (program) => program.type === category,
        );
      }

      // 국가/연수지 필터
      if (country && country !== "전체") {
        filteredPrograms = filteredPrograms.filter((program) =>
          program.destination.includes(country as string),
        );
      }

      // 기간 필터 (duration 기반)
      if (level && level !== "전체") {
        if (level === "단기") {
          filteredPrograms = filteredPrograms.filter((program) => {
            const match = program.duration?.match(/(\d+)/);
            const days = match ? parseInt(match[1]) : 0;
            return days >= 1 && days <= 5;
          });
        } else if (level === "중기") {
          filteredPrograms = filteredPrograms.filter((program) => {
            const match = program.duration?.match(/(\d+)/);
            const days = match ? parseInt(match[1]) : 0;
            return days >= 6 && days <= 10;
          });
        } else if (level === "장기") {
          filteredPrograms = filteredPrograms.filter((program) => {
            const match = program.duration?.match(/(\d+)/);
            const days = match ? parseInt(match[1]) : 0;
            return days >= 11;
          });
        }
      }

      console.log(
        "필터링 결과:",
        filteredPrograms.length,
        "개 해외연수 프로그램",
      );

      res.json({
        programs: filteredPrograms,
        total: filteredPrograms.length,
      });
    } catch (error) {
      console.error("Error fetching overseas programs:", error);
      res.status(500).json({ message: "Error fetching overseas programs" });
    }
  });

  app.get("/api/overseas-programs/:id", async (req, res) => {
    try {
      const program = await storage.getOverseasProgram(parseInt(req.params.id));
      if (!program) {
        return res.status(404).json({ message: "Overseas program not found" });
      }

      // Only return active and approved programs
      if (
        program.status !== "active" ||
        program.approvalStatus !== "approved" ||
        !program.isActive
      ) {
        return res.status(404).json({ message: "Overseas program not found" });
      }

      res.json(program);
    } catch (error) {
      console.error("Error fetching overseas program:", error);
      res.status(500).json({ message: "Error fetching overseas program" });
    }
  });

  // Overseas program registration
  app.post("/api/overseas-programs/:id/register", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const programId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if program exists and is active
      const program = await storage.getOverseasProgram(programId);
      if (
        !program ||
        program.status !== "active" ||
        program.approvalStatus !== "approved"
      ) {
        return res
          .status(404)
          .json({ message: "Program not found or not available" });
      }

      // Check if user is already registered
      const isRegistered = await storage.isOverseasRegistered(
        userId,
        programId,
      );
      if (isRegistered) {
        return res
          .status(400)
          .json({ error: "이미 신청한 해외연수 프로그램입니다." });
      }

      // Check if program is full
      if (
        program.maxParticipants &&
        program.currentParticipants &&
        program.currentParticipants >= program.maxParticipants
      ) {
        return res
          .status(400)
          .json({ error: "해외연수 프로그램 정원이 마감되었습니다." });
      }

      // Register user for the program
      await storage.registerForOverseasProgram(userId, programId);

      res.json({ message: "해외연수 프로그램 신청이 완료되었습니다." });
    } catch (error) {
      console.error("Error registering for overseas program:", error);
      res.status(500).json({ error: "신청 처리 중 오류가 발생했습니다." });
    }
  });

  // Course enrollment
  app.post("/api/courses/:id/enroll", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const courseId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if already enrolled
      const existingEnrollment = await storage.getEnrollments(userId, courseId);
      if (existingEnrollment.length > 0) {
        return res
          .status(400)
          .json({ message: "Already enrolled in this course" });
      }

      // Create enrollment
      const enrollment = await storage.createEnrollment({
        userId: req.user.id,
        courseId: courseId,
        status: "enrolled",
        progress: 0,
        type: "course",
      });

      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).json({ message: "Error enrolling in course" });
    }
  });

  // 세미나 등록 데이터 마이그레이션 (관리자 전용)
  app.post("/api/admin/migrate-seminar-registrations", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    try {
      await storage.migrateSeminarRegistrations();
      res.json({
        message: "세미나 등록 데이터 마이그레이션이 완료되었습니다.",
      });
    } catch (error) {
      console.error("Migration error:", error);
      res.status(500).json({ message: "마이그레이션 중 오류가 발생했습니다." });
    }
  });

  // Overseas registrations routes
  app.get("/api/overseas-registrations", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user.id;
      const registrations = await storage.getOverseasRegistrations(
        undefined,
        userId,
      );

      // 각 등록에 대한 해외연수 프로그램 정보 추가
      const enrichedRegistrations = await Promise.all(
        registrations.map(async (registration) => {
          const program = await storage.getOverseasProgram(
            registration.overseasId,
          );
          return {
            ...registration,
            overseas_program: program,
          };
        }),
      );

      res.json(enrichedRegistrations);
    } catch (error) {
      console.error("Error fetching overseas registrations:", error);
      res
        .status(500)
        .json({ message: "Error fetching overseas registrations" });
    }
  });

  // 진도율 업데이트 API
  app.put("/api/enrollments/:id/progress", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const enrollmentId = parseInt(req.params.id);
      const { progress } = req.body;

      // 진도율 유효성 검사
      if (typeof progress !== "number" || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "유효하지 않은 진도율입니다." });
      }

      // 등록 정보 확인
      const enrollment = await storage.getEnrollment(enrollmentId);
      if (!enrollment) {
        return res
          .status(404)
          .json({ message: "수강 정보를 찾을 수 없습니다." });
      }

      // 사용자 권한 확인
      if (enrollment.userId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "진도율을 업데이트할 권한이 없습니다." });
      }

      // 진도율 업데이트
      const updatedEnrollment = await storage.updateEnrollment(enrollmentId, {
        progress,
        // 100% 완료시 상태 업데이트
        status: progress >= 100 ? "completed" : enrollment.status,
        completedAt: progress >= 100 ? new Date() : enrollment.completedAt,
        type: enrollment.type,
      });

      res.json(updatedEnrollment);
    } catch (error) {
      console.error("Error updating enrollment progress:", error);
      res
        .status(500)
        .json({ message: "진도율 업데이트 중 오류가 발생했습니다." });
    }
  });

  // 수강 정보 조회 API
  app.get("/api/enrollments/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const enrollmentId = parseInt(req.params.id);
      const enrollment = await storage.getEnrollment(enrollmentId);

      if (!enrollment) {
        return res
          .status(404)
          .json({ message: "수강 정보를 찾을 수 없습니다." });
      }

      // 본인의 수강 정보만 조회 가능
      if (enrollment.userId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "수강 정보를 조회할 권한이 없습니다." });
      }

      res.json(enrollment);
    } catch (error) {
      console.error("Error fetching enrollment:", error);
      res
        .status(500)
        .json({ message: "수강 정보 조회 중 오류가 발생했습니다." });
    }
  });

  // Cart API routes
  // 장바구니 목록 조회
  app.get("/api/cart/items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const items = await storage.getCartItems(req.user.id);
      res.json({ items });
    } catch (error) {
      console.error("Error fetching cart items:", error);
      res
        .status(500)
        .json({ message: "장바구니 조회 중 오류가 발생했습니다." });
    }
  });

  // 장바구니에 추가
  app.post("/api/cart/items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const { courseId, type = "course" } = req.body;

      if (!courseId) {
        return res.status(400).json({ message: "과정 ID가 필요합니다." });
      }

      // 과정이 존재하는지 확인
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "과정을 찾을 수 없습니다." });
      }

      // 이미 장바구니에 있는지 확인
      const isAlreadyInCart = await storage.isInCart(req.user.id, courseId);
      if (isAlreadyInCart) {
        return res
          .status(400)
          .json({ message: "이미 장바구니에 있는 상품입니다." });
      }

      await storage.addToCart(req.user.id, courseId, type);
      res.json({ message: "장바구니에 추가되었습니다." });
    } catch (error) {
      console.error("Error adding to cart:", error);
      res
        .status(500)
        .json({ message: "장바구니 추가 중 오류가 발생했습니다." });
    }
  });

  // 장바구니에서 제거
  app.delete("/api/cart/items/:itemId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const itemId = parseInt(req.params.itemId);
      await storage.removeFromCart(req.user.id, itemId);
      res.json({ message: "장바구니에서 제거되었습니다." });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res
        .status(500)
        .json({ message: "장바구니 제거 중 오류가 발생했습니다." });
    }
  });

  // 장바구니 비우기
  app.delete("/api/cart/items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      await storage.clearCart(req.user.id);
      res.json({ message: "장바구니가 비워졌습니다." });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res
        .status(500)
        .json({ message: "장바구니 비우기 중 오류가 발생했습니다." });
    }
  });

  // 장바구니 상태 확인
  app.get("/api/cart/items/status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const { courseId } = req.query;
      if (!courseId) {
        return res.status(400).json({ message: "과정 ID가 필요합니다." });
      }

      const isInCart = await storage.isInCart(
        req.user.id,
        parseInt(courseId as string),
      );
      res.json({ isInCart });
    } catch (error) {
      console.error("Error checking cart status:", error);
      res
        .status(500)
        .json({ message: "장바구니 상태 확인 중 오류가 발생했습니다." });
    }
  });

  // Private Messages routes (쪽지 시스템)
  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { type = "received" } = req.query;
      const messages = await storage.getPrivateMessages(
        req.user.id,
        type as "received" | "sent",
      );
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  app.get("/api/messages/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getPrivateMessage(messageId, req.user.id);

      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // 받은 메시지이고 아직 읽지 않았다면 읽음 처리
      if (message.receiverId === req.user.id && !message.isRead) {
        await storage.markMessageAsRead(messageId, req.user.id);
      }

      res.json(message);
    } catch (error) {
      console.error("Error fetching message:", error);
      res.status(500).json({ message: "Error fetching message" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const messageData = {
        senderId: req.user.id,
        receiverId: parseInt(req.body.receiverId),
        subject: req.body.subject,
        content: req.body.content,
      };

      const message = await storage.createPrivateMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Error creating message" });
    }
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const messageId = parseInt(req.params.id);
      await storage.markMessageAsRead(messageId, req.user.id);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Error marking message as read" });
    }
  });

  app.delete("/api/messages/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const messageId = parseInt(req.params.id);
      const { type } = req.query; // 'sender' 또는 'receiver'

      await storage.deleteMessage(
        messageId,
        req.user.id,
        type as "sender" | "receiver",
      );
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Error deleting message" });
    }
  });

  app.get("/api/messages/unread/count", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const count = await storage.getUnreadMessageCount(req.user.id);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Error fetching unread count" });
    }
  });

  // User search for message recipients
  app.get("/api/users/search", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.json([]);
      }

      const allUsers = await storage.getAllUsers();
      const filteredUsers = allUsers
        .filter(
          (user) =>
            user.id !== req.user.id && // 자기 자신 제외
            (user.name.toLowerCase().includes(q.toLowerCase()) ||
              user.email.toLowerCase().includes(q.toLowerCase())),
        )
        .slice(0, 10) // 최대 10명
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          organizationName: user.organizationName,
        }));

      res.json(filteredUsers);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Error searching users" });
    }
  });

  // Inquiry routes (문의사항 관리)
  app.get("/api/inquiries", async (req, res) => {
    try {
      const userId = req.user?.id;
      const isAdmin = req.user?.role === "admin";
      const status = req.query.status as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // 관리자가 아닌 경우 본인 문의만 조회
      const queryUserId = isAdmin ? undefined : userId;

      const result = await storage.getInquiries(
        queryUserId,
        status,
        page,
        limit,
      );

      // 비밀글 필터링: 관리자가 아닌 경우 본인 문의가 아닌 비밀글은 제외
      if (!isAdmin) {
        result.inquiries = result.inquiries.filter(
          (inquiry) => !inquiry.isPrivate || inquiry.userId === userId,
        );
      }

      res.json(result);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Error fetching inquiries" });
    }
  });

  app.get("/api/inquiries/:id", async (req, res) => {
    try {
      const inquiry = await storage.getInquiry(parseInt(req.params.id));
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }

      const isAdmin = req.user?.role === "admin";
      const isOwner = inquiry.userId === req.user?.id;

      // 권한 확인: 본인 문의이거나 관리자인 경우만 조회 가능
      // 비밀글인 경우 추가 권한 체크
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (inquiry.isPrivate && !isAdmin && !isOwner) {
        return res.status(403).json({ message: "This is a private inquiry" });
      }

      res.json(inquiry);
    } catch (error) {
      console.error("Error fetching inquiry:", error);
      res.status(500).json({ message: "Error fetching inquiry" });
    }
  });

  app.post("/api/inquiries", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const inquiryData = insertInquirySchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const newInquiry = await storage.createInquiry(inquiryData);
      res.status(201).json(newInquiry);
    } catch (error) {
      console.error("Error creating inquiry:", error);
      res.status(400).json({ message: "Invalid inquiry data" });
    }
  });

  // 관리자 전용: 문의사항 답변
  app.put("/api/inquiries/:id/answer", async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const inquiryId = parseInt(req.params.id);
      const { answer } = req.body;

      if (!answer || answer.trim() === "") {
        return res.status(400).json({ message: "Answer is required" });
      }

      const updatedInquiry = await storage.answerInquiry(
        inquiryId,
        answer,
        req.user.id,
      );
      if (!updatedInquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }

      res.json(updatedInquiry);
    } catch (error) {
      console.error("Error answering inquiry:", error);
      res.status(500).json({ message: "Error answering inquiry" });
    }
  });

  // 관리자 전용: 문의사항 삭제
  app.delete("/api/inquiries/:id", async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const inquiryId = parseInt(req.params.id);
      await storage.deleteInquiry(inquiryId);
      res.json({ message: "Inquiry deleted successfully" });
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      res.status(500).json({ message: "Error deleting inquiry" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
