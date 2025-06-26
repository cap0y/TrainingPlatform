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

export default function SuperAdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState(""); // "approve" or "reject"

  // 대시보드 통계 조회
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/admin/dashboard-stats"],
  });

  // 기관 승인 대기 목록
  const { data: pendingBusinesses, isLoading: businessesLoading } = useQuery({
    queryKey: ["/api/admin/pending-businesses"],
  });

  // 강의 승인 대기 목록
  const { data: pendingCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/admin/pending-courses"],
  });

  // 전체 사용자 목록
  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // 기관 승인/거부 mutation
  const businessApprovalMutation = useMutation({
    mutationFn: async ({ businessId, action, reason }) => {
      return apiRequest("PUT", `/api/admin/business-approval/${businessId}`, {
        action,
        reason,
      });
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/pending-businesses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/dashboard-stats"],
      });
      toast({
        title: action === "approve" ? "기관 승인 완료" : "기관 승인 거부",
        description:
          action === "approve"
            ? "기관이 승인되었습니다."
            : "기관 승인이 거부되었습니다.",
      });
      setShowApprovalDialog(false);
      setSelectedItem(null);
    },
    onError: (error) => {
      toast({
        title: "처리 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 강의 승인/거부 mutation
  const courseApprovalMutation = useMutation({
    mutationFn: async ({ courseId, action, reason }) => {
      return apiRequest("PUT", `/api/admin/course-approval/${courseId}`, {
        action,
        reason,
      });
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/pending-courses"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/dashboard-stats"],
      });
      toast({
        title: action === "approve" ? "강의 승인 완료" : "강의 승인 거부",
        description:
          action === "approve"
            ? "강의가 승인되었습니다."
            : "강의 승인이 거부되었습니다.",
      });
      setShowApprovalDialog(false);
      setSelectedItem(null);
    },
    onError: (error) => {
      toast({
        title: "처리 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApproval = (item, action, type) => {
    setSelectedItem({ ...item, type });
    setApprovalAction(action);
    setShowApprovalDialog(true);
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

  const stats = dashboardStats || {
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            <TabsTrigger value="business-approval">기관 승인</TabsTrigger>
            <TabsTrigger value="course-approval">강의 승인</TabsTrigger>
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="analytics">통계</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    총 사용자
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
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
                    {stats.businessUsers}
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
                    {stats.pendingBusinesses}
                  </div>
                  <p className="text-xs text-muted-foreground">검토 필요</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 강의</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCourses}</div>
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
                    {stats.pendingCourses}
                  </div>
                  <p className="text-xs text-muted-foreground">검토 필요</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">월 매출</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₩{(stats.monthlyRevenue / 1000000).toFixed(1)}M
                  </div>
                  <p className="text-xs text-muted-foreground">이번 달</p>
                </CardContent>
              </Card>
            </div>

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
            <Card>
              <CardHeader>
                <CardTitle>사용자 관리</CardTitle>
                <CardDescription>
                  전체 사용자를 관리하고 권한을 설정할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    사용자 관리
                  </h3>
                  <p className="text-gray-500">
                    사용자 목록, 권한 관리, 활동 내역 등을 확인할 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>플랫폼 통계</CardTitle>
                <CardDescription>
                  전체 플랫폼의 성과와 사용자 활동을 분석합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    통계 대시보드
                  </h3>
                  <p className="text-gray-500">
                    사용자 증가율, 매출 분석, 강의 성과 등을 확인할 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
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

      <Footer />
    </div>
  );
}
