import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const StudyAbroadPage: React.FC = () => {
  const [paymentMethod, setPaymentMethod] = useState("creditCard");

  // 프로그램 정보
  const program = {
    id: 1,
    title: "미국 실리콘밸리 IT 기업 탐방 프로그램",
    category: "해외연수",
    duration: "2주",
    credits: 3,
    price: 2800000,
    discountPrice: 2520000,
    location: "미국 캘리포니아 실리콘밸리",
    startDate: "2025년 8월 15일",
    endDate: "2025년 8월 29일",
    image: "/api/placeholder/1200/600"
  };

  // 신청자 정보
  const applicant = {
    name: "김지훈",
    email: "jihoon.kim@example.com",
    phone: "010-1234-5678",
    organization: "한국대학교",
    position: "학생",
  };

  // 신청 번호
  const applicationNumber = "SV-2025-06-19-1234";

  // 가격 포맷팅 함수
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 바 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <a href="/" className="flex items-center">
              <i className="fas fa-graduation-cap text-2xl text-blue-600 mr-2"></i>
              <span className="text-xl font-bold text-gray-800">에듀코리아</span>
            </a>
            
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-600 hover:text-blue-600 font-medium">홈</a>
              <a href="/training" className="text-blue-600 font-medium">연수 프로그램</a>
              <a href="/courses" className="text-gray-600 hover:text-blue-600 font-medium">교육과정</a>
              <a href="/seminars" className="text-gray-600 hover:text-blue-600 font-medium">세미나</a>
              <a href="/help" className="text-gray-600 hover:text-blue-600 font-medium">고객센터</a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="!rounded-button whitespace-nowrap hidden md:flex cursor-pointer">
              <i className="fas fa-sign-in-alt mr-2"></i>
              로그인
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white !rounded-button whitespace-nowrap hidden md:flex cursor-pointer">
              <i className="fas fa-user-plus mr-2"></i>
              회원가입
            </Button>
            <button className="md:hidden text-gray-600">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </header>
      
      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-8">
        {/* 페이지 경로 */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <a href="/" className="hover:text-blue-600">홈</a>
          <i className="fas fa-chevron-right mx-2"></i>
          <a href="/training" className="hover:text-blue-600">연수 프로그램</a>
          <i className="fas fa-chevron-right mx-2"></i>
          <span className="text-gray-800">해외연수</span>
        </div>

        {/* 프로그램 헤더 */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Badge className="bg-blue-100 text-blue-600">{program.category}</Badge>
                <Badge variant="outline">{program.duration}</Badge>
                <Badge variant="outline">{program.credits}학점</Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{program.title}</h1>
              
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center">
                  <i className="fas fa-calendar-alt w-5 text-blue-600 mr-3"></i>
                  <span>{program.startDate} ~ {program.endDate}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-map-marker-alt w-5 text-blue-600 mr-3"></i>
                  <span>{program.location}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-users w-5 text-blue-600 mr-3"></i>
                  <span>모집인원: 30명</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center space-x-4 mb-2">
                  <span className="text-3xl font-bold text-blue-600">
                    {formatPrice(program.discountPrice)}
                  </span>
                  <Badge className="bg-red-500 text-white">10% 할인</Badge>
                </div>
                <span className="text-gray-500 line-through">
                  {formatPrice(program.price)}
                </span>
              </div>
            </div>

            <div>
              <img 
                src={program.image} 
                alt={program.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* 신청 정보 확인 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* 신청자 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-user text-blue-600 mr-2"></i>
                  신청자 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">이름</Label>
                    <p className="text-lg font-medium">{applicant.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">이메일</Label>
                    <p className="text-lg">{applicant.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">연락처</Label>
                    <p className="text-lg">{applicant.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">소속</Label>
                    <p className="text-lg">{applicant.organization}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 프로그램 세부 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                  프로그램 세부 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">프로그램 하이라이트</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <i className="fas fa-check text-green-600 mr-2 mt-1"></i>
                        실리콘밸리 주요 IT 기업 방문 (구글, 애플, 메타, 테슬라 등)
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check text-green-600 mr-2 mt-1"></i>
                        현지 스타트업 인큐베이터 및 액셀러레이터 탐방
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check text-green-600 mr-2 mt-1"></i>
                        IT 분야 전문가 특강 및 네트워킹 세션
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check text-green-600 mr-2 mt-1"></i>
                        스탠포드 대학교 캠퍼스 투어 및 강의 참관
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-check text-green-600 mr-2 mt-1"></i>
                        현지 IT 전문가와의 멘토링 세션
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">포함 사항</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <i className="fas fa-plane text-blue-600 mr-2"></i>
                          <span>왕복 항공료</span>
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-bed text-blue-600 mr-2"></i>
                          <span>숙박비 (14박 15일)</span>
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-utensils text-blue-600 mr-2"></i>
                          <span>식사 (조식 14회)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <i className="fas fa-bus text-blue-600 mr-2"></i>
                          <span>현지 교통비</span>
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-book text-blue-600 mr-2"></i>
                          <span>교육 자료</span>
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-certificate text-blue-600 mr-2"></i>
                          <span>수료증 발급</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 결제 정보 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-credit-card text-blue-600 mr-2"></i>
                  결제 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 신청 번호 */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-gray-600">신청 번호</Label>
                    <p className="font-mono text-sm">{applicationNumber}</p>
                  </div>

                  {/* 비용 정보 */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>프로그램 비용</span>
                      <span>{formatPrice(program.price)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>할인 금액</span>
                      <span>-{formatPrice(program.price - program.discountPrice)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>총 결제 금액</span>
                      <span className="text-blue-600">{formatPrice(program.discountPrice)}</span>
                    </div>
                  </div>

                  {/* 결제 방법 */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">결제 방법</Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="creditCard" id="creditCard" />
                        <Label htmlFor="creditCard" className="cursor-pointer">신용카드</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bankTransfer" id="bankTransfer" />
                        <Label htmlFor="bankTransfer" className="cursor-pointer">계좌이체</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="kakaoPay" id="kakaoPay" />
                        <Label htmlFor="kakaoPay" className="cursor-pointer">카카오페이</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* 결제 안내 */}
                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    <h5 className="font-medium text-blue-800 mb-2">결제 안내</h5>
                    <ul className="space-y-1 text-blue-700">
                      <li>• 결제 완료 후 확인 메일이 발송됩니다</li>
                      <li>• 출발 14일 전까지 취소 시 100% 환불</li>
                      <li>• 여권 유효기간을 확인해주세요 (6개월 이상)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                  <i className="fas fa-credit-card mr-2"></i>
                  {formatPrice(program.discountPrice)} 결제하기
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-xl font-bold mb-6">참가 안내</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-3">준비물</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• 여권 (유효기간 6개월 이상)</li>
                <li>• ESTA 승인 (미국 입국용)</li>
                <li>• 해외여행자보험 가입증명서</li>
                <li>• 영문 재학/재직증명서</li>
                <li>• 개인 노트북 (선택사항)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">주의사항</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• 최소 출발 인원: 15명</li>
                <li>• 항공사 사정에 따라 일정 변경 가능</li>
                <li>• 개인 사유로 인한 불참 시 환불 불가</li>
                <li>• 현지 날씨에 적합한 복장 준비</li>
                <li>• 개인 용돈은 별도 준비</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4">에듀코리아</h4>
              <p className="text-gray-400">글로벌 교육 경험을 제공하는 전문 교육기관입니다.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">바로가기</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/training" className="hover:text-white">연수 프로그램</a></li>
                <li><a href="/courses" className="hover:text-white">교육과정</a></li>
                <li><a href="/seminars" className="hover:text-white">세미나</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">고객지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li>전화: 02-1234-5678</li>
                <li>이메일: info@edukorea.kr</li>
                <li>운영시간: 평일 09:00-18:00</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-gray-700" />
          <div className="text-center text-gray-400">
            <p>&copy; 2025 에듀코리아. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudyAbroadPage;