import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, X, Send, User } from "lucide-react";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const botResponses = {
  // 인사말
  "안녕": "안녕하세요! 지누켐 연수플랫폼 AI 상담원입니다. 무엇을 도와드릴까요?",
  "안녕하세요": "안녕하세요! 지누켐 연수플랫폼 AI 상담원입니다. 무엇을 도와드릴까요?",
  "hi": "안녕하세요! 지누켐 연수플랫폼 AI 상담원입니다. 무엇을 도와드릴까요?",
  
  // 연수 프로그램 관련
  "연수": "연수 프로그램에 대해 문의하셨군요! 저희는 법정교육, 전문성강화교육, 자격증과정, 해외연수 등 다양한 프로그램을 제공합니다. 어떤 분야에 관심이 있으신가요?",
  "교육": "교육 프로그램에 대해 알려드릴게요. 저희는 화학물질 안전교육, 환경교육, 기술교육 등을 제공합니다. 구체적으로 어떤 교육을 찾고 계신가요?",
  "해외연수": "해외연수 프로그램은 미국 실리콘밸리, 영국 옥스포드, 일본 도쿄 등 6개국 프로그램을 운영합니다. 기업탐방, 대학연수, 기술체험 등 다양한 형태로 진행됩니다.",
  "세미나": "세미나는 정기적으로 개최되며, 화학안전, 환경보호, 신기술 동향 등의 주제로 진행됩니다. 참가 신청은 홈페이지에서 가능합니다.",
  
  // 신청 및 결제
  "신청": "프로그램 신청은 각 프로그램 상세 페이지에서 가능합니다. 개인 회원과 기업 회원 모두 신청하실 수 있습니다.",
  "결제": "결제는 신용카드, 계좌이체, 카카오페이를 지원합니다. 기업 회원의 경우 세금계산서 발행도 가능합니다.",
  "가격": "프로그램별로 가격이 다릅니다. 조기 신청 시 할인 혜택도 제공하니 상세 페이지를 확인해 주세요.",
  "할인": "조기 신청 할인, 단체 할인, 재수강 할인 등 다양한 할인 혜택을 제공합니다. 자세한 내용은 각 프로그램 페이지에서 확인 가능합니다.",
  
  // 회원가입 및 로그인
  "회원가입": "회원가입은 개인 회원과 기업 회원으로 구분됩니다. 홈페이지 상단의 회원가입 버튼을 클릭하여 진행하실 수 있습니다.",
  "로그인": "로그인은 홈페이지 상단의 로그인 버튼을 클릭하여 진행하세요. 아이디나 비밀번호를 잊으셨다면 찾기 기능을 이용해 주세요.",
  "비밀번호": "비밀번호 재설정은 로그인 페이지의 '비밀번호 찾기'를 이용하시거나, 고객센터(055-772-2226)로 문의해 주세요.",
  
  // 수료증 및 학점
  "수료증": "프로그램 완료 시 수료증이 발급됩니다. 온라인으로 다운로드 가능하며, 필요시 우편 발송도 가능합니다.",
  "학점": "일부 프로그램은 학점 인정이 가능합니다. 각 프로그램 상세 페이지에서 학점 정보를 확인하실 수 있습니다.",
  "인증": "저희 교육 프로그램은 관련 기관의 인증을 받은 정식 교육과정입니다.",
  
  // 연락처 및 고객지원
  "연락처": "고객센터: 055-772-2226, 이메일: bkim@jinuchem.co.kr, 운영시간: 평일 09:00-18:00입니다.",
  "전화": "고객센터 전화번호는 055-772-2226입니다. 평일 09:00-18:00에 운영합니다.",
  "이메일": "문의 이메일은 bkim@jinuchem.co.kr입니다. 언제든 문의해 주세요.",
  "주소": "저희 주소는 경상남도 진주시 진주대로 501, 창업보육센터 B동 202호입니다.",
  
  // 기술적 문제
  "오류": "기술적 문제가 발생하셨나요? 페이지 새로고침을 먼저 시도해 보시고, 계속 문제가 있으시면 고객센터로 연락해 주세요.",
  "로딩": "페이지 로딩이 느리다면 인터넷 연결을 확인하시고, 브라우저 캐시를 삭제해 보세요.",
  "접속": "접속 문제가 있으시면 다른 브라우저나 기기에서 시도해 보시고, 고객센터로 문의해 주세요.",
  
  // 일반적인 질문
  "지누켐": "지누켐은 화학 안전 교육 전문 기업으로, 다양한 연수 프로그램을 제공하는 전문 교육기관입니다.",
  "회사": "저희는 (주)지누켐으로, 화학물질 안전교육과 전문 연수 프로그램을 제공하는 회사입니다.",
  "시간": "대부분의 프로그램은 평일에 진행되며, 일부는 주말반도 운영합니다. 구체적인 일정은 각 프로그램 페이지에서 확인 가능합니다.",
  
  // 기본 응답
  "default": "죄송합니다. 정확한 답변을 드리기 어려운 질문입니다. 자세한 문의는 고객센터(055-772-2226)로 연락해 주시거나 이메일(bkim@jinuchem.co.kr)로 문의해 주세요."
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "안녕하세요! 지누켐 연수플랫폼 AI 상담원입니다. 연수 프로그램, 신청 방법, 결제 등 궁금한 점을 문의해 주세요.",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // 키워드 매칭을 통한 응답 생성
    for (const [keyword, response] of Object.entries(botResponses)) {
      if (keyword !== "default" && lowerMessage.includes(keyword)) {
        return response;
      }
    }
    
    return botResponses.default;
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: message,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");

    // AI 응답 시뮬레이션 (약간의 지연)
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: generateBotResponse(message),
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-80 h-96 shadow-xl mt-[82px] mb-[82px]">
          <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <h3 className="font-semibold">AI 상담원</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardContent className="p-0 flex flex-col h-full">
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                      msg.isBot 
                        ? 'bg-gray-100 text-gray-800' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {msg.isBot && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        {!msg.isBot && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1">
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${
                            msg.isBot ? 'text-gray-500' : 'text-blue-200'
                          }`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button 
                  size="sm" 
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg animate-pulse mt-[65px] mb-[65px]"
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}