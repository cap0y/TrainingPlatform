import { useRoute } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users, Clock, DollarSign, Star, Share2, Heart, ArrowLeft, Loader2, Copy, Facebook, Twitter, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface Seminar {
  id: number;
  title: string;
  description?: string | null;
  date: Date | string;
  location?: string | null;
  type: string;
  maxParticipants?: number | null;
  currentParticipants?: number | null;
  imageUrl?: string | null;
  benefits?: string | null;
  requirements?: string | null;
  price?: number | null;
  programSchedule?: Array<{
    id: string;
    time: string;
    title: string;
    description: string;
    speaker?: string;
    location?: string;
    type: 'session' | 'break' | 'meal' | 'networking';
  }>;
  isActive?: boolean | null;
  createdAt?: Date | string | null;
  tags?: string | null;
  duration?: string | null;
  organizer?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
}

export default function SeminarDetailPage() {
  const [, params] = useRoute("/seminars/:id");
  const seminarId = params?.id;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: seminar, isLoading, error } = useQuery<Seminar>({
    queryKey: [`/api/seminars/${seminarId}`],
    enabled: !!seminarId,
  });

  // 관심등록 상태 조회
  const { data: wishlistStatus } = useQuery<{isWishlisted: boolean}>({
    queryKey: [`/api/seminars/${seminarId}/wishlist-status`],
    enabled: !!seminarId && !!user,
  });

  // 세미나 신청 뮤테이션
  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/seminars/${seminarId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '신청 중 오류가 발생했습니다.');
      }
      return response.json();
    },
    onSuccess: (data) => {
      alert(data.message);
      queryClient.invalidateQueries({ queryKey: [`/api/seminars/${seminarId}`] });
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  // 관심등록 뮤테이션
  const wishlistMutation = useMutation({
    mutationFn: async (action: 'add' | 'remove') => {
      const response = await fetch(`/api/seminars/${seminarId}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '관심등록 처리 중 오류가 발생했습니다.');
      }
      return response.json();
    },
    onSuccess: (data) => {
      alert(data.message);
      queryClient.invalidateQueries({ queryKey: [`/api/seminars/${seminarId}/wishlist-status`] });
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  // 신청하기 핸들러
  const handleRegister = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    // 참가비가 있는 경우 결제 모달 표시
    if (seminar?.price && seminar.price > 0) {
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

  // 관심등록 핸들러
  const handleWishlist = () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    const action = wishlistStatus?.isWishlisted ? 'remove' : 'add';
    wishlistMutation.mutate(action);
  };

  // 공유하기 핸들러들
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 복사되었습니다.');
    setShowShareMenu(false);
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(seminar?.title || '');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${title}`, '_blank');
    setShowShareMenu(false);
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(seminar?.title || '');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
    setShowShareMenu(false);
  };

  const handleShareKakao = () => {
    // 카카오톡 공유 기능 (실제로는 Kakao SDK 필요)
    alert('카카오톡 공유 기능은 준비 중입니다.');
    setShowShareMenu(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>세미나 정보를 불러오는 중...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !seminar) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">세미나를 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-8">요청하신 세미나가 존재하지 않거나 삭제되었습니다.</p>
          <Link href="/seminars">
            <Button>세미나 목록으로 돌아가기</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 기본값 설정
  const defaultImageUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop";
  const participationRate = seminar.maxParticipants 
    ? ((seminar.currentParticipants || 0) / seminar.maxParticipants) * 100 
    : 0;

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-500" : "bg-red-500";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "접수중" : "마감";
  };

  // 프로그램 일정 타입별 색상 함수
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'session':
        return 'border-l-blue-500 bg-blue-50';
      case 'break':
        return 'border-l-green-500 bg-green-50';
      case 'meal':
        return 'border-l-orange-500 bg-orange-50';
      case 'networking':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  // 프로그램 일정 타입별 라벨 함수
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'session':
        return '세션';
      case 'break':
        return '휴식';
      case 'meal':
        return '식사';
      case 'networking':
        return '네트워킹';
      default:
        return '기타';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative">
        <div className="relative h-96 overflow-hidden">
          <img 
            src={seminar.imageUrl || defaultImageUrl} 
            alt={seminar.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl text-white">
                <Link href="/seminars">
                  <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    목록으로 돌아가기
                  </Button>
                </Link>
                
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={`${getStatusColor(seminar.isActive || false)} text-white`}>
                    {getStatusText(seminar.isActive || false)}
                  </Badge>
                  <Badge variant="outline" className="bg-white/20 text-white border-white/50">
                    {seminar.type}
                  </Badge>
                </div>
                
                <h1 className="text-4xl font-bold mb-4">{seminar.title}</h1>
                {seminar.description && (
                  <p className="text-xl text-gray-200 mb-6">{seminar.description}</p>
                )}
                
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(seminar.date.toString())}</span>
                  </div>
                  {seminar.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                      <span>{seminar.location}</span>
                  </div>
                  )}
                  {seminar.maxParticipants && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                      <span>{seminar.currentParticipants || 0}/{seminar.maxParticipants}명</span>
                  </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(seminar.date.toString())}</span>
                  </div>
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
                <h2 className="text-2xl font-bold mb-4">세미나 개요</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {seminar.description || "세미나에 대한 자세한 설명이 준비 중입니다."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Program - 기본 프로그램 정보 */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">프로그램 정보</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">세미나 일정</h3>
                    <p className="text-gray-600">
                      일시: {formatDate(seminar.date.toString())} {formatTime(seminar.date.toString())}
                    </p>
                    {seminar.location && (
                      <p className="text-gray-600">장소: {seminar.location}</p>
                    )}
                    <p className="text-gray-600">형태: {seminar.type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 시간대별 프로그램 일정 */}
            {seminar.programSchedule && seminar.programSchedule.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <Clock className="h-6 w-6 mr-3 text-blue-600" />
                    시간대별 프로그램 일정
                  </h2>
                  
                  <div className="space-y-4">
                    {seminar.programSchedule.map((schedule, index) => {
                      const getTypeIcon = (type: string) => {
                        switch (type) {
                          case 'session':
                            return <div className="w-3 h-3 bg-blue-500 rounded-full"></div>;
                          case 'break':
                            return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
                          case 'meal':
                            return <div className="w-3 h-3 bg-orange-500 rounded-full"></div>;
                          case 'networking':
                            return <div className="w-3 h-3 bg-purple-500 rounded-full"></div>;
                          default:
                            return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
                        }
                      };

                      const getTypeColor = (type: string) => {
                        switch (type) {
                          case 'session':
                            return 'border-l-blue-500 bg-blue-50';
                          case 'break':
                            return 'border-l-green-500 bg-green-50';
                          case 'meal':
                            return 'border-l-orange-500 bg-orange-50';
                          case 'networking':
                            return 'border-l-purple-500 bg-purple-50';
                          default:
                            return 'border-l-gray-500 bg-gray-50';
                        }
                      };

                      const getTypeLabel = (type: string) => {
                        switch (type) {
                          case 'session':
                            return '세션';
                          case 'break':
                            return '휴식';
                          case 'meal':
                            return '식사';
                          case 'networking':
                            return '네트워킹';
                          default:
                            return '기타';
                        }
                      };

                      return (
                        <div key={schedule.id} className="relative">
                          {/* 연결선 */}
                          {index < seminar.programSchedule!.length - 1 && (
                            <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-300"></div>
                          )}
                          
                          <div className={`relative pl-12 pr-4 py-4 rounded-lg border-l-4 ${getTypeColor(schedule.type)} transition-all hover:shadow-md`}>
                            {/* 시간 아이콘 */}
                            <div className="absolute left-4 top-6 flex items-center justify-center">
                              {getTypeIcon(schedule.type)}
                            </div>
                            
                            {/* 시간 표시 */}
                            <div className="absolute left-16 top-4">
                              <div className="text-sm font-mono font-bold text-gray-700 bg-white px-2 py-1 rounded border">
                                {schedule.time}
                              </div>
                            </div>
                            
                            {/* 내용 */}
                            <div className="ml-20">
                              <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="text-lg font-semibold text-gray-900">{schedule.title}</h3>
                                    <Badge variant="outline" className="text-xs">
                                      {getTypeLabel(schedule.type)}
                                    </Badge>
                                  </div>
                                  
                                  {schedule.speaker && (
                                    <div className="flex items-center text-sm text-gray-600 mb-1">
                                      <Users className="h-4 w-4 mr-1" />
                                      <span>{schedule.speaker}</span>
                                    </div>
                                  )}
                                  
                                  {schedule.location && (
                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      <span>{schedule.location}</span>
                                    </div>
                                  )}
                                  
                                  {schedule.description && (
                                    <p className="text-gray-700 leading-relaxed">{schedule.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* 프로그램 요약 */}
                  <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-3">프로그램 요약</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">
                          세션 {seminar.programSchedule.filter(s => s.type === 'session').length}개
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">
                          휴식 {seminar.programSchedule.filter(s => s.type === 'break').length}개
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-600">
                          식사 {seminar.programSchedule.filter(s => s.type === 'meal').length}개
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-600">
                          네트워킹 {seminar.programSchedule.filter(s => s.type === 'networking').length}개
                        </span>
                      </div>
                    </div>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Benefits */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">참가 혜택</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(seminar.benefits ? 
                    seminar.benefits.split('\n').filter(benefit => benefit.trim()) : 
                    [
                    "최신 동향 파악",
                    "전문가 네트워킹",
                    "참가증명서 발급",
                    "자료집 제공",
                    "질의응답 시간",
                    "후속 연락망 구축"
                    ]
                  ).map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">{benefit.trim()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {seminar.requirements && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">참가 자격</h2>
                  <div className="space-y-2">
                    {seminar.requirements.split('\n').filter(req => req.trim()).map((requirement, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <span className="text-gray-700">{requirement.trim()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {seminar.tags && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">태그</h2>
                  <div className="flex flex-wrap gap-2">
                    {seminar.tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        #{tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {seminar.price && seminar.price > 0 
                      ? `${seminar.price.toLocaleString('ko-KR')}원` 
                      : '무료'
                    }
                  </div>
                  <div className="text-sm text-gray-600">참가비</div>
                </div>

                {seminar.maxParticipants && (
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">신청 현황</span>
                      <span className="font-semibold">{seminar.currentParticipants || 0}/{seminar.maxParticipants}명</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${participationRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">남은 자리</span>
                      <span className="font-semibold text-blue-600">{seminar.maxParticipants - (seminar.currentParticipants || 0)}명</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    size="lg"
                    disabled={!seminar.isActive}
                    onClick={handleRegister}
                  >
                    {seminar.isActive ? "지금 신청하기" : "접수 마감"}
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1" onClick={handleWishlist}>
                      <Heart className="h-4 w-4 mr-2" />
                      {wishlistStatus?.isWishlisted ? "관심등록 해제" : "관심등록"}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setShowShareMenu(true)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      공유하기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">세미나 정보</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">일시</div>
                      <div className="text-gray-600">{formatDate(seminar.date.toString())}</div>
                      <div className="text-gray-600">{formatTime(seminar.date.toString())}</div>
                    </div>
                  </div>
                  <Separator />
                  {seminar.location && (
                    <>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">장소</div>
                          <div className="text-gray-600">{seminar.location}</div>
                    </div>
                  </div>
                  <Separator />
                    </>
                  )}
                  <div className="flex items-start space-x-3">
                    <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">참가 형태</div>
                      <div className="text-gray-600">{seminar.type}</div>
                    </div>
                  </div>
                  {seminar.duration && (
                    <>
                      <Separator />
                      <div className="flex items-start space-x-3">
                        <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <div className="font-medium">진행 시간</div>
                          <div className="text-gray-600">{seminar.duration}</div>
                        </div>
                      </div>
                    </>
                  )}
                  {seminar.organizer && (
                    <>
                      <Separator />
                      <div className="flex items-start space-x-3">
                        <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <div className="font-medium">주최기관</div>
                          <div className="text-gray-600">{seminar.organizer}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">문의사항</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-600">연락처: {seminar.contactPhone || '02-1234-5678'}</div>
                    <div className="text-gray-600">이메일: {seminar.contactEmail || 'info@example.com'}</div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => {
                    if (seminar.contactEmail) {
                      window.location.href = `mailto:${seminar.contactEmail}?subject=세미나 문의: ${seminar.title}`;
                    } else {
                      alert('문의 이메일이 등록되지 않았습니다.');
                    }
                  }}>
                    이메일로 문의하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {showShareMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">세미나 공유하기</h2>
            <div className="space-y-4">
              <Button variant="outline" className="w-full" onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-2" />
                링크 복사하기
              </Button>
              <Button variant="outline" className="w-full" onClick={handleShareFacebook}>
                <Facebook className="h-4 w-4 mr-2" />
                Facebook 공유하기
              </Button>
              <Button variant="outline" className="w-full" onClick={handleShareTwitter}>
                <Twitter className="h-4 w-4 mr-2" />
                Twitter 공유하기
              </Button>
              <Button variant="outline" className="w-full" onClick={handleShareKakao}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Kakao 공유하기
              </Button>
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setShowShareMenu(false)}>
              닫기
            </Button>
          </div>
        </div>
      )}

      {/* 결제 모달 */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">결제하기</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">{seminar?.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">참가비</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {seminar?.price?.toLocaleString('ko-KR')}원
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
              <Button variant="outline" className="flex-1" onClick={() => setShowPaymentModal(false)}>
                취소
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handlePaymentComplete}>
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