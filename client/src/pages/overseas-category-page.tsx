import { useState } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, Calendar, Users, Star, Clock, Globe, Search, 
  ChevronRight, ArrowLeft, Plane, Heart
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface OverseasProgram {
  id: number;
  title: string;
  description?: string;
  destination: string;
  startDate: string;
  endDate: string;
  type: string;
  maxParticipants?: number;
  currentParticipants?: number;
  price: number;
  duration: string;
  imageUrl?: string;
  tags?: string;
  status: string;
  approvalStatus: string;
  isActive: boolean;
  createdAt: string;
}

const categoryInfo = {
  "교육시찰": {
    title: "교육시찰",
    description: "해외 선진 교육 기관 및 시설 견학을 통한 교육 혁신 사례 학습",
    bgImage: "/uploads/photo11.jpg",
    color: "blue"
  },
  "연구연수": {
    title: "연구연수",
    description: "해외 교육 연구 기관과의 학술 교류 및 공동 연구 활동",
    bgImage: "/uploads/photo12.jpg",
    color: "purple"
  },
  "교육과정개발": {
    title: "교육과정개발",
    description: "글로벌 교육과정 개발 방법론 및 모범 사례 학습",
    bgImage: "/uploads/photo13.jpg",
    color: "green"
  },
  "국제교류": {
    title: "국제교류",
    description: "국가 간 교육 교류 협력 및 글로벌 네트워킹 구축",
    bgImage: "/uploads/photo14.jpg",
    color: "orange"
  },
  "어학연수": {
    title: "어학연수",
    description: "현지에서 진행하는 어학 능력 향상 및 문화 체험 프로그램",
    bgImage: "/uploads/photo15.jpg",
    color: "red"
  },
  "문화체험": {
    title: "문화체험",
    description: "현지 문화와 교육 환경을 체험하는 문화 교류 프로그램",
    bgImage: "/uploads/photo16.jpg",
    color: "indigo"
  }
};

export default function OverseasCategoryPage() {
  const [, params] = useRoute("/study-abroad/category/:category");
  const categoryParam = params?.category || "";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("deadline");
  const [selectedCountry, setSelectedCountry] = useState("전체");
  
  // URL 디코딩
  const category = decodeURIComponent(categoryParam);
  const categoryData = categoryInfo[category as keyof typeof categoryInfo];

  const { data: programsData, isLoading } = useQuery<{ programs: OverseasProgram[]; total: number }>({
    queryKey: ["/api/overseas-programs"],
  });

  const programs = programsData?.programs || [];

  // 해당 카테고리의 해외연수만 필터링
  const filteredPrograms = programs.filter(program => {
    const matchesCategory = program.type === category;
    const matchesSearch = program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         program.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (program.description && program.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCountry = selectedCountry === "전체" || program.destination.includes(selectedCountry);
    const isActiveProgram = program.status === "active" && program.approvalStatus === "approved" && program.isActive;
    
    return matchesCategory && matchesSearch && matchesCountry && isActiveProgram;
  });

  // 정렬 적용
  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    switch (sortBy) {
      case "deadline":
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "popular":
        return (b.currentParticipants || 0) - (a.currentParticipants || 0);
      default:
        return 0;
    }
  });

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (program: OverseasProgram) => {
    const now = new Date();
    const startDate = new Date(program.startDate);
    
    if (startDate < now) {
      return { text: "마감", color: "bg-red-500" };
    } else if (program.maxParticipants && program.currentParticipants && 
               program.currentParticipants >= program.maxParticipants) {
      return { text: "마감", color: "bg-red-500" };
    } else if (!program.isActive) {
      return { text: "마감", color: "bg-red-500" };
    } else {
      return { text: "접수중", color: "bg-green-500" };
    }
  };

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">카테고리를 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-8">요청하신 해외연수 카테고리가 존재하지 않습니다.</p>
          <Link href="/study-abroad">
            <Button>전체 해외연수 보기</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-800 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={categoryData.bgImage} 
            alt={categoryData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Link href="/study-abroad">
              <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                전체 해외연수
              </Button>
            </Link>
            
            <h1 className="text-4xl font-bold mb-4">{categoryData.title}</h1>
            <p className="text-xl text-blue-100 mb-6">{categoryData.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>연중 운영</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>전 세계 연수지</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span>수료증 발급</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-blue-600">홈</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/study-abroad" className="hover:text-blue-600">해외연수</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-800">{categoryData.title}</span>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="프로그램명 또는 연수지 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="연수지 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체">전체 연수지</SelectItem>
                <SelectItem value="미국">미국</SelectItem>
                <SelectItem value="독일">독일</SelectItem>
                <SelectItem value="일본">일본</SelectItem>
                <SelectItem value="싱가포르">싱가포르</SelectItem>
                <SelectItem value="호주">호주</SelectItem>
                <SelectItem value="영국">영국</SelectItem>
                <SelectItem value="캐나다">캐나다</SelectItem>
                <SelectItem value="핀란드">핀란드</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deadline">출발일순</SelectItem>
                <SelectItem value="popular">인기순</SelectItem>
                <SelectItem value="price-low">가격낮은순</SelectItem>
                <SelectItem value="price-high">가격높은순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            <span className={`text-${categoryData.color}-600 font-medium mr-2`}>
              {categoryData.title}
            </span>
            총 <span className="font-semibold text-gray-800">{sortedPrograms.length}</span>개의 해외연수 프로그램이 있습니다.
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                <CardContent className="p-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))
          ) : sortedPrograms.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {categoryData.title} 프로그램이 없습니다
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? "검색 조건을 변경하거나 " : ""}새로운 프로그램이 곧 추가될 예정입니다.
              </p>
              <div className="flex gap-4 justify-center">
                {searchQuery && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchQuery("")}
                  >
                    검색 초기화
                  </Button>
                )}
                <Link href="/study-abroad">
                  <Button>전체 해외연수 보기</Button>
                </Link>
              </div>
            </div>
          ) : (
            sortedPrograms.map((program) => {
              const status = getStatusBadge(program);
              return (
                <Card key={program.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={program.imageUrl || "/uploads/images/study-abroad-default.jpg"}
                      alt={program.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/uploads/images/study-abroad-default.jpg";
                      }}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className={`${status.color} text-white`}>
                        {status.text}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="bg-white/90">{program.type}</Badge>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-black/70 text-white">
                        <Plane className="h-3 w-3 mr-1" />
                        {program.destination}
                      </Badge>
                    </div>
                    <button 
                      className="absolute bottom-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {program.title}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{program.destination}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(program.startDate)} 출발</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{program.duration}</span>
                      </div>
                      {program.maxParticipants && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{program.currentParticipants || 0}/{program.maxParticipants}명</span>
                        </div>
                      )}
                    </div>

                    {program.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {program.description}
                      </p>
                    )}

                    <div className="mb-4">
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(program.price)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      <Badge className={`text-xs bg-${categoryData.color}-100 text-${categoryData.color}-800`}>
                        {program.type}
                      </Badge>
                      {program.tags && program.tags.split(',').slice(0, 2).map((tag, index) => (
                        <Badge key={index} className="text-xs bg-gray-100 text-gray-800">
                          #{tag.trim()}
                        </Badge>
                      ))}
                    </div>

                    <Link href={`/study-abroad/${program.id}`}>
                      <Button className="w-full">
                        자세히 보기
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
} 