import { db } from "./db";
import { users, courses, instructors, enrollments, seminars, notices, reviews, chatMessages, payments, seminarRegistrations } from "@shared/schema";
import { eq, like, desc, and, sql } from "drizzle-orm";
import type { User, InsertUser, Course, InsertCourse, Instructor, InsertInstructor, Enrollment, InsertEnrollment, Seminar, InsertSeminar, Notice, InsertNotice, Review, InsertReview, ChatMessage, InsertChatMessage, Payment, InsertPayment } from "@shared/schema";
import type { IStorage } from "./storage";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const PgSession = ConnectPgSimple(session);

export class DbStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isActive, true));
  }

  async getPendingBusinesses(): Promise<User[]> {
    return await db.select().from(users).where(and(
      eq(users.userType, "business"),
      eq(users.isApproved, false),
      eq(users.isActive, true)
    ));
  }

  async updateBusinessApproval(businessId: number, action: string, reason?: string): Promise<User | undefined> {
    const result = await db.update(users).set({
      isApproved: action === "approve",
      role: action === "approve" ? "business" : "user"
    }).where(eq(users.id, businessId)).returning();
    return result[0];
  }

  async getCourses(filters?: {
    category?: string;
    type?: string;
    level?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ courses: Course[]; total: number }> {
    let query = db.select().from(courses).where(eq(courses.isActive, true));
    
    const conditions = [eq(courses.isActive, true)];
    
    if (filters?.category) {
      conditions.push(eq(courses.category, filters.category));
    }
    if (filters?.type) {
      conditions.push(eq(courses.type, filters.type));
    }
    if (filters?.level) {
      conditions.push(eq(courses.level, filters.level));
    }
    if (filters?.search) {
      conditions.push(like(courses.title, `%${filters.search}%`));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];
    
    // Get total count
    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(courses).where(whereClause);
    const total = totalResult[0].count;

    // Get paginated results
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    const coursesResult = await db.select().from(courses)
      .where(whereClause)
      .orderBy(desc(courses.createdAt))
      .limit(limit)
      .offset(offset);

    return { courses: coursesResult, total };
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    return result[0];
  }

  async createCourse(courseData: InsertCourse): Promise<Course> {
    const result = await db.insert(courses).values(courseData).returning();
    return result[0];
  }

  async updateCourse(id: number, courseData: Partial<InsertCourse>): Promise<Course | undefined> {
    const result = await db.update(courses).set(courseData).where(eq(courses.id, id)).returning();
    return result[0];
  }

  async deleteCourse(id: number): Promise<void> {
    await db.update(courses).set({ isActive: false }).where(eq(courses.id, id));
  }

  async getCoursesByProvider(providerId: number): Promise<Course[]> {
    return await db.select().from(courses).where(and(
      eq(courses.providerId, providerId),
      eq(courses.isActive, true)
    ));
  }

  async getPendingCourses(): Promise<Course[]> {
    return await db.select().from(courses).where(and(
      eq(courses.approvalStatus, "pending"),
      eq(courses.isActive, true)
    ));
  }

  async updateCourseApproval(courseId: number, action: string, reason?: string): Promise<Course | undefined> {
    const result = await db.update(courses).set({
      approvalStatus: action === "approve" ? "approved" : "rejected",
      status: action === "approve" ? "active" : "inactive"
    }).where(eq(courses.id, courseId)).returning();
    return result[0];
  }

  async getInstructors(): Promise<Instructor[]> {
    return await db.select().from(instructors).where(eq(instructors.isActive, true));
  }

  async getInstructor(id: number): Promise<Instructor | undefined> {
    const result = await db.select().from(instructors).where(eq(instructors.id, id)).limit(1);
    return result[0];
  }

  async createInstructor(instructorData: InsertInstructor): Promise<Instructor> {
    const result = await db.insert(instructors).values(instructorData).returning();
    return result[0];
  }

  async updateInstructor(id: number, instructorData: Partial<InsertInstructor>): Promise<Instructor | undefined> {
    const result = await db.update(instructors).set(instructorData).where(eq(instructors.id, id)).returning();
    return result[0];
  }

  async getEnrollments(userId?: number, courseId?: number): Promise<Enrollment[]> {
    const conditions = [];
    if (userId) conditions.push(eq(enrollments.userId, userId));
    if (courseId) conditions.push(eq(enrollments.courseId, courseId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    return await db.select().from(enrollments).where(whereClause);
  }

  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    const result = await db.insert(enrollments).values(enrollmentData).returning();
    return result[0];
  }

  async updateEnrollment(id: number, enrollmentData: Partial<InsertEnrollment>): Promise<Enrollment | undefined> {
    const result = await db.update(enrollments).set(enrollmentData).where(eq(enrollments.id, id)).returning();
    return result[0];
  }

  async getSeminars(): Promise<Seminar[]> {
    return await db.select().from(seminars).where(eq(seminars.isActive, true)).orderBy(desc(seminars.date));
  }

  async getSeminar(id: number): Promise<Seminar | undefined> {
    const result = await db.select().from(seminars).where(eq(seminars.id, id)).limit(1);
    return result[0];
  }

  async createSeminar(seminarData: InsertSeminar): Promise<Seminar> {
    const result = await db.insert(seminars).values(seminarData).returning();
    return result[0];
  }

  async registerForSeminar(userId: number, seminarId: number): Promise<void> {
    await db.insert(seminarRegistrations).values({
      userId,
      seminarId,
      status: "registered"
    });
  }

  async getNotices(category?: string, page?: number, limit?: number): Promise<{ notices: Notice[]; total: number }> {
    const conditions = [eq(notices.isActive, true)];
    if (category) {
      conditions.push(eq(notices.category, category));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count
    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(notices).where(whereClause);
    const total = totalResult[0].count;

    // Get paginated results
    const pageNum = page || 1;
    const limitNum = limit || 10;
    const offset = (pageNum - 1) * limitNum;

    const noticesResult = await db.select().from(notices)
      .where(whereClause)
      .orderBy(desc(notices.createdAt))
      .limit(limitNum)
      .offset(offset);

    return { notices: noticesResult, total };
  }

  async getNotice(id: number): Promise<Notice | undefined> {
    const result = await db.select().from(notices).where(eq(notices.id, id)).limit(1);
    return result[0];
  }

  async createNotice(noticeData: InsertNotice): Promise<Notice> {
    const result = await db.insert(notices).values(noticeData).returning();
    return result[0];
  }

  async updateNotice(id: number, noticeData: Partial<InsertNotice>): Promise<Notice | undefined> {
    const result = await db.update(notices).set(noticeData).where(eq(notices.id, id)).returning();
    return result[0];
  }

  async deleteNotice(id: number): Promise<void> {
    await db.update(notices).set({ isActive: false }).where(eq(notices.id, id));
  }

  async getReviews(courseId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(and(
      eq(reviews.courseId, courseId),
      eq(reviews.isActive, true)
    ));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(reviewData).returning();
    return result[0];
  }

  async getChatMessages(limit?: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit || 50);
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(chatMessages).values(messageData).returning();
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

  async updatePayment(id: number, paymentData: Partial<InsertPayment>): Promise<Payment | undefined> {
    const result = await db.update(payments).set(paymentData).where(eq(payments.id, id)).returning();
    return result[0];
  }

  async getDashboardStats(): Promise<any> {
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.isActive, true));
    const totalCourses = await db.select({ count: sql<number>`count(*)` }).from(courses).where(eq(courses.isActive, true));
    const totalEnrollments = await db.select({ count: sql<number>`count(*)` }).from(enrollments);
    const pendingBusinesses = await db.select({ count: sql<number>`count(*)` }).from(users).where(and(
      eq(users.userType, "business"),
      eq(users.isApproved, false)
    ));

    return {
      totalUsers: totalUsers[0].count,
      totalCourses: totalCourses[0].count,
      totalEnrollments: totalEnrollments[0].count,
      pendingBusinesses: pendingBusinesses[0].count,
    };
  }
}