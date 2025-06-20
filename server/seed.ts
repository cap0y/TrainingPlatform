import { db } from "./db";
import { users, courses, instructors, notices } from "@shared/schema";
import { hash } from "bcrypt";

export async function seedDatabase() {
  try {
    // Check if admin user already exists
    const existingAdmin = await db.select().from(users).where({ username: "admin" });
    
    if (existingAdmin.length === 0) {
      // Seed admin user
      const hashedPassword = await hash("admin123", 10);
      await db.insert(users).values({
        username: "admin",
        email: "admin@eduplatform.kr",
        password: hashedPassword,
        name: "관리자",
        phone: "010-1234-5678",
        role: "admin",
        organizationName: "에듀플랫폼",
        isActive: true
      });

      // Seed instructors
      await db.insert(instructors).values([
        {
          name: "김교육",
          position: "교수",
          expertise: "교육과정, 교육평가",
          bio: "서울대학교 교육학과 교수로 15년간 교육과정 연구에 매진해온 전문가입니다.",
          email: "kim.edu@university.ac.kr",
          phone: "010-1111-2222",
          imageUrl: "/api/placeholder/150/150",
          isActive: true
        },
        {
          name: "박화학",
          position: "박사",
          expertise: "화학물질 관리, 안전공학",
          bio: "한국화학연구원 선임연구원으로 화학물질 안전관리 분야의 권위자입니다.",
          email: "park.chem@research.ac.kr",
          phone: "010-2222-3333",
          imageUrl: "/api/placeholder/150/150",
          isActive: true
        }
      ]);

      // Get instructor IDs
      const instructorList = await db.select().from(instructors);

      // Seed courses
      await db.insert(courses).values([
        {
          title: "2025 교육과정 개정안 이해와 적용",
          description: "2025년 개정 교육과정의 주요 변화사항과 현장 적용 방안을 학습하는 과정입니다.",
          category: "교육과정",
          type: "online",
          level: "intermediate",
          credit: 3,
          price: "150000",
          discountPrice: "120000",
          duration: 45,
          maxStudents: 100,
          enrolledCount: 67,
          startDate: new Date("2025-07-01"),
          endDate: new Date("2025-08-30"),
          instructorId: instructorList[0]?.id,
          imageUrl: "/api/placeholder/400/250",
          isActive: true
        },
        {
          title: "화학물질 관리사 자격증 취득과정",
          description: "화학물질 관리법에 따른 전문 인력 양성을 위한 종합 교육과정입니다.",
          category: "자격증",
          type: "blended",
          level: "advanced",
          credit: 4,
          price: "380000",
          discountPrice: "320000",
          duration: 60,
          maxStudents: 50,
          enrolledCount: 23,
          startDate: new Date("2025-08-01"),
          endDate: new Date("2025-10-30"),
          instructorId: instructorList[1]?.id,
          imageUrl: "/api/placeholder/400/250",
          isActive: true
        }
      ]);

      // Get admin user ID
      const adminUser = await db.select().from(users).where({ username: "admin" });

      // Seed notices
      await db.insert(notices).values([
        {
          title: "2025년 상반기 연수 일정 공지",
          content: "2025년 상반기 연수 프로그램 일정을 안내드립니다. 많은 참여 바랍니다.",
          category: "공지",
          isImportant: true,
          isPublished: true,
          authorId: adminUser[0]?.id
        },
        {
          title: "화학물질 관리 교육과정 신규 개설",
          content: "화학물질 관리사 자격증 취득을 위한 새로운 교육과정이 개설되었습니다.",
          category: "안내",
          isImportant: false,
          isPublished: true,
          authorId: adminUser[0]?.id
        }
      ]);

      console.log("Database seeded successfully!");
    } else {
      console.log("Database already contains data, skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}