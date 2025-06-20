import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        <Tabs defaultValue="personal" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full rounded-none">
            <TabsTrigger
              value="personal"
              className={`py-4 text-base font-medium ${activeTab === "personal" ? "bg-gradient-to-r from-[#00BFFF] to-[#1E90FF] text-white" : "bg-gray-200 text-gray-700"} !rounded-button whitespace-nowrap`}
            >
              개인회원
            </TabsTrigger>
            <TabsTrigger
              value="business"
              className={`py-4 text-base font-medium ${activeTab === "business" ? "bg-gradient-to-r from-[#00BFFF] to-[#1E90FF] text-white" : "bg-gray-200 text-gray-700"} !rounded-button whitespace-nowrap`}
            >
              기관/사업자회원
            </TabsTrigger>
          </TabsList>
          <TabsContent value="personal" className="p-6 space-y-4">
            <LoginForm />
          </TabsContent>
          <TabsContent value="business" className="p-6 space-y-4">
            <LoginForm isBusiness={true} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface LoginFormProps {
  isBusiness?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ isBusiness = false }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const { loginMutation } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      username: formData.username,
      password: formData.password
    }, {
      onSuccess: () => {
        setLocation("/");
      }
    });
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Implement social login logic
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <Input
            type="text"
            placeholder="아이디를 입력해 주세요"
            className="pl-10 py-6 border-gray-200 focus:border-blue-500 text-sm"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
          <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
        <div className="relative">
          <Input
            type="password"
            placeholder="비밀번호를 입력해 주세요"
            className="pl-10 py-6 border-gray-200 focus:border-blue-500 text-sm"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="remember" 
          className="text-blue-500 border-gray-300 cursor-pointer"
          checked={formData.rememberMe}
          onCheckedChange={(checked) => setFormData({ ...formData, rememberMe: !!checked })}
        />
        <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">로그인 상태 유지</label>
      </div>
      
      <Button 
        type="submit"
        className="w-full py-6 bg-[#1E90FF] hover:bg-[#0078D7] text-white font-medium text-lg !rounded-button whitespace-nowrap cursor-pointer"
        disabled={loginMutation.isPending}
      >
        <i className="fas fa-power-off mr-2"></i> 
        {loginMutation.isPending ? "로그인 중..." : "로그인"}
      </Button>
      
      {!isBusiness && (
        <>
          <div className="text-center text-gray-400 text-sm my-4">소셜 로그인</div>
          <Button
            type="button"
            onClick={() => handleSocialLogin('kakao')}
            className="w-full py-4 bg-[#FEE500] hover:bg-[#FDD835] text-black font-medium relative !rounded-button whitespace-nowrap cursor-pointer mb-2"
          >
            <i className="fas fa-comment text-black mr-2"></i>
            카카오 로그인
          </Button>
          <Button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="w-full py-4 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 relative !rounded-button whitespace-nowrap cursor-pointer"
          >
            <i className="fab fa-google text-[#4285F4] mr-2"></i>
            구글 로그인
          </Button>
        </>
      )}
      
      <div className="flex justify-center text-sm text-gray-500 pt-2">
        <a href="#" className="hover:text-blue-500 cursor-pointer">아이디 찾기</a>
        <span className="mx-2">|</span>
        <a href="#" className="hover:text-blue-500 cursor-pointer">비밀번호 찾기</a>
        <span className="mx-2">|</span>
        <a href="/signup" className="hover:text-blue-500 cursor-pointer">회원가입</a>
      </div>
    </form>
  );
};

export default LoginPage;