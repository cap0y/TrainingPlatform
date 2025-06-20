import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CourseCard from "@/components/ui/course-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CertificateCoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");

  // Fetch certificate courses
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ["/api/courses", { category: "자격증", search: searchQuery }],
  });

  const certificateCategories = [
    { id: "safety", name: "안전관리", icon: "fas fa-shield-alt", count: 15 },
    { id: "environment", name: "환경관리", icon: "fas fa-leaf", count: 12 },
    { id: "quality", name: "품질관리", icon: "fas fa-award", count: 8 },
    { id: "information", name: "정보보안", icon: "fas fa-lock", count: 10 },
    { id: "construction", name: "건설관리", icon: "fas fa-hard-hat", count: 6 },
    { id: "fire", name: "소방안전", icon: "fas fa-fire-extinguisher", count: 9 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img 
            src="/attached_assets/4901b8c8f6c3cdb40238ce25968be771_1750405130302.jpg" 
            alt="Certificate of Completion"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">자격증 취득 과정</h1>
            <p className="text-xl text-green-100 mb-6">
              국가공인 자격증 취득을 위한 체계적이고 전문적인 교육과정을 제공합니다.
            </p>
            <div className="flex space-x-4">
              <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                인기 자격증 보기
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                수강 문의
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">자격증 과정</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">3,200+</div>
              <div className="text-gray-600">합격자 배출</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
              <div className="text-gray-600">평균 합격률</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">24시간</div>
              <div className="text-gray-600">학습 지원</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Category Navigation */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">자격증 분야별 과정</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {certificateCategories.map((category) => (
              <Link key={category.id} href={`/certificate-courses?category=${category.id}`}>
                <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer hover:bg-green-50">
                  <CardContent className="p-0">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <i className={`${category.icon} text-2xl text-green-600`}></i>
                    </div>
                    <div className="font-medium text-gray-800 mb-1">{category.name}</div>
                    <div className="text-xs text-gray-500">{category.count}개 과정</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="자격증명 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="자격증 분야" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="safety">안전관리</SelectItem>
                <SelectItem value="environment">환경관리</SelectItem>
                <SelectItem value="quality">품질관리</SelectItem>
                <SelectItem value="information">정보보안</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="난이도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="1">1급 (고급)</SelectItem>
                <SelectItem value="2">2급 (중급)</SelectItem>
                <SelectItem value="3">3급 (초급)</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-green-600 hover:bg-green-700">
              <i className="fas fa-search mr-2"></i>
              검색
            </Button>
          </div>
        </div>

        {/* Featured Certificates */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">인기 자격증 과정</h2>
          <Tabs defaultValue="popular" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="popular">인기 과정</TabsTrigger>
              <TabsTrigger value="new">신규 과정</TabsTrigger>
              <TabsTrigger value="upcoming">시험 예정</TabsTrigger>
              <TabsTrigger value="recommendation">추천 과정</TabsTrigger>
            </TabsList>
            
            <TabsContent value="popular" className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border animate-pulse">
                      <div className="w-full h-48 bg-gray-200"></div>
                      <div className="p-6 space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coursesData?.courses?.slice(0, 6).map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="new" className="mt-6">
              <div className="text-center py-12">
                <i className="fas fa-plus-circle text-4xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">새로운 자격증 과정</h3>
                <p className="text-gray-500">곧 새로운 자격증 과정이 추가될 예정입니다.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="upcoming" className="mt-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">
                  <i className="fas fa-calendar-check mr-2"></i>
                  다가오는 시험 일정
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white p-4 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">화학물질관리사</div>
                      <div className="text-sm text-gray-500">필기시험</div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-600 font-semibold">2025.07.15</div>
                      <div className="text-xs text-gray-500">D-25</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-white p-4 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">산업안전지도사</div>
                      <div className="text-sm text-gray-500">필기시험</div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-600 font-semibold">2025.08.10</div>
                      <div className="text-xs text-gray-500">D-51</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="recommendation" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
                  <CardContent className="p-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">초보자 추천</h3>
                    <p className="text-gray-600 mb-4">자격증이 처음이신 분들께 추천하는 입문 과정</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• 화학물질관리사 (3급)</li>
                      <li>• 산업안전지도사 (3급)</li>
                      <li>• 환경관리사 (3급)</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardContent className="p-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">경력자 추천</h3>
                    <p className="text-gray-600 mb-4">실무 경험이 있는 분들께 추천하는 고급 과정</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• 화학물질관리사 (1급)</li>
                      <li>• 산업안전지도사 (1급)</li>
                      <li>• 품질관리사 (1급)</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Study Guide Section */}
        <section className="mb-12">
          <div className="bg-green-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">자격증 취득 가이드</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-green-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">과정 선택</h3>
                <p className="text-gray-600 text-sm">자신의 경력과 목표에 맞는 자격증 과정을 선택하세요.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">체계적 학습</h3>
                <p className="text-gray-600 text-sm">전문 강사진의 체계적인 커리큘럼으로 학습하세요.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">시험 준비</h3>
                <p className="text-gray-600 text-sm">모의고사와 실전 문제로 시험에 완벽하게 대비하세요.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}