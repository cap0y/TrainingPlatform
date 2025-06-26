import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Star,
  Share2,
  Heart,
  ArrowLeft,
  Loader2,
  Copy,
  Facebook,
  Twitter,
  MessageCircle,
  Plane,
  Globe,
  Home,
  Utensils,
  UserCheck,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface OverseasProgram {
  id: number;
  title: string;
  description?: string | null;
  destination: string;
  startDate: Date | string;
  endDate: Date | string;
  type: string;
  maxParticipants?: number | null;
  currentParticipants?: number | null;
  price: number;
  duration: string;
  imageUrl?: string | null;
  benefits?: string | null;
  requirements?: string | null;
  tags?: string | null;
  programSchedule?: Array<{
    id: string;
    day: number;
    time: string;
    title: string;
    description: string;
    location: string;
    type: "activity" | "meal" | "rest" | "transport" | "accommodation";
  }>;
  airline?: string | null;
  accommodation?: string | null;
  meals?: string | null;
  guide?: string | null;
  visaInfo?: string | null;
  insurance?: string | null;
  currency?: string | null;
  climate?: string | null;
  timeZone?: string | null;
  language?: string | null;
  emergencyContact?: string | null;
  cancellationPolicy?: string | null;
  status?: string;
  approvalStatus?: string;
  isActive?: boolean | null;
  createdAt?: Date | string | null;
}

