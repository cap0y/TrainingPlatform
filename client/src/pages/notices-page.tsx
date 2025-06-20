import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const NoticesPage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'assistant',
      message: '안녕하세요! 무엇을 도와드릴까요?',
      time: '09:00'
    }
  ]);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [noticeData, setNoticeData] = useState({
    title: "2025년 하계 연수 일정 안내",
    date: "2025.06.15",
    isImportant: true,
    content: `안녕하세요, 에듀플랫폼 회원 여러분.\n2025년 하계 연수 일정을 안내해 드립니다. 이번 하계 연수는 최신 교육 트렌드와 교수법을 중심으로 다양한 프로그램이 준비되어 있으니 많은 참여 바랍니다.`,
    overview: {
      period: "2025년 7월 15일(월) ~ 7월 26일(금), 2주간",
      time: "오전 9시 ~ 오후 5시 (일일 7시간, 점심시간 포함)",
      location: "서울특별시 강남구 테헤란로 123 에듀플랫폼 연수원 (지하철 2호선 강남역 3번 출구에서 도보 5분)",
      target: "초·중·고 교원, 교육 행정직, 교육 관련 종사자",
      completion: "총 연수 시간의 80% 이상 참석 시 수료증 발급 (교원 직무연수 60시간 인정)"
    },
    applicationInfo: {
      period: "2025년 6월 20일(목) 오전 10시 ~ 7월 5일(금) 오후 6시까지",
      method: "에듀플랫폼 홈페이지 로그인 후 [연수과정] - [하계 연수] 메뉴에서 신청",
      selection: "선착순 200명 (정원 초과 시 대기자 등록 가능)",
      result: "2025년 7월 8일(월) 개별 이메일 및 문자 통보"
    },
    feeInfo: {
      fee: "450,000원 (교재, 중식, 간식 포함)",
      discount: [
        "단체 신청 (5인 이상): 1인당 400,000원 (50,000원 할인)",
        "에듀플랫폼 프리미엄 회원: 380,000원 (70,000원 할인)",
        "이전 연수 참가자: 420,000원 (30,000원 할인)"
      ],
      payment: "신용카드, 계좌이체, 카카오페이, 네이버페이",
      refund: [
        "연수 시작 7일 전까지: 100% 환불",
        "연수 시작 3일 전까지: 70% 환불",
        "연수 시작 1일 전까지: 50% 환불",
        "연수 당일 취소: 환불 불가"
      ]
    },
    contact: {
      phone: "02-1234-5678 (평일 오전 9시 ~ 오후 6시)",
      email: "summer@eduplatform.kr",
      kakao: "@에듀플랫폼"
    },
    signature: "많은 관심과 참여 부탁드립니다.\n감사합니다.\n\n에듀플랫폼 연수 운영팀 드림",
    attachments: [
      { name: "2025년_하계연수_상세일정.pdf", type: "pdf" },
      { name: "2025년_하계연수_신청서양식.xlsx", type: "excel" },
      { name: "연수원_오시는길.jpg", type: "image" }
    ]
  });

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMessage = {
      type: 'user',
      message: chatMessage.trim(),
      time: timeString
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');

    // Simulate assistant response
    setTimeout(() => {
      const responses = [
        '네, 어떤 도움이 필요하신가요?',
        '자세한 내용을 알려주시면 도와드리겠습니다.',
        '잠시만 기다려주시면 확인 후 답변 드리겠습니다.',
        '연수 관련 문의사항이신가요?'
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const assistantMessage = {
        type: 'assistant',
        message: randomResponse,
        time: timeString
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleAdminLogin = () => {
    if (adminCredentials.username === 'admin' && adminCredentials.password === 'admin123') {
      setIsAdminLoggedIn(true);
      setShowLoginDialog(false);
      setAdminCredentials({ username: '', password: '' });
    } else {
      alert('로그인 정보가 올바르지 않습니다.');
    }
  };

  const handleSaveNotice = () => {
    setIsEditing(false);
    alert('공지사항이 저장되었습니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-blue-600">에듀플랫폼</h1>
              <nav className="hidden md:flex space-x-6">
                <a href="/" className="text-gray-600 hover:text-blue-600">홈</a>
                <a href="/training" className="text-gray-600 hover:text-blue-600">연수 프로그램</a>
                <a href="/courses" className="text-gray-600 hover:text-blue-600">교육과정</a>
                <a href="/seminars" className="text-gray-600 hover:text-blue-600">세미나</a>
                <a href="/notices" className="text-blue-600 font-medium">공지사항</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {!isAdminLoggedIn ? (
                <>
                  <Button variant="outline" onClick={() => setShowLoginDialog(true)}>
                    관리자 로그인
                  </Button>
                  <Button>로그인</Button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-500">관리자</Badge>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "편집 완료" : "편집"}
                  </Button>
                  <Button onClick={() => setIsAdminLoggedIn(false)}>
                    로그아웃
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Notice Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {noticeData.isImportant && (
                <Badge className="bg-red-500">중요</Badge>
              )}
              <Badge variant="outline">공지사항</Badge>
            </div>
            <span className="text-gray-500">{noticeData.date}</span>
          </div>
          
          {isEditing ? (
            <Input
              value={noticeData.title}
              onChange={(e) => setNoticeData({...noticeData, title: e.target.value})}
              className="text-2xl font-bold border-none p-0 focus:ring-0"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-800">{noticeData.title}</h1>
          )}
        </div>

        {/* Notice Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">공지내용</TabsTrigger>
              <TabsTrigger value="overview">연수개요</TabsTrigger>
              <TabsTrigger value="application">신청안내</TabsTrigger>
              <TabsTrigger value="fee">수강료안내</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-6 space-y-6">
              {isEditing ? (
                <Textarea
                  value={noticeData.content}
                  onChange={(e) => setNoticeData({...noticeData, content: e.target.value})}
                  className="min-h-[200px]"
                />
              ) : (
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {noticeData.content}
                  </p>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">첨부파일</h3>
                <div className="space-y-2">
                  {noticeData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <i className={`fas ${
                        file.type === 'pdf' ? 'fa-file-pdf text-red-500' :
                        file.type === 'excel' ? 'fa-file-excel text-green-500' :
                        'fa-file-image text-blue-500'
                      }`}></i>
                      <span className="flex-1">{file.name}</span>
                      <Button variant="outline" size="sm">
                        <i className="fas fa-download mr-2"></i>
                        다운로드
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">연수 기간</Label>
                    <p className="text-gray-700 mt-1">{noticeData.overview.period}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">연수 시간</Label>
                    <p className="text-gray-700 mt-1">{noticeData.overview.time}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="font-semibold">연수 장소</Label>
                    <p className="text-gray-700 mt-1">{noticeData.overview.location}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">연수 대상</Label>
                    <p className="text-gray-700 mt-1">{noticeData.overview.target}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">이수 조건</Label>
                    <p className="text-gray-700 mt-1">{noticeData.overview.completion}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="application" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-semibold">신청 기간</Label>
                    <p className="text-gray-700 mt-1">{noticeData.applicationInfo.period}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">신청 방법</Label>
                    <p className="text-gray-700 mt-1">{noticeData.applicationInfo.method}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">선발 방법</Label>
                    <p className="text-gray-700 mt-1">{noticeData.applicationInfo.selection}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">결과 발표</Label>
                    <p className="text-gray-700 mt-1">{noticeData.applicationInfo.result}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="fee" className="mt-6">
              <div className="space-y-6">
                <div>
                  <Label className="font-semibold text-lg">수강료</Label>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{noticeData.feeInfo.fee}</p>
                </div>

                <div>
                  <Label className="font-semibold">할인 혜택</Label>
                  <ul className="mt-2 space-y-1">
                    {noticeData.feeInfo.discount.map((item, index) => (
                      <li key={index} className="text-gray-700">• {item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Label className="font-semibold">결제 방법</Label>
                  <p className="text-gray-700 mt-1">{noticeData.feeInfo.payment}</p>
                </div>

                <div>
                  <Label className="font-semibold">환불 정책</Label>
                  <ul className="mt-2 space-y-1">
                    {noticeData.feeInfo.refund.map((item, index) => (
                      <li key={index} className="text-gray-700">• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Contact Information */}
          <Separator className="my-8" />
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">문의처</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <i className="fas fa-phone text-blue-500 mr-2"></i>
                <span>{noticeData.contact.phone}</span>
              </div>
              <div>
                <i className="fas fa-envelope text-blue-500 mr-2"></i>
                <span>{noticeData.contact.email}</span>
              </div>
              <div>
                <i className="fas fa-comment text-blue-500 mr-2"></i>
                <span>카카오톡 {noticeData.contact.kakao}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-right">
            <p className="whitespace-pre-line text-gray-600">{noticeData.signature}</p>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                취소
              </Button>
              <Button onClick={handleSaveNotice}>
                저장
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Admin Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>관리자 로그인</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-username">아이디</Label>
              <Input
                id="admin-username"
                value={adminCredentials.username}
                onChange={(e) => setAdminCredentials({...adminCredentials, username: e.target.value})}
                placeholder="관리자 아이디"
              />
            </div>
            <div>
              <Label htmlFor="admin-password">비밀번호</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminCredentials.password}
                onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})}
                placeholder="관리자 비밀번호"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
              취소
            </Button>
            <Button onClick={handleAdminLogin}>
              로그인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => setShowChatDialog(true)}
          className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <i className="fas fa-comment text-xl"></i>
        </Button>
      </div>

      {/* Chat Dialog */}
      <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>고객 지원 채팅</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-3">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <span className="text-xs opacity-70">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="메시지를 입력하세요..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>
                <i className="fas fa-paper-plane"></i>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoticesPage;