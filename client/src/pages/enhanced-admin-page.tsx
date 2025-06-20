import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/header";
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
import { BarChart3, Users, BookOpen, Calendar, TrendingUp, Settings, Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EnhancedAdminPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showNoticeDialog, setShowNoticeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // 초기 폼 데이터
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

  const [noticeForm, setNoticeForm] = useState({
    title: "",
    content: "",
    category: "notice",
    isImportant: false,
  });

  // 데이터 가져오기
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: notices, isLoading: noticesLoading } = useQuery({
    queryKey: ["/api/notices"],
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // 통계 데이터 (임시)
  const stats = {
    totalUsers: users?.length || 0,
    totalCourses: courses?.courses?.length || 0,
    totalEnrollments: 1250,
    monthlyRevenue: 15750000,
  };

  // 코스 생성/수정 mutation
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

  // 공지사항 생성/수정 mutation
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

  // 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }) => {
      return apiRequest("DELETE", `/api/${type}/${id}`);
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/${type}`] });
      toast({
        title: "삭제 완료",
        description: "성공적으로 삭제되었습니다.",
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

  const resetNoticeForm = () => {
    setNoticeForm({
      title: "",
      content: "",
      category: "notice",
      isImportant: false,
    });
    setEditingNotice(null);
  };

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
      content: notice.content,
      category: notice.category,
      isImportant: notice.isImportant || false,
    });
    setShowNoticeDialog(true);
  };

  const handleDelete = (type, id, title) => {
    setDeleteTarget({ type, id, title });
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              설정
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            <TabsTrigger value="courses">과정 관리</TabsTrigger>
            <TabsTrigger value="users">회원 관리</TabsTrigger>
            <TabsTrigger value="notices">공지사항</TabsTrigger>
            <TabsTrigger value="analytics">분석</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 회원 수</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 과정 수</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCourses}</div>
                  <p className="text-xs text-muted-foreground">
                    +3 new this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 수강생</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalEnrollments.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">월 매출</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₩{(stats.monthlyRevenue / 1000000).toFixed(1)}M</div>
                  <p className="text-xs text-muted-foreground">
                    +15% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>최근 등록된 과정</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courses?.courses?.slice(0, 5).map((course) => (
                      <div key={course.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-gray-500">{course.instructor}</p>
                        </div>
                        <Badge variant={course.status === "active" ? "default" : "secondary"}>
                          {course.status || "active"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>최근 공지사항</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notices?.notices?.slice(0, 5).map((notice) => (
                      <div key={notice.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{notice.title}</p>
                          <p className="text-sm text-gray-500">{notice.date}</p>
                        </div>
                        <Badge variant={notice.isImportant ? "destructive" : "outline"}>
                          {notice.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses Management Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="과정 검색..."
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
              <Button onClick={() => setShowCourseDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                새 과정 추가
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>과정명</TableHead>
                    <TableHead>분야</TableHead>
                    <TableHead>형태</TableHead>
                    <TableHead>수강생</TableHead>
                    <TableHead>평점</TableHead>
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
                    courses?.courses?.filter(course => 
                      course.title.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.category}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.type}</Badge>
                        </TableCell>
                        <TableCell>{course.students || 0}명</TableCell>
                        <TableCell>★ {course.rating || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={course.status === "active" ? "default" : "secondary"}>
                            {course.status || "active"}
                          </Badge>
                        </TableCell>
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
                                onClick={() => handleDelete("courses", course.id, course.title)}
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

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>회원 관리</CardTitle>
                <CardDescription>
                  플랫폼에 등록된 모든 회원을 관리합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">회원 관리 기능</h3>
                  <p className="text-gray-500">
                    회원 목록, 권한 관리, 활동 내역 등을 확인할 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notices Management Tab */}
          <TabsContent value="notices" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">공지사항 관리</h2>
              <Button onClick={() => setShowNoticeDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                새 공지 작성
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>작성일</TableHead>
                    <TableHead>중요도</TableHead>
                    <TableHead>관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {noticesLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    notices?.notices?.map((notice) => (
                      <TableRow key={notice.id}>
                        <TableCell className="font-medium">{notice.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{notice.category}</Badge>
                        </TableCell>
                        <TableCell>{notice.date}</TableCell>
                        <TableCell>
                          {notice.isImportant && (
                            <Badge variant="destructive">중요</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditNotice(notice)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete("notices", notice.id, notice.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>분석 및 통계</CardTitle>
                <CardDescription>
                  플랫폼의 성과와 사용자 활동을 분석합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">분석 대시보드</h3>
                  <p className="text-gray-500">
                    수강 통계, 매출 분석, 사용자 활동 패턴 등을 확인할 수 있습니다.
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
              {editingCourse ? "과정 수정" : "새 과정 추가"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">과정명</Label>
              <Input
                id="title"
                value={courseForm.title}
                onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="과정명을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">분야</Label>
              <Input
                id="category"
                value={courseForm.category}
                onChange={(e) => setCourseForm(prev => ({ ...prev, category: e.target.value }))}
                placeholder="분야를 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">형태</Label>
              <Select 
                value={courseForm.type} 
                onValueChange={(value) => setCourseForm(prev => ({ ...prev, type: value }))}
              >
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
              <Label htmlFor="level">난이도</Label>
              <Select 
                value={courseForm.level} 
                onValueChange={(value) => setCourseForm(prev => ({ ...prev, level: value }))}
              >
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
              <Label htmlFor="price">가격</Label>
              <Input
                id="price"
                type="number"
                value={courseForm.price}
                onChange={(e) => setCourseForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="가격을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">기간</Label>
              <Input
                id="duration"
                value={courseForm.duration}
                onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="예: 4주, 16시간"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={courseForm.description}
                onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="과정 설명을 입력하세요"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCourseDialog(false)}>
              취소
            </Button>
            <Button 
              onClick={() => courseMutation.mutate(courseForm)}
              disabled={courseMutation.isPending}
            >
              {courseMutation.isPending ? "처리 중..." : (editingCourse ? "수정" : "생성")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notice Dialog */}
      <Dialog open={showNoticeDialog} onOpenChange={setShowNoticeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingNotice ? "공지 수정" : "새 공지 작성"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notice-title">제목</Label>
              <Input
                id="notice-title"
                value={noticeForm.title}
                onChange={(e) => setNoticeForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="공지 제목을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notice-category">카테고리</Label>
              <Select 
                value={noticeForm.category} 
                onValueChange={(value) => setNoticeForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notice">공지</SelectItem>
                  <SelectItem value="announcement">안내</SelectItem>
                  <SelectItem value="update">업데이트</SelectItem>
                  <SelectItem value="event">이벤트</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notice-content">내용</Label>
              <Textarea
                id="notice-content"
                value={noticeForm.content}
                onChange={(e) => setNoticeForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="공지 내용을 입력하세요"
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoticeDialog(false)}>
              취소
            </Button>
            <Button 
              onClick={() => noticeMutation.mutate(noticeForm)}
              disabled={noticeMutation.isPending}
            >
              {noticeMutation.isPending ? "처리 중..." : (editingNotice ? "수정" : "작성")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>삭제 확인</DialogTitle>
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
    </div>
  );
}