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
import { BarChart3, BookOpen, Users, TrendingUp, Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, Calendar, MapPin, User } from "lucide-react";
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
    curriculum: "",
    objectives: "",
    requirements: "",
    materials: "",
    assessmentMethod: "",
    certificateType: "",
    instructorName: "",
    instructorProfile: "",
    instructorExpertise: "",
    targetAudience: "",
    difficulty: "",
    language: "ko",
    location: "",
    tags: "",
    // 추가 세부 정보
    features: "",
    recommendations: "",
    totalHours: "",
    enrollmentDeadline: "",
    completionDeadline: "",
    prerequisites: "",
    learningMethod: "",
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
      curriculum: "",
      objectives: "",
      requirements: "",
      materials: "",
      assessmentMethod: "",
      certificateType: "",
      instructorName: "",
      instructorProfile: "",
      instructorExpertise: "",
      targetAudience: "",
      difficulty: "",
      language: "ko",
      location: "",
      tags: "",
      features: "",
      recommendations: "",
      totalHours: "",
      enrollmentDeadline: "",
      completionDeadline: "",
      prerequisites: "",
      learningMethod: "",
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
      credit: course.credit?.toString() || "1",
      price: course.price?.toString() || "",
      discountPrice: course.discountPrice?.toString() || "",
      duration: course.duration || "",
      maxStudents: course.maxStudents?.toString() || "",
      startDate: course.startDate ? new Date(course.startDate).toISOString().split('T')[0] : "",
      endDate: course.endDate ? new Date(course.endDate).toISOString().split('T')[0] : "",
      instructorId: course.instructorId?.toString() || "",
      curriculum: course.curriculum || "",
      objectives: course.objectives || "",
      requirements: course.requirements || "",
      materials: course.materials || "",
      assessmentMethod: course.assessmentMethod || "",
      certificateType: course.certificateType || "",
      instructorName: course.instructorName || "",
      instructorProfile: course.instructorProfile || "",
      instructorExpertise: course.instructorExpertise || "",
      targetAudience: course.targetAudience || "",
      difficulty: course.difficulty || "",
      language: course.language || "ko",
      location: course.location || "",
      tags: Array.isArray(course.tags) ? course.tags.join(", ") : (course.tags || ""),
      features: course.features || "",
      recommendations: course.recommendations || "",
      totalHours: course.totalHours?.toString() || "",
      enrollmentDeadline: course.enrollmentDeadline ? new Date(course.enrollmentDeadline).toISOString().split('T')[0] : "",
      completionDeadline: course.completionDeadline ? new Date(course.completionDeadline).toISOString().split('T')[0] : "",
      prerequisites: course.prerequisites || "",
      learningMethod: course.learningMethod || "",
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
            <TabsTrigger value="courses">강의 관리</TabsTrigger>
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
            <div className="flex items-center justify-between mb-6">
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
              <Button 
                onClick={() => {
                  resetCourseForm();
                  setShowCourseDialog(true);
                }} 
                disabled={!user?.isApproved}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                새 강의 등록 (4개 탭 편집)
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "강의 수정" : "새 강의 등록"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse ? "강의 정보를 수정하세요." : "새로운 강의를 등록하세요. 관리자 승인 후 공개됩니다."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm font-medium">
              📝 상세 편집 폼: 아래 4개 탭에서 강의의 모든 정보를 편집할 수 있습니다
            </p>
          </div>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="content">과정 내용</TabsTrigger>
              <TabsTrigger value="instructor">강사 정보</TabsTrigger>
              <TabsTrigger value="schedule">일정 및 기타</TabsTrigger>
            </TabsList>
            
            {/* 기본 정보 탭 */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="IT교육">IT교육</SelectItem>
                      <SelectItem value="리더십">리더십</SelectItem>
                      <SelectItem value="커뮤니케이션">커뮤니케이션</SelectItem>
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
                  <Label htmlFor="price">정가 *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="정가를 입력하세요"
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
                  <Label htmlFor="duration">교육기간 *</Label>
                  <Input
                    id="duration"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="예: 4주, 16시간, 3일"
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
                    placeholder="최대 수강생 수"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">언어</Label>
                  <Select value={courseForm.language} onValueChange={(value) => setCourseForm(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">영어</SelectItem>
                      <SelectItem value="both">한국어/영어</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">과정 소개 *</Label>
                <Textarea
                  id="description"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="과정에 대한 상세한 소개를 입력하세요"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetAudience">수강 대상</Label>
                <Textarea
                  id="targetAudience"
                  value={courseForm.targetAudience}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="이 과정의 수강 대상을 설명하세요 (예: 초등교사, 관리자, 신입사원 등)"
                  rows={3}
                />
              </div>
            </TabsContent>
            
            {/* 과정 내용 탭 */}
            <TabsContent value="content" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="objectives">학습 목표</Label>
                <Textarea
                  id="objectives"
                  value={courseForm.objectives}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, objectives: e.target.value }))}
                  placeholder="이 과정을 통해 달성할 수 있는 학습 목표를 작성하세요 (줄바꿈으로 구분)"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="curriculum">커리큘럼</Label>
                <Textarea
                  id="curriculum"
                  value={courseForm.curriculum}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, curriculum: e.target.value }))}
                  placeholder="차시별 교육 내용을 상세히 작성하세요 (예: 1차시: OO 이론 개요, 2차시: 실습 등)"
                  rows={8}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="features">과정 특징</Label>
                <Textarea
                  id="features"
                  value={courseForm.features}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, features: e.target.value }))}
                  placeholder="이 과정만의 특별한 특징이나 장점을 설명하세요"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements">수강 요건</Label>
                <Textarea
                  id="requirements"
                  value={courseForm.requirements}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="수강을 위한 사전 요건이나 준비사항을 작성하세요"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prerequisites">선수학습</Label>
                <Textarea
                  id="prerequisites"
                  value={courseForm.prerequisites}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, prerequisites: e.target.value }))}
                  placeholder="이 과정을 수강하기 전에 필요한 지식이나 경험을 작성하세요"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="materials">교육 자료</Label>
                <Textarea
                  id="materials"
                  value={courseForm.materials}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, materials: e.target.value }))}
                  placeholder="제공되는 교육 자료나 교재에 대해 설명하세요"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assessmentMethod">평가 방법</Label>
                  <Select value={courseForm.assessmentMethod} onValueChange={(value) => setCourseForm(prev => ({ ...prev, assessmentMethod: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="평가 방법 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiz">퀴즈</SelectItem>
                      <SelectItem value="assignment">과제</SelectItem>
                      <SelectItem value="exam">시험</SelectItem>
                      <SelectItem value="participation">참여도</SelectItem>
                      <SelectItem value="project">프로젝트</SelectItem>
                      <SelectItem value="portfolio">포트폴리오</SelectItem>
                      <SelectItem value="attendance">출석</SelectItem>
                      <SelectItem value="mixed">복합평가</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="certificateType">수료증 종류</Label>
                  <Select value={courseForm.certificateType} onValueChange={(value) => setCourseForm(prev => ({ ...prev, certificateType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="수료증 종류 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completion">수료증</SelectItem>
                      <SelectItem value="participation">참가증</SelectItem>
                      <SelectItem value="achievement">성취증</SelectItem>
                      <SelectItem value="professional">전문자격증</SelectItem>
                      <SelectItem value="none">없음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="learningMethod">학습 방법</Label>
                <Select value={courseForm.learningMethod} onValueChange={(value) => setCourseForm(prev => ({ ...prev, learningMethod: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="학습 방법 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="self-paced">자기주도학습</SelectItem>
                    <SelectItem value="instructor-led">강사진행</SelectItem>
                    <SelectItem value="blended">혼합형</SelectItem>
                    <SelectItem value="cohort">코호트</SelectItem>
                    <SelectItem value="mentoring">멘토링</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            {/* 강사 정보 탭 */}
            <TabsContent value="instructor" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instructorName">강사명</Label>
                <Input
                  id="instructorName"
                  value={courseForm.instructorName}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, instructorName: e.target.value }))}
                  placeholder="강사 이름을 입력하세요"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instructorProfile">강사 소개</Label>
                <Textarea
                  id="instructorProfile"
                  value={courseForm.instructorProfile}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, instructorProfile: e.target.value }))}
                  placeholder="강사의 경력, 학력, 전문 분야 등을 소개하세요"
                  rows={5}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instructorExpertise">강사 전문 분야</Label>
                <Textarea
                  id="instructorExpertise"
                  value={courseForm.instructorExpertise}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, instructorExpertise: e.target.value }))}
                  placeholder="강사의 주요 전문 분야와 연구 영역을 작성하세요"
                  rows={3}
                />
              </div>
            </TabsContent>
            
            {/* 일정 및 기타 탭 */}
            <TabsContent value="schedule" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>시작일</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={courseForm.startDate}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>종료일</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={courseForm.endDate}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="enrollmentDeadline">신청 마감일</Label>
                  <Input
                    id="enrollmentDeadline"
                    type="date"
                    value={courseForm.enrollmentDeadline}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, enrollmentDeadline: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="completionDeadline">수료 마감일</Label>
                  <Input
                    id="completionDeadline"
                    type="date"
                    value={courseForm.completionDeadline}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, completionDeadline: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalHours">총 교육시간</Label>
                <Input
                  id="totalHours"
                  type="number"
                  value={courseForm.totalHours}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, totalHours: e.target.value }))}
                  placeholder="총 교육시간 (시간 단위)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>장소 (오프라인인 경우)</span>
                </Label>
                <Input
                  id="location"
                  value={courseForm.location}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="교육 장소를 입력하세요 (온라인인 경우 플랫폼명)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recommendations">추천 대상</Label>
                <Textarea
                  id="recommendations"
                  value={courseForm.recommendations}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, recommendations: e.target.value }))}
                  placeholder="이 과정을 추천하는 대상을 구체적으로 작성하세요 (예: 5년 이상 경력의 중등교사, 교육관리자 등)"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">태그</Label>
                <Input
                  id="tags"
                  value={courseForm.tags}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 리더십, 커뮤니케이션, 온라인)"
                />
                <p className="text-xs text-gray-500">검색과 분류에 사용되는 키워드를 입력하세요</p>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowCourseDialog(false)}>
              취소
            </Button>
            <Button 
              onClick={() => {
                // 태그를 배열로 변환
                const formDataWithTags = {
                  ...courseForm,
                  tags: courseForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
                };
                courseMutation.mutate(formDataWithTags);
              }}
              disabled={courseMutation.isPending || !courseForm.title || !courseForm.category || !courseForm.price || !courseForm.duration || !courseForm.description}
            >
              {courseMutation.isPending ? "처리 중..." : (editingCourse ? "수정 완료" : "강의 등록")}
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