import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  User,
  Play,
  HelpCircle,
  Upload,
  FileText,
  X,
  Loader2,
  ImageIcon,
  Download,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CourseManagementProps {
  user: any;
}

export default function CourseManagement({ user }: CourseManagementProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [previewCourse, setPreviewCourse] = useState<any>(null);

  // 강의 편집 폼 상태
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
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
    learningMaterials: [] as {
      id: string;
      name: string;
      size: number;
      type: string;
      url: string;
      filename?: string;
    }[],
    imageUrl: "",
  });

  // 이미지 관련 상태
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [sampleImages, setSampleImages] = useState<any[]>([]);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // 커리큘럼 차시 관리를 위한 별도 상태
  const [curriculumItems, setCurriculumItems] = useState<
    Array<{
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
        type: "upload" | "youtube" | "vimeo";
      }>;
      quizzes: Array<{
        id: string;
        title: string;
        questions: Array<{
          id: string;
          question: string;
          type: "multiple" | "true-false" | "short-answer";
          options?: string[];
          correctAnswer: string;
          explanation?: string;
        }>;
      }>;
    }>
  >([]);

  // 모달 상태 관리
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState<string>("");

  const [videoForm, setVideoForm] = useState({
    title: "",
    url: "",
    duration: "",
    type: "youtube" as "upload" | "youtube" | "vimeo",
  });

  const [quizForm, setQuizForm] = useState({
    title: "",
    questions: [
      {
        id: Date.now().toString(),
        question: "",
        type: "multiple" as "multiple" | "true-false" | "short-answer",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
      },
    ],
  });

  // 내 강의 목록 조회
  const { data: myCourses, isLoading: coursesLoading } = useQuery<{
    courses: any[];
    total: number;
  }>({
    queryKey: [`/api/business/courses/${user?.id}`, user?.id],
    enabled: !!user?.id,
  });

  // 강의 생성/수정 mutation
  const courseMutation = useMutation({
    mutationFn: async (data: any) => {
      const courseData = {
        ...data,
        providerId: user?.id,
        price: parseInt(data.price) || 0,
        discountPrice: data.discountPrice ? parseInt(data.discountPrice) : null,
        credit: parseInt(data.credit) || 1,
        maxStudents: data.maxStudents ? parseInt(data.maxStudents) : null,
        learningMaterials: data.learningMaterials || [],
      };

      if (editingCourse) {
        return apiRequest(
          "PUT",
          `/api/business/courses/${editingCourse.id}`,
          courseData,
        );
      } else {
        return apiRequest("POST", "/api/business/courses", courseData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/business/courses/${user?.id}`, user?.id],
      });
      toast({
        title: editingCourse ? "강의 수정 완료" : "강의 등록 완료",
        description: editingCourse
          ? "강의가 수정되었습니다."
          : "강의가 등록되었습니다. 관리자 승인 후 공개됩니다.",
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
      queryClient.invalidateQueries({
        queryKey: [`/api/business/courses/${user?.id}`, user?.id],
      });
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

  // 카테고리 구조 정의
  const categoryStructure: Record<string, string[]> = {
    법정의무교육: [
      "화학물질 안전교육",
      "산업안전보건교육",
      "소방안전교육",
      "환경안전교육",
      "개인정보보호교육",
      "성희롱예방교육",
    ],
    전문성강화교육: [
      "교육학",
      "심리학",
      "교수법",
      "교육정책",
      "교육평가",
      "상담학",
      "특수교육",
      "교육행정",
      "교육공학",
      "유아교육",
      "국어교육",
      "영어교육",
      "수학교육",
      "과학교육",
      "사회교육",
      "예체능교육",
      "진로교육",
      "생활지도",
      "학교경영",
      "융합교육",
      "IT교육",
      "리더십",
      "커뮤니케이션",
    ],
    자격증: [
      "국가기술자격",
      "국가전문자격",
      "민간자격",
      "국제자격",
      "교원자격",
      "전문사자격",
    ],
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: "",
      description: "",
      category: "",
      subcategory: "",
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
      learningMaterials: [],
      imageUrl: "",
    });
    setCurriculumItems([]);
    setEditingCourse(null);
  };

  // 커리큘럼 아이템 관리 함수들
  const addCurriculumItem = () => {
    const newItem = {
      id: Date.now().toString(),
      title: "",
      duration: "",
      description: "",
      isCompleted: false,
      videos: [],
      quizzes: [],
    };
    setCurriculumItems((prev) => [...prev, newItem]);
  };

  const updateCurriculumItem = (
    id: string,
    field: string,
    value: string | boolean,
  ) => {
    setCurriculumItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const deleteCurriculumItem = (id: string) => {
    setCurriculumItems((prev) => prev.filter((item) => item.id !== id));
  };

  const moveCurriculumItem = (fromIndex: number, toIndex: number) => {
    setCurriculumItems((prev) => {
      const newItems = [...prev];
      const [removed] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, removed);
      return newItems;
    });
  };

  // 영상 관리 함수들
  const openVideoModal = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setVideoForm({
      title: "",
      url: "",
      duration: "",
      type: "youtube",
    });
    setShowVideoModal(true);
  };

  const addVideo = () => {
    if (!currentLessonId || !videoForm.title || !videoForm.url) return;

    const newVideo = {
      id: Date.now().toString(),
      ...videoForm,
    };

    setCurriculumItems((prev) =>
      prev.map((item) =>
        item.id === currentLessonId
          ? { ...item, videos: [...item.videos, newVideo] }
          : item,
      ),
    );

    setShowVideoModal(false);
    setVideoForm({
      title: "",
      url: "",
      duration: "",
      type: "youtube",
    });
  };

  const deleteVideo = (lessonId: string, videoId: string) => {
    setCurriculumItems((prev) =>
      prev.map((item) =>
        item.id === lessonId
          ? {
              ...item,
              videos: item.videos.filter((video) => video.id !== videoId),
            }
          : item,
      ),
    );
  };

  // 퀴즈 관리 함수들
  const openQuizModal = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setQuizForm({
      title: "",
      questions: [
        {
          id: Date.now().toString(),
          question: "",
          type: "multiple",
          options: ["", "", "", ""],
          correctAnswer: "",
          explanation: "",
        },
      ],
    });
    setShowQuizModal(true);
  };

  const addQuizQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      question: "",
      type: "multiple" as "multiple" | "true-false" | "short-answer",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
    };
    setQuizForm((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuizQuestion = (
    questionId: string,
    field: string,
    value: any,
  ) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, [field]: value } : q,
      ),
    }));
  };

  const deleteQuizQuestion = (questionId: string) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
  };

  const addQuiz = () => {
    if (!currentLessonId || !quizForm.title || quizForm.questions.length === 0)
      return;

    const newQuiz = {
      id: Date.now().toString(),
      title: quizForm.title,
      questions: quizForm.questions.filter((q) => q.question.trim()),
    };

    setCurriculumItems((prev) =>
      prev.map((item) =>
        item.id === currentLessonId
          ? { ...item, quizzes: [...item.quizzes, newQuiz] }
          : item,
      ),
    );

    setShowQuizModal(false);
  };

  const deleteQuiz = (lessonId: string, quizId: string) => {
    setCurriculumItems((prev) =>
      prev.map((item) =>
        item.id === lessonId
          ? {
              ...item,
              quizzes: item.quizzes.filter((quiz) => quiz.id !== quizId),
            }
          : item,
      ),
    );
  };

  const handleEditCourse = (course: any) => {
    console.log("=== 프론트엔드: 강의 편집 데이터 로드 ===");
    console.log(
      "course.curriculumItems:",
      JSON.stringify(course.curriculumItems, null, 2),
    );
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description || "",
      category: course.category,
      subcategory: course.subcategory || "",
      type: course.type,
      level: course.level,
      credit: course.credit?.toString() || "1",
      price: course.price?.toString() || "",
      discountPrice: course.discountPrice?.toString() || "",
      duration: course.duration || "",
      maxStudents: course.maxStudents?.toString() || "",
      startDate: course.startDate
        ? new Date(course.startDate).toISOString().split("T")[0]
        : "",
      endDate: course.endDate
        ? new Date(course.endDate).toISOString().split("T")[0]
        : "",
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
      tags: Array.isArray(course.tags)
        ? course.tags.join(", ")
        : course.tags || "",
      features: course.features || "",
      recommendations: course.recommendations || "",
      totalHours: course.totalHours?.toString() || "",
      enrollmentDeadline: course.enrollmentDeadline
        ? new Date(course.enrollmentDeadline).toISOString().split("T")[0]
        : "",
      completionDeadline: course.completionDeadline
        ? new Date(course.completionDeadline).toISOString().split("T")[0]
        : "",
      prerequisites: course.prerequisites || "",
      learningMethod: course.learningMethod || "",
      learningMaterials: course.learningMaterials || [],
      imageUrl: course.imageUrl || "",
    });

    setSelectedImage(course.imageUrl || "");

    if (course.curriculumItems && Array.isArray(course.curriculumItems)) {
      setCurriculumItems(course.curriculumItems);
    } else if (course.curriculum) {
      const lines = course.curriculum
        .split("\n")
        .filter((line: string) => line.trim());
      const items = lines.map((line: string, index: number) => ({
        id: `${Date.now()}-${index}`,
        title: line.trim(),
        duration: "",
        description: "",
        isCompleted: false,
        videos: [],
        quizzes: [],
      }));
      setCurriculumItems(items);
    } else {
      setCurriculumItems([]);
    }

    setShowCourseDialog(true);
  };

  const handleDelete = (course: any) => {
    setDeleteTarget(course);
    setShowDeleteDialog(true);
  };

  const handlePreviewCourse = (course: any) => {
    setPreviewCourse(course);
    setShowPreviewDialog(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  const getStatusBadge = (course: any) => {
    if (course.approvalStatus === "pending") {
      return (
        <Badge variant="outline" className="text-yellow-600">
          <Clock className="h-3 w-3 mr-1" />
          승인 대기
        </Badge>
      );
    }
    if (course.approvalStatus === "rejected") {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          승인 거부
        </Badge>
      );
    }
    if (course.status === "active") {
      return (
        <Badge variant="default">
          <CheckCircle className="h-3 w-3 mr-1" />
          운영 중
        </Badge>
      );
    }
    return <Badge variant="secondary">비활성</Badge>;
  };

  // 학습 자료 업로드 함수
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);

    if (courseForm.learningMaterials.length + files.length > 4) {
      toast({
        title: "파일 개수 초과",
        description: "최대 4개까지 업로드할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "파일 크기 초과",
            description: `${file.name}은(는) 10MB를 초과합니다.`,
            variant: "destructive",
          });
          return;
        }
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/business/upload-learning-materials", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("파일 업로드에 실패했습니다.");
      }

      const result = await response.json();

      const newMaterials = result.files.map((fileInfo: any) => ({
        id: fileInfo.id,
        name: fileInfo.name,
        size: fileInfo.size,
        type: fileInfo.type,
        filename: fileInfo.filename,
        url: fileInfo.url,
      }));

      setCourseForm((prev) => ({
        ...prev,
        learningMaterials: [...prev.learningMaterials, ...newMaterials],
      }));

      toast({
        title: "파일 업로드 완료",
        description: `${newMaterials.length}개 파일이 업로드되었습니다.`,
        variant: "default",
      });
    } catch (error) {
      console.error("파일 업로드 오류:", error);
      toast({
        title: "업로드 실패",
        description:
          error instanceof Error
            ? error.message
            : "파일 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }

    event.target.value = "";
  };

  // 학습 자료 삭제 함수
  const removeLearningMaterial = (materialId: string) => {
    setCourseForm((prev) => ({
      ...prev,
      learningMaterials: prev.learningMaterials.filter(
        (material) => material.id !== materialId,
      ),
    }));
  };

  // 파일 크기 포맷팅 함수
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // 이미지 업로드 함수
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "이미지는 5MB 이하만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/business/upload-course-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("이미지 업로드에 실패했습니다.");
      }

      const result = await response.json();

      setCourseForm((prev) => ({
        ...prev,
        imageUrl: result.image.url,
      }));

      setSelectedImage(result.image.url);

      toast({
        title: "이미지 업로드 완료",
        description: "강의 이미지가 업로드되었습니다.",
        variant: "default",
      });
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      toast({
        title: "업로드 실패",
        description:
          error instanceof Error
            ? error.message
            : "이미지 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }

    event.target.value = "";
  };

  // 샘플 이미지 로드 함수
  const loadSampleImages = async () => {
    try {
      const response = await fetch("/api/business/sample-images");
      if (response.ok) {
        const result = await response.json();
        setSampleImages(result.images);
      }
    } catch (error) {
      console.error("샘플 이미지 로드 오류:", error);
    }
  };

  // 샘플 이미지 선택 함수
  const selectSampleImage = (imageUrl: string) => {
    setCourseForm((prev) => ({
      ...prev,
      imageUrl: imageUrl,
    }));
    setSelectedImage(imageUrl);
    setShowImageSelector(false);

    toast({
      title: "이미지 선택 완료",
      description: "샘플 이미지가 선택되었습니다.",
      variant: "default",
    });
  };

  // 이미지 제거 함수
  const removeImage = () => {
    setCourseForm((prev) => ({
      ...prev,
      imageUrl: "",
    }));
    setSelectedImage("");
  };

  // 컴포넌트 마운트 시 샘플 이미지 로드
  useEffect(() => {
    loadSampleImages();
  }, []);

  return (
    <div className="space-y-6">
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
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => {
              resetCourseForm();
              setShowCourseDialog(true);
            }}
            disabled={!user?.isApproved}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />새 강의 등록
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      {!user?.isApproved && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-800">
              기관 승인이 완료되면 강의를 등록할 수 있습니다. 승인까지 1-2일
              소요됩니다.
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
            ) : myCourses?.courses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-3">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        등록된 강의가 없습니다
                      </h3>
                      <p className="text-gray-500 mt-1">
                        첫 번째 강의를 등록해보세요. 승인 후 수강생들이 신청할
                        수 있습니다.
                      </p>
                    </div>
                    {user?.isApproved && (
                      <Button
                        onClick={() => {
                          resetCourseForm();
                          setShowCourseDialog(true);
                        }}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        강의 등록하기
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              myCourses?.courses
                ?.filter((course) =>
                  course.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
                )
                .map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">
                      {course.title}
                    </TableCell>
                    <TableCell>{course.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {course.discountPrice ? (
                        <div className="flex flex-col">
                          <span className="line-through text-gray-500">
                            {course.price?.toLocaleString()}원
                          </span>
                          <span className="text-red-600 font-medium">
                            {course.discountPrice?.toLocaleString()}원
                          </span>
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
                          <DropdownMenuItem
                            onClick={() => handlePreviewCourse(course)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            보기
                          </DropdownMenuItem>
                          {course.status !== "deleted" && (
                            <DropdownMenuItem
                              onClick={() => handleEditCourse(course)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                          )}
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

      {/* 강의 등록/수정 다이얼로그 */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "강의 수정" : "새 강의 등록"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse
                ? "강의 정보를 수정하세요."
                : "새로운 강의를 등록하세요. 관리자 승인 후 공개됩니다."}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm font-medium">
              📝 상세 편집 폼: 아래 4개 탭에서 강의의 모든 정보를 편집할 수
              있습니다
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
                    onChange={(e) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="강의명을 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">분야 *</Label>
                  <Select
                    value={courseForm.category}
                    onValueChange={(value) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        category: value,
                        subcategory: "", // 대분류 변경 시 소분류 초기화
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="대분류를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="법정의무교육">법정의무교육</SelectItem>
                      <SelectItem value="전문성강화교육">
                        전문성강화교육
                      </SelectItem>
                      <SelectItem value="자격증">자격증</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory">소분류 *</Label>
                  <Select
                    value={courseForm.subcategory}
                    onValueChange={(value) =>
                      setCourseForm((prev) => ({ ...prev, subcategory: value }))
                    }
                    disabled={!courseForm.category}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          courseForm.category
                            ? "소분류를 선택하세요"
                            : "먼저 대분류를 선택하세요"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {courseForm.category &&
                      categoryStructure[courseForm.category]
                        ? categoryStructure[courseForm.category].map(
                            (subcategory: string) => (
                              <SelectItem key={subcategory} value={subcategory}>
                                {subcategory}
                              </SelectItem>
                            ),
                          )
                        : null}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">수업 형태 *</Label>
                  <Select
                    value={courseForm.type}
                    onValueChange={(value) =>
                      setCourseForm((prev) => ({ ...prev, type: value }))
                    }
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
                  <Label htmlFor="level">난이도 *</Label>
                  <Select
                    value={courseForm.level}
                    onValueChange={(value) =>
                      setCourseForm((prev) => ({ ...prev, level: value }))
                    }
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
                  <Label htmlFor="price">정가 *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={courseForm.price}
                    onChange={(e) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    placeholder="정가를 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPrice">할인가격</Label>
                  <Input
                    id="discountPrice"
                    type="number"
                    value={courseForm.discountPrice}
                    onChange={(e) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        discountPrice: e.target.value,
                      }))
                    }
                    placeholder="할인가격 (선택사항)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">교육기간 *</Label>
                  <Input
                    id="duration"
                    value={courseForm.duration}
                    onChange={(e) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    placeholder="예: 4주, 16시간, 3일"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credit">학점</Label>
                  <Input
                    id="credit"
                    type="number"
                    value={courseForm.credit}
                    onChange={(e) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        credit: e.target.value,
                      }))
                    }
                    placeholder="학점"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStudents">최대 수강생 수</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={courseForm.maxStudents}
                    onChange={(e) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        maxStudents: e.target.value,
                      }))
                    }
                    placeholder="최대 수강생 수"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">언어</Label>
                  <Select
                    value={courseForm.language}
                    onValueChange={(value) =>
                      setCourseForm((prev) => ({ ...prev, language: value }))
                    }
                  >
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
                  onChange={(e) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="과정에 대한 상세한 소개를 입력하세요"
                  rows={4}
                />
              </div>

              {/* 강의 이미지 업로드 섹션 */}
              <div className="col-span-2 space-y-4">
                <Label>강의 이미지</Label>

                {/* 현재 선택된 이미지 미리보기 */}
                {courseForm.imageUrl && (
                  <div className="relative">
                    <img
                      src={courseForm.imageUrl}
                      alt="강의 이미지 미리보기"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src =
                          "https://via.placeholder.com/600x300?text=이미지+로드+실패";
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* 이미지 업로드 버튼들 */}
                <div className="flex space-x-4">
                  {/* 파일 업로드 */}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="courseImageUpload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        document.getElementById("courseImageUpload")?.click()
                      }
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          업로드 중...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          이미지 업로드
                        </>
                      )}
                    </Button>
                  </div>

                  {/* 샘플 이미지 선택 */}
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowImageSelector(true)}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      샘플 이미지 선택
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  권장 크기: 800x450px, 최대 5MB (JPG, PNG, GIF, WebP)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">학습 자료 업로드</Label>
                <div className="space-y-4">
                  {/* 파일 업로드 영역 */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="h-10 w-10 text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">클릭하여 파일 선택</span>{" "}
                        또는 파일을 드래그하세요
                      </div>
                      <div className="text-xs text-gray-500">
                        PDF, DOC, DOCX, PPT, PPTX, XLSX, ZIP 등 지원 (최대 4개,
                        각 10MB 이하)
                      </div>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.zip,.rar"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="learningMaterialsUpload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document
                            .getElementById("learningMaterialsUpload")
                            ?.click()
                        }
                        disabled={courseForm.learningMaterials.length >= 4}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        파일 선택 ({courseForm.learningMaterials.length}/4)
                      </Button>
                    </div>
                  </div>

                  {/* 업로드된 파일 목록 */}
                  {courseForm.learningMaterials.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        업로드된 파일
                      </Label>
                      <div className="space-y-2">
                        {courseForm.learningMaterials.map((material) => (
                          <div
                            key={material.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                <FileText className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {material.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(material.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeLearningMaterial(material.id)
                              }
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* 과정 내용 탭 - 멀티미디어 콘텐츠 포함 */}
            <TabsContent value="content" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="objectives">학습 목표</Label>
                <Textarea
                  id="objectives"
                  value={courseForm.objectives}
                  onChange={(e) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      objectives: e.target.value,
                    }))
                  }
                  placeholder="이 과정을 통해 달성할 수 있는 학습 목표를 작성하세요 (줄바꿈으로 구분)"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="curriculum">커리큘럼</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      차시별 교육 내용을 추가하세요
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCurriculumItem}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>차시 추가</span>
                    </Button>
                  </div>

                  {curriculumItems.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        커리큘럼 차시를 추가해주세요
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={addCurriculumItem}
                        className="mt-2"
                      >
                        첫 번째 차시 추가
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {curriculumItems.map((item, index) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                  <Input
                                    placeholder="차시 제목을 입력하세요"
                                    value={item.title}
                                    onChange={(e) =>
                                      updateCurriculumItem(
                                        item.id,
                                        "title",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <Input
                                    placeholder="소요시간 (예: 60분)"
                                    value={item.duration}
                                    onChange={(e) =>
                                      updateCurriculumItem(
                                        item.id,
                                        "duration",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              </div>
                              <Textarea
                                placeholder="차시 설명을 입력하세요"
                                value={item.description}
                                onChange={(e) =>
                                  updateCurriculumItem(
                                    item.id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                rows={2}
                              />

                              {/* 영상 및 퀴즈 관리 */}
                              <div className="space-y-3">
                                {/* 영상 섹션 */}
                                <div className="border rounded-lg p-3 bg-gray-50">
                                  <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                      영상 자료
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openVideoModal(item.id)}
                                      className="h-7 px-2 text-xs"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      영상 추가
                                    </Button>
                                  </div>
                                  {item.videos.length === 0 ? (
                                    <p className="text-xs text-gray-500">
                                      등록된 영상이 없습니다
                                    </p>
                                  ) : (
                                    <div className="space-y-2">
                                      {item.videos.map((video) => (
                                        <div
                                          key={video.id}
                                          className="flex items-center justify-between bg-white p-2 rounded border"
                                        >
                                          <div className="flex-1">
                                            <p className="text-sm font-medium">
                                              {video.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              {video.type} • {video.duration}
                                            </p>
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              deleteVideo(item.id, video.id)
                                            }
                                            className="h-6 w-6 p-0 text-red-600"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* 퀴즈 섹션 */}
                                <div className="border rounded-lg p-3 bg-gray-50">
                                  <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm font-medium text-gray-700">
                                      퀴즈
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openQuizModal(item.id)}
                                      className="h-7 px-2 text-xs"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      퀴즈 추가
                                    </Button>
                                  </div>
                                  {item.quizzes.length === 0 ? (
                                    <p className="text-xs text-gray-500">
                                      등록된 퀴즈가 없습니다
                                    </p>
                                  ) : (
                                    <div className="space-y-2">
                                      {item.quizzes.map((quiz) => (
                                        <div
                                          key={quiz.id}
                                          className="flex items-center justify-between bg-white p-2 rounded border"
                                        >
                                          <div className="flex-1">
                                            <p className="text-sm font-medium">
                                              {quiz.title}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              {quiz.questions.length}개 문제
                                            </p>
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              deleteQuiz(item.id, quiz.id)
                                            }
                                            className="h-6 w-6 p-0 text-red-600"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    moveCurriculumItem(index, index - 1)
                                  }
                                  className="h-8 w-8 p-0"
                                >
                                  ↑
                                </Button>
                              )}
                              {index < curriculumItems.length - 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    moveCurriculumItem(index, index + 1)
                                  }
                                  className="h-8 w-8 p-0"
                                >
                                  ↓
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCurriculumItem(item.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* 진도율 표시 */}
                  {curriculumItems.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          총 {curriculumItems.length}개 차시
                        </span>
                        <span className="text-gray-600">
                          총 학습시간:{" "}
                          {curriculumItems.reduce((total, item) => {
                            const duration =
                              parseInt(item.duration.replace(/[^0-9]/g, "")) ||
                              0;
                            return total + duration;
                          }, 0)}
                          분
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          영상:{" "}
                          {curriculumItems.reduce(
                            (total, item) => total + item.videos.length,
                            0,
                          )}
                          개
                        </span>
                        <span className="text-gray-600">
                          퀴즈:{" "}
                          {curriculumItems.reduce(
                            (total, item) => total + item.quizzes.length,
                            0,
                          )}
                          개
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              curriculumItems.length > 0
                                ? (curriculumItems.filter(
                                    (item) =>
                                      item.title.trim() &&
                                      (item.videos.length > 0 ||
                                        item.quizzes.length > 0 ||
                                        item.description.trim()),
                                  ).length /
                                    curriculumItems.length) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {
                          curriculumItems.filter(
                            (item) =>
                              item.title.trim() &&
                              (item.videos.length > 0 ||
                                item.quizzes.length > 0 ||
                                item.description.trim()),
                          ).length
                        }
                        개 차시 콘텐츠 완료됨
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* 강사 정보 탭 */}
            <TabsContent value="instructor" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instructorName">강사명</Label>
                <Input
                  id="instructorName"
                  value={courseForm.instructorName}
                  onChange={(e) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      instructorName: e.target.value,
                    }))
                  }
                  placeholder="강사 이름을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructorProfile">강사 소개</Label>
                <Textarea
                  id="instructorProfile"
                  value={courseForm.instructorProfile}
                  onChange={(e) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      instructorProfile: e.target.value,
                    }))
                  }
                  placeholder="강사의 경력, 학력, 전문 분야 등을 소개하세요"
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructorExpertise">강사 전문 분야</Label>
                <Textarea
                  id="instructorExpertise"
                  value={courseForm.instructorExpertise}
                  onChange={(e) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      instructorExpertise: e.target.value,
                    }))
                  }
                  placeholder="강사의 주요 전문 분야와 연구 영역을 작성하세요"
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* 일정 및 기타 탭 */}
            <TabsContent value="schedule" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="startDate"
                    className="flex items-center space-x-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>시작일</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={courseForm.startDate}
                    onChange={(e) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="endDate"
                    className="flex items-center space-x-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>종료일</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={courseForm.endDate}
                    onChange={(e) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
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
                    onChange={(e) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        enrollmentDeadline: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="completionDeadline">수료 마감일</Label>
                  <Input
                    id="completionDeadline"
                    type="date"
                    value={courseForm.completionDeadline}
                    onChange={(e) =>
                      setCourseForm((prev) => ({
                        ...prev,
                        completionDeadline: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalHours">총 교육시간</Label>
                <Input
                  id="totalHours"
                  type="number"
                  value={courseForm.totalHours}
                  onChange={(e) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      totalHours: e.target.value,
                    }))
                  }
                  placeholder="총 교육시간 (시간 단위)"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="flex items-center space-x-2"
                >
                  <MapPin className="h-4 w-4" />
                  <span>장소 (오프라인인 경우)</span>
                </Label>
                <Input
                  id="location"
                  value={courseForm.location}
                  onChange={(e) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="교육 장소를 입력하세요 (온라인인 경우 플랫폼명)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendations">추천 대상</Label>
                <Textarea
                  id="recommendations"
                  value={courseForm.recommendations}
                  onChange={(e) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      recommendations: e.target.value,
                    }))
                  }
                  placeholder="이 과정을 추천하는 대상을 구체적으로 작성하세요 (예: 5년 이상 경력의 중등교사, 교육관리자 등)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">태그</Label>
                <Input
                  id="tags"
                  value={courseForm.tags}
                  onChange={(e) =>
                    setCourseForm((prev) => ({ ...prev, tags: e.target.value }))
                  }
                  placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 리더십, 커뮤니케이션, 온라인)"
                />
                <p className="text-xs text-gray-500">
                  검색과 분류에 사용되는 키워드를 입력하세요
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowCourseDialog(false)}
            >
              취소
            </Button>
            <Button
              onClick={() => {
                // 태그를 배열로 변환
                const formDataWithTags = {
                  ...courseForm,
                  tags: courseForm.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0),
                  // 구조화된 커리큘럼 데이터 추가
                  curriculumItems: curriculumItems,
                  // 기존 텍스트 형태의 커리큘럼도 유지 (호환성을 위해)
                  curriculum: curriculumItems
                    .map(
                      (item, index) =>
                        `${index + 1}차시: ${item.title}${item.duration ? ` (${item.duration})` : ""}${item.description ? `\n${item.description}` : ""}`,
                    )
                    .join("\n\n"),
                };
                console.log("=== 프론트엔드: 강의 저장 데이터 ===");
                console.log(
                  "curriculumItems:",
                  JSON.stringify(curriculumItems, null, 2),
                );
                console.log(
                  "formDataWithTags:",
                  JSON.stringify(formDataWithTags, null, 2),
                );
                courseMutation.mutate(formDataWithTags);
              }}
              disabled={
                courseMutation.isPending ||
                !courseForm.title ||
                !courseForm.category ||
                !courseForm.subcategory ||
                !courseForm.price ||
                !courseForm.duration ||
                !courseForm.description
              }
            >
              {courseMutation.isPending
                ? "처리 중..."
                : editingCourse
                  ? "수정 완료"
                  : "강의 등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>강의 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 "{deleteTarget?.title}" 강의를 삭제하시겠습니까? 이 작업은
              되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 강의 미리보기 다이얼로그 */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>강의 미리보기</DialogTitle>
            <DialogDescription>
              등록된 강의 정보를 확인하세요.
            </DialogDescription>
          </DialogHeader>

          {previewCourse && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">{previewCourse.title}</h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span>{previewCourse.category}</span>
                  <span>•</span>
                  <span>{previewCourse.type}</span>
                  <span>•</span>
                  <span>{previewCourse.level}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">가격 정보</h4>
                  <div className="space-y-1">
                    {previewCourse.discountPrice ? (
                      <>
                        <div className="line-through text-gray-500">
                          {previewCourse.price?.toLocaleString()}원
                        </div>
                        <div className="text-red-600 font-medium text-lg">
                          {previewCourse.discountPrice?.toLocaleString()}원
                        </div>
                      </>
                    ) : (
                      <div className="font-medium text-lg">
                        {previewCourse.price?.toLocaleString()}원
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">강의 정보</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      수강 기간: {previewCourse.duration || "제한 없음"}
                    </div>
                    <div>
                      최대 수강생: {previewCourse.maxStudents || "제한 없음"}명
                    </div>
                    <div>학점: {previewCourse.credit || 1}학점</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">강의 소개</h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {previewCourse.description}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreviewDialog(false)}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Upload Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>영상 추가</DialogTitle>
            <DialogDescription>
              차시에 영상을 추가하세요. YouTube, Vimeo 링크 또는 직접 업로드할
              수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="videoTitle">영상 제목</Label>
              <Input
                id="videoTitle"
                value={videoForm.title}
                onChange={(e) =>
                  setVideoForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="영상 제목을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoType">영상 타입</Label>
              <Select
                value={videoForm.type}
                onValueChange={(value: "upload" | "youtube" | "vimeo") =>
                  setVideoForm((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="vimeo">Vimeo</SelectItem>
                  <SelectItem value="upload">직접 업로드</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">
                {videoForm.type === "upload" ? "파일 업로드" : "영상 URL"}
              </Label>
              {videoForm.type === "upload" ? (
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    // 파일 업로드 처리 로직 (실제 구현에서는 파일 서버 업로드 필요)
                    const file = e.target.files?.[0];
                    if (file) {
                      setVideoForm((prev) => ({
                        ...prev,
                        url: URL.createObjectURL(file),
                      }));
                    }
                  }}
                />
              ) : (
                <Input
                  id="videoUrl"
                  value={videoForm.url}
                  onChange={(e) =>
                    setVideoForm((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder={
                    videoForm.type === "youtube"
                      ? "https://www.youtube.com/watch?v=..."
                      : "https://vimeo.com/..."
                  }
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoDuration">영상 길이</Label>
              <Input
                id="videoDuration"
                value={videoForm.duration}
                onChange={(e) =>
                  setVideoForm((prev) => ({
                    ...prev,
                    duration: e.target.value,
                  }))
                }
                placeholder="예: 15분, 1시간 30분"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVideoModal(false)}>
              취소
            </Button>
            <Button
              onClick={addVideo}
              disabled={!videoForm.title || !videoForm.url}
            >
              영상 추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz Creation Modal */}
      <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>퀴즈 생성</DialogTitle>
            <DialogDescription>
              차시에 퀴즈를 추가하세요. 객관식, O/X, 단답형 문제를 생성할 수
              있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="quizTitle">퀴즈 제목</Label>
              <Input
                id="quizTitle"
                value={quizForm.title}
                onChange={(e) =>
                  setQuizForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="퀴즈 제목을 입력하세요"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">문제 목록</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addQuizQuestion}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>문제 추가</span>
                </Button>
              </div>

              {quizForm.questions.map((question, index) => (
                <Card key={question.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">
                        문제 {index + 1}
                      </Label>
                      {quizForm.questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuizQuestion(question.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Label>문제</Label>
                        <Textarea
                          value={question.question}
                          onChange={(e) =>
                            updateQuizQuestion(
                              question.id,
                              "question",
                              e.target.value,
                            )
                          }
                          placeholder="문제를 입력하세요"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>문제 유형</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value) =>
                            updateQuizQuestion(question.id, "type", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple">객관식</SelectItem>
                            <SelectItem value="true-false">O/X</SelectItem>
                            <SelectItem value="short-answer">단답형</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {question.type === "multiple" && (
                      <div className="space-y-2">
                        <Label>선택지</Label>
                        {question.options?.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center space-x-2"
                          >
                            <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [
                                  ...(question.options || []),
                                ];
                                newOptions[optionIndex] = e.target.value;
                                updateQuizQuestion(
                                  question.id,
                                  "options",
                                  newOptions,
                                );
                              }}
                              placeholder={`선택지 ${String.fromCharCode(65 + optionIndex)}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>정답</Label>
                        {question.type === "multiple" ? (
                          <Select
                            value={question.correctAnswer}
                            onValueChange={(value) =>
                              updateQuizQuestion(
                                question.id,
                                "correctAnswer",
                                value,
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="정답 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {question.options?.map((option, index) => (
                                <SelectItem
                                  key={index}
                                  value={String.fromCharCode(65 + index)}
                                >
                                  {String.fromCharCode(65 + index)}: {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : question.type === "true-false" ? (
                          <Select
                            value={question.correctAnswer}
                            onValueChange={(value) =>
                              updateQuizQuestion(
                                question.id,
                                "correctAnswer",
                                value,
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="정답 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="O">O (참)</SelectItem>
                              <SelectItem value="X">X (거짓)</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={question.correctAnswer}
                            onChange={(e) =>
                              updateQuizQuestion(
                                question.id,
                                "correctAnswer",
                                e.target.value,
                              )
                            }
                            placeholder="정답을 입력하세요"
                          />
                        )}
                      </div>
                      <div>
                        <Label>해설 (선택사항)</Label>
                        <Input
                          value={question.explanation || ""}
                          onChange={(e) =>
                            updateQuizQuestion(
                              question.id,
                              "explanation",
                              e.target.value,
                            )
                          }
                          placeholder="정답 해설을 입력하세요"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuizModal(false)}>
              취소
            </Button>
            <Button
              onClick={addQuiz}
              disabled={
                !quizForm.title ||
                quizForm.questions.every((q) => !q.question.trim())
              }
            >
              퀴즈 생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 샘플 이미지 선택 다이얼로그 */}
      <Dialog open={showImageSelector} onOpenChange={setShowImageSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>샘플 이미지 선택</DialogTitle>
            <DialogDescription>
              미리 준비된 교육용 이미지 중에서 선택하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {sampleImages.map((image) => (
              <div
                key={image.id}
                className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all"
                onClick={() => selectSampleImage(image.url)}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src =
                      "https://via.placeholder.com/300x200?text=이미지+없음";
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    선택
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
                  <p className="text-xs font-medium">{image.name}</p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowImageSelector(false)}
            >
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
