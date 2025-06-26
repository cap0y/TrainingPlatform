import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Award,
  Target,
  Calendar,
  CheckCircle,
  ArrowRight,
  Star,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Heart,
  Shield,
  Zap,
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Link } from "wouter";

export default function AboutPage() {
  const companyHistory = [
    {
      year: "2020",
      title: "지누켐 설립",
      description: "교육 전문 기업으로 출발, 온라인 교육 플랫폼 개발 시작",
    },
    {
      year: "2021",
      title: "교육 플랫폼 런칭",
      description: "연수과정 및 세미나 서비스 정식 오픈",
    },
    {
      year: "2022",
      title: "해외연수 프로그램 확장",
      description: "글로벌 교육 네트워크 구축 및 해외연수 서비스 시작",
    },
    {
      year: "2023",
      title: "AI 기반 학습 시스템 도입",
      description: "개인화된 학습 경험 제공을 위한 AI 기술 적용",
    },
    {
      year: "2024",
      title: "종합 교육 플랫폼 완성",
      description: "통합 교육 생태계 구축 및 서비스 고도화",
    },
  ];

  const coreValues = [
    {
      icon: <Target className="h-8 w-8 text-blue-600" />,
      title: "혁신",
      description:
        "최신 기술과 교육 방법론을 결합하여 지속적으로 혁신하는 교육 서비스를 제공합니다.",
    },
    {
      icon: <Heart className="h-8 w-8 text-red-600" />,
      title: "신뢰",
      description:
        "투명하고 정직한 운영을 통해 고객과의 신뢰 관계를 구축합니다.",
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "전문성",
      description:
        "교육 분야의 전문 지식과 경험을 바탕으로 최고 품질의 서비스를 제공합니다.",
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "협력",
      description:
        "고객, 파트너, 임직원 모두와 함께 성장하는 상생의 가치를 추구합니다.",
    },
  ];

  const achievements = [
    { number: "10,000+", label: "누적 수강생" },
    { number: "500+", label: "연수과정" },
    { number: "50+", label: "전문 강사진" },
    { number: "95%", label: "고객 만족도" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">(주)지누켐</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              교육의 미래를 선도하는 혁신적인 교육 플랫폼
            </p>
            <div className="flex items-center justify-center space-x-2 text-lg">
              <MapPin className="h-5 w-5" />
              <span>경상남도 진주시 진주대로 501, 창업보육센터 B동 202호</span>
            </div>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">회사 소개</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              지누켐은 2020년 설립된 교육 전문 기업으로, 혁신적인 온라인 교육
              플랫폼을 통해 양질의 연수과정, 세미나, 해외연수 프로그램을
              제공하고 있습니다. 우리는 교육의 디지털 전환을 선도하며, 학습자
              중심의 맞춤형 교육 서비스로 개인과 조직의 성장을 지원합니다.
            </p>
          </div>

          {/* Achievements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {achievement.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Lightbulb className="h-6 w-6 text-yellow-600" />
                  <span>비전 (Vision)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 leading-relaxed">
                  <strong className="text-blue-600">
                    "교육의 경계를 허물고, 모든 사람이 언제 어디서나 최고 품질의
                    교육을 받을 수 있는 세상을 만든다"
                  </strong>
                </p>
                <p className="mt-4 text-gray-600">
                  우리는 기술과 교육의 융합을 통해 학습의 새로운 패러다임을
                  제시하고, 글로벌 교육 생태계의 혁신을 이끌어가겠습니다.
                </p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Target className="h-6 w-6 text-blue-600" />
                  <span>미션 (Mission)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">
                      개인 맞춤형 학습 경험 제공
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">
                      최신 교육 기술과 콘텐츠 개발
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">
                      글로벌 교육 네트워크 구축
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">
                      지속가능한 교육 생태계 조성
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">핵심 가치</h2>
            <p className="text-lg text-gray-600">
              지누켐이 추구하는 4가지 핵심 가치입니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <Card
                key={index}
                className="text-center h-full hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company History */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">회사 연혁</h2>
            <p className="text-lg text-gray-600">
              지누켐의 성장 여정을 소개합니다
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>

              <div className="space-y-8">
                {companyHistory.map((item, index) => (
                  <div
                    key={index}
                    className="relative flex items-start space-x-6"
                  >
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {item.year}
                    </div>

                    {/* Content */}
                    <Card className="flex-1">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              주요 서비스
            </h2>
            <p className="text-lg text-gray-600">
              지누켐이 제공하는 다양한 교육 서비스입니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <BookOpen className="h-6 w-6 text-green-600" />
                  <span>연수과정</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  법정의무교육, 직무연수, 자격연수 등 다양한 분야의 전문
                  연수과정을 제공합니다.
                </p>
                <Link href="/courses">
                  <Button variant="outline" className="w-full">
                    연수과정 보기 <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-purple-600" />
                  <span>세미나</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  최신 트렌드와 실무 노하우를 공유하는 전문가 세미나와 워크샵을
                  진행합니다.
                </p>
                <Link href="/seminars">
                  <Button variant="outline" className="w-full">
                    세미나 보기 <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Globe className="h-6 w-6 text-orange-600" />
                  <span>해외연수</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  글로벌 역량 강화를 위한 다양한 해외연수 프로그램을 운영합니다.
                </p>
                <Link href="/study-abroad">
                  <Button variant="outline" className="w-full">
                    해외연수 보기 <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              연락처 정보
            </h2>
            <p className="text-lg text-gray-600">
              지누켐과 함께하고 싶으시다면 언제든 연락주세요
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Details Card */}
              <Card>
                <CardContent className="p-8">
                  <div className="space-y-6 mb-8">
                    <div className="flex items-start space-x-4">
                      <Building2 className="h-6 w-6 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          회사명
                        </h3>
                        <p className="text-gray-600">(주)지누켐</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <MapPin className="h-6 w-6 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          주소
                        </h3>
                        <p className="text-gray-600">
                          경상남도 진주시 진주대로 501
                          <br />
                          창업보육센터 B동 202호
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <Phone className="h-6 w-6 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          전화번호
                        </h3>
                        <p className="text-gray-600">055-772-2226</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <Mail className="h-6 w-6 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          이메일
                        </h3>
                        <p className="text-gray-600">support@jinuchem.kr</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      문의하기
                    </h3>
                    <p className="text-gray-600 mb-4">
                      교육 프로그램이나 서비스에 대해 궁금한 점이 있으시면
                      언제든지 연락주시기 바랍니다.
                    </p>
                    <div className="space-y-3">
                      <Link href="/help">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          전화 상담 신청
                        </Button>
                      </Link>
                      <Link href="/help">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          이메일 문의
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                    <span>오시는 길</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="w-full h-96 rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3277.2468447247894!2d128.08862431525!3d35.16094758031!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x356892c9b2c8b8a9%3A0x4b0e8e4b4b0e8e4b!2z6rK96rO87rOo64-EIOynhOyjvOyLnCDsp4Dso7zrjIDroZwgNTAx!5e0!3m2!1sko!2skr!4v1703000000000!5m2!1sko!2skr"
                      width="100%"
                      height="384"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="지누켐 위치"
                    ></iframe>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p>
                          <strong>대중교통:</strong> 진주시외버스터미널에서
                          시내버스 이용 (약 15분)
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p>
                          <strong>자가용:</strong> 진주IC에서 진주대로 방면으로
                          약 10분
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p>
                          <strong>주차:</strong> 창업보육센터 내 주차장 이용
                          가능
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          window.open(
                            "https://maps.google.com/maps?daddr=경상남도+진주시+진주대로+501",
                            "_blank",
                          )
                        }
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        길찾기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
