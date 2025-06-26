import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: number;
  userId?: number;
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebSocket connection
  useEffect(() => {
    if (isOpen && user) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      // 개발 환경에서는 명시적으로 포트 5000 사용
      const host = window.location.hostname;
      const port =
        window.location.port ||
        (window.location.hostname === "localhost" ? "5000" : "80");
      const wsUrl = `${protocol}//${host}:${port}/ws`;

      console.log("Chat WebSocket connecting to:", wsUrl);

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "chat") {
              setMessages((prev) => [...prev, data.data]);
            } else if (data.type === "chat_history") {
              setMessages(data.data.reverse()); // Reverse to show newest at bottom
            } else if (data.type === "error") {
              toast({
                title: "채팅 오류",
                description: data.message,
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          console.log("WebSocket disconnected");
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setIsConnected(false);
          toast({
            title: "연결 오류",
            description: "채팅 서버에 연결할 수 없습니다.",
            variant: "destructive",
          });
        };

        return () => {
          ws.close();
        };
      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
        toast({
          title: "연결 오류",
          description: "채팅 서비스를 사용할 수 없습니다.",
          variant: "destructive",
        });
      }
    }
  }, [isOpen, user, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (
      !message.trim() ||
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN ||
      !user
    ) {
      return;
    }

    const chatMessage = {
      type: "chat",
      userId: user.id,
      message: message.trim(),
      isAdmin: user.isAdmin || false,
    };

    wsRef.current.send(JSON.stringify(chatMessage));
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleChat = () => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "채팅을 사용하려면 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={toggleChat}
          className="bg-accent hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-lg transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card
        className={`w-80 transition-all duration-300 chat-slide-up ${isMinimized ? "h-14" : "h-96"} shadow-xl`}
      >
        <CardHeader className="bg-accent text-white p-4 flex flex-row items-center justify-between space-y-0 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <MessageCircle className="h-5 w-5" />
              {isConnected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
              )}
            </div>
            <span className="font-semibold">실시간 상담</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-green-600 p-1 h-8 w-8"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-green-600 p-1 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {/* Connection Status */}
            {!isConnected && (
              <div className="bg-yellow-50 border-b border-yellow-200 p-2 text-center">
                <span className="text-xs text-yellow-700">연결 중...</span>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>
                    안녕하세요! 궁금한 점이 있으시면 언제든지 문의해 주세요.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.userId === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-xs ${msg.userId === user?.id ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarFallback
                          className={`text-xs ${msg.isAdmin ? "bg-accent text-white" : msg.userId === user?.id ? "bg-primary text-white" : "bg-gray-300"}`}
                        >
                          {msg.isAdmin
                            ? "A"
                            : msg.userId === user?.id
                              ? "M"
                              : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-lg p-3 ${
                          msg.userId === user?.id
                            ? "bg-primary text-white"
                            : msg.isAdmin
                              ? "bg-accent text-white"
                              : "bg-white border"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <span
                          className={`text-xs mt-1 block ${
                            msg.userId === user?.id || msg.isAdmin
                              ? "text-white text-opacity-70"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 text-sm"
                  disabled={!isConnected}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim() || !isConnected}
                  size="sm"
                  className="bg-accent hover:bg-green-600 text-white px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {!isConnected && (
                <p className="text-xs text-red-500 mt-1">
                  연결이 끊어졌습니다. 잠시 후 다시 시도해주세요.
                </p>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
