import React, { useState, useEffect, useRef } from 'react';
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { apiRequest } from "@/lib/api";
import VideoPlayer from "@/components/video-player";

// Font Awesome 아이콘 지원을 위한 스타일 추가
const IconStyle = () => (
  <style>{`
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
    
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `}</style>
);

// 실제 스키마에 맞는 타입 정의
interface Course {
  id: number;
  title: string;
  description: string | null;
  category: string;
  type: string;
  level: string;
  credit: number;
  price: number;
  discountPrice: number | null;
  duration: string;
  totalHours: number | null;
  maxStudents: number | null;
  enrolledCount: number;
  startDate: string | null;
  endDate: string | null;
  imageUrl: string | null;
  status: string;
  approvalStatus: string;
  instructorId: number | null;
  objectives: string | null;
  requirements: string | null;
  materials: string | null;
  curriculum: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  instructorName?: string | null;
  instructorProfile?: string | null;
  instructorExpertise?: string | null;
  instructorImageUrl?: string | null;
  curriculumItems?: any[] | null;
  learningMaterials?: any[] | null;
}

interface Instructor {
  id: number;
  name: string;
  position: string | null;
  expertise: string | null;
  profile: string | null;
  imageUrl: string | null;
}

interface Review {
  id: number;
  courseId: number;
  userId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  isActive: boolean;
  userName?: string;
}

interface CurriculumItem {
  id: string;
  title: string;
  description?: string;
  videos?: {
    id: string;
    title: string;
    url: string;
    completed?: boolean;
  }[];
}

