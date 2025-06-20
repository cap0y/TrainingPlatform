import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  userType: text("user_type").notNull().default("individual"), // individual, business
  role: text("role").default("user"), // user, business, admin
  organizationName: text("organization_name"),
  businessNumber: text("business_number"),
  representativeName: text("representative_name"),
  address: text("address"),
  isApproved: boolean("is_approved").default(false), // 기관/사업자 승인 여부
  isAdmin: boolean("is_admin").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  type: text("type").notNull(), // online, offline, blended
  level: text("level").notNull(), // beginner, intermediate, advanced
  credit: integer("credit").notNull(),
  price: integer("price").notNull(),
  discountPrice: integer("discount_price"),
  duration: text("duration").notNull(),
  maxStudents: integer("max_students"),
  enrolledCount: integer("enrolled_count").default(0),
  providerId: integer("provider_id").references(() => users.id), // 강의 제공자 (기관/사업자)
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  instructorId: integer("instructor_id").references(() => instructors.id),
  imageUrl: text("image_url"),
  status: text("status").default("pending"), // active, inactive, pending
  approvalStatus: text("approval_status").default("pending"), // pending, approved, rejected
  // 추가 상세 정보 필드들
  curriculum: text("curriculum"), // 커리큘럼
  objectives: text("objectives"), // 학습 목표
  requirements: text("requirements"), // 수강 요건
  materials: text("materials"), // 교육 자료
  assessmentMethod: text("assessment_method"), // 평가 방법
  certificateType: text("certificate_type"), // 수료증 종류
  instructorName: text("instructor_name"), // 강사명
  instructorProfile: text("instructor_profile"), // 강사 소개
  instructorExpertise: text("instructor_expertise"), // 강사 전문분야
  targetAudience: text("target_audience"), // 수강 대상
  difficulty: text("difficulty"), // 난이도 상세
  language: text("language").default("ko"), // 언어
  location: text("location"), // 장소
  tags: json("tags"), // 태그 배열
  // 추가 세부 정보 필드들
  features: text("features"), // 과정 특징
  recommendations: text("recommendations"), // 추천 대상
  totalHours: integer("total_hours"), // 총 교육시간
  enrollmentDeadline: timestamp("enrollment_deadline"), // 신청 마감일
  completionDeadline: timestamp("completion_deadline"), // 수료 마감일
  prerequisites: text("prerequisites"), // 선수학습
  learningMethod: text("learning_method"), // 학습 방법
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Instructors table
export const instructors = pgTable("instructors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position"),
  expertise: text("expertise"),
  profile: text("profile"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enrollments table
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  status: text("status").notNull().default("enrolled"), // enrolled, completed, cancelled
  progress: integer("progress").default(0),
  grade: decimal("grade", { precision: 3, scale: 1 }),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Seminars table
export const seminars = pgTable("seminars", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // online, offline
  date: timestamp("date").notNull(),
  location: text("location"),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Seminar Registrations table
export const seminarRegistrations = pgTable("seminar_registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  seminarId: integer("seminar_id").references(() => seminars.id).notNull(),
  status: text("status").notNull().default("registered"),
  registeredAt: timestamp("registered_at").defaultNow(),
});

// Notices table
export const notices = pgTable("notices", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  category: text("category").notNull().default("notice"),
  authorId: integer("author_id").references(() => users.id),
  isImportant: boolean("is_important").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  enrolledCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInstructorSchema = createInsertSchema(instructors).omit({
  id: true,
  createdAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
  completedAt: true,
});

export const insertSeminarSchema = createInsertSchema(seminars).omit({
  id: true,
  currentParticipants: true,
  createdAt: true,
});

export const insertNoticeSchema = createInsertSchema(notices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Instructor = typeof instructors.$inferSelect;
export type InsertInstructor = z.infer<typeof insertInstructorSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Seminar = typeof seminars.$inferSelect;
export type InsertSeminar = z.infer<typeof insertSeminarSchema>;
export type Notice = typeof notices.$inferSelect;
export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
