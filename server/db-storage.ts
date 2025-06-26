import { db } from "./db";
import {
  users,
  courses,
  instructors,
  enrollments,
  seminars,
  notices,
  reviews,
  chatMessages,
  payments,
  seminarRegistrations,
  seminarWishlist,
  overseasPrograms,
  overseasRegistrations,
  certificates,
  cart,
  privateMessages,
  inquiries,
} from "@shared/schema";
import { eq, like, desc, and, sql, or, count, gte, lte } from "drizzle-orm";
import type {
  User,
  InsertUser,
  Course,
  InsertCourse,
  Instructor,
  InsertInstructor,
  Enrollment,
  InsertEnrollment,
  Seminar,
  InsertSeminar,
  Notice,
  InsertNotice,
  Review,
  InsertReview,
  ChatMessage,
  InsertChatMessage,
  Payment,
  InsertPayment,
  SeminarRegistration,
  SeminarWishlist,
  OverseasProgram,
  InsertOverseasProgram,
  OverseasRegistration,
  InsertOverseasRegistration,
  Certificate,
  InsertCertificate,
  Cart,
  InsertCart,
  PrivateMessage,
  InsertPrivateMessage,
  Inquiry,
  InsertInquiry,
} from "@shared/schema";
import type { IStorage } from "./storage";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class DbStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Neon DB 호환성을 위해 메모리 기반 세션 스토어 사용
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error("Error fetching user by username:", error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error("Error fetching user by email:", error);
      throw error;
    }
  }

  async getUserByBusinessNumber(
    businessNumber: string,
  ): Promise<User | undefined> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.businessNumber, businessNumber))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error("Error fetching user by business number:", error);
      throw error;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async updateUser(
    id: number,
    userData: Partial<InsertUser>,
  ): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: number): Promise<void> {
    try {
      // 트랜잭션으로 모든 관련 데이터를 삭제
      await db.transaction(async (tx) => {
        // 1. 장바구니 아이템 삭제
        await tx.delete(cart).where(eq(cart.userId, id));

        // 2. 개인 메시지 삭제 (보낸 메시지와 받은 메시지)
        await tx
          .delete(privateMessages)
          .where(eq(privateMessages.senderId, id));
        await tx
          .delete(privateMessages)
          .where(eq(privateMessages.receiverId, id));

        // 3. 결제 정보 삭제
        await tx.delete(payments).where(eq(payments.userId, id));

        // 4. 수강 신청 삭제
        await tx.delete(enrollments).where(eq(enrollments.userId, id));

        // 5. 세미나 등록 삭제
        await tx
          .delete(seminarRegistrations)
          .where(eq(seminarRegistrations.userId, id));

        // 6. 해외연수 등록 삭제
        await tx
          .delete(overseasRegistrations)
          .where(eq(overseasRegistrations.userId, id));

        // 7. 세미나 위시리스트 삭제
        await tx.delete(seminarWishlist).where(eq(seminarWishlist.userId, id));

        // 8. 리뷰 삭제
        await tx.delete(reviews).where(eq(reviews.userId, id));

        // 9. 채팅 메시지 삭제
        await tx.delete(chatMessages).where(eq(chatMessages.userId, id));

        // 10. 수료증 삭제
        await tx.delete(certificates).where(eq(certificates.userId, id));

        // 11. 기관 사용자인 경우 제공한 강의들도 비활성화
        const user = await tx
          .select()
          .from(users)
          .where(eq(users.id, id))
          .limit(1);
        if (user[0]?.userType === "business") {
          await tx
            .update(courses)
            .set({ isActive: false })
            .where(eq(courses.providerId, id));
          await tx
            .update(seminars)
            .set({ isActive: false })
            .where(eq(seminars.providerId, id));
          await tx
            .update(overseasPrograms)
            .set({ isActive: false })
            .where(eq(overseasPrograms.providerId, id));
        }

        // 12. 마지막으로 사용자 삭제
        await tx.delete(users).where(eq(users.id, id));
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("사용자 삭제 중 오류가 발생했습니다.");
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  }

  async getPendingBusinesses(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.userType, "business"),
          eq(users.isApproved, false),
          eq(users.isActive, true),
        ),
      );
  }

  async updateBusinessApproval(
    businessId: number,
    action: string,
    reason?: string,
  ): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({
        isApproved: action === "approve",
        role: action === "approve" ? "business" : "user",
      })
      .where(eq(users.id, businessId))
      .returning();
    return result[0];
  }

  async getCourses(filters?: {
    category?: string;
    type?: string;
    level?: string;
    search?: string;
    subcategory?: string;
    page?: number;
    limit?: number;
  }): Promise<{ courses: Course[]; total: number }> {
    console.log("getCourses 함수 호출됨", filters);

    const conditions = [eq(courses.isActive, true)];

    if (filters?.category && filters.category !== "all") {
      conditions.push(eq(courses.category, filters.category));
    }

    if (filters?.subcategory && filters.subcategory !== "all") {
      conditions.push(eq(courses.subcategory, filters.subcategory));
    }

    if (filters?.type && filters.type !== "all") {
      conditions.push(eq(courses.type, filters.type));
    }

    if (filters?.level && filters.level !== "all") {
      conditions.push(eq(courses.level, filters.level));
    }

    if (filters?.search) {
      conditions.push(like(courses.title, `%${filters.search}%`));
    }

    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count - Neon DB 호환 방식으로 수정
    const totalResult = await db.select().from(courses).where(whereClause);
    const total = totalResult.length;

    // Get paginated results
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    const coursesResult = await db
      .select()
      .from(courses)
      .where(whereClause)
      .orderBy(desc(courses.createdAt))
      .limit(limit)
      .offset(offset);

    return { courses: coursesResult, total };
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);
    return result[0];
  }

  async createCourse(courseData: InsertCourse): Promise<Course> {
    console.log("=== DB createCourse 호출 ===");
    console.log(
      "courseData.curriculumItems:",
      JSON.stringify(courseData.curriculumItems, null, 2),
    );
    const result = await db.insert(courses).values(courseData).returning();
    console.log("✅ Course created with ID:", result[0].id);
    return result[0];
  }

  async updateCourse(
    id: number,
    courseData: Partial<InsertCourse>,
  ): Promise<Course | undefined> {
    console.log("=== updateCourse 호출 ===");
    console.log("Course ID:", id);
    console.log("Raw courseData:", JSON.stringify(courseData, null, 2));
    console.log(
      "courseData.curriculumItems:",
      JSON.stringify(courseData.curriculumItems, null, 2),
    );

    // undefined나 null 값을 제거하고, 날짜 필드를 확인
    const cleanData: any = {};
    for (const [key, value] of Object.entries(courseData)) {
      if (value !== undefined && value !== null && value !== "") {
        cleanData[key] = value;

        // 날짜 필드인 경우 타입 확인
        if (
          [
            "startDate",
            "endDate",
            "enrollmentDeadline",
            "completionDeadline",
            "createdAt",
            "updatedAt",
          ].includes(key)
        ) {
          console.log(`날짜 필드 ${key}:`, {
            value,
            type: typeof value,
            isDate: value instanceof Date,
            toString: value?.toString?.(),
          });
        }
      }
    }

    console.log("Clean courseData:", JSON.stringify(cleanData, null, 2));

    const result = await db
      .update(courses)
      .set(cleanData)
      .where(eq(courses.id, id))
      .returning();
    return result[0];
  }

  async deleteCourse(id: number): Promise<void> {
    await db.update(courses).set({ isActive: false }).where(eq(courses.id, id));
  }

  async getCoursesByProvider(providerId: number): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(
        and(eq(courses.providerId, providerId), eq(courses.isActive, true)),
      )
      .orderBy(desc(courses.createdAt));
  }

  async getPendingCourses(): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(
        and(eq(courses.approvalStatus, "pending"), eq(courses.isActive, true)),
      );
  }

  async updateCourseApproval(
    courseId: number,
    action: string,
    reason?: string,
  ): Promise<Course | undefined> {
    const result = await db
      .update(courses)
      .set({
        approvalStatus: action === "approve" ? "approved" : "rejected",
        status: action === "approve" ? "active" : "inactive",
      })
      .where(eq(courses.id, courseId))
      .returning();
    return result[0];
  }

  async getInstructors(): Promise<Instructor[]> {
    return await db
      .select()
      .from(instructors)
      .where(eq(instructors.isActive, true));
  }

  async getInstructor(id: number): Promise<Instructor | undefined> {
    const result = await db
      .select()
      .from(instructors)
      .where(eq(instructors.id, id))
      .limit(1);
    return result[0];
  }

  async createInstructor(
    instructorData: InsertInstructor,
  ): Promise<Instructor> {
    const result = await db
      .insert(instructors)
      .values(instructorData)
      .returning();
    return result[0];
  }

  async updateInstructor(
    id: number,
    instructorData: Partial<InsertInstructor>,
  ): Promise<Instructor | undefined> {
    const result = await db
      .update(instructors)
      .set(instructorData)
      .where(eq(instructors.id, id))
      .returning();
    return result[0];
  }

  async getEnrollments(
    userId?: number,
    courseId?: number,
  ): Promise<Enrollment[]> {
    const conditions = [];
    if (userId) conditions.push(eq(enrollments.userId, userId));
    if (courseId) conditions.push(eq(enrollments.courseId, courseId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    return await db.select().from(enrollments).where(whereClause);
  }

  async createEnrollment(
    enrollmentData: InsertEnrollment,
  ): Promise<Enrollment> {
    const result = await db
      .insert(enrollments)
      .values(enrollmentData)
      .returning();
    return result[0];
  }

  async updateEnrollment(
    id: number,
    enrollmentData: Partial<InsertEnrollment>,
  ): Promise<Enrollment | undefined> {
    const result = await db
      .update(enrollments)
      .set(enrollmentData)
      .where(eq(enrollments.id, id))
      .returning();
    return result[0];
  }

  async getSeminars(): Promise<Seminar[]> {
    return await db
      .select()
      .from(seminars)
      .where(eq(seminars.isActive, true))
      .orderBy(desc(seminars.date));
  }

  async getSeminar(id: number): Promise<Seminar | undefined> {
    const result = await db
      .select()
      .from(seminars)
      .where(eq(seminars.id, id))
      .limit(1);
    return result[0];
  }

  async createSeminar(seminarData: InsertSeminar): Promise<Seminar> {
    const result = await db.insert(seminars).values(seminarData).returning();
    return result[0];
  }

  async updateSeminar(
    id: number,
    seminarData: Partial<InsertSeminar>,
  ): Promise<Seminar | undefined> {
    console.log("=== updateSeminar 호출 ===");
    console.log("Seminar ID:", id);
    console.log("Update data:", JSON.stringify(seminarData, null, 2));

    const result = await db
      .update(seminars)
      .set(seminarData)
      .where(eq(seminars.id, id))
      .returning();
    return result[0];
  }

  async registerForSeminar(userId: number, seminarId: number): Promise<void> {
    await db.insert(seminarRegistrations).values({
      userId,
      seminarId,
      status: "registered",
    });

    // 세미나 참가자 수 업데이트
    await this.updateSeminarParticipantCount(seminarId);
  }

  async getSeminarRegistrations(
    seminarId?: number,
    userId?: number,
  ): Promise<SeminarRegistration[]> {
    let whereConditions = [];

    if (seminarId) {
      whereConditions.push(eq(seminarRegistrations.seminarId, seminarId));
    }
    if (userId) {
      whereConditions.push(eq(seminarRegistrations.userId, userId));
    }

    const whereClause =
      whereConditions.length > 0
        ? whereConditions.length === 1
          ? whereConditions[0]
          : and(...whereConditions)
        : undefined;

    return await db
      .select()
      .from(seminarRegistrations)
      .where(whereClause)
      .orderBy(desc(seminarRegistrations.registeredAt));
  }

  async isSeminarRegistered(
    userId: number,
    seminarId: number,
  ): Promise<boolean> {
    const result = await db
      .select()
      .from(seminarRegistrations)
      .where(
        and(
          eq(seminarRegistrations.userId, userId),
          eq(seminarRegistrations.seminarId, seminarId),
        ),
      )
      .limit(1);

    return result.length > 0;
  }

  async updateSeminarParticipantCount(seminarId: number): Promise<void> {
    // 해당 세미나의 등록된 참가자 수 계산
    const registrations = await db
      .select()
      .from(seminarRegistrations)
      .where(eq(seminarRegistrations.seminarId, seminarId));

    const participantCount = registrations.length;

    // 세미나 테이블의 currentParticipants 업데이트
    await db
      .update(seminars)
      .set({ currentParticipants: participantCount })
      .where(eq(seminars.id, seminarId));
  }

  async getNotices(
    category?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ notices: Notice[]; total: number }> {
    const offset = (page - 1) * limit;

    // views 컬럼 없이 조회하는 기본 쿼리
    let baseConditions = [eq(notices.isActive, true)];
    if (category && category !== "all") {
      baseConditions.push(eq(notices.category, category));
    }
    const whereClause =
      baseConditions.length > 1 ? and(...baseConditions) : baseConditions[0];

    try {
      const [noticesResult, totalCountResult] = await Promise.all([
        db
          .select({
            id: notices.id,
            title: notices.title,
            content: notices.content,
            category: notices.category,
            authorId: notices.authorId,
            isImportant: notices.isImportant,
            isActive: notices.isActive,
            createdAt: notices.createdAt,
            updatedAt: notices.updatedAt,
          })
          .from(notices)
          .where(whereClause)
          .orderBy(desc(notices.createdAt))
          .limit(limit)
          .offset(offset),
        // Neon DB 호환 방식으로 count 구하기
        db.select().from(notices).where(whereClause),
      ]);

      // views 컬럼이 없으므로 기본값 0으로 설정
      const noticesWithViews = noticesResult.map((notice) => ({
        ...notice,
        views: 0,
      }));

      return {
        notices: noticesWithViews,
        total: totalCountResult.length,
      };
    } catch (error) {
      console.error("Error fetching notices:", error);
      // 완전히 실패한 경우 빈 결과 반환
      return {
        notices: [],
        total: 0,
      };
    }
  }

  async getNotice(id: number): Promise<Notice | undefined> {
    const result = await db
      .select()
      .from(notices)
      .where(eq(notices.id, id))
      .limit(1);
    return result[0];
  }

  async createNotice(noticeData: InsertNotice): Promise<Notice> {
    const result = await db.insert(notices).values(noticeData).returning();
    return result[0];
  }

  async updateNotice(
    id: number,
    noticeData: Partial<InsertNotice>,
  ): Promise<Notice | undefined> {
    const result = await db
      .update(notices)
      .set(noticeData)
      .where(eq(notices.id, id))
      .returning();
    return result[0];
  }

  async deleteNotice(id: number): Promise<void> {
    await db.update(notices).set({ isActive: false }).where(eq(notices.id, id));
  }

  async incrementNoticeViews(id: number): Promise<void> {
    try {
      // Neon DB에서는 raw SQL 대신 별도의 select와 update를 사용
      const currentNotice = await db
        .select()
        .from(notices)
        .where(eq(notices.id, id))
        .limit(1);
      if (currentNotice[0]) {
        const currentViews = currentNotice[0].views || 0;
        await db
          .update(notices)
          .set({
            views: currentViews + 1,
            updatedAt: new Date(),
          })
          .where(eq(notices.id, id));
      }
    } catch (error) {
      // views 컬럼이 없는 경우 무시하고 updatedAt만 업데이트
      console.log("Views column not found, skipping view increment");
      try {
        await db
          .update(notices)
          .set({ updatedAt: new Date() })
          .where(eq(notices.id, id));
      } catch (updateError) {
        console.error("Error updating notice:", updateError);
      }
    }
  }

  async getReviews(courseId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.courseId, courseId), eq(reviews.isActive, true)));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(reviewData).returning();
    return result[0];
  }

  async getChatMessages(limit?: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit || 50);
  }

  async createChatMessage(
    messageData: InsertChatMessage,
  ): Promise<ChatMessage> {
    const result = await db
      .insert(chatMessages)
      .values(messageData)
      .returning();
    return result[0];
  }

  async getPayments(userId?: number): Promise<any[]> {
    const whereClause = userId ? eq(payments.userId, userId) : undefined;
    return await db
      .select({
        id: payments.id,
        userId: payments.userId,
        courseId: payments.courseId,
        amount: payments.amount,
        status: payments.status,
        paymentMethod: payments.paymentMethod,
        transactionId: payments.transactionId,
        createdAt: payments.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          username: users.username,
        },
        course: {
          id: courses.id,
          title: courses.title,
          category: courses.category,
          price: courses.price,
        },
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .leftJoin(courses, eq(payments.courseId, courses.id))
      .where(whereClause)
      .orderBy(desc(payments.createdAt));
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const result = await db.insert(payments).values(paymentData).returning();
    return result[0];
  }

  async updatePayment(
    id: number,
    paymentData: Partial<InsertPayment>,
  ): Promise<Payment | undefined> {
    const result = await db
      .update(payments)
      .set(paymentData)
      .where(eq(payments.id, id))
      .returning();
    return result[0];
  }

  async getDashboardStats(): Promise<any> {
    // Neon DB 호환 방식으로 count 구하기 - 개별 쿼리로 분리
    const allUsers = await db
      .select()
      .from(users)
      .where(eq(users.isActive, true));
    const businessUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.userType, "business"),
          eq(users.isApproved, true),
          eq(users.isActive, true),
        ),
      );
    const allCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.isActive, true));
    const pendingCoursesList = await db
      .select()
      .from(courses)
      .where(eq(courses.approvalStatus, "pending"));
    const allEnrollments = await db.select().from(enrollments);
    const pendingBusinessesList = await db
      .select()
      .from(users)
      .where(and(eq(users.userType, "business"), eq(users.isApproved, false)));

    // 월 매출 계산 (이번 달)
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const lastDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    );

    const monthlyPayments = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.status, "completed"),
          gte(payments.createdAt, firstDayOfMonth),
          lte(payments.createdAt, lastDayOfMonth),
        ),
      );

    const monthlyRevenue = monthlyPayments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount);
    }, 0);

    return {
      totalUsers: allUsers.length,
      businessUsers: businessUsers.length,
      pendingBusinesses: pendingBusinessesList.length,
      totalCourses: allCourses.length,
      pendingCourses: pendingCoursesList.length,
      monthlyRevenue: monthlyRevenue,
    };
  }

  async getAnalyticsStats(): Promise<any> {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const last6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      const lastYear = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate(),
      );

      // 1. 사용자 증가율 데이터 (최근 6개월)
      const monthlyUserGrowth = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const usersThisMonth = await db
          .select()
          .from(users)
          .where(
            and(
              gte(users.createdAt, monthStart),
              lte(users.createdAt, monthEnd),
              eq(users.isActive, true),
            ),
          );

        monthlyUserGrowth.push({
          month: monthStart.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "short",
          }),
          users: usersThisMonth.length,
          individual: usersThisMonth.filter((u) => u.userType === "individual")
            .length,
          business: usersThisMonth.filter((u) => u.userType === "business")
            .length,
        });
      }

      // 2. 매출 분석 (최근 6개월)
      const monthlyRevenue = [];
      let totalRevenue = 0;
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const paymentsThisMonth = await db
          .select()
          .from(payments)
          .where(
            and(
              eq(payments.status, "completed"),
              gte(payments.createdAt, monthStart),
              lte(payments.createdAt, monthEnd),
            ),
          );

        const monthRevenue = paymentsThisMonth.reduce((sum, payment) => {
          return sum + parseFloat(payment.amount);
        }, 0);

        totalRevenue += monthRevenue;

        monthlyRevenue.push({
          month: monthStart.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "short",
          }),
          revenue: monthRevenue,
          transactions: paymentsThisMonth.length,
        });
      }

      // 3. 강의 성과 분석
      const allCourses = await db
        .select()
        .from(courses)
        .where(eq(courses.isActive, true));
      const allEnrollments = await db.select().from(enrollments);

      // 카테고리별 강의 수
      const coursesByCategory: Record<string, number> = {};
      allCourses.forEach((course) => {
        if (course.category) {
          coursesByCategory[course.category] =
            (coursesByCategory[course.category] || 0) + 1;
        }
      });

      // 인기 강의 TOP 10
      const courseEnrollmentCount: Record<number, number> = {};
      allEnrollments.forEach((enrollment) => {
        courseEnrollmentCount[enrollment.courseId] =
          (courseEnrollmentCount[enrollment.courseId] || 0) + 1;
      });

      const topCourses = await Promise.all(
        Object.entries(courseEnrollmentCount)
          .sort(([, a], [, b]) => Number(b) - Number(a))
          .slice(0, 10)
          .map(async ([courseId, enrollmentCount]) => {
            const course = await db
              .select()
              .from(courses)
              .where(eq(courses.id, parseInt(courseId)))
              .limit(1);
            return {
              id: parseInt(courseId),
              title: course[0]?.title || "알 수 없는 강의",
              category: course[0]?.category || "기타",
              enrollments: Number(enrollmentCount),
              price: course[0]?.price || 0,
            };
          }),
      );

      // 4. 사용자 활동 통계
      const thisMonthUsers = await db
        .select()
        .from(users)
        .where(
          and(gte(users.createdAt, currentMonth), eq(users.isActive, true)),
        );

      const lastMonthUsers = await db
        .select()
        .from(users)
        .where(
          and(
            gte(users.createdAt, lastMonth),
            lte(users.createdAt, currentMonth),
            eq(users.isActive, true),
          ),
        );

      const userGrowthRate =
        lastMonthUsers.length > 0
          ? ((thisMonthUsers.length - lastMonthUsers.length) /
              lastMonthUsers.length) *
            100
          : 0;

      // 5. 매출 성장률
      const thisMonthPayments = await db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.status, "completed"),
            gte(payments.createdAt, currentMonth),
          ),
        );

      const lastMonthPayments = await db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.status, "completed"),
            gte(payments.createdAt, lastMonth),
            lte(payments.createdAt, currentMonth),
          ),
        );

      const thisMonthRevenue = thisMonthPayments.reduce(
        (sum, p) => sum + parseFloat(p.amount),
        0,
      );
      const lastMonthRevenue = lastMonthPayments.reduce(
        (sum, p) => sum + parseFloat(p.amount),
        0,
      );

      const revenueGrowthRate =
        lastMonthRevenue > 0
          ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

      // 6. 전체 통계 요약
      const totalUsers = await db
        .select()
        .from(users)
        .where(eq(users.isActive, true));
      const totalBusinessUsers = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.userType, "business"),
            eq(users.isApproved, true),
            eq(users.isActive, true),
          ),
        );

      return {
        // 성장률 지표
        userGrowthRate: Math.round(userGrowthRate * 100) / 100,
        revenueGrowthRate: Math.round(revenueGrowthRate * 100) / 100,

        // 월별 데이터
        monthlyUserGrowth,
        monthlyRevenue,

        // 강의 성과
        coursesByCategory: Object.entries(coursesByCategory).map(
          ([category, count]) => ({
            category,
            count,
          }),
        ),
        topCourses,

        // 전체 통계
        totalStats: {
          totalUsers: totalUsers.length,
          businessUsers: totalBusinessUsers.length,
          individualUsers: totalUsers.filter((u) => u.userType === "individual")
            .length,
          totalCourses: allCourses.length,
          totalEnrollments: allEnrollments.length,
          totalRevenue: Math.round(totalRevenue),
          averageRevenuePerUser:
            totalUsers.length > 0
              ? Math.round(totalRevenue / totalUsers.length)
              : 0,
        },
      };
    } catch (error) {
      console.error("Error fetching analytics stats:", error);
      throw error;
    }
  }

  async addSeminarToWishlist(userId: number, seminarId: number): Promise<void> {
    // 이미 관심등록되어 있는지 확인
    const existing = await db
      .select()
      .from(seminarWishlist)
      .where(
        and(
          eq(seminarWishlist.userId, userId),
          eq(seminarWishlist.seminarId, seminarId),
        ),
      )
      .limit(1);

    // 중복이 아닌 경우에만 추가
    if (existing.length === 0) {
      await db.insert(seminarWishlist).values({
        userId,
        seminarId,
      });
    }
  }

  async removeSeminarFromWishlist(
    userId: number,
    seminarId: number,
  ): Promise<void> {
    await db
      .delete(seminarWishlist)
      .where(
        and(
          eq(seminarWishlist.userId, userId),
          eq(seminarWishlist.seminarId, seminarId),
        ),
      );
  }

  async isSeminarInWishlist(
    userId: number,
    seminarId: number,
  ): Promise<boolean> {
    const result = await db
      .select()
      .from(seminarWishlist)
      .where(
        and(
          eq(seminarWishlist.userId, userId),
          eq(seminarWishlist.seminarId, seminarId),
        ),
      )
      .limit(1);

    return result.length > 0;
  }

  async getSeminarsByProvider(providerId: number): Promise<Seminar[]> {
    return await db
      .select()
      .from(seminars)
      .where(
        and(eq(seminars.providerId, providerId), eq(seminars.isActive, true)),
      )
      .orderBy(desc(seminars.date));
  }

  // Overseas Programs management
  async getOverseasPrograms(): Promise<OverseasProgram[]> {
    return await db
      .select()
      .from(overseasPrograms)
      .where(eq(overseasPrograms.isActive, true))
      .orderBy(desc(overseasPrograms.startDate));
  }

  async getOverseasProgram(id: number): Promise<OverseasProgram | undefined> {
    const result = await db
      .select()
      .from(overseasPrograms)
      .where(eq(overseasPrograms.id, id))
      .limit(1);
    return result[0];
  }

  async createOverseasProgram(
    programData: InsertOverseasProgram,
  ): Promise<OverseasProgram> {
    const result = await db
      .insert(overseasPrograms)
      .values(programData)
      .returning();
    return result[0];
  }

  async updateOverseasProgram(
    id: number,
    programData: Partial<InsertOverseasProgram>,
  ): Promise<OverseasProgram | undefined> {
    const result = await db
      .update(overseasPrograms)
      .set({
        ...programData,
        updatedAt: new Date(),
      })
      .where(eq(overseasPrograms.id, id))
      .returning();
    return result[0];
  }

  async deleteOverseasProgram(id: number): Promise<void> {
    await db
      .update(overseasPrograms)
      .set({ isActive: false })
      .where(eq(overseasPrograms.id, id));
  }

  async getOverseasProgramsByProvider(
    providerId: number,
  ): Promise<OverseasProgram[]> {
    return await db
      .select()
      .from(overseasPrograms)
      .where(
        and(
          eq(overseasPrograms.providerId, providerId),
          eq(overseasPrograms.isActive, true),
        ),
      )
      .orderBy(desc(overseasPrograms.createdAt));
  }

  async registerForOverseasProgram(
    userId: number,
    overseasId: number,
  ): Promise<void> {
    await db.insert(overseasRegistrations).values({
      userId,
      overseasId,
      status: "registered",
    });

    // 해외연수 참가자 수 업데이트
    await this.updateOverseasParticipantCount(overseasId);
  }

  async getOverseasRegistrations(
    overseasId?: number,
    userId?: number,
  ): Promise<OverseasRegistration[]> {
    let whereConditions = [];

    if (overseasId) {
      whereConditions.push(eq(overseasRegistrations.overseasId, overseasId));
    }
    if (userId) {
      whereConditions.push(eq(overseasRegistrations.userId, userId));
    }

    const whereClause =
      whereConditions.length > 0
        ? whereConditions.length === 1
          ? whereConditions[0]
          : and(...whereConditions)
        : undefined;

    const results = await db
      .select()
      .from(overseasRegistrations)
      .where(whereClause)
      .orderBy(desc(overseasRegistrations.registeredAt));

    return results.map((result) => ({
      id: result.id,
      userId: result.userId,
      overseasId: result.overseasId,
      status: result.status,
      registeredAt: result.registeredAt,
    }));
  }

  async isOverseasRegistered(
    userId: number,
    overseasId: number,
  ): Promise<boolean> {
    const result = await db
      .select()
      .from(overseasRegistrations)
      .where(
        and(
          eq(overseasRegistrations.userId, userId),
          eq(overseasRegistrations.overseasId, overseasId),
        ),
      )
      .limit(1);

    return result.length > 0;
  }

  async updateOverseasParticipantCount(overseasId: number): Promise<void> {
    // 해당 해외연수의 등록된 참가자 수 계산
    const registrations = await db
      .select()
      .from(overseasRegistrations)
      .where(eq(overseasRegistrations.overseasId, overseasId));

    const participantCount = registrations.length;

    // 해외연수 테이블의 currentParticipants 업데이트
    await db
      .update(overseasPrograms)
      .set({ currentParticipants: participantCount })
      .where(eq(overseasPrograms.id, overseasId));
  }

  async migrateSeminarRegistrations(): Promise<void> {
    try {
      // 모든 세미나 등록 데이터 조회
      const registrations = await db.select().from(seminarRegistrations);

      // enrollments 테이블에 없는 데이터만 추가
      for (const registration of registrations) {
        const existingEnrollment = await db
          .select()
          .from(enrollments)
          .where(
            and(
              eq(enrollments.userId, registration.userId),
              eq(enrollments.courseId, registration.seminarId),
            ),
          )
          .limit(1);

        if (existingEnrollment.length === 0) {
          // 세미나 정보 조회
          const seminar = await db
            .select()
            .from(seminars)
            .where(eq(seminars.id, registration.seminarId))
            .limit(1);

          if (seminar.length > 0) {
            await db.insert(enrollments).values({
              type: "seminar",
              userId: registration.userId,
              courseId: registration.seminarId,
              status: "enrolled",
              progress: 0,
              enrolledAt: new Date(),
            });

            console.log(
              `Migrated seminar registration: userId=${registration.userId}, seminarId=${registration.seminarId}, type=${seminar[0].type}`,
            );
          }
        }
      }

      console.log("Seminar registrations migration completed");
    } catch (error) {
      console.error("Error migrating seminar registrations:", error);
      throw error;
    }
  }

  async query(sqlString: string, params?: any[]): Promise<{ rows: any[] }> {
    const result = await db.execute(sql.raw(sqlString));
    return { rows: Array.isArray(result) ? result : [result] };
  }

  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    const result = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, id))
      .limit(1);
    return result[0];
  }

  async createCertificate(
    certificateData: InsertCertificate,
  ): Promise<Certificate> {
    const result = await db
      .insert(certificates)
      .values(certificateData)
      .returning();
    return result[0];
  }

  async getCertificate(enrollmentId: number): Promise<Certificate | null> {
    // enrollmentId로 enrollment 정보를 먼저 조회하고, 해당 userId와 courseId로 certificate 조회
    const enrollment = await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.id, enrollmentId))
      .limit(1);
    if (!enrollment[0]) return null;

    const result = await db
      .select()
      .from(certificates)
      .where(
        and(
          eq(certificates.userId, enrollment[0].userId),
          eq(certificates.courseId, enrollment[0].courseId),
        ),
      )
      .limit(1);
    return result[0] || null;
  }

  // Cart management methods
  async getCartItems(userId: number): Promise<any[]> {
    const cartItems = await db
      .select({
        id: cart.id,
        courseId: cart.courseId,
        type: cart.type,
        addedAt: cart.addedAt,
        courseName: courses.title,
        courseImage: courses.imageUrl,
        price: courses.price,
        discountPrice: courses.discountPrice,
        instructor: courses.instructorName,
      })
      .from(cart)
      .innerJoin(courses, eq(cart.courseId, courses.id))
      .where(eq(cart.userId, userId))
      .orderBy(desc(cart.addedAt));

    return cartItems.map((item) => ({
      id: item.id,
      courseId: item.courseId,
      courseName: item.courseName,
      courseImage: item.courseImage || "/uploads/images/1.jpg",
      price: item.price,
      discountPrice: item.discountPrice,
      instructor: item.instructor || "강사명",
      addedAt: item.addedAt,
    }));
  }

  async addToCart(
    userId: number,
    courseId: number,
    type: string = "course",
  ): Promise<void> {
    // 이미 장바구니에 있는지 확인
    const existing = await db
      .select()
      .from(cart)
      .where(and(eq(cart.userId, userId), eq(cart.courseId, courseId)))
      .limit(1);

    // 중복이 아닌 경우에만 추가
    if (existing.length === 0) {
      await db.insert(cart).values({
        userId,
        courseId,
        type,
      });
    }
  }

  async removeFromCart(userId: number, itemId: number): Promise<void> {
    await db
      .delete(cart)
      .where(and(eq(cart.userId, userId), eq(cart.id, itemId)));
  }

  async clearCart(userId: number): Promise<void> {
    await db.delete(cart).where(eq(cart.userId, userId));
  }

  async isInCart(userId: number, courseId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(cart)
      .where(and(eq(cart.userId, userId), eq(cart.courseId, courseId)))
      .limit(1);

    return result.length > 0;
  }

  // Private Message management (쪽지 시스템)
  async getPrivateMessages(
    userId: number,
    type: "received" | "sent",
  ): Promise<PrivateMessage[]> {
    try {
      let query;
      if (type === "received") {
        // 받은 쪽지: 발송자 정보 조인
        query = db
          .select({
            id: privateMessages.id,
            senderId: privateMessages.senderId,
            receiverId: privateMessages.receiverId,
            subject: privateMessages.subject,
            content: privateMessages.content,
            isRead: privateMessages.isRead,
            isDeletedBySender: privateMessages.isDeletedBySender,
            isDeletedByReceiver: privateMessages.isDeletedByReceiver,
            createdAt: privateMessages.createdAt,
            readAt: privateMessages.readAt,
            senderName: users.name,
            senderEmail: users.email,
          })
          .from(privateMessages)
          .leftJoin(users, eq(users.id, privateMessages.senderId))
          .where(
            and(
              eq(privateMessages.receiverId, userId),
              eq(privateMessages.isDeletedByReceiver, false),
            ),
          )
          .orderBy(desc(privateMessages.createdAt));
      } else {
        // 보낸 쪽지: 수신자 정보 조인
        query = db
          .select({
            id: privateMessages.id,
            senderId: privateMessages.senderId,
            receiverId: privateMessages.receiverId,
            subject: privateMessages.subject,
            content: privateMessages.content,
            isRead: privateMessages.isRead,
            isDeletedBySender: privateMessages.isDeletedBySender,
            isDeletedByReceiver: privateMessages.isDeletedByReceiver,
            createdAt: privateMessages.createdAt,
            readAt: privateMessages.readAt,
            receiverName: users.name,
            receiverEmail: users.email,
          })
          .from(privateMessages)
          .leftJoin(users, eq(users.id, privateMessages.receiverId))
          .where(
            and(
              eq(privateMessages.senderId, userId),
              eq(privateMessages.isDeletedBySender, false),
            ),
          )
          .orderBy(desc(privateMessages.createdAt));
      }

      return await query;
    } catch (error) {
      console.error("Error fetching private messages:", error);
      return [];
    }
  }

  async getPrivateMessage(
    messageId: number,
    userId: number,
  ): Promise<PrivateMessage | undefined> {
    try {
      // 먼저 메시지가 받은 것인지 보낸 것인지 확인
      const messageCheck = await db
        .select({
          senderId: privateMessages.senderId,
          receiverId: privateMessages.receiverId,
        })
        .from(privateMessages)
        .where(eq(privateMessages.id, messageId))
        .limit(1);

      if (!messageCheck[0]) return undefined;

      const isReceived = messageCheck[0].receiverId === userId;
      const isSent = messageCheck[0].senderId === userId;

      if (!isReceived && !isSent) return undefined;

      let result;
      if (isReceived) {
        // 받은 쪽지: 발송자 정보 조인
        result = await db
          .select({
            id: privateMessages.id,
            senderId: privateMessages.senderId,
            receiverId: privateMessages.receiverId,
            subject: privateMessages.subject,
            content: privateMessages.content,
            isRead: privateMessages.isRead,
            isDeletedBySender: privateMessages.isDeletedBySender,
            isDeletedByReceiver: privateMessages.isDeletedByReceiver,
            createdAt: privateMessages.createdAt,
            readAt: privateMessages.readAt,
            senderName: users.name,
            senderEmail: users.email,
          })
          .from(privateMessages)
          .leftJoin(users, eq(users.id, privateMessages.senderId))
          .where(eq(privateMessages.id, messageId))
          .limit(1);
      } else {
        // 보낸 쪽지: 수신자 정보 조인
        result = await db
          .select({
            id: privateMessages.id,
            senderId: privateMessages.senderId,
            receiverId: privateMessages.receiverId,
            subject: privateMessages.subject,
            content: privateMessages.content,
            isRead: privateMessages.isRead,
            isDeletedBySender: privateMessages.isDeletedBySender,
            isDeletedByReceiver: privateMessages.isDeletedByReceiver,
            createdAt: privateMessages.createdAt,
            readAt: privateMessages.readAt,
            receiverName: users.name,
            receiverEmail: users.email,
          })
          .from(privateMessages)
          .leftJoin(users, eq(users.id, privateMessages.receiverId))
          .where(eq(privateMessages.id, messageId))
          .limit(1);
      }

      return result[0];
    } catch (error) {
      console.error("Error fetching private message:", error);
      return undefined;
    }
  }

  async createPrivateMessage(
    message: InsertPrivateMessage,
  ): Promise<PrivateMessage> {
    try {
      const result = await db
        .insert(privateMessages)
        .values(message)
        .returning();

      return result[0];
    } catch (error) {
      console.error("Error creating private message:", error);
      throw error;
    }
  }

  async markMessageAsRead(messageId: number, userId: number): Promise<void> {
    try {
      await db
        .update(privateMessages)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(privateMessages.id, messageId),
            eq(privateMessages.receiverId, userId),
          ),
        );
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  }

  async deleteMessage(
    messageId: number,
    userId: number,
    type: "sender" | "receiver",
  ): Promise<void> {
    try {
      const updateData =
        type === "sender"
          ? { isDeletedBySender: true }
          : { isDeletedByReceiver: true };

      const whereCondition =
        type === "sender"
          ? and(
              eq(privateMessages.id, messageId),
              eq(privateMessages.senderId, userId),
            )
          : and(
              eq(privateMessages.id, messageId),
              eq(privateMessages.receiverId, userId),
            );

      await db.update(privateMessages).set(updateData).where(whereCondition);
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(privateMessages)
        .where(
          and(
            eq(privateMessages.receiverId, userId),
            eq(privateMessages.isRead, false),
            eq(privateMessages.isDeletedByReceiver, false),
          ),
        );

      return result[0]?.count || 0;
    } catch (error) {
      console.error("Error getting unread message count:", error);
      return 0;
    }
  }

  // 문의사항 관련 메서드들
  async getInquiries(
    userId?: number,
    status?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ inquiries: Inquiry[]; total: number }> {
    try {
      let baseConditions = [eq(inquiries.isActive, true)];

      if (userId) {
        baseConditions.push(eq(inquiries.userId, userId));
      }

      if (status) {
        baseConditions.push(eq(inquiries.status, status));
      }

      const whereClause = and(...baseConditions);
      const offset = (page - 1) * limit;

      const [inquiriesResult, totalCountResult] = await Promise.all([
        db
          .select({
            id: inquiries.id,
            userId: inquiries.userId,
            title: inquiries.title,
            content: inquiries.content,
            type: inquiries.type,
            status: inquiries.status,
            isPrivate: inquiries.isPrivate,
            attachmentUrl: inquiries.attachmentUrl,
            answer: inquiries.answer,
            answeredBy: inquiries.answeredBy,
            answeredAt: inquiries.answeredAt,
            isActive: inquiries.isActive,
            createdAt: inquiries.createdAt,
            updatedAt: inquiries.updatedAt,
            userName: users.name,
            userEmail: users.email,
            answererName: sql`answerer.name`.as("answererName"),
          })
          .from(inquiries)
          .leftJoin(users, eq(inquiries.userId, users.id))
          .leftJoin(
            sql`${users} as answerer`,
            sql`${inquiries.answeredBy} = answerer.id`,
          )
          .where(whereClause)
          .orderBy(desc(inquiries.createdAt))
          .limit(limit)
          .offset(offset),

        db
          .select({ count: sql`count(*)` })
          .from(inquiries)
          .where(whereClause),
      ]);

      const total = Number(totalCountResult[0]?.count || 0);

      return {
        inquiries: inquiriesResult,
        total,
      };
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      return {
        inquiries: [],
        total: 0,
      };
    }
  }

  async getInquiry(id: number): Promise<Inquiry | undefined> {
    const result = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, id))
      .limit(1);
    return result[0];
  }

  async createInquiry(inquiryData: InsertInquiry): Promise<Inquiry> {
    const result = await db.insert(inquiries).values(inquiryData).returning();
    return result[0];
  }

  async updateInquiry(
    id: number,
    inquiryData: Partial<InsertInquiry>,
  ): Promise<Inquiry | undefined> {
    const result = await db
      .update(inquiries)
      .set(inquiryData)
      .where(eq(inquiries.id, id))
      .returning();
    return result[0];
  }

  async answerInquiry(
    id: number,
    answer: string,
    answeredBy: number,
  ): Promise<Inquiry | undefined> {
    const result = await db
      .update(inquiries)
      .set({
        answer,
        answeredBy,
        answeredAt: new Date(),
        status: "answered",
        updatedAt: new Date(),
      })
      .where(eq(inquiries.id, id))
      .returning();
    return result[0];
  }

  async deleteInquiry(id: number): Promise<void> {
    await db
      .update(inquiries)
      .set({ isActive: false })
      .where(eq(inquiries.id, id));
  }
}
