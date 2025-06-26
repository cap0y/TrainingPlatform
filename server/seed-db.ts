import { db } from "./db";
import { users, courses, instructors, notices, seminars } from "@shared/schema";
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
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");

  // Check if admin user exists
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.username, "admin"))
    .limit(1);

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
      isActive: true,
    });
    console.log("Admin user created");
  } else {
    // Update existing admin password to use correct hash
    await db
      .update(users)
      .set({ password: await hashPassword("admin123") })
      .where(eq(users.username, "admin"));
    console.log("Admin password updated");
  }

  // Create sample instructors - 개별 INSERT로 분리
  const existingInstructors = await db.select().from(instructors).limit(1);
  if (existingInstructors.length === 0) {
    await db.insert(instructors).values({
      name: "김교수",
      position: "교육학과 교수",
      expertise: "교육과정 전문가",
      profile: "20년 이상의 교육과정 연구 경험",
    });

    await db.insert(instructors).values({
      name: "이박사",
      position: "디지털교육 연구원",
      expertise: "교육공학 전문가",
      profile: "디지털 교육 도구 개발 및 연구",
    });
    console.log("Sample instructors created");
  }

  // Create sample courses - 개별 INSERT로 분리
  const existingCourses = await db.select().from(courses).limit(1);
  if (existingCourses.length === 0) {
    await db.insert(courses).values({
      title: "2025 교육과정 개정안 이해와 적용",
      description:
        "새로운 교육과정의 주요 변화사항과 현장 적용 방안을 학습합니다.",
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
      curriculum: "1. 개정 배경\n2. 주요 변화사항\n3. 적용 방안",
    });

    await db.insert(courses).values({
      title: "디지털 교육 도구 활용 워크숍",
      description:
        "최신 디지털 교육 도구를 활용한 효과적인 수업 방법을 익힙니다.",
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
      curriculum: "1. 디지털 도구 소개\n2. 실습\n3. 적용 사례",
    });
    console.log("Sample courses created");
  }

  // Create sample notices - 개별 INSERT로 분리
  const existingNotices = await db.select().from(notices).limit(1);
  if (existingNotices.length === 0) {
    await db.insert(notices).values({
      title: "2025년 상반기 연수 일정 공지",
      content:
        "2025년 상반기 연수 일정이 확정되었습니다. 자세한 내용은 첨부파일을 확인해주세요.\n\n주요 일정:\n- 신청 기간: 2025년 3월 1일 ~ 3월 31일\n- 연수 기간: 2025년 4월 1일 ~ 6월 30일\n- 문의: 055-772-2226",
      category: "공지",
      authorId: 1,
      isImportant: true,
    });

    await db.insert(notices).values({
      title: "온라인 연수 시스템 점검 안내",
      content:
        "시스템 안정성 향상을 위한 정기 점검을 실시합니다.\n\n점검 일시: 2025년 6월 21일(토) 02:00 ~ 06:00\n점검 내용: 서버 업그레이드 및 보안 패치\n\n점검 시간 중에는 일시적으로 서비스 이용이 제한될 수 있습니다.",
      category: "시스템",
      authorId: 1,
      isImportant: false,
    });

    await db.insert(notices).values({
      title: "신규 교육과정 개설 안내",
      content:
        "2025년 하반기 신규 교육과정이 개설됩니다.\n\n- AI 활용 교육방법론\n- 메타버스 교육 플랫폼 활용\n- 디지털 교수설계\n\n자세한 내용은 교육과정 페이지에서 확인하세요.",
      category: "교육",
      authorId: 1,
      isImportant: true,
    });

    await db.insert(notices).values({
      title: "여름 특별 세미나 개최 공지",
      content:
        "2025년 여름 특별 세미나가 개최됩니다.\n\n주제: 포스트 코로나 시대의 교육 패러다임\n일시: 2025년 7월 15일(화) 14:00\n장소: 서울대학교 교육종합연구원\n\n사전 등록이 필요하며, 선착순 200명까지 참가 가능합니다.",
      category: "세미나",
      authorId: 1,
      isImportant: false,
    });

    await db.insert(notices).values({
      title: "교육비 지원 프로그램 안내",
      content:
        "교사 대상 교육비 지원 프로그램을 실시합니다.\n\n지원 대상: 현직 교사\n지원 금액: 교육비의 50% (최대 10만원)\n신청 기간: 2025년 6월 1일 ~ 6월 30일\n\n자세한 신청 방법은 공지사항을 참고하세요.",
      category: "지원",
      authorId: 1,
      isImportant: true,
    });

    await db.insert(notices).values({
      title: "모바일 앱 출시 예정",
      content:
        "더욱 편리한 학습을 위한 모바일 앱이 곧 출시됩니다.\n\n주요 기능:\n- 언제 어디서나 수강 가능\n- 오프라인 다운로드 지원\n- 학습 진도 관리\n\n출시일: 2025년 8월 예정",
      category: "서비스",
      authorId: 1,
      isImportant: false,
    });
    console.log("Sample notices created");
  }

  // Create sample seminars - 개별 INSERT로 분리
  console.log("Checking existing seminars...");
  const existingSeminars = await db.select().from(seminars);
  console.log("Existing seminars count:", existingSeminars.length);

  // 기존 세미나에 프로그램 일정 업데이트
  if (existingSeminars.length > 0) {
    console.log(
      "Updating existing seminars with program schedules and providerId...",
    );

    // 먼저 기관 사용자 생성
    const businessUser = await db
      .select()
      .from(users)
      .where(eq(users.username, "decom"))
      .limit(1);
    let businessUserId = 1; // 기본값은 admin

    if (businessUser.length === 0) {
      // 기관 사용자 생성
      const newBusinessUser = await db
        .insert(users)
        .values({
          username: "decom",
          email: "decom2soft@gmail.com",
          password: await hashPassword("12345"),
          name: "한국교육연구원",
          phone: "02-1234-5678",
          userType: "business",
          role: "business",
          organizationName: "한국교육연구원",
          businessNumber: "123-45-67890",
          representativeName: "김대표",
          address: "서울시 강남구 테헤란로 123",
          isApproved: true,
          isActive: true,
        })
        .returning();
      businessUserId = newBusinessUser[0].id;
      console.log("Business user created with ID:", businessUserId);
    } else {
      businessUserId = businessUser[0].id;
    }

    const programSchedules = [
      // 첫 번째 세미나용 프로그램 일정
      [
        {
          id: "1",
          time: "09:00",
          title: "개회식 및 환영사",
          description: "한국교육학회장 환영사 및 개회식 진행",
          speaker: "김교육 학회장",
          location: "대강당",
          type: "session",
        },
        {
          id: "2",
          time: "09:30",
          title: "기조강연: AI 시대의 교육 패러다임",
          description: "인공지능 시대에 맞는 새로운 교육 방향성 제시",
          speaker: "이AI 교수 (서울대)",
          location: "대강당",
          type: "session",
        },
        {
          id: "3",
          time: "10:30",
          title: "커피 브레이크",
          description: "참가자 간 네트워킹 시간",
          location: "로비",
          type: "break",
        },
        {
          id: "4",
          time: "11:00",
          title: "세션 1: 디지털 교육 혁신",
          description: "디지털 기술을 활용한 교육 혁신 사례 발표",
          speaker: "박디지털 박사",
          location: "제1세미나실",
          type: "session",
        },
        {
          id: "5",
          time: "12:00",
          title: "점심식사",
          description: "한식 뷔페 제공",
          location: "식당",
          type: "meal",
        },
        {
          id: "6",
          time: "13:30",
          title: "세션 2: 미래 교육과정 설계",
          description: "2030년을 대비한 교육과정 설계 방안",
          speaker: "최미래 교수",
          location: "제2세미나실",
          type: "session",
        },
        {
          id: "7",
          time: "15:00",
          title: "네트워킹 세션",
          description: "참가자 간 경험 공유 및 네트워킹",
          location: "라운지",
          type: "networking",
        },
      ],
      // 두 번째 세미나용 프로그램 일정
      [
        {
          id: "1",
          time: "10:00",
          title: "글로벌 교육 현황 개관",
          description: "세계 각국의 디지털 교육 현황과 트렌드",
          speaker: "Dr. John Smith (MIT)",
          location: "온라인 메인홀",
          type: "session",
        },
        {
          id: "2",
          time: "11:00",
          title: "AI 기반 개인화 학습",
          description: "인공지능을 활용한 맞춤형 학습 시스템",
          speaker: "Prof. Sarah Johnson (Stanford)",
          location: "온라인 메인홀",
          type: "session",
        },
        {
          id: "3",
          time: "12:00",
          title: "휴식 시간",
          description: "온라인 브레이크아웃 룸에서 자유 토론",
          location: "브레이크아웃 룸",
          type: "break",
        },
        {
          id: "4",
          time: "13:00",
          title: "VR/AR 교육 활용 사례",
          description: "가상현실과 증강현실을 활용한 교육 혁신",
          speaker: "김가상 박사 (KAIST)",
          location: "온라인 세션룸 A",
          type: "session",
        },
        {
          id: "5",
          time: "14:30",
          title: "글로벌 네트워킹",
          description: "전 세계 교육자들과의 네트워킹 세션",
          location: "온라인 네트워킹 룸",
          type: "networking",
        },
      ],
      // 세 번째 세미나용 프로그램 일정
      [
        {
          id: "1",
          time: "14:00",
          title: "심포지엄 개막식",
          description: "AI 교육의 현재와 미래에 대한 개막 세션",
          speaker: "정AI 원장",
          location: "컨벤션홀 A",
          type: "session",
        },
        {
          id: "2",
          time: "14:30",
          title: "패널 토론: AI 윤리와 교육",
          description: "AI 시대 교육에서의 윤리적 고려사항",
          speaker: "전문가 패널 5명",
          location: "컨벤션홀 A",
          type: "session",
        },
        {
          id: "3",
          time: "16:00",
          title: "다과 시간",
          description: "케이크와 음료 제공",
          location: "로비",
          type: "meal",
        },
        {
          id: "4",
          time: "16:30",
          title: "AI 교육 도구 체험",
          description: "최신 AI 교육 도구 직접 체험",
          speaker: "기술 전문가팀",
          location: "체험존",
          type: "session",
        },
      ],
      // 네 번째 세미나용 프로그램 일정
      [
        {
          id: "1",
          time: "13:30",
          title: "창의교육 이론 소개",
          description: "창의교육의 기본 원리와 방법론",
          speaker: "송창의 교수",
          location: "워크샵룸 1",
          type: "session",
        },
        {
          id: "2",
          time: "14:30",
          title: "실습 1: 브레인스토밍 기법",
          description: "효과적인 브레인스토밍 방법 실습",
          speaker: "김실습 강사",
          location: "워크샵룸 1",
          type: "session",
        },
        {
          id: "3",
          time: "15:30",
          title: "간식 시간",
          description: "에너지 충전을 위한 간식 제공",
          location: "휴게실",
          type: "break",
        },
        {
          id: "4",
          time: "16:00",
          title: "실습 2: 창의적 문제해결",
          description: "창의적 사고를 통한 문제해결 실습",
          speaker: "이문제 박사",
          location: "워크샵룸 2",
          type: "session",
        },
        {
          id: "5",
          time: "17:00",
          title: "성과 공유 및 마무리",
          description: "워크샵 결과 발표 및 경험 공유",
          location: "워크샵룸 1",
          type: "networking",
        },
      ],
      // 다섯 번째 세미나용 프로그램 일정
      [
        {
          id: "1",
          time: "09:30",
          title: "국제행사 개막식",
          description: "각국 교육부 장관 참석 개막식",
          speaker: "교육부 장관",
          location: "컨벤션센터 메인홀",
          type: "session",
        },
        {
          id: "2",
          time: "10:30",
          title: "주제발표: 핀란드 교육정책",
          description: "핀란드의 혁신적 교육정책 사례",
          speaker: "Dr. Mika Virtanen (핀란드 교육부)",
          location: "컨벤션센터 메인홀",
          type: "session",
        },
        {
          id: "3",
          time: "12:00",
          title: "국제 교류 점심",
          description: "각국 대표단과의 교류 점심식사",
          location: "VIP 식당",
          type: "meal",
        },
        {
          id: "4",
          time: "14:00",
          title: "분과세션: 아시아 교육정책",
          description: "아시아 각국의 교육정책 비교 분석",
          speaker: "아시아 교육전문가 패널",
          location: "세미나실 A",
          type: "session",
        },
        {
          id: "5",
          time: "15:30",
          title: "문화공연 및 네트워킹",
          description: "한국 전통문화 공연과 국제 네트워킹",
          location: "문화공연장",
          type: "networking",
        },
      ],
      // 여섯 번째 세미나용 프로그램 일정
      [
        {
          id: "1",
          time: "15:00",
          title: "온라인 교육의 현재와 미래",
          description: "포스트 코로나 시대 온라인 교육 트렌드",
          speaker: "박온라인 교수",
          location: "Zoom 메인룸",
          type: "session",
        },
        {
          id: "2",
          time: "16:00",
          title: "효과적인 온라인 수업 설계",
          description: "학습자 참여를 높이는 온라인 수업 설계법",
          speaker: "김설계 박사",
          location: "Zoom 메인룸",
          type: "session",
        },
        {
          id: "3",
          time: "17:00",
          title: "온라인 도구 활용법",
          description: "다양한 온라인 교육 도구 실습",
          speaker: "이도구 전문가",
          location: "Zoom 실습룸",
          type: "session",
        },
        {
          id: "4",
          time: "18:00",
          title: "Q&A 및 경험 공유",
          description: "참가자들의 질문 답변 및 경험 공유",
          location: "Zoom 토론룸",
          type: "networking",
        },
      ],
    ];

    // 기존 세미나들에 프로그램 일정 업데이트
    for (
      let i = 0;
      i < Math.min(existingSeminars.length, programSchedules.length);
      i++
    ) {
      const seminar = existingSeminars[i];
      const schedule = programSchedules[i];

      await db
        .update(seminars)
        .set({ programSchedule: schedule, providerId: businessUserId })
        .where(eq(seminars.id, seminar.id));

      console.log(
        `Updated seminar ${seminar.id} with program schedule and providerId`,
      );
    }

    console.log("Program schedules updated for existing seminars");
  }

  if (existingSeminars.length < 6) {
    console.log("Creating additional sample seminars...");

    // 기존 세미나가 있을 수 있으므로 중복 방지를 위해 제목으로 확인
    const existingTitles = existingSeminars.map((s) => s.title);

    const newSeminarData = [
      {
        title: "2025 한국교육학회 춘계학술대회",
        description:
          "한국교육학회에서 주최하는 춘계학술대회입니다. 최신 교육 트렌드와 연구 성과를 공유합니다.",
        date: new Date("2025-07-15T09:00:00"),
        location: "서울대학교 교육종합연구원",
        type: "교육학회",
        maxParticipants: 500,
        imageUrl:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop",
      },
      {
        title: "디지털 교육혁신 국제 컨퍼런스",
        description:
          "AI와 디지털 기술을 활용한 교육 혁신 방안을 논의하는 국제 컨퍼런스입니다.",
        date: new Date("2025-08-10T10:00:00"),
        location: "온라인",
        type: "국제컨퍼런스",
        maxParticipants: 1200,
        imageUrl:
          "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=200&fit=crop",
      },
      {
        title: "AI와 교육의 미래 심포지엄",
        description:
          "인공지능 시대의 교육 방향성과 미래 교육 패러다임을 탐구합니다.",
        date: new Date("2025-08-25T14:00:00"),
        location: "서울 COEX",
        type: "심포지엄",
        maxParticipants: 300,
        imageUrl:
          "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop",
      },
      {
        title: "창의교육 실무 워크샵",
        description: "창의적 사고력 향상을 위한 실무 중심의 워크샵입니다.",
        date: new Date("2025-09-05T13:30:00"),
        location: "경기대학교",
        type: "워크샵",
        maxParticipants: 150,
        imageUrl:
          "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop",
      },
      {
        title: "글로벌 교육정책 국제행사",
        description:
          "세계 각국의 교육정책 동향과 우수 사례를 공유하는 국제행사입니다.",
        date: new Date("2025-09-20T09:30:00"),
        location: "부산 BEXCO",
        type: "국제행사",
        maxParticipants: 800,
        imageUrl:
          "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&h=200&fit=crop",
      },
      {
        title: "온라인 수업설계 세미나",
        description:
          "효과적인 온라인 수업 설계와 운영 방법을 다루는 세미나입니다.",
        date: new Date("2025-10-10T15:00:00"),
        location: "온라인",
        type: "온라인세미나",
        maxParticipants: 2000,
        imageUrl:
          "https://images.unsplash.com/photo-1552581234-26160f608093?w=300&h=200&fit=crop",
      },
    ];

    for (const seminar of newSeminarData) {
      if (!existingTitles.includes(seminar.title)) {
        await db.insert(seminars).values(seminar);
        console.log(`Created seminar: ${seminar.title}`);
      }
    }

    console.log("Sample seminars creation completed");
  } else {
    console.log("Sufficient seminars already exist, skipping...");
  }

  console.log("Database seeding completed");
}

// 직접 실행 시 시딩 수행 - Windows 호환성 개선
seedDatabase().catch(console.error);
