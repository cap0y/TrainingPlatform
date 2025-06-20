import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const SignupPage: React.FC = () => {
  const [memberType, setMemberType] = useState('individual');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const { registerMutation } = useAuth();

  const [formData, setFormData] = useState({
    // 공통 정보
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    username: '',
    // 개인회원 정보
    birthDate: '',
    gender: '',
    address: '',
    school: '',
    occupation: '',
    interests: [] as string[],
    // 기관/사업자 정보
    businessName: '',
    businessNumber: '',
    representativeName: '',
    businessAddress: '',
    businessType: '',
    departmentName: '',
    managerName: '',
    managerPhone: '',
    managerEmail: '',
    // 약관 동의
    termsAgreed: false,
    privacyAgreed: false,
    marketingAgreed: false
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '비밀번호 강도'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestChange = (interest: string) => {
    setFormData(prev => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let label = '매우 약함';
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score === 1) label = '약함';
    else if (score === 2) label = '보통';
    else if (score === 3) label = '강함';
    else if (score === 4) label = '매우 강함';

    setPasswordStrength({ score, label });
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
      isValid = false;
    }

    if (!formData.termsAgreed) {
      newErrors.termsAgreed = '이용약관에 동의해주세요';
      isValid = false;
    }

    if (!formData.privacyAgreed) {
      newErrors.privacyAgreed = '개인정보 처리방침에 동의해주세요';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const userData = {
      username: formData.email, // Use email as username
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
      role: memberType === 'business' ? 'business' : 'student',
      organizationName: memberType === 'business' ? formData.businessName : formData.school
    };

    registerMutation.mutate(userData, {
      onSuccess: () => {
        setLocation("/");
      }
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="bg-gray-50 py-8" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">회원가입</h1>
            <p className="text-gray-600">에듀플랫폼에 오신 것을 환영합니다</p>
          </div>

        {/* Member Type Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">회원 유형 선택</h2>
            <RadioGroup value={memberType} onValueChange={setMemberType} className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="cursor-pointer font-medium">개인회원</Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="business" id="business" />
                <Label htmlFor="business" className="cursor-pointer font-medium">기관/사업자회원</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 기본 정보 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">기본 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">이름 *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="이름을 입력하세요"
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">이메일 *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="이메일을 입력하세요"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="password">비밀번호 *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="비밀번호를 입력하세요"
                      className={errors.password ? "border-red-500" : ""}
                    />
                    {formData.password && (
                      <div className="mt-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                passwordStrength.score === 1 ? 'bg-red-500' :
                                passwordStrength.score === 2 ? 'bg-yellow-500' :
                                passwordStrength.score === 3 ? 'bg-blue-500' :
                                passwordStrength.score === 4 ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                              style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{passwordStrength.label}</span>
                        </div>
                      </div>
                    )}
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="비밀번호를 다시 입력하세요"
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="phone">연락처</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="연락처를 입력하세요"
                  />
                </div>
              </div>

              <Separator />

              {/* 추가 정보 */}
              {memberType === 'individual' ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">개인 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="school">소속 학교/기관</Label>
                      <Input
                        id="school"
                        name="school"
                        value={formData.school}
                        onChange={handleChange}
                        placeholder="소속을 입력하세요"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="occupation">직업</Label>
                      <Select onValueChange={(value) => handleSelectChange('occupation', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="직업을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">학생</SelectItem>
                          <SelectItem value="teacher">교사</SelectItem>
                          <SelectItem value="professor">교수</SelectItem>
                          <SelectItem value="researcher">연구원</SelectItem>
                          <SelectItem value="other">기타</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-4">기관/사업자 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessName">기관/사업자명 *</Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="기관/사업자명을 입력하세요"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="businessNumber">사업자 등록번호</Label>
                      <Input
                        id="businessNumber"
                        name="businessNumber"
                        value={formData.businessNumber}
                        onChange={handleChange}
                        placeholder="사업자 등록번호를 입력하세요"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* 약관 동의 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">약관 동의</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="termsAgreed"
                      checked={formData.termsAgreed}
                      onCheckedChange={(checked) => handleCheckboxChange('termsAgreed', !!checked)}
                    />
                    <Label htmlFor="termsAgreed" className="cursor-pointer">
                      이용약관에 동의합니다 (필수)
                    </Label>
                  </div>
                  {errors.termsAgreed && <p className="text-red-500 text-sm">{errors.termsAgreed}</p>}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privacyAgreed"
                      checked={formData.privacyAgreed}
                      onCheckedChange={(checked) => handleCheckboxChange('privacyAgreed', !!checked)}
                    />
                    <Label htmlFor="privacyAgreed" className="cursor-pointer">
                      개인정보 처리방침에 동의합니다 (필수)
                    </Label>
                  </div>
                  {errors.privacyAgreed && <p className="text-red-500 text-sm">{errors.privacyAgreed}</p>}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketingAgreed"
                      checked={formData.marketingAgreed}
                      onCheckedChange={(checked) => handleCheckboxChange('marketingAgreed', !!checked)}
                    />
                    <Label htmlFor="marketingAgreed" className="cursor-pointer">
                      마케팅 정보 수신에 동의합니다 (선택)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "회원가입 중..." : "회원가입"}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500">
                이미 계정이 있으신가요?{" "}
                <a href="/auth" className="text-blue-600 hover:underline">
                  로그인하기
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignupPage;