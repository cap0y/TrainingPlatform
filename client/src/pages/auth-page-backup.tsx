import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [memberType, setMemberType] = useState("individual");
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    businessNumber: "",
    rememberMe: false,
  });

  // Registration form state  
  const [registerForm, setRegisterForm] = useState({
    // Common fields
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    userType: "individual",
    
    // Individual member fields
    birthDate: "",
    gender: "",
    address: "",
    school: "",
    occupation: "",
    
    // Business member fields
    businessName: "",
    businessNumber: "",
    representativeName: "",
    businessAddress: "",
    businessType: "",
    
    // Terms
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false,
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (memberType === "individual") {
      loginMutation.mutate({
        username: loginForm.email,
        password: loginForm.password,
      });
    } else {
      loginMutation.mutate({
        username: loginForm.businessNumber,
        password: loginForm.password,
      });
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    if (!registerForm.termsAgreed || !registerForm.privacyAgreed) {
      toast({
        title: "약관 동의 필요",
        description: "필수 약관에 동의해주세요.",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      name: registerForm.name,
      phone: registerForm.phone,
      userType: registerForm.userType,
      businessName: registerForm.businessName,
      businessNumber: registerForm.businessNumber,
    });
  };

  // Don't render if user is already logged in
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="max-w-4xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Form */}
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">
                  한국연수교육플랫폼
                </h2>
                <p className="mt-2 text-gray-600">
                  전문가를 위한 최고의 연수교육 플랫폼
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">로그인</TabsTrigger>
                        <TabsTrigger value="register">회원가입</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      {/* Login Form */}
                      <TabsContent value="login">
                        <form onSubmit={handleLoginSubmit} className="space-y-6">
                          {/* Member Type Selection */}
                          <div className="flex rounded-lg bg-gray-100 p-1">
                        <button
                          type="button"
                          onClick={() => setMemberType("individual")}
                          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                            memberType === "individual" 
                              ? "bg-primary text-white" 
                              : "text-gray-600"
                          }`}
                        >
                          개인회원
                        </button>
                        <button
                          type="button"
                          onClick={() => setMemberType("business")}
                          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                            memberType === "business" 
                              ? "bg-primary text-white" 
                              : "text-gray-600"
                          }`}
                        >
                          기관회원
                        </button>
                      </div>

                      {/* Login Fields */}
                      <div className="space-y-4">
                        {memberType === "individual" ? (
                          <div>
                            <Label htmlFor="email">이메일</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="example@email.com"
                              value={loginForm.email}
                              onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>
                        ) : (
                          <div>
                            <Label htmlFor="businessNumber">사업자번호</Label>
                            <Input
                              id="businessNumber"
                              placeholder="000-00-00000"
                              value={loginForm.businessNumber}
                              onChange={(e) => setLoginForm(prev => ({ ...prev, businessNumber: e.target.value }))}
                              required
                            />
                          </div>
                        )}

                        <div>
                          <Label htmlFor="password">비밀번호</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="rememberMe"
                              checked={loginForm.rememberMe}
                              onCheckedChange={(checked) => 
                                setLoginForm(prev => ({ ...prev, rememberMe: checked as boolean }))
                              }
                            />
                            <Label htmlFor="rememberMe" className="text-sm">
                              로그인 상태 유지
                            </Label>
                          </div>
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            비밀번호 찾기
                          </Button>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "로그인 중..." : "로그인"}
                      </Button>

                      {/* Social Login (Individual only) */}
                      {memberType === "individual" && (
                        <>
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <Separator />
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="bg-white px-2 text-gray-500">간편 로그인</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <Button type="button" variant="outline">
                              <i className="fas fa-comment text-yellow-400 mr-2"></i>
                              카카오
                            </Button>
                            <Button type="button" variant="outline">
                              <i className="fas fa-n text-green-500 mr-2"></i>
                              네이버
                            </Button>
                            <Button type="button" variant="outline">
                              <i className="fab fa-google text-red-500 mr-2"></i>
                              구글
                            </Button>
                          </div>
                        </>
                      )}
                    </form>
                  </TabsContent>

                  {/* Registration Form */}
                  <TabsContent value="register">
                    <form onSubmit={handleRegisterSubmit} className="space-y-6">
                      {/* Member Type Selection */}
                      <RadioGroup 
                        value={registerForm.userType} 
                        onValueChange={(value) => setRegisterForm(prev => ({ ...prev, userType: value }))}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2 p-4 border rounded-lg">
                            <RadioGroupItem value="individual" id="individual" />
                            <Label htmlFor="individual" className="flex-1">
                              <div className="font-medium">개인회원</div>
                              <div className="text-sm text-gray-500">교사, 교수, 연구원 등</div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-4 border rounded-lg">
                            <RadioGroupItem value="business" id="business" />
                            <Label htmlFor="business" className="flex-1">
                              <div className="font-medium">기관회원</div>
                              <div className="text-sm text-gray-500">학교, 교육기관 등</div>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>

                      {/* Common Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="username">사용자명</Label>
                          <Input
                            id="username"
                            value={registerForm.username}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="name">이름</Label>
                          <Input
                            id="name"
                            value={registerForm.name}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">이메일</Label>
                        <Input
                          id="email"
                          type="email"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password">비밀번호</Label>
                          <Input
                            id="password"
                            type="password"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={registerForm.confirmPassword}
                            onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone">휴대폰 번호</Label>
                        <Input
                          id="phone"
                          placeholder="010-1234-5678"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>

                      {/* Type-specific fields */}
                      {registerForm.userType === "individual" ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="birthDate">생년월일</Label>
                              <Input
                                id="birthDate"
                                type="date"
                                value={registerForm.birthDate}
                                onChange={(e) => setRegisterForm(prev => ({ ...prev, birthDate: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="occupation">직업</Label>
                              <Select value={registerForm.occupation} onValueChange={(value) => setRegisterForm(prev => ({ ...prev, occupation: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="직업 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="teacher">교사</SelectItem>
                                  <SelectItem value="professor">교수</SelectItem>
                                  <SelectItem value="researcher">연구원</SelectItem>
                                  <SelectItem value="student">학생</SelectItem>
                                  <SelectItem value="other">기타</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="school">소속 학교/기관</Label>
                            <Input
                              id="school"
                              value={registerForm.school}
                              onChange={(e) => setRegisterForm(prev => ({ ...prev, school: e.target.value }))}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="businessName">기관명</Label>
                              <Input
                                id="businessName"
                                value={registerForm.businessName}
                                onChange={(e) => setRegisterForm(prev => ({ ...prev, businessName: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="businessNumber">사업자번호</Label>
                              <Input
                                id="businessNumber"
                                placeholder="000-00-00000"
                                value={registerForm.businessNumber}
                                onChange={(e) => setRegisterForm(prev => ({ ...prev, businessNumber: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="representativeName">대표자명</Label>
                            <Input
                              id="representativeName"
                              value={registerForm.representativeName}
                              onChange={(e) => setRegisterForm(prev => ({ ...prev, representativeName: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}

                      {/* Terms Agreement */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="termsAgreed"
                            checked={registerForm.termsAgreed}
                            onCheckedChange={(checked) => setRegisterForm(prev => ({ ...prev, termsAgreed: checked as boolean }))}
                          />
                          <Label htmlFor="termsAgreed" className="text-sm">
                            서비스 이용약관에 동의합니다 (필수)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="privacyAgreed"
                            checked={registerForm.privacyAgreed}
                            onCheckedChange={(checked) => setRegisterForm(prev => ({ ...prev, privacyAgreed: checked as boolean }))}
                          />
                          <Label htmlFor="privacyAgreed" className="text-sm">
                            개인정보 처리방침에 동의합니다 (필수)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="marketingAgreed"
                            checked={registerForm.marketingAgreed}
                            onCheckedChange={(checked) => setRegisterForm(prev => ({ ...prev, marketingAgreed: checked as boolean }))}
                          />
                          <Label htmlFor="marketingAgreed" className="text-sm">
                            마케팅 정보 수신에 동의합니다 (선택)
                          </Label>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "회원가입 중..." : "회원가입"}
                      </Button>
                    </form>
                      </TabsContent>
                    </Tabs>
                </CardContent>
              </Card>
          </div>

          {/* Right side - Hero */}
          <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary to-secondary rounded-2xl p-8 text-white">
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h3 className="text-2xl font-bold">교육 전문가를 위한 플랫폼</h3>
              <p className="text-blue-100 text-lg">
                최고 수준의 연수 교육과 전문성 개발 기회를 제공합니다
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">247+</div>
                  <div className="text-sm text-blue-100">연수과정</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">15K+</div>
                  <div className="text-sm text-blue-100">수강생</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">4.8★</div>
                  <div className="text-sm text-blue-100">만족도</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">18</div>
                  <div className="text-sm text-blue-100">세미나</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