const CourseDetailPage: React.FC = () => {
  const [, params] = useRoute("/courses/:id");
  const courseId = params?.id ? parseInt(params.id) : 0;
  const { user, isLoading: userLoading } = useAuth();
  const { addToCart, isInCart: isInCartContext, refreshCart } = useCart();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("intro");
  const [isSticky, setIsSticky] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [showCourseEditModal, setShowCourseEditModal] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewContent, setNewReviewContent] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set());
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoTimer, setVideoTimer] = useState<NodeJS.Timeout | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // 장바구니, 찜하기, 공유하기 상태
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // 커리큘럼 편집 관련 상태 추가
  const [editingCurriculumItem, setEditingCurriculumItem] = useState<any>(null);
  const [showCurriculumEditModal, setShowCurriculumEditModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [showVideoEditModal, setShowVideoEditModal] = useState(false);
  const [showQuizEditModal, setShowQuizEditModal] = useState(false);

  // 강의 편집 폼 상태 (business-dashboard-page와 동일)
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    type: "online",
    level: "intermediate",
    credit: "1",
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
    learningMaterials: [] as { id: string; name: string; size: number; type: string; url: string; filename?: string }[],
  });

  // 커리큘럼 아이템 상태 (business-dashboard-page와 동일)
  const [curriculumItems, setCurriculumItems] = useState<Array<{
    id: string;
    title: string;
    duration: string;
    description: string;
    isCompleted: boolean;
    videos: Array<{
      id: string;
      title: string;
      url: string;
      duration: string;
      type: 'upload' | 'youtube' | 'vimeo';
    }>;
    quizzes: Array<{
      id: string;
      title: string;
      questions: Array<{
        id: string;
        question: string;
        type: 'multiple' | 'true-false' | 'short-answer';
        options?: string[];
        correctAnswer: string;
        explanation?: string;
      }>;
    }>;
  }>>([]);

  const queryClient = useQueryClient();

  // 강의 정보 조회
  const { data: course, isLoading: courseLoading, error: courseError } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        // 401 에러가 아닌 경우에만 에러 던지기
        if (response.status !== 401) {
          throw new Error("Failed to fetch course");
        }
        throw new Error("Authentication required");
      }
      return response.json();
    },
    enabled: !!courseId,
    retry: (failureCount, error) => {
      // 401 에러인 경우 재시도하지 않음
      if (error.message.includes('Authentication required')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // 강사 정보 조회 - 제거 (course 테이블의 강사 정보 사용)

  // 리뷰 조회
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/reviews`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      return response.json();
    },
    enabled: !!courseId,
  });

  // 관련 강의 조회 (같은 카테고리의 다른 강의들)
  const { data: relatedCourses = [] } = useQuery({
    queryKey: ["relatedCourses", course?.category, courseId],
    queryFn: async () => {
      if (!course?.category) return [];
      
      const response = await fetch(`/api/courses?category=${encodeURIComponent(course.category)}&limit=4&exclude=${courseId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        return []; // 에러가 발생해도 빈 배열 반환
      }
      const data = await response.json();
      return data.courses || data || [];
    },
    enabled: !!course?.category && !!courseId,
  });

  // 강의 수정 뮤테이션
  const updateCourseMutation = useMutation({
    mutationFn: async (updateData: any) => {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        throw new Error("Failed to update course");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      toast({
        title: "강의 정보가 업데이트되었습니다.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "업데이트에 실패했습니다.",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 강의 삭제 뮤테이션
  const deleteCourseMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete course");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "강의가 삭제되었습니다.",
        variant: "default",
      });
      window.location.href = "/courses";
    },
    onError: (error) => {
      toast({
        title: "삭제에 실패했습니다.",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 수강신청 뮤테이션
  const enrollmentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to enroll");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      toast({
        title: "수강신청이 완료되었습니다.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "수강신청에 실패했습니다.",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 리뷰 작성 뮤테이션
  const reviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; comment: string }) => {
      const response = await fetch(`/api/courses/${courseId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) {
        throw new Error("Failed to submit review");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", courseId] });
      setNewReviewContent("");
      setNewReviewRating(5);
      setShowReviewModal(false);
      toast({
        title: "리뷰가 등록되었습니다.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "리뷰 등록에 실패했습니다.",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 찜하기 뮤테이션
  const wishlistMutation = useMutation({
    mutationFn: async () => {
      const method = isInWishlist ? "DELETE" : "POST";
      const response = await fetch(`/api/courses/${courseId}/wishlist`, {
        method,
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Failed to ${isInWishlist ? 'remove from' : 'add to'} wishlist`);
      }
      return response.json();
    },
    onSuccess: () => {
      setIsInWishlist(!isInWishlist);
      toast({
        title: isInWishlist ? "찜 목록에서 제거되었습니다." : "찜 목록에 추가되었습니다.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "찜하기 처리에 실패했습니다.",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 장바구니 뮤테이션
  const cartMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          courseId: courseId,
          type: "course"
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }
      return response.json();
    },
    onSuccess: () => {
      refreshCart();
      toast({
        title: "장바구니에 추가되었습니다.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "장바구니 추가에 실패했습니다.",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 수강신청 핸들러
  const handleEnrollment = () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다.",
        description: "수강신청을 위해 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }
    enrollmentMutation.mutate();
  };

  // 결제 핸들러
  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "결제 방법을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    if (!isAgreed) {
      toast({
        title: "이용약관에 동의해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 실제 결제 처리 로직 (결제 게이트웨이 연동)
    toast({
      title: "결제가 진행됩니다.",
      description: "잠시만 기다려주세요...",
      variant: "default",
    });
    
    setIsPaymentModalOpen(false);
    handleEnrollment();
  };

  // 리뷰 제출 핸들러
  const handleReviewSubmit = () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다.",
        description: "리뷰 작성을 위해 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!newReviewContent.trim()) {
      toast({
        title: "리뷰 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    reviewMutation.mutate({
      rating: newReviewRating,
      comment: newReviewContent,
    });
  };

  const handleCourseUpdate = (field: string, value: any) => {
    if (course) {
      updateCourseMutation.mutate({ [field]: value });
    }
  };

  const handleDeleteCourse = () => {
    if (window.confirm('정말로 이 강의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      deleteCourseMutation.mutate();
    }
  };

  // 찜하기 핸들러
  const handleWishlist = () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다.",
        description: "찜하기를 위해 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }
    wishlistMutation.mutate();
  };

  // 장바구니 담기 핸들러
  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다.",
        description: "장바구니 이용을 위해 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await addToCart(courseId, course);
      toast({
        title: "장바구니에 추가되었습니다.",
        variant: "default",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      
      if (errorMessage.includes('이미 장바구니에 있는')) {
        toast({
          title: "이미 장바구니에 있습니다.",
          description: "장바구니에서 확인하세요.",
          variant: "default",
        });
      } else {
        toast({
          title: "장바구니 추가에 실패했습니다.",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  // 공유하기 핸들러
  const handleShare = () => {
    setShowShareModal(true);
  };

  // URL 복사 핸들러
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "링크가 복사되었습니다.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "링크 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 소셜 공유 핸들러
  const handleSocialShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(course?.title || "강의");
    const description = encodeURIComponent(course?.description?.substring(0, 100) || "");

    let shareUrl = "";

    switch (platform) {
      case "kakao":
        shareUrl = `https://sharer.kakao.com/talk/friends/?url=${url}&title=${title}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case "line":
        shareUrl = `https://social-plugins.line.me/lineit/share?url=${url}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  // 가격 포맷팅 함수
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  // 커리큘럼 아이템 추가 함수
  const addCurriculumItem = () => {
    const newItem = {
      id: Date.now().toString(),
      title: "새 차시",
      duration: "3시간",
      description: "",
      isCompleted: false,
      videos: [],
      quizzes: []
    };
    setCurriculumItems([...curriculumItems, newItem]);
  };

  // 커리큘럼 아이템 삭제 함수
  const deleteCurriculumItem = (itemId: string) => {
    setCurriculumItems(curriculumItems.filter(item => item.id !== itemId));
  };

  // 비디오 추가 함수
  const addVideoToCurriculum = (curriculumId: string) => {
    const newVideo = {
      id: Date.now().toString(),
      title: "새 동영상",
      url: "",
      duration: "10분",
      type: 'upload' as const
    };
    
    setCurriculumItems(curriculumItems.map(item => 
      item.id === curriculumId 
        ? { ...item, videos: [...item.videos, newVideo] }
        : item
    ));
  };

  // 퀴즈 추가 함수
  const addQuizToCurriculum = (curriculumId: string) => {
    const newQuiz = {
      id: Date.now().toString(),
      title: "새 퀴즈",
      questions: [{
        id: Date.now().toString(),
        question: "새 문제",
        type: 'multiple' as const,
        options: ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
        correctAnswer: "선택지 1",
        explanation: ""
      }]
    };
    
    setCurriculumItems(curriculumItems.map(item => 
      item.id === curriculumId 
        ? { ...item, quizzes: [...item.quizzes, newQuiz] }
        : item
    ));
  };

  // 커리큘럼 아이템 업데이트 함수
  const updateCurriculumItem = (itemId: string, updates: any) => {
    setCurriculumItems(curriculumItems.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      const enrollSection = document.getElementById("enroll-section");
      if (enrollSection) {
        const rect = enrollSection.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 인증 상태 확인 및 디버깅
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('CourseDetailPage - User loading:', userLoading);
      console.log('CourseDetailPage - User:', user);
      console.log('CourseDetailPage - Course ID:', courseId);
    }
  }, [user, userLoading, courseId]);

  // 사용자별 찜 목록과 장바구니 상태 확인
  useEffect(() => {
    if (user && courseId) {
      // 찜 목록 상태 확인
      fetch(`/api/courses/${courseId}/wishlist/status`, {
        credentials: "include",
      })
        .then(response => response.ok ? response.json() : { isInWishlist: false })
        .then(data => setIsInWishlist(data.isInWishlist))
        .catch(() => setIsInWishlist(false));

      // 장바구니 상태 확인
      fetch(`/api/cart/items/status?courseId=${courseId}`, {
        credentials: "include",
      })
        .then(response => response.ok ? response.json() : { isInCart: false })
        .then(data => setIsInWishlist(data.isInCart))
        .catch(() => setIsInWishlist(false));
    }
  }, [user, courseId]);

  // 수강 정보 통합 쿼리
  const { data: enrollmentData, isLoading: enrollmentLoading, refetch: refetchEnrollment } = useQuery<{ enrollment: any }>({
    queryKey: [`/api/user/enrollments/course/${courseId}`],
    queryFn: async () => {
      if (!courseId || !user?.id) return { enrollment: null };
      const response = await apiRequest(
        "GET",
        `/api/enrollments?userId=${user.id}&courseId=${courseId}`
      );
      return { enrollment: response[0] || null };
    },
    enabled: !!user && !!courseId,
  });

  const enrollment = enrollmentData?.enrollment;
  const isEnrolled = !!enrollment;

  // isInCart를 Context에서 가져온 값으로 대체
  const isInCart = courseId ? isInCartContext(courseId) : false;

  // 진도율 업데이트 요청을 추적하기 위한 Map
  const progressUpdateQueue = useRef(new Map<string, boolean>());

  const updateProgress = async (
    itemId: string, 
    itemType: 'video' | 'quiz', 
    progress: number
  ): Promise<any> => {
    // 중복 요청 방지
    const requestKey = `${itemId}-${itemType}`;
    if (progressUpdateQueue.current.get(requestKey)) {
      return;
    }

    progressUpdateQueue.current.set(requestKey, true);

    try {
      if (!enrollment?.id) {
        throw new Error('수강 정보를 찾을 수 없습니다.');
      }

      const response = await fetch(`/api/user/enrollments/${enrollment.id}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          itemType,
          progress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `서버 오류 ${response.status}`);
      }

      const result = await response.json();
      
      // 성공 시 수강 정보 새로고침
      if (result.success) {
        refetchEnrollment();
      }
      
      return result;
    } catch (error) {
      console.error('진도율 업데이트 실패:', error);
      throw new Error('진도율 업데이트 중 오류가 발생했습니다.');
    } finally {
      // 요청 완료 후 큐에서 제거
      progressUpdateQueue.current.delete(requestKey);
    }
  };

  // 로컬 스토리지 데이터 마이그레이션
  const migrateLocalStorageData = async () => {
    if (!user || !enrollment || !course?.id) return;

    try {
      // 로컬 스토리지에서 기존 데이터 확인
      const completedVideosKey = `completed_video_${course.id}`;
      const completedQuizzesKey = `completed_quiz_${course.id}`;
      
      const localVideos = JSON.parse(localStorage.getItem(completedVideosKey) || '[]');
      const localQuizzes = JSON.parse(localStorage.getItem(completedQuizzesKey) || '[]');

      // 기존 데이터가 있는 경우에만 마이그레이션 진행
      if (localVideos.length > 0 || localQuizzes.length > 0) {
        console.log('기존 로컬 데이터 마이그레이션 시작...');

        // 비디오 진도율 마이그레이션
        for (const videoId of localVideos) {
          await retryOperation(() => handleVideoProgress(videoId, 100));
        }

        // 퀴즈 진도율 마이그레이션
        for (const quizId of localQuizzes) {
          await retryOperation(() => handleQuizComplete(quizId, 100));
        }

        // 마이그레이션 완료 후 로컬 데이터 삭제
        localStorage.removeItem(completedVideosKey);
        localStorage.removeItem(completedQuizzesKey);

        console.log('로컬 데이터 마이그레이션 완료');
        toast({
          title: "진도율 데이터 복원 완료",
          description: "기존 학습 데이터가 성공적으로 복원되었습니다.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('데이터 마이그레이션 중 오류:', error);
      toast({
        title: "데이터 복원 실패",
        description: "기존 학습 데이터 복원 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 네트워크 작업 재시도 유틸리티 함수
  const retryOperation = async (operation: () => Promise<any>, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`작업 실패 (시도 ${i + 1}/${maxRetries}):`, error);
        lastError = error;
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1))); // 지수 백오프
        }
      }
    }
    
    throw lastError;
  };

  // 완료된 항목 저장 함수
  const saveCompletedItem = async (type: 'video' | 'quiz', itemId: string) => {
    if (!user || !enrollment || !course?.id) return;
    
    try {
      await retryOperation(() => handleVideoProgress(itemId, 100));
    } catch (error) {
      console.error('진도율 저장 중 오류:', error);
      toast({
        title: "진도율 저장 실패",
        description: "나중에 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // 완료된 항목 불러오기 함수
  const loadCompletedItems = async () => {
    if (!enrollment?.id) return;

    try {
      const response = await fetch(`/api/user/enrollments/${enrollment.id}/progress`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompletedVideos(new Set(data.completedVideos || []));
        setCompletedQuizzes(new Set(data.completedQuizzes || []));
      } else {
        console.error('진도율 조회 실패:', response.status);
      }
    } catch (error) {
      console.error('진도율 조회 중 오류:', error);
    }
  };

  // 컴포넌트 마운트 시 완료된 항목 불러오기
  useEffect(() => {
    if (course?.id) {
      loadCompletedItems();
    }
    // TODO: syncProgress 함수 hoisting 문제로 일시적으로 주석처리
    // if (enrollment?.progress === 100) {
    //   syncProgress();
    // }
  }, [course?.id, enrollment?.progress]);

  // 비디오 시청 진도율 업데이트 핸들러
  const handleVideoProgress = async (videoId: string, progress: number) => {
    if (!user || !enrollment || !course?.id) {
      toast({
        title: "로그인 필요",
        description: "진도율을 저장하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // 서버에 진도율 업데이트 요청
      const response = await updateProgress(videoId, 'video', progress);

      if (response) {
        // 캐시 갱신
        queryClient.invalidateQueries({ queryKey: ["enrollments"] });
        refetchEnrollment();

        // 90% 이상 시청 시 완료 처리
        if (progress >= 90) {
          setCompletedVideos(prev => new Set(prev).add(videoId));
          toast({
            title: "강의 완료",
            description: "강의를 성공적으로 완료했습니다.",
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error('진도율 업데이트 중 오류:', error);
      toast({
        title: "진도율 업데이트 실패",
        description: "나중에 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // 퀴즈 완료 처리
  const handleQuizComplete = async (quizId: string, score: number) => {
    if (!user || !enrollment || !course?.id) {
      toast({
        title: "로그인 필요",
        description: "퀴즈 결과를 저장하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // 서버에 진도율 업데이트 요청
      const response = await updateProgress(
        quizId, 
        'quiz', 
        score >= 60 ? 100 : Math.min(score, 59) // 60점 이상이면 완료 처리
      );

      if (response) {
        // 캐시 갱신
        queryClient.invalidateQueries({ queryKey: ["enrollments"] });
        refetchEnrollment();

        if (score >= 60) {
          setCompletedQuizzes(prev => new Set(prev).add(quizId));
          toast({
            title: "퀴즈 완료",
            description: "퀴즈를 성공적으로 완료했습니다.",
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error('진도율 업데이트 중 오류:', error);
      toast({
        title: "진도율 업데이트 실패",
        description: "나중에 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // 이미지 URL 처리 함수
  const getImageUrl = (imageUrl: string | null | undefined, fallbackImage: string = "/uploads/images/1.jpg") => {
    // 실제 업로드된 이미지가 있고 placeholder가 아닌 경우
    if (imageUrl && imageUrl !== "/api/placeholder/400/250" && !imageUrl.includes("readdy.ai")) {
      return imageUrl;
    }
    // 샘플 이미지 사용
    return fallbackImage;
  };

  if (courseLoading || userLoading || enrollmentLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {userLoading ? "사용자 정보를 확인하는 중..." : 
               enrollmentLoading ? "수강 정보를 확인하는 중..." :
               "강의 정보를 불러오는 중..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">강의를 찾을 수 없습니다</h1>
            <p className="text-gray-600 mb-8">요청하신 강의가 존재하지 않거나 삭제되었습니다.</p>
            <Button onClick={() => window.history.back()}>이전 페이지로 돌아가기</Button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user?.isAdmin || false;
  const discountRate = course.discountPrice ? Math.round(((course.price - course.discountPrice) / course.price) * 100) : 0;
  const actualPrice = course.discountPrice || course.price;

  // 편집 권한 체크: 슈퍼 관리자이거나 강의 작성자인 경우 (비즈니스 권한은 자신이 등록한 강의만)
  const canEdit = user?.isAdmin || // 슈퍼 관리자는 모든 강의 편집 가능
                  (user?.id && course?.instructorId === user.id) || // 강의 작성자는 자신의 강의만 편집 가능
                  false;

  // 사용자 권한 타입 확인
  const userRoleType = user?.isAdmin ? 'admin' : 
                      user?.role === 'business' ? 'business' : 
                      'user';

  // 편집 가능한 이유 확인 (UI 표시용)
  const editReason = user?.isAdmin ? 'admin' : 
                    (user?.id && course?.instructorId === user.id) ? 'owner' : 
                    null;

  // 커리큘럼 파싱 - curriculumItems가 있으면 그것을 사용, 없으면 문자열 파싱
  const parsedCurriculum = course.curriculumItems && course.curriculumItems.length > 0 
    ? course.curriculumItems.map((item: any, index: number) => ({
        week: index + 1,
        title: item.title || `${index + 1}차시`,
        topics: item.description ? [item.description] : [],
        duration: item.duration || "3시간",
        videos: item.videos || [],
        quizzes: item.quizzes || []
      }))
    : course.curriculum ? 
      course.curriculum.split('\n').filter((line: string) => line.trim()).map((line: string, index: number) => ({
        week: index + 1,
        title: line.trim(),
        topics: [],
        duration: "3시간",
        // 테스트용 샘플 데이터 추가
        videos: index === 0 ? [
          {
            id: `video-${index}-1`,
            title: "교육과정 개정 개요",
            url: "dQw4w9WgXcQ", // 테스트용 YouTube ID
            duration: "15분",
            type: "youtube"
          },
          {
            id: `video-${index}-2`, 
            title: "교육과정 변화의 필요성",
            url: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
            duration: "10분",
            type: "upload"
          }
        ] : index === 1 ? [
          {
            id: `video-${index}-1`,
            title: "학생 중심 수업 설계",
            url: "jNQXAC9IVRw", // 테스트용 YouTube ID
            duration: "20분", 
            type: "youtube"
          }
        ] : [],
        quizzes: index === 0 ? [
          {
            id: `quiz-${index}-1`,
            title: "교육과정 이해도 퀴즈",
            questions: [
              {
                id: "q1",
                question: "2025 교육과정 개정의 주요 목표는 무엇입니까?",
                type: "multiple",
                options: [
                  "학생 중심 교육 강화",
                  "교사 업무 경감",
                  "학교 시설 개선",
                  "학부모 참여 확대"
                ],
                correctAnswer: "학생 중심 교육 강화",
                explanation: "2025 교육과정 개정의 핵심은 학생 중심의 맞춤형 교육입니다."
              },
              {
                id: "q2",
                question: "개정 교육과정에서 중요하게 다루는 역량 중심 교육이 맞습니까?",
                type: "true-false",
                correctAnswer: "true",
                explanation: "역량 중심 교육은 개정 교육과정의 핵심 요소입니다."
              }
            ]
          }
        ] : index === 1 ? [
          {
            id: `quiz-${index}-1`,
            title: "수업 설계 퀴즈",
            questions: [
              {
                id: "q1",
                question: "학생 중심 수업에서 가장 중요한 요소는?",
                type: "short-answer",
                correctAnswer: "참여",
                explanation: "학생의 적극적인 참여가 학생 중심 수업의 핵심입니다."
              }
            ]
          }
        ] : []
      })) : [];

  // 학습 목표 파싱
  const objectives = course.objectives ? 
    course.objectives.split('\n').filter((line: string) => line.trim()) : [];

  // 업데이트 팩터 파라미터 추가
  // 파일 다운로드 핸들러 추가
  const handleFileDownload = async (material: any) => {
    try {
      // 실제 파일 다운로드 로직
      if (material.filename) {
        // 서버에 실제 업로드된 파일인 경우
        const downloadUrl = `/api/business/download-learning-material/${material.filename}?originalName=${encodeURIComponent(material.name)}`;
        const response = await fetch(downloadUrl, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('파일 다운로드에 실패했습니다.');
        }
        
        // 파일을 blob으로 받아서 다운로드
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = material.name; // 원본 파일명 사용
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "파일 다운로드 완료",
          description: `${material.name}이(가) 다운로드되었습니다.`,
          variant: "default",
        });
      } else if (material.url && material.url !== "#") {
        // 외부 URL인 경우 새 창으로 열기
        window.open(material.url, '_blank');
      } else {
        // 샘플 데이터인 경우 (실제 파일이 없음)
        toast({
          title: "샘플 파일입니다",
          description: `${material.name}은(는) 샘플 파일입니다. 실제 강의에서는 다운로드가 가능합니다.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error('파일 다운로드 오류:', error);
      toast({
        title: "다운로드 실패",
        description: "파일 다운로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // 파일 아이콘 함수
  const getFileIcon = (type: string | undefined) => {
    if (!type) return 'fas fa-file text-gray-600';
    if (type.includes('pdf')) return 'fas fa-file-pdf text-red-600';
    if (type.includes('word') || type.includes('document')) return 'fas fa-file-word text-blue-600';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'fas fa-file-excel text-green-600';
    if (type.includes('powerpoint') || type.includes('presentation')) return 'fas fa-file-powerpoint text-orange-600';
    if (type.includes('image')) return 'fas fa-file-image text-purple-600';
    if (type.includes('video')) return 'fas fa-file-video text-red-600';
    if (type.includes('audio')) return 'fas fa-file-audio text-blue-600';
    if (type.includes('zip') || type.includes('rar')) return 'fas fa-file-archive text-yellow-600';
    return 'fas fa-file text-gray-600';
  };

  // 파일 크기 포맷팅 함수
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 퀴즈 채점 및 진도율 업데이트
  const handleQuizSubmit = async (answers: any[]) => {
    if (!selectedQuiz || !course || !enrollment) return;
    
    try {
      if (!selectedQuiz.questions || !enrollment?.id) {
        throw new Error("퀴즈 정보가 없거나 수강 정보를 찾을 수 없습니다.");
      }

      const totalQuestions = selectedQuiz.questions.length;
      let correctCount = 0;
      const results: any[] = [];

      // 각 문제 채점
      selectedQuiz.questions.forEach((question: any, index: number) => {
        const userAnswer = quizAnswers[`question-${index}`];
        const correctAnswer = question.correctAnswer;

        // 답안 정규화
        const normalizeAnswer = (answer: string | undefined | null) => {
          if (!answer) return "";
          return answer.toString().trim().toLowerCase().replace(/\s+/g, ' ');
        };

        const normalizedUserAnswer = normalizeAnswer(userAnswer);
        const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);

        let isCorrect = false;

        if (question.type === 'true-false') {
          const userBool = userAnswer === 'true' || userAnswer === '참';
          const correctBool = correctAnswer === 'true' || correctAnswer === '참';
          isCorrect = userBool === correctBool;
        } else if (question.type === 'short-answer') {
          isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        } else {
          isCorrect = userAnswer === correctAnswer;
        }

        if (isCorrect) correctCount++;
        results.push({
          questionNumber: index + 1,
          question: question.question,
          userAnswer: userAnswer || "답변 없음",
          correctAnswer: correctAnswer,
          isCorrect: isCorrect,
          type: question.type
        });
      });

      const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
      const passed = score >= 60;

      // 상세 결과 로그
      console.log('=== 퀴즈 채점 결과 ===');
      console.log('총 문제 수:', totalQuestions);
      console.log('정답 수:', correctCount);
      console.log('점수:', score);
      console.log('합격 여부:', passed);
      console.log('상세 결과:', results);
      console.log('==================');

      // 결과 표시
      toast({
        title: `퀴즈 완료! ${correctCount}/${totalQuestions} 정답`,
        description: `점수: ${Math.round(score)}점 ${passed ? '(합격 ✅)' : '(불합격 ❌ - 60점 이상 필요)'}`,
        variant: passed ? "default" : "destructive",
        duration: 5000,
      });

      // 합격 시 진도율 업데이트 및 완료 처리
      if (passed) {
        const quizKey = `${selectedQuiz.weekIndex}-${selectedQuiz.id}`;
        setCompletedQuizzes(prev => {
          const newSet = new Set(prev).add(quizKey);
          saveCompletedItem('quiz', quizKey);
          return newSet;
        });

        // 진도율 업데이트 API 호출
        await updateProgress(quizKey, 'quiz', Math.round(score));

        // 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ["enrollment", enrollment.id] });
        queryClient.invalidateQueries({ queryKey: ["enrollments"] });

        toast({
          title: "축하합니다! 🎉",
          description: "퀴즈를 성공적으로 완료했습니다.",
          variant: "default",
        });
      } else {
        // 불합격 시 틀린 문제 표시
        const wrongAnswers = results.filter(r => !r.isCorrect);
        console.log('틀린 문제 상세:', wrongAnswers);
      }

      // 퀴즈 모달 닫기
      setShowQuizModal(false);
      // 답변 초기화
      setQuizAnswers({});

      return { results, score, passed };
    } catch (error) {
      console.error("퀴즈 제출 중 오류:", error);
      toast({
        title: "오류 발생",
        description: "퀴즈 제출 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // 진도율 동기화 함수
  const syncProgress = async () => {
    if (!user || !enrollment || !course?.id) return;

    try {
      // 전체 항목 수 계산
      let totalItems = 0;
      let completedItems = 0;
      
      parsedCurriculum.forEach((week: any) => {
        if (week.videos?.length) totalItems += week.videos.length;
        if (week.quizzes?.length) totalItems += week.quizzes.length;
      });

      // 완료된 항목 수 계산
      completedItems = completedVideos.size + completedQuizzes.size;
      
      // 전체 진도율 계산
      const totalProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      // 서버에 진도율 업데이트
      if (totalProgress === 100) {
        // 100% 달성 시 모든 항목 완료 처리
        const allVideos = new Set<string>();
        const allQuizzes = new Set<string>();
        
        parsedCurriculum.forEach((week: any, weekIndex: number) => {
          week.videos?.forEach((video: any) => {
            const videoId = `${weekIndex}-${video.id}`;
            allVideos.add(videoId);
          });
          week.quizzes?.forEach((quiz: any) => {
            const quizId = `${weekIndex}-${quiz.id}`;
            allQuizzes.add(quizId);
          });
        });
        
        setCompletedVideos(allVideos);
        setCompletedQuizzes(allQuizzes);

        // 각 항목별로 100% 진도율 업데이트
        for (const videoId of Array.from(allVideos)) {
          await retryOperation(() => handleVideoProgress(videoId, 100));
        }
        for (const quizId of Array.from(allQuizzes)) {
          await retryOperation(() => handleQuizComplete(quizId, 100));
        }
      }

      // 캐시 갱신
      queryClient.invalidateQueries({ queryKey: ["enrollment", enrollment.id] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    } catch (error) {
      console.error('진도율 동기화 중 오류:', error);
      toast({
        title: "진도율 동기화 실패",
        description: "나중에 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <IconStyle />
      {/* 헤더 */}
      <Header />

      {/* 과정 상세 페이지 */}
      <div className="container mx-auto px-4 py-8">
        {/* 상단 네비게이션 */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <a href="/courses" className="hover:text-indigo-600 cursor-pointer">
              <i className="fas fa-arrow-left mr-2"></i>
              연수과정 목록으로 돌아가기
            </a>
            <span className="mx-2">|</span>
            <span>
              <i className="fas fa-home mr-1"></i>홈
            </span>
            <span className="mx-2">&gt;</span>
            <span>연수과정</span>
            <span className="mx-2">&gt;</span>
            <span className="text-indigo-600 font-medium">
              {course?.title || "강의 상세"}
            </span>
          </div>
        </div>

        {/* 관리자/비즈니스 모드 토글 */}
        {canEdit && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center">
              <i className={`${editReason === 'admin' ? 'fas fa-user-shield' : 'fas fa-user-edit'} text-yellow-600 mr-2`}></i>
              <span className="font-medium">
                {editReason === 'admin' ? '슈퍼 관리자 모드' : 
                 userRoleType === 'business' ? '기관/사업자 편집 모드' : 
                 '강의 편집 모드'}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                ({editReason === 'admin' ? '모든 강의 편집 가능' : '내가 등록한 강의'})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {showCourseEditModal ? "편집 모드 활성화됨" : "편집 모드 비활성화"}
              </span>
              <Switch
                checked={showCourseEditModal}
                onCheckedChange={setShowCourseEditModal}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>
          </div>
        )}

        {/* 과정 기본 정보 */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8" id="enroll-section">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-6">
              <div className="flex items-center mb-4">
                <Badge className="bg-indigo-600 hover:bg-indigo-700 mr-2">
                  {course?.type || "온라인"}
                </Badge>
                <Badge className="bg-green-600 hover:bg-green-700">
                  학점인정
                </Badge>
                {canEdit && showCourseEditModal && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    <i className="fas fa-edit mr-1"></i>
                    {userRoleType === 'admin' ? '관리자 편집' : '기관 편집'}
                  </Button>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {course?.title || "강의 제목"}
              </h1>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-calendar-alt mr-2 text-indigo-600"></i>
                  <span>연수기간: {course?.startDate && course?.endDate 
                    ? `${new Date(course.startDate).toLocaleDateString('ko-KR')} - ${new Date(course.endDate).toLocaleDateString('ko-KR')}`
                    : "2025.07.01 - 2025.08.30"}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-graduation-cap mr-2 text-indigo-600"></i>
                  <span>학점: {course?.credit || 3}학점</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-clock mr-2 text-indigo-600"></i>
                  <span>총 학습시간: {course?.totalHours || 45}시간</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-signal mr-2 text-indigo-600"></i>
                  <span>난이도: {course?.level || "중급"}</span>
                </div>
              </div>
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400 mr-2">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star-half-alt"></i>
                </div>
                <span className="font-medium">4.8</span>
                <span className="text-gray-500 ml-1">
                  ({reviews?.length || 0}개 후기)
                </span>
                <span className="mx-3 text-gray-300">|</span>
                <span className="text-gray-600">
                  <i className="fas fa-user-graduate mr-1"></i>
                  {course?.enrolledCount || 256}명 수강중
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: "로그인이 필요합니다.",
                        description: "수강신청을 위해 로그인해주세요.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setIsPaymentModalOpen(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 !rounded-button whitespace-nowrap cursor-pointer"
                >
                  <i className="fas fa-shopping-cart mr-2"></i>
                  수강신청하기
                </Button>
                <Button 
                  onClick={handleWishlist}
                  disabled={wishlistMutation.isPending}
                  className={`px-4 py-3 !rounded-button whitespace-nowrap cursor-pointer ${
                    isInWishlist 
                      ? "bg-red-50 border border-red-500 text-red-600 hover:bg-red-100" 
                      : "bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                  }`}
                >
                  <i className={`${isInWishlist ? 'fas fa-heart' : 'far fa-heart'} mr-2`}></i>
                  {wishlistMutation.isPending ? "처리중..." : (isInWishlist ? "찜 해제" : "찜하기")}
                </Button>
                <Button 
                  onClick={handleShare}
                  className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-3 !rounded-button whitespace-nowrap cursor-pointer"
                >
                  <i className="fas fa-share-alt mr-2"></i>
                  공유하기
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src={getImageUrl(course?.imageUrl, "/uploads/images/1.jpg")}
                alt={course?.title || "강의 이미지"}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  // 이미지 로드 실패 시 다른 샘플 이미지로 대체
                  const fallbackImages = ["/uploads/images/1.jpg", "/uploads/images/4.jpg", "/uploads/images/5.jpg", "/uploads/images/6.jpg", "/uploads/images/12.jpg"];
                  const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
                  e.currentTarget.src = randomFallback;
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="text-white">
                  {course?.discountPrice && course?.discountPrice < course?.price ? (
                    <>
                      <div className="text-2xl font-bold mb-1">
                        {formatPrice(course.discountPrice)}원
                      </div>
                      <div className="flex items-center">
                        <span className="line-through text-gray-300 mr-2">
                          {formatPrice(course.price)}원
                        </span>
                        <Badge className="bg-red-500 hover:bg-red-600">
                          {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% 할인
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl font-bold mb-1">
                      {formatPrice(course?.price || 120000)}원
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex overflow-x-auto">
              <button
                className={`px-6 py-4 text-center flex-1 font-medium whitespace-nowrap cursor-pointer ${activeTab === "intro" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-600 hover:text-indigo-600"}`}
                onClick={() => setActiveTab("intro")}
              >
                과정소개
              </button>
              <button
                className={`px-6 py-4 text-center flex-1 font-medium whitespace-nowrap cursor-pointer ${activeTab === "curriculum" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-600 hover:text-indigo-600"}`}
                onClick={() => setActiveTab("curriculum")}
              >
                커리큘럼
              </button>
              <button
                className={`px-6 py-4 text-center flex-1 font-medium whitespace-nowrap cursor-pointer ${activeTab === "instructor" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-600 hover:text-indigo-600"}`}
                onClick={() => setActiveTab("instructor")}
              >
                강사소개
              </button>
              <button
                className={`px-6 py-4 text-center flex-1 font-medium whitespace-nowrap cursor-pointer ${activeTab === "reviews" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-600 hover:text-indigo-600"}`}
                onClick={() => setActiveTab("reviews")}
              >
                수강후기
              </button>
              <button
                className={`px-6 py-4 text-center flex-1 font-medium whitespace-nowrap cursor-pointer ${activeTab === "faq" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-600 hover:text-indigo-600"}`}
                onClick={() => setActiveTab("faq")}
              >
                자주 묻는 질문
              </button>
            </div>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-2">
            {/* 과정 소개 */}
            {activeTab === "intro" && (
              <div className="space-y-8">
                {/* 과정 소개 */}
                <div className="bg-white rounded-xl shadow-md p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      과정 소개
                    </h2>
                    {canEdit && showCourseEditModal && (
                      <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {userRoleType === 'admin' ? '관리자 편집 모드' : '기관 편집 모드'}
                      </div>
                    )}
                  </div>
                  <div className="prose max-w-none">
                    {showCourseEditModal ? (
                      <Textarea
                        value={course?.description || ""}
                        onChange={(e) => handleCourseUpdate('description', e.target.value)}
                        className="min-h-[200px] text-base leading-relaxed"
                        placeholder="과정 소개를 입력하세요"
                      />
                    ) : (
                      <div className="space-y-4 text-gray-700 leading-relaxed">
                        <p className="text-lg">
                          {course?.description || "2025 교육과정 개정안에 따라 새롭게 도입되는 역량을 갖춘 인재를 양성하기 위한 종합적인 학습프로그램입니다."}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 학습 목표 */}
                  <Card className="p-6 mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">학습 목표</h3>
                      {canEdit && showCourseEditModal && (
                        <div className="text-sm text-blue-600">
                          한 줄씩 입력하세요
                        </div>
                      )}
                    </div>
                    
                    {showCourseEditModal ? (
                      <Textarea
                        value={course?.objectives || ""}
                        onChange={(e) => handleCourseUpdate('objectives', e.target.value)}
                        className="min-h-[150px]"
                        placeholder="학습 목표를 한 줄씩 입력하세요"
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {objectives.length > 0 ? (
                          objectives.map((objective: string, index: number) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <i className="fas fa-check text-blue-600 text-xs"></i>
                              </div>
                              <span className="text-gray-700 leading-relaxed">{objective}</span>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <i className="fas fa-check text-blue-600 text-xs"></i>
                              </div>
                              <span className="text-gray-700 leading-relaxed">2025 교육과정 개정에 따른 새로운 교육방법론을 이해할 수 있습니다.</span>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <i className="fas fa-check text-blue-600 text-xs"></i>
                              </div>
                              <span className="text-gray-700 leading-relaxed">학생 중심의 수업 설계 방법을 학습할 수 있습니다.</span>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <i className="fas fa-check text-blue-600 text-xs"></i>
                              </div>
                              <span className="text-gray-700 leading-relaxed">평가 방법의 다양화를 통한 학습 효과를 극대화할 수 있습니다.</span>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <i className="fas fa-check text-blue-600 text-xs"></i>
                              </div>
                              <span className="text-gray-700 leading-relaxed">디지털 도구를 활용한 창의적 수업을 구현할 수 있습니다.</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </Card>
                </div>

                {/* 강의 특징 */}
                <div className="bg-white rounded-xl shadow-md p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">강의 특징</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-graduation-cap text-blue-600 text-xl"></i>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">최신 교육과정 반영</h4>
                        <p className="text-gray-600 leading-relaxed">
                          2025 개정 교육과정의 핵심 요소를 반영한 최신 교육방법론을 제공합니다.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-users text-green-600 text-xl"></i>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">실무 중심 학습</h4>
                        <p className="text-gray-600 leading-relaxed">
                          이론과 실습을 균형있게 구성하여 현장에서 바로 적용 가능한 내용을 다룹니다.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-laptop text-purple-600 text-xl"></i>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">디지털 도구 활용</h4>
                        <p className="text-gray-600 leading-relaxed">
                          다양한 에듀테크 도구를 활용한 창의적이고 효과적인 수업 방법을 학습합니다.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-certificate text-red-600 text-xl"></i>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">학점 인정 연수</h4>
                        <p className="text-gray-600 leading-relaxed">
                          교육부 인정 연수로 교원 자격 갱신 및 승진 가산점 취득이 가능합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 이런 분들께 추천합니다 */}
                <div className="bg-white rounded-xl shadow-md p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">이런 분들께 추천합니다</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <span className="text-gray-700">2025 교육과정 개정에 대한 이해가 필요한 교육자</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <span className="text-gray-700">학생 중심 수업 방법론을 학습하고 싶은 교사</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <span className="text-gray-700">교육과정 개발 및 운영 담당자</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <span className="text-gray-700">교육 연구기관 및 교육청 관계자</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <span className="text-gray-700">교육 혁신에 관심 있는 모든 교육자</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <i className="fas fa-check text-green-600 text-xs"></i>
                      </div>
                      <span className="text-gray-700">에듀테크 도구 활용 방법을 익히고 싶은 교사</span>
                    </div>
                  </div>
                </div>

                {/* 학습 자료 */}
                <div className="bg-white rounded-xl shadow-md p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">학습 자료</h3>
                    {canEdit && showCourseEditModal && (
                      <Button 
                        onClick={() => document.getElementById('file-upload')?.click()}
                        size="sm" 
                        variant="outline"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <i className="fas fa-plus mr-2"></i>
                        자료 추가
                      </Button>
                    )}
                  </div>
                  
                  {/* 파일 업로드 인풋 (숨김) */}
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.zip"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => {
                        console.log('업로드된 파일:', file.name);
                        toast({
                          title: "파일이 업로드되었습니다.",
                          description: file.name,
                          variant: "default",
                        });
                      });
                    }}
                  />
                  
                  {/* 실제 학습 자료 표시 */}
                  {(() => {
                    // 실제 업로드된 학습 자료가 있으면 그것을 사용
                    const learningMaterials = course?.learningMaterials || [];
                    
                    // 기본 샘플 자료 (업로드된 자료가 없을 때)
                    const defaultMaterials = [
                      {
                        id: "material-1",
                        name: "교육과정 개정 자료집",
                        type: "application/pdf",
                        size: 2 * 1024 * 1024, // 2MB
                        url: "#"
                      },
                      {
                        id: "material-2", 
                        name: "수업 설계 템플릿",
                        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        size: 856 * 1024, // 856KB
                        url: "#"
                      },
                      {
                        id: "material-3",
                        name: "평가 도구 양식", 
                        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        size: 245 * 1024, // 245KB
                        url: "#"
                      },
                      {
                        id: "material-4",
                        name: "강의 발표 자료",
                        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation", 
                        size: 5.2 * 1024 * 1024, // 5.2MB
                        url: "#"
                      }
                    ];

                    const materialsToShow = learningMaterials.length > 0 ? learningMaterials : defaultMaterials;

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {materialsToShow.map((material: any) => (
                          <div key={material.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors">
                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mr-4">
                              <i className={getFileIcon(material.type)}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                                {material.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(material.size)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {canEdit && showCourseEditModal ? (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // 편집 로직
                                    }}
                                  >
                                    <i className="fas fa-edit"></i>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // 삭제 로직
                                    }}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </Button>
                                </>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-gray-500 group-hover:text-blue-600 transition-colors"
                                  onClick={() => handleFileDownload(material)}
                                >
                                  <i className="fas fa-download"></i>
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  
                  {/* 파일 업로드 드래그 앤 드롭 영역 */}
                  {canEdit && showCourseEditModal && (
                    <div className="mt-6 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <div className="flex flex-col items-center">
                        <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                        <h4 className="text-lg font-medium text-gray-700 mb-2">파일을 드래그하여 업로드</h4>
                        <p className="text-gray-500 mb-4">또는 클릭하여 파일을 선택하세요</p>
                        <Button 
                          onClick={() => document.getElementById('file-upload')?.click()}
                          variant="outline"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          파일 선택 (최대 4개)
                        </Button>
                        <p className="text-xs text-gray-400 mt-2">지원 형식: PDF, DOC, DOCX, PPT, PPTX, XLSX, ZIP (최대 10MB)</p>
                      </div>
                    </div>
                  )}

                  {/* 학습 자료가 없을 때 표시 */}
                  {(!course?.learningMaterials || course.learningMaterials.length === 0) && canEdit && showCourseEditModal && (
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <i className="fas fa-info-circle text-yellow-600 mt-1 mr-3"></i>
                        <div>
                          <h4 className="font-medium text-yellow-800 mb-1">학습 자료를 추가해보세요</h4>
                          <p className="text-sm text-yellow-700">
                            수강생들이 활용할 수 있는 학습 자료를 업로드하면 강의의 완성도가 높아집니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 커리큘럼 */}
            {activeTab === "curriculum" && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">커리큘럼</h3>
                  <div className="flex items-center space-x-2">
                    {canEdit && showCourseEditModal && (
                      <Button 
                        onClick={addCurriculumItem}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <i className="fas fa-plus mr-1"></i>
                        차시 추가
                      </Button>
                    )}
                    {canEdit && showCourseEditModal && (
                      <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {userRoleType === 'admin' ? '관리자 편집 모드' : '기관 편집 모드'}
                      </div>
                    )}
                  </div>
                </div>

                {showCourseEditModal ? (
                  <div className="space-y-6">
                    {/* 기본 커리큘럼 텍스트 편집 그룹 */}
                    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <i className="fas fa-edit text-blue-600"></i>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800">기본 커리큘럼</h4>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <Label className="text-sm font-medium mb-2 block">커리큘럼 내용 (텍스트)</Label>
                        <Textarea
                          value={course?.curriculum || ""}
                          onChange={(e) => handleCourseUpdate('curriculum', e.target.value)}
                          className="min-h-[100px]"
                          placeholder="차시별 교육 내용을 한 줄씩 입력하세요"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          각 차시별 내용을 한 줄씩 입력하세요. 예: 1차시 - 교육과정 개정 개요
                        </p>
                      </div>
                    </div>

                    {/* 상세 커리큘럼 편집 그룹 */}
                    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <i className="fas fa-list-ol text-green-600"></i>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">상세 커리큘럼</h4>
                        </div>
                        <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                          총 {curriculumItems.length}개 차시
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="space-y-4">
                          {curriculumItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              <i className="fas fa-plus-circle text-3xl mb-3"></i>
                              <p>차시를 추가하여 상세 커리큘럼을 구성하세요</p>
                            </div>
                          ) : (
                            curriculumItems.map((item, index) => (
                              <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                      {index + 1}
                                    </div>
                                    <Input
                                      value={item.title}
                                      onChange={(e) => updateCurriculumItem(item.id, { title: e.target.value })}
                                      className="font-medium"
                                      placeholder="차시 제목"
                                    />
                                    <Input
                                      value={item.duration}
                                      onChange={(e) => updateCurriculumItem(item.id, { duration: e.target.value })}
                                      className="w-24"
                                      placeholder="시간"
                                    />
                                  </div>
                                  <Button
                                    onClick={() => deleteCurriculumItem(item.id)}
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </Button>
                                </div>

                                <Textarea
                                  value={item.description}
                                  onChange={(e) => updateCurriculumItem(item.id, { description: e.target.value })}
                                  className="mb-3"
                                  placeholder="차시 설명"
                                  rows={2}
                                />

                                {/* 동영상 관리 그룹 */}
                                <div className="mb-4 bg-white rounded-lg p-3 border border-red-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm font-medium flex items-center">
                                      <i className="fas fa-video mr-2 text-red-600"></i>
                                      동영상 ({item.videos.length}개)
                                    </Label>
                                    <Button
                                      onClick={() => addVideoToCurriculum(item.id)}
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                                    >
                                      <i className="fas fa-plus mr-1"></i>
                                      동영상 추가
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    {item.videos.map((video: any, videoIndex: number) => (
                                      <div key={video.id} className="flex items-center space-x-2 bg-red-50 p-2 rounded border border-red-100">
                                        <i className="fas fa-play-circle text-red-600"></i>
                                        <Input
                                          value={video.title}
                                          onChange={(e) => {
                                            const updatedVideos = [...item.videos];
                                            updatedVideos[videoIndex] = { ...video, title: e.target.value };
                                            updateCurriculumItem(item.id, { videos: updatedVideos });
                                          }}
                                          className="flex-1"
                                          placeholder="동영상 제목"
                                        />
                                        <Input
                                          value={video.duration}
                                          onChange={(e) => {
                                            const updatedVideos = [...item.videos];
                                            updatedVideos[videoIndex] = { ...video, duration: e.target.value };
                                            updateCurriculumItem(item.id, { videos: updatedVideos });
                                          }}
                                          className="w-20"
                                          placeholder="시간"
                                        />
                                        <Select
                                          value={video.type}
                                          onValueChange={(value) => {
                                            const updatedVideos = [...item.videos];
                                            updatedVideos[videoIndex] = { ...video, type: value };
                                            updateCurriculumItem(item.id, { videos: updatedVideos });
                                          }}
                                        >
                                          <SelectTrigger className="w-24">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="upload">업로드</SelectItem>
                                            <SelectItem value="youtube">YouTube</SelectItem>
                                            <SelectItem value="vimeo">Vimeo</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Button
                                          onClick={() => {
                                            const updatedVideos = item.videos.filter((_: any, i: number) => i !== videoIndex);
                                            updateCurriculumItem(item.id, { videos: updatedVideos });
                                          }}
                                          size="sm"
                                          variant="outline"
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <i className="fas fa-trash"></i>
                                        </Button>
                                      </div>
                                    ))}
                                    {item.videos.length === 0 && (
                                      <div className="text-center py-4 text-gray-500 text-sm">
                                        동영상을 추가해보세요
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* 퀴즈 관리 그룹 */}
                                <div className="bg-white rounded-lg p-3 border border-green-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm font-medium flex items-center">
                                      <i className="fas fa-question-circle mr-2 text-green-600"></i>
                                      퀴즈 ({item.quizzes.length}개)
                                    </Label>
                                    <Button
                                      onClick={() => addQuizToCurriculum(item.id)}
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600 hover:text-green-700 border-green-300 hover:bg-green-50"
                                    >
                                      <i className="fas fa-plus mr-1"></i>
                                      퀴즈 추가
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    {item.quizzes.map((quiz: any, quizIndex: number) => (
                                      <div key={quiz.id} className="flex items-center space-x-2 bg-green-50 p-2 rounded border border-green-100">
                                        <i className="fas fa-clipboard-question text-green-600"></i>
                                        <Input
                                          value={quiz.title}
                                          onChange={(e) => {
                                            const updatedQuizzes = [...item.quizzes];
                                            updatedQuizzes[quizIndex] = { ...quiz, title: e.target.value };
                                            updateCurriculumItem(item.id, { quizzes: updatedQuizzes });
                                          }}
                                          className="flex-1"
                                          placeholder="퀴즈 제목"
                                        />
                                        <Badge variant="outline" className="text-xs">
                                          {quiz.questions.length}문제
                                        </Badge>
                                        <Button
                                          onClick={() => {
                                            setEditingQuiz(quiz);
                                            setShowQuizEditModal(true);
                                          }}
                                          size="sm"
                                          variant="outline"
                                          className="text-blue-600 hover:text-blue-700"
                                        >
                                          <i className="fas fa-edit"></i>
                                        </Button>
                                        <Button
                                          onClick={() => {
                                            const updatedQuizzes = item.quizzes.filter((_: any, i: number) => i !== quizIndex);
                                            updateCurriculumItem(item.id, { quizzes: updatedQuizzes });
                                          }}
                                          size="sm"
                                          variant="outline"
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <i className="fas fa-trash"></i>
                                        </Button>
                                      </div>
                                    ))}
                                    {item.quizzes.length === 0 && (
                                      <div className="text-center py-4 text-gray-500 text-sm">
                                        퀴즈를 추가해보세요
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-6 bg-white">
                    {parsedCurriculum.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                            <i className="fas fa-graduation-cap text-indigo-600"></i>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-800">학습 과정</h4>
                          <div className="ml-auto text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            총 {parsedCurriculum.length}개 차시
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {parsedCurriculum.map((week: any, weekIndex: number) => (
                            <div key={weekIndex} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                              {/* 차시 헤더 */}
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                      {week.week}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-gray-800 text-base">{week.title}</h4>
                                      <div className="flex items-center space-x-3 mt-1">
                                        <Badge variant="outline" className="text-xs px-2 py-0.5 bg-white">
                                          <i className="fas fa-clock mr-1"></i>
                                          {week.duration}
                                        </Badge>
                                        <span className="text-xs text-gray-600">
                                          <i className="fas fa-list mr-1"></i>
                                          {(week.videos?.length || 0) + (week.quizzes?.length || 0)}개 항목
                                        </span>
                                        {weekIndex === 0 && (
                                          <Badge className="bg-green-500 text-white text-xs">무료 학습</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* 진행률 표시 */}
                                  <div className="flex items-center space-x-3">
                                    {(() => {
                                      const totalItems = (week.videos?.length || 0) + (week.quizzes?.length || 0);
                                      const completedItems = 
                                        (week.videos?.filter((v: any) => completedVideos.has(`${weekIndex}-${v.id}`)).length || 0) +
                                        (week.quizzes?.filter((q: any) => completedQuizzes.has(`${weekIndex}-${q.id}`)).length || 0);
                                      const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
                                      
                                      return (
                                        <>
                                          <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div 
                                              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                                              style={{ width: `${progress}%` }}
                                            ></div>
                                          </div>
                                          <span className="text-sm text-gray-600 min-w-[35px] font-medium">
                                            {Math.round(progress)}%
                                          </span>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                              
                              {/* 학습 콘텐츠 */}
                              <div className="p-4">
                                {/* 1차시는 무료, 2차시 이상은 결제 필요 */}
                                {(weekIndex === 0 || isEnrolled) ? (
                                  <>
                                    {/* 비디오 목록 */}
                                    {week.videos && week.videos.length > 0 && (
                                      <div className="mb-4">
                                        <h5 className="text-sm font-medium text-gray-700 mb-2">강의 영상</h5>
                                        <div className="space-y-2">
                                          {week.videos.map((video: any, videoIndex: number) => {
                                            const videoKey = `${weekIndex}-${video.id}`;
                                            const isCompleted = completedVideos.has(videoKey);
                                            const progress = videoProgress[videoKey] || 0;
                                            
                                            return (
                                              <div 
                                                key={video.id}
                                                onClick={async () => {
                                                  const videoWithIndex = {...video, weekIndex};
                                                  setSelectedVideo(videoWithIndex);
                                                  
                                                  // 저장된 진도율 불러오기
                                                  const videoKey = `${weekIndex}-${video.id}`;
                                                  if (enrollment?.id) {
                                                    try {
                                                      const response = await fetch(`/api/user/enrollments/${enrollment.id}/progress`);
                                                      if (response.ok) {
                                                        const data = await response.json();
                                                        // 개별 항목 진도율 설정
                                                        if (data.itemProgress && data.itemProgress[videoKey]) {
                                                          setVideoProgress(prev => ({
                                                            ...prev,
                                                            [videoKey]: data.itemProgress[videoKey]
                                                          }));
                                                          console.log(`저장된 진도율 복원: ${videoKey} = ${data.itemProgress[videoKey]}%`);
                                                        }
                                                      }
                                                    } catch (error) {
                                                      console.error('진도율 조회 실패:', error);
                                                    }
                                                  }
                                                  
                                                  setShowVideoModal(true);
                                                }}
                                                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                                              >
                                                <div className="flex items-center">
                                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                                    isCompleted ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                                  }`}>
                                                    {isCompleted ? (
                                                      <i className="fas fa-check"></i>
                                                    ) : (
                                                      <i className="fas fa-play"></i>
                                                    )}
                                                  </div>
                                                  <div>
                                                    <h6 className="text-sm font-medium text-gray-800">{video.title}</h6>
                                                    <div className="flex items-center space-x-3 mt-1">
                                                      <span className="text-xs text-gray-600">
                                                        <i className="fas fa-clock mr-1"></i>
                                                        {video.duration}
                                                      </span>
                                                      {progress > 0 && progress < 100 && !isCompleted && (
                                                        <span className="text-xs text-blue-600">
                                                          {Math.round(progress)}% 시청 중
                                                        </span>
                                                      )}
                                                      {isCompleted && (
                                                        <span className="text-xs text-green-600">
                                                          <i className="fas fa-check-circle mr-1"></i>
                                                          완료됨
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                                <i className="fas fa-chevron-right text-gray-400"></i>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* 퀴즈 목록 */}
                                    {week.quizzes && week.quizzes.length > 0 && (
                                      <div>
                                        <h5 className="text-sm font-medium text-gray-700 mb-2">학습 평가</h5>
                                        <div className="space-y-2">
                                          {week.quizzes.map((quiz: any) => {
                                            const quizKey = `${weekIndex}-${quiz.id}`;
                                            const isCompleted = completedQuizzes.has(quizKey);
                                            
                                            return (
                                              <div 
                                                key={quiz.id}
                                                onClick={() => {
                                                  setSelectedQuiz({...quiz, weekIndex});
                                                  setShowQuizModal(true);
                                                }}
                                                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-md cursor-pointer transition-colors"
                                              >
                                                <div className="flex items-center">
                                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                                    isCompleted ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                                                  }`}>
                                                    {isCompleted ? (
                                                      <i className="fas fa-check"></i>
                                                    ) : (
                                                      <i className="fas fa-question"></i>
                                                    )}
                                                  </div>
                                                  <div>
                                                    <h6 className="text-sm font-medium text-gray-800">{quiz.title}</h6>
                                                    <div className="flex items-center space-x-3 mt-1">
                                                      <span className="text-xs text-gray-600">
                                                        <i className="fas fa-list mr-1"></i>
                                                        {quiz.questions?.length || 0}문항
                                                      </span>
                                                      {isCompleted && (
                                                        <span className="text-xs text-green-600">
                                                          <i className="fas fa-check-circle mr-1"></i>
                                                          완료됨
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                                <i className="fas fa-chevron-right text-gray-400"></i>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  // 결제 필요한 콘텐츠 (2차시 이상)
                                  <div className="py-8 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                      <i className="fas fa-lock text-gray-400 text-xl"></i>
                                    </div>
                                    <h5 className="text-lg font-medium text-gray-800 mb-2">수강 신청 후 학습할 수 있습니다</h5>
                                    <p className="text-gray-600 mb-4">이 차시의 콘텐츠는 수강 신청 후 이용 가능합니다.</p>
                                    <Button 
                                      onClick={() => {
                                        if (!user) {
                                          toast({
                                            title: "로그인이 필요합니다.",
                                            description: "수강신청을 위해 로그인해주세요.",
                                            variant: "destructive",
                                          });
                                          return;
                                        }
                                        setIsPaymentModalOpen(true);
                                      }}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                      <i className="fas fa-shopping-cart mr-2"></i>
                                      수강 신청하기
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="fas fa-book-open text-3xl text-gray-300"></i>
                        </div>
                        <h4 className="text-lg font-medium text-gray-800 mb-2">커리큘럼 정보가 없습니다</h4>
                        <p className="text-gray-500">이 강의의 커리큘럼을 준비 중입니다.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 강사 소개 */}
            {activeTab === "instructor" && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  강사 소개
                </h2>
                
                {(course?.instructorName || course?.instructorProfile || course?.instructorExpertise) ? (
                  /* 강사 카드 */
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-start space-x-4">
                      {/* 강사 사진 */}
                      <div className="flex-shrink-0">
                        <img
                          src={course?.instructorImageUrl || `https://i.pravatar.cc/200?img=${Math.floor(Math.random() * 70) + 1}&rnd=${Math.random()}`}
                          alt={course?.instructorName || "강사"}
                          className="w-20 h-24 object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "https://via.placeholder.com/200x240?text=강사";
                          }}
                        />
                      </div>
                      
                      {/* 강사 정보 */}
                      <div className="flex-1">
                        <div className="mb-3">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">
                            {course?.instructorName || "강사명"}
                          </h3>
                          <p className="text-sm text-blue-600 mb-2">
                            강사
                          </p>
                        </div>
                        
                        {/* 전문분야 태그 */}
                        {course?.instructorExpertise && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-2">
                              {course.instructorExpertise.split(',').map((skill: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {skill.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* 강사 소개 */}
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {course?.instructorProfile || "강사 소개 정보가 없습니다."}
                        </p>
                        
                        {/* SNS 링크 */}
                        <div className="flex space-x-2 mt-3">
                          <button className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <i className="fab fa-linkedin text-xs text-gray-600"></i>
                          </button>
                          <button className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <i className="fas fa-envelope text-xs text-gray-600"></i>
                          </button>
                          <button className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <i className="fas fa-globe text-xs text-gray-600"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-user-tie text-2xl text-gray-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">강사 정보가 없습니다</h3>
                    <p className="text-gray-500">이 강의의 강사 정보를 준비 중입니다.</p>
                  </div>
                )}
              </div>
            )}

            {/* 수강 후기 */}
            {activeTab === "reviews" && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  수강 후기
                </h2>
                <div className="mb-8">
                  <Button
                    onClick={() => {
                      if (!user) {
                        toast({
                          title: "로그인이 필요합니다.",
                          description: "후기 작성을 위해 로그인해주세요.",
                          variant: "destructive",
                        });
                        return;
                      }
                      setShowReviewModal(true);
                    }}
                    className="mb-6 bg-indigo-600 hover:bg-indigo-700 text-white !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    후기 작성하기
                  </Button>
                  <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 rounded-lg p-6">
                    <div className="text-center md:text-left mb-4 md:mb-0">
                      <div className="text-4xl font-bold text-gray-800">
                        4.8
                      </div>
                      <div className="flex text-yellow-400 my-2 justify-center md:justify-start">
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star-half-alt"></i>
                      </div>
                      <div className="text-gray-600 text-sm">
                        {reviews?.length || 0}개 후기
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review: Review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            <Avatar className="w-12 h-12 rounded-full overflow-hidden mr-4">
                              <img
                                src={`https://i.pravatar.cc/150?img=${review.id % 70 + 1}&rnd=${Math.random()}`}
                                alt={review.userName || "수강생"}
                                className="w-full h-full object-cover"
                              />
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-gray-800">
                                {review.userName || "익명"}
                              </h4>
                              <p className="text-sm text-gray-600">
                                수강생
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex text-yellow-400 justify-end mb-1">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`fas fa-star ${i < review.rating ? "" : "text-gray-300"}`}
                                ></i>
                              ))}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">아직 작성된 후기가 없습니다</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 자주 묻는 질문 */}
            {activeTab === "faq" && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  자주 묻는 질문
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {/* FAQ 기본 항목들 */}
                  <AccordionItem value="faq-1" className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left">
                      <div className="flex items-center w-full">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
                          <i className="fas fa-question"></i>
                        </div>
                        <h3 className="font-medium text-gray-800 flex-grow">
                          이 연수는 교육부 인정 학점이 부여되나요?
                        </h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 py-4 bg-gray-50">
                        <div className="flex">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                            <i className="fas fa-comment-dots"></i>
                          </div>
                          <p className="text-gray-700">
                            네, 본 연수는 교육부 인정 연수로 3학점이 부여됩니다. 연수 이수 후 교육청 및 소속 기관에 학점 인정 신청이 가능합니다.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="mt-8 bg-indigo-50 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 flex-shrink-0">
                      <i className="fas fa-headset text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        더 궁금한 점이 있으신가요?
                      </h3>
                      <p className="text-gray-700 mb-4">
                        연수 관련 문의사항은 고객센터로 연락해 주세요. 평일 09:00-18:00 운영합니다.
                      </p>
                      <div className="flex space-x-4">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white !rounded-button whitespace-nowrap cursor-pointer">
                          <i className="fas fa-comments mr-2"></i>
                          1:1 문의하기
                        </Button>
                        <Button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer">
                          <i className="fas fa-phone-alt mr-2"></i>
                          02-1234-5678
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <div className={`${isSticky ? "sticky top-4" : ""} transition-all duration-300`}>
              {/* 수강 신청 카드 */}
              <Card className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    수강 신청
                  </h3>
                  {course?.discountPrice && course?.discountPrice < course?.price ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-gray-600">정가</div>
                        <div className="text-gray-600 line-through">
                          {formatPrice(course.price)}원
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="font-medium">할인가</div>
                        <div className="flex items-center">
                          <span className="text-xl font-bold text-indigo-600">
                            {formatPrice(course.discountPrice)}원
                          </span>
                          <Badge className="ml-2 bg-red-500 hover:bg-red-600">
                            {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% 할인
                          </Badge>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between mb-6">
                      <div className="font-medium">가격</div>
                      <div className="text-xl font-bold text-indigo-600">
                        {formatPrice(course?.price || 120000)}원
                      </div>
                    </div>
                  )}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <i className="fas fa-calendar-alt text-indigo-600 w-5 mr-2"></i>
                      <div className="text-sm">
                        <span className="text-gray-600">연수기간: </span>
                        <span className="font-medium">
                          {course?.startDate && course?.endDate 
                            ? `${new Date(course.startDate).toLocaleDateString('ko-KR')} - ${new Date(course.endDate).toLocaleDateString('ko-KR')}`
                            : "2025.07.01 - 2025.08.30"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-graduation-cap text-indigo-600 w-5 mr-2"></i>
                      <div className="text-sm">
                        <span className="text-gray-600">학점: </span>
                        <span className="font-medium">
                          {course?.credit || 3}학점
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-clock text-indigo-600 w-5 mr-2"></i>
                      <div className="text-sm">
                        <span className="text-gray-600">학습시간: </span>
                        <span className="font-medium">
                          {course?.totalHours || 45}시간
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-users text-indigo-600 w-5 mr-2"></i>
                      <div className="text-sm">
                        <span className="text-gray-600">수강인원: </span>
                        <span className="font-medium">
                          {course?.enrolledCount || 256}명
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      if (!user) {
                        toast({
                          title: "로그인이 필요합니다.",
                          description: "수강신청을 위해 로그인해주세요.",
                          variant: "destructive",
                        });
                        return;
                      }
                      setIsPaymentModalOpen(true);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 mb-3 !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    <i className="fas fa-shopping-cart mr-2"></i>
                    수강신청하기
                  </Button>
                  <Button 
                    onClick={handleAddToCart}
                    disabled={cartMutation.isPending || isInCart}
                    className={`w-full py-3 !rounded-button whitespace-nowrap cursor-pointer ${
                      isInCart 
                        ? "bg-gray-100 border border-gray-300 text-gray-500" 
                        : "bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                    }`}
                  >
                    <i className={`${isInCart ? 'fas fa-check' : 'fas fa-shopping-bag'} mr-2`}></i>
                    {cartMutation.isPending ? "처리중..." : (isInCart ? "장바구니에 있음" : "장바구니 담기")}
                  </Button>
                </div>
              </Card>

              {/* 학점 인정 안내 */}
              <Card className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    학점 인정 안내
                  </h3>
                  <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <i className="fas fa-certificate text-indigo-600 mr-2"></i>
                      <span className="font-medium">교육부 인정 연수</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      본 연수는 교육부 장관이 인정하는 연수로, 이수 시 3학점이 인정됩니다.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                      <div className="text-sm text-gray-700">
                        교원 자격 갱신 연수로 인정
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                      <div className="text-sm text-gray-700">
                        승진 가산점 부여 대상 연수
                      </div>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mt-1 mr-2"></i>
                      <div className="text-sm text-gray-700">
                        모든 시도교육청 학점 인정
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 연수 일정 */}
              <Card className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    연수 일정
                  </h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-indigo-600 pl-4">
                      <div className="text-sm text-gray-500">신청 기간</div>
                      <div className="font-medium">2025.06.01 - 2025.06.30</div>
                    </div>
                    <div className="border-l-4 border-green-600 pl-4">
                      <div className="text-sm text-gray-500">연수 기간</div>
                      <div className="font-medium">2025.07.01 - 2025.08.30</div>
                    </div>
                    <div className="border-l-4 border-yellow-600 pl-4">
                      <div className="text-sm text-gray-500">과제 제출 기한</div>
                      <div className="font-medium">2025.08.25까지</div>
                    </div>
                    <div className="border-l-4 border-red-600 pl-4">
                      <div className="text-sm text-gray-500">수료증 발급</div>
                      <div className="font-medium">2025.09.10부터</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 학습 진행률 */}
              <Card className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    학습 진행률
                  </h3>
                  
                  {(() => {
                    // 전체 아이템 수 계산
                    const totalVideos = parsedCurriculum.reduce((acc: number, week: any) => 
                      acc + (week.videos?.length || 0), 0);
                    const totalQuizzes = parsedCurriculum.reduce((acc: number, week: any) => 
                      acc + (week.quizzes?.length || 0), 0);
                    const totalItems = totalVideos + totalQuizzes;
                    
                    // 완료된 아이템 수 계산
                    const completedVideoCount = completedVideos.size;
                    const completedQuizCount = completedQuizzes.size;
                    const completedItems = completedVideoCount + completedQuizCount;
                    
                    const overallProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
                    
                    return (
                      <div className="space-y-4">
                        {/* 전체 진행률 */}
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-indigo-600 mb-2">
                            {Math.round(overallProgress)}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div 
                              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${overallProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600">
                            전체 진행률 ({completedItems}/{totalItems})
                          </p>
                        </div>
                        
                        {/* 세부 진행률 */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full border-4 border-red-200 flex items-center justify-center mx-auto mb-2 relative">
                              <div 
                                className="absolute inset-0 rounded-full border-4 border-red-600"
                                style={{
                                  clipPath: `polygon(50% 0%, ${50 + (totalVideos > 0 ? (completedVideoCount / totalVideos) * 50 : 0)}% 0%, ${50 + (totalVideos > 0 ? (completedVideoCount / totalVideos) * 50 : 0)}% 100%, 50% 100%)`
                                }}
                              ></div>
                              <i className="fas fa-video text-red-600 relative z-10"></i>
                            </div>
                            <div className="text-sm font-medium">동영상</div>
                            <div className="text-xs text-gray-500">
                              {completedVideoCount}/{totalVideos}
                            </div>
                            {/* 현재 시청 중인 동영상 정보 */}
                            {(() => {
                              const watchingVideos = Object.entries(videoProgress).filter(([key, progress]) => 
                                progress > 0 && progress < 100 && !completedVideos.has(key)
                              );
                              if (watchingVideos.length > 0) {
                                const [videoKey, progress] = watchingVideos[0];
                                return (
                                  <div className="text-xs text-blue-600 mt-1">
                                    시청 중: {Math.round(progress)}%
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full border-4 border-green-200 flex items-center justify-center mx-auto mb-2 relative">
                              <div 
                                className="absolute inset-0 rounded-full border-4 border-green-600"
                                style={{
                                  clipPath: `polygon(50% 0%, ${50 + (totalQuizzes > 0 ? (completedQuizCount / totalQuizzes) * 50 : 0)}% 0%, ${50 + (totalQuizzes > 0 ? (completedQuizCount / totalQuizzes) * 50 : 0)}% 100%, 50% 100%)`
                                }}
                              ></div>
                              <i className="fas fa-question-circle text-green-600 relative z-10"></i>
                            </div>
                            <div className="text-sm font-medium">퀴즈</div>
                            <div className="text-xs text-gray-500">
                              {completedQuizCount}/{totalQuizzes}
                            </div>
                          </div>
                        </div>
                        
                        {/* 학습 통계 */}
                        <div className="border-t pt-4 mt-4">
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold text-gray-800">
                                {parsedCurriculum.length}
                              </div>
                              <div className="text-xs text-gray-500">총 차시</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-green-600">
                                {(() => {
                                  const completedWeeks = parsedCurriculum.filter((week: any, weekIndex: number) => {
                                    const weekTotalItems = (week.videos?.length || 0) + (week.quizzes?.length || 0);
                                    if (weekTotalItems === 0) return false;
                                    
                                    const weekCompletedItems = 
                                      (week.videos?.filter((v: any) => completedVideos.has(`${weekIndex}-${v.id}`)).length || 0) +
                                      (week.quizzes?.filter((q: any) => completedQuizzes.has(`${weekIndex}-${q.id}`)).length || 0);
                                    
                                    return weekCompletedItems === weekTotalItems;
                                  }).length;
                                  
                                  return completedWeeks;
                                })()}
                              </div>
                              <div className="text-xs text-gray-500">완료 차시</div>
                            </div>
                          </div>
                        </div>
                        
                        {overallProgress === 100 && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                            <i className="fas fa-trophy text-yellow-500 text-xl mb-2"></i>
                            <div className="text-sm font-medium text-green-800">
                              🎉 모든 학습을 완료했습니다!
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              수료증 발급이 가능합니다.
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </Card>

              {/* 관련 연수 추천 */}
              <Card className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    관련 연수 추천
                  </h3>
                  {relatedCourses && relatedCourses.length > 0 ? (
                    <div className="space-y-4">
                      {relatedCourses.slice(0, 3).map((relatedCourse: Course) => (
                        <div key={relatedCourse.id} className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                             onClick={() => window.location.href = `/courses/${relatedCourse.id}`}>
                          <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 mr-3">
                            <img
                              src={getImageUrl(relatedCourse.imageUrl, "/uploads/images/5.jpg")}
                              alt={relatedCourse.title}
                              className="w-full h-full object-cover object-top"
                              onError={(e) => {
                                const fallbackImages = ["/uploads/images/1.jpg", "/uploads/images/4.jpg", "/uploads/images/5.jpg", "/uploads/images/6.jpg", "/uploads/images/12.jpg"];
                                const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
                                e.currentTarget.src = randomFallback;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2">
                              {relatedCourse.title}
                            </h4>
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                              <i className="fas fa-graduation-cap mr-1"></i>
                              <span>{relatedCourse.credit}학점</span>
                              <span className="mx-1">|</span>
                              <span>{formatPrice(relatedCourse.discountPrice || relatedCourse.price)}원</span>
                              {relatedCourse.discountPrice && (
                                <>
                                  <span className="mx-1">|</span>
                                  <span className="text-red-600 font-medium">
                                    {Math.round(((relatedCourse.price - relatedCourse.discountPrice) / relatedCourse.price) * 100)}% 할인
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex text-yellow-400 text-xs">
                                {[...Array(5)].map((_, i) => (
                                  <i key={i} className={`fas fa-star ${i < 4 ? '' : 'text-gray-300'}`}></i>
                                ))}
                                <span className="text-gray-600 ml-1">4.5</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                <i className="fas fa-user-graduate mr-1"></i>
                                {relatedCourse.enrolledCount || 0}명
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* 더 많은 강의 보기 버튼 */}
                      <div className="pt-4 border-t">
                        <Button
                          onClick={() => window.location.href = `/courses?category=${encodeURIComponent(course?.category || '')}`}
                          variant="outline"
                          className="w-full text-sm"
                        >
                          <i className="fas fa-plus mr-2"></i>
                          {course?.category} 카테고리 더 보기
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-graduation-cap text-2xl text-gray-400"></i>
                      </div>
                      <h4 className="text-lg font-medium text-gray-800 mb-2">관련 연수가 없습니다</h4>
                      <p className="text-gray-500 text-sm mb-4">
                        현재 같은 카테고리의 다른 연수가 없습니다.
                      </p>
                      <Button
                        onClick={() => window.location.href = '/courses'}
                        variant="outline"
                        className="text-sm"
                      >
                        <i className="fas fa-search mr-2"></i>
                        전체 연수 둘러보기
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <Footer />



      {/* 하단 고정 수강신청 버튼 (모바일용) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 z-40">
        <div className="flex items-center justify-between mb-2">
          <div>
            {course?.discountPrice && course?.discountPrice < course?.price ? (
              <>
                <div className="text-gray-500 line-through text-sm">
                  {formatPrice(course.price)}원
                </div>
                <div className="text-xl font-bold text-indigo-600">
                  {formatPrice(course.discountPrice)}원
                </div>
              </>
            ) : (
              <div className="text-xl font-bold text-indigo-600">
                {formatPrice(course?.price || 120000)}원
              </div>
            )}
          </div>
          {course?.discountPrice && course?.discountPrice < course?.price && (
            <Badge className="bg-red-500 hover:bg-red-600">
              {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% 할인
            </Badge>
          )}
        </div>
        <Button 
          onClick={() => {
            if (!user) {
              toast({
                title: "로그인이 필요합니다.",
                description: "수강신청을 위해 로그인해주세요.",
                variant: "destructive",
              });
              return;
            }
            setIsPaymentModalOpen(true);
          }}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 !rounded-button whitespace-nowrap cursor-pointer"
        >
          <i className="fas fa-shopping-cart mr-2"></i>
          수강신청하기
        </Button>
      </div>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>결제 정보</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">강좌명</span>
                <span className="font-medium text-right max-w-[200px] truncate">
                  {course?.title || "강의명"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {course?.discountPrice && course?.discountPrice < course?.price ? "할인가" : "가격"}
                </span>
                <span className="font-bold text-indigo-600">
                  {formatPrice(course?.discountPrice && course?.discountPrice < course?.price 
                    ? course.discountPrice 
                    : course?.price || 120000)}원
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">결제 방법 선택</h4>
              <div className="space-y-2">
                {["신용카드", "무통장입금", "카카오페이"].map((method) => (
                  <div
                    key={method}
                    onClick={() => setSelectedPaymentMethod(method)}
                    className={`p-3 border rounded-lg cursor-pointer flex items-center ${
                      selectedPaymentMethod === method
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedPaymentMethod === method
                          ? "border-indigo-600"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedPaymentMethod === method && (
                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </div>
                    {method}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="agreement"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="agreement" className="text-sm text-gray-600 cursor-pointer">
                이용약관 및 결제 진행에 동의합니다
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handlePayment}>
              {formatPrice(course?.discountPrice && course?.discountPrice < course?.price 
                ? course.discountPrice 
                : course?.price || 120000)}원 결제하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz Edit Modal */}
      <Dialog open={showQuizEditModal} onOpenChange={setShowQuizEditModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>퀴즈 편집</DialogTitle>
          </DialogHeader>
          {editingQuiz && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">퀴즈 제목</Label>
                <Input
                  value={editingQuiz.title}
                  onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                  placeholder="퀴즈 제목을 입력하세요"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">문제 목록</Label>
                  <Button
                    onClick={() => {
                      const newQuestion = {
                        id: Date.now().toString(),
                        question: "새 문제",
                        type: 'multiple' as const,
                        options: ["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
                        correctAnswer: "선택지 1",
                        explanation: ""
                      };
                      setEditingQuiz({
                        ...editingQuiz,
                        questions: [...editingQuiz.questions, newQuestion]
                      });
                    }}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <i className="fas fa-plus mr-1"></i>
                    문제 추가
                  </Button>
                </div>

                <div className="space-y-4">
                  {editingQuiz.questions.map((question: any, questionIndex: number) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">문제 {questionIndex + 1}</h4>
                        <Button
                          onClick={() => {
                            const updatedQuestions = editingQuiz.questions.filter((_: any, i: number) => i !== questionIndex);
                            setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                          }}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium mb-1 block">문제</Label>
                          <Textarea
                            value={question.question}
                            onChange={(e) => {
                              const updatedQuestions = [...editingQuiz.questions];
                              updatedQuestions[questionIndex] = { ...question, question: e.target.value };
                              setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                            }}
                            placeholder="문제를 입력하세요"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium mb-1 block">문제 유형</Label>
                          <Select
                            value={question.type}
                            onValueChange={(value) => {
                              const updatedQuestions = [...editingQuiz.questions];
                              updatedQuestions[questionIndex] = { ...question, type: value };
                              setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                            }}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple">객관식</SelectItem>
                              <SelectItem value="true-false">참/거짓</SelectItem>
                              <SelectItem value="short-answer">단답형</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {question.type === 'multiple' && (
                          <div>
                            <Label className="text-sm font-medium mb-2 block">선택지</Label>
                            <div className="space-y-2">
                              {question.options.map((option: string, optionIndex: number) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                                    {optionIndex + 1}
                                  </span>
                                  <Input
                                    value={option}
                                    onChange={(e) => {
                                      const updatedQuestions = [...editingQuiz.questions];
                                      const updatedOptions = [...question.options];
                                      updatedOptions[optionIndex] = e.target.value;
                                      updatedQuestions[questionIndex] = { ...question, options: updatedOptions };
                                      setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                                    }}
                                    placeholder={`선택지 ${optionIndex + 1}`}
                                    className="flex-1"
                                  />
                                  <input
                                    type="radio"
                                    name={`correct-${questionIndex}`}
                                    checked={question.correctAnswer === option}
                                    onChange={() => {
                                      const updatedQuestions = [...editingQuiz.questions];
                                      updatedQuestions[questionIndex] = { ...question, correctAnswer: option };
                                      setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                                    }}
                                    className="text-green-600"
                                  />
                                  <Label className="text-xs text-gray-500">정답</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {question.type === 'true-false' && (
                          <div>
                            <Label className="text-sm font-medium mb-2 block">정답</Label>
                            <div className="flex space-x-4">
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name={`tf-${questionIndex}`}
                                  checked={question.correctAnswer === 'true'}
                                  onChange={() => {
                                    const updatedQuestions = [...editingQuiz.questions];
                                    updatedQuestions[questionIndex] = { ...question, correctAnswer: 'true' };
                                    setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                                  }}
                                  className="mr-2"
                                />
                                참
                              </label>
                              <label className="flex items-center">
                                <input
                                  type="radio"
                                  name={`tf-${questionIndex}`}
                                  checked={question.correctAnswer === 'false'}
                                  onChange={() => {
                                    const updatedQuestions = [...editingQuiz.questions];
                                    updatedQuestions[questionIndex] = { ...question, correctAnswer: 'false' };
                                    setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                                  }}
                                  className="mr-2"
                                />
                                거짓
                              </label>
                            </div>
                          </div>
                        )}

                        {question.type === 'short-answer' && (
                          <div>
                            <Label className="text-sm font-medium mb-1 block">정답</Label>
                            <Input
                              value={question.correctAnswer}
                              onChange={(e) => {
                                const updatedQuestions = [...editingQuiz.questions];
                                updatedQuestions[questionIndex] = { ...question, correctAnswer: e.target.value };
                                setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                              }}
                              placeholder="정답을 입력하세요"
                            />
                          </div>
                        )}

                        <div>
                          <Label className="text-sm font-medium mb-1 block">해설 (선택사항)</Label>
                          <Textarea
                            value={question.explanation || ""}
                            onChange={(e) => {
                              const updatedQuestions = [...editingQuiz.questions];
                              updatedQuestions[questionIndex] = { ...question, explanation: e.target.value };
                              setEditingQuiz({ ...editingQuiz, questions: updatedQuestions });
                            }}
                            placeholder="문제 해설을 입력하세요"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuizEditModal(false)}>
              취소
            </Button>
            <Button 
              onClick={() => {
                // 퀴즈 업데이트 로직 (실제 구현 시 API 호출)
                setShowQuizEditModal(false);
                setEditingQuiz(null);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <i className="fas fa-save mr-2"></i>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>강의 공유하기</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <img
                src={getImageUrl(course?.imageUrl, "/uploads/images/1.jpg")}
                alt={course?.title || "강의 이미지"}
                className="w-16 h-16 object-cover rounded"
                onError={(e) => {
                  const fallbackImages = ["/uploads/images/1.jpg", "/uploads/images/4.jpg", "/uploads/images/5.jpg"];
                  const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
                  e.currentTarget.src = randomFallback;
                }}
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 text-sm">
                  {course?.title || "강의명"}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {formatPrice(course?.discountPrice || course?.price || 120000)}원
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">링크 복사</h4>
              <div className="flex space-x-2">
                <Input
                  value={window.location.href}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button 
                  onClick={handleCopyUrl}
                  variant="outline"
                  className="px-3"
                >
                  <i className="fas fa-copy"></i>
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">소셜 미디어로 공유</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleSocialShare("kakao")}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 py-3"
                >
                  <div className="w-5 h-5 bg-yellow-400 rounded"></div>
                  <span>카카오톡</span>
                </Button>
                <Button
                  onClick={() => handleSocialShare("facebook")}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 py-3"
                >
                  <div className="w-5 h-5 bg-blue-600 rounded"></div>
                  <span>페이스북</span>
                </Button>
                <Button
                  onClick={() => handleSocialShare("twitter")}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 py-3"
                >
                  <div className="w-5 h-5 bg-blue-400 rounded"></div>
                  <span>트위터</span>
                </Button>
                <Button
                  onClick={() => handleSocialShare("line")}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 py-3"
                >
                  <div className="w-5 h-5 bg-green-500 rounded"></div>
                  <span>라인</span>
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareModal(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <i className="fas fa-video text-red-600 mr-2"></i>
              {selectedVideo?.title || "동영상"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="space-y-4">
              {/* 동영상 플레이어 */}
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {selectedVideo.type === 'youtube' ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.url.includes('youtube.com') || selectedVideo.url.includes('youtu.be') ? 
                      selectedVideo.url.split('/').pop()?.split('?')[0] || selectedVideo.url.split('=')[1]?.split('&')[0] : 
                      selectedVideo.url}?autoplay=1&rel=0&enablejsapi=1`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => {
                      // 동영상 시청 시작 기록 및 실시간 진행률 타이머 설정
                      const videoKey = `${selectedVideo.weekIndex}-${selectedVideo.id}`;
                      setVideoProgress(prev => ({ ...prev, [videoKey]: 0 }));
                      
                      const durationMinutes = parseInt(selectedVideo.duration.replace(/[^0-9]/g, '')) || 10;
                      const durationMs = durationMinutes * 60 * 1000; // 분을 밀리초로 변환
                      const intervalMs = 5000; // 5초마다 업데이트 (서버 부하 줄이기)
                      const totalIntervals = durationMs / intervalMs;
                      let currentInterval = 0;
                      
                      // 5초마다 진행률 업데이트 및 서버 저장
                      const progressTimer = setInterval(async () => {
                        currentInterval++;
                        const progress = Math.min((currentInterval / totalIntervals) * 100, 100);
                        
                        setVideoProgress(prev => ({ ...prev, [videoKey]: progress }));
                        
                        // 10% 단위로 서버에 저장 (너무 자주 요청하지 않도록)
                        if (progress % 10 < 5 || progress >= 95) {
                          try {
                            await handleVideoProgress(videoKey, Math.round(progress));
                          } catch (error) {
                            console.error('진도율 저장 실패:', error);
                          }
                        }
                        
                        // 90% 이상 시청시 완료 처리
                        if (progress >= 90) {
                          setCompletedVideos(prev => new Set(prev).add(videoKey));
                          clearInterval(progressTimer);
                          toast({
                            title: "동영상 시청 완료!",
                            description: `${selectedVideo.title} 학습이 완료되었습니다.`,
                            variant: "default",
                          });
                        }
                      }, intervalMs);
                      
                      setVideoTimer(progressTimer);
                    }}
                  ></iframe>
                ) : selectedVideo.type === 'vimeo' ? (
                  <iframe
                    src={`https://player.vimeo.com/video/${selectedVideo.url.includes('vimeo.com') ? 
                      selectedVideo.url.split('/').pop() : selectedVideo.url}?autoplay=1`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    onLoad={() => {
                      // 동영상 시청 시작 기록 및 실시간 진행률 타이머 설정
                      const videoKey = `${selectedVideo.weekIndex}-${selectedVideo.id}`;
                      setVideoProgress(prev => ({ ...prev, [videoKey]: 0 }));
                      
                      const durationMinutes = parseInt(selectedVideo.duration.replace(/[^0-9]/g, '')) || 10;
                      const durationMs = durationMinutes * 60 * 1000;
                      const intervalMs = 5000; // 5초마다 업데이트
                      const totalIntervals = durationMs / intervalMs;
                      let currentInterval = 0;
                      
                      // 5초마다 진행률 업데이트 및 서버 저장
                      const progressTimer = setInterval(async () => {
                        currentInterval++;
                        const progress = Math.min((currentInterval / totalIntervals) * 100, 100);
                        
                        setVideoProgress(prev => ({ ...prev, [videoKey]: progress }));
                        
                        // 10% 단위로 서버에 저장
                        if (progress % 10 < 5 || progress >= 95) {
                          try {
                            await handleVideoProgress(videoKey, Math.round(progress));
                          } catch (error) {
                            console.error('진도율 저장 실패:', error);
                          }
                        }
                        
                        // 90% 이상 시청시 완료 처리
                        if (progress >= 90) {
                          setCompletedVideos(prev => new Set(prev).add(videoKey));
                          clearInterval(progressTimer);
                          toast({
                            title: "동영상 시청 완료!",
                            description: `${selectedVideo.title} 학습이 완료되었습니다.`,
                            variant: "default",
                          });
                        }
                      }, intervalMs);
                      
                      setVideoTimer(progressTimer);
                    }}
                  ></iframe>
                ) : (
                  <video
                    controls
                    autoPlay
                    className="w-full h-full"
                    onLoadedMetadata={(e) => {
                      const video = e.target as HTMLVideoElement;
                      setVideoDuration(video.duration);
                    }}
                    onTimeUpdate={async (e) => {
                      const video = e.target as HTMLVideoElement;
                      const actualProgress = (video.currentTime / video.duration) * 100;
                      const videoKey = `${selectedVideo.weekIndex}-${selectedVideo.id}`;
                      setCurrentVideoTime(video.currentTime);
                      
                      // 실시간 진도율 업데이트
                      setVideoProgress(prev => ({ ...prev, [videoKey]: actualProgress }));
                      
                      // 10초마다 또는 10% 단위로 서버에 저장
                      const currentTime = Math.floor(video.currentTime);
                      if (currentTime % 10 === 0 || actualProgress >= 90) {
                        try {
                          await handleVideoProgress(videoKey, Math.round(actualProgress));
                        } catch (error) {
                          console.error('진도율 저장 실패:', error);
                        }
                      }
                      
                      // 90% 이상 시청시 완료 처리
                      if (actualProgress >= 90) {
                        setCompletedVideos(prev => new Set(prev).add(videoKey));
                        toast({
                          title: "동영상 시청 완료!",
                          description: `${selectedVideo.title} 학습이 완료되었습니다.`,
                          variant: "default",
                        });
                      }
                    }}
                  >
                    <source src={selectedVideo.url} type="video/mp4" />
                    동영상을 재생할 수 없습니다.
                  </video>
                )}
                
                {/* 시청 시간 카운터 모달 */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-clock text-sm"></i>
                    <span className="text-sm font-medium">
                      {(() => {
                        const videoKey = `${selectedVideo.weekIndex}-${selectedVideo.id}`;
                        const progress = videoProgress[videoKey] || 0;
                        const isCompleted = completedVideos.has(videoKey);
                        
                        if (isCompleted) return "완료";
                        
                        const durationMinutes = parseInt(selectedVideo.duration.replace(/[^0-9]/g, '')) || 10;
                        const elapsedMinutes = Math.floor((durationMinutes * progress) / 100);
                        const remainingMinutes = Math.max(0, durationMinutes - elapsedMinutes);
                        const remainingSeconds = Math.floor(((durationMinutes * 60) * (100 - progress)) / 100) % 60;
                        
                        return remainingMinutes > 0 ? 
                          `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')} 남음` : 
                          `${remainingSeconds}초 남음`;
                      })()}
                    </span>
                  </div>
                  
                  {/* 진행률 바 추가 */}
                  <div className="mt-2 w-32 bg-gray-600 rounded-full h-1">
                    <div 
                      className="bg-white h-1 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${(() => {
                          const videoKey = `${selectedVideo.weekIndex}-${selectedVideo.id}`;
                          return Math.min(videoProgress[videoKey] || 0, 100);
                        })()}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* 동영상 정보 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-play text-red-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedVideo.title}</h4>
                    <p className="text-sm text-gray-600">재생 시간: {selectedVideo.duration}</p>
                  </div>
                </div>
                
                {/* 진행 상황 표시 */}
                <div className="flex items-center space-x-2">
                  {(() => {
                    const videoKey = `${selectedVideo.weekIndex}-${selectedVideo.id}`;
                    const progress = videoProgress[videoKey] || 0;
                    const isCompleted = completedVideos.has(videoKey);
                    
                    return (
                      <>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-600' : 'bg-blue-600'}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(progress)}%
                        </span>
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-700">
                            완료
                          </Badge>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {/* 시청완료 표시 버튼 제거 - 시간에 따라 자동으로 완료 처리됨 */}
            <Button variant="outline" onClick={async () => {
              // 동영상 모달 닫기 전 현재 진도율 저장
              if (selectedVideo && videoProgress) {
                const videoKey = `${selectedVideo.weekIndex}-${selectedVideo.id}`;
                const currentProgress = videoProgress[videoKey] || 0;
                
                if (currentProgress > 0) {
                  try {
                    await handleVideoProgress(videoKey, Math.round(currentProgress));
                    console.log(`진도율 저장: ${videoKey} = ${Math.round(currentProgress)}%`);
                  } catch (error) {
                    console.error('진도율 저장 실패:', error);
                  }
                }
              }
              
              // 타이머 정리
              if (videoTimer) {
                clearInterval(videoTimer);
                setVideoTimer(null);
              }
              setShowVideoModal(false);
            }}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz Modal */}
      <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <i className="fas fa-question-circle text-green-600 mr-2"></i>
              {selectedQuiz?.title || "퀴즈"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedQuiz && (
            <div className="space-y-6">
              {/* 퀴즈 정보 */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-clipboard-question text-green-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedQuiz.title}</h4>
                    <p className="text-sm text-gray-600">총 {selectedQuiz.questions?.length || 0}문제</p>
                  </div>
                </div>
                
                {(() => {
                  const quizKey = `${selectedQuiz.weekIndex}-${selectedQuiz.id}`;
                  const isCompleted = completedQuizzes.has(quizKey);
                  
                  return isCompleted && (
                    <Badge className="bg-green-100 text-green-700">
                      완료
                    </Badge>
                  );
                })()}
              </div>

              {/* 퀴즈 문제들 */}
              {selectedQuiz.questions && selectedQuiz.questions.length > 0 && (
                <div className="space-y-6">
                  {selectedQuiz.questions.map((question: any, questionIndex: number) => (
                    <div key={questionIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3 mb-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-1">
                          {questionIndex + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-3">{question.question}</h4>
                          
                          {/* 객관식 */}
                          {question.type === 'multiple' && question.options && (
                            <div className="space-y-2">
                              {question.options.map((option: string, optionIndex: number) => (
                                <label key={optionIndex} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`question-${questionIndex}`}
                                    value={option}
                                    onChange={(e) => {
                                      setQuizAnswers(prev => ({
                                        ...prev,
                                        [`question-${questionIndex}`]: e.target.value
                                      }));
                                    }}
                                    className="text-green-600 focus:ring-green-500"
                                  />
                                  <span className="flex-1">{option}</span>
                                </label>
                              ))}
                            </div>
                          )}

                          {/* 참/거짓 */}
                          {question.type === 'true-false' && (
                            <div className="space-y-2">
                              <label className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`question-${questionIndex}`}
                                  value="true"
                                  onChange={(e) => {
                                    setQuizAnswers(prev => ({
                                      ...prev,
                                      [`question-${questionIndex}`]: e.target.value
                                    }));
                                  }}
                                  className="text-green-600 focus:ring-green-500"
                                />
                                <span>참</span>
                              </label>
                              <label className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`question-${questionIndex}`}
                                  value="false"
                                  onChange={(e) => {
                                    setQuizAnswers(prev => ({
                                      ...prev,
                                      [`question-${questionIndex}`]: e.target.value
                                    }));
                                  }}
                                  className="text-green-600 focus:ring-green-500"
                                />
                                <span>거짓</span>
                              </label>
                            </div>
                          )}

                          {/* 단답형 */}
                          {question.type === 'short-answer' && (
                            <Input
                              placeholder="답을 입력하세요"
                              onChange={(e) => {
                                setQuizAnswers(prev => ({
                                  ...prev,
                                  [`question-${questionIndex}`]: e.target.value
                                }));
                              }}
                              className="mt-2"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={async () => {
                try {
                  if (!selectedQuiz?.questions) return;
                  
                  // 답변 배열 생성
                  const answers = selectedQuiz.questions.map((_: any, index: number) => ({
                    answer: quizAnswers[`question-${index}`] || ""
                  }));
                  
                  // 퀴즈 제출 처리
                  await handleQuizSubmit(answers);
                } catch (error) {
                  console.error("퀴즈 제출 중 오류:", error);
                }
              }}
              className="w-full"
              disabled={!Object.keys(quizAnswers).length}
            >
              제출하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <i className="fas fa-star text-yellow-500 mr-2"></i>
              후기 작성
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* 강의 정보 */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <img
                src={getImageUrl(course?.imageUrl, "/uploads/images/1.jpg")}
                alt={course?.title || "강의 이미지"}
                className="w-16 h-16 object-cover rounded"
                onError={(e) => {
                  const fallbackImages = ["/uploads/images/1.jpg", "/uploads/images/4.jpg", "/uploads/images/5.jpg"];
                  const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
                  e.currentTarget.src = randomFallback;
                }}
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 text-sm">
                  {course?.title || "강의명"}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {course?.instructorName || "강사명"}
                </p>
              </div>
            </div>

            {/* 별점 선택 */}
            <div>
              <h4 className="font-medium mb-3">별점을 선택해주세요</h4>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewReviewRating(star)}
                    className={`text-3xl transition-colors ${
                      star <= newReviewRating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400`}
                  >
                    <i className="fas fa-star"></i>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                {newReviewRating}점 선택됨
              </p>
            </div>

            {/* 후기 내용 */}
            <div>
              <h4 className="font-medium mb-3">후기를 작성해주세요</h4>
              <Textarea
                value={newReviewContent}
                onChange={(e) => setNewReviewContent(e.target.value)}
                placeholder="강의에 대한 솔직한 후기를 작성해주세요. 다른 수강생들에게 도움이 됩니다."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {newReviewContent.length}/500자
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowReviewModal(false);
              setNewReviewContent("");
              setNewReviewRating(5);
            }}>
              취소
            </Button>
            <Button 
              onClick={handleReviewSubmit}
              disabled={!newReviewContent.trim() || reviewMutation.isPending}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {reviewMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  등록 중...
                </>
              ) : (
                <>
                  <i className="fas fa-star mr-2"></i>
                  후기 등록
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetailPage; 