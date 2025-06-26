import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";

const TrainingApplicationPage: React.FC = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("card");
  const [termsAgreed, setTermsAgreed] = useState<{ [key: string]: boolean }>({
    terms1: false,
    terms2: false,
    terms3: false,
    marketing: false,
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    position: "",
    experience: "",
    message: "",
  });
  const [formProgress, setFormProgress] = useState(0);

  // 프로그램 상세 정보
  const program = {
    id: 1,
    title: "미국 실리콘밸리 IT 기업 탐방 프로그램",
    category: "해외연수",
    duration: "2주",
    startDate: "2025년 8월 15일",
    endDate: "2025년 8월 29일",
    location: "미국 캘리포니아 실리콘밸리",
    credits: 3,
    students: 245,
    maxStudents: 30,
    rating: 4.8,
    price: 2800000,
    discountPrice: 2520000,
    applicationDeadline: "2025년 7월 15일",
    image: "/api/placeholder/1200/600",
    description:
      "실리콘밸리의 대표적인 IT 기업들을 방문하고 현지 전문가들의 강연을 통해 글로벌 IT 트렌드와 혁신 사례를 직접 체험하는 프로그램입니다.",
    highlights: [
      "실리콘밸리 주요 IT 기업 방문 (구글, 애플, 메타, 테슬라 등)",
      "현지 스타트업 인큐베이터 및 액셀러레이터 탐방",
      "IT 분야 전문가 특강 및 네트워킹 세션",
      "스탠포드 대학교 캠퍼스 투어 및 강의 참관",
      "현지 IT 전문가와의 멘토링 세션",
      "팀 프로젝트 진행 및 발표",
    ],
    schedule: [
      {
        day: "1일차",
        activities: [
          "인천국제공항 출발",
          "샌프란시스코 국제공항 도착",
          "숙소 체크인 및 오리엔테이션",
        ],
      },
      {
        day: "2-3일차",
        activities: [
          "구글 본사 방문",
          "구글 엔지니어와의 Q&A 세션",
          "팀 빌딩 워크숍",
        ],
      },
      {
        day: "4-5일차",
        activities: [
          "애플 캠퍼스 투어",
          "애플 디자인 철학 특강",
          "UX/UI 워크숍",
        ],
      },
      {
        day: "8-9일차",
        activities: [
          "테슬라 공장 견학",
          "자율주행 기술 시연",
          "미래 모빌리티 토론",
        ],
      },
      {
        day: "14일차",
        activities: ["최종 프로젝트 발표", "수료식", "샌프란시스코 관광"],
      },
      {
        day: "15일차",
        activities: ["샌프란시스코 국제공항 출발", "인천국제공항 도착"],
      },
    ],
    instructors: [
      {
        name: "김민석 교수",
        position: "서울대학교 컴퓨터공학과",
        image: "/api/placeholder/200/200",
        experience: "15년간 실리콘밸리 연구 경험, 前 구글 선임연구원",
      },
      {
        name: "Sarah Johnson",
        position: "스탠포드대학교 경영학과",
        image: "/api/placeholder/200/200",
        experience: "실리콘밸리 스타트업 생태계 전문가, 現 Y Combinator 멘토",
      },
    ],
  };

  const updateProgress = () => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(
      (value) => value.trim() !== "",
    ).length;
    const progress = Math.round((filledFields / totalFields) * 100);
    setFormProgress(progress);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    updateProgress();
  };

  const handleTermsChange = (term: string, checked: boolean) => {
    setTermsAgreed((prev) => ({
      ...prev,
      [term]: checked,
    }));
  };

  const handleSubmit = () => {
    // 필수 약관 동의 확인
    if (!termsAgreed.terms1 || !termsAgreed.terms2 || !termsAgreed.terms3) {
      alert("필수 약관에 동의해주세요.");
      return;
    }

    // 필수 정보 입력 확인
    if (!formData.name || !formData.email || !formData.phone) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    alert("신청이 완료되었습니다. 확인 이메일을 발송해드렸습니다.");
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원";
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
                <a href="/" className="text-gray-600 hover:text-blue-600">
                  홈
                </a>
                <a href="/training" className="text-blue-600 font-medium">
                  연수 프로그램
                </a>
                <a
                  href="/courses"
                  className="text-gray-600 hover:text-blue-600"
                >
                  교육과정
                </a>
                <a
                  href="/seminars"
                  className="text-gray-600 hover:text-blue-600"
                >
                  세미나
                </a>
                <a
                  href="/notices"
                  className="text-gray-600 hover:text-blue-600"
                >
                  공지사항
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">로그인</Button>
              <Button>회원가입</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">프로그램 신청</h2>
            <span className="text-sm text-gray-600">{formProgress}% 완료</span>
          </div>
          <Progress value={formProgress} className="w-full" />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content - Application Form */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">프로그램 정보</TabsTrigger>
                <TabsTrigger value="application">신청 정보</TabsTrigger>
                <TabsTrigger value="payment">결제</TabsTrigger>
              </TabsList>

              {/* 프로그램 정보 */}
              <TabsContent value="info" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <Badge className="bg-blue-100 text-blue-600">
                        {program.category}
                      </Badge>
                      <Badge variant="outline">{program.duration}</Badge>
                      <Badge variant="outline">{program.credits}학점</Badge>
                    </div>
                    <CardTitle className="text-2xl">{program.title}</CardTitle>
                    <CardDescription className="text-base">
                      {program.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-64 object-cover rounded-lg mb-6"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <i className="fas fa-calendar-alt text-blue-600 mr-3"></i>
                          <div>
                            <p className="font-medium">프로그램 기간</p>
                            <p className="text-gray-600">
                              {program.startDate} ~ {program.endDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-map-marker-alt text-blue-600 mr-3"></i>
                          <div>
                            <p className="font-medium">장소</p>
                            <p className="text-gray-600">{program.location}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <i className="fas fa-users text-blue-600 mr-3"></i>
                          <div>
                            <p className="font-medium">모집 현황</p>
                            <p className="text-gray-600">
                              {program.students}/{program.maxStudents}명
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-clock text-blue-600 mr-3"></i>
                          <div>
                            <p className="font-medium">신청 마감</p>
                            <p className="text-gray-600">
                              {program.applicationDeadline}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 프로그램 하이라이트 */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">
                        프로그램 하이라이트
                      </h4>
                      <ul className="space-y-2">
                        {program.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start">
                            <i className="fas fa-check text-green-600 mr-3 mt-1"></i>
                            <span className="text-gray-700">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 일정 */}
                    <div>
                      <h4 className="font-semibold mb-3">세부 일정</h4>
                      <Accordion type="single" collapsible className="w-full">
                        {program.schedule.map((item, index) => (
                          <AccordionItem key={index} value={`day-${index}`}>
                            <AccordionTrigger>{item.day}</AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-1">
                                {item.activities.map((activity, actIndex) => (
                                  <li key={actIndex} className="text-gray-600">
                                    • {activity}
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </CardContent>
                </Card>

                {/* 강사 소개 */}
                <Card>
                  <CardHeader>
                    <CardTitle>강사 소개</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {program.instructors.map((instructor, index) => (
                        <div key={index} className="flex space-x-4">
                          <img
                            src={instructor.image}
                            alt={instructor.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div>
                            <h5 className="font-semibold">{instructor.name}</h5>
                            <p className="text-blue-600 text-sm">
                              {instructor.position}
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                              {instructor.experience}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 신청 정보 */}
              <TabsContent value="application" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>개인 정보</CardTitle>
                    <CardDescription>
                      신청자의 기본 정보를 입력해주세요.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">이름 *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          placeholder="홍길동"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">이메일 *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder="example@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">연락처 *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          placeholder="010-1234-5678"
                        />
                      </div>
                      <div>
                        <Label htmlFor="organization">소속 기관</Label>
                        <Input
                          id="organization"
                          value={formData.organization}
                          onChange={(e) =>
                            handleInputChange("organization", e.target.value)
                          }
                          placeholder="회사명 또는 학교명"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="position">직책/전공</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) =>
                          handleInputChange("position", e.target.value)
                        }
                        placeholder="개발자, 학생, 연구원 등"
                      />
                    </div>

                    <div>
                      <Label htmlFor="experience">관련 경험</Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e) =>
                          handleInputChange("experience", e.target.value)
                        }
                        placeholder="IT 관련 경험이나 배경을 간단히 설명해주세요"
                        className="min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">참가 동기 및 기대효과</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) =>
                          handleInputChange("message", e.target.value)
                        }
                        placeholder="이 프로그램에 참가하고자 하는 이유와 기대하는 바를 작성해주세요"
                        className="min-h-[120px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 약관 동의 */}
                <Card>
                  <CardHeader>
                    <CardTitle>약관 동의</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms1"
                          checked={termsAgreed.terms1}
                          onCheckedChange={(checked) =>
                            handleTermsChange("terms1", !!checked)
                          }
                        />
                        <Label htmlFor="terms1" className="cursor-pointer">
                          이용약관에 동의합니다 (필수)
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms2"
                          checked={termsAgreed.terms2}
                          onCheckedChange={(checked) =>
                            handleTermsChange("terms2", !!checked)
                          }
                        />
                        <Label htmlFor="terms2" className="cursor-pointer">
                          개인정보 수집 및 이용에 동의합니다 (필수)
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms3"
                          checked={termsAgreed.terms3}
                          onCheckedChange={(checked) =>
                            handleTermsChange("terms3", !!checked)
                          }
                        />
                        <Label htmlFor="terms3" className="cursor-pointer">
                          해외여행 약관에 동의합니다 (필수)
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="marketing"
                          checked={termsAgreed.marketing}
                          onCheckedChange={(checked) =>
                            handleTermsChange("marketing", !!checked)
                          }
                        />
                        <Label htmlFor="marketing" className="cursor-pointer">
                          마케팅 정보 수신에 동의합니다 (선택)
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 결제 */}
              <TabsContent value="payment" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>결제 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 결제 금액 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span>프로그램 비용</span>
                        <span>{formatPrice(program.price)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2 text-red-600">
                        <span>할인 금액</span>
                        <span>
                          -{formatPrice(program.price - program.discountPrice)}
                        </span>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>총 결제 금액</span>
                        <span className="text-blue-600">
                          {formatPrice(program.discountPrice)}
                        </span>
                      </div>
                    </div>

                    {/* 결제 방법 */}
                    <div>
                      <Label className="text-base font-medium mb-4 block">
                        결제 방법
                      </Label>
                      <RadioGroup
                        value={selectedPaymentMethod}
                        onValueChange={setSelectedPaymentMethod}
                      >
                        <div className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value="card" id="card" />
                          <Label
                            htmlFor="card"
                            className="cursor-pointer flex items-center"
                          >
                            <i className="fas fa-credit-card text-blue-600 mr-2"></i>
                            신용카드
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value="transfer" id="transfer" />
                          <Label
                            htmlFor="transfer"
                            className="cursor-pointer flex items-center"
                          >
                            <i className="fas fa-university text-green-600 mr-2"></i>
                            계좌이체
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value="kakao" id="kakao" />
                          <Label
                            htmlFor="kakao"
                            className="cursor-pointer flex items-center"
                          >
                            <i className="fas fa-comment text-yellow-500 mr-2"></i>
                            카카오페이
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* 환불 정책 */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2">
                        환불 정책
                      </h5>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• 출발 30일 전: 100% 환불</li>
                        <li>• 출발 14일 전: 70% 환불</li>
                        <li>• 출발 7일 전: 50% 환불</li>
                        <li>• 출발 당일: 환불 불가</li>
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleSubmit}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    >
                      <i className="fas fa-credit-card mr-2"></i>
                      {formatPrice(program.discountPrice)} 결제하기
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>신청 요약</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-medium mb-2">{program.title}</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>기간</span>
                      <span>{program.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>학점</span>
                      <span>{program.credits}학점</span>
                    </div>
                    <div className="flex justify-between">
                      <span>정원</span>
                      <span>{program.maxStudents}명</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>신청 진행률</span>
                    <span>{formProgress}%</span>
                  </div>
                  <Progress value={formProgress} className="w-full" />
                </div>

                <Separator />

                <div>
                  <div className="flex justify-between mb-2">
                    <span>프로그램 비용</span>
                    <span>{formatPrice(program.price)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 mb-2">
                    <span>할인 금액</span>
                    <span>
                      -{formatPrice(program.price - program.discountPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>총 결제 금액</span>
                    <span className="text-blue-600">
                      {formatPrice(program.discountPrice)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrainingApplicationPage;
