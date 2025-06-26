import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CourseCard from "@/components/ui/course-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TrainingCoursesPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const category = searchParams.get("category") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  // Fetch courses with filters
  const { data: coursesData, isLoading } = useQuery({
    queryKey: [
      "/api/courses",
      {
        category,
        search: searchQuery,
        type: selectedType,
        level: selectedLevel,
      },
    ],
  });

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "법정의무교육":
        return "법정 의무교육";
      case "전문성강화교육":
        return "전문성 강화교육";
      case "자격증":
        return "자격증 과정";
      default:
        return "교육과정";
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case "법정의무교육":
        return "법령에 의해 의무적으로 이수해야 하는 안전교육 및 보건교육 과정입니다.";
      case "전문성강화교육":
        return "업무 전문성 향상과 역량 개발을 위한 심화 교육과정입니다.";
      case "자격증":
        return "국가공인 자격증 취득을 위한 체계적인 교육과정입니다.";
      default:
        return "다양한 분야의 교육과정을 제공합니다.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <i className="fas fa-home text-blue-600"></i>
            <span className="mx-2">/</span>
            <span className="text-blue-600">연수과정</span>
            {category && (
              <>
                <span className="mx-2">/</span>
                <span className="text-gray-700">
                  {getCategoryTitle(category)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Category Navigation with Circular Images */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            연수과정 분야
          </h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-4xl">
              <Link href="/training-courses?category=법정의무교육">
                <div
                  className={`text-center group cursor-pointer ${
                    category === "법정의무교육" ? "transform scale-105" : ""
                  }`}
                >
                  <div
                    className={`relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300 ${
                      category === "법정의무교육" ? "ring-4 ring-blue-500" : ""
                    }`}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=center"
                      alt="법정의무교육"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div
                      className={`absolute inset-0 bg-blue-600 ${
                        category === "법정의무교육"
                          ? "bg-opacity-30"
                          : "bg-opacity-20 group-hover:bg-opacity-10"
                      } transition-opacity duration-300`}
                    ></div>
                  </div>
                  <div
                    className={`font-medium text-sm transition-colors ${
                      category === "법정의무교육"
                        ? "text-blue-600 font-semibold"
                        : "text-gray-800 group-hover:text-blue-600"
                    }`}
                  >
                    법정교육
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    화학물질 법정교육
                  </div>
                </div>
              </Link>

              <Link href="/professional-development">
                <div
                  className={`text-center group cursor-pointer ${
                    category === "전문성강화교육" ? "transform scale-105" : ""
                  }`}
                >
                  <div
                    className={`relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300 ${
                      category === "전문성강화교육"
                        ? "ring-4 ring-purple-500"
                        : ""
                    }`}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=120&h=120&fit=crop&crop=center"
                      alt="전문성강화교육"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div
                      className={`absolute inset-0 bg-purple-600 ${
                        category === "전문성강화교육"
                          ? "bg-opacity-30"
                          : "bg-opacity-20 group-hover:bg-opacity-10"
                      } transition-opacity duration-300`}
                    ></div>
                  </div>
                  <div
                    className={`font-medium text-sm transition-colors ${
                      category === "전문성강화교육"
                        ? "text-purple-600 font-semibold"
                        : "text-gray-800 group-hover:text-purple-600"
                    }`}
                  >
                    전문성강화
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    역량개발 프로그램
                  </div>
                </div>
              </Link>

              <Link href="/certificate-courses">
                <div
                  className={`text-center group cursor-pointer ${
                    category === "자격증" ? "transform scale-105" : ""
                  }`}
                >
                  <div
                    className={`relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300 ${
                      category === "자격증" ? "ring-4 ring-green-500" : ""
                    }`}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&h=120&fit=crop&crop=center"
                      alt="자격증과정"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div
                      className={`absolute inset-0 bg-green-600 ${
                        category === "자격증"
                          ? "bg-opacity-30"
                          : "bg-opacity-20 group-hover:bg-opacity-10"
                      } transition-opacity duration-300`}
                    ></div>
                  </div>
                  <div
                    className={`font-medium text-sm transition-colors ${
                      category === "자격증"
                        ? "text-green-600 font-semibold"
                        : "text-gray-800 group-hover:text-green-600"
                    }`}
                  >
                    자격증
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    공인자격 취득
                  </div>
                </div>
              </Link>

              <Link href="/seminars">
                <div className="text-center group cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <img
                      src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=120&h=120&fit=crop&crop=center"
                      alt="세미나"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-yellow-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm group-hover:text-yellow-600 transition-colors">
                    세미나
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    학회/컨퍼런스
                  </div>
                </div>
              </Link>

              <Link href="/study-abroad">
                <div className="text-center group cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <img
                      src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=120&h=120&fit=crop&crop=center"
                      alt="해외연수"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-red-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm group-hover:text-red-600 transition-colors">
                    해외연수
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    글로벌 프로그램
                  </div>
                </div>
              </Link>

              <Link href="/help">
                <div className="text-center group cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <img
                      src="https://images.unsplash.com/photo-1553484771-371a605b060b?w=120&h=120&fit=crop&crop=center"
                      alt="고객센터"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-indigo-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">
                    고객센터
                  </div>
                  <div className="text-xs text-gray-500 mt-1">문의/도움말</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {getCategoryTitle(category)}
          </h1>
          <p className="text-gray-600">{getCategoryDescription(category)}</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="과정명 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="교육형태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="online">온라인</SelectItem>
                <SelectItem value="offline">오프라인</SelectItem>
                <SelectItem value="blended">블렌디드</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="교육수준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="beginner">초급</SelectItem>
                <SelectItem value="intermediate">중급</SelectItem>
                <SelectItem value="advanced">고급</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-blue-600 hover:bg-blue-700">
              <i className="fas fa-search mr-2"></i>
              검색
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            총{" "}
            <span className="font-semibold text-gray-800">
              {coursesData?.total || 0}
            </span>
            개의 과정이 있습니다.
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">정렬:</span>
            <Select defaultValue="latest">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="popular">인기순</SelectItem>
                <SelectItem value="price-low">가격낮은순</SelectItem>
                <SelectItem value="price-high">가격높은순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm border animate-pulse"
              >
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : coursesData?.courses?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesData.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-500">다른 검색어나 필터를 사용해보세요.</p>
          </div>
        )}

        {/* Pagination would go here */}
        {coursesData?.total > 6 && (
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-600 text-white"
              >
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                다음
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
