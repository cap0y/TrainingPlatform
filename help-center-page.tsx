import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const HelpCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [inquiryType, setInquiryType] = useState("product");
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [inquiryFile, setInquiryFile] = useState<File | null>(null);
  const [inquiryData, setInquiryData] = useState({
    title: "",
    content: "",
    type: "product",
    isPrivate: false
  });

  const categories = [
    { id: "all", name: "전체", icon: "fas fa-th-large" },
    { id: "product", name: "상품 문의", icon: "fas fa-box" },
    { id: "delivery", name: "배송 문의", icon: "fas fa-truck" },
    { id: "payment", name: "결제 문의", icon: "fas fa-credit-card" },
    { id: "refund", name: "환불/교환", icon: "fas fa-exchange-alt" },
    { id: "account", name: "계정 관리", icon: "fas fa-user-cog" },
    { id: "etc", name: "기타 문의", icon: "fas fa-question-circle" }
  ];

  const faqs = [
    {
      id: 1,
      category: "product",
      question: "상품 구매 후 교환이나 환불은 어떻게 하나요?",
      answer: "상품 수령 후 7일 이내에 교환/환불 신청이 가능합니다. 상품에 하자가 있는 경우 배송비는 판매자가 부담하며, 단순 변심의 경우 왕복 배송비는 고객님 부담입니다. 마이페이지 > 주문내역에서 교환/환불 신청을 하실 수 있습니다."
    },
    {
      id: 2,
      category: "delivery",
      question: "배송 조회는 어디서 확인할 수 있나요?",
      answer: "주문하신 상품의 배송 조회는 마이페이지 > 주문내역에서 확인 가능합니다. 송장번호를 클릭하시면 배송사 홈페이지로 연결되어 실시간 배송 현황을 확인하실 수 있습니다."
    },
    {
      id: 3,
      category: "payment",
      question: "결제 방법은 어떤 것이 있나요?",
      answer: "신용카드, 체크카드, 무통장입금, 휴대폰 결제, 카카오페이, 네이버페이, 토스 등 다양한 결제 방법을 제공하고 있습니다. 결제 시 원하시는 방법을 선택하여 진행하시면 됩니다."
    },
    {
      id: 4,
      category: "refund",
      question: "환불 처리 기간은 얼마나 걸리나요?",
      answer: "환불 신청 후 상품 회수 및 검수가 완료되면 영업일 기준 3-5일 내에 환불 처리가 진행됩니다. 카드 결제의 경우 카드사 사정에 따라 환불 금액의 실제 카드 승인 취소는 최대 7일까지 소요될 수 있습니다."
    },
    {
      id: 5,
      category: "account",
      question: "회원 정보 수정은 어디서 할 수 있나요?",
      answer: "회원 정보 수정은 마이페이지 > 회원정보 수정 메뉴에서 가능합니다. 비밀번호 확인 후 연락처, 주소, 이메일 등의 정보를 수정하실 수 있습니다."
    },
    {
      id: 6,
      category: "product",
      question: "상품의 재입고 알림을 받을 수 있나요?",
      answer: "네, 품절된 상품의 상세 페이지에서 '재입고 알림 신청' 버튼을 클릭하시면 해당 상품이 재입고되었을 때 알림을 받으실 수 있습니다. 알림은 회원 정보에 등록된 이메일 또는 문자메시지로 발송됩니다."
    },
    {
      id: 7,
      category: "delivery",
      question: "해외 배송도 가능한가요?",
      answer: "현재 일부 국가에 한해 해외 배송 서비스를 제공하고 있습니다. 해외 배송 가능 국가 및 배송비는 상품 주문 시 배송지 선택 단계에서 확인하실 수 있습니다. 해외 배송의 경우 일반 국내 배송보다 배송 기간이 더 소요될 수 있습니다."
    },
    {
      id: 8,
      category: "payment",
      question: "주문 후 결제 방법을 변경할 수 있나요?",
      answer: "주문 완료 후에는 결제 방법 변경이 불가능합니다. 결제 방법을 변경하시려면 기존 주문을 취소하신 후 새로운 주문으로 진행해 주셔야 합니다. 단, 무통장입금의 경우 입금 전이라면 고객센터로 문의 주시면 도움드리겠습니다."
    }
  ];

  const inquiries = [
    {
      id: 1,
      title: "수강 신청 관련 문의",
      content: "안녕하세요. 화학물질 관리사 자격증 과정 수강 신청을 하려고 하는데...",
      category: "상품 문의",
      status: "답변 대기",
      date: "2025.06.15",
      isPrivate: false,
      answer: null
    },
    {
      id: 2,
      title: "결제 오류 문의",
      content: "결제 진행 중 오류가 발생했습니다. 확인 부탁드립니다.",
      category: "결제 문의",
      status: "답변 완료",
      date: "2025.06.14",
      isPrivate: true,
      answer: {
        content: "안녕하세요. 결제 오류 관련 문의 주셔서 감사합니다. 해당 문제는 시스템 점검으로 인한 일시적 오류였으며, 현재는 정상 작동하고 있습니다.",
        date: "2025.06.14",
        answerer: "고객지원팀"
      }
    }
  ];

  const notices = [
    {
      id: 1,
      title: "2025년 하계 연수 일정 안내",
      date: "2025.06.15",
      isImportant: true
    },
    {
      id: 2,
      title: "시스템 점검 안내 (6월 20일)",
      date: "2025.06.12",
      isImportant: false
    },
    {
      id: 3,
      title: "새로운 교육과정 오픈 안내",
      date: "2025.06.10",
      isImportant: false
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInquirySubmit = () => {
    if (!inquiryData.title.trim() || !inquiryData.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    
    // Handle inquiry submission
    alert('문의가 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.');
    setInquiryDialogOpen(false);
    setInquiryData({
      title: "",
      content: "",
      type: "product",
      isPrivate: false
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNotificationClick={() => {}} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">고객센터</h2>
          <p className="text-xl mb-8">궁금한 것이 있으시면 언제든지 문의해 주세요</p>
          <div className="flex justify-center">
            <div className="relative max-w-md w-full">
              <Input
                type="text"
                placeholder="궁금한 내용을 검색하세요"
                className="pl-4 pr-12 py-3 text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="absolute right-1 top-1 bottom-1 px-4">
                <i className="fas fa-search"></i>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="faq" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">자주 묻는 질문</TabsTrigger>
            <TabsTrigger value="inquiry">1:1 문의</TabsTrigger>
            <TabsTrigger value="notice">공지사항</TabsTrigger>
            <TabsTrigger value="guide">이용가이드</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">카테고리</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-blue-100 text-blue-600'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <i className={`${category.icon} mr-2`}></i>
                        {category.name}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* FAQ List */}
              <div className="lg:col-span-3">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    자주 묻는 질문 ({filteredFaqs.length}건)
                  </h3>
                </div>

                <Accordion type="single" collapsible className="space-y-2">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={`faq-${faq.id}`} className="border border-gray-200 rounded-lg px-4">
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.id === faq.category)?.name}
                          </Badge>
                          <span className="font-medium">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 pt-4 border-t border-gray-100">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {filteredFaqs.length === 0 && (
                  <div className="text-center py-12">
                    <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500">검색 결과가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 1:1 Inquiry Tab */}
          <TabsContent value="inquiry" className="mt-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">1:1 문의</h3>
                <Dialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <i className="fas fa-plus mr-2"></i>
                      새 문의 작성
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>새 문의 작성</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="inquiry-type">문의 유형</Label>
                        <Select onValueChange={(value) => setInquiryData({...inquiryData, type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="문의 유형을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="product">상품 문의</SelectItem>
                            <SelectItem value="payment">결제 문의</SelectItem>
                            <SelectItem value="delivery">배송 문의</SelectItem>
                            <SelectItem value="refund">환불/교환</SelectItem>
                            <SelectItem value="account">계정 관리</SelectItem>
                            <SelectItem value="etc">기타 문의</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="inquiry-title">제목</Label>
                        <Input
                          id="inquiry-title"
                          value={inquiryData.title}
                          onChange={(e) => setInquiryData({...inquiryData, title: e.target.value})}
                          placeholder="문의 제목을 입력하세요"
                        />
                      </div>
                      <div>
                        <Label htmlFor="inquiry-content">내용</Label>
                        <Textarea
                          id="inquiry-content"
                          value={inquiryData.content}
                          onChange={(e) => setInquiryData({...inquiryData, content: e.target.value})}
                          placeholder="문의 내용을 상세히 입력해주세요"
                          className="min-h-[150px]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="inquiry-file">첨부파일</Label>
                        <Input
                          id="inquiry-file"
                          type="file"
                          onChange={(e) => setInquiryFile(e.target.files?.[0] || null)}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          파일 크기는 10MB 이하로 제한됩니다.
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setInquiryDialogOpen(false)}>
                        취소
                      </Button>
                      <Button onClick={handleInquirySubmit}>
                        문의 등록
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <Card key={inquiry.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <Badge variant={inquiry.status === "답변 완료" ? "default" : "secondary"}>
                          {inquiry.status}
                        </Badge>
                        <Badge variant="outline">{inquiry.category}</Badge>
                        {inquiry.isPrivate && (
                          <Badge variant="outline" className="text-orange-600">
                            <i className="fas fa-lock mr-1"></i>
                            비공개
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{inquiry.date}</span>
                    </div>
                    
                    <h4 className="font-semibold mb-2">{inquiry.title}</h4>
                    <p className="text-gray-600 mb-4">{inquiry.content}</p>
                    
                    {inquiry.answer && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <i className="fas fa-reply text-blue-600 mr-2"></i>
                          <span className="font-medium text-blue-600">답변</span>
                          <span className="text-sm text-gray-500 ml-auto">
                            {inquiry.answer.date} | {inquiry.answer.answerer}
                          </span>
                        </div>
                        <p className="text-gray-700">{inquiry.answer.content}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Notice Tab */}
          <TabsContent value="notice" className="mt-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">공지사항</h3>
              <div className="space-y-2">
                {notices.map((notice) => (
                  <Card key={notice.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {notice.isImportant && (
                          <Badge className="bg-red-500">중요</Badge>
                        )}
                        <h4 className="font-medium">{notice.title}</h4>
                      </div>
                      <span className="text-sm text-gray-500">{notice.date}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Guide Tab */}
          <TabsContent value="guide" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <i className="fas fa-user-plus text-4xl text-blue-600 mb-4"></i>
                <h4 className="font-semibold mb-2">회원가입 안내</h4>
                <p className="text-gray-600 text-sm mb-4">
                  회원가입 절차와 혜택에 대해 안내합니다.
                </p>
                <Button variant="outline" size="sm">자세히 보기</Button>
              </Card>

              <Card className="p-6 text-center">
                <i className="fas fa-graduation-cap text-4xl text-blue-600 mb-4"></i>
                <h4 className="font-semibold mb-2">수강신청 안내</h4>
                <p className="text-gray-600 text-sm mb-4">
                  교육과정 수강신청 방법을 안내합니다.
                </p>
                <Button variant="outline" size="sm">자세히 보기</Button>
              </Card>

              <Card className="p-6 text-center">
                <i className="fas fa-credit-card text-4xl text-blue-600 mb-4"></i>
                <h4 className="font-semibold mb-2">결제 안내</h4>
                <p className="text-gray-600 text-sm mb-4">
                  다양한 결제 방법과 환불 정책을 안내합니다.
                </p>
                <Button variant="outline" size="sm">자세히 보기</Button>
              </Card>

              <Card className="p-6 text-center">
                <i className="fas fa-certificate text-4xl text-blue-600 mb-4"></i>
                <h4 className="font-semibold mb-2">수료증 발급</h4>
                <p className="text-gray-600 text-sm mb-4">
                  수료증 발급 조건과 절차를 안내합니다.
                </p>
                <Button variant="outline" size="sm">자세히 보기</Button>
              </Card>

              <Card className="p-6 text-center">
                <i className="fas fa-mobile-alt text-4xl text-blue-600 mb-4"></i>
                <h4 className="font-semibold mb-2">모바일 이용 안내</h4>
                <p className="text-gray-600 text-sm mb-4">
                  모바일에서 편리하게 이용하는 방법을 안내합니다.
                </p>
                <Button variant="outline" size="sm">자세히 보기</Button>
              </Card>

              <Card className="p-6 text-center">
                <i className="fas fa-headset text-4xl text-blue-600 mb-4"></i>
                <h4 className="font-semibold mb-2">고객지원</h4>
                <p className="text-gray-600 text-sm mb-4">
                  고객지원 채널과 운영시간을 안내합니다.
                </p>
                <Button variant="outline" size="sm">자세히 보기</Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenterPage;