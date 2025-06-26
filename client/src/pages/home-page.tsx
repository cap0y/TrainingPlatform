import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Users,
  Award,
  Star,
  ArrowRight,
  Calendar,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  HelpCircle,
  FileText,
  Settings,
  Eye,
  Zap,
  Target,
  Globe,
  TrendingUp,
  CheckCircle,
  Bell,
  Headphones,
  Clock,
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CourseCard from "@/components/course-card";
import ChatWidget from "@/components/chat-widget";
import NotificationPanel from "@/components/notification-panel";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  level: string;
  credit: number;
  price: number;
  discountPrice?: number;
  duration: string;
  totalHours: number;
  maxStudents: number;
  status: string;
  approvalStatus: string;
  instructorId: number;
  objectives?: string;
  requirements?: string;
  materials?: string;
  curriculum?: string;
  imageUrl?: string;
  rating?: number;
  createdAt: string;
  updatedAt?: string;
  enrolledCount?: number;
  startDate?: string;
  endDate?: string;
  reviewCount?: number;
}

interface Notice {
  id: number;
  title: string;
  category: string;
  createdAt: string;
  isImportant: boolean;
  views?: number;
}

interface Seminar {
  id: number;
  title: string;
  description?: string | null;
  date: Date | string;
  location?: string | null;
  type: string;
  maxParticipants?: number | null;
  currentParticipants?: number | null;
  imageUrl?: string | null;
  isActive?: boolean | null;
  createdAt?: Date | string | null;
}

interface OverseasProgram {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
  type: string;
  maxParticipants?: number;
  currentParticipants?: number;
  price: number;
  duration?: string;
  imageUrl?: string;
  isActive?: boolean;
  createdAt?: string;
}

