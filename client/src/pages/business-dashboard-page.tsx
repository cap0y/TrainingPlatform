import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BarChart3, BookOpen, Users, TrendingUp, Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BusinessDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  // 내 강의 목록 조회
  const { data: myCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/business/courses", user?.id],
    enabled: !!user?.id,
  });

  // 수강생 통계 조회
  const { data: enrollmentStats } = useQuery({
    queryKey: ["/api/business/enrollment-stats", user?.id],
    enabled: !!user?.id,
  });

  // 매출 통계 조회
  const { data: revenueStats } = useQuery({
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

  // 강의 생성/수정 mutation
  const courseMutation = useMutation({
    mutationFn: async (data) => {
      const courseData = {
        ...data,
        providerId: user?.id,
        price: parseInt(data.price) || 0,
        discountPrice: data.discountPrice ? parseInt(data.discountPrice) : null,
        credit: parseInt(data.credit) || 1,
        maxStudents: data.maxStudents ? parseInt(data.maxStudents) : null,
      };

      if (editingCourse) {
        return apiRequest("PUT", `/api/business/courses/${editingCourse.id}`, courseData);
      } else {
        return apiRequest("POST", "/api/business/courses", courseData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business/courses", user?.id] });
      toast({
        title: editingCourse ? "강의 수정 완료" : "강의 등록 완료",
        description: editingCourse ? "강의가 수정되었습니다." : "강의가 등록되었습니다. 관리자 승인 후 공개됩니다.",
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

  // 강의 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: async (courseId) => {
      return apiRequest("DELETE", `/api/business/courses/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business/courses", user?.id] });
      toast({
        title: "강의 삭제 완료",
        description: "강의가 삭제되었습니다.",
      });
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast({
        title: "삭제 실패",
        description: error.message,
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

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description || "",
      category: course.category,
      type: course.type,
      level: course.level,
      credit: course.credit.toString(),
      price: course.price.toString(),
      discountPrice: course.discountPrice?.toString() || "",
      duration: course.duration,
      maxStudents: course.maxStudents?.toString() || "",
      startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : "",
      endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : "",
      instructorId: course.instructorId?.toString() || "",
    });
    setShowCourseDialog(true);
  };

  const handleDelete = (course) => {
    setDeleteTarget(course);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  const getStatusBadge = (course) => {
    if (course.approvalStatus === "pending") {
      return <Badge variant="outline" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />승인 대기</Badge>;
    }
    if (course.approvalStatus === "rejected") {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />승인 거부</Badge>;
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            <TabsTrigger value="courses">내 강의 관리</TabsTrigger>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="강의 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  필터
                </Button>
              </div>
              <Button onClick={() => setShowCourseDialog(true)} disabled={!user?.isApproved}>
                <Plus className="h-4 w-4 mr-2" />
                새 강의 등록
              </Button>
            </div>

            {!user?.isApproved && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <p className="text-yellow-800">
                    기관 승인이 완료되면 강의를 등록할 수 있습니다. 승인까지 1-2일 소요됩니다.
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>강의명</TableHead>
                    <TableHead>분야</TableHead>
                    <TableHead>형태</TableHead>
                    <TableHead>가격</TableHead>
                    <TableHead>수강생</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coursesLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    myCourses?.courses?.filter(course => 
                      course.title.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.category}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {course.discountPrice ? (
                            <div className="flex flex-col">
                              <span className="line-through text-gray-500">{course.price?.toLocaleString()}원</span>
                              <span className="text-red-600 font-medium">{course.discountPrice?.toLocaleString()}원</span>
                            </div>
                          ) : (
                            <span>{course.price?.toLocaleString()}원</span>
                          )}
                        </TableCell>
                        <TableCell>{course.students || 0}명</TableCell>
                        <TableCell>{getStatusBadge(course)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                보기
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                                <Edit className="mr-2 h-4 w-4" />
                                수정
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(course)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Students Management Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>수강생 현황</CardTitle>
                <CardDescription>
                  내 강의에 등록한 수강생들을 확인할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">수강생 관리</h3>
                  <p className="text-gray-500">
                    수강생 목록, 진도 관리, 수료 현황 등을 확인할 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
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

      {/* Course Dialog */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "강의 수정" : "새 강의 등록"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse ? "강의 정보를 수정하세요." : "새로운 강의를 등록하세요. 관리자 승인 후 공개됩니다."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">강의명 *</Label>
              <Input
                id="title"
                value={courseForm.title}
                onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="강의명을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">분야 *</Label>
              <Select value={courseForm.category} onValueChange={(value) => setCourseForm(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="분야를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="교육학">교육학</SelectItem>
                  <SelectItem value="심리학">심리학</SelectItem>
                  <SelectItem value="교수법">교수법</SelectItem>
                  <SelectItem value="교육정책">교육정책</SelectItem>
                  <SelectItem value="교육평가">교육평가</SelectItem>
                  <SelectItem value="안전교육">안전교육</SelectItem>
                  <SelectItem value="화학물질">화학물질</SelectItem>
                  <SelectItem value="산업안전">산업안전</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">수업 형태 *</Label>
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
            <div className="space-y-2">
              <Label htmlFor="level">난이도 *</Label>
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
            <div className="space-y-2">
              <Label htmlFor="price">가격 *</Label>
              <Input
                id="price"
                type="number"
                value={courseForm.price}
                onChange={(e) => setCourseForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="가격을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountPrice">할인가격</Label>
              <Input
                id="discountPrice"
                type="number"
                value={courseForm.discountPrice}
                onChange={(e) => setCourseForm(prev => ({ ...prev, discountPrice: e.target.value }))}
                placeholder="할인가격 (선택사항)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">기간 *</Label>
              <Input
                id="duration"
                value={courseForm.duration}
                onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="예: 4주, 16시간"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit">학점</Label>
              <Input
                id="credit"
                type="number"
                value={courseForm.credit}
                onChange={(e) => setCourseForm(prev => ({ ...prev, credit: e.target.value }))}
                placeholder="학점"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxStudents">최대 수강생 수</Label>
              <Input
                id="maxStudents"
                type="number"
                value={courseForm.maxStudents}
                onChange={(e) => setCourseForm(prev => ({ ...prev, maxStudents: e.target.value }))}
                placeholder="최대 수강생 수 (선택사항)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">시작일</Label>
              <Input
                id="startDate"
                type="date"
                value={courseForm.startDate}
                onChange={(e) => setCourseForm(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">강의 설명 *</Label>
              <Textarea
                id="description"
                value={courseForm.description}
                onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="강의에 대한 자세한 설명을 입력하세요"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCourseDialog(false)}>
              취소
            </Button>
            <Button 
              onClick={() => courseMutation.mutate(courseForm)}
              disabled={courseMutation.isPending || !courseForm.title || !courseForm.category || !courseForm.price || !courseForm.duration || !courseForm.description}
            >
              {courseMutation.isPending ? "처리 중..." : (editingCourse ? "수정" : "등록")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>강의 삭제 확인</DialogTitle>
            <DialogDescription>
              "{deleteTarget?.title}"을(를) 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              취소
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}