export default function StudyAbroadDetailPage() {
  const [, params] = useRoute("/study-abroad/:id");
  const programId = params?.id;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const {
    data: program,
    isLoading,
    error,
  } = useQuery<OverseasProgram>({
    queryKey: [`/api/overseas-programs/${programId}`],
    enabled: !!programId,
  });

  // 해외연수 신청 뮤테이션
  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/overseas-programs/${programId}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "신청 중 오류가 발생했습니다.");
      }
      return response.json();
    },
    onSuccess: (data) => {
      alert(data.message);
      queryClient.invalidateQueries({
        queryKey: [`/api/overseas-programs/${programId}`],
      });
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  // 신청하기 핸들러
  const handleRegister = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 참가비가 있는 경우 결제 모달 표시
    if (program?.price && program.price > 0) {
      setShowPaymentModal(true);
    } else {
      // 무료인 경우 바로 등록
      registerMutation.mutate();
    }
  };

  // 결제 완료 후 등록 처리
  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    registerMutation.mutate();
  };

  // 공유하기 핸들러들
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("링크가 복사되었습니다.");
    setShowShareMenu(false);
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(program?.title || "");
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}&t=${title}`,
      "_blank",
    );
    setShowShareMenu(false);
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(program?.title || "");
    window.open(
      `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      "_blank",
    );
    setShowShareMenu(false);
  };

  const handleShareKakao = () => {
    // 카카오톡 공유 기능 (실제로는 Kakao SDK 필요)
    alert("카카오톡 공유 기능은 준비 중입니다.");
    setShowShareMenu(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>해외연수 정보를 불러오는 중...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            해외연수를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-8">
            요청하신 해외연수가 존재하지 않거나 삭제되었습니다.
          </p>
          <Link href="/study-abroad">
            <Button>해외연수 목록으로 돌아가기</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원";
  };

  // 기본값 설정
  const defaultImageUrl =
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=400&fit=crop";
  const participationRate = program.maxParticipants
    ? ((program.currentParticipants || 0) / program.maxParticipants) * 100
    : 0;

  const getStatusColor = (isActive: boolean) => {
    const now = new Date();
    const startDate = new Date(program.startDate);

    if (startDate < now) {
      return "bg-red-500";
    } else if (
      program.maxParticipants &&
      program.currentParticipants &&
      program.currentParticipants >= program.maxParticipants
    ) {
      return "bg-red-500";
    } else {
      return "bg-green-500";
    }
  };

  const getStatusText = () => {
    const now = new Date();
    const startDate = new Date(program.startDate);

    if (startDate < now) {
      return "마감";
    } else if (
      program.maxParticipants &&
      program.currentParticipants &&
      program.currentParticipants >= program.maxParticipants
    ) {
      return "마감";
    } else if (!program.isActive) {
      return "마감";
    } else {
      return "접수중";
    }
  };

  const getStatusBadge = (program: OverseasProgram) => {
    const now = new Date();
    const startDate = new Date(program.startDate);

    if (startDate < now) {
      return { text: "마감", color: "bg-red-500" };
    } else if (
      program.maxParticipants &&
      program.currentParticipants &&
      program.currentParticipants >= program.maxParticipants
    ) {
      return { text: "마감", color: "bg-red-500" };
    } else if (!program.isActive) {
      return { text: "마감", color: "bg-red-500" };
    } else {
      return { text: "접수중", color: "bg-green-500" };
    }
  };

  // 일정 타입별 색상 함수
  const getTypeColor = (type: string) => {
    switch (type) {
      case "activity":
        return "border-l-blue-500 bg-blue-50";
      case "transport":
        return "border-l-purple-500 bg-purple-50";
      case "meal":
        return "border-l-orange-500 bg-orange-50";
      case "rest":
        return "border-l-green-500 bg-green-50";
      case "accommodation":
        return "border-l-indigo-500 bg-indigo-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  // 일정 타입별 라벨 함수
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "activity":
        return "활동";
      case "transport":
        return "이동";
      case "meal":
        return "식사";
      case "rest":
        return "휴식";
      case "accommodation":
        return "숙박";
      default:
        return "기타";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative">
        <div className="relative h-96 overflow-hidden">
          <img
            src={program.imageUrl || defaultImageUrl}
            alt={program.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl text-white">
                <Link href="/study-abroad">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/20 mb-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    목록으로 돌아가기
                  </Button>
                </Link>

                <div className="flex items-center gap-2 mb-4">
                  <Badge
                    className={`${getStatusColor(program.isActive || false)} text-white`}
                  >
                    {getStatusText()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-white/20 text-white border-white/50"
                  >
                    {program.type}
                  </Badge>
                </div>

                <h1 className="text-4xl font-bold mb-4">{program.title}</h1>
                {program.description && (
                  <p className="text-xl text-gray-200 mb-6">
                    {program.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(program.startDate.toString())} 출발</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{program.destination}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{program.duration}</span>
                  </div>
                  {program.maxParticipants && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {program.currentParticipants || 0}/
                        {program.maxParticipants}명
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">연수 개요</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {program.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Program Schedule */}
            {program.programSchedule && program.programSchedule.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <Calendar className="h-6 w-6 mr-3 text-purple-600" />
                    일정별 연수 프로그램
                  </h2>

                  <div className="space-y-6">
                    {program.programSchedule.map((schedule, index) => (
                      <div key={schedule.id} className="relative">
                        {index < program.programSchedule!.length - 1 && (
                          <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-200"></div>
                        )}

                        <div
                          className={`relative pl-12 pr-4 py-4 rounded-lg border-l-4 ${getTypeColor(schedule.type)}`}
                        >
                          <div className="absolute left-4 top-6 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          </div>

                          <div className="absolute left-16 top-4">
                            <div className="text-sm font-mono font-medium text-gray-700 bg-white px-2 py-1 rounded border">
                              {schedule.day}일차 {schedule.time}
                            </div>
                          </div>

                          <div className="ml-32">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {schedule.title}
                                </h3>
                                {schedule.location && (
                                  <div className="flex items-center text-sm text-gray-600 mt-1">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {schedule.location}
                                  </div>
                                )}
                              </div>
                              <Badge variant="outline">
                                {getTypeLabel(schedule.type)}
                              </Badge>
                            </div>
                            {schedule.description && (
                              <p className="text-gray-700 mt-2">
                                {schedule.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits and Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Benefits */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    연수 혜택
                  </h2>
                  <div className="space-y-2">
                    {program.benefits?.split("\n").map((benefit, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    참가 자격
                  </h2>
                  <div className="space-y-2">
                    {program.requirements?.split("\n").map((req, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <span className="text-gray-700">{req}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Travel Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">여행 정보</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {program.airline && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <Plane className="h-4 w-4 mr-2 text-purple-500" />
                        항공편
                      </h3>
                      <p className="text-gray-600">{program.airline}</p>
                    </div>
                  )}
                  {program.accommodation && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <Home className="h-4 w-4 mr-2 text-purple-500" />
                        숙박
                      </h3>
                      <p className="text-gray-600">{program.accommodation}</p>
                    </div>
                  )}
                  {program.meals && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <Utensils className="h-4 w-4 mr-2 text-purple-500" />
                        식사
                      </h3>
                      <p className="text-gray-600">{program.meals}</p>
                    </div>
                  )}
                  {program.guide && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                        <UserCheck className="h-4 w-4 mr-2 text-purple-500" />
                        가이드
                      </h3>
                      <p className="text-gray-600">{program.guide}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">추가 정보</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {program.visaInfo && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">
                        비자 정보
                      </h3>
                      <p className="text-gray-600">{program.visaInfo}</p>
                    </div>
                  )}
                  {program.currency && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">
                        현지 통화
                      </h3>
                      <p className="text-gray-600">{program.currency}</p>
                    </div>
                  )}
                  {program.climate && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">기후</h3>
                      <p className="text-gray-600">{program.climate}</p>
                    </div>
                  )}
                  {program.timeZone && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">시차</h3>
                      <p className="text-gray-600">{program.timeZone}</p>
                    </div>
                  )}
                  {program.language && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">
                        사용 언어
                      </h3>
                      <p className="text-gray-600">{program.language}</p>
                    </div>
                  )}
                  {program.emergencyContact && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">
                        긴급 연락처
                      </h3>
                      <p className="text-gray-600">
                        {program.emergencyContact}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {program.tags && (
              <div className="flex flex-wrap gap-2">
                {program.tags.split(",").map((tag, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    #{tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {formatPrice(program.price)}
                  </div>
                  <div className="text-sm text-gray-600">연수비</div>
                </div>

                {program.maxParticipants && (
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">신청 현황</span>
                      <span className="font-semibold">
                        {program.currentParticipants || 0}/
                        {program.maxParticipants}명
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${participationRate}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                    disabled={getStatusText() === "마감"}
                    onClick={handleRegister}
                  >
                    {getStatusText() === "마감" ? "접수 마감" : "지금 신청하기"}
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      <Heart className="h-4 w-4 mr-2" />
                      관심등록
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowShareMenu(true)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      공유하기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Program Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">연수 정보</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">연수 기간</div>
                      <div className="text-gray-600">{program.duration}</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">연수지</div>
                      <div className="text-gray-600">{program.destination}</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center space-x-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">연수 유형</div>
                      <div className="text-gray-600">{program.type}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Share Menu Modal */}
      {showShareMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">해외연수 공유하기</h2>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4 mr-2" />
                링크 복사하기
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleShareFacebook}
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook 공유하기
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleShareTwitter}
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter 공유하기
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleShareKakao}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Kakao 공유하기
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => setShowShareMenu(false)}
            >
              닫기
            </Button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">결제하기</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {program?.title}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">연수비</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {program?.price ? formatPrice(program.price) : "0원"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">결제 방법</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    신용카드
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    계좌이체
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    카카오페이
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPaymentModal(false)}
              >
                취소
              </Button>
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handlePaymentComplete}
              >
                {registerMutation.isPending ? "처리 중..." : "결제하기"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
