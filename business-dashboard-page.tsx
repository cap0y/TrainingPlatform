import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, BookOpen, Users, TrendingUp, CheckCircle, Clock } from "lucide-react";
import CourseManagement from "@/components/business/course-management";
import SeminarManagement from "@/components/business/seminar-management";
import OverseasManagement from "@/components/business/overseas-management";
import StudentManagement from "@/components/business/student-management";

export default function BusinessDashboardPage() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // URL 파라미터에서 탭 확인
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'dashboard';
  
  const [activeTab, setActiveTab] = useState(initialTab);

  // 내 강의 목록 조회
  const { data: myCourses } = useQuery<{ courses: any[]; total: number }>({
    queryKey: [`/api/business/courses/${user?.id}`, user?.id],
    enabled: !!user?.id,
  });

  // 수강생 통계 조회
  const { data: enrollmentStats } = useQuery<{ total: number }>({
    queryKey: ["/api/business/enrollment-stats", user?.id],
    enabled: !!user?.id,
  });

  // 매출 통계 조회
  const { data: revenueStats } = useQuery<{ monthly: number; yearly: number; total: number }>({
    queryKey: ["/api/business/revenue-stats", user?.id],
    enabled: !!user?.id,
  });

  // 대시보드 통계
  const stats = {
    totalCourses: myCourses?.courses?.length || 0,
    activeCourses: myCourses?.courses?.filter(c => c.status === "active").length || 0,
    pendingCourses: myCourses?.courses?.filter(c => c.approvalStatus === "pending").length || 0,
    totalStudents: enrollmentStats?.total || 0,
    monthlyRevenue: revenueStats?.monthly || 0,
  };

  const getStatusBadge = (course: any) => {
    if (course.approvalStatus === "pending") {
      return <Badge variant="outline" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />승인 대기</Badge>;
    }
    if (course.approvalStatus === "rejected") {
      return <Badge variant="destructive"><Clock className="h-3 w-3 mr-1" />승인 거부</Badge>;
    }
    if (course.status === "active") {
      return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />운영 중</Badge>;
    }
    return <Badge variant="secondary">비활성</Badge>;
  };

  // 기관/사업자 회원이 아니면 접근 제한
  if (user?.userType !== "business") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-6">이 페이지는 기관/사업자 회원만 접근할 수 있습니다.</p>
          <Button onClick={() => window.history.back()}>이전 페이지로</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">기관 관리자 대시보드</h1>
            <p className="text-gray-600">{user?.organizationName || user?.username}님 환영합니다</p>
          </div>
          {user?.isApproved ? (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              승인된 기관
            </Badge>
          ) : (
            <Badge variant="outline" className="text-yellow-600">
              <Clock className="h-4 w-4 mr-2" />
              승인 대기
            </Badge>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            <TabsTrigger value="courses">강의 관리</TabsTrigger>
            <TabsTrigger value="seminars">세미나 관리</TabsTrigger>
            <TabsTrigger value="overseas">해외연수 관리</TabsTrigger>
            <TabsTrigger value="students">수강생 관리</TabsTrigger>
            <TabsTrigger value="analytics">분석</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 강의 수</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCourses}</div>
                  <p className="text-xs text-muted-foreground">등록된 강의</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">운영 중 강의</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeCourses}</div>
                  <p className="text-xs text-muted-foreground">승인된 강의</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingCourses}</div>
                  <p className="text-xs text-muted-foreground">검토 중</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 수강생</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">전체 수강생</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">월 매출</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₩{(stats.monthlyRevenue / 1000000).toFixed(1)}M</div>
                  <p className="text-xs text-muted-foreground">이번 달</p>
                </CardContent>
              </Card>
            </div>

            {/* 최근 등록한 강의 */}
            <Card>
              <CardHeader>
                <CardTitle>최근 등록한 강의</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myCourses?.courses?.slice(0, 5).map((course) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-gray-500">{course.category} • {course.duration}</p>
                      </div>
                      {getStatusBadge(course)}
                    </div>
                  ))}
                  {(!myCourses?.courses || myCourses.courses.length === 0) && (
                    <p className="text-center text-gray-500 py-4">등록된 강의가 없습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Management Tab */}
          <TabsContent value="courses" className="space-y-6">
            <CourseManagement user={user} />
          </TabsContent>

          {/* Seminars Management Tab */}
          <TabsContent value="seminars" className="space-y-6">
            <SeminarManagement user={user} />
          </TabsContent>

          {/* Overseas Management Tab */}
          <TabsContent value="overseas" className="space-y-6">
            <OverseasManagement user={user} />
          </TabsContent>

          {/* Students Management Tab */}
          <TabsContent value="students" className="space-y-6">
            <StudentManagement user={user} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>매출 및 수강 통계</CardTitle>
                <CardDescription>
                  강의별 매출과 수강생 통계를 확인할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">분석 대시보드</h3>
                  <p className="text-gray-500">
                    매출 통계, 수강생 분석, 강의별 성과 등을 확인할 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}