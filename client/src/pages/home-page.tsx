import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Users, Award, Star, ArrowRight, Calendar, MapPin, Phone, Mail, 
  MessageCircle, HelpCircle, FileText, Settings, Eye, Zap, Target, Globe,
  TrendingUp, CheckCircle
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CourseCard from "@/components/course-card";
import ChatWidget from "@/components/chat-widget";
import NotificationPanel from "@/components/notification-panel";

interface Course {
  id: number;
  title: string;
  description: string;
  instructor?: string;
  duration?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  rating?: number;
  students?: number;
}

interface Notice {
  id: number;
  title: string;
  category: string;
  createdAt: string;
}

export default function HomePage() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("popular");

  const { data: coursesData, isLoading: coursesLoading } = useQuery<{ courses: Course[]; total: number }>({
    queryKey: ["/api/courses"],
  });

  const { data: noticesData, isLoading: noticesLoading } = useQuery<{ notices: Notice[] }>({
    queryKey: ["/api/notices"],
  });

  return (
    <div className="min-h-screen bg-white">
      <Header onNotificationClick={() => setShowNotifications(true)} />
      
      {/* Hero Section with Slideshow */}
      <section className="relative h-[600px] overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Hero slide ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Content - Left Aligned */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                전문가가 되는 <span className="text-yellow-300">첫걸음</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-200 leading-relaxed">
                지누켐과 함께하는 체계적인 연수 프로그램으로<br />
                여러분의 전문성을 한 단계 높여보세요
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/courses">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg">
                    <BookOpen className="h-5 w-5 mr-2" />
                    연수과정 보기
                  </Button>
                </Link>
                <Link href="/seminars">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold shadow-lg">
                    <Calendar className="h-5 w-5 mr-2" />
                    세미나 신청
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section with Circular Images */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">교육 분야</h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 max-w-4xl">
              <Link href="/training-courses?category=법정의무교육">
                <div className="text-center group cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=center" 
                      alt="법정의무교육"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm group-hover:text-blue-600 transition-colors">법정교육</div>
                </div>
              </Link>

              <Link href="/professional-development">
                <div className="text-center group cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=120&h=120&fit=crop&crop=center" 
                      alt="전문성강화교육"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-purple-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm group-hover:text-purple-600 transition-colors">전문성강화</div>
                </div>
              </Link>

              <Link href="/certificate-courses">
                <div className="text-center group cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&h=120&fit=crop&crop=center" 
                      alt="자격증과정"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-green-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm group-hover:text-green-600 transition-colors">자격증</div>
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
                  <div className="font-medium text-gray-800 text-sm group-hover:text-yellow-600 transition-colors">세미나</div>
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
                  <div className="font-medium text-gray-800 text-sm group-hover:text-red-600 transition-colors">해외연수</div>
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
                  <div className="font-medium text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">고객센터</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses with Tabs */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">인기 연수과정</h2>
            <p className="text-gray-600">실시간으로 업데이트되는 인기 연수과정을 확인해보세요</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="popular" className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>실시간 인기</span>
                </TabsTrigger>
                <TabsTrigger value="category" className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>분야별 인기</span>
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>신규 과정</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="popular" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: 1,
                    title: "2025 교육과정 개정안 이해와 적용",
                    category: "교육정책",
                    students: 1250,
                    rating: 4.8,
                    price: "120,000원",
                    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop",
                    trending: true
                  },
                  {
                    id: 2,
                    title: "디지털 교수법 심화과정",
                    category: "교수법",
                    students: 980,
                    rating: 4.9,
                    price: "150,000원",
                    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&h=200&fit=crop",
                    trending: true
                  },
                  {
                    id: 3,
                    title: "AI 시대의 교육 혁신",
                    category: "교육기술",
                    students: 750,
                    rating: 4.7,
                    price: "180,000원",
                    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop",
                    trending: true
                  }
                ].map((course) => (
                  <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <img src={course.image} alt={course.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                      {course.trending && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-red-500 text-white">
                            <Zap className="h-3 w-3 mr-1" />
                            HOT
                          </Badge>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="bg-white/90">{course.category}</Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{course.students}명</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{course.rating}</span>
                          </div>
                        </div>
                        <span className="font-semibold text-blue-600">{course.price}</span>
                      </div>
                      <Button className="w-full">수강신청</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center">
                <Link href="/courses">
                  <Button variant="outline" size="lg">전체 과정 보기</Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="category" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { category: "교육정책", count: 45, color: "bg-blue-500" },
                  { category: "교수법", count: 38, color: "bg-green-500" },
                  { category: "교육기술", count: 32, color: "bg-purple-500" },
                  { category: "평가방법", count: 28, color: "bg-orange-500" }
                ].map((item) => (
                  <Card key={item.category} className="p-6 text-center hover:shadow-lg transition-shadow">
                    <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.category}</h3>
                    <p className="text-gray-600 mb-4">{item.count}개 과정</p>
                    <Button variant="outline" size="sm">보기</Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: "메타버스 교육 플랫폼 활용법",
                    date: "2025.08.15 개설 예정",
                    description: "차세대 교육 기술인 메타버스를 활용한 혁신적인 교육 방법론을 학습합니다.",
                    image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=300&h=200&fit=crop"
                  },
                  {
                    title: "블록체인 기반 학습 관리 시스템",
                    date: "2025.09.01 개설 예정", 
                    description: "블록체인 기술을 교육 분야에 적용하는 최신 트렌드와 실무 활용법을 다룹니다.",
                    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300&h=200&fit=crop"
                  }
                ].map((course, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="md:flex">
                      <img src={course.image} alt={course.title} className="w-full md:w-48 h-48 md:h-32 object-cover" />
                      <CardContent className="p-4 flex-1">
                        <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                        <p className="text-sm text-blue-600 font-medium">{course.date}</p>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Upcoming Seminars & Conferences */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">다가오는 학회 및 세미나</h2>
              <p className="text-gray-600">최신 트렌드와 실무 노하우를 공유하는 전문가 세미나</p>
            </div>
            <Link href="/seminars">
              <Button size="lg" variant="outline">모든 학회 및 세미나 보기</Button>
            </Link>
          </div>

          {/* Seminar Categories */}
          <div className="flex justify-center mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-3xl">
              <div className="text-center group cursor-pointer">
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=120&h=120&fit=crop&crop=center"
                    alt="교육학회"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm group-hover:text-blue-600 transition-colors">교육학회</div>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=120&h=120&fit=crop&crop=center"
                    alt="AI 컨퍼런스"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-purple-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm group-hover:text-purple-600 transition-colors">AI 컨퍼런스</div>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&h=120&fit=crop&crop=center"
                    alt="워크샵"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-green-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm group-hover:text-green-600 transition-colors">워크샵</div>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1559223607-a43c3004071b?w=120&h=120&fit=crop&crop=center"
                    alt="심포지엄"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-orange-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm group-hover:text-orange-600 transition-colors">심포지엄</div>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=120&h=120&fit=crop&crop=center"
                    alt="국제행사"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-red-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm group-hover:text-red-600 transition-colors">국제행사</div>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1552581234-26160f608093?w=120&h=120&fit=crop&crop=center"
                    alt="온라인세미나"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-indigo-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">온라인세미나</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              {
                id: 1,
                title: "2025 한국교육학회 춘계학술대회",
                date: "2025.07.15-16",
                location: "서울대학교",
                type: "학회",
                participants: 500,
                image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop",
                featured: true
              },
              {
                id: 2,
                title: "디지털 교육혁신 국제 컨퍼런스",
                date: "2025.08.10",
                location: "온라인",
                type: "컨퍼런스",
                participants: 1200,
                image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=200&fit=crop",
                featured: true
              },
              {
                id: 3,
                title: "AI와 교육의 미래 심포지엄",
                date: "2025.08.25",
                location: "COEX",
                type: "심포지엄",
                participants: 300,
                image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop",
                featured: false
              }
            ].map((event) => (
              <Card key={event.id} className={`group hover:shadow-lg transition-all duration-300 overflow-hidden ${event.featured ? 'border-2 border-yellow-400' : ''}`}>
                <div className="relative">
                  <img src={event.image} alt={event.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  {event.featured && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        주목
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-white/90">{event.type}</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3 group-hover:text-blue-600 transition-colors">{event.title}</h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{event.participants}명 예상</span>
                    </div>
                  </div>
                  <Button className="w-full" variant={event.featured ? "default" : "outline"}>
                    {event.featured ? "사전등록" : "관심등록"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>


        </div>
      </section>

      {/* Customer Support */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">고객지원</h2>
            <p className="text-gray-600">연수플랫폼 이용에 도움이 필요하시면 언제든 문의해주세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow bg-white">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">전화 상담</h3>
              <p className="text-gray-600 text-sm mb-3">055-772-2226</p>
              <p className="text-gray-500 text-xs">평일 09:00-18:00</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow bg-white">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">이메일 문의</h3>
              <p className="text-gray-600 text-sm mb-3">bkim@jinuchem.co.kr</p>
              <p className="text-gray-500 text-xs">24시간 접수</p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow bg-white">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">실시간 채팅</h3>
              <p className="text-gray-600 text-sm mb-3">즉시 상담 가능</p>
              <Button size="sm" className="text-xs">채팅 시작</Button>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow bg-white">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">FAQ</h3>
              <p className="text-gray-600 text-sm mb-3">자주 묻는 질문</p>
              <Button variant="outline" size="sm" className="text-xs">FAQ 보기</Button>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 bg-white">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>자주 묻는 질문</span>
                </CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {[
                  "수강신청은 어떻게 하나요?",
                  "수료증은 언제 발급되나요?",
                  "환불 정책이 궁금합니다",
                  "동영상이 재생되지 않아요"
                ].map((question, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <span className="text-sm">{question}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-white">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-green-600" />
                  <span>빠른 서비스</span>
                </CardTitle>
              </CardHeader>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "수강신청", icon: BookOpen },
                  { label: "학습현황", icon: Eye },
                  { label: "수료증", icon: Award },
                  { label: "결제내역", icon: FileText }
                ].map((service, index) => (
                  <Button key={index} variant="outline" className="h-12 flex flex-col items-center space-y-1">
                    <service.icon className="h-4 w-4" />
                    <span className="text-xs">{service.label}</span>
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
      {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
    </div>
  );
}