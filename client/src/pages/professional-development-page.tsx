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

export default function ProfessionalDevelopmentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  // Fetch professional development courses
  const { data: coursesData, isLoading } = useQuery({
    queryKey: ["/api/courses", { category: "전문성강화교육", search: searchQuery }],
  });

  const developmentFields = [
    { id: "leadership", name: "리더십", icon: "fas fa-user-tie", count: 12 },
    { id: "communication", name: "커뮤니케이션", icon: "fas fa-comments", count: 8 },
    { id: "project", name: "프로젝트 관리", icon: "fas fa-tasks", count: 10 },
    { id: "innovation", name: "혁신 역량", icon: "fas fa-lightbulb", count: 6 },
    { id: "digital", name: "디지털 역량", icon: "fas fa-laptop-code", count: 15 },
    { id: "analysis", name: "데이터 분석", icon: "fas fa-chart-bar", count: 9 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600 to-purple-800 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img 
            src="/uploads/images/f6cd9b1fc9e4bcb321d6de9fb9e3c914_1750405130301.jpg" 
            alt="Professional Development Brain"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">전문성 강화교육</h1>
            <p className="text-xl text-purple-100 mb-6">
              업무 전문성 향상과 역량 개발을 위한 심화 교육과정으로 경쟁력을 강화하세요.
            </p>
            <div className="flex space-x-4">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                인기 과정 보기
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                맞춤 상담
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">전문성 강화교육의 장점</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <i className="fas fa-rocket text-3xl text-purple-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">경력 발전</h3>
              <p className="text-gray-600">전문 스킬 향상으로 승진과 이직에 유리한 포지션 확보</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <i className="fas fa-brain text-3xl text-purple-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">실무 역량</h3>
              <p className="text-gray-600">현장에서 바로 적용 가능한 실무 중심의 교육 콘텐츠</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <i className="fas fa-network-wired text-3xl text-purple-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">네트워킹</h3>
              <p className="text-gray-600">동종 업계 전문가들과의 네트워킹 기회 제공</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Field Navigation with Circular Images */}
        <section className="mb-12 py-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">분야별 전문성 강화 과정</h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-4xl">
              {developmentFields.map((field) => (
                <Link key={field.id} href={`/professional-development?category=${field.id}`}>
                  <div className="text-center group cursor-pointer">
                    <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <img 
                        src={field.imageUrl}
                        alt={field.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className={`absolute inset-0 ${field.overlay} bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300`}></div>
                    </div>
                    <div className={`font-medium text-sm transition-colors text-gray-800 group-hover:${field.hoverColor}`}>
                      {field.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{field.count}개 과정</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

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
            
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger>
                <SelectValue placeholder="전문 분야" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="leadership">리더십</SelectItem>
                <SelectItem value="communication">커뮤니케이션</SelectItem>
                <SelectItem value="project">프로젝트 관리</SelectItem>
                <SelectItem value="digital">디지털 역량</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="교육 수준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="basic">기초</SelectItem>
                <SelectItem value="intermediate">중급</SelectItem>
                <SelectItem value="advanced">고급</SelectItem>
                <SelectItem value="expert">전문가</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-purple-600 hover:bg-purple-700">
              <i className="fas fa-search mr-2"></i>
              검색
            </Button>
          </div>
        </div>

        {/* Featured Programs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">추천 전문성 강화 프로그램</h2>
          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trending">인기 과정</TabsTrigger>
              <TabsTrigger value="leadership">리더십</TabsTrigger>
              <TabsTrigger value="digital">디지털</TabsTrigger>
              <TabsTrigger value="project">프로젝트</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trending" className="mt-6">
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
            
            <TabsContent value="leadership" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardContent className="p-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      <i className="fas fa-crown mr-2 text-purple-600"></i>
                      리더십 핵심 과정
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• 변화 리더십과 조직 혁신</li>
                      <li>• 팀 빌딩과 동기 부여</li>
                      <li>• 갈등 관리와 협상 스킬</li>
                      <li>• 전략적 사고와 의사결정</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardContent className="p-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      <i className="fas fa-users mr-2 text-blue-600"></i>
                      중간관리자 과정
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• 중간관리자의 역할과 책임</li>
                      <li>• 상하 커뮤니케이션 스킬</li>
                      <li>• 성과 관리와 피드백</li>
                      <li>• 코칭과 멘토링 기법</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="digital" className="mt-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  <i className="fas fa-robot mr-2 text-blue-600"></i>
                  디지털 트랜스포메이션 시대 필수 역량
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">기초 과정</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• 디지털 리터러시 기초</li>
                      <li>• 클라우드 컴퓨팅 이해</li>
                      <li>• 데이터 활용 기초</li>
                      <li>• 디지털 마케팅 입문</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">심화 과정</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• AI와 머신러닝 활용</li>
                      <li>• 빅데이터 분석 실무</li>
                      <li>• 디지털 전략 수립</li>
                      <li>• 사이버 보안 관리</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="project" className="mt-6">
              <div className="space-y-6">
                <Card className="p-6">
                  <CardContent className="p-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      <i className="fas fa-project-diagram mr-2 text-green-600"></i>
                      PMP 자격증 준비 과정
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">1단계: 기초</h4>
                        <p className="text-sm text-green-600">프로젝트 관리 기본 개념과 프로세스 이해</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">2단계: 실습</h4>
                        <p className="text-sm text-blue-600">실제 프로젝트 사례를 통한 실무 적용</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-medium text-purple-800 mb-2">3단계: 시험</h4>
                        <p className="text-sm text-purple-600">PMP 시험 준비와 모의고사</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Learning Path Section */}
        <section className="mb-12">
          <div className="bg-purple-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">학습 로드맵</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-purple-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">역량 진단</h3>
                <p className="text-gray-600 text-sm">현재 역량 수준을 정확히 파악하고 목표를 설정합니다.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">맞춤 학습</h3>
                <p className="text-gray-600 text-sm">개인별 맞춤 커리큘럼으로 체계적인 학습을 진행합니다.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">실무 적용</h3>
                <p className="text-gray-600 text-sm">학습한 내용을 실제 업무에 적용하고 피드백을 받습니다.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-purple-600">4</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">역량 인증</h3>
                <p className="text-gray-600 text-sm">완료된 과정에 대한 인증서를 발급받습니다.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}