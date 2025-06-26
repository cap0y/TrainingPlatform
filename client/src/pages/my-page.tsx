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
  Video,
  Plane,
  Eye,
  Download,
  Globe,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface Course {
  id: number;
  title: string;
  credit: number;
  progress?: number;
  category?: string;
}

interface Enrollment {
  id: number;
  status: "enrolled" | "completed" | "cancelled" | "pending";
  course: Course;
  enrolledAt: string;
  progress: number;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  course: Course;
  paymentMethod?: string;
  transactionId?: string;
  user?: {
    name?: string;
    email?: string;
  };
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
}

interface OverseasRegistration {
  id: number;
  user_id: number;
  overseas_id: number;
  status: "registered" | "completed" | "cancelled";
  registered_at: string;
  overseas_program: OverseasProgram;
}

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

interface Seminar {
  id: string;
  title: string;
  date: string;
  location: string;
  status: "registered" | "completed" | "cancelled";
  description?: string;
  speaker?: string;
  createdAt: string;
  link?: string;
  recordingLink?: string;
}

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
  const [downloadingCertificate, setDownloadingCertificate] = useState<
    string | null
  >(null);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Fetch user's enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery<
    Enrollment[]
  >({
    queryKey: ["/api/enrollments"],
    enabled: !!user,
  });

  // Fetch user's payments
  const { data: payments, isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    enabled: !!user,
  });

  // Fetch user's overseas registrations
  const { data: overseasRegistrations, isLoading: overseasLoading } = useQuery<
    OverseasRegistration[]
  >({
    queryKey: ["/api/overseas-registrations", user?.id],
    queryFn: async () => {
      const response = await fetch("/api/overseas-registrations", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch overseas registrations");
      }
      const data = await response.json();
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch user's seminars
  const { data: seminars, isLoading: seminarsLoading } = useQuery<Seminar[]>({
    queryKey: ["/api/seminars"],
    enabled: !!user,
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
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

  // Certificate download function
  const downloadCertificate = async (
    enrollmentId: number,
    courseTitle: string,
  ) => {
    try {
      setDownloadingCertificate(enrollmentId.toString());

      const response = await fetch(
        `/api/user/enrollments/${enrollmentId}/certificate/download`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        throw new Error(`수료증 다운로드에 실패했습니다. (${response.status})`);
      }

      // Content-Type 확인
      const contentType = response.headers.get("content-type");
      console.log("Content-Type:", contentType);

      // 응답이 PDF인지 확인
      if (!contentType || !contentType.includes("application/pdf")) {
        // PDF가 아닌 경우 텍스트로 읽어서 에러 메시지 확인
        const text = await response.text();
        console.error("Expected PDF but got:", text);
        throw new Error("서버에서 PDF 파일을 생성하지 못했습니다.");
      }

      // PDF 파일을 arrayBuffer로 받아서 처리
      const arrayBuffer = await response.arrayBuffer();
      console.log("PDF size:", arrayBuffer.byteLength, "bytes");

      if (arrayBuffer.byteLength === 0) {
        throw new Error("빈 PDF 파일입니다.");
      }

      // Blob 생성 시 명시적으로 PDF 타입 지정
      const blob = new Blob([arrayBuffer], {
        type: "application/pdf",
      });

      // URL 생성 및 다운로드
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${courseTitle.replace(/[^a-zA-Z0-9가-힣\s]/g, "_")}_수료증.pdf`;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: "수료증 다운로드 완료",
        description: `${courseTitle} 수료증이 다운로드되었습니다.`,
      });
    } catch (error) {
      console.error("수료증 다운로드 오류:", error);
      toast({
        title: "다운로드 실패",
        description:
          error instanceof Error
            ? error.message
            : "수료증 다운로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setDownloadingCertificate(null);
    }
  };

  const getStatusBadge = (
    status: string,
  ): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case "enrolled":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
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

  const getSeminarStatusBadge = (status: string) => {
    switch (status) {
      case "registered":
        return <Badge className="bg-blue-500">신청완료</Badge>;
      case "completed":
        return <Badge className="bg-green-500">참석완료</Badge>;
      case "cancelled":
        return <Badge variant="destructive">취소됨</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const calculateStats = () => {
    const enrollmentList = enrollments || [];

    const total = enrollmentList.length;
    const completed = enrollmentList.filter(
      (e) => e.status === "completed",
    ).length;
    const inProgress = enrollmentList.filter(
      (e) => e.status === "enrolled",
    ).length;
    const totalCredits = enrollmentList
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
          <TabsList className="grid w-full grid-cols-6">
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
              value="seminars"
              className="flex items-center space-x-2"
            >
              <Video className="h-4 w-4" />
              <span>세미나</span>
            </TabsTrigger>
            <TabsTrigger
              value="overseas"
              className="flex items-center space-x-2"
            >
              <Plane className="h-4 w-4" />
              <span>해외연수</span>
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
                    {(enrollments || [])
                      .filter((e) => e.status === "enrolled")
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
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      수강 중인 과정이 없습니다
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      새로운 과정을 둘러보고 학습을 시작해보세요.
                    </p>
                    <Button asChild>
                      <Link href="/courses">과정 둘러보기</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrollments?.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col h-full">
                          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                            {enrollment.course.title}
                          </h3>

                          <div className="flex items-center mb-4">
                            <Badge variant={getStatusBadge(enrollment.status)}>
                              {enrollment.status === "enrolled"
                                ? "수강중"
                                : enrollment.status === "completed"
                                  ? "수료"
                                  : enrollment.status === "cancelled"
                                    ? "취소됨"
                                    : "대기중"}
                            </Badge>
                          </div>

                          <div className="flex-grow">
                            <div className="flex justify-between items-center mb-1">
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
                          </div>

                          <div className="mt-auto">
                            <div className="text-sm text-gray-500 mb-3">
                              신청일:{" "}
                              {enrollment.enrolledAt
                                ? new Date(
                                    enrollment.enrolledAt,
                                  ).toLocaleDateString("ko-KR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : "날짜 없음"}
                            </div>
                            <div className="flex justify-end space-x-2">
                              {enrollment.status === "enrolled" && (
                                <Button size="sm" asChild>
                                  <a
                                    href={`/courses/${enrollment.course.id}`}
                                    className="no-underline"
                                  >
                                    학습하기
                                  </a>
                                </Button>
                              )}
                              {enrollment.status === "completed" && (
                                <Button size="sm" variant="outline" asChild>
                                  <a
                                    href={`/api/user/enrollments/${enrollment.id}/certificate`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    수료증 보기
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seminars Tab */}
          <TabsContent value="seminars" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>세미나</CardTitle>
              </CardHeader>
              <CardContent>
                {seminarsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card
                        key={i}
                        className="border-2 border-dashed border-gray-200"
                      >
                        <CardContent className="p-6 text-center animate-pulse">
                          <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4" />
                          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
                          <div className="h-8 bg-gray-200 rounded w-32 mx-auto" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : seminars?.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">신청한 세미나가 없습니다.</p>
                    <Button className="mt-4">세미나 둘러보기</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {seminars?.map((seminar) => (
                      <Card
                        key={seminar.id}
                        className="border-2 border-dashed border-gray-200 hover:border-primary transition-colors"
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <Video className="h-8 w-8 text-primary" />
                            {getSeminarStatusBadge(seminar.status)}
                          </div>
                          <h3 className="font-semibold mb-2">
                            {seminar.title}
                          </h3>
                          <div className="space-y-2 mb-4 text-sm text-gray-600">
                            <p>
                              일시:{" "}
                              {new Date(seminar.date).toLocaleString("ko-KR")}
                            </p>
                            <p>장소: {seminar.location}</p>
                            {seminar.speaker && (
                              <p>강연자: {seminar.speaker}</p>
                            )}
                          </div>
                          <div className="flex justify-end">
                            {seminar.status === "registered" && (
                              <Button size="sm" asChild>
                                <a
                                  href={
                                    seminar.link ||
                                    `https://meet.google.com/seminar/${seminar.id}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  세미나 참여하기
                                </a>
                              </Button>
                            )}
                            {seminar.status === "completed" && (
                              <Button size="sm" variant="outline" asChild>
                                <a
                                  href={
                                    seminar.recordingLink ||
                                    `https://video.example.com/recording/${seminar.id}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  다시보기
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Overseas Training Tab */}
          <TabsContent value="overseas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>해외연수</CardTitle>
              </CardHeader>
              <CardContent>
                {overseasLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="border rounded-lg p-4 animate-pulse"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                          </div>
                          <div className="space-y-2 text-right">
                            <div className="h-4 bg-gray-200 rounded w-24" />
                            <div className="h-3 bg-gray-200 rounded w-16" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : overseasRegistrations?.length === 0 ? (
                  <div className="text-center py-8">
                    <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">신청한 해외연수가 없습니다.</p>
                    <Button className="mt-4" asChild>
                      <Link href="/study-abroad">
                        해외연수 프로그램 둘러보기
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {overseasRegistrations?.map((registration) => (
                      <Card
                        key={registration.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {registration.overseas_program?.title}
                              </h3>
                              <div className="text-sm text-gray-600 flex items-center gap-2">
                                <Badge variant="outline">
                                  {registration.overseas_program?.type}
                                </Badge>
                                <span>
                                  {registration.overseas_program?.destination}
                                </span>
                              </div>
                            </div>
                            <Badge
                              className={
                                registration.status === "registered"
                                  ? "bg-blue-500"
                                  : registration.status === "completed"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                              }
                            >
                              {registration.status === "registered"
                                ? "신청완료"
                                : registration.status === "completed"
                                  ? "연수완료"
                                  : "취소됨"}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-4 text-sm text-gray-600">
                            <p className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              연수 기간:{" "}
                              {registration.overseas_program?.startDate &&
                                new Date(
                                  registration.overseas_program.startDate,
                                ).toLocaleDateString("ko-KR")}{" "}
                              ~{" "}
                              {registration.overseas_program?.endDate &&
                                new Date(
                                  registration.overseas_program.endDate,
                                ).toLocaleDateString("ko-KR")}
                            </p>
                            {registration.overseas_program?.description && (
                              <p className="flex items-center">
                                <Globe className="h-4 w-4 mr-2" />
                                {registration.overseas_program.description}
                              </p>
                            )}
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>
                                신청일:{" "}
                                {registration.registered_at &&
                                  new Date(
                                    registration.registered_at,
                                  ).toLocaleDateString("ko-KR")}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            {registration.status === "registered" &&
                              registration.overseas_program?.id && (
                                <Button size="sm" asChild>
                                  <Link
                                    href={`/study-abroad/${registration.overseas_program.id}`}
                                  >
                                    상세 정보
                                  </Link>
                                </Button>
                              )}
                          </div>
                        </CardContent>
                      </Card>
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
                {enrollmentsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card
                        key={i}
                        className="border-2 border-dashed border-gray-200"
                      >
                        <CardContent className="p-6 text-center animate-pulse">
                          <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4" />
                          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
                          <div className="h-8 bg-gray-200 rounded w-32 mx-auto" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : enrollments?.filter((e) => e.status === "completed")
                    .length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      아직 수료한 과정이 없습니다.
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href="/courses">과정 둘러보기</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrollments
                      ?.filter((e) => e.status === "completed")
                      .map((enrollment) => (
                        <Card
                          key={enrollment.id}
                          className="border-2 border-dashed border-gray-200 hover:border-primary transition-colors"
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <Award className="h-12 w-12 text-primary" />
                              <Badge variant="outline">
                                {enrollment.course?.credit}학점
                              </Badge>
                            </div>
                            <h3 className="font-semibold mb-2 line-clamp-2">
                              {enrollment.course?.title}
                            </h3>
                            <div className="space-y-2 mb-4 text-sm text-gray-600">
                              <p>
                                수료일:{" "}
                                {new Date(
                                  enrollment.enrolledAt,
                                ).toLocaleDateString("ko-KR")}
                              </p>
                              <p>진도율: {enrollment.progress}%</p>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                asChild
                              >
                                <a
                                  href={`/api/user/enrollments/${enrollment.id}/certificate`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  수료증 보기
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
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
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="border rounded-lg p-4 animate-pulse"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                          </div>
                          <div className="space-y-2 text-right">
                            <div className="h-4 bg-gray-200 rounded w-24" />
                            <div className="h-3 bg-gray-200 rounded w-16" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : payments?.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">결제 내역이 없습니다.</p>
                    <Button className="mt-4" asChild>
                      <Link href="/courses">과정 둘러보기</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments?.map((payment) => (
                      <Card
                        key={payment.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg">
                                {payment.course?.title || "과정명 없음"}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {payment.course?.category && (
                                  <Badge variant="outline" className="mr-2">
                                    {payment.course.category}
                                  </Badge>
                                )}
                                결제일:{" "}
                                {new Date(payment.createdAt).toLocaleDateString(
                                  "ko-KR",
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-lg">
                                {Number(payment.amount).toLocaleString()}원
                              </div>
                              <div>{getPaymentStatusBadge(payment.status)}</div>
                            </div>
                          </div>

                          <Separator className="my-4" />

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p className="font-medium mb-1">결제 정보</p>
                              <div className="space-y-1">
                                <p>
                                  결제 방식:{" "}
                                  {payment.paymentMethod || "카드 결제"}
                                </p>
                                <p>거래번호: {payment.transactionId || "-"}</p>
                              </div>
                            </div>
                            <div>
                              <p className="font-medium mb-1">구매자 정보</p>
                              <div className="space-y-1">
                                <p>이름: {payment.user?.name || "-"}</p>
                                <p>이메일: {payment.user?.email || "-"}</p>
                              </div>
                            </div>
                          </div>

                          {payment.status === "completed" && (
                            <div className="mt-4 flex justify-end">
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                영수증 다운로드
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
