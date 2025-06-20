import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, Calendar, Users, Star, Clock, Globe, 
  Search, Filter, ChevronRight, Plane
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface StudyAbroadProgram {
  id: number;
  title: string;
  country: string;
  city: string;
  duration: string;
  startDate: string;
  price: number;
  discountPrice?: number;
  rating: number;
  participants: number;
  maxParticipants: number;
  type: string;
  level: string;
  imageUrl: string;
  highlights: string[];
  university?: string;
  deadline: string;
}

const studyAbroadPrograms: StudyAbroadProgram[] = [
  {
    id: 1,
    title: "미국 실리콘밸리 IT 기업 탐방 프로그램",
    country: "미국",
    city: "샌프란시스코",
    duration: "2주",
    startDate: "2025.08.15",
    price: 2800000,
    discountPrice: 2520000,
    rating: 4.8,
    participants: 18,
    maxParticipants: 30,
    type: "기업탐방",
    level: "중급",
    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop",
    highlights: ["구글, 애플, 메타 방문", "스탠포드 대학 강의", "실리콘밸리 네트워킹"],
    deadline: "2025.07.15"
  },
  {
    id: 2,
    title: "영국 옥스포드 대학교 교육학 연수",
    country: "영국",
    city: "옥스포드",
    duration: "3주",
    startDate: "2025.07.20",
    price: 3200000,
    rating: 4.9,
    participants: 12,
    maxParticipants: 25,
    type: "대학연수",
    level: "고급",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=250&fit=crop",
    highlights: ["옥스포드 대학 정규 강의", "영국 교육 시스템 견학", "교육 전문가 멘토링"],
    university: "옥스포드 대학교",
    deadline: "2025.06.20"
  },
  {
    id: 3,
    title: "일본 도쿄 첨단기술 체험 프로그램",
    country: "일본",
    city: "도쿄",
    duration: "10일",
    startDate: "2025.09.10",
    price: 1800000,
    discountPrice: 1620000,
    rating: 4.6,
    participants: 22,
    maxParticipants: 35,
    type: "기술체험",
    level: "초급",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop",
    highlights: ["로봇 기술 체험", "AI 연구소 방문", "일본 기업 문화 체험"],
    deadline: "2025.08.10"
  },
  {
    id: 4,
    title: "독일 베를린 디자인 씽킹 워크샵",
    country: "독일",
    city: "베를린",
    duration: "2주",
    startDate: "2025.10.05",
    price: 2400000,
    rating: 4.7,
    participants: 8,
    maxParticipants: 20,
    type: "워크샵",
    level: "중급",
    imageUrl: "https://images.unsplash.com/photo-1587330979470-3861dcb99e83?w=400&h=250&fit=crop",
    highlights: ["디자인 씽킹 실습", "베를린 스타트업 견학", "창의적 문제해결"],
    deadline: "2025.09.05"
  },
  {
    id: 5,
    title: "싱가포르 비즈니스 혁신 프로그램",
    country: "싱가포르",
    city: "싱가포르",
    duration: "1주",
    startDate: "2025.11.12",
    price: 1500000,
    rating: 4.5,
    participants: 15,
    maxParticipants: 30,
    type: "비즈니스",
    level: "초급",
    imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=250&fit=crop",
    highlights: ["아시아 비즈니스 허브 체험", "글로벌 기업 방문", "국제 네트워킹"],
    deadline: "2025.10.12"
  },
  {
    id: 6,
    title: "핀란드 교육혁신 연수 프로그램",
    country: "핀란드",
    city: "헬싱키",
    duration: "2주",
    startDate: "2025.06.15",
    price: 2600000,
    discountPrice: 2340000,
    rating: 4.9,
    participants: 10,
    maxParticipants: 25,
    type: "교육혁신",
    level: "고급",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop",
    highlights: ["핀란드 교육 시스템", "혁신적 교수법", "교육 정책 연구"],
    deadline: "2025.05.15"
  }
];

