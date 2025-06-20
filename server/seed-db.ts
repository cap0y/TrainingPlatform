import { db } from "./db";
import { users, courses, instructors, notices } from "@shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDatabase() {
  console.log("Seeding database...");

  // Check if admin user exists
  const existingAdmin = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
  
  if (existingAdmin.length === 0) {
    // Create admin user
    await db.insert(users).values({
      username: "admin",
      email: "admin@example.com", 
      password: await hashPassword("admin123"), // Properly hashed password
      name: "관리자",
      phone: "010-1234-5678",
      userType: "individual",
      role: "admin",
      isAdmin: true,
      isApproved: true,
      isActive: true
    });
    console.log("Admin user created");
  } else {
    // Update existing admin password to use correct hash
    await db.update(users)
      .set({ password: await hashPassword("admin123") })
      .where(eq(users.username, "admin"));
    console.log("Admin password updated");
  }

  // Create sample instructors
  const existingInstructors = await db.select().from(instructors).limit(1);
  if (existingInstructors.length === 0) {
    await db.insert(instructors).values([
      {
        name: "김교수",
        position: "교육학과 교수",
        expertise: "교육과정 전문가",
        profile: "20년 이상의 교육과정 연구 경험"
      },
      {
        name: "이박사",
        position: "디지털교육 연구원", 
        expertise: "교육공학 전문가",
        profile: "디지털 교육 도구 개발 및 연구"
      }
    ]);
    console.log("Sample instructors created");
  }

  // Create sample courses
  const existingCourses = await db.select().from(courses).limit(1);
  if (existingCourses.length === 0) {
    await db.insert(courses).values([
      {
        title: "2025 교육과정 개정안 이해와 적용",
        description: "새로운 교육과정의 주요 변화사항과 현장 적용 방안을 학습합니다.",
        category: "교육과정",
        type: "online",
        level: "beginner",
        credit: 15,
        price: 50000,
        discountPrice: 40000,
        duration: "30시간",
        totalHours: 30,
        maxStudents: 100,
        status: "active",
        approvalStatus: "approved",
        instructorId: 1,
        objectives: "교육과정 이해, 현장 적용 능력 향상",
        requirements: "교육 관련 업무 경험",
        materials: "교육과정 개정안 자료집, 실습 워크북",
        curriculum: "1. 개정 배경\n2. 주요 변화사항\n3. 적용 방안"
      },
      {
        title: "디지털 교육 도구 활용 워크숍",
        description: "최신 디지털 교육 도구를 활용한 효과적인 수업 방법을 익힙니다.",
        category: "디지털교육",
        type: "blended",
        level: "intermediate",
        credit: 10,
        price: 30000,
        duration: "20시간",
        totalHours: 20,
        maxStudents: 50,
        status: "active",
        approvalStatus: "approved",
        instructorId: 2,
        objectives: "디지털 도구 활용, 수업 효과성 향상",
        requirements: "기본적인 컴퓨터 활용 능력",
        materials: "디지털 도구 매뉴얼, 실습용 소프트웨어",
        curriculum: "1. 디지털 도구 소개\n2. 실습\n3. 적용 사례"
      }
    ]);
    console.log("Sample courses created");
  }

  // Create sample notices
  const existingNotices = await db.select().from(notices).limit(1);
  if (existingNotices.length === 0) {
    await db.insert(notices).values([
      {
        title: "2025년 상반기 연수 일정 공지",
        content: "2025년 상반기 연수 일정이 확정되었습니다. 자세한 내용은 첨부파일을 확인해주세요.",
        category: "notice",
        authorId: 1,
        isImportant: true
      },
      {
        title: "온라인 연수 시스템 점검 안내", 
        content: "시스템 안정성 향상을 위한 정기 점검을 실시합니다.",
        category: "system",
        authorId: 1,
        isImportant: false
      }
    ]);
    console.log("Sample notices created");
  }

  console.log("Database seeding completed");
}