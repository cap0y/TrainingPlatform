import { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, Users, Star, Clock, MapPin, Search, Filter, 
  ChevronRight, ArrowLeft, Globe, DollarSign
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface Seminar {
  id: number;
  title: string;
  description?: string | null;
  date: Date | string;
  location?: string | null;
  type: string;
  maxParticipants?: number | null;
  currentParticipants?: number | null;
  imageUrl?: string | null;
  isActive?: boolean | null;
  createdAt?: Date | string | null;
  featured?: boolean;
}

const categoryInfo = {
  "교육학회": {
    title: "교육학회",
    description: "교육 이론과 실천을 공유하는 학술 행사",
    bgImage: "/uploads/photo3.jpg",
    color: "blue"
  },
  "AI 컨퍼런스": {
    title: "AI 컨퍼런스",
    description: "인공지능과 교육의 융합을 탐구하는 컨퍼런스",
    bgImage: "/uploads/photo6.jpg",
    color: "purple"
  },
  "워크샵": {
    title: "워크샵",
    description: "실무 중심의 참여형 교육 프로그램",
    bgImage: "/uploads/photo7.jpg",
    color: "green"
  },
  "심포지엄": {
    title: "심포지엄",
    description: "전문가들의 심도 있는 토론의 장",
    bgImage: "/uploads/photo8.jpg",
    color: "orange"
  },
  "국제행사": {
    title: "국제행사",
    description: "글로벌 교육 트렌드를 공유하는 국제 행사",
    bgImage: "/uploads/photo9.jpg",
    color: "red"
  },
  "온라인세미나": {
    title: "온라인세미나",
    description: "시공간의 제약 없이 참여하는 온라인 세미나",
    bgImage: "/uploads/photo10.jpg",
    color: "indigo"
  }
};

export default function SeminarCategoryPage() {
  const [, params] = useRoute("/seminars/category/:category");
  const categoryParam = params?.category || "";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  
  // URL 디코딩
  const category = decodeURIComponent(categoryParam);
  const categoryData = categoryInfo[category as keyof typeof categoryInfo];

  const { data: seminarsData, isLoading } = useQuery<Seminar[]>({
    queryKey: ["/api/seminars"],
  });

  const seminars = seminarsData || [];

  // 해당 카테고리의 세미나만 필터링
  const filteredSeminars = seminars.filter(seminar => {
    const matchesCategory = seminar.type === category;
    const matchesSearch = seminar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (seminar.description && seminar.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // 정렬 적용
  const sortedSeminars = [...filteredSeminars].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "title":
        return a.title.localeCompare(b.title);
      case "participants":
        return (b.maxParticipants || 0) - (a.maxParticipants || 0);
      default:
        return 0;
    }
  });

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getStatusColor = (seminar: Seminar) => {
    const now = new Date();
    const seminarDate = typeof seminar.date === 'string' ? new Date(seminar.date) : seminar.date;
    
    if (seminarDate < now) {
      return "bg-red-500";
    } else if (seminar.maxParticipants && seminar.currentParticipants && 
               seminar.currentParticipants >= seminar.maxParticipants) {
      return "bg-red-500";
    } else {
      return "bg-green-500";
    }
  };

  const getStatusText = (seminar: Seminar) => {
    const now = new Date();
    const seminarDate = typeof seminar.date === 'string' ? new Date(seminar.date) : seminar.date;
    
    if (seminarDate < now) {
      return "마감";
    } else if (seminar.maxParticipants && seminar.currentParticipants && 
               seminar.currentParticipants >= seminar.maxParticipants) {
      return "마감";
    } else {
      return "접수중";
    }
  };

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">카테고리를 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-8">요청하신 세미나 카테고리가 존재하지 않습니다.</p>
          <Link href="/seminars">
            <Button>전체 세미나 보기</Button>
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
            <Link href="/seminars">
              <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                전체 세미나
              </Button>
            </Link>
            
            <h1 className="text-4xl font-bold mb-4">{categoryData.title}</h1>
            <p className="text-xl text-blue-100 mb-6">{categoryData.description}</p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>정기 개최</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>전문가 네트워킹</span>
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
          <Link href="/seminars" className="hover:text-blue-600">세미나</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-800">{categoryData.title}</span>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="세미나명 또는 내용 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">날짜순</SelectItem>
                <SelectItem value="title">제목순</SelectItem>
                <SelectItem value="participants">참가자순</SelectItem>
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
            총 <span className="font-semibold text-gray-800">{sortedSeminars.length}</span>개의 세미나가 있습니다.
          </div>
        </div>

        {/* Seminars Grid */}
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
          ) : sortedSeminars.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {categoryData.title} 세미나가 없습니다
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery ? "검색 조건을 변경하거나 " : ""}새로운 세미나가 곧 추가될 예정입니다.
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
                <Link href="/seminars">
                  <Button>전체 세미나 보기</Button>
                </Link>
              </div>
            </div>
          ) : (
            sortedSeminars.map((seminar) => (
              <Card key={seminar.id} className={`group hover:shadow-lg transition-all duration-300 overflow-hidden ${seminar.featured ? 'border-2 border-yellow-400' : ''}`}>
                <div className="relative">
                  <img 
                    src={seminar.imageUrl || "/uploads/images/course-default.jpg"}
                    alt={seminar.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "/uploads/images/course-default.jpg";
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={`${getStatusColor(seminar)} text-white`}>
                      {getStatusText(seminar)}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-white/90">{seminar.type}</Badge>
                  </div>
                  {seminar.featured && (
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        추천
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {seminar.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {seminar.description || "세미나에 대한 상세 정보를 확인해보세요."}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(seminar.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{seminar.location || "장소 미정"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>1일</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{seminar.maxParticipants || 100}명 모집</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>무료</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    <Badge className={`text-xs bg-${categoryData.color}-100 text-${categoryData.color}-800`}>
                      {seminar.type}
                    </Badge>
                    <Badge className="text-xs bg-green-100 text-green-800">
                      교육
                    </Badge>
                  </div>

                  <Link href={`/seminars/${seminar.id}`}>
                    <Button className="w-full">
                      세미나 신청
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
} 