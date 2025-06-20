import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CourseDetailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("intro");
  const [isSticky, setIsSticky] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);

  const [courseInfo, setCourseInfo] = useState({
    title: "2025 교육과정 개정안 이해와 적용",
    period: "2025.07.01 - 2025.08.30",
    credit: 3,
    price: 150000,
    discountPrice: 120000,
    discountRate: 20,
    type: "온라인",
    totalHours: 45,
    level: "중급",
    students: 256,
    rating: 4.8,
    reviewCount: 78,
    imageUrl: "/api/placeholder/800/450"
  });

  const [courseIntro, setCourseIntro] = useState({
    description: "2025 교육과정 개정안은 미래 사회가 요구하는 역량을 갖춘 인재를 양성하기 위한 중요한 변화입니다. 본 연수는 교육과정 개정안의 배경과 주요 내용을 체계적으로 이해하고, 이를 학교 현장에 효과적으로 적용할 수 있는 실질적인 방법을 제공합니다.",
    objectives: [
      "2025 교육과정 개정안의 배경과 핵심 내용을 이해한다.",
      "교과별 주요 변화와 특징을 파악하고 적용 방안을 모색한다.",
      "학생 중심의 교육과정 재구성 방법을 습득한다.",
      "과정 중심 평가의 원리를 이해하고 실제 평가 도구를 개발한다.",
      "교육과정 적용 우수 사례를 분석하고 자신의 교육 환경에 맞게 응용한다."
    ],
    features: [
      {
        icon: "fas fa-book-reader",
        title: "최신 교육과정 반영",
        description: "2025 개정 교육과정의 최신 내용을 반영하여 현장에서 바로 적용 가능한 지식 제공"
      },
      {
        icon: "fas fa-users",
        title: "전문가 멘토링",
        description: "교육과정 전문가의 실시간 질의응답과 피드백을 통한 심층적 학습 지원"
      },
      {
        icon: "fas fa-laptop",
        title: "실습 중심 학습",
        description: "이론 학습 후 실제 교육과정 설계 실습을 통한 실무 역량 강화"
      },
      {
        icon: "fas fa-certificate",
        title: "학점 인정",
        description: "교육부 인정 3학점 부여로 교원 자격 갱신 및 승진에 활용 가능"
      }
    ],
    recommendations: [
      "2025 교육과정 개정안에 대한 체계적인 이해가 필요한 교사",
      "학생 중심 수업 설계와 과정 중심 평가 역량을 강화하고 싶은 교사",
      "교육과정 재구성 및 융합 수업 설계에 관심 있는 교사",
      "교육과정 운영 및 학교 교육계획 수립 담당자",
      "교육 행정가 및 장학사"
    ]
  });

  const curriculum = [
    {
      week: 1,
      title: "교육과정 개정의 배경과 방향",
      topics: ["미래 사회 변화와 교육", "2025 개정 교육과정 개요", "국가교육과정의 변천사"],
      duration: "3시간"
    },
    {
      week: 2,
      title: "총론의 주요 내용",
      topics: ["교육과정 구성의 방향", "학교급별 교육목표", "교육과정 편성·운영 지침"],
      duration: "3시간"
    },
    {
      week: 3,
      title: "각론의 주요 변화",
      topics: ["교과별 성격과 목표", "내용 체계와 성취기준", "교수·학습 및 평가 방향"],
      duration: "3시간"
    }
  ];

  const reviews = [
    {
      id: 1,
      author: "김교사",
      rating: 5,
      date: "2025.06.10",
      content: "교육과정 개정안에 대해 체계적으로 이해할 수 있었습니다. 특히 실습 중심의 강의가 매우 도움이 되었습니다.",
      helpful: 12
    },
    {
      id: 2,
      author: "박선생",
      rating: 4,
      date: "2025.06.08",
      content: "전문가의 상세한 설명과 현장 적용 사례가 풍부해서 좋았습니다. 다음 연수도 기대됩니다.",
      helpful: 8
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsSticky(scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleEnrollment = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePayment = () => {
    if (!selectedPaymentMethod || !isAgreed) {
      alert('결제 방법을 선택하고 약관에 동의해주세요.');
      return;
    }
    alert('수강 신청이 완료되었습니다!');
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-blue-600">에듀플랫폼</h1>
              <nav className="hidden md:flex space-x-6">
                <a href="/" className="text-gray-600 hover:text-blue-600">홈</a>
                <a href="/training" className="text-gray-600 hover:text-blue-600">연수 프로그램</a>
                <a href="/courses" className="text-blue-600 font-medium">교육과정</a>
                <a href="/seminars" className="text-gray-600 hover:text-blue-600">세미나</a>
                <a href="/notices" className="text-gray-600 hover:text-blue-600">공지사항</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  {isEditMode ? "편집 완료" : "편집"}
                </Button>
              )}
              <Button variant="outline">로그인</Button>
              <Button>회원가입</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Course Header */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <Badge className="bg-blue-100 text-blue-600 mb-2">{courseInfo.type}</Badge>
                <Badge variant="outline">{courseInfo.level}</Badge>
              </div>
              
              {isEditMode ? (
                <Input
                  value={courseInfo.title}
                  onChange={(e) => setCourseInfo({...courseInfo, title: e.target.value})}
                  className="text-3xl font-bold mb-4"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{courseInfo.title}</h1>
              )}
              
              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center">
                  <i className="fas fa-star text-yellow-500 mr-1"></i>
                  <span className="font-medium">{courseInfo.rating}</span>
                  <span className="ml-1">({courseInfo.reviewCount}개 리뷰)</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-users text-gray-400 mr-1"></i>
                  <span>{courseInfo.students}명 수강</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-clock text-gray-400 mr-1"></i>
                  <span>{courseInfo.totalHours}시간</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-calendar text-gray-400 mr-1"></i>
                  <span>{courseInfo.period}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <img 
                src={courseInfo.imageUrl} 
                alt={courseInfo.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Navigation */}
      <div className={`bg-white border-b ${isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-md' : ''}`}>
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start bg-transparent">
              <TabsTrigger value="intro" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-600">
                과정 소개
              </TabsTrigger>
              <TabsTrigger value="curriculum" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-600">
                커리큘럼
              </TabsTrigger>
              <TabsTrigger value="instructor" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-600">
                강사 소개
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-600">
                수강 후기
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Course Introduction */}
              <TabsContent value="intro" className="space-y-8">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">과정 설명</h3>
                  {isEditMode ? (
                    <Textarea
                      value={courseIntro.description}
                      onChange={(e) => setCourseIntro({...courseIntro, description: e.target.value})}
                      className="min-h-[150px]"
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{courseIntro.description}</p>
                  )}
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">학습 목표</h3>
                  <ul className="space-y-2">
                    {courseIntro.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <i className="fas fa-check-circle text-blue-600 mr-3 mt-1"></i>
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6">과정 특징</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courseIntro.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className={`${feature.icon} text-blue-600`}></i>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">{feature.title}</h4>
                          <p className="text-gray-600 text-sm">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">추천 대상</h3>
                  <ul className="space-y-2">
                    {courseIntro.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <i className="fas fa-user-check text-green-600 mr-3 mt-1"></i>
                        <span className="text-gray-700">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </TabsContent>

              {/* Curriculum */}
              <TabsContent value="curriculum" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6">주차별 커리큘럼</h3>
                  <div className="space-y-6">
                    {curriculum.map((week) => (
                      <div key={week.week} className="border-l-4 border-blue-600 pl-6">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">
                            {week.week}주차: {week.title}
                          </h4>
                          <Badge variant="outline">{week.duration}</Badge>
                        </div>
                        <ul className="space-y-1">
                          {week.topics.map((topic, index) => (
                            <li key={index} className="text-gray-600">
                              • {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* Instructor */}
              <TabsContent value="instructor" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6">강사 소개</h3>
                  <div className="flex items-start space-x-6">
                    <Avatar className="w-24 h-24">
                      <img src="/api/placeholder/150/150" alt="강사" />
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2">김교육 교수</h4>
                      <p className="text-gray-600 mb-4">서울대학교 교육학과</p>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>• 교육과정 및 교육평가 전문가</p>
                        <p>• 교육부 교육과정 심의위원</p>
                        <p>• 15년간 교육과정 연구 및 컨설팅 경험</p>
                        <p>• 저서: 『미래 교육과정의 방향』, 『학생 중심 교육과정 설계』</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Reviews */}
              <TabsContent value="reviews" className="space-y-6">
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">수강 후기 ({reviews.length})</h3>
                    <Button>후기 작성</Button>
                  </div>
                  
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium">{review.author}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`fas fa-star text-sm ${
                                    i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                                  }`}
                                ></i>
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-700 mb-3">{review.content}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <button className="flex items-center hover:text-blue-600">
                            <i className="fas fa-thumbs-up mr-1"></i>
                            도움됨 ({review.helpful})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {courseInfo.discountRate > 0 && (
                    <>
                      <span className="text-2xl font-bold text-red-500">
                        {courseInfo.discountPrice.toLocaleString()}원
                      </span>
                      <Badge className="bg-red-500">{courseInfo.discountRate}% 할인</Badge>
                    </>
                  )}
                </div>
                {courseInfo.discountRate > 0 && (
                  <span className="text-gray-500 line-through">
                    {courseInfo.price.toLocaleString()}원
                  </span>
                )}
              </div>

              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">수강 기간</span>
                  <span className="font-medium">{courseInfo.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 학습시간</span>
                  <span className="font-medium">{courseInfo.totalHours}시간</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">학점</span>
                  <span className="font-medium">{courseInfo.credit}학점</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">수강 방식</span>
                  <span className="font-medium">{courseInfo.type}</span>
                </div>
              </div>

              <Button 
                className="w-full mb-4 bg-blue-600 hover:bg-blue-700"
                onClick={handleEnrollment}
              >
                <i className="fas fa-shopping-cart mr-2"></i>
                수강 신청하기
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <i className="fas fa-heart mr-1"></i>
                  찜하기
                </Button>
                <Button variant="outline" size="sm">
                  <i className="fas fa-share mr-1"></i>
                  공유하기
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>수강 신청</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">{courseInfo.title}</h4>
              <div className="flex justify-between text-sm">
                <span>수강료</span>
                <span className="font-medium">
                  {courseInfo.discountPrice.toLocaleString()}원
                </span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">결제 방법</Label>
              <Select onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="결제 방법을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">신용카드</SelectItem>
                  <SelectItem value="bank">계좌이체</SelectItem>
                  <SelectItem value="kakao">카카오페이</SelectItem>
                  <SelectItem value="naver">네이버페이</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="agree"
                checked={isAgreed}
                onCheckedChange={setIsAgreed}
              />
              <Label htmlFor="agree" className="text-sm">
                이용약관 및 결제 진행에 동의합니다
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handlePayment}>
              {courseInfo.discountPrice.toLocaleString()}원 결제하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetailPage;