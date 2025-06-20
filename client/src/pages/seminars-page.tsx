import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Clock, Video, Building } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SeminarsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSeminar, setSelectedSeminar] = useState(null);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    search: "",
    month: "all",
  });

  // Fetch seminars
  const { data: seminars, isLoading } = useQuery({
    queryKey: ["/api/seminars"],
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (seminarId: number) => {
      return apiRequest("POST", `/api/seminars/${seminarId}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seminars"] });
      toast({
        title: "신청 완료",
        description: "세미나 신청이 완료되었습니다.",
      });
      setShowRegistrationDialog(false);
      setSelectedSeminar(null);
    },
    onError: (error) => {
      toast({
        title: "신청 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRegister = (seminar) => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "세미나 신청을 위해 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }
    setSelectedSeminar(seminar);
    setShowRegistrationDialog(true);
  };

  const filteredSeminars = seminars?.filter(seminar => {
    const matchesType = filters.type === "all" || seminar.type === filters.type;
    const matchesSearch = !filters.search || 
      seminar.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      seminar.description?.toLowerCase().includes(filters.search.toLowerCase());
    return matchesType && matchesSearch;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">학회 / 세미나</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            전문가들과 함께하는 최신 교육 동향과 연구 성과를 공유하는 학술 행사에 참여하세요
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  진행 방식
                </label>
                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="online">온라인</SelectItem>
                    <SelectItem value="offline">오프라인</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  개최 월
                </label>
                <Select value={filters.month} onValueChange={(value) => setFilters(prev => ({ ...prev, month: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {i + 1}월
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  검색
                </label>
                <Input
                  placeholder="세미나명 또는 내용 검색"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seminars Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSeminars.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">조건에 맞는 세미나가 없습니다.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setFilters({ type: "", search: "", month: "" })}
            >
              전체 보기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeminars.map((seminar) => (
              <Card key={seminar.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 course-card">
                <CardContent className="p-0">
                  <div className="relative h-48 bg-gradient-to-r from-primary to-secondary">
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      {seminar.type === 'online' ? (
                        <Video className="h-16 w-16" />
                      ) : (
                        <Building className="h-16 w-16" />
                      )}
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge variant={seminar.type === 'online' ? 'default' : 'secondary'}>
                        {seminar.type === 'online' ? '온라인' : '오프라인'}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="bg-white text-primary">
                        {new Date(seminar.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {seminar.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {seminar.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        {new Date(seminar.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        {new Date(seminar.date).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      
                      {seminar.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          {seminar.location}
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        {seminar.currentParticipants}/{seminar.maxParticipants || '∞'}명 참가
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {seminar.maxParticipants && seminar.currentParticipants >= seminar.maxParticipants ? (
                          <span className="text-red-500 font-medium">접수 마감</span>
                        ) : new Date(seminar.date) < new Date() ? (
                          <span className="text-gray-500">종료됨</span>
                        ) : (
                          <span className="text-green-600 font-medium">접수 중</span>
                        )}
                      </div>
                      
                      <Button
                        onClick={() => handleRegister(seminar)}
                        disabled={
                          (seminar.maxParticipants && seminar.currentParticipants >= seminar.maxParticipants) ||
                          new Date(seminar.date) < new Date()
                        }
                        size="sm"
                      >
                        신청하기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upcoming Events Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">예정된 주요 행사</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary bg-opacity-10 rounded-full">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">2025 교육혁신 국제컨퍼런스</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      AI 시대의 교육 패러다임 변화와 미래 교육 방향을 논의하는 국제 학술대회
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      2025년 8월 15일 - 17일
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-accent bg-opacity-10 rounded-full">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">교육과정 재구성 워크숍</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      2025 개정 교육과정에 따른 효과적인 교육과정 재구성 방법론 실습
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      2025년 7월 22일 - 23일
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>세미나 신청</DialogTitle>
          </DialogHeader>
          {selectedSeminar && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedSeminar.title}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(selectedSeminar.date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'short'
                    })}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(selectedSeminar.date).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  {selectedSeminar.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {selectedSeminar.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Badge variant="outline">
                      {selectedSeminar.type === 'online' ? '온라인' : '오프라인'}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                위 세미나에 참가 신청하시겠습니까? 신청 후 세미나 관련 안내를 이메일로 받으실 수 있습니다.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegistrationDialog(false)}>
              취소
            </Button>
            <Button 
              onClick={() => registerMutation.mutate(selectedSeminar?.id)}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "신청 중..." : "신청하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
