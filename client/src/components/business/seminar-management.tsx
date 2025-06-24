import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar, MapPin, Users, Plus, Edit, Clock, Trash2, X, Image, Upload } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SeminarManagementProps {
  user: any;
}

export default function SeminarManagement({ user }: SeminarManagementProps) {
  const { toast } = useToast();
  const [showSeminarDialog, setShowSeminarDialog] = useState(false);
  const [editingSeminar, setEditingSeminar] = useState<any>(null);
  const [selectedSeminarId, setSelectedSeminarId] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sampleImages, setSampleImages] = useState<any[]>([]);
  const [showSampleImages, setShowSampleImages] = useState(false);

  // 세미나 폼 상태
  const [seminarForm, setSeminarForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    type: "",
    maxParticipants: "",
    imageUrl: "",
    organizer: "",
    program: "",
    benefits: "",
    requirements: "",
    price: "",
    duration: "",
    tags: "",
    contactPhone: "",
    contactEmail: "",
    programSchedule: [] as Array<{
      id: string;
      time: string;
      title: string;
      description: string;
      speaker?: string;
      location?: string;
      type: 'session' | 'break' | 'meal' | 'networking';
    }>,
  });

  // 세미나 목록 조회
  const { data: mySeminars, isLoading: seminarsLoading } = useQuery<{ seminars: any[] }>({
    queryKey: [`/api/business/seminars/${user?.id}`, user?.id],
    enabled: !!user?.id,
  });

  // 선택된 세미나의 신청자 목록 조회
  const { data: seminarRegistrations, isLoading: registrationsLoading } = useQuery<{
    seminar: any;
    registrations: any[];
  }>({
    queryKey: [`/api/business/seminars/${selectedSeminarId}/registrations`, selectedSeminarId],
    enabled: !!selectedSeminarId,
  });

  // 세미나 등록 mutation
  const seminarMutation = useMutation({
    mutationFn: async (data: any) => {
      const seminarData = {
        ...data,
        providerId: user?.id,
        price: data.price ? parseInt(data.price) : 0,
        maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : null,
      };

      if (editingSeminar) {
        return apiRequest("PUT", `/api/business/seminars/${editingSeminar.id}`, seminarData);
      } else {
        return apiRequest("POST", "/api/business/seminars", seminarData);
      }
    },
    onSuccess: (data) => {
      // 세미나 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: [`/api/business/seminars/${user?.id}`, user?.id] });
      
      // 선택된 세미나의 신청자 목록 캐시도 무효화 (세미나 정보가 변경되었을 수 있으므로)
      if (selectedSeminarId) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/business/seminars/${selectedSeminarId}/registrations`, selectedSeminarId] 
        });
      }

      toast({
        title: editingSeminar ? "세미나 수정 완료" : "세미나 등록 완료",
        description: editingSeminar ? "세미나가 수정되었습니다." : "세미나가 등록되었습니다. 관리자 승인 후 공개됩니다.",
      });
      setShowSeminarDialog(false);
      resetSeminarForm();
    },
    onError: (error) => {
      toast({
        title: editingSeminar ? "세미나 수정 실패" : "세미나 등록 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetSeminarForm = () => {
    setSeminarForm({
      title: "",
      description: "",
      date: "",
      location: "",
      type: "",
      maxParticipants: "",
      imageUrl: "",
      organizer: "",
      program: "",
      benefits: "",
      requirements: "",
      price: "",
      duration: "",
      tags: "",
      contactPhone: "",
      contactEmail: "",
      programSchedule: [],
    });
    setEditingSeminar(null);
  };

  // 프로그램 일정 관리 함수들
  const addProgramSchedule = () => {
    const newSchedule = {
      id: Date.now().toString(),
      time: "",
      title: "",
      description: "",
      speaker: "",
      location: "",
      type: 'session' as 'session' | 'break' | 'meal' | 'networking',
    };
    setSeminarForm(prev => ({
      ...prev,
      programSchedule: [...prev.programSchedule, newSchedule]
    }));
  };

  const updateProgramSchedule = (id: string, field: string, value: string) => {
    setSeminarForm(prev => ({
      ...prev,
      programSchedule: prev.programSchedule.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const deleteProgramSchedule = (id: string) => {
    setSeminarForm(prev => ({
      ...prev,
      programSchedule: prev.programSchedule.filter(item => item.id !== id)
    }));
  };

  const moveProgramSchedule = (fromIndex: number, toIndex: number) => {
    setSeminarForm(prev => {
      const newSchedule = [...prev.programSchedule];
      const [movedItem] = newSchedule.splice(fromIndex, 1);
      newSchedule.splice(toIndex, 0, movedItem);
      return { ...prev, programSchedule: newSchedule };
    });
  };

  // 이미지 업로드 관련 함수들
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!file.type.startsWith('image/')) {
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
      formData.append('image', file);

      const response = await fetch('/api/business/upload-course-image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const result = await response.json();
      
      setSeminarForm(prev => ({ ...prev, imageUrl: result.image.url }));

      toast({
        title: "이미지 업로드 완료",
        description: "세미나 이미지가 업로드되었습니다.",
      });
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      toast({
        title: "업로드 실패",
        description: error instanceof Error ? error.message : "이미지 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }

    // 파일 입력 초기화
    event.target.value = '';
  };

  const loadSampleImages = async () => {
    try {
      const response = await fetch('/api/business/sample-images');
      if (response.ok) {
        const result = await response.json();
        setSampleImages(result.images || []);
      } else {
        // API 응답이 실패한 경우에만 더미 이미지 사용
        throw new Error('샘플 이미지 API 호출 실패');
      }
      setShowSampleImages(true);
    } catch (error) {
      console.error("샘플 이미지 로드 오류:", error);
      // API가 없는 경우 더미 샘플 이미지 제공
      const dummySamples = [
        {
          url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
          name: "비즈니스 미팅"
        },
        {
          url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop",
          name: "컨퍼런스"
        },
        {
          url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=300&fit=crop",
          name: "워크샵"
        },
        {
          url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop",
          name: "프레젠테이션"
        },
        {
          url: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop",
          name: "세미나"
        },
        {
          url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
          name: "교육"
        }
      ];
      setSampleImages(dummySamples);
      setShowSampleImages(true);
    }
  };

  const selectSampleImage = (imageUrl: string) => {
    setSeminarForm(prev => ({ ...prev, imageUrl: imageUrl }));
    setShowSampleImages(false);
    toast({
      title: "이미지 선택 완료",
      description: "샘플 이미지가 선택되었습니다.",
    });
  };

  const removeImage = () => {
    setSeminarForm(prev => ({ ...prev, imageUrl: "" }));
  };

  const handleEditSeminar = (seminar: any) => {
    console.log("편집할 세미나 데이터:", seminar);
    setEditingSeminar(seminar);
    
    // 날짜 형식을 datetime-local에 맞게 변환
    let formattedDate = "";
    if (seminar.date) {
      try {
        const date = new Date(seminar.date);
        // 유효한 날짜인지 확인
        if (!isNaN(date.getTime())) {
          // YYYY-MM-DDTHH:MM 형식으로 변환
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
      } catch (error) {
        console.error("날짜 변환 오류:", error);
      }
    }
    
    setSeminarForm({
      title: seminar.title || "",
      description: seminar.description || "",
      date: formattedDate,
      location: seminar.location || "",
      type: seminar.type || "",
      maxParticipants: seminar.maxParticipants?.toString() || "",
      imageUrl: seminar.imageUrl || "",
      organizer: seminar.organizer || "",
      program: seminar.program || "",
      benefits: seminar.benefits || "",
      requirements: seminar.requirements || "",
      price: seminar.price?.toString() || "",
      duration: seminar.duration || "",
      tags: Array.isArray(seminar.tags) ? seminar.tags.join(", ") : (seminar.tags || ""),
      contactPhone: seminar.contactPhone || "",
      contactEmail: seminar.contactEmail || "",
      programSchedule: seminar.programSchedule || [],
    });
    setShowSeminarDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">세미나 관리</h2>
          <p className="text-gray-600">등록한 세미나와 신청자를 관리하세요</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => {
              resetSeminarForm();
              setShowSeminarDialog(true);
            }} 
            disabled={!user?.isApproved}
            className="bg-green-600 hover:bg-green-700 text-white font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />
            새 세미나 등록
          </Button>
        </div>
      </div>

      {!user?.isApproved && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-yellow-800">
              기관 승인이 완료되면 세미나를 등록할 수 있습니다. 승인까지 1-2일 소요됩니다.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 세미나 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>내 세미나 목록</CardTitle>
            <CardDescription>등록한 세미나를 선택하여 신청자를 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            {seminarsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : mySeminars?.seminars?.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 세미나가 없습니다</h3>
                <p className="text-gray-500 mb-4">
                  새로운 세미나를 등록해보세요.
                </p>
                <Button 
                  onClick={() => {
                    resetSeminarForm();
                    setShowSeminarDialog(true);
                  }}
                  disabled={!user?.isApproved}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  세미나 등록
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {mySeminars?.seminars?.map((seminar) => (
                  <div
                    key={seminar.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      selectedSeminarId === seminar.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedSeminarId(seminar.id)}
                      >
                        <h4 className="font-medium">{seminar.title}</h4>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(seminar.date).toLocaleDateString('ko-KR')}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {seminar.location || '온라인'}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {seminar.currentParticipants || 0}/{seminar.maxParticipants || '∞'}명
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">세미나</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSeminar(seminar);
                          }}
                          className="ml-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 신청자 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>신청자 목록</CardTitle>
            <CardDescription>
              {selectedSeminarId 
                ? `선택한 세미나의 신청자 목록입니다`
                : '세미나를 선택하면 신청자 목록이 표시됩니다'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedSeminarId ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">세미나를 선택하세요</h3>
                <p className="text-gray-500">
                  좌측에서 세미나를 선택하면 신청자 목록을 확인할 수 있습니다.
                </p>
              </div>
            ) : registrationsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : seminarRegistrations?.registrations?.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">신청자가 없습니다</h3>
                <p className="text-gray-500">
                  아직 이 세미나에 신청한 사람이 없습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">{seminarRegistrations?.seminar?.title}</h4>
                    <p className="text-sm text-gray-600">
                      총 {seminarRegistrations?.registrations?.length}명 신청
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {seminarRegistrations?.registrations?.map((registration, index) => (
                    <div key={registration.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <h5 className="font-medium">{registration.user?.name}</h5>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center">
                                <span className="w-12">이메일:</span>
                                <span>{registration.user?.email}</span>
                              </div>
                              {registration.user?.phone && (
                                <div className="flex items-center">
                                  <span className="w-12">연락처:</span>
                                  <span>{registration.user?.phone}</span>
                                </div>
                              )}
                              {registration.user?.organizationName && (
                                <div className="flex items-center">
                                  <span className="w-12">소속:</span>
                                  <span>{registration.user?.organizationName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            {registration.user?.userType === 'business' ? '기관' : '개인'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(registration.registeredAt).toLocaleDateString('ko-KR')} 신청
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 세미나 등록 다이얼로그 */}
      <Dialog open={showSeminarDialog} onOpenChange={setShowSeminarDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSeminar ? "세미나 수정" : "새 세미나 등록"}</DialogTitle>
            <DialogDescription>
              {editingSeminar ? "세미나 정보를 수정하세요." : "새로운 세미나를 등록하세요. 관리자 승인 후 공개됩니다."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seminarTitle">세미나명 *</Label>
                <Input
                  id="seminarTitle"
                  value={seminarForm.title}
                  onChange={(e) => setSeminarForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="세미나명을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seminarType">세미나 유형 *</Label>
                <Select 
                  value={seminarForm.type} 
                  onValueChange={(value) => setSeminarForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="학술세미나">학술세미나</SelectItem>
                    <SelectItem value="정책세미나">정책세미나</SelectItem>
                    <SelectItem value="실무세미나">실무세미나</SelectItem>
                    <SelectItem value="워크샵">워크샵</SelectItem>
                    <SelectItem value="컨퍼런스">컨퍼런스</SelectItem>
                    <SelectItem value="심포지엄">심포지엄</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seminarDate">개최일시 *</Label>
                <Input
                  id="seminarDate"
                  type="datetime-local"
                  value={seminarForm.date}
                  onChange={(e) => setSeminarForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seminarLocation">장소 *</Label>
                <Input
                  id="seminarLocation"
                  value={seminarForm.location}
                  onChange={(e) => setSeminarForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="세미나 장소를 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seminarMaxParticipants">최대 참가자 수</Label>
                <Input
                  id="seminarMaxParticipants"
                  type="number"
                  value={seminarForm.maxParticipants}
                  onChange={(e) => setSeminarForm(prev => ({ ...prev, maxParticipants: e.target.value }))}
                  placeholder="최대 참가자 수"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seminarPrice">참가비</Label>
                <Input
                  id="seminarPrice"
                  type="number"
                  value={seminarForm.price}
                  onChange={(e) => setSeminarForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="참가비 (무료인 경우 0)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seminarDuration">진행 시간</Label>
                <Input
                  id="seminarDuration"
                  value={seminarForm.duration}
                  onChange={(e) => setSeminarForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="예: 3시간, 반나절, 1일 등"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seminarDescription">세미나 소개 *</Label>
              <Textarea
                id="seminarDescription"
                value={seminarForm.description}
                onChange={(e) => setSeminarForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="세미나에 대한 상세한 소개를 입력하세요"
                rows={4}
              />
            </div>
            
            {/* 세미나 이미지 업로드 섹션 */}
            <div className="space-y-4">
              <Label className="text-lg font-medium">세미나 이미지</Label>
              
              {seminarForm.imageUrl ? (
                <div className="relative">
                  <img 
                    src={seminarForm.imageUrl} 
                    alt="세미나 이미지" 
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
                    <h3 className="text-sm font-medium text-gray-900 mb-2">세미나 이미지 추가</h3>
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
                    id="seminarImageUpload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('seminarImageUpload')?.click()}
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
            
            {/* 프로그램 일정 섹션 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">시간대별 프로그램 일정</Label>
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
              
              {seminarForm.programSchedule.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">프로그램 일정을 추가해주세요</p>
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
                  {seminarForm.programSchedule.map((schedule, index) => (
                    <Card key={schedule.id} className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-4 gap-3">
                            <div>
                              <Label className="text-sm">시간</Label>
                              <Input
                                type="time"
                                value={schedule.time}
                                onChange={(e) => updateProgramSchedule(schedule.id, 'time', e.target.value)}
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="text-sm">제목</Label>
                              <Input
                                placeholder="세션 제목"
                                value={schedule.title}
                                onChange={(e) => updateProgramSchedule(schedule.id, 'title', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-sm">유형</Label>
                              <Select 
                                value={schedule.type} 
                                onValueChange={(value) => updateProgramSchedule(schedule.id, 'type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="session">세션</SelectItem>
                                  <SelectItem value="break">휴식</SelectItem>
                                  <SelectItem value="meal">식사</SelectItem>
                                  <SelectItem value="networking">네트워킹</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">발표자/진행자</Label>
                              <Input
                                placeholder="발표자 또는 진행자"
                                value={schedule.speaker || ''}
                                onChange={(e) => updateProgramSchedule(schedule.id, 'speaker', e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-sm">장소</Label>
                              <Input
                                placeholder="진행 장소"
                                value={schedule.location || ''}
                                onChange={(e) => updateProgramSchedule(schedule.id, 'location', e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm">설명</Label>
                            <Textarea
                              placeholder="세션 내용 설명"
                              value={schedule.description}
                              onChange={(e) => updateProgramSchedule(schedule.id, 'description', e.target.value)}
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
                              onClick={() => moveProgramSchedule(index, index - 1)}
                              className="h-8 w-8 p-0"
                            >
                              ↑
                            </Button>
                          )}
                          {index < seminarForm.programSchedule.length - 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveProgramSchedule(index, index + 1)}
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
              {seminarForm.programSchedule.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-800 font-medium">총 {seminarForm.programSchedule.length}개 일정</span>
                    <span className="text-green-600">
                      {seminarForm.programSchedule.filter(s => s.type === 'session').length}개 세션, {' '}
                      {seminarForm.programSchedule.filter(s => s.type === 'break').length}개 휴식, {' '}
                      {seminarForm.programSchedule.filter(s => s.type === 'meal').length}개 식사
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${seminarForm.programSchedule.length > 0 ? (seminarForm.programSchedule.filter(s => 
                          s.time && s.title.trim()
                        ).length / seminarForm.programSchedule.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {seminarForm.programSchedule.filter(s => s.time && s.title.trim()).length}개 일정 완료됨
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seminarBenefits">참가 혜택</Label>
              <Textarea
                id="seminarBenefits"
                value={seminarForm.benefits}
                onChange={(e) => setSeminarForm(prev => ({ ...prev, benefits: e.target.value }))}
                placeholder="참가자가 얻을 수 있는 혜택을 입력하세요"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="seminarRequirements">참가 자격</Label>
              <Textarea
                id="seminarRequirements"
                value={seminarForm.requirements}
                onChange={(e) => setSeminarForm(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder="참가 자격 요건을 입력하세요"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seminarOrganizer">주최기관</Label>
                <Input
                  id="seminarOrganizer"
                  value={seminarForm.organizer}
                  onChange={(e) => setSeminarForm(prev => ({ ...prev, organizer: e.target.value }))}
                  placeholder="주최기관명을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seminarTags">태그</Label>
                <Input
                  id="seminarTags"
                  value={seminarForm.tags}
                  onChange={(e) => setSeminarForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="태그를 쉼표로 구분하여 입력하세요"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium">문의사항</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seminarContactPhone">문의 연락처</Label>
                  <Input
                    id="seminarContactPhone"
                    value={seminarForm.contactPhone}
                    onChange={(e) => setSeminarForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="예: 02-1234-5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seminarContactEmail">문의 이메일</Label>
                  <Input
                    id="seminarContactEmail"
                    type="email"
                    value={seminarForm.contactEmail}
                    onChange={(e) => setSeminarForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="예: contact@example.com"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowSeminarDialog(false)}>
              취소
            </Button>
            <Button 
              onClick={() => {
                const seminarData = {
                  ...seminarForm,
                  programSchedule: seminarForm.programSchedule,
                };
                console.log("전송할 세미나 데이터:", seminarData);
                seminarMutation.mutate(seminarData);
              }}
              disabled={!seminarForm.title || !seminarForm.type || !seminarForm.date || !seminarForm.location || !seminarForm.description || seminarMutation.isPending}
            >
              {seminarMutation.isPending ? 
                (editingSeminar ? "수정 중..." : "등록 중...") : 
                (editingSeminar ? "세미나 수정" : "세미나 등록")
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 샘플 이미지 선택 다이얼로그 */}
      <Dialog open={showSampleImages} onOpenChange={setShowSampleImages}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>샘플 이미지 선택</DialogTitle>
            <DialogDescription>
              세미나에 사용할 이미지를 선택하세요.
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
                  <p className="text-xs text-gray-600 mt-1 truncate">{image.name}</p>
                )}
              </div>
            ))}
          </div>
          
          {(!sampleImages || sampleImages.length === 0) && (
            <div className="text-center py-8">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">샘플 이미지가 없습니다</h3>
              <p className="text-gray-500">
                사용 가능한 샘플 이미지가 없습니다. 파일을 직접 업로드해주세요.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSampleImages(false)}>
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 