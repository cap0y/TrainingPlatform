import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  decimal,
  json,
  varchar,
} from "drizzle-orm/pg-core";
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
  subcategory: text("subcategory"),
  type: text("type").notNull(), // course, seminar, overseas
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
  // 멀티미디어 콘텐츠 관련 필드
  videoThumbnails: json("video_thumbnails"), // 동영상 썸네일 정보
  quizData: json("quiz_data"), // 퀴즈 데이터
  interactiveElements: json("interactive_elements"), // 인터랙티브 요소
  curriculumItems: json("curriculum_items"), // 구조화된 커리큘럼 데이터 (차시별 영상, 퀴즈 포함)
  learningMaterials: json("learning_materials"), // 학습 자료 (파일 정보)
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
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  courseId: integer("course_id")
    .references(() => courses.id)
    .notNull(),
  status: text("status").notNull().default("enrolled"), // enrolled, completed, cancelled
  progress: integer("progress").default(0),
  grade: decimal("grade", { precision: 3, scale: 1 }),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  type: text("type").notNull(), // course, seminar, overseas
  subtype: text("subtype"), // 세부 타입 (학술세미나, 정책세미나 등)
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
  price: integer("price").default(0), // 참가비
  benefits: text("benefits"), // 참가 혜택
  requirements: text("requirements"), // 참가 자격
  tags: text("tags"), // 태그 (쉼표로 구분)
  duration: text("duration"), // 세미나 진행 시간
  organizer: text("organizer"), // 주최기관
  contactPhone: text("contact_phone"), // 문의 연락처
  contactEmail: text("contact_email"), // 문의 이메일
  programSchedule: json("program_schedule"), // 시간대별 프로그램 일정
  providerId: integer("provider_id").references(() => users.id), // 세미나 제공자 (기관/사업자)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Seminar Registrations table
export const seminarRegistrations = pgTable("seminar_registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  seminarId: integer("seminar_id")
    .references(() => seminars.id)
    .notNull(),
  status: text("status").notNull().default("registered"),
  registeredAt: timestamp("registered_at").defaultNow(),
});

