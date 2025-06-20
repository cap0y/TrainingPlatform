import { type User, type InsertUser, type Course, type InsertCourse, type Instructor, type InsertInstructor, type Enrollment, type InsertEnrollment, type Seminar, type InsertSeminar, type Notice, type InsertNotice, type Review, type InsertReview, type ChatMessage, type InsertChatMessage, type Payment, type InsertPayment } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getPendingBusinesses(): Promise<User[]>;
  updateBusinessApproval(businessId: number, action: string, reason?: string): Promise<User | undefined>;
  
  // Course management
  getCourses(filters?: {
    category?: string;
    type?: string;
    level?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ courses: Course[]; total: number }>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<void>;
  getCoursesByProvider(providerId: number): Promise<Course[]>;
  getPendingCourses(): Promise<Course[]>;
  updateCourseApproval(courseId: number, action: string, reason?: string): Promise<Course | undefined>;
  
  // Instructor management
  getInstructors(): Promise<Instructor[]>;
  getInstructor(id: number): Promise<Instructor | undefined>;
  createInstructor(instructor: InsertInstructor): Promise<Instructor>;
  updateInstructor(id: number, instructor: Partial<InsertInstructor>): Promise<Instructor | undefined>;
  
  // Enrollment management
  getEnrollments(userId?: number, courseId?: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: number, enrollment: Partial<InsertEnrollment>): Promise<Enrollment | undefined>;
  
  // Seminar management
  getSeminars(): Promise<Seminar[]>;
  getSeminar(id: number): Promise<Seminar | undefined>;
  createSeminar(seminar: InsertSeminar): Promise<Seminar>;
  registerForSeminar(userId: number, seminarId: number): Promise<void>;
  
  // Notice management
  getNotices(category?: string, page?: number, limit?: number): Promise<{ notices: Notice[]; total: number }>;
  getNotice(id: number): Promise<Notice | undefined>;
  createNotice(notice: InsertNotice): Promise<Notice>;
  updateNotice(id: number, notice: Partial<InsertNotice>): Promise<Notice | undefined>;
  deleteNotice(id: number): Promise<void>;
  
  // Review management
  getReviews(courseId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Chat management
  getChatMessages(limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Payment management
  getPayments(userId?: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  
  // Admin management
  getDashboardStats(): Promise<any>;
  
  // Session store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  sessionStore: any;
  private users: Map<number, User> = new Map();
  private courses: Map<number, Course> = new Map();
  private instructors: Map<number, Instructor> = new Map();
  private enrollments: Map<number, Enrollment> = new Map();
  private seminars: Map<number, Seminar> = new Map();
  private notices: Map<number, Notice> = new Map();
  private reviews: Map<number, Review> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private payments: Map<number, Payment> = new Map();
  private nextId = 1;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    this.seedData();
  }

  private seedData() {
    // Seed admin user
    const adminUser: User = {
      id: 1,
      username: "admin",
      email: "admin@example.com",
      password: "$2b$10$abcdefghijklmnopqrstuvwxyz",
      name: "관리자",
      phone: "010-1234-5678",
      userType: "individual",
      businessName: null,
      businessNumber: null,
      isAdmin: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(1, adminUser);

    // Seed sample courses
    const sampleCourses: Course[] = [
      {
        id: 1,
        title: "2025 교육과정 개정안 이해와 적용",
        description: "새로운 교육과정의 주요 변화사항과 현장 적용 방안을 학습합니다.",
        category: "교육과정",
        type: "온라인",
        level: "초급",
        credit: 15,
        price: "50000",
        discountPrice: "40000",
        duration: 30,
        maxStudents: 100,
        enrolledCount: 45,
        imageUrl: null,
        status: "active",
        instructorId: 1,
        tags: ["교육과정", "개정", "적용방안"],
        requirements: ["교육 관련 업무 경험"],
        objectives: ["교육과정 이해", "현장 적용 능력 향상"],
        outline: "1. 개정 배경\n2. 주요 변화사항\n3. 적용 방안",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        title: "디지털 교육 도구 활용 워크숍",
        description: "최신 디지털 교육 도구를 활용한 효과적인 수업 방법을 익힙니다.",
        category: "디지털교육",
        type: "블렌디드",
        level: "중급",
        credit: 10,
        price: "30000",
        discountPrice: null,
        duration: 20,
        maxStudents: 50,
        enrolledCount: 32,
        imageUrl: null,
        status: "active",
        instructorId: 2,
        tags: ["디지털", "도구", "워크숍"],
        requirements: ["기본적인 컴퓨터 활용 능력"],
        objectives: ["디지털 도구 활용", "수업 효과성 향상"],
        outline: "1. 디지털 도구 소개\n2. 실습\n3. 적용 사례",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    sampleCourses.forEach(course => this.courses.set(course.id, course));

    // Seed instructors
    const sampleInstructors: Instructor[] = [
      {
        id: 1,
        name: "김교수",
        position: "교육학과 교수",
        expertise: "교육과정 전문가",
        profile: "20년 이상의 교육과정 연구 경험",
        imageUrl: null,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "이박사",
        position: "디지털교육 연구원",
        expertise: "교육공학 전문가",
        profile: "디지털 교육 도구 개발 및 연구",
        imageUrl: null,
        isActive: true,
        createdAt: new Date(),
      }
    ];

    sampleInstructors.forEach(instructor => this.instructors.set(instructor.id, instructor));

    // Seed notices
    const sampleNotices: Notice[] = [
      {
        id: 1,
        title: "2025년 상반기 연수 일정 공지",
        content: "2025년 상반기 연수 일정이 확정되었습니다. 자세한 내용은 첨부파일을 확인해주세요.",
        category: "일반공지",
        authorId: 1,
        isImportant: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        title: "온라인 연수 시스템 점검 안내",
        content: "시스템 안정성 향상을 위한 정기 점검을 실시합니다.",
        category: "시스템",
        authorId: 1,
        isImportant: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    sampleNotices.forEach(notice => this.notices.set(notice.id, notice));

    this.nextId = 100; // Start IDs from 100 to avoid conflicts
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.username === username) return user;
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.email === email) return user;
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.nextId++;
    const user: User = {
      id,
      username: userData.username,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      phone: userData.phone || null,
      userType: userData.userType || "individual",
      businessName: userData.businessName || null,
      businessNumber: userData.businessNumber || null,
      isAdmin: userData.isAdmin || false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Course methods
  async getCourses(filters?: {
    category?: string;
    type?: string;
    level?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ courses: Course[]; total: number }> {
    let filteredCourses = Array.from(this.courses.values()).filter(course => course.isActive);
    
    if (filters?.category) {
      filteredCourses = filteredCourses.filter(course => course.category === filters.category);
    }
    if (filters?.type) {
      filteredCourses = filteredCourses.filter(course => course.type === filters.type);
    }
    if (filters?.level) {
      filteredCourses = filteredCourses.filter(course => course.level === filters.level);
    }
    if (filters?.search) {
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }
    
    const total = filteredCourses.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;
    
    const courses = filteredCourses
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(offset, offset + limit);
    
    return { courses, total };
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(courseData: InsertCourse): Promise<Course> {
    const id = this.nextId++;
    const course: Course = {
      id,
      ...courseData,
      enrolledCount: 0,
      status: courseData.providerId ? "pending" : "active",
      approvalStatus: courseData.providerId ? "pending" : "approved",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: number, courseData: Partial<InsertCourse>): Promise<Course | undefined> {
    const existingCourse = this.courses.get(id);
    if (!existingCourse) return undefined;
    
    const updatedCourse: Course = {
      ...existingCourse,
      ...courseData,
      updatedAt: new Date(),
    };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<void> {
    this.courses.delete(id);
  }

  // Instructor methods
  async getInstructors(): Promise<Instructor[]> {
    return Array.from(this.instructors.values()).filter(instructor => instructor.isActive);
  }

  async getInstructor(id: number): Promise<Instructor | undefined> {
    return this.instructors.get(id);
  }

  async createInstructor(instructorData: InsertInstructor): Promise<Instructor> {
    const id = this.nextId++;
    const instructor: Instructor = {
      id,
      name: instructorData.name,
      position: instructorData.position || null,
      expertise: instructorData.expertise || null,
      profile: instructorData.profile || null,
      imageUrl: instructorData.imageUrl || null,
      isActive: true,
      createdAt: new Date(),
    };
    this.instructors.set(id, instructor);
    return instructor;
  }

  async updateInstructor(id: number, instructorData: Partial<InsertInstructor>): Promise<Instructor | undefined> {
    const existingInstructor = this.instructors.get(id);
    if (!existingInstructor) return undefined;
    
    const updatedInstructor: Instructor = {
      ...existingInstructor,
      ...instructorData,
    };
    this.instructors.set(id, updatedInstructor);
    return updatedInstructor;
  }

  // Enrollment methods
  async getEnrollments(userId?: number, courseId?: number): Promise<Enrollment[]> {
    let enrollments = Array.from(this.enrollments.values());
    
    if (userId) {
      enrollments = enrollments.filter(enrollment => enrollment.userId === userId);
    }
    if (courseId) {
      enrollments = enrollments.filter(enrollment => enrollment.courseId === courseId);
    }
    
    return enrollments;
  }

  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    const id = this.nextId++;
    const enrollment: Enrollment = {
      id,
      ...enrollmentData,
      progress: 0,
      status: "enrolled",
      grade: null,
      enrolledAt: new Date(),
      completedAt: null,
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  async updateEnrollment(id: number, enrollmentData: Partial<InsertEnrollment>): Promise<Enrollment | undefined> {
    const existingEnrollment = this.enrollments.get(id);
    if (!existingEnrollment) return undefined;
    
    const updatedEnrollment: Enrollment = {
      ...existingEnrollment,
      ...enrollmentData,
    };
    this.enrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }

  // Seminar methods
  async getSeminars(): Promise<Seminar[]> {
    return Array.from(this.seminars.values())
      .filter(seminar => seminar.isActive)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getSeminar(id: number): Promise<Seminar | undefined> {
    return this.seminars.get(id);
  }

  async createSeminar(seminarData: InsertSeminar): Promise<Seminar> {
    const id = this.nextId++;
    const seminar: Seminar = {
      id,
      title: seminarData.title,
      description: seminarData.description || null,
      date: seminarData.date,
      type: seminarData.type,
      location: seminarData.location || null,
      maxParticipants: seminarData.maxParticipants || null,
      imageUrl: seminarData.imageUrl || null,
      currentParticipants: 0,
      isActive: true,
      createdAt: new Date(),
    };
    this.seminars.set(id, seminar);
    return seminar;
  }

  async registerForSeminar(userId: number, seminarId: number): Promise<void> {
    // Implementation for seminar registration
    // This would typically involve creating a seminar registration record
  }

  // Notice methods
  async getNotices(category?: string, page?: number, limit?: number): Promise<{ notices: Notice[]; total: number }> {
    let filteredNotices = Array.from(this.notices.values()).filter(notice => notice.isActive);
    
    if (category) {
      filteredNotices = filteredNotices.filter(notice => notice.category === category);
    }
    
    const total = filteredNotices.length;
    const actualPage = page || 1;
    const actualLimit = limit || 10;
    const offset = (actualPage - 1) * actualLimit;
    
    const notices = filteredNotices
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(offset, offset + actualLimit);
    
    return { notices, total };
  }

  async getNotice(id: number): Promise<Notice | undefined> {
    return this.notices.get(id);
  }

  async createNotice(noticeData: InsertNotice): Promise<Notice> {
    const id = this.nextId++;
    const notice: Notice = {
      id,
      title: noticeData.title,
      content: noticeData.content || null,
      category: noticeData.category || "일반공지",
      authorId: noticeData.authorId || null,
      isImportant: noticeData.isImportant || false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.notices.set(id, notice);
    return notice;
  }

  async updateNotice(id: number, noticeData: Partial<InsertNotice>): Promise<Notice | undefined> {
    const existingNotice = this.notices.get(id);
    if (!existingNotice) return undefined;
    
    const updatedNotice: Notice = {
      ...existingNotice,
      ...noticeData,
      updatedAt: new Date(),
    };
    this.notices.set(id, updatedNotice);
    return updatedNotice;
  }

  async deleteNotice(id: number): Promise<void> {
    this.notices.delete(id);
  }

  // Review methods
  async getReviews(courseId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.courseId === courseId && review.isActive)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.nextId++;
    const review: Review = {
      id,
      userId: reviewData.userId,
      courseId: reviewData.courseId,
      rating: reviewData.rating,
      comment: reviewData.comment || null,
      isActive: true,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  // Chat methods
  async getChatMessages(limit?: number): Promise<ChatMessage[]> {
    const actualLimit = limit || 50;
    return Array.from(this.chatMessages.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, actualLimit);
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const id = this.nextId++;
    const message: ChatMessage = {
      id,
      userId: messageData.userId || null,
      message: messageData.message,
      isAdmin: messageData.isAdmin || false,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Payment methods
  async getPayments(userId?: number): Promise<Payment[]> {
    let payments = Array.from(this.payments.values());
    
    if (userId) {
      payments = payments.filter(payment => payment.userId === userId);
    }
    
    return payments.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const id = this.nextId++;
    const payment: Payment = {
      id,
      userId: paymentData.userId,
      courseId: paymentData.courseId || null,
      amount: paymentData.amount,
      status: paymentData.status || "pending",
      paymentMethod: paymentData.paymentMethod || null,
      transactionId: paymentData.transactionId || null,
      createdAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: number, paymentData: Partial<InsertPayment>): Promise<Payment | undefined> {
    const existingPayment = this.payments.get(id);
    if (!existingPayment) return undefined;
    
    const updatedPayment: Payment = {
      ...existingPayment,
      ...paymentData,
    };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
}

export const storage = new MemStorage();