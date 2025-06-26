import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

const SeminarsListPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    phone: "",
    email: "",
    participantType: "regular",
    paymentMethod: "creditCard",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }

    if (!formData.organization.trim()) {
      newErrors.organization = "소속을 입력해주세요.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "연락처를 입력해주세요.";
    } else if (!/^\d{3}-\d{3,4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = "올바른 연락처 형식이 아닙니다. (예: 010-1234-5678)";
    }

    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "개인정보 수집 및 이용에 동의해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      alert("신청이 완료되었습니다.");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const formattedPhone = formatPhoneNumber(value);
      setFormData({ ...formData, [name]: formattedPhone });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, agreeTerms: checked });
    if (errors.agreeTerms) {
      setErrors({ ...errors, agreeTerms: "" });
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const prices = {
    regular: 150000,
    student: 80000,
  };

  const faqItems = [
    {
      question: "신청 후 취소는 어떻게 하나요?",
      answer:
        "행사 3일 전까지 취소 시 전액 환불되며, 이후에는 환불이 불가합니다. 취소는 마이페이지 > 신청내역에서 가능합니다.",
    },
    {
      question: "참가 확인증은 어떻게 받을 수 있나요?",
      answer:
        "행사 종료 후 이메일로 자동 발송되며, 마이페이지 > 수료증 메뉴에서도 다운로드 가능합니다.",
    },
    {
      question: "주차는 가능한가요?",
      answer:
        "행사장 내 주차장을 이용하실 수 있으며, 주차권은 행사장 안내데스크에서 발급받으실 수 있습니다.",
    },
    {
      question: "학생 할인은 어떻게 적용받나요?",
      answer:
        "학생 할인은 현재 재학 중인 대학(원)생에게 적용됩니다. 행사 당일 학생증을 지참해주세요.",
    },
    {
      question: "자료집은 제공되나요?",
      answer:
        "행사 자료집은 PDF로 참가자 이메일로 발송되며, 현장에서는 간략한 프로그램 안내서만 제공됩니다.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <i className="fas fa-graduation-cap text-2xl text-blue-600 mr-2"></i>
              <span className="text-xl font-bold text-gray-800">
                에듀플랫폼
              </span>
            </a>

            <nav className="hidden md:flex space-x-6 ml-8">
              <a
                href="/"
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                홈
              </a>
              <a
                href="/training"
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                연수 프로그램
              </a>
              <a
                href="/courses"
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                교육과정
              </a>
              <a href="/seminars" className="text-blue-600 font-medium">
                세미나
              </a>
              <a
                href="/notices"
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                공지사항
              </a>
            </nav>

            <div className="flex items-center space-x-4 ml-auto">
              <Button
                variant="outline"
                className="!rounded-button whitespace-nowrap hidden md:flex cursor-pointer"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                로그인
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white !rounded-button whitespace-nowrap hidden md:flex cursor-pointer">
                <i className="fas fa-user-plus mr-2"></i>
                회원가입
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">교육 혁신 세미나</h1>
          <p className="text-xl mb-6">
            미래 교육의 방향과 혁신적인 교수법을 함께 탐구합니다
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <i className="fas fa-calendar-alt text-3xl mb-2"></i>
                <h3 className="font-semibold">개최일시</h3>
                <p>2025년 7월 15일 (토) 14:00-18:00</p>
              </div>
              <div>
                <i className="fas fa-map-marker-alt text-3xl mb-2"></i>
                <h3 className="font-semibold">장소</h3>
                <p>서울 강남구 컨벤션센터</p>
              </div>
              <div>
                <i className="fas fa-users text-3xl mb-2"></i>
                <h3 className="font-semibold">참가비</h3>
                <p>일반 150,000원 / 학생 80,000원</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">개요</TabsTrigger>
                <TabsTrigger value="program">프로그램</TabsTrigger>
                <TabsTrigger value="speakers">연사</TabsTrigger>
                <TabsTrigger value="location">오시는길</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">세미나 소개</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    급변하는 교육 환경 속에서 교육자들이 직면한 새로운 도전과
                    기회를 함께 탐구하는 자리입니다. 최신 교육 트렌드와 혁신적인
                    교수법을 통해 미래 교육의 방향을 제시하고, 실제 현장에서
                    적용 가능한 실무 노하우를 공유합니다.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">주요 주제</h4>
                      <ul className="text-sm space-y-1">
                        <li>• AI와 디지털 교육 혁신</li>
                        <li>• 개인 맞춤형 학습 설계</li>
                        <li>• 미래 핵심 역량 교육</li>
                        <li>• 교육 평가의 새로운 패러다임</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">참가 혜택</h4>
                      <ul className="text-sm space-y-1">
                        <li>• 최신 교육 자료 제공</li>
                        <li>• 전문가 네트워킹 기회</li>
                        <li>• 참가 인증서 발급</li>
                        <li>• 후속 워크숍 할인</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="program" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6">세부 프로그램</h3>
                  <div className="space-y-6">
                    {[
                      {
                        time: "14:00-14:30",
                        title: "등록 및 환영 인사",
                        speaker: "",
                        description: "참가자 등록 및 세미나 안내",
                      },
                      {
                        time: "14:30-15:30",
                        title: "기조강연: AI 시대의 교육 혁신",
                        speaker: "김혁신 교수 (서울대학교)",
                        description:
                          "인공지능 기술이 가져올 교육 패러다임의 변화와 교육자의 역할",
                      },
                      {
                        time: "15:30-15:45",
                        title: "휴식",
                        speaker: "",
                        description: "",
                      },
                      {
                        time: "15:45-16:45",
                        title: "개인 맞춤형 학습 설계 방법론",
                        speaker: "박맞춤 박사 (교육연구원)",
                        description:
                          "학습자 개별 특성을 고려한 맞춤형 교육과정 설계 실무",
                      },
                      {
                        time: "16:45-17:45",
                        title: "패널 토론: 미래 교육의 방향",
                        speaker: "교육 전문가 패널",
                        description: "현장 교육자들과 함께 하는 열린 토론",
                      },
                      {
                        time: "17:45-18:00",
                        title: "질의응답 및 마무리",
                        speaker: "",
                        description: "종합 질의응답 및 네트워킹",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-500 pl-6"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline">{item.time}</Badge>
                          {item.speaker && (
                            <Badge className="bg-blue-100 text-blue-600">
                              {item.speaker}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        {item.description && (
                          <p className="text-gray-600 text-sm">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="speakers" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-6">연사 소개</h3>
                  <div className="space-y-6">
                    {[
                      {
                        name: "김혁신 교수",
                        title: "서울대학교 교육학과",
                        image: "/api/placeholder/150/150",
                        bio: "AI 교육 전문가로 15년간 교육 기술 연구에 매진해왔습니다. 다수의 국제 학술지에 논문을 발표했으며, 교육부 자문위원으로 활동하고 있습니다.",
                      },
                      {
                        name: "박맞춤 박사",
                        title: "한국교육연구원 선임연구위원",
                        image: "/api/placeholder/150/150",
                        bio: "개인 맞춤형 교육 설계 전문가로, 학습자 중심의 교육과정 개발에 특화된 연구를 진행하고 있습니다. 다양한 현장 적용 사례를 보유하고 있습니다.",
                      },
                    ].map((speaker, index) => (
                      <div key={index} className="flex space-x-4">
                        <img
                          src={speaker.image}
                          alt={speaker.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-lg">
                            {speaker.name}
                          </h4>
                          <p className="text-blue-600 mb-2">{speaker.title}</p>
                          <p className="text-gray-600 text-sm">{speaker.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="location" className="mt-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">오시는 길</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">주소</h4>
                      <p className="text-gray-700">
                        서울특별시 강남구 테헤란로 152 강남컨벤션센터 3층
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">교통편</h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>• 지하철: 2호선 강남역 3번 출구 도보 5분</li>
                        <li>• 버스: 강남역 정류장 하차</li>
                        <li>• 주차: 건물 지하 주차장 이용 가능 (유료)</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Registration Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h3 className="text-xl font-semibold mb-6">세미나 신청</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="이름을 입력하세요"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="organization">소속 *</Label>
                  <Input
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    placeholder="소속기관을 입력하세요"
                    className={errors.organization ? "border-red-500" : ""}
                  />
                  {errors.organization && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.organization}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">연락처 *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="010-0000-0000"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">이메일 *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    참가 유형
                  </Label>
                  <RadioGroup
                    value={formData.participantType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, participantType: value })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="regular" id="regular" />
                      <Label htmlFor="regular">일반 (150,000원)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student">학생 (80,000원)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">총 참가비</span>
                    <span className="text-lg font-bold text-blue-600">
                      {prices[
                        formData.participantType as keyof typeof prices
                      ].toLocaleString()}
                      원
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="agreeTerms" className="text-sm">
                    개인정보 수집 및 이용에 동의합니다 *
                  </Label>
                </div>
                {errors.agreeTerms && (
                  <p className="text-red-500 text-sm">{errors.agreeTerms}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  신청하기
                </Button>
              </form>
            </Card>

            {/* FAQ Section */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">자주 묻는 질문</h3>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-sm">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-gray-600">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4">에듀플랫폼</h4>
              <p className="text-gray-400">
                전문적인 교육 서비스를 제공하는 온라인 플랫폼입니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">바로가기</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/courses" className="hover:text-white">
                    교육과정
                  </a>
                </li>
                <li>
                  <a href="/seminars" className="hover:text-white">
                    세미나
                  </a>
                </li>
                <li>
                  <a href="/notices" className="hover:text-white">
                    공지사항
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">고객지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li>전화: 02-1234-5678</li>
                <li>이메일: support@eduplatform.kr</li>
                <li>운영시간: 평일 09:00-18:00</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SeminarsListPage;