// Seminar Wishlist table
export const seminarWishlist = pgTable("seminar_wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  seminarId: integer("seminar_id")
    .references(() => seminars.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notices table
export const notices = pgTable("notices", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  category: text("category").notNull().default("notice"),
  authorId: integer("author_id").references(() => users.id),
  isImportant: boolean("is_important").default(false),
  views: integer("views").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  courseId: integer("course_id")
    .references(() => courses.id)
    .notNull(),
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

// Private Messages table (쪽지 시스템)
export const privateMessages = pgTable("private_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id")
    .references(() => users.id)
    .notNull(),
  receiverId: integer("receiver_id")
    .references(() => users.id)
    .notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  isDeletedBySender: boolean("is_deleted_by_sender").default(false),
  isDeletedByReceiver: boolean("is_deleted_by_receiver").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  courseId: integer("course_id").references(() => courses.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, failed, refunded
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  refundReason: text("refund_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Overseas Programs table
export const overseasPrograms = pgTable("overseas_programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  destination: text("destination").notNull(), // 연수지
  startDate: timestamp("start_date").notNull(), // 출발일
  endDate: timestamp("end_date").notNull(), // 귀국일
  type: text("type").notNull(), // 교육시찰, 연구연수, 어학연수, 문화체험, 교육과정개발, 국제교류
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  price: integer("price").notNull(), // 연수비
  duration: text("duration"), // 연수 기간 (예: 7박 8일)
  imageUrl: text("image_url"),

  // 연수 상세 정보
  program: text("program"), // 연수 프로그램
  programSchedule: json("program_schedule"), // 일정별 연수 프로그램
  benefits: text("benefits"), // 연수 혜택
  requirements: text("requirements"), // 참가 자격
  tags: text("tags"), // 태그 (쉼표로 구분)

  // 여행 관련 정보
  airline: text("airline"), // 항공편 정보
  accommodation: text("accommodation"), // 숙박 정보
  meals: text("meals"), // 식사 정보
  guide: text("guide"), // 가이드 정보
  visaInfo: text("visa_info"), // 비자 정보
  insurance: text("insurance"), // 보험 정보

  // 현지 정보
  currency: text("currency"), // 현지 통화
  climate: text("climate"), // 기후 정보
  timeZone: text("time_zone"), // 시차 정보
  language: text("language"), // 현지 언어

  // 기타 정보
  emergencyContact: text("emergency_contact"), // 긴급 연락처
  cancellationPolicy: text("cancellation_policy"), // 취소 규정

  // 시스템 필드
  providerId: integer("provider_id").references(() => users.id), // 연수 제공자 (기관/사업자)
  status: text("status").default("pending"), // active, inactive, pending
  approvalStatus: text("approval_status").default("pending"), // pending, approved, rejected
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Overseas Program Registrations table
export const overseasRegistrations = pgTable("overseas_registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  overseasId: integer("overseas_id")
    .references(() => overseasPrograms.id)
    .notNull(),
  status: text("status").notNull().default("registered"),
  registeredAt: timestamp("registered_at").defaultNow(),
});

// Cart table - 장바구니 테이블
export const cart = pgTable("cart", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  courseId: integer("course_id")
    .references(() => courses.id)
    .notNull(),
  type: text("type").notNull().default("course"), // course, seminar, overseas
  addedAt: timestamp("added_at").defaultNow(),
});

// Certificates table
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  courseId: integer("course_id")
    .references(() => courses.id)
    .notNull(),
  enrollmentId: integer("enrollment_id")
    .references(() => enrollments.id)
    .notNull(),
  issuedBy: integer("issued_by")
    .references(() => users.id)
    .notNull(),
  certificateNumber: text("certificate_number").notNull().unique(),
  issuedAt: timestamp("issued_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  status: text("status").default("active"), // active, revoked
});

// Enrollment Progress table
export const enrollmentProgress = pgTable("enrollment_progress", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id")
    .references(() => enrollments.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  itemId: varchar("item_id", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // video, quiz
  progress: integer("progress").default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inquiries table (고객센터 1:1 문의)
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("general"), // general, product, payment, delivery, refund, account, etc
  status: text("status").notNull().default("pending"), // pending, answered, closed
  isPrivate: boolean("is_private").default(false),
  attachmentUrl: text("attachment_url"), // 첨부파일 URL
  answer: text("answer"), // 관리자 답변
  answeredBy: integer("answered_by").references(() => users.id), // 답변한 관리자
  answeredAt: timestamp("answered_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertCourseSchema = createInsertSchema(courses);
export const insertInstructorSchema = createInsertSchema(instructors);
export const insertEnrollmentSchema = createInsertSchema(enrollments);
export const insertSeminarSchema = createInsertSchema(seminars);
export const insertSeminarRegistrationSchema =
  createInsertSchema(seminarRegistrations);
export const insertSeminarWishlistSchema = createInsertSchema(seminarWishlist);
export const insertNoticeSchema = createInsertSchema(notices);
export const insertReviewSchema = createInsertSchema(reviews);
export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const insertPaymentSchema = createInsertSchema(payments);
export const insertOverseasProgramSchema = createInsertSchema(overseasPrograms);
export const insertOverseasRegistrationSchema = createInsertSchema(
  overseasRegistrations,
);
export const insertCartSchema = createInsertSchema(cart);
export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
});
export const insertEnrollmentProgressSchema =
  createInsertSchema(enrollmentProgress);
export const insertPrivateMessageSchema = createInsertSchema(
  privateMessages,
).extend({
  subject: z
    .string()
    .min(1, "제목을 입력해주세요")
    .max(100, "제목은 100자 이하로 입력해주세요"),
  content: z
    .string()
    .min(1, "내용을 입력해주세요")
    .max(2000, "내용은 2000자 이하로 입력해주세요"),
});
export const insertInquirySchema = createInsertSchema(inquiries);

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
export type SeminarRegistration = typeof seminarRegistrations.$inferSelect;
export type InsertSeminarRegistration = z.infer<
  typeof insertSeminarRegistrationSchema
>;
export type SeminarWishlist = typeof seminarWishlist.$inferSelect;
export type InsertSeminarWishlist = z.infer<typeof insertSeminarWishlistSchema>;
export type Notice = typeof notices.$inferSelect;
export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type OverseasProgram = typeof overseasPrograms.$inferSelect;
export type InsertOverseasProgram = z.infer<typeof insertOverseasProgramSchema>;
export type OverseasRegistration = typeof overseasRegistrations.$inferSelect;
export type InsertOverseasRegistration = z.infer<
  typeof insertOverseasRegistrationSchema
>;
export type Cart = typeof cart.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;
export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;
export type EnrollmentProgress = typeof enrollmentProgress.$inferSelect;
export type InsertEnrollmentProgress = typeof enrollmentProgress.$inferInsert;
export type PrivateMessage = typeof privateMessages.$inferSelect;
export type InsertPrivateMessage = typeof privateMessages.$inferInsert;
export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
