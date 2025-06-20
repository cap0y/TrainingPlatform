import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Users, BookOpen, Calendar, CreditCard, Settings, Plus, Edit, Trash2, Check, X, Shield, ShieldOff, RefreshCw, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showNoticeDialog, setShowNoticeDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);
  const [userFilter, setUserFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundReason, setRefundReason] = useState("");

  // Redirect if not admin
  if (!user?.isAdmin) {
    setLocation("/");
    return null;
  }

  // Course form state
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    type: "online",
    level: "intermediate",
    credit: 1,
    price: "",
    discountPrice: "",
    duration: "",
    maxStudents: "",
    startDate: "",
    endDate: "",
    instructorId: "",
  });

  // Notice form state
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    category: "notice",
    isImportant: false,
  });

  // Fetch admin statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Fetch courses for management
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses", { limit: 50 }],
  });

  // Fetch notices for management
  const { data: noticesData, isLoading: noticesLoading } = useQuery({
    queryKey: ["/api/notices", { limit: 50 }],
  });

  // Fetch users for management
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // Fetch payments for management
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/admin/payments"],
  });

  // Fetch instructors
  const { data: instructors } = useQuery({
    queryKey: ["/api/instructors"],
  });

  // Course creation/update mutation
  const courseMutation = useMutation({
    mutationFn: async (data) => {
      if (editingCourse) {
        return apiRequest("PUT", `/api/courses/${editingCourse.id}`, data);
      } else {
        return apiRequest("POST", "/api/courses", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: editingCourse ? "과정 수정 완료" : "과정 생성 완료",
        description: "성공적으로 처리되었습니다.",
      });
      setShowCourseDialog(false);
      resetCourseForm();
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Notice creation/update mutation
  const noticeMutation = useMutation({
    mutationFn: async (data) => {
      if (editingNotice) {
        return apiRequest("PUT", `/api/notices/${editingNotice.id}`, data);
      } else {
        return apiRequest("POST", "/api/notices", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      toast({
        title: editingNotice ? "공지 수정 완료" : "공지 생성 완료",
        description: "성공적으로 처리되었습니다.",
      });
      setShowNoticeDialog(false);
      resetNoticeForm();
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Course deletion mutation
  const deleteCourse = useMutation({
    mutationFn: async (courseId: number) => {
      return apiRequest("DELETE", `/api/courses/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "과정 삭제 완료",
        description: "성공적으로 삭제되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user status mutation
  const updateUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      return apiRequest("PUT", `/api/admin/users/${userId}/status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "성공",
        description: "사용자 상태가 업데이트되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: "사용자 상태 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Update user role mutation
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role, isAdmin }: { userId: number; role: string; isAdmin: boolean }) => {
      return apiRequest("PUT", `/api/admin/users/${userId}/role`, { role, isAdmin });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "성공",
        description: "사용자 역할이 업데이트되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: "사용자 역할 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Update payment status mutation
  const updatePaymentStatus = useMutation({
    mutationFn: async ({ paymentId, status }: { paymentId: number; status: string }) => {
      return apiRequest("PUT", `/api/admin/payments/${paymentId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      toast({
        title: "성공",
        description: "결제 상태가 업데이트되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: "결제 상태 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Process refund mutation
  const processRefund = useMutation({
    mutationFn: async ({ paymentId, reason }: { paymentId: number; reason: string }) => {
      return apiRequest("POST", `/api/admin/payments/${paymentId}/refund`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      setShowRefundDialog(false);
      setSelectedPayment(null);
      setRefundReason("");
      toast({
        title: "성공",
        description: "환불이 처리되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류",
        description: "환불 처리에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // Handle course editing
  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      type: course.type || "online",
      level: course.level || "intermediate",
      credit: course.credit || 1,
      price: course.price || "",
      discountPrice: course.discountPrice || "",
      duration: course.duration || "",
      maxStudents: course.maxStudents || "",
      startDate: course.startDate ? course.startDate.split('T')[0] : "",
      endDate: course.endDate ? course.endDate.split('T')[0] : "",
      applicationDeadline: course.applicationDeadline ? course.applicationDeadline.split('T')[0] : "",
      instructorId: course.instructorId || "",
      isActive: course.isActive || false,
    });
    setShowCourseDialog(true);
  };

  // Handle notice editing
  const handleEditNotice = (notice: any) => {
    setEditingNotice(notice);
    setNoticeForm({
      title: notice.title || "",
      content: notice.content || "",
      category: notice.category || "notice",
      isImportant: notice.isImportant || false,
    });
    setShowNoticeDialog(true);
  };

  // Save course mutation (create or update)
  const saveCourse = useMutation({
    mutationFn: async (courseData: any) => {
      const url = editingCourse ? `/api/courses/${editingCourse.id}` : "/api/courses";
      const method = editingCourse ? "PUT" : "POST";
      const response = await apiRequest(method, url, courseData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setShowCourseDialog(false);
      resetCourseForm();
      toast({
        title: "성공",
        description: editingCourse ? "과정이 수정되었습니다." : "과정이 추가되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "과정 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Save notice mutation (create or update)
  const saveNotice = useMutation({
    mutationFn: async (noticeData: any) => {
      const url = editingNotice ? `/api/notices/${editingNotice.id}` : "/api/notices";
      const method = editingNotice ? "PUT" : "POST";
      const response = await apiRequest(method, url, noticeData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      setShowNoticeDialog(false);
      resetNoticeForm();
      toast({
        title: "성공",
        description: editingNotice ? "공지사항이 수정되었습니다." : "공지사항이 추가되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "공지사항 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });



  // Delete notice mutation
  const deleteNotice = useMutation({
    mutationFn: async (noticeId: number) => {
      const response = await apiRequest("DELETE", `/api/notices/${noticeId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      toast({
        title: "성공",
        description: "공지사항이 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "공지사항 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Handle course form submission
  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCourse.mutate(courseForm);
  };

  // Handle notice form submission
  const handleNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveNotice.mutate(noticeForm);
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: "",
      description: "",
      category: "",
      type: "online",
      level: "intermediate",
      credit: 1,
      price: "",
      discountPrice: "",
      duration: "",
      maxStudents: "",
      startDate: "",
      endDate: "",
      instructorId: "",
    });
    setEditingCourse(null);
  };

  const resetNoticeForm = () => {
    setNoticeForm({
      title: "",
      content: "",
      category: "notice",
      isImportant: false,
    });
    setEditingNotice(null);
  };

  // Filter users
  const filteredUsers = usersData?.filter((user: any) => {
    if (userFilter === "all") return true;
    if (userFilter === "individual") return user.userType === "individual";
    if (userFilter === "business") return user.userType === "business";
    if (userFilter === "admin") return user.isAdmin;
    if (userFilter === "active") return user.isActive;
    if (userFilter === "inactive") return !user.isActive;
    return true;
  }) || [];

  // Filter payments
  const filteredPayments = paymentsData?.payments?.filter((payment: any) => {
    if (paymentFilter === "all") return true;
    if (paymentFilter === "pending") return payment.status === "pending";
    if (paymentFilter === "completed") return payment.status === "completed";
    if (paymentFilter === "failed") return payment.status === "failed";
    if (paymentFilter === "refunded") return payment.status === "refunded";
    return true;
  }) || [];

  // Payment statistics
  const paymentStats = paymentsData?.payments ? {
    total: paymentsData.payments.length,
    completed: paymentsData.payments.filter((p: any) => p.status === "completed").length,
    pending: paymentsData.payments.filter((p: any) => p.status === "pending").length,
    failed: paymentsData.payments.filter((p: any) => p.status === "failed").length,
    refunded: paymentsData.payments.filter((p: any) => p.status === "refunded").length,
    totalRevenue: paymentsData.payments
      .filter((p: any) => p.status === "completed")
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0)
  } : {
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    totalRevenue: 0
  };

  const handleRefund = (payment: any) => {
    setSelectedPayment(payment);
    setShowRefundDialog(true);
  };




  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <Badge variant="secondary" className="bg-primary text-white">
            관리자
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart className="h-4 w-4" />
              <span>대시보드</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>과정관리</span>
            </TabsTrigger>
            <TabsTrigger value="notices" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>공지관리</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>회원관리</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>결제관리</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 과정 수</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalCourses || coursesData?.total || 0}</div>
                  <p className="text-xs text-muted-foreground">활성화된 과정</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 세미나 수</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalSeminars || 0}</div>
                  <p className="text-xs text-muted-foreground">예정된 세미나</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 결제 건수</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalPayments || 0}</div>
                  <p className="text-xs text-muted-foreground">완료된 결제</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">시스템 상태</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">정상</div>
                  <p className="text-xs text-muted-foreground">모든 시스템 정상 운영</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">새로운 과정이 등록되었습니다</p>
                      <p className="text-xs text-gray-500">5분 전</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">신규 회원이 가입했습니다</p>
                      <p className="text-xs text-gray-500">15분 전</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">결제가 완료되었습니다</p>
                      <p className="text-xs text-gray-500">30분 전</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">과정 관리</h2>
              <Button onClick={() => setShowCourseDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                새 과정 추가
              </Button>
            </div>

            {coursesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>과정명</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>유형</TableHead>
                        <TableHead>학점</TableHead>
                        <TableHead>가격</TableHead>
                        <TableHead>수강생</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coursesData?.courses?.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">{course.title}</TableCell>
                          <TableCell>{course.category}</TableCell>
                          <TableCell>
                            <Badge variant={course.type === 'online' ? 'default' : 'secondary'}>
                              {course.type === 'online' ? '온라인' : course.type === 'offline' ? '오프라인' : '블렌디드'}
                            </Badge>
                          </TableCell>
                          <TableCell>{course.credit}학점</TableCell>
                          <TableCell>{Number(course.price).toLocaleString()}원</TableCell>
                          <TableCell>{course.currentStudents}/{course.maxStudents || '∞'}</TableCell>
                          <TableCell>
                            <Badge variant={course.isActive ? 'default' : 'secondary'}>
                              {course.isActive ? '활성' : '비활성'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditCourse(course)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteCourse.mutate(course.id)}
                                disabled={deleteCourse.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notices Tab */}
          <TabsContent value="notices" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">공지사항 관리</h2>
              <Button onClick={() => setShowNoticeDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                새 공지 작성
              </Button>
            </div>

            {noticesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>제목</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead>중요</TableHead>
                        <TableHead>작성일</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {noticesData?.notices?.map((notice) => (
                        <TableRow key={notice.id}>
                          <TableCell className="font-medium">{notice.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{notice.category}</Badge>
                          </TableCell>
                          <TableCell>
                            {notice.isImportant && (
                              <Badge variant="destructive">중요</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={notice.isActive ? 'default' : 'secondary'}>
                              {notice.isActive ? '활성' : '비활성'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditNotice(notice)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteNotice.mutate(notice.id)}
                                disabled={deleteNotice.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">회원 관리</h2>
              <div className="flex items-center space-x-4">
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="필터 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 회원</SelectItem>
                    <SelectItem value="individual">개인 회원</SelectItem>
                    <SelectItem value="business">기관 회원</SelectItem>
                    <SelectItem value="admin">관리자</SelectItem>
                    <SelectItem value="active">활성 회원</SelectItem>
                    <SelectItem value="inactive">비활성 회원</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {usersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>이름</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>사용자명</TableHead>
                        <TableHead>유형</TableHead>
                        <TableHead>역할</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>가입일</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <Badge variant={user.userType === 'business' ? 'secondary' : 'outline'}>
                              {user.userType === 'individual' ? '개인' : '기관'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Badge variant={user.isAdmin ? 'default' : 'outline'}>
                                {user.role === 'admin' ? '슈퍼관리자' : user.isAdmin ? '관리자' : '사용자'}
                              </Badge>
                              {user.isAdmin && <Shield className="h-4 w-4 text-primary" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                              {user.isActive ? '활성' : '비활성'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {/* Toggle Active Status */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserStatus.mutate({ 
                                  userId: user.id, 
                                  isActive: !user.isActive 
                                })}
                                disabled={updateUserStatus.isPending}
                                title={user.isActive ? "비활성화" : "활성화"}
                              >
                                {user.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                              </Button>
                              
                              {/* Toggle Admin Role */}
                              {user.role !== 'admin' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateUserRole.mutate({ 
                                    userId: user.id, 
                                    role: user.isAdmin ? 'user' : 'admin',
                                    isAdmin: !user.isAdmin
                                  })}
                                  disabled={updateUserRole.isPending}
                                  title={user.isAdmin ? "관리자 해제" : "관리자 권한 부여"}
                                >
                                  {user.isAdmin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">전체 회원</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usersData?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">등록된 회원 수</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">개인 회원</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usersData?.filter((u: any) => u.userType === 'individual').length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">개인 회원</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">기관 회원</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usersData?.filter((u: any) => u.userType === 'business').length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">기관 회원</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">관리자</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {usersData?.filter((u: any) => u.isAdmin).length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">관리자 권한</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">결제 관리</h2>
              <div className="flex items-center space-x-4">
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="상태 필터" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 결제</SelectItem>
                    <SelectItem value="completed">완료</SelectItem>
                    <SelectItem value="pending">대기중</SelectItem>
                    <SelectItem value="failed">실패</SelectItem>
                    <SelectItem value="refunded">환불</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">전체 결제</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{paymentStats.total}</div>
                  <p className="text-xs text-muted-foreground">총 결제 건수</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">완료</CardTitle>
                  <Check className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{paymentStats.completed}</div>
                  <p className="text-xs text-muted-foreground">완료된 결제</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">대기중</CardTitle>
                  <RefreshCw className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{paymentStats.pending}</div>
                  <p className="text-xs text-muted-foreground">처리 대기중</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">실패/환불</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{paymentStats.failed + paymentStats.refunded}</div>
                  <p className="text-xs text-muted-foreground">실패 및 환불</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 매출</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {paymentStats.totalRevenue.toLocaleString()}원
                  </div>
                  <p className="text-xs text-muted-foreground">완료된 결제 총액</p>
                </CardContent>
              </Card>
            </div>

            {paymentsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>결제 ID</TableHead>
                        <TableHead>사용자</TableHead>
                        <TableHead>과정</TableHead>
                        <TableHead>금액</TableHead>
                        <TableHead>결제 방법</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>결제일</TableHead>
                        <TableHead>작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">#{payment.id}</TableCell>
                          <TableCell>
                            {payment.user ? (
                              <div>
                                <div className="font-medium">{payment.user.name}</div>
                                <div className="text-sm text-gray-500">{payment.user.email}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">사용자 정보 없음</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {payment.course ? (
                              <div>
                                <div className="font-medium">{payment.course.title}</div>
                                <div className="text-sm text-gray-500">{payment.course.category}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">과정 정보 없음</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {Number(payment.amount).toLocaleString()}원
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {payment.paymentMethod || "미지정"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                payment.status === 'completed' ? 'default' : 
                                payment.status === 'pending' ? 'secondary' : 
                                payment.status === 'failed' ? 'destructive' : 
                                'outline'
                              }
                            >
                              {payment.status === 'completed' ? '완료' :
                               payment.status === 'pending' ? '대기중' :
                               payment.status === 'failed' ? '실패' :
                               payment.status === 'refunded' ? '환불' : payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(payment.createdAt).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {payment.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updatePaymentStatus.mutate({ 
                                      paymentId: payment.id, 
                                      status: 'completed' 
                                    })}
                                    disabled={updatePaymentStatus.isPending}
                                    title="결제 승인"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updatePaymentStatus.mutate({ 
                                      paymentId: payment.id, 
                                      status: 'failed' 
                                    })}
                                    disabled={updatePaymentStatus.isPending}
                                    title="결제 실패 처리"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {payment.status === 'completed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRefund(payment)}
                                  disabled={processRefund.isPending}
                                  title="환불 처리"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Course Dialog */}
      <Dialog open={showCourseDialog} onOpenChange={(open) => {
        setShowCourseDialog(open);
        if (!open) resetCourseForm();
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "과정 수정" : "새 과정 추가"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCourseSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">과정명</Label>
                  <Input
                    id="title"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">카테고리</Label>
                  <Select value={courseForm.category} onValueChange={(value) => setCourseForm({ ...courseForm, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="교육학">교육학</SelectItem>
                      <SelectItem value="심리학">심리학</SelectItem>
                      <SelectItem value="교수법">교수법</SelectItem>
                      <SelectItem value="교육정책">교육정책</SelectItem>
                      <SelectItem value="교육평가">교육평가</SelectItem>
                      <SelectItem value="상담학">상담학</SelectItem>
                      <SelectItem value="특수교육">특수교육</SelectItem>
                      <SelectItem value="유아교육">유아교육</SelectItem>
                      <SelectItem value="국어교육">국어교육</SelectItem>
                      <SelectItem value="영어교육">영어교육</SelectItem>
                      <SelectItem value="수학교육">수학교육</SelectItem>
                      <SelectItem value="과학교육">과학교육</SelectItem>
                      <SelectItem value="사회교육">사회교육</SelectItem>
                      <SelectItem value="예체능교육">예체능교육</SelectItem>
                      <SelectItem value="진로교육">진로교육</SelectItem>
                      <SelectItem value="생활지도">생활지도</SelectItem>
                      <SelectItem value="학교경영">학교경영</SelectItem>
                      <SelectItem value="교육행정">교육행정</SelectItem>
                      <SelectItem value="교육공학">교육공학</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">과정 설명</Label>
                <Textarea
                  id="description"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">가격 (원)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="capacity">수용 인원</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={courseForm.capacity}
                    onChange={(e) => setCourseForm({ ...courseForm, capacity: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">기간</Label>
                  <Input
                    id="duration"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    placeholder="예: 4주, 2개월"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="level">수준</Label>
                  <Select value={courseForm.level} onValueChange={(value) => setCourseForm({ ...courseForm, level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="수준 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">초급</SelectItem>
                      <SelectItem value="intermediate">중급</SelectItem>
                      <SelectItem value="advanced">고급</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startDate">시작일</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={courseForm.startDate}
                    onChange={(e) => setCourseForm({ ...courseForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">종료일</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={courseForm.endDate}
                    onChange={(e) => setCourseForm({ ...courseForm, endDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="applicationDeadline">신청 마감일</Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    value={courseForm.applicationDeadline}
                    onChange={(e) => setCourseForm({ ...courseForm, applicationDeadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={courseForm.isActive}
                  onCheckedChange={(checked) => setCourseForm({ ...courseForm, isActive: !!checked })}
                />
                <Label htmlFor="isActive">활성 상태</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCourseDialog(false)}>
                취소
              </Button>
              <Button type="submit" disabled={saveCourse.isPending}>
                {saveCourse.isPending ? "저장 중..." : editingCourse ? "수정" : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notice Dialog */}
      <Dialog open={showNoticeDialog} onOpenChange={(open) => {
        setShowNoticeDialog(open);
        if (!open) resetNoticeForm();
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNotice ? "공지사항 수정" : "새 공지사항 작성"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleNoticeSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="noticeTitle">제목</Label>
                  <Input
                    id="noticeTitle"
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="noticeCategory">카테고리</Label>
                  <Select value={noticeForm.category} onValueChange={(value) => setNoticeForm({ ...noticeForm, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notice">공지사항</SelectItem>
                      <SelectItem value="news">뉴스/소식</SelectItem>
                      <SelectItem value="announcement">안내</SelectItem>
                      <SelectItem value="event">이벤트</SelectItem>
                      <SelectItem value="system">시스템</SelectItem>
                      <SelectItem value="update">업데이트</SelectItem>
                      <SelectItem value="maintenance">점검</SelectItem>
                      <SelectItem value="policy">정책</SelectItem>
                      <SelectItem value="guide">가이드</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="noticeContent">내용</Label>
                <Textarea
                  id="noticeContent"
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  rows={6}
                  required
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isImportant"
                    checked={noticeForm.isImportant}
                    onCheckedChange={(checked) => setNoticeForm({ ...noticeForm, isImportant: !!checked })}
                  />
                  <Label htmlFor="isImportant">중요 공지</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noticeIsActive"
                    checked={noticeForm.isActive}
                    onCheckedChange={(checked) => setNoticeForm({ ...noticeForm, isActive: !!checked })}
                  />
                  <Label htmlFor="noticeIsActive">활성 상태</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNoticeDialog(false)}>
                취소
              </Button>
              <Button type="submit" disabled={saveNotice.isPending}>
                {saveNotice.isPending ? "저장 중..." : editingNotice ? "수정" : "작성"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>환불 처리</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="refundReason">환불 사유</Label>
            <Textarea
              id="refundReason"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="환불 사유를 입력하세요"
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              취소
            </Button>
            <Button 
              onClick={() => processRefund.mutate({ 
                paymentId: selectedPayment?.id, 
                reason: refundReason 
              })}
              disabled={processRefund.isPending || !refundReason.trim()}
            >
              환불 처리
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
