import { Express } from "express";
import { storage } from "../storage";

export function registerAdminRoutes(app: Express) {
  // 관리자 권한 확인 미들웨어
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    if (!req.user.isAdmin && req.user.role !== "admin") {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    next();
  };

  // 대시보드 통계 조회
  app.get("/api/admin/dashboard-stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 승인 대기 중인 기관 목록
  app.get("/api/admin/pending-businesses", requireAdmin, async (req, res) => {
    try {
      const pendingBusinesses = await storage.getPendingBusinesses();
      res.json(pendingBusinesses);
    } catch (error) {
      console.error("Error fetching pending businesses:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 승인 대기 중인 강의 목록
  app.get("/api/admin/pending-courses", requireAdmin, async (req, res) => {
    try {
      const pendingCourses = await storage.getPendingCourses();
      res.json(pendingCourses);
    } catch (error) {
      console.error("Error fetching pending courses:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 전체 사용자 목록
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
  });

  // 기관 승인/거부
  app.put("/api/admin/business-approval/:businessId", requireAdmin, async (req, res) => {
    try {
      const businessId = parseInt(req.params.businessId);
      const { action, reason } = req.body;

      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({ message: "유효하지 않은 액션입니다." });
      }

      const result = await storage.updateBusinessApproval(businessId, action, reason);
      res.json(result);
    } catch (error) {
      console.error("Error updating business approval:", error);
      res.status(500).json({ message: "기관 승인 처리 중 오류가 발생했습니다." });
    }
  });

  // 강의 승인/거부
  app.put("/api/admin/course-approval/:courseId", requireAdmin, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const { action, reason } = req.body;

      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({ message: "유효하지 않은 액션입니다." });
      }

      const result = await storage.updateCourseApproval(courseId, action, reason);
      res.json(result);
    } catch (error) {
      console.error("Error updating course approval:", error);
      res.status(500).json({ message: "강의 승인 처리 중 오류가 발생했습니다." });
    }
  });

  // 사용자 상태 업데이트 (활성화/비활성화)
  app.put("/api/admin/users/:userId/status", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { isActive } = req.body;

      const result = await storage.updateUser(userId, { isActive });
      res.json(result);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "사용자 상태 업데이트 중 오류가 발생했습니다." });
    }
  });

  // 사용자 역할 업데이트
  app.put("/api/admin/users/:userId/role", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { role, isAdmin } = req.body;

      const result = await storage.updateUser(userId, { role, isAdmin });
      res.json(result);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "사용자 역할 업데이트 중 오류가 발생했습니다." });
    }
  });

  // 사용자 삭제
  app.delete("/api/admin/users/:userId", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // 자기 자신은 삭제할 수 없음
      if (userId === req.user.id) {
        return res.status(400).json({ message: "자기 자신의 계정은 삭제할 수 없습니다." });
      }

      await storage.updateUser(userId, { isActive: false });
      res.json({ message: "사용자가 비활성화되었습니다." });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "사용자 삭제 중 오류가 발생했습니다." });
    }
  });
}