import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users, Clock, DollarSign, Star, Share2, Heart, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function SeminarDetailPage() {
  const [, params] = useRoute("/seminars/:id");
  const seminarId = params?.id;

  // Mock seminar data - in real app this would come from API
  const seminarData = {
    id: 1,
    title: "2025 한국교육학회 춘계학술대회",
    description: "교육의 미래를 논하는 국내 최대 규모의 교육학회입니다. 최신 교육 동향과 연구 결과를 공유하며, 전국의 교육 전문가들이 모여 미래 교육의 방향성을 모색합니다.",
    longDescription: "한국교육학회 춘계학술대회는 매년 국내외 교육 전문가들이 모여 교육 분야의 최신 연구 성과를 공유하고 토론하는 중요한 학술 행사입니다. 올해는 '교육의 미래: 디지털 전환과 인간 중심 교육'을 주제로 진행됩니다.\n\n이번 대회에서는 AI와 빅데이터를 활용한 개인 맞춤형 교육, 메타버스와 가상현실을 활용한 몰입형 학습, 코로나19 이후 변화된 교육 환경에 대한 심도 있는 논의가 이루어질 예정입니다.\n\n참가자들은 주제 발표, 포스터 세션, 분과별 토론 등을 통해 교육 현장의 실제적인 문제들을 함께 해결해 나가는 소중한 시간을 갖게 될 것입니다.",
    date: "2025.07.15-16",
    location: "서울대학교 교육연구원",
    address: "서울특별시 관악구 관악로 1 서울대학교 교육연구원 대강당",
    type: "학회",
    category: "교육학회",
    participants: 500,
    maxParticipants: 600,
    price: 150000,
    duration: "2일",
    startTime: "09:00",
    endTime: "18:00",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    featured: true,
    status: "접수중",
    organizer: "한국교육학회",
    organizerInfo: {
      name: "한국교육학회",
      contact: "02-880-7622",
      email: "info@kera.or.kr",
      website: "https://www.kera.or.kr"
    },
    tags: ["교육혁신", "미래교육", "정책", "AI교육", "디지털전환"],
    program: [
      {
        day: "1일차 (7월 15일)",
        sessions: [
          { time: "09:00-09:30", title: "등록 및 접수", type: "등록" },
          { time: "09:30-10:00", title: "개회식", type: "개회식", speaker: "한국교육학회장" },
          { time: "10:00-11:30", title: "기조강연: 교육의 미래와 디지털 전환", type: "기조강연", speaker: "김교육 교수 (서울대)" },
          { time: "11:30-12:00", title: "휴식" },
          { time: "12:00-13:30", title: "점심 식사 및 네트워킹" },
          { time: "13:30-15:00", title: "세션 1: AI와 개인 맞춤형 교육", type: "세션", speaker: "이AI 박사 (KAIST)" },
          { time: "15:00-15:30", title: "휴식" },
          { time: "15:30-17:00", title: "세션 2: 메타버스와 몰입형 학습", type: "세션", speaker: "박가상 교수 (연세대)" },
          { time: "17:00-18:00", title: "포스터 세션 및 네트워킹" }
        ]
      },
      {
        day: "2일차 (7월 16일)",
        sessions: [
          { time: "09:00-10:30", title: "세션 3: 코로나19 이후 교육 환경 변화", type: "세션", speaker: "최변화 교수 (고려대)" },
          { time: "10:30-11:00", title: "휴식" },
          { time: "11:00-12:30", title: "분과별 토론: 교육 현장의 과제와 해결방안", type: "토론" },
          { time: "12:30-14:00", title: "점심 식사" },
          { time: "14:00-15:30", title: "종합 토론: 교육의 미래 방향성", type: "종합토론" },
          { time: "15:30-16:00", title: "휴식" },
          { time: "16:00-17:00", title: "폐회식 및 차기 학회 안내", type: "폐회식" }
        ]
      }
    ],
    benefits: [
      "교육 분야 최신 동향 파악",
      "전국 교육 전문가 네트워킹",
      "참가증명서 발급",
      "학술대회 논문집 제공",
      "점심 식사 제공",
      "주차 공간 제공"
    ],
    requirements: [
      "교육 관련 종사자 (교사, 교수, 연구원 등)",
      "교육학 전공 대학원생",
      "교육 정책 관련 공무원",
      "교육 관련 기업 종사자"
    ],
    faq: [
      {
        question: "사전 등록이 필수인가요?",
        answer: "네, 사전 등록이 필수입니다. 현장 등록도 가능하지만 사전 등록 시 할인 혜택이 있습니다."
      },
      {
        question: "주차 공간이 제공되나요?",
        answer: "네, 서울대학교 교육연구원 주차장을 이용하실 수 있습니다. 주차 공간이 한정되어 있으니 대중교통 이용을 권장합니다."
      },
      {
        question: "참가증명서는 어떻게 발급받나요?",
        answer: "학회 종료 후 이메일로 전자 참가증명서가 발송됩니다. 필요시 현장에서 종이 증명서도 발급 가능합니다."
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "접수중": return "bg-green-500";
      case "접수예정": return "bg-blue-500";  
      case "마감": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative">
        <div className="relative h-96 overflow-hidden">
          <img 
            src={seminarData.image} 
            alt={seminarData.title}
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
                  <Badge className={`${getStatusColor(seminarData.status)} text-white`}>
                    {seminarData.status}
                  </Badge>
                  <Badge variant="outline" className="bg-white/20 text-white border-white/50">
                    {seminarData.type}
                  </Badge>
                  {seminarData.featured && (
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      주목
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-4xl font-bold mb-4">{seminarData.title}</h1>
                <p className="text-xl text-gray-200 mb-6">{seminarData.description}</p>
                
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{seminarData.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{seminarData.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{seminarData.participants}/{seminarData.maxParticipants}명</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span>{seminarData.price === 0 ? "무료" : `${seminarData.price.toLocaleString()}원`}</span>
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
                <h2 className="text-2xl font-bold mb-4">행사 개요</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {seminarData.longDescription}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Program */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">프로그램</h2>
                <div className="space-y-6">
                  {seminarData.program.map((day, dayIndex) => (
                    <div key={dayIndex}>
                      <h3 className="text-lg font-semibold text-blue-600 mb-3">{day.day}</h3>
                      <div className="space-y-2">
                        {day.sessions.map((session, sessionIndex) => (
                          <div key={sessionIndex} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-600 min-w-[80px]">
                              {session.time}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">{session.title}</div>
                              {session.speaker && (
                                <div className="text-sm text-gray-600">{session.speaker}</div>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {session.type || "세션"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">참가 혜택</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {seminarData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">자주 묻는 질문</h2>
                <div className="space-y-4">
                  {seminarData.faq.map((item, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-gray-800 mb-2">Q. {item.question}</h3>
                      <p className="text-gray-600">A. {item.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {seminarData.price === 0 ? "무료" : `${seminarData.price.toLocaleString()}원`}
                  </div>
                  <div className="text-sm text-gray-600">참가비</div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">신청 현황</span>
                    <span className="font-semibold">{seminarData.participants}/{seminarData.maxParticipants}명</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(seminarData.participants / seminarData.maxParticipants) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">남은 자리</span>
                    <span className="font-semibold text-blue-600">{seminarData.maxParticipants - seminarData.participants}명</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    지금 신청하기
                  </Button>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      <Heart className="h-4 w-4 mr-2" />
                      관심등록
                    </Button>
                    <Button variant="outline" className="flex-1">
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
                <h3 className="font-semibold mb-4">행사 정보</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">일시</div>
                      <div className="text-gray-600">{seminarData.date}</div>
                      <div className="text-gray-600">{seminarData.startTime} - {seminarData.endTime}</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">장소</div>
                      <div className="text-gray-600">{seminarData.location}</div>
                      <div className="text-gray-600 text-xs">{seminarData.address}</div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium">소요시간</div>
                      <div className="text-gray-600">{seminarData.duration}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">주최기관</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium">{seminarData.organizerInfo.name}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">연락처: {seminarData.organizerInfo.contact}</div>
                    <div className="text-gray-600">이메일: {seminarData.organizerInfo.email}</div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    주최기관 바로가기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">관련 태그</h3>
                <div className="flex flex-wrap gap-2">
                  {seminarData.tags.map((tag, index) => {
                    const colors = [
                      "bg-blue-100 text-blue-800",
                      "bg-green-100 text-green-800", 
                      "bg-purple-100 text-purple-800",
                      "bg-yellow-100 text-yellow-800",
                      "bg-pink-100 text-pink-800"
                    ];
                    return (
                      <Badge key={index} className={`text-xs ${colors[index % colors.length]}`}>
                        {tag}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}