export default function StudyAbroadListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("전체");
  const [selectedType, setSelectedType] = useState("전체");
  const [selectedLevel, setSelectedLevel] = useState("전체");

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원";
  };

  const filteredPrograms = studyAbroadPrograms.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === "전체" || program.country === selectedCountry;
    const matchesType = selectedType === "전체" || program.type === selectedType;
    const matchesLevel = selectedLevel === "전체" || program.level === selectedLevel;
    
    return matchesSearch && matchesCountry && matchesType && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNotificationClick={() => {}} />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-600">홈</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-800">해외연수</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">해외연수 프로그램</h1>
          <p className="text-gray-600">글로벌 역량을 키우는 해외 교육 및 문화 체험 프로그램</p>
        </div>

        {/* Categories Section */}
        <section className="py-8 bg-white rounded-lg shadow-sm mb-8">
          <div className="flex justify-center">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 max-w-4xl">
              <Link href="/training-courses?category=법정의무교육">
                <div className="text-center cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=center" 
                      alt="법정의무교육"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-10"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm">법정교육</div>
                </div>
              </Link>

              <Link href="/professional-development">
                <div className="text-center cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=120&h=120&fit=crop&crop=center" 
                      alt="전문성강화교육"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-purple-600 bg-opacity-10"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm">전문성강화</div>
                </div>
              </Link>

              <Link href="/certificate-courses">
                <div className="text-center cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&h=120&fit=crop&crop=center" 
                      alt="자격증과정"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-green-600 bg-opacity-10"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm">자격증</div>
                </div>
              </Link>

              <Link href="/seminars">
                <div className="text-center cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=120&h=120&fit=crop&crop=center" 
                      alt="세미나"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-yellow-600 bg-opacity-10"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm">세미나</div>
                </div>
              </Link>

              <Link href="/study-abroad">
                <div className="text-center cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg ring-2 ring-red-500">
                    <img 
                      src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=120&h=120&fit=crop&crop=center" 
                      alt="해외연수"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-red-600 bg-opacity-10"></div>
                  </div>
                  <div className="font-medium text-red-600 text-sm">해외연수</div>
                </div>
              </Link>

              <Link href="/help">
                <div className="text-center cursor-pointer">
                  <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1553484771-371a605b060b?w=120&h=120&fit=crop&crop=center" 
                      alt="고객센터"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-indigo-600 bg-opacity-10"></div>
                  </div>
                  <div className="font-medium text-gray-800 text-sm">고객센터</div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="프로그램명 또는 국가 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="국가 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체">전체 국가</SelectItem>
                <SelectItem value="미국">미국</SelectItem>
                <SelectItem value="영국">영국</SelectItem>
                <SelectItem value="일본">일본</SelectItem>
                <SelectItem value="독일">독일</SelectItem>
                <SelectItem value="싱가포르">싱가포르</SelectItem>
                <SelectItem value="핀란드">핀란드</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="프로그램 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체">전체 유형</SelectItem>
                <SelectItem value="기업탐방">기업탐방</SelectItem>
                <SelectItem value="대학연수">대학연수</SelectItem>
                <SelectItem value="기술체험">기술체험</SelectItem>
                <SelectItem value="워크샵">워크샵</SelectItem>
                <SelectItem value="비즈니스">비즈니스</SelectItem>
                <SelectItem value="교육혁신">교육혁신</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="난이도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체">전체</SelectItem>
                <SelectItem value="초급">초급</SelectItem>
                <SelectItem value="중급">중급</SelectItem>
                <SelectItem value="고급">고급</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            총 <span className="font-semibold text-gray-800">{filteredPrograms.length}</span>개의 해외연수 프로그램이 있습니다.
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">정렬:</span>
            <Select defaultValue="deadline">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deadline">마감순</SelectItem>
                <SelectItem value="popular">인기순</SelectItem>
                <SelectItem value="price-low">가격낮은순</SelectItem>
                <SelectItem value="price-high">가격높은순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <Card key={program.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="relative">
                <img 
                  src={program.imageUrl} 
                  alt={program.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                {program.discountPrice && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-red-500 text-white">
                      할인
                    </Badge>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="bg-white/90">{program.type}</Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-black/70 text-white">
                    <Plane className="h-3 w-3 mr-1" />
                    {program.country}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {program.title}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{program.city}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{program.startDate} 출발</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{program.participants}/{program.maxParticipants}명</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center space-x-1 mb-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{program.rating}</span>
                  </div>
                  <div className="text-xs text-gray-500">마감: {program.deadline}</div>
                </div>

                <div className="mb-4">
                  {program.discountPrice ? (
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-blue-600">
                          {formatPrice(program.discountPrice)}
                        </span>
                        <Badge className="bg-red-100 text-red-600 text-xs">10% 할인</Badge>
                      </div>
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(program.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(program.price)}
                    </span>
                  )}
                </div>

                <Link href={`/study-abroad/${program.id}`}>
                  <Button className="w-full">
                    자세히 보기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPrograms.length === 0 && (
          <div className="text-center py-12">
            <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500">다른 검색어나 필터를 사용해보세요.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}