import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Plane,
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
  Users,
  Download,
  Upload,
  Image,
  X,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OverseasManagementProps {
  user: any;
}

// 프로그램 일정 타입 정의
interface ProgramScheduleItem {
  id: string;
  day: number;
  time: string;
  title: string;
  description: string;
  location: string;
  type: "activity" | "meal" | "rest" | "transport" | "accommodation";
}

export default function OverseasManagement({ user }: OverseasManagementProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showOverseasDialog, setShowOverseasDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [editingOverseas, setEditingOverseas] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [previewOverseas, setPreviewOverseas] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sampleImages, setSampleImages] = useState<any[]>([]);
  const [showSampleImages, setShowSampleImages] = useState(false);

  // 해외연수 폼 상태
  const [overseasForm, setOverseasForm] = useState<{
    title: string;
    description: string;
    destination: string;
    startDate: string;
    endDate: string;
    type: string;
    maxParticipants: string;
    imageUrl: string;
    program: string;
    benefits: string;
    requirements: string;
    price: string;
    duration: string;
    tags: string;
    airline: string;
    accommodation: string;
    meals: string;
    guide: string;
    visaInfo: string;
    insurance: string;
    currency: string;
    climate: string;
    timeZone: string;
    language: string;
    emergencyContact: string;
    cancellationPolicy: string;
    programSchedule: ProgramScheduleItem[];
  }>({
    title: "",
    description: "",
    destination: "",
    startDate: "",
    endDate: "",
    type: "",
    maxParticipants: "",
    imageUrl: "",
    program: "",
    benefits: "",
    requirements: "",
    price: "",
    duration: "",
    tags: "",
    airline: "",
    accommodation: "",
    meals: "",
    guide: "",
    visaInfo: "",
    insurance: "",
    currency: "",
    climate: "",
    timeZone: "",
    language: "",
    emergencyContact: "",
    cancellationPolicy: "",
    programSchedule: [],
  });

  // 해외연수 목록 조회
  const { data: myOverseas, isLoading: overseasLoading } = useQuery<{
    overseas: any[];
    total: number;
  }>({
    queryKey: [`/api/business/overseas/${user?.id}`, user?.id],
    enabled: !!user?.id,
  });

  // 해외연수 등록/수정 mutation
  const overseasMutation = useMutation({
    mutationFn: async (data: any) => {
      const overseasData = {
        ...data,
        providerId: user?.id,
        price: parseInt(data.price) || 0,
        maxParticipants: data.maxParticipants
          ? parseInt(data.maxParticipants)
          : null,
      };

      if (editingOverseas) {
        return apiRequest(
          "PUT",
          `/api/business/overseas/${editingOverseas.id}`,
          overseasData,
        );
      } else {
        return apiRequest("POST", "/api/business/overseas", overseasData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/business/overseas/${user?.id}`, user?.id],
      });
      toast({
        title: editingOverseas ? "해외연수 수정 완료" : "해외연수 등록 완료",
        description: editingOverseas
          ? "해외연수가 수정되었습니다."
          : "해외연수가 등록되었습니다. 관리자 승인 후 공개됩니다.",
      });
      setShowOverseasDialog(false);
      resetOverseasForm();
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 해외연수 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: async (overseasId) => {
      return apiRequest("DELETE", `/api/business/overseas/${overseasId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/business/overseas/${user?.id}`, user?.id],
      });
      toast({
        title: "해외연수 삭제 완료",
        description: "해외연수가 삭제되었습니다.",
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

  const resetOverseasForm = () => {
    setOverseasForm({
      title: "",
      description: "",
      destination: "",
      startDate: "",
      endDate: "",
      type: "",
      maxParticipants: "",
      imageUrl: "",
      program: "",
      benefits: "",
      requirements: "",
      price: "",
      duration: "",
      tags: "",
      airline: "",
      accommodation: "",
      meals: "",
      guide: "",
      visaInfo: "",
      insurance: "",
      currency: "",
      climate: "",
      timeZone: "",
      language: "",
      emergencyContact: "",
      cancellationPolicy: "",
      programSchedule: [],
    });
    setEditingOverseas(null);
  };

  const handleEditOverseas = (overseas: any) => {
    setEditingOverseas(overseas);
    setOverseasForm({
      title: overseas.title || "",
      description: overseas.description || "",
      destination: overseas.destination || "",
      startDate: overseas.startDate
        ? new Date(overseas.startDate).toISOString().split("T")[0]
        : "",
      endDate: overseas.endDate
        ? new Date(overseas.endDate).toISOString().split("T")[0]
        : "",
      type: overseas.type || "",
      maxParticipants: overseas.maxParticipants?.toString() || "",
      imageUrl: overseas.imageUrl || "",
      program: overseas.program || "",
      benefits: overseas.benefits || "",
      requirements: overseas.requirements || "",
      price: overseas.price?.toString() || "",
      duration: overseas.duration || "",
      tags: Array.isArray(overseas.tags)
        ? overseas.tags.join(", ")
        : overseas.tags || "",
      airline: overseas.airline || "",
      accommodation: overseas.accommodation || "",
      meals: overseas.meals || "",
      guide: overseas.guide || "",
      visaInfo: overseas.visaInfo || "",
      insurance: overseas.insurance || "",
      currency: overseas.currency || "",
      climate: overseas.climate || "",
      timeZone: overseas.timeZone || "",
      language: overseas.language || "",
      emergencyContact: overseas.emergencyContact || "",
      cancellationPolicy: overseas.cancellationPolicy || "",
      programSchedule: overseas.programSchedule || [],
    });
    setShowOverseasDialog(true);
  };

  const handleDelete = (overseas: any) => {
    setDeleteTarget(overseas);
    setShowDeleteDialog(true);
  };

  const handlePreviewOverseas = (overseas: any) => {
    setPreviewOverseas(overseas);
    setShowPreviewDialog(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  const getStatusBadge = (overseas: any) => {
    if (overseas.approvalStatus === "pending") {
      return (
        <Badge variant="outline" className="text-yellow-600">
          <Clock className="h-3 w-3 mr-1" />
          승인 대기
        </Badge>
      );
    }
    if (overseas.approvalStatus === "rejected") {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          승인 거부
        </Badge>
      );
    }
    if (overseas.status === "active") {
      return (
        <Badge variant="default">
          <CheckCircle className="h-3 w-3 mr-1" />
          운영 중
        </Badge>
      );
    }
    return <Badge variant="secondary">비활성</Badge>;
  };

  // 프로그램 일정 관리 함수들 추가
  const addProgramSchedule = () => {
    const newSchedule = {
      id: Date.now().toString(),
      day: 1,
      time: "",
      title: "",
      description: "",
      location: "",
      type: "activity" as
        | "activity"
        | "meal"
        | "rest"
        | "transport"
        | "accommodation",
    };
    setOverseasForm((prev) => ({
      ...prev,
      programSchedule: [...prev.programSchedule, newSchedule],
    }));
  };

  const updateProgramSchedule = (
    id: string,
    field: string,
    value: string | number,
  ) => {
    setOverseasForm((prev) => ({
      ...prev,
      programSchedule: prev.programSchedule.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const deleteProgramSchedule = (id: string) => {
    setOverseasForm((prev) => ({
      ...prev,
      programSchedule: prev.programSchedule.filter((item) => item.id !== id),
    }));
  };

  const moveProgramSchedule = (fromIndex: number, toIndex: number) => {
    setOverseasForm((prev) => {
      const newSchedule = [...prev.programSchedule];
      const [movedItem] = newSchedule.splice(fromIndex, 1);
      newSchedule.splice(toIndex, 0, movedItem);
      return { ...prev, programSchedule: newSchedule };
    });
  };

  // 이미지 업로드 관련 함수들
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "이미지 파일은 5MB 이하만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    // 파일 형식 체크
    if (!file.type.startsWith("image/")) {
      toast({
        title: "잘못된 파일 형식",
        description: "이미지 파일만 업로드 가능합니다.",
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

      setOverseasForm((prev) => ({ ...prev, imageUrl: result.image.url }));

      toast({
        title: "이미지 업로드 완료",
        description: "해외연수 이미지가 업로드되었습니다.",
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

    // 파일 입력 초기화
    event.target.value = "";
  };

  const loadSampleImages = async () => {
    try {
      const response = await fetch("/api/business/sample-images");
      if (response.ok) {
        const result = await response.json();
        setSampleImages(result.images || []);
      } else {
        // API 응답이 실패한 경우에만 더미 이미지 사용
        throw new Error("샘플 이미지 API 호출 실패");
      }
      setShowSampleImages(true);
    } catch (error) {
      console.error("샘플 이미지 로드 오류:", error);
      // API가 없는 경우 더미 샘플 이미지 제공
      const dummySamples = [
        {
          url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop",
          name: "해외 도시",
        },
        {
          url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop",
          name: "여행",
        },
        {
          url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
          name: "비행기",
        },
        {
          url: "https://images.unsplash.com/photo-1549144511-f099e773c147?w=400&h=300&fit=crop",
          name: "해외 건물",
        },
        {
          url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop",
          name: "국제 회의",
        },
        {
          url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=300&fit=crop",
          name: "연수",
        },
      ];
      setSampleImages(dummySamples);
      setShowSampleImages(true);
    }
  };

  const selectSampleImage = (imageUrl: string) => {
    setOverseasForm((prev) => ({ ...prev, imageUrl: imageUrl }));
    setShowSampleImages(false);
    toast({
      title: "이미지 선택 완료",
      description: "샘플 이미지가 선택되었습니다.",
    });
  };

  const removeImage = () => {
    setOverseasForm((prev) => ({ ...prev, imageUrl: "" }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="해외연수 검색..."
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
              resetOverseasForm();
              setShowOverseasDialog(true);
            }}
            disabled={!user?.isApproved}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />새 해외연수 등록
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
              기관 승인이 완료되면 해외연수를 등록할 수 있습니다. 승인까지 1-2일
              소요됩니다.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>연수명</TableHead>
              <TableHead>목적지</TableHead>
              <TableHead>기간</TableHead>
              <TableHead>가격</TableHead>
              <TableHead>참가자</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overseasLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : myOverseas?.overseas?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-3">
                    <Plane className="h-12 w-12 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        등록된 해외연수가 없습니다
                      </h3>
                      <p className="text-gray-500 mt-1">
                        첫 번째 해외연수를 등록해보세요. 승인 후 참가자들이
                        신청할 수 있습니다.
                      </p>
                    </div>
                    {user?.isApproved && (
                      <Button
                        onClick={() => {
                          resetOverseasForm();
                          setShowOverseasDialog(true);
                        }}
                        className="mt-4 bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        해외연수 등록하기
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              myOverseas?.overseas
                ?.filter((overseas) =>
                  overseas.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
                )
                .map((overseas) => (
                  <TableRow key={overseas.id}>
                    <TableCell className="font-medium">
                      {overseas.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                        {overseas.destination}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        {overseas.duration ||
                          `${overseas.startDate ? new Date(overseas.startDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }) : ""} - ${overseas.endDate ? new Date(overseas.endDate).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }) : ""}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {overseas.price?.toLocaleString()}원
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-500" />
                        {overseas.participants || 0}/
                        {overseas.maxParticipants || "∞"}명
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(overseas)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handlePreviewOverseas(overseas)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            보기
                          </DropdownMenuItem>
                          {overseas.status !== "deleted" && (
                            <DropdownMenuItem
                              onClick={() => handleEditOverseas(overseas)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(overseas)}
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

      {/* 해외연수 등록/수정 다이얼로그 */}
      <Dialog open={showOverseasDialog} onOpenChange={setShowOverseasDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOverseas ? "해외연수 수정" : "새 해외연수 등록"}
            </DialogTitle>
            <DialogDescription>
              {editingOverseas
                ? "해외연수 정보를 수정하세요."
                : "새로운 해외연수 프로그램을 등록하세요. 관리자 승인 후 공개됩니다."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="overseasTitle">연수명 *</Label>
                <Input
                  id="overseasTitle"
                  value={overseasForm.title}
                  onChange={(e) =>
                    setOverseasForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="해외연수명을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overseasType">연수 유형 *</Label>
                <Select
                  value={overseasForm.type}
                  onValueChange={(value) =>
                    setOverseasForm((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="교육시찰">교육시찰</SelectItem>
                    <SelectItem value="연구연수">연구연수</SelectItem>
                    <SelectItem value="어학연수">어학연수</SelectItem>
                    <SelectItem value="문화체험">문화체험</SelectItem>
                    <SelectItem value="교육과정개발">교육과정개발</SelectItem>
                    <SelectItem value="국제교류">국제교류</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="overseasDestination">연수지 *</Label>
                <Input
                  id="overseasDestination"
                  value={overseasForm.destination}
                  onChange={(e) =>
                    setOverseasForm((prev) => ({
                      ...prev,
                      destination: e.target.value,
                    }))
                  }
                  placeholder="연수 목적지를 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overseasDuration">연수 기간</Label>
                <Input
                  id="overseasDuration"
                  value={overseasForm.duration}
                  onChange={(e) =>
                    setOverseasForm((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  placeholder="예: 7박 8일, 2주"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overseasStartDate">출발일 *</Label>
                <Input
                  id="overseasStartDate"
                  type="date"
                  value={overseasForm.startDate}
                  onChange={(e) =>
                    setOverseasForm((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overseasEndDate">귀국일 *</Label>
                <Input
                  id="overseasEndDate"
                  type="date"
                  value={overseasForm.endDate}
                  onChange={(e) =>
                    setOverseasForm((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overseasMaxParticipants">최대 참가자 수</Label>
                <Input
                  id="overseasMaxParticipants"
                  type="number"
                  value={overseasForm.maxParticipants}
                  onChange={(e) =>
                    setOverseasForm((prev) => ({
                      ...prev,
                      maxParticipants: e.target.value,
                    }))
                  }
                  placeholder="최대 참가자 수"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overseasPrice">연수비 *</Label>
                <Input
                  id="overseasPrice"
                  type="number"
                  value={overseasForm.price}
                  onChange={(e) =>
                    setOverseasForm((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                  placeholder="연수비 (항공료, 숙박비 포함)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="overseasDescription">연수 소개 *</Label>
              <Textarea
                id="overseasDescription"
                value={overseasForm.description}
                onChange={(e) =>
                  setOverseasForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="해외연수에 대한 상세한 소개를 입력하세요"
                rows={4}
              />
            </div>

            {/* 해외연수 이미지 업로드 섹션 */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">해외연수 이미지</Label>

              {overseasForm.imageUrl ? (
                <div className="relative">
                  <img
                    src={overseasForm.imageUrl}
                    alt="해외연수 이미지"
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      해외연수 이미지 추가
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      JPG, PNG 파일 (최대 5MB)
                    </p>
                  </div>
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
                    id="overseasImageUpload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      document.getElementById("overseasImageUpload")?.click()
                    }
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
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
                    onClick={loadSampleImages}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    샘플 이미지 선택
                  </Button>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                권장 크기: 800x450px, 최대 5MB (JPG, PNG, GIF, WebP)
              </p>
            </div>

            {/* 일정별 연수 프로그램 섹션 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">
                  일정별 연수 프로그램
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addProgramSchedule}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>일정 추가</span>
                </Button>
              </div>

              {overseasForm.programSchedule.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">연수 일정을 추가해주세요</p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={addProgramSchedule}
                    className="mt-2"
                  >
                    첫 번째 일정 추가
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {overseasForm.programSchedule.map((schedule, index) => (
                    <Card key={schedule.id} className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {schedule.day}일차
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-4 gap-3">
                            <div>
                              <Label className="text-sm">일차</Label>
                              <Input
                                type="number"
                                min="1"
                                value={schedule.day}
                                onChange={(e) =>
                                  updateProgramSchedule(
                                    schedule.id,
                                    "day",
                                    parseInt(e.target.value) || 1,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-sm">시간</Label>
                              <Input
                                type="time"
                                value={schedule.time}
                                onChange={(e) =>
                                  updateProgramSchedule(
                                    schedule.id,
                                    "time",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="text-sm">활동명</Label>
                              <Input
                                placeholder="활동 제목"
                                value={schedule.title}
                                onChange={(e) =>
                                  updateProgramSchedule(
                                    schedule.id,
                                    "title",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">장소</Label>
                              <Input
                                placeholder="활동 장소"
                                value={schedule.location}
                                onChange={(e) =>
                                  updateProgramSchedule(
                                    schedule.id,
                                    "location",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label className="text-sm">유형</Label>
                              <Select
                                value={schedule.type}
                                onValueChange={(value) =>
                                  updateProgramSchedule(
                                    schedule.id,
                                    "type",
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="activity">활동</SelectItem>
                                  <SelectItem value="meal">식사</SelectItem>
                                  <SelectItem value="rest">휴식</SelectItem>
                                  <SelectItem value="transport">
                                    이동
                                  </SelectItem>
                                  <SelectItem value="accommodation">
                                    숙박
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm">활동 설명</Label>
                            <Textarea
                              placeholder="활동 내용 설명"
                              value={schedule.description}
                              onChange={(e) =>
                                updateProgramSchedule(
                                  schedule.id,
                                  "description",
                                  e.target.value,
                                )
                              }
                              rows={2}
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                moveProgramSchedule(index, index - 1)
                              }
                              className="h-8 w-8 p-0"
                            >
                              ↑
                            </Button>
                          )}
                          {index < overseasForm.programSchedule.length - 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                moveProgramSchedule(index, index + 1)
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
                            onClick={() => deleteProgramSchedule(schedule.id)}
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

              {/* 일정 요약 */}
              {overseasForm.programSchedule.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-800 font-medium">
                      총 {overseasForm.programSchedule.length}개 일정
                    </span>
                    <span className="text-blue-600">
                      {
                        overseasForm.programSchedule.filter(
                          (s) => s.type === "activity",
                        ).length
                      }
                      개 활동,{" "}
                      {
                        overseasForm.programSchedule.filter(
                          (s) => s.type === "meal",
                        ).length
                      }
                      개 식사,{" "}
                      {
                        overseasForm.programSchedule.filter(
                          (s) => s.type === "rest",
                        ).length
                      }
                      개 휴식
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          overseasForm.programSchedule.length > 0
                            ? (overseasForm.programSchedule.filter(
                                (s) => s.time && s.title.trim(),
                              ).length /
                                overseasForm.programSchedule.length) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    {
                      overseasForm.programSchedule.filter(
                        (s) => s.time && s.title.trim(),
                      ).length
                    }
                    개 일정 완료됨
                  </p>
                </div>
              )}
            </div>

            {/* 기존 프로그램 텍스트 영역 (하위 호환용) */}
            <div className="space-y-2">
              <Label htmlFor="overseasProgram">연수 프로그램 (추가 설명)</Label>
              <Textarea
                id="overseasProgram"
                value={overseasForm.program}
                onChange={(e) =>
                  setOverseasForm((prev) => ({
                    ...prev,
                    program: e.target.value,
                  }))
                }
                placeholder="위 일정 외 추가 설명이 필요한 경우 입력하세요"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="overseasAirline">항공편</Label>
                <Input
                  id="overseasAirline"
                  value={overseasForm.airline}
                  onChange={(e) =>
                    setOverseasForm((prev) => ({
                      ...prev,
                      airline: e.target.value,
                    }))
                  }
                  placeholder="항공사 및 항공편 정보"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overseasAccommodation">숙박</Label>
                <Input
                  id="overseasAccommodation"
                  value={overseasForm.accommodation}
                  onChange={(e) =>
                    setOverseasForm((prev) => ({
                      ...prev,
                      accommodation: e.target.value,
                    }))
                  }
                  placeholder="숙박 시설 정보"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overseasMeals">식사</Label>
                <Input
                  id="overseasMeals"
                  value={overseasForm.meals}
                  onChange={(e) =>
                    setOverseasForm((prev) => ({
                      ...prev,
                      meals: e.target.value,
                    }))
                  }
                  placeholder="식사 제공 정보"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overseasGuide">가이드</Label>
                <Input
                  id="overseasGuide"
                  value={overseasForm.guide}
                  onChange={(e) =>
                    setOverseasForm((prev) => ({
                      ...prev,
                      guide: e.target.value,
                    }))
                  }
                  placeholder="가이드 및 인솔자 정보"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="overseasBenefits">연수 혜택</Label>
              <Textarea
                id="overseasBenefits"
                value={overseasForm.benefits}
                onChange={(e) =>
                  setOverseasForm((prev) => ({
                    ...prev,
                    benefits: e.target.value,
                  }))
                }
                placeholder="참가자가 얻을 수 있는 혜택을 입력하세요"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overseasRequirements">참가 자격</Label>
              <Textarea
                id="overseasRequirements"
                value={overseasForm.requirements}
                onChange={(e) =>
                  setOverseasForm((prev) => ({
                    ...prev,
                    requirements: e.target.value,
                  }))
                }
                placeholder="참가 자격 요건을 입력하세요"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overseasTags">태그</Label>
              <Input
                id="overseasTags"
                value={overseasForm.tags}
                onChange={(e) =>
                  setOverseasForm((prev) => ({ ...prev, tags: e.target.value }))
                }
                placeholder="태그를 쉼표로 구분하여 입력하세요"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowOverseasDialog(false)}
            >
              취소
            </Button>
            <Button
              onClick={() => {
                const overseasData = {
                  ...overseasForm,
                  tags: overseasForm.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag),
                  programSchedule: overseasForm.programSchedule,
                };
                console.log("전송할 해외연수 데이터:", overseasData);
                overseasMutation.mutate(overseasData);
              }}
              disabled={
                !overseasForm.title ||
                !overseasForm.type ||
                !overseasForm.destination ||
                !overseasForm.startDate ||
                !overseasForm.endDate ||
                !overseasForm.description ||
                !overseasForm.price ||
                overseasMutation.isPending
              }
            >
              {overseasMutation.isPending
                ? "등록 중..."
                : editingOverseas
                  ? "해외연수 수정"
                  : "해외연수 등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 해외연수 미리보기 다이얼로그 */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>해외연수 미리보기</DialogTitle>
            <DialogDescription>
              등록된 해외연수 정보를 확인하세요.
            </DialogDescription>
          </DialogHeader>

          {previewOverseas && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">{previewOverseas.title}</h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span>{previewOverseas.type}</span>
                  <span>•</span>
                  <span>{previewOverseas.destination}</span>
                  <span>•</span>
                  <span>{previewOverseas.duration}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">연수비</h4>
                  <div className="font-medium text-lg">
                    {previewOverseas.price?.toLocaleString()}원
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">연수 정보</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      기간:{" "}
                      {previewOverseas.startDate && previewOverseas.endDate
                        ? `${new Date(previewOverseas.startDate).toLocaleDateString("ko-KR")} - ${new Date(previewOverseas.endDate).toLocaleDateString("ko-KR")}`
                        : previewOverseas.duration || "미정"}
                    </div>
                    <div>
                      최대 참가자:{" "}
                      {previewOverseas.maxParticipants || "제한 없음"}명
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">연수 소개</h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {previewOverseas.description}
                </p>
              </div>

              {previewOverseas.program && (
                <div>
                  <h4 className="font-medium mb-2">연수 프로그램</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {previewOverseas.program}
                  </p>
                </div>
              )}

              {(previewOverseas.airline ||
                previewOverseas.accommodation ||
                previewOverseas.meals ||
                previewOverseas.guide) && (
                <div>
                  <h4 className="font-medium mb-2">연수 상세 정보</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {previewOverseas.airline && (
                      <div>
                        <span className="font-medium">항공편:</span>{" "}
                        {previewOverseas.airline}
                      </div>
                    )}
                    {previewOverseas.accommodation && (
                      <div>
                        <span className="font-medium">숙박:</span>{" "}
                        {previewOverseas.accommodation}
                      </div>
                    )}
                    {previewOverseas.meals && (
                      <div>
                        <span className="font-medium">식사:</span>{" "}
                        {previewOverseas.meals}
                      </div>
                    )}
                    {previewOverseas.guide && (
                      <div>
                        <span className="font-medium">가이드:</span>{" "}
                        {previewOverseas.guide}
                      </div>
                    )}
                  </div>
                </div>
              )}
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

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>해외연수 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 "{deleteTarget?.title}" 해외연수를 삭제하시겠습니까? 이
              작업은 되돌릴 수 없습니다.
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

      {/* 샘플 이미지 선택 다이얼로그 */}
      <Dialog open={showSampleImages} onOpenChange={setShowSampleImages}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>샘플 이미지 선택</DialogTitle>
            <DialogDescription>
              해외연수에 사용할 이미지를 선택하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(sampleImages || []).map((image, index) => (
              <div
                key={index}
                className="relative cursor-pointer group"
                onClick={() => selectSampleImage(image.url)}
              >
                <img
                  src={image.url}
                  alt={image.name || `샘플 이미지 ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border hover:border-blue-500 transition-colors"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    선택
                  </Button>
                </div>
                {image.name && (
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {image.name}
                  </p>
                )}
              </div>
            ))}
          </div>

          {(!sampleImages || sampleImages.length === 0) && (
            <div className="text-center py-8">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                샘플 이미지가 없습니다
              </h3>
              <p className="text-gray-500">
                사용 가능한 샘플 이미지가 없습니다. 파일을 직접 업로드해주세요.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSampleImages(false)}
            >
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
