import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ChatWidget from "@/components/chat/chat-widget";
import CourseCard from "@/components/ui/course-card";
import NotificationPanel from "@/components/ui/notification-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { 
  BookOpen, 
  Users, 
  Award, 
  Calendar, 
  Star, 
  Clock, 
  Globe,
  Video,
  FileQuestion,
  Laptop,
  Target,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Play,
  MapPin,
  Eye,
  Heart,
  MessageCircle,
  Phone,
  Mail,
  HelpCircle,
  FileText,
  Settings,
  Zap
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("popular");

  // Fetch featured courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses", { limit: 6 }],
  });

  // Fetch recent notices
  const { data: noticesData, isLoading: noticesLoading } = useQuery({
    queryKey: ["/api/notices", { limit: 5 }],
  });

  // Fetch recommended seminars
  const { data: seminarsData, isLoading: seminarsLoading } = useQuery({
    queryKey: ["/api/seminars", { limit: 4 }],
  });

  // Fetch statistics for display
  const { data: statsData } = useQuery({
    queryKey: ["/api/stats"],
    enabled: user?.isAdmin,
  });

  return (
    <div className="min-h-screen bg-gray-50 font-korean">
      <Header onNotificationClick={() => setShowNotifications(!showNotifications)} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=600&fit=crop&crop=center" 
            alt="Modern Education Platform"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">전문가를 위한 최고의 연수교육 플랫폼</h1>
            <p className="text-xl text-blue-100 mb-6">
              교육전문가의 역량 강화와 전문성 개발을 위한 다양한 연수과정과 세미나를 제공합니다.
            </p>
            <div className="flex space-x-4">
              <Link href="/courses">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  연수과정 보기
                </Button>
              </Link>
              <Link href="/seminars">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  세미나 신청
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">카테고리별 교육과정</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link href="/training-courses?category=법정의무교육">
              <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 cursor-pointer bg-blue-50 hover:bg-blue-100 group">
                <CardContent className="p-0">
                  <div className="relative w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-3 mx-auto overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center" 
                      alt="법정의무교육"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-20"></div>
                    <BookOpen className="absolute text-white text-xl" />
                  </div>
                  <div className="font-medium text-gray-800 mb-1 text-sm">법정 의무교육</div>
                  <div className="text-xs text-gray-500">화학물질 법정교육</div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/professional-development">
              <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 cursor-pointer hover:bg-purple-50 group">
                <CardContent className="p-0">
                  <div className="relative w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-3 mx-auto overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=100&h=100&fit=crop&crop=center" 
                      alt="전문성강화교육"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-purple-600 bg-opacity-20"></div>
                    <Award className="absolute text-white text-xl" />
                  </div>
                  <div className="font-medium text-gray-800 mb-1 text-sm">전문성 강화교육</div>
                  <div className="text-xs text-gray-500">역량개발 프로그램</div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/certificate-courses">
              <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 cursor-pointer hover:bg-green-50 group">
                <CardContent className="p-0">
                  <div className="relative w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-3 mx-auto overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop&crop=center" 
                      alt="자격증과정"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-green-600 bg-opacity-20"></div>
                    <Award className="absolute text-white text-xl" />
                  </div>
                  <div className="font-medium text-gray-800 mb-1 text-sm">자격증 과정</div>
                  <div className="text-xs text-gray-500">공인자격 취득</div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/seminars">
              <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 cursor-pointer hover:bg-yellow-50 group">
                <CardContent className="p-0">
                  <div className="relative w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mb-3 mx-auto overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=100&h=100&fit=crop&crop=center" 
                      alt="세미나"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-yellow-600 bg-opacity-20"></div>
                    <Users className="absolute text-white text-xl" />
                  </div>
                  <div className="font-medium text-gray-800 mb-1 text-sm">세미나</div>
                  <div className="text-xs text-gray-500">학회/컨퍼런스</div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/study-abroad">
              <Card className="p-4 text-center hover:shadow-lg transition-all duration-300 cursor-pointer hover:bg-red-50 group">
                <CardContent className="p-0">
                  <div className="relative w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-3 mx-auto overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100&h=100&fit=crop&crop=center" 
                      alt="해외연수"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-red-600 bg-opacity-20"></div>
                    <Globe className="absolute text-white text-xl" />
                  </div>
                  <div className="font-medium text-gray-800 mb-1 text-sm">해외연수</div>
                  <div className="text-xs text-gray-500">글로벌 프로그램</div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/help">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer hover:bg-gray-50">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <i className="fas fa-question-circle text-2xl text-gray-600"></i>
                  </div>
                  <div className="font-medium text-gray-800 mb-1">고객센터</div>
                  <div className="text-xs text-gray-500">문의/도움말</div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">총 연수과정</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {coursesData?.total || 0}
                  </p>
                </div>
                <div className="p-3 bg-primary bg-opacity-10 rounded-full">
                  <i className="fas fa-book text-primary text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">가입 회원</p>
                  <p className="text-2xl font-bold text-gray-900">15,823</p>
                </div>
                <div className="p-3 bg-accent bg-opacity-10 rounded-full">
                  <i className="fas fa-users text-accent text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">진행중 세미나</p>
                  <p className="text-2xl font-bold text-gray-900">18</p>
                </div>
                <div className="p-3 bg-warning bg-opacity-10 rounded-full">
                  <i className="fas fa-chalkboard-teacher text-warning text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">만족도</p>
                  <p className="text-2xl font-bold text-gray-900">4.8/5.0</p>
                </div>
                <div className="p-3 bg-yellow-500 bg-opacity-10 rounded-full">
                  <i className="fas fa-star text-yellow-500 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">추천 연수과정</h2>
          <Link href="/courses">
            <Button variant="ghost" className="text-primary hover:text-blue-700">
              전체 보기 →
            </Button>
          </Link>
        </div>
        
        {coursesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse">
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
      </section>

      {/* Announcements */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">공지사항</h3>
                <Link href="/notices">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
                    더보기
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {noticesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 animate-pulse">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  noticesData?.notices?.slice(0, 3).map((notice) => (
                    <div key={notice.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium mr-2">
                          {notice.category}
                        </span>
                        <span className="text-gray-900 hover:text-primary cursor-pointer">
                          {notice.title}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(notice.createdAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">실시간 채팅 지원</h3>
              </div>
              <div className="text-center py-8">
                <i className="fas fa-comments text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 mb-4">궁금한 점이 있으시면 실시간 채팅으로 문의해 주세요.</p>
                <Button className="bg-accent text-white hover:bg-green-600">
                  채팅 시작하기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
      <ChatWidget />
      
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}
    </div>
  );
}
