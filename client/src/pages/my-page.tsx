import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Calendar,
  CreditCard,
  User,
  Settings,
  Award,
  Clock,
  CheckCircle,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MyPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // 기관 회원인 경우 기관 대시보드로 리다이렉트
  if (user.userType === "business") {
    return <Redirect to="/business-dashboard" />;
  }

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Fetch user's enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/enrollments"],
    enabled: !!user,
  });

  // Fetch user's payments
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/payments"],
    enabled: !!user,
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      return apiRequest("PUT", `/api/users/${user?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "프로필 업데이트 완료",
        description: "성공적으로 업데이트되었습니다.",
      });
      setShowProfileDialog(false);
    },
    onError: (error) => {
      toast({
        title: "업데이트 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "enrolled":
        return <Badge className="bg-blue-500">수강중</Badge>;
      case "completed":
        return <Badge className="bg-green-500">수료</Badge>;
      case "cancelled":
        return <Badge variant="secondary">취소</Badge>;
      default:
        return <Badge variant="outline">대기</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">완료</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">대기</Badge>;
      case "failed":
        return <Badge variant="destructive">실패</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const calculateStats = () => {
    if (!enrollments)
      return { total: 0, completed: 0, inProgress: 0, totalCredits: 0 };

    const total = enrollments.length;
    const completed = enrollments.filter(
      (e) => e.status === "completed",
    ).length;
    const inProgress = enrollments.filter(
      (e) => e.status === "enrolled",
    ).length;
    const totalCredits = enrollments
      .filter((e) => e.status === "completed")
      .reduce((sum, e) => sum + (e.course?.credit || 0), 0);

    return { total, completed, inProgress, totalCredits };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-8 mb-8">
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl bg-white text-primary">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {user?.name || "사용자"}님
              </h1>
              <p className="text-blue-100 mb-4">{user?.email}</p>
              <div className="flex space-x-6 text-sm">
                <div>
                  <span className="text-blue-200">가입 유형</span>
                  <div className="font-medium">
                    {user?.userType === "individual" ? "개인회원" : "기관회원"}
                  </div>
                </div>
                <div>
                  <span className="text-blue-200">총 학점</span>
                  <div className="font-medium">{stats.totalCredits}학점</div>
                </div>
                <div>
                  <span className="text-blue-200">수료 과정</span>
                  <div className="font-medium">{stats.completed}개</div>
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowProfileDialog(true)}
            >
              프로필 수정
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger
              value="dashboard"
              className="flex items-center space-x-2"
            >
              <User className="h-4 w-4" />
              <span>대시보드</span>
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="flex items-center space-x-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>수강 과정</span>
            </TabsTrigger>
            <TabsTrigger
              value="certificates"
              className="flex items-center space-x-2"
            >
              <Award className="h-4 w-4" />
              <span>수료증</span>
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="flex items-center space-x-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>결제 내역</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>설정</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    총 수강 과정
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    누적 수강 과정
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">수강중</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.inProgress}
                  </div>
                  <p className="text-xs text-muted-foreground">진행중인 과정</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    수료 완료
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </div>
                  <p className="text-xs text-muted-foreground">완료된 과정</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    취득 학점
                  </CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.totalCredits}
                  </div>
                  <p className="text-xs text-muted-foreground">총 학점</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>최근 수강 과정</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enrollmentsLoading
                      ? Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))
                      : enrollments?.slice(0, 3).map((enrollment) => (
                          <div
                            key={enrollment.id}
                            className="flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium">
                                {enrollment.course?.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                진행률: {enrollment.progress || 0}%
                              </p>
                            </div>
                            {getStatusBadge(enrollment.status)}
                          </div>
                        ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>학습 진행률</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enrollments
                      ?.filter((e) => e.status === "enrolled")
                      .slice(0, 3)
                      .map((enrollment) => (
                        <div key={enrollment.id}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">
                              {enrollment.course?.title}
                            </span>
                            <span className="text-sm text-gray-500">
                              {enrollment.progress || 0}%
                            </span>
                          </div>
                          <Progress
                            value={enrollment.progress || 0}
                            className="h-2"
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>내 수강 과정</CardTitle>
              </CardHeader>
              <CardContent>
                {enrollmentsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="border rounded-lg p-4 animate-pulse"
                      >
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : enrollments?.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">수강 중인 과정이 없습니다.</p>
                    <Button className="mt-4">과정 둘러보기</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrollments?.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {enrollment.course?.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {enrollment.course?.category}
                            </p>
                          </div>
                          {getStatusBadge(enrollment.status)}
                        </div>

                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-600">
                            학습 진행률
                          </span>
                          <span className="text-sm font-medium">
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                        <Progress
                          value={enrollment.progress || 0}
                          className="mb-3"
                        />

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            신청일:{" "}
                            {new Date(enrollment.enrolledAt).toLocaleDateString(
                              "ko-KR",
                            )}
                          </div>
                          <div className="space-x-2">
                            {enrollment.status === "enrolled" && (
                              <Button size="sm">학습하기</Button>
                            )}
                            {enrollment.status === "completed" && (
                              <Button size="sm" variant="outline">
                                수료증 보기
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>수료증</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrollments
                    ?.filter((e) => e.status === "completed")
                    .map((enrollment) => (
                      <Card
                        key={enrollment.id}
                        className="border-2 border-dashed border-gray-200 hover:border-primary transition-colors"
                      >
                        <CardContent className="p-6 text-center">
                          <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                          <h3 className="font-semibold mb-2">
                            {enrollment.course?.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {enrollment.course?.credit}학점
                          </p>
                          <Button size="sm" variant="outline">
                            수료증 다운로드
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>결제 내역</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="border rounded-lg p-4 animate-pulse"
                      >
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : payments?.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">결제 내역이 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments?.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">
                              {payment.course?.title || "과정명 없음"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(payment.createdAt).toLocaleDateString(
                                "ko-KR",
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {Number(payment.amount).toLocaleString()}원
                            </div>
                            {getPaymentStatusBadge(payment.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>계정 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>이름</Label>
                    <Input value={user?.name || ""} disabled />
                  </div>
                  <div>
                    <Label>이메일</Label>
                    <Input value={user?.email || ""} disabled />
                  </div>
                  <div>
                    <Label>회원 유형</Label>
                    <Input
                      value={
                        user?.userType === "individual"
                          ? "개인회원"
                          : "기관회원"
                      }
                      disabled
                    />
                  </div>
                  <Button onClick={() => setShowProfileDialog(true)}>
                    프로필 수정
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>알림 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>이메일 알림</Label>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>SMS 알림</Label>
                    <input type="checkbox" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>마케팅 정보 수신</Label>
                    <input type="checkbox" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로필 수정</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="phone">휴대폰 번호</Label>
              <Input
                id="phone"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProfileDialog(false)}
            >
              취소
            </Button>
            <Button
              onClick={() => updateProfileMutation.mutate(profileForm)}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "업데이트 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
