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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Users, BookOpen, Calendar, CreditCard, Settings, Plus, Edit, Trash2, Check, X, Shield, ShieldOff } from "lucide-react";
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

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description || "",
      category: course.category,
      type: course.type,
      level: course.level,
      credit: course.credit,
      price: course.price,
      discountPrice: course.discountPrice || "",
      duration: course.duration,
      maxStudents: course.maxStudents || "",
      startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : "",
      endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : "",
      instructorId: course.instructorId || "",
    });
    setShowCourseDialog(true);
  };

  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
    setNoticeForm({
      title: notice.title,
      content: notice.content || "",
      category: notice.category,
      isImportant: notice.isImportant,
    });
    setShowNoticeDialog(true);
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
            <Card>
              <CardHeader>
                <CardTitle>결제 관리</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">결제 관리 기능이 구현될 예정입니다.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Course Dialog */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "과정 수정" : "새 과정 추가"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">과정명</Label>
                <Input
                  id="title"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="category">카테고리</Label>
                <Select value={courseForm.category} onValueChange={(value) => setCourseForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="교육학">교육학</SelectItem>
                    <SelectItem value="심리학">심리학</SelectItem>
                    <SelectItem value="교수법">교수법</SelectItem>
                    <SelectItem value="교육정책">교육정책</SelectItem>
                    <SelectItem value="교육평가">교육평가</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">과정 설명</Label>
              <Textarea
                id="description"
                value={courseForm.description}
                onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">유형</Label>
                <Select value={courseForm.type} onValueChange={(value) => setCourseForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">온라인</SelectItem>
                    <SelectItem value="offline">오프라인</SelectItem>
                    <SelectItem value="blended">블렌디드</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level">수준</Label>
                <Select value={courseForm.level} onValueChange={(value) => setCourseForm(prev => ({ ...prev, level: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">초급</SelectItem>
                    <SelectItem value="intermediate">중급</SelectItem>
                    <SelectItem value="advanced">고급</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="credit">학점</Label>
                <Input
                  id="credit"
                  type="number"
                  value={courseForm.credit}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, credit: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">가격</Label>
                <Input
                  id="price"
                  type="number"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="discountPrice">할인가</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  value={courseForm.discountPrice}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, discountPrice: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="duration">총 시간</Label>
                <Input
                  id="duration"
                  type="number"
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">시작일</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={courseForm.startDate}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">종료일</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={courseForm.endDate}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCourseDialog(false); resetCourseForm(); }}>
              취소
            </Button>
            <Button 
              onClick={() => courseMutation.mutate(courseForm)}
              disabled={courseMutation.isPending}
            >
              {courseMutation.isPending ? "처리 중..." : editingCourse ? "수정" : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notice Dialog */}
      <Dialog open={showNoticeDialog} onOpenChange={setShowNoticeDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingNotice ? "공지 수정" : "새 공지 작성"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="noticeTitle">제목</Label>
              <Input
                id="noticeTitle"
                value={noticeForm.title}
                onChange={(e) => setNoticeForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="noticeCategory">카테고리</Label>
              <Select value={noticeForm.category} onValueChange={(value) => setNoticeForm(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notice">공지</SelectItem>
                  <SelectItem value="news">소식</SelectItem>
                  <SelectItem value="announcement">안내</SelectItem>
                  <SelectItem value="event">이벤트</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="noticeContent">내용</Label>
              <Textarea
                id="noticeContent"
                value={noticeForm.content}
                onChange={(e) => setNoticeForm(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNoticeDialog(false); resetNoticeForm(); }}>
              취소
            </Button>
            <Button 
              onClick={() => noticeMutation.mutate(noticeForm)}
              disabled={noticeMutation.isPending}
            >
              {noticeMutation.isPending ? "처리 중..." : editingNotice ? "수정" : "작성"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
