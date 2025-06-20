import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("intro");
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: [`/api/courses/${id}`],
    enabled: !!id,
  });

  // Fetch course reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: [`/api/courses/${id}/reviews`],
    enabled: !!id,
  });

  // Fetch user's enrollment status
  const { data: enrollments } = useQuery({
    queryKey: ["/api/enrollments", { courseId: id }],
    enabled: !!user && !!id,
  });

  const isEnrolled = enrollments?.some(enrollment => enrollment.courseId === parseInt(id));

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/enrollments", {
        courseId: parseInt(id),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      toast({
        title: "수강 신청 완료",
        description: "성공적으로 수강 신청되었습니다.",
      });
      setShowEnrollDialog(false);
    },
    onError: (error) => {
      toast({
        title: "수강 신청 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Review submission mutation
  const reviewMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/courses/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${id}/reviews`] });
      toast({
        title: "리뷰 작성 완료",
        description: "소중한 후기 감사합니다.",
      });
      setShowReviewDialog(false);
      setReviewComment("");
      setReviewRating(5);
    },
    onError: (error) => {
      toast({
        title: "리뷰 작성 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl p-6">
                  <div className="h-64 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">과정을 찾을 수 없습니다</h1>
            <Link href="/courses">
              <Button>과정 목록으로 돌아가기</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/courses" className="hover:text-primary">과정 목록</Link>
          <span>/</span>
          <span className="text-gray-900">{course.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <Card className="mb-8">
              <CardContent className="p-0">
                <div className="h-64 bg-gradient-to-r from-primary to-secondary rounded-t-xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <i className="fas fa-graduation-cap text-6xl mb-4"></i>
                    <h1 className="text-2xl font-bold">{course.title}</h1>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Badge variant="secondary" className="bg-primary text-white">
                      {course.type === 'online' ? '온라인' : course.type === 'offline' ? '오프라인' : '블렌디드'}
                    </Badge>
                    <Badge variant="outline">
                      {course.credit}학점
                    </Badge>
                    <Badge variant="outline">
                      {course.level === 'beginner' ? '초급' : course.level === 'intermediate' ? '중급' : '고급'}
                    </Badge>
                    <div className="flex items-center text-yellow-500">
                      <i className="fas fa-star mr-1"></i>
                      <span className="font-medium">4.8</span>
                      <span className="text-gray-500 ml-1">({reviews?.length || 0}명)</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-calendar-alt mr-2 text-primary"></i>
                      {course.startDate ? new Date(course.startDate).toLocaleDateString('ko-KR') : '상시 진행'}
                      {course.endDate && ` - ${new Date(course.endDate).toLocaleDateString('ko-KR')}`}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-clock mr-2 text-primary"></i>
                      총 {course.duration}시간
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-users mr-2 text-primary"></i>
                      {course.currentStudents}명 수강중
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-tag mr-2 text-primary"></i>
                      {course.category}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Tabs */}
            <Card>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="border-b">
                    <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                      <TabsTrigger value="intro" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                        과정소개
                      </TabsTrigger>
                      <TabsTrigger value="curriculum" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                        커리큘럼
                      </TabsTrigger>
                      <TabsTrigger value="instructor" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                        강사진
                      </TabsTrigger>
                      <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                        수강후기
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="p-6">
                    <TabsContent value="intro">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">과정 개요</h3>
                          <p className="text-gray-700 leading-relaxed">
                            {course.description || "이 과정은 전문적인 교육을 제공하여 학습자의 역량 향상을 목표로 합니다."}
                          </p>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-semibold mb-4">학습 목표</h3>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <i className="fas fa-check-circle text-accent mr-2 mt-1"></i>
                              <span className="text-gray-700">전문 지식과 실무 능력을 균형있게 개발</span>
                            </li>
                            <li className="flex items-start">
                              <i className="fas fa-check-circle text-accent mr-2 mt-1"></i>
                              <span className="text-gray-700">실제 현장에서 적용 가능한 실무 기술 습득</span>
                            </li>
                            <li className="flex items-start">
                              <i className="fas fa-check-circle text-accent mr-2 mt-1"></i>
                              <span className="text-gray-700">전문가 네트워크 구축 및 지속적인 학습 기반 마련</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="curriculum">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">강의 계획서</h3>
                        <div className="space-y-4">
                          {Array.from({ length: 8 }, (_, i) => (
                            <div key={i} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">주차 {i + 1}: 기본 개념 및 이론</h4>
                                <Badge variant="outline">{Math.floor(Math.random() * 3) + 2}시간</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">
                                핵심 개념과 기본 이론을 학습하고 실무 적용 방법을 익힙니다.
                              </p>
                              <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                  <i className="fas fa-play-circle mr-2 text-primary"></i>
                                  <span>강의 영상 (45분)</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <i className="fas fa-file-pdf mr-2 text-primary"></i>
                                  <span>강의 자료 (PDF)</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <i className="fas fa-clipboard-check mr-2 text-primary"></i>
                                  <span>실습 과제</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="instructor">
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold">강사진 소개</h3>
                        <div className="space-y-6">
                          <div className="flex items-start space-x-4">
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                              <i className="fas fa-user text-2xl text-gray-400"></i>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">김교수</h4>
                              <p className="text-primary font-medium">서울대학교 교육학과</p>
                              <p className="text-sm text-gray-600 mt-2">
                                교육과정 및 교수설계 전문가로 20년 이상의 연구 경력을 보유하고 있으며, 
                                다수의 교육 정책 개발에 참여했습니다.
                              </p>
                              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                                <span><i className="fas fa-graduation-cap mr-1"></i>교육학 박사</span>
                                <span><i className="fas fa-award mr-1"></i>우수강의상 수상</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="reviews">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold">수강후기</h3>
                          {isEnrolled && (
                            <Button onClick={() => setShowReviewDialog(true)} size="sm">
                              후기 작성
                            </Button>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          {reviewsLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="border rounded-lg p-4 animate-pulse">
                                <div className="flex items-center space-x-4 mb-3">
                                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                  <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                              </div>
                            ))
                          ) : reviews?.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              아직 작성된 후기가 없습니다.
                            </div>
                          ) : (
                            reviews?.map((review) => (
                              <div key={review.id} className="border rounded-lg p-4">
                                <div className="flex items-center space-x-4 mb-3">
                                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <i className="fas fa-user text-gray-400"></i>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">익명</span>
                                      <div className="flex text-yellow-500">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <i key={i} className={`fas fa-star ${i < review.rating ? '' : 'text-gray-300'}`}></i>
                                        ))}
                                      </div>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                      {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {course.discountPrice ? (
                      <>
                        <span className="line-through text-lg text-gray-400 mr-2">
                          {Number(course.price).toLocaleString()}원
                        </span>
                        {Number(course.discountPrice).toLocaleString()}원
                      </>
                    ) : (
                      `${Number(course.price).toLocaleString()}원`
                    )}
                  </div>
                  {course.discountPrice && (
                    <div className="text-sm text-accent font-medium">
                      {Math.round((1 - Number(course.discountPrice) / Number(course.price)) * 100)}% 할인
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">수강 기간</span>
                    <span className="font-medium">60일</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">수강 인원</span>
                    <span className="font-medium">{course.currentStudents}/{course.maxStudents || '무제한'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">학습 방식</span>
                    <span className="font-medium">
                      {course.type === 'online' ? '온라인' : course.type === 'offline' ? '오프라인' : '블렌디드'}
                    </span>
                  </div>
                </div>

                {isEnrolled ? (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <i className="fas fa-check-circle text-green-500 mr-2"></i>
                      <span className="text-green-700 font-medium">수강중</span>
                    </div>
                    <Link href="/mypage">
                      <Button className="w-full" variant="outline">
                        학습하기
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button 
                      className="w-full" 
                      onClick={() => setShowEnrollDialog(true)}
                      disabled={enrollMutation.isPending}
                    >
                      {enrollMutation.isPending ? "신청 중..." : "수강 신청하기"}
                    </Button>
                    <Button className="w-full" variant="outline">
                      <i className="fas fa-shopping-cart mr-2"></i>
                      장바구니 담기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">과정 정보</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">과정 코드</span>
                    <span className="font-medium">EDU-{course.id.toString().padStart(3, '0')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">승인 기관</span>
                    <span className="font-medium">교육부</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">수료 조건</span>
                    <span className="font-medium">80% 이상</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">수료증 발급</span>
                    <span className="font-medium">온라인 발급</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>수강 신청</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              다음 과정에 수강 신청하시겠습니까?
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium">{course.title}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {course.discountPrice ? Number(course.discountPrice).toLocaleString() : Number(course.price).toLocaleString()}원
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>
              취소
            </Button>
            <Button onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending}>
              {enrollMutation.isPending ? "신청 중..." : "신청하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>수강후기 작성</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="rating">평점</Label>
              <div className="flex space-x-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewRating(i + 1)}
                    className={`text-2xl ${i < reviewRating ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    <i className="fas fa-star"></i>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="comment">후기</Label>
              <Textarea
                id="comment"
                placeholder="과정에 대한 후기를 작성해주세요."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              취소
            </Button>
            <Button 
              onClick={() => reviewMutation.mutate()} 
              disabled={reviewMutation.isPending || !reviewComment.trim()}
            >
              {reviewMutation.isPending ? "작성 중..." : "작성하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