export default function HomePage() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("popular");
  const [selectedSeminarCategory, setSelectedSeminarCategory] =
    useState("전체");
  const [selectedOverseasCategory, setSelectedOverseasCategory] =
    useState("전체");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedEducationCategory, setSelectedEducationCategory] =
    useState("전체");

  const { data: coursesData, isLoading: coursesLoading } = useQuery<{
    courses: Course[];
    total: number;
  }>({
    queryKey: ["/api/courses"],
  });

  const { data: noticesData } = useQuery<{ notices: Notice[] }>({
    queryKey: ["/api/notices"],
  });

  const { data: seminarsData, isLoading: seminarsLoading } = useQuery<
    Seminar[]
  >({
    queryKey: ["/api/seminars"],
  });

  const { data: overseasData, isLoading: overseasLoading } = useQuery<{
    programs: OverseasProgram[];
    total: number;
  }>({
    queryKey: ["/api/overseas-programs"],
  });

  const notices = noticesData?.notices || [];
  const seminars = seminarsData || [];
  const overseas = Array.isArray(overseasData?.programs)
    ? overseasData.programs
    : [];
  const courses = coursesData?.courses || [];

  // Filter seminars based on selected category
  const filteredSeminars =
    selectedSeminarCategory === "전체"
      ? seminars
      : seminars.filter((seminar) => seminar.type === selectedSeminarCategory);

  // Filter overseas programs based on selected category
  const filteredOverseas =
    selectedOverseasCategory === "전체"
      ? overseas
      : Array.isArray(overseas)
        ? overseas.filter(
            (program) => program.type === selectedOverseasCategory,
          )
        : [];

  // Filter courses for different tabs
  const getPopularCourses = () => {
    // 실시간 인기: 수강 중인 인원수 기준으로 정렬
    return courses
      .filter(
        (course) =>
          course.status === "active" && course.approvalStatus === "approved",
      )
      .sort((a, b) => {
        const enrolledA = a.enrolledCount || 0;
        const enrolledB = b.enrolledCount || 0;
        return enrolledB - enrolledA;
      })
      .slice(0, 10);
  };

  const getCategoryCourses = () => {
    // 분야별 인기: 각 카테고리에서 가장 인기 있는 과정 1개씩 선별
    const categories = [
      "교육과정",
      "자격증",
      "전문성강화",
      "교육평가",
      "교수법",
      "융합교육",
    ];
    const coursesByCategory: Course[] = [];

    categories.forEach((category) => {
      const categoryTopCourse = courses
        .filter(
          (course) =>
            course.category === category &&
            course.status === "active" &&
            course.approvalStatus === "approved",
        )
        .sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0))[0];

      if (categoryTopCourse) {
        coursesByCategory.push(categoryTopCourse);
      }
    });

    return coursesByCategory.slice(0, 10);
  };

  const getUpcomingCourses = () => {
    // 신규 과정: 최근 등록된 과정들을 생성일 기준으로 정렬
    return courses
      .filter(
        (course) =>
          course.status === "active" && course.approvalStatus === "approved",
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 10);
  };

  const popularCourses = getPopularCourses();
  const categoryCourses = getCategoryCourses();
  const upcomingCourses = getUpcomingCourses();

  return (
    <div className="min-h-screen bg-white">
      <Header onNotificationClick={() => setShowNotifications(true)} />
      {/* Hero Section with Integrated Slideshow */}
      <section className="relative overflow-hidden">
        {/* Hero Content Overlay */}
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <div className="relative z-20 container mx-auto px-4 py-12 pt-[80px] pb-[80px]">
          <div className="max-w-2xl text-left text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              전문가가 되는 <span className="text-yellow-300">첫걸음</span>
            </h1>
            <p className="text-lg md:text-xl mb-6 text-gray-100 leading-relaxed">
              지누켐과 함께하는 체계적인 연수 프로그램으로
              <br />
              여러분의 전문성을 한 단계 높여보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 text-base font-semibold"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  연수과정 보기
                </Button>
              </Link>
              <Link href="/seminars">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white bg-white/20 px-6 py-3 text-base font-semibold"
                >
                  세미나 신청
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Background Slideshow */}
        <div className="absolute inset-0 z-0">
          <div className="relative overflow-hidden h-full">
            <div className="flex animate-slide h-screen">
              {/* Slide 1 - 교육과정 개정안 */}
              <div className="min-w-full relative h-full bg-transparent">
                <img
                  src="/uploads/images/4.jpg"
                  alt="교육과정 개정안 이해와 적용"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Slide 2 - 디지털 교수법 */}
              <div className="min-w-full relative h-full bg-transparent">
                <img
                  src="/uploads/images/5.jpg"
                  alt="디지털 교수법 심화과정"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Slide 3 - AI 교육혁신 */}
              <div className="min-w-full relative h-full bg-transparent">
                <img
                  src="/uploads/images/6.jpg"
                  alt="AI 시대의 교육 혁신"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Slide 4 - 평가방법 개선 */}
              <div className="min-w-full relative h-full bg-transparent">
                <img
                  src="/uploads/images/10.jpg"
                  alt="창의적 평가방법 개발"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Slide 5 - 학습자 중심 교육 */}
              <div className="min-w-full relative h-full bg-transparent">
                <img
                  src="/uploads/images/12.jpg"
                  alt="학습자 중심 교육방법론"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Slide 6 - 창의융합교육 */}
              <div className="min-w-full relative h-full bg-transparent">
                <img
                  src="/uploads/images/14.jpg"
                  alt="창의융합교육 실무과정"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Slide 7 - 다문화교육 */}
              <div className="min-w-full relative h-full bg-transparent">
                <img
                  src="/uploads/images/4.jpg"
                  alt="다문화교육 전문가과정"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Slide 8 - 특수교육 */}
              <div className="min-w-full relative h-full bg-transparent">
                <img
                  src="/uploads/images/5.jpg"
                  alt="특수교육 지원 전문과정"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Slide 9 - 진로진학상담 */}
              <div className="min-w-full relative h-full bg-transparent">
                <img
                  src="/uploads/images/6.jpg"
                  alt="진로진학상담 전문과정"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Slide 10 - 학교안전교육 */}
              <div className="min-w-full relative h-full bg-transparent">
                <img
                  src="/uploads/images/10.jpg"
                  alt="학교안전교육 관리자과정"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Slide indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-white bg-opacity-50 hover:bg-opacity-100 transition-opacity cursor-pointer"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Categories Section with Circular Images */}
      <section className="py-2 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
            교육 분야
          </h2>

          {/* Mobile: Horizontal scroll */}
          <div className="flex lg:hidden overflow-x-auto space-x-6 pb-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <Link href="/training-courses?category=법정의무교육">
              <div className="flex-shrink-0 text-center cursor-pointer">
                <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo0.jpg"
                    alt="법정의무교육"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-10"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                  법정교육
                </div>
              </div>
            </Link>

            <Link href="/professional-development">
              <div className="flex-shrink-0 text-center cursor-pointer">
                <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo1.jpg"
                    alt="전문성강화교육"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-purple-600 bg-opacity-10"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                  전문성강화
                </div>
              </div>
            </Link>

            <Link href="/certificate-courses">
              <div className="flex-shrink-0 text-center cursor-pointer">
                <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo2.jpg"
                    alt="자격증과정"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-green-600 bg-opacity-10"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                  자격증
                </div>
              </div>
            </Link>

            <Link href="/seminars">
              <div className="flex-shrink-0 text-center cursor-pointer">
                <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo3.jpg"
                    alt="세미나"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-yellow-600 bg-opacity-10"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                  세미나
                </div>
              </div>
            </Link>

            <Link href="/study-abroad">
              <div className="flex-shrink-0 text-center cursor-pointer">
                <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo4.jpg"
                    alt="해외연수"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-red-600 bg-opacity-10"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                  해외연수
                </div>
              </div>
            </Link>

            <Link href="/help">
              <div className="flex-shrink-0 text-center cursor-pointer">
                <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo5.jpg"
                    alt="고객센터"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-indigo-600 bg-opacity-10"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                  고객센터
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden lg:flex lg:justify-center">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 max-w-4xl">
              <Link href="/training-courses?category=법정의무교육">
                <div className="text-center cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo0.jpg"
                      alt="법정의무교육"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-10"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm">
                    법정교육
                  </div>
                </div>
              </Link>

              <Link href="/professional-development">
                <div className="text-center cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo1.jpg"
                      alt="전문성강화교육"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-purple-600 bg-opacity-10"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm">
                    전문성강화
                  </div>
                </div>
              </Link>

              <Link href="/certificate-courses">
                <div className="text-center cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo2.jpg"
                      alt="자격증과정"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-green-600 bg-opacity-10"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm">
                    자격증
                  </div>
                </div>
              </Link>

              <Link href="/seminars">
                <div className="text-center cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo3.jpg"
                      alt="세미나"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-yellow-600 bg-opacity-10"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm">
                    세미나
                  </div>
                </div>
              </Link>

              <Link href="/study-abroad">
                <div className="text-center cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo4.jpg"
                      alt="해외연수"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-red-600 bg-opacity-10"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm">
                    해외연수
                  </div>
                </div>
              </Link>

              <Link href="/help">
                <div className="text-center cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo5.jpg"
                      alt="고객센터"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-indigo-600 bg-opacity-10"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm">
                    고객센터
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Popular Courses with Tabs */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                인기 연수과정
              </h2>
              <p className="text-gray-600">
                실시간으로 업데이트되는 인기 연수과정을 확인해보세요
              </p>
            </div>
            <Link href="/courses">
              <Button variant="outline" size="lg">
                전체 과정 보기
              </Button>
            </Link>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex justify-center mb-4">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger
                  value="popular"
                  className="flex items-center space-x-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>실시간 인기</span>
                </TabsTrigger>
                <TabsTrigger
                  value="category"
                  className="flex items-center space-x-2"
                >
                  <Target className="h-4 w-4" />
                  <span>분야별 추천</span>
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className="flex items-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>신규 개설</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="popular" className="space-y-6">
              <div className="overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex space-x-4 animate-scroll-left hover:[animation-play-state:paused] w-max">
                  {coursesLoading ? (
                    Array.from({ length: 10 }, (_, i) => (
                      <Card
                        key={i}
                        className="flex-shrink-0 w-80 h-[480px] flex flex-col overflow-hidden"
                      >
                        <div className="w-full h-40 bg-gray-200 animate-pulse"></div>
                        <CardContent className="p-4">
                          <div className="h-5 bg-gray-200 rounded animate-pulse mb-3"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        </CardContent>
                      </Card>
                    ))
                  ) : popularCourses.length === 0 ? (
                    <div className="w-full text-center py-8 text-gray-500">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>등록된 연수과정이 없습 ��다.</p>
                    </div>
                  ) : (
                    // 원본 과정들과 복사본을 연결하여 무한 스크롤 효과
                    [...popularCourses, ...popularCourses].map(
                      (course, index) => (
                        <Card
                          key={`${course.id}-${index}`}
                          className="group hover:shadow-lg transition-all duration-300 overflow-hidden flex-shrink-0 w-80 h-[430px] flex flex-col"
                        >
                          <div className="relative">
                            <img
                              src={
                                course.imageUrl &&
                                course.imageUrl !== "/api/placeholder/400/250"
                                  ? course.imageUrl
                                  : "/uploads/images/1.jpg"
                              }
                              alt={course.title}
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const fallbackImages = [
                                  "/uploads/images/1.jpg",
                                  "/uploads/images/4.jpg",
                                  "/uploads/images/5.jpg",
                                ];
                                const randomFallback =
                                  fallbackImages[
                                    Math.floor(
                                      Math.random() * fallbackImages.length,
                                    )
                                  ];
                                e.currentTarget.src = randomFallback;
                              }}
                            />
                            <div className="absolute top-2 right-2">
                              <Badge
                                variant="outline"
                                className="bg-white/90 text-xs"
                              >
                                {course.category}
                              </Badge>
                            </div>
                            {course.discountPrice && (
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-red-500 text-white text-xs">
                                  {Math.round(
                                    ((course.price - course.discountPrice) /
                                      course.price) *
                                      100,
                                  )}
                                  % 할인
                                </Badge>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4 flex flex-col flex-grow">
                            <h3 className="font-semibold text-base mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {course.title}
                            </h3>

                            {/* 연수 기본 정보 */}
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center text-xs text-gray-600">
                                <Calendar className="h-3 w-3 mr-1.5" />
                                <span>
                                  연수기간:{" "}
                                  {course.startDate && course.endDate
                                    ? `${new Date(course.startDate).toLocaleDateString("ko-KR")} - ${new Date(course.endDate).toLocaleDateString("ko-KR")}`
                                    : "2025.07.01 - 2025.08.30"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <div className="flex items-center">
                                  <Award className="h-3 w-3 mr-1.5" />
                                  <span>학점: {course.credit}학점</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1.5" />
                                  <span>
                                    총 학습시간: {course.totalHours || 45}시간
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center text-xs text-gray-600">
                                <Target className="h-3 w-3 mr-1.5" />
                                <span>
                                  난이도:{" "}
                                  {course.level === "beginner"
                                    ? "기초"
                                    : course.level === "intermediate"
                                      ? "중급"
                                      : course.level === "advanced"
                                        ? "고급"
                                        : "중급"}
                                </span>
                              </div>
                            </div>

                            {/* 평점 및 수강 정보 */}
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium">
                                    {course.rating || 4.8}
                                  </span>
                                </div>
                                <span>({course.reviewCount || 0}개 후기)</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>
                                  /{course.enrolledCount || 145}명 수강중
                                </span>
                              </div>
                            </div>

                            {/* 가격 정보 */}
                            <div className="mb-4">
                              {course.discountPrice ? (
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg font-bold text-blue-600">
                                    {new Intl.NumberFormat("ko-KR").format(
                                      course.discountPrice,
                                    )}
                                    원
                                  </span>
                                  <span className="text-sm text-gray-500 line-through">
                                    {new Intl.NumberFormat("ko-KR").format(
                                      course.price,
                                    )}
                                    원
                                  </span>
                                </div>
                              ) : (
                                <span className="text-lg font-bold text-blue-600">
                                  {new Intl.NumberFormat("ko-KR").format(
                                    course.price,
                                  )}
                                  원
                                </span>
                              )}
                            </div>

                            <div className="mt-1">
                              <Link href={`/courses/${course.id}`}>
                                <Button className="w-full text-sm py-2">
                                  수강신청
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ),
                    )
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="category" className="space-y-6">
              <div className="overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex space-x-4 animate-scroll-left hover:[animation-play-state:paused] w-max">
                  {coursesLoading ? (
                    Array.from({ length: 10 }, (_, i) => (
                      <Card
                        key={i}
                        className="flex-shrink-0 w-80 h-[480px] flex flex-col overflow-hidden"
                      >
                        <div className="w-full h-40 bg-gray-200 animate-pulse"></div>
                        <CardContent className="p-4">
                          <div className="h-5 bg-gray-200 rounded animate-pulse mb-3"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        </CardContent>
                      </Card>
                    ))
                  ) : categoryCourses.length === 0 ? (
                    <div className="w-full text-center py-8 text-gray-500">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>등록된 연수과정이 없습니다.</p>
                    </div>
                  ) : (
                    // 원본 과정들과 복사본을 연결하여 무한 스크롤 효과
                    [...categoryCourses, ...categoryCourses].map(
                      (course, index) => (
                        <Card
                          key={`${course.id}-${index}`}
                          className="group hover:shadow-lg transition-all duration-300 overflow-hidden flex-shrink-0 w-80 h-[480px] flex flex-col"
                        >
                          <div className="relative">
                            <img
                              src={
                                course.imageUrl &&
                                course.imageUrl !== "/api/placeholder/400/250"
                                  ? course.imageUrl
                                  : "/uploads/images/5.jpg"
                              }
                              alt={course.title}
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const fallbackImages = [
                                  "/uploads/images/1.jpg",
                                  "/uploads/images/4.jpg",
                                  "/uploads/images/5.jpg",
                                ];
                                const randomFallback =
                                  fallbackImages[
                                    Math.floor(
                                      Math.random() * fallbackImages.length,
                                    )
                                  ];
                                e.currentTarget.src = randomFallback;
                              }}
                            />
                            <div className="absolute top-2 right-2">
                              <Badge
                                variant="outline"
                                className="bg-white/90 text-xs"
                              >
                                {course.category}
                              </Badge>
                            </div>
                            {course.discountPrice && (
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-red-500 text-white text-xs">
                                  {Math.round(
                                    ((course.price - course.discountPrice) /
                                      course.price) *
                                      100,
                                  )}
                                  % 할인
                                </Badge>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4 flex flex-col flex-grow">
                            <h3 className="font-semibold text-base mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {course.title}
                            </h3>

                            {/* 연수 기본 정보 */}
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center text-xs text-gray-600">
                                <Calendar className="h-3 w-3 mr-1.5" />
                                <span>
                                  연수기간:{" "}
                                  {course.startDate && course.endDate
                                    ? `${new Date(course.startDate).toLocaleDateString("ko-KR")} - ${new Date(course.endDate).toLocaleDateString("ko-KR")}`
                                    : "2025.07.01 - 2025.08.30"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <div className="flex items-center">
                                  <Award className="h-3 w-3 mr-1.5" />
                                  <span>학점: {course.credit}학점</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1.5" />
                                  <span>
                                    총 학습시간: {course.totalHours || 45}시간
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center text-xs text-gray-600">
                                <Target className="h-3 w-3 mr-1.5" />
                                <span>
                                  난이도:{" "}
                                  {course.level === "beginner"
                                    ? "기초"
                                    : course.level === "intermediate"
                                      ? "중급"
                                      : course.level === "advanced"
                                        ? "고급"
                                        : "중급"}
                                </span>
                              </div>
                            </div>

                            {/* 평점 및 수강 정보 */}
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium">
                                    {course.rating || 4.8}
                                  </span>
                                </div>
                                <span>({course.reviewCount || 0}개 후기)</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>
                                  /{course.enrolledCount || 145}명 수강중
                                </span>
                              </div>
                            </div>

                            {/* 가격 정보 */}
                            <div className="mb-4">
                              {course.discountPrice ? (
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg font-bold text-blue-600">
                                    {new Intl.NumberFormat("ko-KR").format(
                                      course.discountPrice,
                                    )}
                                    원
                                  </span>
                                  <span className="text-sm text-gray-500 line-through">
                                    {new Intl.NumberFormat("ko-KR").format(
                                      course.price,
                                    )}
                                    원
                                  </span>
                                </div>
                              ) : (
                                <span className="text-lg font-bold text-blue-600">
                                  {new Intl.NumberFormat("ko-KR").format(
                                    course.price,
                                  )}
                                  원
                                </span>
                              )}
                            </div>

                            <div className="mt-auto">
                              <Link href={`/courses/${course.id}`}>
                                <Button className="w-full text-sm py-2">
                                  수강신청
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ),
                    )
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6">
              <div className="overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex space-x-4 animate-scroll-left hover:[animation-play-state:paused] w-max">
                  {coursesLoading ? (
                    Array.from({ length: 10 }, (_, i) => (
                      <Card
                        key={i}
                        className="flex-shrink-0 w-80 h-[480px] flex flex-col overflow-hidden"
                      >
                        <div className="w-full h-40 bg-gray-200 animate-pulse"></div>
                        <CardContent className="p-4">
                          <div className="h-5 bg-gray-200 rounded animate-pulse mb-3"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        </CardContent>
                      </Card>
                    ))
                  ) : upcomingCourses.length === 0 ? (
                    <div className="w-full text-center py-8 text-gray-500">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>등록된 연수과정이 없습니다.</p>
                    </div>
                  ) : (
                    // 원본 과정들과 복사본을 연결하여 무한 스크롤 효과
                    [...upcomingCourses, ...upcomingCourses].map(
                      (course, index) => (
                        <Card
                          key={`${course.id}-${index}`}
                          className="group hover:shadow-lg transition-all duration-300 overflow-hidden flex-shrink-0 w-80 h-[480px] flex flex-col"
                        >
                          <div className="relative">
                            <img
                              src={
                                course.imageUrl &&
                                course.imageUrl !== "/api/placeholder/400/250"
                                  ? course.imageUrl
                                  : "/uploads/images/12.jpg"
                              }
                              alt={course.title}
                              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const fallbackImages = [
                                  "/uploads/images/1.jpg",
                                  "/uploads/images/4.jpg",
                                  "/uploads/images/5.jpg",
                                  "/uploads/images/6.jpg",
                                  "/uploads/images/12.jpg",
                                ];
                                const randomFallback =
                                  fallbackImages[
                                    Math.floor(
                                      Math.random() * fallbackImages.length,
                                    )
                                  ];
                                e.currentTarget.src = randomFallback;
                              }}
                            />
                            <div className="absolute top-2 right-2">
                              <Badge
                                variant="outline"
                                className="bg-white/90 text-xs"
                              >
                                {course.category}
                              </Badge>
                            </div>
                            {course.discountPrice && (
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-red-500 text-white text-xs">
                                  {Math.round(
                                    ((course.price - course.discountPrice) /
                                      course.price) *
                                      100,
                                  )}
                                  % 할인
                                </Badge>
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4 flex flex-col flex-grow">
                            <h3 className="font-semibold text-base mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {course.title}
                            </h3>

                            {/* 연수 기본 정보 */}
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center text-xs text-gray-600">
                                <Calendar className="h-3 w-3 mr-1.5" />
                                <span>
                                  연수기간:{" "}
                                  {course.startDate && course.endDate
                                    ? `${new Date(course.startDate).toLocaleDateString("ko-KR")} - ${new Date(course.endDate).toLocaleDateString("ko-KR")}`
                                    : "2025.07.01 - 2025.08.30"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <div className="flex items-center">
                                  <Award className="h-3 w-3 mr-1.5" />
                                  <span>학점: {course.credit}학점</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1.5" />
                                  <span>
                                    총 학습시간: {course.totalHours || 45}시간
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center text-xs text-gray-600">
                                <Target className="h-3 w-3 mr-1.5" />
                                <span>
                                  난이도:{" "}
                                  {course.level === "beginner"
                                    ? "기초"
                                    : course.level === "intermediate"
                                      ? "중급"
                                      : course.level === "advanced"
                                        ? "고급"
                                        : "중급"}
                                </span>
                              </div>
                            </div>

                            {/* 평점 및 수강 정보 */}
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium">
                                    {course.rating || 4.8}
                                  </span>
                                </div>
                                <span>({course.reviewCount || 0}개 후기)</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>
                                  /{course.enrolledCount || 145}명 수강중
                                </span>
                              </div>
                            </div>

                            {/* 가격 정보 */}
                            <div className="mb-4">
                              {course.discountPrice ? (
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg font-bold text-blue-600">
                                    {new Intl.NumberFormat("ko-KR").format(
                                      course.discountPrice,
                                    )}
                                    원
                                  </span>
                                  <span className="text-sm text-gray-500 line-through">
                                    {new Intl.NumberFormat("ko-KR").format(
                                      course.price,
                                    )}
                                    원
                                  </span>
                                </div>
                              ) : (
                                <span className="text-lg font-bold text-blue-600">
                                  {new Intl.NumberFormat("ko-KR").format(
                                    course.price,
                                  )}
                                  원
                                </span>
                              )}
                            </div>

                            <div className="mt-auto">
                              <Link href={`/courses/${course.id}`}>
                                <Button className="w-full text-sm py-2">
                                  수강신청
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ),
                    )
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      {/* Upcoming Seminars & Conferences */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                다가오는 학회 및 세미나
              </h2>
              <p className="text-gray-600">
                최신 트렌드와 실무 노하우를 공유하는 전문가 세미나
              </p>
            </div>
            <Link href="/seminars">
              <Button size="lg" variant="outline">
                모든 학회 및 세미나 보기
              </Button>
            </Link>
          </div>

          {/* Seminar Categories */}
          <div className="mb-4">
            {/* Mobile: Horizontal scroll */}
            <div className="flex lg:hidden overflow-x-auto space-x-4 pb-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div
                className={`flex-shrink-0 text-center cursor-pointer ${selectedSeminarCategory === "전체" ? "opacity-100" : "opacity-60"}`}
                onClick={() => setSelectedSeminarCategory("전체")}
              >
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  {selectedSeminarCategory === "전체" && (
                    <div className="absolute inset-0 ring-2 ring-blue-500 rounded-full"></div>
                  )}
                </div>
                <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                  전체
                </div>
              </div>

              <div
                className={`flex-shrink-0 text-center cursor-pointer ${selectedSeminarCategory === "교육학회" ? "opacity-100" : "opacity-60"}`}
                onClick={() => setSelectedSeminarCategory("교육학회")}
              >
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo3.jpg"
                    alt="교육학회"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-10"></div>
                  {selectedSeminarCategory === "교육학회" && (
                    <div className="absolute inset-0 ring-2 ring-blue-500 rounded-full"></div>
                  )}
                </div>
                <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                  교육학회
                </div>
              </div>

              <div
                className={`flex-shrink-0 text-center cursor-pointer ${selectedSeminarCategory === "AI 컨퍼런스" ? "opacity-100" : "opacity-60"}`}
                onClick={() => setSelectedSeminarCategory("AI 컨퍼런스")}
              >
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo6.jpg"
                    alt="AI 컨퍼런스"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-purple-600 bg-opacity-10"></div>
                  {selectedSeminarCategory === "AI 컨퍼런스" && (
                    <div className="absolute inset-0 ring-2 ring-purple-500 rounded-full"></div>
                  )}
                </div>
                <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                  AI 컨퍼런스
                </div>
              </div>

              <div
                className={`flex-shrink-0 text-center cursor-pointer ${selectedSeminarCategory === "워크샵" ? "opacity-100" : "opacity-60"}`}
                onClick={() => setSelectedSeminarCategory("워크샵")}
              >
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo7.jpg"
                    alt="워크샵"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-green-600 bg-opacity-10"></div>
                  {selectedSeminarCategory === "워크샵" && (
                    <div className="absolute inset-0 ring-2 ring-green-500 rounded-full"></div>
                  )}
                </div>
                <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                  워크샵
                </div>
              </div>

              <div
                className={`flex-shrink-0 text-center cursor-pointer ${selectedSeminarCategory === "심포지엄" ? "opacity-100" : "opacity-60"}`}
                onClick={() => setSelectedSeminarCategory("심포지엄")}
              >
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo8.jpg"
                    alt="심포지엄"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-orange-600 bg-opacity-10"></div>
                  {selectedSeminarCategory === "심포지엄" && (
                    <div className="absolute inset-0 ring-2 ring-orange-500 rounded-full"></div>
                  )}
                </div>
                <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                  심포지엄
                </div>
              </div>

              <div
                className={`flex-shrink-0 text-center cursor-pointer ${selectedSeminarCategory === "국제행사" ? "opacity-100" : "opacity-60"}`}
                onClick={() => setSelectedSeminarCategory("국제행사")}
              >
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo9.jpg"
                    alt="국제행사"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-red-600 bg-opacity-10"></div>
                  {selectedSeminarCategory === "국제행사" && (
                    <div className="absolute inset-0 ring-2 ring-red-500 rounded-full"></div>
                  )}
                </div>
                <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                  국제행사
                </div>
              </div>

              <div
                className={`flex-shrink-0 text-center cursor-pointer ${selectedSeminarCategory === "온라인세미나" ? "opacity-100" : "opacity-60"}`}
                onClick={() => setSelectedSeminarCategory("온라인세미나")}
              >
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo10.jpg"
                    alt="온라인세미나"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-indigo-600 bg-opacity-10"></div>
                  {selectedSeminarCategory === "온라인세미나" && (
                    <div className="absolute inset-0 ring-2 ring-indigo-500 rounded-full"></div>
                  )}
                </div>
                <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                  온라인세미나
                </div>
              </div>
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden lg:flex lg:justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 max-w-4xl">
                <div
                  className={`text-center cursor-pointer ${selectedSeminarCategory === "전체" ? "opacity-100" : "opacity-60"}`}
                  onClick={() => setSelectedSeminarCategory("전체")}
                >
                  <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Globe className="h-8 w-8 text-white" />
                    </div>
                    {selectedSeminarCategory === "전체" && (
                      <div className="absolute inset-0 ring-2 ring-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="font-medium text-gray-800 text-sm">전체</div>
                </div>

                <div
                  className={`text-center cursor-pointer ${selectedSeminarCategory === "교육학회" ? "opacity-100" : "opacity-60"}`}
                  onClick={() => setSelectedSeminarCategory("교육학회")}
                >
                  <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo3.jpg"
                      alt="교육학회"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-10"></div>
                    {selectedSeminarCategory === "교육학회" && (
                      <div className="absolute inset-0 ring-2 ring-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                    교육학회
                  </div>
                </div>

                <div
                  className={`text-center cursor-pointer ${selectedSeminarCategory === "AI 컨퍼런스" ? "opacity-100" : "opacity-60"}`}
                  onClick={() => setSelectedSeminarCategory("AI 컨퍼런스")}
                >
                  <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo6.jpg"
                      alt="AI 컨퍼런스"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-purple-600 bg-opacity-10"></div>
                    {selectedSeminarCategory === "AI 컨퍼런스" && (
                      <div className="absolute inset-0 ring-2 ring-purple-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                    AI 컨퍼런스
                  </div>
                </div>

                <div
                  className={`text-center cursor-pointer ${selectedSeminarCategory === "워크샵" ? "opacity-100" : "opacity-60"}`}
                  onClick={() => setSelectedSeminarCategory("워크샵")}
                >
                  <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo7.jpg"
                      alt="워크샵"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-green-600 bg-opacity-10"></div>
                    {selectedSeminarCategory === "워크샵" && (
                      <div className="absolute inset-0 ring-2 ring-green-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                    워크샵
                  </div>
                </div>

                <div
                  className={`text-center cursor-pointer ${selectedSeminarCategory === "심포지엄" ? "opacity-100" : "opacity-60"}`}
                  onClick={() => setSelectedSeminarCategory("심포지엄")}
                >
                  <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo8.jpg"
                      alt="심포지엄"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-orange-600 bg-opacity-10"></div>
                    {selectedSeminarCategory === "심포지엄" && (
                      <div className="absolute inset-0 ring-2 ring-orange-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                    심포지엄
                  </div>
                </div>

                <div
                  className={`text-center cursor-pointer ${selectedSeminarCategory === "국제행사" ? "opacity-100" : "opacity-60"}`}
                  onClick={() => setSelectedSeminarCategory("국제행사")}
                >
                  <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo9.jpg"
                      alt="국제행사"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-red-600 bg-opacity-10"></div>
                    {selectedSeminarCategory === "국제행사" && (
                      <div className="absolute inset-0 ring-2 ring-red-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                    국제행사
                  </div>
                </div>

                <div
                  className={`text-center cursor-pointer ${selectedSeminarCategory === "온라인세미나" ? "opacity-100" : "opacity-60"}`}
                  onClick={() => setSelectedSeminarCategory("온라인세미나")}
                >
                  <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo10.jpg"
                      alt="온라인세미나"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-indigo-600 bg-opacity-10"></div>
                    {selectedSeminarCategory === "온라인세미나" && (
                      <div className="absolute inset-0 ring-2 ring-indigo-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="font-medium text-gray-800 text-sm whitespace-nowrap">
                    온라인세미나
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden gap-4 mb-6">
            {filteredSeminars.slice(0, 10).map((seminar) => (
              <Card
                key={seminar.id}
                className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={
                      seminar.imageUrl &&
                      seminar.imageUrl !== "/api/placeholder/400/250"
                        ? seminar.imageUrl
                        : "/uploads/images/5.jpg"
                    }
                    alt={seminar.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const fallbackImages = [
                        "/uploads/images/1.jpg",
                        "/uploads/images/4.jpg",
                        "/uploads/images/5.jpg",
                      ];
                      const randomFallback =
                        fallbackImages[
                          Math.floor(Math.random() * fallbackImages.length)
                        ];
                      e.currentTarget.src = randomFallback;
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-white/90">
                      {seminar.type}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3 group-hover:text-blue-600 transition-colors">
                    {seminar.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(seminar.date).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{seminar.location || "장소 미정"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{seminar.maxParticipants || 100}명 모집</span>
                    </div>
                  </div>
                  <Link href={`/seminars/${seminar.id}`}>
                    <Button className="w-full">세미나 보기</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
            {filteredSeminars.length === 0 && !seminarsLoading && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>등록된 세미나가 없습니다.</p>
              </div>
            )}
            {seminarsLoading && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>세미나 정보를 불러오는 중...</p>
              </div>
            )}
          </div>

          {/* Horizontal scroll layout for all screen sizes */}
          <div className="overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex space-x-4 w-max">
              {filteredSeminars.slice(0, 10).map((seminar) => (
                <Card
                  key={seminar.id}
                  className="group hover:shadow-lg transition-all duration-300 overflow-hidden flex-shrink-0 w-72"
                >
                  <div className="relative">
                    <img
                      src={
                        seminar.imageUrl &&
                        seminar.imageUrl !== "/api/placeholder/400/250"
                          ? seminar.imageUrl
                          : "/uploads/images/5.jpg"
                      }
                      alt={seminar.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const fallbackImages = [
                          "/uploads/images/1.jpg",
                          "/uploads/images/4.jpg",
                          "/uploads/images/5.jpg",
                        ];
                        const randomFallback =
                          fallbackImages[
                            Math.floor(Math.random() * fallbackImages.length)
                          ];
                        e.currentTarget.src = randomFallback;
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="bg-white/90 text-xs">
                        {seminar.type}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-base mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {seminar.title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">
                          {new Date(seminar.date).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs truncate">
                          {seminar.location || "장소 미정"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-3 w-3" />
                        <span className="text-xs">
                          {seminar.maxParticipants || 100}명
                        </span>
                      </div>
                    </div>
                    <Link href={`/seminars/${seminar.id}`}>
                      <Button className="w-full text-sm py-2">
                        세미나 보기
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
              {filteredSeminars.length === 0 && !seminarsLoading && (
                <div className="w-72 text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>등록된 세미나가 없습니다.</p>
                </div>
              )}
              {seminarsLoading && (
                <div className="w-72 text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>세미나 정보를 불러오는 중...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Overseas Study Programs */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                해외연수 프로그램
              </h2>
              <p className="text-gray-600">
                글로벌 역량 강화를 위한 다양한 해외연수 기회
              </p>
            </div>
            <Link href="/study-abroad">
              <Button size="lg" variant="outline">
                모든 해외연수 보기
              </Button>
            </Link>
          </div>

          {/* Overseas Categories */}
          <div className="mb-6">
            {/* Mobile: Horizontal scroll */}
            <div className="flex lg:hidden overflow-x-auto space-x-4 pb-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div
                className={`flex-shrink-0 text-center cursor-pointer ${selectedOverseasCategory === "전체" ? "opacity-100" : "opacity-60"}`}
                onClick={() => setSelectedOverseasCategory("전체")}
              >
                <div className="relative w-14 h-14 mx-auto mb-2 overflow-hidden rounded-full shadow-lg">
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  {selectedOverseasCategory === "전체" && (
                    <div className="absolute inset-0 ring-2 ring-green-500 rounded-full"></div>
                  )}
                </div>
                <div className="font-medium text-gray-800 text-xs whitespace-nowrap">
                  전체
                </div>
              </div>

              <div
                className={`flex-shrink-0 text-center cursor-pointer ${selectedOverseasCategory === "교육시찰" ? "opacity-100" : "opacity-60"}`}
                onClick={() => setSelectedOverseasCategory("교육시찰")}
              >
                <div className="relative w-14 h-14 mx-auto mb-2 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo11.jpg"
                    alt="교육시찰"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-10"></div>
                  {selectedOverseasCategory === "교육시찰" && (
                    <div className="absolute inset-0 ring-2 ring-blue-500 rounded-full"></div>
                  )}
                </div>
                <div className="font-medium text-gray-800 text-xs">
                  교육시찰
                </div>
              </div>

              <div
                className={`text-center cursor-pointer ${selectedOverseasCategory === "연구연수" ? "opacity-100" : "opacity-60"}`}
                onClick={() => setSelectedOverseasCategory("연구연수")}
              >
                <div className="relative w-14 h-14 mx-auto mb-2 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo12.jpg"
                    alt="연구연수"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-purple-600 bg-opacity-10"></div>
                  {selectedOverseasCategory === "연구연수" && (
                    <div className="absolute inset-0 ring-2 ring-purple-500 rounded-full"></div>
                  )}
                </div>
                <div className="font-medium text-gray-800 text-xs">
                  연구연수
                </div>
              </div>

              <div
                className={`text-center cursor-pointer ${selectedOverseasCategory === "교육과정개발" ? "opacity-100" : "opacity-60"}`}
                onClick={() => setSelectedOverseasCategory("교육과정개발")}
              >
                <div className="relative w-14 h-14 mx-auto mb-2 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo13.jpg"
                    alt="교육과정개발"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-green-600 bg-opacity-10"></div>
                  {selectedOverseasCategory === "교육과정개발" && (
                    <div className="absolute inset-0 ring-2 ring-green-500 rounded-full"></div>
                  )}
                </div>
                <div className="font-medium text-gray-800 text-xs">
                  교육과정개발
                </div>
              </div>

              <div
                className={`text-center cursor-pointer ${selectedOverseasCategory === "국제교류" ? "opacity-100" : "opacity-60"}`}
                onClick={() => setSelectedOverseasCategory("국제교류")}
              >
                <div className="relative w-14 h-14 mx-auto mb-2 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo14.jpg"
                    alt="국제교류"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-orange-600 bg-opacity-10"></div>
                  {selectedOverseasCategory === "국제교류" && (
                    <div className="absolute inset-0 ring-2 ring-orange-500 rounded-full"></div>
                  )}
                </div>
                <div className="font-medium text-gray-800 text-xs">
                  국제교류
                </div>
              </div>

              <div
                className={`text-center cursor-pointer ${selectedOverseasCategory === "어학연수" ? "opacity-100" : "opacity-60"}`}
                onClick={() => setSelectedOverseasCategory("어학연수")}
              >
                <div className="relative w-14 h-14 mx-auto mb-2 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo15.jpg"
                    alt="어학연수"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-red-600 bg-opacity-10"></div>
                  {selectedOverseasCategory === "어학연수" && (
                    <div className="absolute inset-0 ring-2 ring-red-500 rounded-full"></div>
                  )}
                </div>
                <div className="font-medium text-gray-800 text-xs">
                  어학연수
                </div>
              </div>

              <div
                className={`text-center cursor-pointer ${selectedOverseasCategory === "문화체험" ? "opacity-100" : "opacity-60"}`}
                onClick={() => setSelectedOverseasCategory("문화체험")}
              >
                <div className="relative w-14 h-14 mx-auto mb-2 overflow-hidden rounded-full shadow-lg">
                  <img
                    src="/uploads/photo16.jpg"
                    alt="문화체험"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-indigo-600 bg-opacity-10"></div>
                  {selectedOverseasCategory === "문화체험" && (
                    <div className="absolute inset-0 ring-2 ring-indigo-500 rounded-full"></div>
                  )}
                </div>
                <div className="font-medium text-gray-800 text-xs">
                  문화체험
                </div>
              </div>
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden lg:flex lg:justify-center">
              <div className="flex flex-wrap justify-center gap-4 max-w-6xl">
                <div
                  className={`text-center cursor-pointer ${selectedOverseasCategory === "전체" ? "opacity-100" : "opacity-60"}`}
                  onClick={() => setSelectedOverseasCategory("전체")}
                >
                  <div className="relative w-14 h-14 mx-auto mb-2 overflow-hidden rounded-full shadow-lg">
                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    {selectedOverseasCategory === "전체" && (
                      <div className="absolute inset-0 ring-2 ring-green-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="font-medium text-gray-800 text-xs">전체</div>
                </div>

                <div
                  className={`text-center cursor-pointer ${selectedOverseasCategory === "교육시찰" ? "opacity-100" : "opacity-60"}`}
                  onClick={() => setSelectedOverseasCategory("교육시찰")}
                >
                  <div className="relative w-14 h-14 mx-auto mb-2 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo11.jpg"
                      alt="교육시찰"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-10"></div>
                    {selectedOverseasCategory === "교육시찰" && (
                      <div className="absolute inset-0 ring-2 ring-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="font-medium text-gray-800 text-xs">
                    교육시찰
                  </div>
                </div>

                <div
                  className={`text-center cursor-pointer ${selectedOverseasCategory === "연구연수" ? "opacity-100" : "opacity-60"}`}
                  onClick={() => setSelectedOverseasCategory("연구연수")}
                >
                  <div className="relative w-14 h-14 mx-auto mb-2 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo12.jpg"
                      alt="연구연수"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-purple-600 bg-opacity-10"></div>
                    {selectedOverseasCategory === "연구연수" && (
                      <div className="absolute inset-0 ring-2 ring-purple-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="font-medium text-gray-800 text-xs">
                    연구연수
                  </div>
                </div>

                <div
                  className={`text-center cursor-pointer ${selectedOverseasCategory === "교육과정개발" ? "opacity-100" : "opacity-60"}`}
                  onClick={() => setSelectedOverseasCategory("교육과정개발")}
                >
                  <div className="relative w-14 h-14 mx-auto mb-2 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo13.jpg"
                      alt="교육과정개발"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-green-600 bg-opacity-10"></div>
                    {selectedOverseasCategory === "교육과정개발" && (
                      <div className="absolute inset-0 ring-2 ring-green-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="font-medium text-gray-800 text-xs">
                    교육과정개발
                  </div>
                </div>

                <div
                  className={`text-center cursor-pointer ${selectedOverseasCategory === "국제교류" ? "opacity-100" : "opacity-60"}`}
                  onClick={() => setSelectedOverseasCategory("국제교류")}
                >
                  <div className="relative w-14 h-14 mx-auto mb-2 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo14.jpg"
                      alt="국제교류"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-orange-600 bg-opacity-10"></div>
                    {selectedOverseasCategory === "국제교류" && (
                      <div className="absolute inset-0 ring-2 ring-orange-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="font-medium text-gray-800 text-xs">
                    국제교류
                  </div>
                </div>

                <div
                  className={`text-center cursor-pointer ${selectedOverseasCategory === "어학연수" ? "opacity-100" : "opacity-60"}`}
                  onClick={() => setSelectedOverseasCategory("어학연수")}
                >
                  <div className="relative w-14 h-14 mx-auto mb-2 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo15.jpg"
                      alt="어학연수"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-red-600 bg-opacity-10"></div>
                    {selectedOverseasCategory === "어학연수" && (
                      <div className="absolute inset-0 ring-2 ring-red-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="font-medium text-gray-800 text-xs">
                    어학연수
                  </div>
                </div>

                <div
                  className={`text-center cursor-pointer ${selectedOverseasCategory === "문화체험" ? "opacity-100" : "opacity-60"}`}
                  onClick={() => setSelectedOverseasCategory("문화체험")}
                >
                  <div className="relative w-14 h-14 mx-auto mb-2 overflow-hidden rounded-full shadow-lg">
                    <img
                      src="/uploads/photo16.jpg"
                      alt="문화체험"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-indigo-600 bg-opacity-10"></div>
                    {selectedOverseasCategory === "문화체험" && (
                      <div className="absolute inset-0 ring-2 ring-indigo-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="font-medium text-gray-800 text-xs">
                    문화체험
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden gap-4 mb-6">
            {filteredOverseas.slice(0, 10).map((program) => (
              <Card
                key={program.id}
                className="group hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-[500px]"
              >
                <div className="relative">
                  <img
                    src={
                      program.imageUrl &&
                      program.imageUrl !== "/api/placeholder/400/250"
                        ? program.imageUrl
                        : "/uploads/images/8.jpg"
                    }
                    alt={program.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const fallbackImages = [
                        "/uploads/images/8.jpg",
                        "/uploads/images/9.jpg",
                        "/uploads/images/10.jpg",
                      ];
                      const randomFallback =
                        fallbackImages[
                          Math.floor(Math.random() * fallbackImages.length)
                        ];
                      e.currentTarget.src = randomFallback;
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-white/90">
                      {program.type}
                    </Badge>
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-green-500 text-white">
                      {program.price
                        ? `${program.price.toLocaleString()}원`
                        : "문의"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 flex flex-col flex-grow">
                  <h3 className="font-semibold text-lg mb-3 group-hover:text-blue-600 transition-colors">
                    {program.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{program.destination}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(program.startDate).toLocaleDateString(
                          "ko-KR",
                        )}{" "}
                        ~{" "}
                        {new Date(program.endDate).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{program.maxParticipants || 30}명 모집</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{program.currentParticipants || 0}명 신청중</span>
                    </div>
                    {program.duration && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{program.duration}</span>
                      </div>
                    )}
                    {program.description && (
                      <p className="text-sm text-gray-600 line-clamp-3 mt-2">
                        {program.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-auto">
                    <Link href={`/study-abroad/${program.id}`}>
                      <Button className="w-full">연수 신청하기</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredOverseas.length === 0 && !overseasLoading && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>등록된 해외연수 프로그램이 없습니다.</p>
              </div>
            )}
            {overseasLoading && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>해외연수 정보를 불러오는 중...</p>
              </div>
            )}
          </div>

          {/* Horizontal scroll layout for all screen sizes */}
          <div className="overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex space-x-4 w-max">
              {filteredOverseas.slice(0, 10).map((program) => (
                <Card
                  key={program.id}
                  className="group hover:shadow-lg transition-all duration-300 overflow-hidden flex-shrink-0 w-72 h-[450px] flex flex-col"
                >
                  <div className="relative">
                    <img
                      src={
                        program.imageUrl &&
                        program.imageUrl !== "/api/placeholder/400/250"
                          ? program.imageUrl
                          : "/uploads/images/8.jpg"
                      }
                      alt={program.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const fallbackImages = [
                          "/uploads/images/8.jpg",
                          "/uploads/images/9.jpg",
                          "/uploads/images/10.jpg",
                        ];
                        const randomFallback =
                          fallbackImages[
                            Math.floor(Math.random() * fallbackImages.length)
                          ];
                        e.currentTarget.src = randomFallback;
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="bg-white/90 text-xs">
                        {program.type}
                      </Badge>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-green-500 text-white text-xs">
                        {program.price
                          ? `${program.price.toLocaleString()}원`
                          : "문의"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-lg mb-3 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {program.title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">{program.destination}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">
                          {new Date(program.startDate).toLocaleDateString(
                            "ko-KR",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}{" "}
                          ~{" "}
                          {new Date(program.endDate).toLocaleDateString(
                            "ko-KR",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-3 w-3" />
                        <span className="text-xs">
                          {program.maxParticipants || 30}명 모집
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-3 w-3" />
                        <span className="text-xs">
                          {program.currentParticipants || 0}명 신청중
                        </span>
                      </div>
                      {program.duration && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">{program.duration}</span>
                        </div>
                      )}
                      {program.description && (
                        <p className="text-xs text-gray-600 line-clamp-3 mt-2">
                          {program.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-auto">
                      <Link href={`/study-abroad/${program.id}`}>
                        <Button className="w-full text-sm py-2">
                          연수 신청하기
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredOverseas.length === 0 && !overseasLoading && (
                <div className="w-72 text-center py-8 text-gray-500">
                  <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>등록된 해외연수 프로그램이 없습니다.</p>
                </div>
              )}
              {overseasLoading && (
                <div className="w-72 text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>해외연수 정보를 불러오는 중...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Notice Section */}
      <section className="py-8 bg-white pt-[0px] pb-[0px]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                공지사항
              </h2>
              <p className="text-gray-600">
                중요한 공지사항과 업데이트 소식을 확인하세요
              </p>
            </div>
            <Link href="/announcements">
              <Button variant="outline" size="lg">
                더보기
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Notice List */}
            <Card className="p-6 bg-white">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <span>최신 공지사항</span>
                </CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {notices.slice(0, 6).map((notice: Notice) => (
                  <Link key={notice.id} href="/announcements">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            notice.isImportant
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {notice.category}
                        </span>
                        <span className="text-sm font-medium">
                          {notice.title}
                        </span>
                        {notice.isImportant && (
                          <Badge className="bg-red-500 text-white text-xs">
                            중요
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notice.createdAt).toLocaleDateString(
                            "ko-KR",
                          )}
                        </span>
                        {notice.views && (
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {notice.views}
                            </span>
                          </div>
                        )}
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                ))}
                {notices.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>등록된 공지사항이 없습니다.</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Customer Service Center */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center justify-center space-x-2 text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Headphones className="h-6 w-6 text-white" />
                  </div>
                </CardTitle>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    연수 상담 센터
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    평일 09:00 - 18:00 (점심시간 12:00 - 13:00)
                  </p>
                </div>
              </CardHeader>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">전화 문의</div>
                    <div className="font-semibold text-gray-900">
                      055-772-2226
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">이메일 문의</div>
                    <div className="font-semibold text-gray-900">
                      support@eduplatform.kr
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setIsChatOpen(true)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  실시간 상담 시작하기
                </Button>

                <div className="mt-3">
                  <Link href="/help">
                    <Button variant="outline" className="w-full">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      자주 묻는 질문 FAQ
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
      <ChatWidget
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
}
