import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  Users,
  BookOpen,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  UserCheck,
  UserX,
  Check,
  X,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DashboardStats {
  totalUsers: number;
  businessUsers: number;
  pendingBusinesses: number;
  totalCourses: number;
  pendingCourses: number;
  monthlyRevenue: number;
}

interface PendingBusiness {
  id: number;
  organizationName: string;
  representativeName: string;
  businessNumber: string;
  email: string;
  createdAt: string;
}

interface PendingCourse {
  id: number;
  title: string;
  providerName: string;
  category: string;
  type: string;
  price: number;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  userType: string;
  role: string;
  createdAt: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  isApproved: boolean;
  organizationName?: string;
  businessNumber?: string;
  representativeName?: string;
  updatedAt?: string;
}

interface UserStats {
  totalEnrollments: number;
  totalPayments: number;
  totalSpent: number;
  totalCourses: number;
  lastLoginDate: string;
}

interface UserDetails {
  user: User;
  stats?: UserStats;
  enrollments?: any[];
  payments?: any[];
  courses?: any[];
}

interface SelectedItem {
  id: number;
  type: string;
  organizationName?: string;
  title?: string;
}

interface AnalyticsStats {
  userGrowthRate: number;
  revenueGrowthRate: number;
  monthlyUserGrowth: Array<{
    month: string;
    users: number;
    individual: number;
    business: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  coursesByCategory: Array<{
    category: string;
    count: number;
  }>;
  topCourses: Array<{
    id: number;
    title: string;
    category: string;
    enrollments: number;
    price: number;
  }>;
  totalStats: {
    totalUsers: number;
    businessUsers: number;
    individualUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
    averageRevenuePerUser: number;
  };
}

export default function SuperAdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState(""); // "approve" or "reject"
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [showUserDetailDialog, setShowUserDetailDialog] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] =
    useState<User | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [showAnswerDialog, setShowAnswerDialog] = useState(false);
  const [answerText, setAnswerText] = useState("");

  // 대시보드 통계 조회
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard-stats"],
  });

  // 분석 통계 조회
  const {
    data: analyticsStats,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery<AnalyticsStats>({
    queryKey: ["/api/admin/analytics-stats"],
    enabled: activeTab === "analytics",
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 디버깅을 위한 로그
  console.log("Super Admin Dashboard Data:", {
    dashboardStats,
    isLoading: statsLoading,
    error: statsError,
  });

  console.log("Analytics Data:", {
    analyticsStats,
    isLoading: analyticsLoading,
    error: analyticsError,
  });

  // 기관 승인 대기 목록
  const { data: pendingBusinesses, isLoading: businessesLoading } = useQuery<
    PendingBusiness[]
  >({
    queryKey: ["/api/admin/pending-businesses"],
  });

  // 강의 승인 대기 목록
  const { data: pendingCourses, isLoading: coursesLoading } = useQuery<
    PendingCourse[]
  >({
    queryKey: ["/api/admin/pending-courses"],
  });

  // 전체 사용자 목록
  const { data: allUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // 사용자 상세 정보 쿼리
  const {
    data: userDetails,
    isLoading: userDetailsLoading,
    error: userDetailsError,
  } = useQuery<UserDetails>({
    queryKey: ["/api/admin/users", selectedUserForDetail?.id, "details"],
    enabled: !!selectedUserForDetail?.id,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 문의사항 조회
  const {
    data: inquiriesData,
    isLoading: inquiriesLoading,
    refetch: refetchInquiries,
  } = useQuery({
    queryKey: ["/api/inquiries"],
    queryFn: () =>
      fetch("/api/inquiries", {
        credentials: "include",
      }).then((res) => res.json()),
    enabled: activeTab === "inquiries",
  });

  // 기관 승인/거부 mutation
  const businessApprovalMutation = useMutation({
    mutationFn: async (variables: {
      businessId: number;
      action: string;
      reason?: string;
    }) => {
      return apiRequest(
        "PUT",
        `/api/admin/business-approval/${variables.businessId}`,
        {
          action: variables.action,
          reason: variables.reason,
        },
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/pending-businesses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/dashboard-stats"],
      });
      toast({
        title:
          variables.action === "approve" ? "기관 승인 완료" : "기관 승인 거부",
        description:
          variables.action === "approve"
            ? "기관이 승인되었습니다."
            : "기관 승인이 거부되었습니다.",
      });
      setShowApprovalDialog(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "처리 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 강의 승인/거부 mutation
  const courseApprovalMutation = useMutation({
    mutationFn: async (variables: {
      courseId: number;
      action: string;
      reason?: string;
    }) => {
      return apiRequest(
        "PUT",
        `/api/admin/course-approval/${variables.courseId}`,
        {
          action: variables.action,
          reason: variables.reason,
        },
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/pending-courses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/dashboard-stats"],
      });
      toast({
        title:
          variables.action === "approve" ? "강의 승인 완료" : "강의 승인 거부",
        description:
          variables.action === "approve"
            ? "강의가 승인되었습니다."
            : "강의 승인이 거부되었습니다.",
      });
      setShowApprovalDialog(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "처리 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 사용자 삭제 mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/dashboard-stats"],
      });
      toast({
        title: "사용자 삭제 완료",
        description: "사용자가 성공적으로 삭제되었습니다.",
      });
      setShowDeleteDialog(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 문의사항 답변 mutation
  const answerInquiryMutation = useMutation({
    mutationFn: async (variables: { inquiryId: number; answer: string }) => {
      return apiRequest("PUT", `/api/inquiries/${variables.inquiryId}/answer`, {
        answer: variables.answer,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      toast({
        title: "답변 완료",
        description: "문의사항에 답변이 등록되었습니다.",
      });
      setShowAnswerDialog(false);
      setSelectedInquiry(null);
      setAnswerText("");
    },
    onError: (error: any) => {
      toast({
        title: "답변 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApproval = (item: any, action: string, type: string) => {
    setSelectedItem({ ...item, type });
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleViewUserDetail = (user: User) => {
    setSelectedUserForDetail(user);
    setShowUserDetailDialog(true);
  };

  const confirmUserDelete = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const confirmApproval = () => {
    if (!selectedItem) return;

    if (selectedItem.type === "business") {
      businessApprovalMutation.mutate({
        businessId: selectedItem.id,
        action: approvalAction,
        reason: approvalAction === "reject" ? "승인 요건 미충족" : "",
      });
    } else if (selectedItem.type === "course") {
      courseApprovalMutation.mutate({
        courseId: selectedItem.id,
        action: approvalAction,
        reason: approvalAction === "reject" ? "승인 요건 미충족" : "",
      });
    }
  };

  const handleAnswerInquiry = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setAnswerText("");
    setShowAnswerDialog(true);
  };

  const confirmAnswer = () => {
    if (!answerText.trim()) {
      toast({
        title: "입력 오류",
        description: "답변 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    answerInquiryMutation.mutate({
      inquiryId: selectedInquiry.id,
      answer: answerText,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">답변 대기</Badge>;
      case "answered":
        return <Badge variant="default">답변 완료</Badge>;
      case "closed":
        return <Badge variant="outline">종료</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      product: "상품 문의",
      payment: "결제 문의",
      delivery: "배송 문의",
      refund: "환불/교환",
      account: "계정 관리",
      general: "일반 문의",
      etc: "기타 문의",
    };
    return typeMap[type] || type;
  };

  // 관리자가 아니면 접근 제한
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            접근 권한이 없습니다
          </h1>
          <p className="text-gray-600 mb-6">
            이 페이지는 관리자만 접근할 수 있습니다.
          </p>
          <Button onClick={() => window.history.back()}>이전 페이지로</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const stats: DashboardStats = dashboardStats || {
    totalUsers: 0,
    businessUsers: 0,
    pendingBusinesses: 0,
    totalCourses: 0,
    pendingCourses: 0,
    monthlyRevenue: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              슈퍼 관리자 대시보드
            </h1>
            <p className="text-gray-600">전체 플랫폼 관리 및 승인 업무</p>
          </div>
          <Badge variant="default" className="bg-red-600">
            <Shield className="h-4 w-4 mr-2" />
            슈퍼 관리자
          </Badge>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            <TabsTrigger value="business-approval">기관 승인</TabsTrigger>
            <TabsTrigger value="course-approval">강의 승인</TabsTrigger>
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="inquiries">문의사항 관리</TabsTrigger>
            <TabsTrigger value="analytics">분석</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : statsError ? (
              <Card className="p-6 text-center">
                <div className="text-red-600 mb-2">통계 로드 실패</div>
                <div className="text-sm text-gray-600">
                  {statsError.message}
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      총 사용자
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalUsers || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">전체 회원</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      기관 회원
                    </CardTitle>
                    <Shield className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.businessUsers || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">승인된 기관</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      기관 승인 대기
                    </CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.pendingBusinesses || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">검토 필요</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      총 강의
                    </CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalCourses || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">전체 강의</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      강의 승인 대기
                    </CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.pendingCourses || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">검토 필요</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      월 매출
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₩{(stats.monthlyRevenue || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">이번 달</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 빠른 작업 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>승인 대기 기관</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingBusinesses?.slice(0, 5).map((business) => (
                      <div
                        key={business.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">
                            {business.organizationName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {business.email}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleApproval(business, "approve", "business")
                            }
                          >
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleApproval(business, "reject", "business")
                            }
                          >
                            거부
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!pendingBusinesses || pendingBusinesses.length === 0) && (
                      <p className="text-center text-gray-500 py-4">
                        승인 대기 중인 기관이 없습니다.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>승인 대기 강의</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingCourses?.slice(0, 5).map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-gray-500">
                            {course.providerName} • {course.category}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleApproval(course, "approve", "course")
                            }
                          >
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleApproval(course, "reject", "course")
                            }
                          >
                            거부
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!pendingCourses || pendingCourses.length === 0) && (
                      <p className="text-center text-gray-500 py-4">
                        승인 대기 중인 강의가 없습니다.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Business Approval Tab */}
          <TabsContent value="business-approval" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">기관 승인 관리</h2>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="기관명 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>기관명</TableHead>
                    <TableHead>대표자</TableHead>
                    <TableHead>사업자번호</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>신청일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businessesLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={7}>
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </TableCell>
                        </TableRow>
                      ))
                    : pendingBusinesses
                        ?.filter((business) =>
                          business.organizationName
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                        )
                        .map((business) => (
                          <TableRow key={business.id}>
                            <TableCell className="font-medium">
                              {business.organizationName}
                            </TableCell>
                            <TableCell>{business.representativeName}</TableCell>
                            <TableCell>{business.businessNumber}</TableCell>
                            <TableCell>{business.email}</TableCell>
                            <TableCell>
                              {new Date(
                                business.createdAt,
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-yellow-600"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                승인 대기
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleApproval(
                                      business,
                                      "approve",
                                      "business",
                                    )
                                  }
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleApproval(
                                      business,
                                      "reject",
                                      "business",
                                    )
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Course Approval Tab */}
          <TabsContent value="course-approval" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">강의 승인 관리</h2>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="강의명 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>강의명</TableHead>
                    <TableHead>제공기관</TableHead>
                    <TableHead>분야</TableHead>
                    <TableHead>형태</TableHead>
                    <TableHead>가격</TableHead>
                    <TableHead>등록일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coursesLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={8}>
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </TableCell>
                        </TableRow>
                      ))
                    : pendingCourses
                        ?.filter((course) =>
                          course.title
                            ?.toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                        )
                        .map((course) => (
                          <TableRow key={course.id}>
                            <TableCell className="font-medium">
                              {course.title}
                            </TableCell>
                            <TableCell>{course.providerName}</TableCell>
                            <TableCell>{course.category}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{course.type}</Badge>
                            </TableCell>
                            <TableCell>
                              {course.price?.toLocaleString()}원
                            </TableCell>
                            <TableCell>
                              {new Date(course.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-yellow-600"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                승인 대기
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleApproval(course, "approve", "course")
                                  }
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleApproval(course, "reject", "course")
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">사용자 관리</h2>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="사용자명 검색..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용자명</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading
                    ? Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={7}>
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </TableCell>
                        </TableRow>
                      ))
                    : allUsers
                        ?.filter(
                          (user: any) =>
                            user.username
                              ?.toLowerCase()
                              .includes(userSearchQuery.toLowerCase()) ||
                            user.email
                              ?.toLowerCase()
                              .includes(userSearchQuery.toLowerCase()) ||
                            user.name
                              ?.toLowerCase()
                              .includes(userSearchQuery.toLowerCase()),
                        )
                        .map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.username}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.userType === "business"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {user.userType === "business" ? "기관" : "개인"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.role === "admin"
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                {user.role === "admin" ? "관리자" : "일반"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleViewUserDetail(user)}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    상세 보기
                                  </DropdownMenuItem>
                                  {user.role !== "admin" && (
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteUser(user)}
                                      className="text-red-600"
                                    >
                                      <UserX className="mr-2 h-4 w-4" />
                                      사용자 삭제
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                </TableBody>
              </Table>

              {(!allUsers || allUsers.length === 0) && !usersLoading && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    사용자가 없습니다
                  </h3>
                  <p className="text-gray-500">등록된 사용자가 없습니다.</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* 문의사항 관리 탭 */}
          <TabsContent value="inquiries">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <i className="fas fa-comments text-blue-600"></i>
                  문의사항 관리
                </CardTitle>
                <CardDescription>
                  고객 문의사항을 확인하고 답변을 등록할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inquiriesLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">문의사항을 불러오는 중...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiriesData?.inquiries?.map((inquiry: any) => (
                      <Card
                        key={inquiry.id}
                        className={`p-4 ${inquiry.isPrivate ? "border-orange-200 bg-orange-50" : ""}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(inquiry.status)}
                            <Badge variant="outline">
                              {getTypeName(inquiry.type)}
                            </Badge>
                            {inquiry.isPrivate && (
                              <Badge
                                variant="outline"
                                className="text-orange-600 border-orange-600 bg-orange-100"
                              >
                                <i className="fas fa-lock mr-1"></i>
                                비밀글
                              </Badge>
                            )}
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div>{formatDate(inquiry.createdAt)}</div>
                            <div>
                              {inquiry.userName} ({inquiry.userEmail})
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center mb-2">
                          {inquiry.isPrivate && (
                            <i className="fas fa-lock text-orange-600 mr-2"></i>
                          )}
                          <h4 className="font-semibold">{inquiry.title}</h4>
                        </div>
                        <p className="text-gray-600 mb-4 whitespace-pre-wrap">
                          {inquiry.content}
                        </p>

                        {inquiry.answer ? (
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <i className="fas fa-reply text-blue-600 mr-2"></i>
                              <span className="font-medium text-blue-600">
                                답변
                              </span>
                              <span className="text-sm text-gray-500 ml-auto">
                                {formatDate(inquiry.answeredAt)} |{" "}
                                {inquiry.answererName || "관리자"}
                              </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {inquiry.answer}
                            </p>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              onClick={() => handleAnswerInquiry(inquiry)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <i className="fas fa-reply mr-2"></i>
                              답변하기
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}

                    {inquiriesData?.inquiries?.length === 0 && (
                      <div className="text-center py-12">
                        <i className="fas fa-comments text-4xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500">등록된 문의가 없습니다.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analyticsLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                  </Card>
                ))}
              </div>
            ) : analyticsError ? (
              <Card className="p-6 text-center">
                <div className="text-red-600 mb-2">분석 데이터 로드 실패</div>
                <div className="text-sm text-gray-600">
                  {analyticsError.message}
                </div>
              </Card>
            ) : analyticsStats ? (
              <div className="space-y-6">
                {/* 주요 성장률 지표 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">
                          사용자 증가율
                        </p>
                        <p className="text-2xl font-bold text-blue-800">
                          {analyticsStats.userGrowthRate > 0 ? "+" : ""}
                          {analyticsStats.userGrowthRate}%
                        </p>
                        <p className="text-xs text-blue-600">전월 대비</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">
                          매출 증가율
                        </p>
                        <p className="text-2xl font-bold text-green-800">
                          {analyticsStats.revenueGrowthRate > 0 ? "+" : ""}
                          {analyticsStats.revenueGrowthRate}%
                        </p>
                        <p className="text-xs text-green-600">전월 대비</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-green-600" />
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">
                          총 매출
                        </p>
                        <p className="text-2xl font-bold text-purple-800">
                          ₩
                          {analyticsStats.totalStats.totalRevenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-purple-600">누적</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-r from-orange-50 to-orange-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-600">
                          사용자당 평균 매출
                        </p>
                        <p className="text-2xl font-bold text-orange-800">
                          ₩
                          {analyticsStats.totalStats.averageRevenuePerUser.toLocaleString()}
                        </p>
                        <p className="text-xs text-orange-600">ARPU</p>
                      </div>
                      <Users className="h-8 w-8 text-orange-600" />
                    </div>
                  </Card>
                </div>

                {/* 월별 사용자 증가 차트 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold">
                        월별 신규 사용자
                      </CardTitle>
                      <CardDescription>
                        최근 6개월 사용자 증가 추이
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsStats.monthlyUserGrowth.map((data, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 text-sm font-medium">
                                {data.month}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <div className="h-2 bg-gray-200 rounded-full flex-1 max-w-32">
                                    <div
                                      className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${Math.min(100, (data.users / Math.max(...analyticsStats.monthlyUserGrowth.map((d) => d.users))) * 100)}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <div className="text-sm font-medium w-8">
                                    {data.users}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  개인: {data.individual} | 기관:{" "}
                                  {data.business}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 월별 매출 차트 */}
                  <Card className="p-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold">
                        월별 매출
                      </CardTitle>
                      <CardDescription>최근 6개월 매출 추이</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsStats.monthlyRevenue.map((data, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 text-sm font-medium">
                                {data.month}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <div className="h-2 bg-gray-200 rounded-full flex-1 max-w-32">
                                    <div
                                      className="h-2 bg-green-500 rounded-full transition-all duration-300"
                                      style={{
                                        width: `${Math.min(100, (data.revenue / Math.max(...analyticsStats.monthlyRevenue.map((d) => d.revenue))) * 100)}%`,
                                      }}
                                    ></div>
                                  </div>
                                  <div className="text-sm font-medium">
                                    ₩{(data.revenue / 1000).toFixed(0)}K
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  거래: {data.transactions}건
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 카테고리별 강의 분포 & 인기 강의 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold">
                        카테고리별 강의 분포
                      </CardTitle>
                      <CardDescription>
                        전체 강의의 카테고리별 현황
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsStats.coursesByCategory.map((data, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-24 text-sm font-medium truncate">
                                {data.category}
                              </div>
                              <div className="flex-1">
                                <div className="h-2 bg-gray-200 rounded-full max-w-32">
                                  <div
                                    className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.min(100, (data.count / Math.max(...analyticsStats.coursesByCategory.map((d) => d.count))) * 100)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div className="text-sm font-medium text-right w-8">
                                {data.count}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="p-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold">
                        인기 강의 TOP 10
                      </CardTitle>
                      <CardDescription>수강 신청이 많은 강의</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analyticsStats.topCourses
                          .slice(0, 10)
                          .map((course, index) => (
                            <div
                              key={course.id}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-6 text-sm font-bold text-gray-500">
                                  #{index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">
                                    {course.title}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {course.category}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium">
                                    {course.enrollments}명
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ₩{(course.price / 1000).toFixed(0)}K
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 전체 통계 요약 */}
                <Card className="p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">
                      플랫폼 전체 통계
                    </CardTitle>
                    <CardDescription>전체 플랫폼의 주요 지표</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {analyticsStats.totalStats.totalUsers}
                        </div>
                        <div className="text-sm text-blue-600">총 사용자</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {analyticsStats.totalStats.individualUsers}
                        </div>
                        <div className="text-sm text-green-600">
                          개인 사용자
                        </div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {analyticsStats.totalStats.businessUsers}
                        </div>
                        <div className="text-sm text-purple-600">
                          기관 사용자
                        </div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {analyticsStats.totalStats.totalCourses}
                        </div>
                        <div className="text-sm text-orange-600">총 강의</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {analyticsStats.totalStats.totalEnrollments}
                        </div>
                        <div className="text-sm text-red-600">총 수강신청</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          ₩
                          {(
                            analyticsStats.totalStats.totalRevenue / 1000000
                          ).toFixed(1)}
                          M
                        </div>
                        <div className="text-sm text-yellow-600">총 매출</div>
                      </div>
                      <div className="text-center p-4 bg-indigo-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">
                          ₩
                          {(
                            analyticsStats.totalStats.averageRevenuePerUser /
                            1000
                          ).toFixed(0)}
                          K
                        </div>
                        <div className="text-sm text-indigo-600">ARPU</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  분석 데이터 없음
                </h3>
                <p className="text-gray-500">
                  분석할 데이터가 충분하지 않습니다.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approve" ? "승인 확인" : "거부 확인"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.type === "business" ? (
                <>
                  기관 "{selectedItem?.organizationName}"을(를){" "}
                  {approvalAction === "approve" ? "승인" : "거부"}하시겠습니까?
                </>
              ) : (
                <>
                  강의 "{selectedItem?.title}"을(를){" "}
                  {approvalAction === "approve" ? "승인" : "거부"}하시겠습니까?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
            >
              취소
            </Button>
            <Button
              variant={approvalAction === "approve" ? "default" : "destructive"}
              onClick={confirmApproval}
              disabled={
                businessApprovalMutation.isPending ||
                courseApprovalMutation.isPending
              }
            >
              {businessApprovalMutation.isPending ||
              courseApprovalMutation.isPending
                ? "처리 중..."
                : approvalAction === "approve"
                  ? "승인"
                  : "거부"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">사용자 삭제 확인</DialogTitle>
            <DialogDescription>
              사용자 "{selectedUser?.username}"을(를) 삭제하시겠습니까?
              <br />
              <span className="text-red-600 font-medium">
                이 작업은 되돌릴 수 없습니다.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={confirmUserDelete}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Detail Dialog */}
      <Dialog
        open={showUserDetailDialog}
        onOpenChange={setShowUserDetailDialog}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>사용자 상세 정보</span>
            </DialogTitle>
          </DialogHeader>

          {userDetailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">사용자 정보를 불러오는 중...</span>
            </div>
          ) : userDetailsError ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">
                <XCircle className="h-12 w-12 mx-auto mb-2" />
                <h3 className="text-lg font-medium">
                  정보를 불러올 수 없습니다
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                </p>
              </div>
              {selectedUserForDetail && (
                <div className="bg-gray-50 p-4 rounded-lg text-left">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">
                    기본 정보
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        사용자명
                      </label>
                      <p className="text-gray-900">
                        {selectedUserForDetail.username}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        이메일
                      </label>
                      <p className="text-gray-900">
                        {selectedUserForDetail.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        이름
                      </label>
                      <p className="text-gray-900">
                        {selectedUserForDetail.name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        가입일
                      </label>
                      <p className="text-gray-900">
                        {new Date(
                          selectedUserForDetail.createdAt,
                        ).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : selectedUserForDetail && userDetails ? (
            <div className="space-y-6">
              {/* 통계 카드 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-blue-50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {userDetails.stats?.totalEnrollments || 0}
                    </div>
                    <div className="text-sm text-gray-600">수강 과정</div>
                  </div>
                </Card>
                <Card className="p-4 bg-green-50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {userDetails.stats?.totalPayments || 0}
                    </div>
                    <div className="text-sm text-gray-600">결제 건수</div>
                  </div>
                </Card>
                <Card className="p-4 bg-purple-50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {userDetails.stats?.totalSpent?.toLocaleString() || 0}원
                    </div>
                    <div className="text-sm text-gray-600">총 결제액</div>
                  </div>
                </Card>
                {selectedUserForDetail.userType === "business" && (
                  <Card className="p-4 bg-orange-50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {userDetails.stats?.totalCourses || 0}
                      </div>
                      <div className="text-sm text-gray-600">등록 강의</div>
                    </div>
                  </Card>
                )}
              </div>

              {/* 기본 정보 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-800">
                  기본 정보
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      사용자명
                    </label>
                    <p className="text-gray-900">
                      {selectedUserForDetail.username}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      이메일
                    </label>
                    <p className="text-gray-900">
                      {selectedUserForDetail.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      이름
                    </label>
                    <p className="text-gray-900">
                      {selectedUserForDetail.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      전화번호
                    </label>
                    <p className="text-gray-900">
                      {selectedUserForDetail.phone || "미등록"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 계정 정보 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-800">
                  계정 정보
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      사용자 유형
                    </label>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          selectedUserForDetail.userType === "business"
                            ? "default"
                            : "outline"
                        }
                      >
                        {selectedUserForDetail.userType === "business"
                          ? "기관"
                          : "개인"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      권한
                    </label>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          selectedUserForDetail.role === "admin"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {selectedUserForDetail.role === "admin"
                          ? "관리자"
                          : "일반 사용자"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      계정 상태
                    </label>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          selectedUserForDetail.isActive
                            ? "default"
                            : "secondary"
                        }
                      >
                        {selectedUserForDetail.isActive ? "활성" : "비활성"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      승인 상태
                    </label>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          selectedUserForDetail.isApproved
                            ? "default"
                            : "secondary"
                        }
                      >
                        {selectedUserForDetail.isApproved
                          ? "승인됨"
                          : "승인 대기"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* 기관 정보 (기관 사용자인 경우) */}
              {selectedUserForDetail.userType === "business" && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">
                    기관 정보
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        기관명
                      </label>
                      <p className="text-gray-900">
                        {selectedUserForDetail.organizationName || "미등록"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        사업자번호
                      </label>
                      <p className="text-gray-900">
                        {selectedUserForDetail.businessNumber || "미등록"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        대표자명
                      </label>
                      <p className="text-gray-900">
                        {selectedUserForDetail.representativeName || "미등록"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        주소
                      </label>
                      <p className="text-gray-900">
                        {selectedUserForDetail.address || "미등록"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 가입 정보 */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-800">
                  가입 정보
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      가입일
                    </label>
                    <p className="text-gray-900">
                      {new Date(
                        selectedUserForDetail.createdAt,
                      ).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      최종 활동일
                    </label>
                    <p className="text-gray-900">
                      {userDetails.stats?.lastLoginDate
                        ? new Date(
                            userDetails.stats.lastLoginDate,
                          ).toLocaleDateString("ko-KR")
                        : new Date(
                            selectedUserForDetail.createdAt,
                          ).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      사용자 ID
                    </label>
                    <p className="text-gray-900 font-mono">
                      {selectedUserForDetail.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* 최근 활동 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 최근 수강 과정 */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">
                    최근 수강 과정
                  </h3>
                  {userDetails.enrollments &&
                  userDetails.enrollments.length > 0 ? (
                    <div className="space-y-2">
                      {userDetails.enrollments.map(
                        (enrollment: any, index: number) => (
                          <div
                            key={index}
                            className="bg-white p-2 rounded text-sm"
                          >
                            <div className="font-medium">
                              {enrollment.courseName ||
                                `과정 ID: ${enrollment.courseId}`}
                            </div>
                            <div className="text-gray-600">
                              {new Date(
                                enrollment.createdAt,
                              ).toLocaleDateString("ko-KR")}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">
                      수강 과정이 없습니다.
                    </p>
                  )}
                </div>

                {/* 최근 결제 내역 */}
                <div className="bg-pink-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">
                    최근 결제 내역
                  </h3>
                  {userDetails.payments && userDetails.payments.length > 0 ? (
                    <div className="space-y-2">
                      {userDetails.payments.map(
                        (payment: any, index: number) => (
                          <div
                            key={index}
                            className="bg-white p-2 rounded text-sm"
                          >
                            <div className="flex justify-between">
                              <span className="font-medium">
                                {payment.amount?.toLocaleString()}원
                              </span>
                              <Badge
                                variant={
                                  payment.status === "completed"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {payment.status === "completed"
                                  ? "완료"
                                  : payment.status}
                              </Badge>
                            </div>
                            <div className="text-gray-600">
                              {new Date(payment.createdAt).toLocaleDateString(
                                "ko-KR",
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">
                      결제 내역이 없습니다.
                    </p>
                  )}
                </div>
              </div>

              {/* 등록한 강의 (기관 사용자인 경우) */}
              {selectedUserForDetail.userType === "business" &&
                userDetails.courses &&
                userDetails.courses.length > 0 && (
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">
                      등록한 강의
                    </h3>
                    <div className="space-y-2">
                      {userDetails.courses?.map(
                        (course: any, index: number) => (
                          <div
                            key={index}
                            className="bg-white p-2 rounded text-sm"
                          >
                            <div className="font-medium">{course.title}</div>
                            <div className="text-gray-600">
                              {course.category} •{" "}
                              {course.price?.toLocaleString()}원 •
                              {new Date(course.createdAt).toLocaleDateString(
                                "ko-KR",
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              사용자 정보를 불러올 수 없습니다.
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setShowUserDetailDialog(false)}
            >
              닫기
            </Button>
            {selectedUserForDetail &&
              selectedUserForDetail.role !== "admin" && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowUserDetailDialog(false);
                    handleDeleteUser(selectedUserForDetail);
                  }}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  사용자 삭제
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 문의사항 답변 다이얼로그 */}
      <Dialog open={showAnswerDialog} onOpenChange={setShowAnswerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>문의사항 답변</DialogTitle>
            <DialogDescription>
              고객 문의에 대한 답변을 작성해주세요.
            </DialogDescription>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedInquiry.title}</h4>
                <p className="text-gray-600 text-sm mb-2">
                  {selectedInquiry.userName} ({selectedInquiry.userEmail}) |{" "}
                  {formatDate(selectedInquiry.createdAt)}
                </p>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedInquiry.content}
                </p>
              </div>

              <div>
                <Label htmlFor="answer-text">답변 내용</Label>
                <Textarea
                  id="answer-text"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="고객에게 전달할 답변을 작성해주세요..."
                  className="min-h-[150px] mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAnswerDialog(false)}
            >
              취소
            </Button>
            <Button
              onClick={confirmAnswer}
              disabled={answerInquiryMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {answerInquiryMutation.isPending
                ? "답변 등록 중..."
                : "답변 등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
