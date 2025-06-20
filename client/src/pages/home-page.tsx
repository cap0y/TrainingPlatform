import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ChatWidget from "@/components/chat/chat-widget";
import CourseCard from "@/components/ui/course-card";
import NotificationPanel from "@/components/ui/notification-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function HomePage() {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch featured courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses", { limit: 6 }],
  });

  // Fetch recent notices
  const { data: noticesData, isLoading: noticesLoading } = useQuery({
    queryKey: ["/api/notices", { limit: 5 }],
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
      <section className="bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">전문가를 위한 최고의 연수교육 플랫폼</h1>
            <p className="text-xl text-blue-100 mb-6">
              교육전문가의 역량 강화와 전문성 개발을 위한 다양한 연수과정과 세미나를 제공합니다.
            </p>
            <div className="flex space-x-4">
              <Link href="/courses">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                  연수과정 보기
                </Button>
              </Link>
              <Link href="/seminars">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  세미나 신청
                </Button>
              </Link>
            </div>
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
