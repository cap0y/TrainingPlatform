import { Express } from "express";
import { storage } from "../storage";
import { insertCourseSchema } from "../../shared/schema.js";
import multer from "multer";
import path from "path";
import { nanoid } from "nanoid";

// Configure multer for business file uploads
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = nanoid() + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  }
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export function registerBusinessRoutes(app: Express) {
  // Image upload endpoint for courses
  app.post("/api/business/upload-course-image", upload.single('image'), (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      image: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  });

  // Learning materials upload endpoint
  app.post("/api/business/upload-learning-materials", upload.array('files', 4), (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    
    const files = (req.files as Express.Multer.File[]).map(file => ({
      id: nanoid(),
      name: file.originalname,
      filename: file.filename,
      url: `/uploads/${file.filename}`,
      size: file.size,
      type: file.mimetype
    }));
    
    res.json({
      success: true,
      files: files
    });
  });

  // Sample images endpoint
  app.get("/api/business/sample-images", (req, res) => {
    const sampleImages = [
      {
        id: 1,
        url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop",
        title: "교육 강의실"
      },
      {
        id: 2,
        url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop",
        title: "온라인 학습"
      },
      {
        id: 3,
        url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=450&fit=crop",
        title: "교육 자료"
      },
      {
        id: 4,
        url: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&h=450&fit=crop",
        title: "세미나실"
      }
    ];
    
    res.json({
      success: true,
      images: sampleImages
    });
  });
  // 기관의 강의 목록 조회
  app.get("/api/business/courses/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user || user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "기관 회원만 접근 가능합니다." });
      }

      const courses = await storage.getCoursesByProvider(userId);
      res.json({ courses });
    } catch (error) {
      console.error("Error fetching business courses:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 기관의 새 강의 등록
  app.post("/api/business/courses", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const user = req.user;
      if (user.userType !== "business" || !user.isApproved) {
        return res
          .status(403)
          .json({ message: "승인된 기관 회원만 강의를 등록할 수 있습니다." });
      }

      const courseData = {
        ...req.body,
        // 숫자 필드들을 올바르게 변환
        credit: req.body.credit ? parseInt(req.body.credit) : 1,
        price: req.body.price ? parseInt(req.body.price) : 0,
        discountPrice: req.body.discountPrice
          ? parseInt(req.body.discountPrice)
          : null,
        maxStudents: req.body.maxStudents
          ? parseInt(req.body.maxStudents)
          : null,
        providerId: user.id,
        status: "pending",
        approvalStatus: "pending",
      };

      const result = insertCourseSchema.safeParse(courseData);
      if (!result.success) {
        return res
          .status(400)
          .json({
            message: "입력 데이터가 올바르지 않습니다.",
            errors: result.error.errors,
          });
      }

      const course = await storage.createCourse(result.data);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "강의 등록 중 오류가 발생했습니다." });
    }
  });

  // 기관의 강의 수정
  app.put("/api/business/courses/:courseId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const courseId = parseInt(req.params.courseId);
      const user = req.user;

      if (user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "기관 회원만 접근 가능합니다." });
      }

      const existingCourse = await storage.getCourse(courseId);
      if (!existingCourse || existingCourse.providerId !== user.id) {
        return res
          .status(404)
          .json({ message: "강의를 찾을 수 없거나 수정 권한이 없습니다." });
      }

      // 문자열 필드들을 숫자로 변환
      const updateData = {
        ...req.body,
        credit: req.body.credit
          ? parseInt(req.body.credit)
          : existingCourse.credit,
        price: req.body.price ? parseInt(req.body.price) : existingCourse.price,
        discountPrice: req.body.discountPrice
          ? parseInt(req.body.discountPrice)
          : existingCourse.discountPrice,
        maxStudents: req.body.maxStudents
          ? parseInt(req.body.maxStudents)
          : existingCourse.maxStudents,
      };

      const course = await storage.updateCourse(courseId, updateData);
      res.json(course);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "강의 수정 중 오류가 발생했습니다." });
    }
  });

  // 기관의 강의 삭제
  app.delete("/api/business/courses/:courseId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const courseId = parseInt(req.params.courseId);
      const user = req.user;

      if (user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "기관 회원만 접근 가능합니다." });
      }

      const existingCourse = await storage.getCourse(courseId);
      if (!existingCourse || existingCourse.providerId !== user.id) {
        return res
          .status(404)
          .json({ message: "강의를 찾을 수 없거나 삭제 권한이 없습니다." });
      }

      await storage.deleteCourse(courseId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "강의 삭제 중 오류가 발생했습니다." });
    }
  });

  // 기관의 수강생 통계
  app.get("/api/business/enrollment-stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user || user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "기관 회원만 접근 가능합니다." });
      }

      // 임시 통계 데이터 (실제로는 enrollments 테이블에서 조회)
      const stats = {
        total: 0,
        thisMonth: 0,
        lastMonth: 0,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching enrollment stats:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 기관의 매출 통계
  app.get("/api/business/revenue-stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);

      if (!user || user.userType !== "business") {
        return res
          .status(403)
          .json({ message: "기관 회원만 접근 가능합니다." });
      }

      // 임시 통계 데이터 (실제로는 payments 테이블에서 조회)
      const stats = {
        monthly: 0,
        yearly: 0,
        total: 0,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });
}
