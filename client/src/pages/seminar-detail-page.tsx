import { useParams } from "wouter";
import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, MapPin, Users, Star, Clock, DollarSign, 
  Phone, Mail, FileText, Award, Share2, Heart,
  CheckCircle, User, Building2, Globe
} from "lucide-react";

export default function SeminarDetailPage() {
  const { id } = useParams();
  const [isRegistered, setIsRegistered] = useState(false);

  // Mock seminar data - in real app this would come from API
  const seminarData = {
    id: parseInt(id || "1"),
    title: "2025 한국교육학회 춘계학술대회",
    subtitle: "교육의 미래를 논하는 국내 최대 규모의 교육학회",
    description: "2025년 한국교육학회 춘계학술대회는 '미래 교육의 새로운 패러다임'을 주제로 진행됩니다. 국내외 교육 전문가들이 한자리에 모여 교육의 현재와 미래를 논의하고, 혁신적인 교육 방법론을 공유하는 뜻깊은 자리입니다.",
    date: "2025년 7월 15일(화) ~ 16일(수)",
    time: "09:00 - 18:00",
    location: "서울대학교 교육연구원",
    address: "서울특별시 관악구 관악로 1 서울대학교",
    type: "학회",
    category: "교육학회",
    participants: 500,
    currentRegistered: 342,
    price: 150000,
    earlyBirdPrice: 120000,
    duration: "2일",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    featured: true,
    status: "접수중",
    organizer: "한국교육학회",
    contact: {
      phone: "02-880-7630",
      email: "conference@kera.org",
      website: "www.kera.org"
    },
    tags: ["교육혁신", "미래교육", "정책", "연구발표", "네트워킹"],
    speakers: [
      {
        name: "김교육 교수",
        title: "서울대학교 교육학과",
        topic: "AI 시대의 교육 패러다임 변화",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      {
        name: "이혁신 박사",
        title: "한국교육개발원 연구위원",
        topic: "디지털 네이티브 세대를 위한 교육 방법론",
        image: "https://images.unsplash.com/photo-1494790108755-2616c64e0ce7?w=150&h=150&fit=crop&crop=face"
      },
      {
        name: "박미래 교수",
        title: "연세대학교 교육공학과",
        topic: "메타버스를 활용한 몰입형 학습 환경",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
      }
    ],
    program: [
      {
        day: "1일차 (7/15)",
        sessions: [
          { time: "09:00-09:30", title: "등록 및 접수" },
          { time: "09:30-10:00", title: "개회식 및 환영사" },
          { time: "10:00-11:30", title: "기조강연: AI 시대의 교육 패러다임 변화" },
          { time: "11:30-12:00", title: "휴식" },
          { time: "12:00-13:00", title: "점심식사" },
          { time: "13:00-14:30", title: "세션 1: 디지털 교육혁신 사례" },
          { time: "14:30-14:45", title: "휴식" },
          { time: "14:45-16:15", title: "세션 2: 교육정책 동향 및 전망" },
          { time: "16:15-17:00", title: "패널토론: 미래교육의 방향성" },
          { time: "18:00-20:00", title: "환영 만찬" }
        ]
      },
      {
        day: "2일차 (7/16)",
        sessions: [
          { time: "09:00-10:30", title: "세션 3: 메타버스와 교육의 융합" },
          { time: "10:30-10:45", title: "휴식" },
          { time: "10:45-12:15", title: "세션 4: 개인맞춤형 학습 시스템" },
          { time: "12:15-13:15", title: "점심식사" },
          { time: "13:15-14:45", title: "워크샵: 실무진을 위한 교육기술 활용법" },
          { time: "14:45-15:00", title: "휴식" },
          { time: "15:00-16:30", title: "종합토론 및 결론" },
          { time: "16:30-17:00", title: "폐회식 및 수료증 수여" }
        ]
      }
    ],
    benefits: [
      "교육부 인정 연수 이수증 발급 (15시간)",
      "최신 교육 트렌드 및 연구 동향 습득",
      "국내외 교육 전문가 네트워킹 기회",
      "학회 발표 논문집 및 자료집 제공",
      "우수 연구 발표자 시상 및 인증서"
    ],
    requirements: [
      "교육 관련 분야 종사자 (교사, 교수, 연구원 등)",
      "교육정책 관련 공무원 및 기관 관계자",
      "교육기술 개발 및 서비스 제공자",
      "교육학 관련 대학원생 및 연구자"
    ]
  };

  const handleRegister = () => {
    setIsRegistered(true);
    // Here you would typically make an API call to register the user
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Content */}
          <div className="absolute bottom-8 left-0 right-0">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl text-white">
                <div className="flex items-center space-x-4 mb-4">
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    주목
                  </Badge>
                  <Badge className="bg-green-500 text-white">{seminarData.status}</Badge>
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                    {seminarData.type}
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold mb-2">{seminarData.title}</h1>
                <p className="text-xl text-gray-200 mb-4">{seminarData.subtitle}</p>
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
                    <span>{seminarData.currentRegistered}/{seminarData.participants}명</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="program">프로그램</TabsTrigger>
                <TabsTrigger value="speakers">연사진</TabsTrigger>
                <TabsTrigger value="info">참가안내</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>학회 소개</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {seminarData.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">참가 혜택</h4>
                        <ul className="space-y-2">
                          {seminarData.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">참가 대상</h4>
                        <ul className="space-y-2">
                          {seminarData.requirements.map((req, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <User className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>태그</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {seminarData.tags.map((tag, index) => (
                        <Badge key={index} className={`text-white ${
                          index % 3 === 0 ? 'bg-blue-500 hover:bg-blue-600' :
                          index % 3 === 1 ? 'bg-green-500 hover:bg-green-600' :
                          'bg-purple-500 hover:bg-purple-600'
                        }`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="program" className="space-y-6">
                {seminarData.program.map((day, dayIndex) => (
                  <Card key={dayIndex}>
                    <CardHeader>
                      <CardTitle>{day.day}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {day.sessions.map((session, sessionIndex) => (
                          <div key={sessionIndex} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="w-20 text-sm font-medium text-blue-600 flex-shrink-0">
                              {session.time}
                            </div>
                            <div className="text-sm text-gray-900">
                              {session.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="speakers" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {seminarData.speakers.map((speaker, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <img 
                            src={speaker.image} 
                            alt={speaker.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{speaker.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{speaker.title}</p>
                            <p className="text-sm text-gray-700">{speaker.topic}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="info" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>상세 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">행사 정보</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{seminarData.date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{seminarData.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{seminarData.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <span>{seminarData.address}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">주최기관 연락처</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <span>{seminarData.organizer}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{seminarData.contact.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span>{seminarData.contact.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-gray-500" />
                            <span>{seminarData.contact.website}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Registration Status */}
                  {isRegistered ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-medium text-green-900">신청 완료</h3>
                      <p className="text-sm text-green-700">신청이 완료되었습니다</p>
                    </div>
                  ) : (
                    <>
                      {/* Price */}
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <span className="text-3xl font-bold text-blue-600">
                            {seminarData.earlyBirdPrice.toLocaleString()}원
                          </span>
                          <span className="text-lg text-gray-500 line-through">
                            {seminarData.price.toLocaleString()}원
                          </span>
                        </div>
                        <Badge variant="destructive" className="mb-4">얼리버드 20% 할인</Badge>
                      </div>

                      {/* Registration Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>신청 현황</span>
                          <span>{seminarData.currentRegistered}/{seminarData.participants}명</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(seminarData.currentRegistered / seminarData.participants) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Registration Button */}
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleRegister}
                      >
                        지금 신청하기
                      </Button>
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      찜하기
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      공유
                    </Button>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-3 pt-4 border-t text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">기간</span>
                      <span className="font-medium">{seminarData.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">참가자</span>
                      <span className="font-medium">{seminarData.participants}명</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">카테고리</span>
                      <span className="font-medium">{seminarData.category}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}