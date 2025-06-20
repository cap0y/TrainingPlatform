import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Users, Award, Star, ArrowRight, Calendar, MapPin, Phone, Mail, 
  MessageCircle, HelpCircle, FileText, Settings, Eye, Zap, Target, Globe,
  TrendingUp, CheckCircle, Bell, Headphones
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CourseCard from "@/components/course-card";
import ChatWidget from "@/components/chat-widget";
import NotificationPanel from "@/components/notification-panel";

interface Course {
  id: number;
  title: string;
  description: string;
  instructor?: string;
  duration?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  rating?: number;
  students?: number;
}

interface Notice {
  id: number;
  title: string;
  category: string;
  createdAt: string;
}

export default function HomePage() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("popular");

  const { data: coursesData, isLoading: coursesLoading } = useQuery<{ courses: Course[]; total: number }>({
    queryKey: ["/api/courses"],
  });

  const { data: noticesData, isLoading: noticesLoading } = useQuery<{ notices: Notice[] }>({
    queryKey: ["/api/notices"],
  });

  return (
    <div className="min-h-screen bg-white">
      <Header onNotificationClick={() => setShowNotifications(true)} />
      {/* Hero Section with Integrated Slideshow */}
      <section className="relative overflow-hidden">
        {/* Hero Content Overlay */}
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <div className="relative z-20 container mx-auto px-4 py-12 pt-[80px] pb-[80px]">
          <div className="max-w-2xl text-left text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              전문가가 되는 <span className="text-yellow-300">첫걸음</span>
            </h1>
            <p className="text-lg md:text-xl mb-6 text-gray-100 leading-relaxed">
              지누켐과 함께하는 체계적인 연수 프로그램으로<br />
              여러분의 전문성을 한 단계 높여보세요
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/courses">
                <Button size="md" className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 text-base font-semibold">
                  <BookOpen className="h-4 w-4 mr-2" />
                  연수과정 보기
                </Button>
              </Link>
              <Link href="/seminars">
                <Button size="md" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3 text-base font-semibold">
                  세미나 신청
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background Slideshow */}
        <div className="absolute inset-0 z-0">
          <div className="relative overflow-hidden h-full">
            <div className="flex animate-slide h-screen">
              {/* Slide 1 - 교육과정 개정안 */}
              <div className="min-w-full relative h-full bg-gradient-to-r from-transparent via-blue-600 to-transparent">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex justify-center items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop" 
                    alt="교육과정 개정안 이해와 적용"
                    className="max-w-2xl max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-8">
                    <div className="max-w-2xl text-white">
                      <h3 className="text-4xl font-bold mb-4">2025 교육과정 개정안 이해와 적용</h3>
                      <p className="text-xl mb-6 text-blue-100">새로운 교육과정의 핵심 내용과 현장 적용 방안을 체계적으로 학습하세요</p>
                      <div className="flex space-x-4">
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">교육정책</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">15시간</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">1,250명 수강</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 2 - 디지털 교수법 */}
              <div className="min-w-full relative h-full bg-gradient-to-r from-transparent via-green-600 to-transparent">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex justify-center items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop" 
                    alt="디지털 교수법 심화과정"
                    className="max-w-2xl max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-8">
                    <div className="max-w-2xl text-white">
                      <h3 className="text-4xl font-bold mb-4">디지털 교수법 심화과정</h3>
                      <p className="text-xl mb-6 text-green-100">온라인과 오프라인을 연계한 효과적인 디지털 교육 방법론을 습득하세요</p>
                      <div className="flex space-x-4">
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">교수법</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">20시간</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">980명 수강</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 3 - AI 교육혁신 */}
              <div className="min-w-full relative h-full bg-gradient-to-r from-transparent via-purple-600 to-transparent">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex justify-center items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop" 
                    alt="AI 시대의 교육 혁신"
                    className="max-w-2xl max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-8">
                    <div className="max-w-2xl text-white">
                      <h3 className="text-4xl font-bold mb-4">AI 시대의 교육 혁신</h3>
                      <p className="text-xl mb-6 text-purple-100">인공지능 기술을 활용한 미래 교육의 새로운 패러다임을 탐구하세요</p>
                      <div className="flex space-x-4">
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">교육기술</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">25시간</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">750명 수강</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 4 - 평가방법 개선 */}
              <div className="min-w-full relative h-full bg-gradient-to-r from-transparent via-orange-600 to-transparent">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex justify-center items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop" 
                    alt="창의적 평가방법 개발"
                    className="max-w-2xl max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-8">
                    <div className="max-w-2xl text-white">
                      <h3 className="text-4xl font-bold mb-4">창의적 평가방법 개발</h3>
                      <p className="text-xl mb-6 text-orange-100">학습자 중심의 다양한 평가 도구와 방법론을 개발하고 적용하세요</p>
                      <div className="flex space-x-4">
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">평가방법</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">18시간</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">620명 수강</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 5 - 학습자 중심 교육 */}
              <div className="min-w-full relative h-full bg-gradient-to-r from-transparent via-red-600 to-transparent">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex justify-center items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop" 
                    alt="학습자 중심 교육방법론"
                    className="max-w-2xl max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-8">
                    <div className="max-w-2xl text-white">
                      <h3 className="text-4xl font-bold mb-4">학습자 중심 교육방법론</h3>
                      <p className="text-xl mb-6 text-red-100">개별 학습자의 특성을 고려한 맞춤형 교육 전략을 수립하세요</p>
                      <div className="flex space-x-4">
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">교수학습</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">22시간</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">890명 수강</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 6 - 창의융합교육 */}
              <div className="min-w-full relative h-full bg-gradient-to-r from-transparent via-indigo-600 to-transparent">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex justify-center items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop" 
                    alt="창의융합교육 실무과정"
                    className="max-w-2xl max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-8">
                    <div className="max-w-2xl text-white">
                      <h3 className="text-4xl font-bold mb-4">창의융합교육 실무과정</h3>
                      <p className="text-xl mb-6 text-indigo-100">교과간 융합과 창의적 사고력 향상을 위한 실무 중심 교육과정</p>
                      <div className="flex space-x-4">
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">창의교육</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">16시간</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">540명 수강</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 7 - 다문화교육 */}
              <div className="min-w-full relative h-full bg-gradient-to-r from-transparent via-teal-600 to-transparent">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex justify-center items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop" 
                    alt="다문화교육 전문가과정"
                    className="max-w-2xl max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-8">
                    <div className="max-w-2xl text-white">
                      <h3 className="text-4xl font-bold mb-4">다문화교육 전문가과정</h3>
                      <p className="text-xl mb-6 text-teal-100">글로벌 시대에 맞는 다문화 감수성과 교육 역량을 기르세요</p>
                      <div className="flex space-x-4">
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">다문화교육</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">20시간</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">430명 수강</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 8 - 특수교육 */}
              <div className="min-w-full relative h-full bg-gradient-to-r from-transparent via-pink-600 to-transparent">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex justify-center items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop" 
                    alt="특수교육 지원 전문과정"
                    className="max-w-2xl max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-8">
                    <div className="max-w-2xl text-white">
                      <h3 className="text-4xl font-bold mb-4">특수교육 지원 전문과정</h3>
                      <p className="text-xl mb-6 text-pink-100">특별한 교육적 요구를 가진 학습자를 위한 전문적 지원 방법을 학습하세요</p>
                      <div className="flex space-x-4">
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">특수교육</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">24시간</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">380명 수강</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 9 - 진로진학상담 */}
              <div className="min-w-full relative h-full bg-gradient-to-r from-transparent via-cyan-600 to-transparent">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex justify-center items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&h=600&fit=crop" 
                    alt="진로진학상담 전문과정"
                    className="max-w-2xl max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-8">
                    <div className="max-w-2xl text-white">
                      <h3 className="text-4xl font-bold mb-4">진로진학상담 전문과정</h3>
                      <p className="text-xl mb-6 text-cyan-100">학생들의 미래 설계를 돕는 전문적인 상담 기법과 진로 지도 방법을 익히세요</p>
                      <div className="flex space-x-4">
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">진로상담</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">18시간</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">720명 수강</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 10 - 학교안전교육 */}
              <div className="min-w-full relative h-full bg-gradient-to-r from-transparent via-yellow-600 to-transparent">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 flex justify-center items-center">
                  <img 
                    src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&h=600&fit=crop" 
                    alt="학교안전교육 관리자과정"
                    className="max-w-2xl max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-8">
                    <div className="max-w-2xl text-white">
                      <h3 className="text-4xl font-bold mb-4">학교안전교육 관리자과정</h3>
                      <p className="text-xl mb-6 text-yellow-100">안전한 교육환경 조성을 위한 체계적인 안전관리 방안을 수립하세요</p>
                      <div className="flex space-x-4">
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">안전교육</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">12시간</span>
                        <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm">950명 수강</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Slide indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-white bg-opacity-50 hover:bg-opacity-100 transition-opacity cursor-pointer"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Categories Section with Circular Images */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">교육 분야</h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 max-w-4xl">
              <Link href="/training-courses?category=법정의무교육">
                <div className="text-center group cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=center" 
                      alt="법정의무교육"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm group-hover:text-blue-600 transition-colors">법정교육</div>
                </div>
              </Link>

              <Link href="/professional-development">
                <div className="text-center group cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=120&h=120&fit=crop&crop=center" 
                      alt="전문성강화교육"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-purple-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm group-hover:text-purple-600 transition-colors">전문성강화</div>
                </div>
              </Link>

              <Link href="/certificate-courses">
                <div className="text-center group cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&h=120&fit=crop&crop=center" 
                      alt="자격증과정"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-green-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm group-hover:text-green-600 transition-colors">자격증</div>
                </div>
              </Link>

              <Link href="/seminars">
                <div className="text-center group cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=120&h=120&fit=crop&crop=center" 
                      alt="세미나"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-yellow-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm group-hover:text-yellow-600 transition-colors">세미나</div>
                </div>
              </Link>

              <Link href="/study-abroad">
                <div className="text-center group cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=120&h=120&fit=crop&crop=center" 
                      alt="해외연수"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-red-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm group-hover:text-red-600 transition-colors">해외연수</div>
                </div>
              </Link>

              <Link href="/help">
                <div className="text-center group cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1553484771-371a605b060b?w=120&h=120&fit=crop&crop=center" 
                      alt="고객센터"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-indigo-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">고객센터</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Popular Courses with Tabs */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">인기 연수과정</h2>
              <p className="text-gray-600">실시간으로 업데이트되는 인기 연수과정을 확인해보세요</p>
            </div>
            <Link href="/courses">
              <Button variant="outline" size="lg">전체 과정 보기</Button>
            </Link>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="popular" className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>실시간 인기</span>
                </TabsTrigger>
                <TabsTrigger value="category" className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>분야별 인기</span>
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>신규 과정</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="popular" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: 1,
                    title: "2025 교육과정 개정안 이해와 적용",
                    category: "교육정책",
                    students: 1250,
                    rating: 4.8,
                    price: "120,000원",
                    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop",
                    trending: true
                  },
                  {
                    id: 2,
                    title: "디지털 교수법 심화과정",
                    category: "교수법",
                    students: 980,
                    rating: 4.9,
                    price: "150,000원",
                    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&h=200&fit=crop",
                    trending: true
                  },
                  {
                    id: 3,
                    title: "AI 시대의 교육 혁신",
                    category: "교육기술",
                    students: 750,
                    rating: 4.7,
                    price: "180,000원",
                    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop",
                    trending: true
                  }
                ].map((course) => (
                  <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <img src={course.image} alt={course.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                      {course.trending && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-red-500 text-white">
                            <Zap className="h-3 w-3 mr-1" />
                            HOT
                          </Badge>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge variant="outline" className="bg-white/90">{course.category}</Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{course.students}명</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{course.rating}</span>
                          </div>
                        </div>
                        <span className="font-semibold text-blue-600">{course.price}</span>
                      </div>
                      <Button className="w-full">수강신청</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="category" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { category: "교육정책", count: 45, color: "bg-blue-500" },
                  { category: "교수법", count: 38, color: "bg-green-500" },
                  { category: "교육기술", count: 32, color: "bg-purple-500" },
                  { category: "평가방법", count: 28, color: "bg-orange-500" }
                ].map((item) => (
                  <Card key={item.category} className="p-6 text-center hover:shadow-lg transition-shadow">
                    <div className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.category}</h3>
                    <p className="text-gray-600 mb-4">{item.count}개 과정</p>
                    <Button variant="outline" size="sm">보기</Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: "메타버스 교육 플랫폼 활용법",
                    date: "2025.08.15 개설 예정",
                    description: "차세대 교육 기술인 메타버스를 활용한 혁신적인 교육 방법론을 학습합니다.",
                    image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=300&h=200&fit=crop"
                  },
                  {
                    title: "블록체인 기반 학습 관리 시스템",
                    date: "2025.09.01 개설 예정", 
                    description: "블록체인 기술을 교육 분야에 적용하는 최신 트렌드와 실무 활용법을 다룹니다.",
                    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300&h=200&fit=crop"
                  }
                ].map((course, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="md:flex">
                      <img src={course.image} alt={course.title} className="w-full md:w-48 h-48 md:h-32 object-cover" />
                      <CardContent className="p-4 flex-1">
                        <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                        <p className="text-sm text-blue-600 font-medium">{course.date}</p>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      {/* Upcoming Seminars & Conferences */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">다가오는 학회 및 세미나</h2>
              <p className="text-gray-600">최신 트렌드와 실무 노하우를 공유하는 전문가 세미나</p>
            </div>
            <Link href="/seminars">
              <Button size="lg" variant="outline">모든 학회 및 세미나 보기</Button>
            </Link>
          </div>

          {/* Seminar Categories */}
          <div className="flex justify-center mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-3xl">
              <div className="text-center group cursor-pointer">
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=120&h=120&fit=crop&crop=center"
                    alt="교육학회"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm group-hover:text-blue-600 transition-colors">교육학회</div>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=120&h=120&fit=crop&crop=center"
                    alt="AI 컨퍼런스"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-purple-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm group-hover:text-purple-600 transition-colors">AI 컨퍼런스</div>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&h=120&fit=crop&crop=center"
                    alt="워크샵"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-green-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm group-hover:text-green-600 transition-colors">워크샵</div>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1559223607-a43c3004071b?w=120&h=120&fit=crop&crop=center"
                    alt="심포지엄"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-orange-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm group-hover:text-orange-600 transition-colors">심포지엄</div>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=120&h=120&fit=crop&crop=center"
                    alt="국제행사"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-red-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm group-hover:text-red-600 transition-colors">국제행사</div>
              </div>

              <div className="text-center group cursor-pointer">
                <div className="relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src="https://images.unsplash.com/photo-1552581234-26160f608093?w=120&h=120&fit=crop&crop=center"
                    alt="온라인세미나"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-indigo-600 bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
                </div>
                <div className="font-medium text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">온라인세미나</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              {
                id: 1,
                title: "2025 한국교육학회 춘계학술대회",
                date: "2025.07.15-16",
                location: "서울대학교",
                type: "학회",
                participants: 500,
                image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop",
                featured: true
              },
              {
                id: 2,
                title: "디지털 교육혁신 국제 컨퍼런스",
                date: "2025.08.10",
                location: "온라인",
                type: "컨퍼런스",
                participants: 1200,
                image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=200&fit=crop",
                featured: true
              },
              {
                id: 3,
                title: "AI와 교육의 미래 심포지엄",
                date: "2025.08.25",
                location: "COEX",
                type: "심포지엄",
                participants: 300,
                image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop",
                featured: false
              }
            ].map((event) => (
              <Card key={event.id} className={`group hover:shadow-lg transition-all duration-300 overflow-hidden ${event.featured ? 'border-2 border-yellow-400' : ''}`}>
                <div className="relative">
                  <img src={event.image} alt={event.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                  {event.featured && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        주목
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-white/90">{event.type}</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3 group-hover:text-blue-600 transition-colors">{event.title}</h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{event.participants}명 예상</span>
                    </div>
                  </div>
                  <Button className="w-full" variant={event.featured ? "default" : "outline"}>
                    {event.featured ? "사전등록" : "관심등록"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>


        </div>
      </section>
      {/* Notice Section */}
      <section className="py-12 bg-white pt-[0px] pb-[0px]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">공지사항</h2>
              <p className="text-gray-600">중요한 공지사항과 업데이트 소식을 확인하세요</p>
            </div>
            <Link href="/notices">
              <Button variant="outline" size="lg">더보기</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Notice List */}
            <Card className="p-6 bg-white">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <span>최신 공지사항</span>
                </CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {[
                  { type: "공지", title: "2025년 하계 연수 일정 안내", date: "2025.06.15", urgent: true },
                  { type: "안내", title: "교육부 인정 연수 과정 업데이트 안내", date: "2025.06.10", urgent: false },
                  { type: "공지", title: "연수 플랫폼 서비스 개선 안내", date: "2025.06.05", urgent: true },
                  { type: "안내", title: "하계 휴원 참가 신청 마감 연장", date: "2025.06.01", urgent: false }
                ].map((notice, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        notice.urgent 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {notice.type}
                      </span>
                      <span className="text-sm font-medium">{notice.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{notice.date}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Customer Service Center */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="flex items-center justify-center space-x-2 text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <Headphones className="h-6 w-6 text-white" />
                  </div>
                </CardTitle>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">연수 상담 센터</h3>
                  <p className="text-sm text-gray-600 mb-4">평일 09:00 - 18:00 (점심시간 12:00 - 13:00)</p>
                </div>
              </CardHeader>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">전화 문의</div>
                    <div className="font-semibold text-gray-900">02-1234-5678</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">이메일 문의</div>
                    <div className="font-semibold text-gray-900">support@eduplatform.kr</div>
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  실시간 상담 시작하기
                </Button>

                <Button variant="outline" className="w-full">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  자주 묻는 질문 FAQ
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
      <ChatWidget />
      {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
    </div>
  );
}