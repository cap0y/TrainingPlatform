import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Star, Clock, DollarSign, Search } from "lucide-react";

export default function SeminarsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  // Mock seminars data - in real app this would come from API
  const seminarsData = [
    {
      id: 1,
      title: "2025 한국교육학회 춘계학술대회",
      description: "교육의 미래를 논하는 국내 최대 규모의 교육학회",
      date: "2025.07.15-16",
      location: "서울대학교 교육연구원",
      type: "학회",
      category: "교육학회",
      participants: 500,
      price: 150000,
      duration: "2일",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop",
      featured: true,
      status: "접수중",
      organizer: "한국교육학회",
      tags: ["교육혁신", "미래교육", "정책"]
    },
    {
      id: 2,
      title: "디지털 교육혁신 국제 컨퍼런스",
      description: "AI와 빅데이터를 활용한 교육 혁신 사례 공유",
      date: "2025.08.10",
      location: "온라인",
      type: "컨퍼런스",
      category: "AI 컨퍼런스",
      participants: 1200,
      price: 0,
      duration: "1일",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop",
      featured: true,
      status: "접수중",
      organizer: "디지털교육협회",
      tags: ["AI", "빅데이터", "에듀테크"]
    },
    {
      id: 3,
      title: "AI와 교육의 미래 심포지엄",
      description: "인공지능 시대의 교육 패러다임 변화 탐구",
      date: "2025.08.25",
      location: "COEX 컨벤션센터",
      type: "심포지엄",
      category: "AI 컨퍼런스",
      participants: 300,
      price: 80000,
      duration: "1일",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=250&fit=crop",
      featured: false,
      status: "접수중",
      organizer: "AI교육연구소",
      tags: ["AI교육", "미래교육", "기술혁신"]
    },
    {
      id: 4,
      title: "교사 역량강화 워크샵",
      description: "현장 교사를 위한 실무 중심 교육 방법론",
      date: "2025.09.05",
      location: "부산교육청",
      type: "워크샵",
      category: "워크샵",
      participants: 150,
      price: 50000,
      duration: "1일",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=250&fit=crop",
      featured: false,
      status: "접수예정",
      organizer: "부산광역시교육청",
      tags: ["교사교육", "실무교육", "역량강화"]
    },
    {
      id: 5,
      title: "글로벌 교육리더십 포럼",
      description: "세계 교육 전문가들과의 국제 교육 네트워킹",
      date: "2025.10.12-14",
      location: "제주 ICC",
      type: "포럼",
      category: "국제행사",
      participants: 800,
      price: 200000,
      duration: "3일",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=250&fit=crop",
      featured: true,
      status: "접수중",
      organizer: "국제교육협력단",
      tags: ["글로벌", "리더십", "국제교육"]
    },
    {
      id: 6,
      title: "온라인 교육 콘텐츠 제작 세미나",
      description: "효과적인 온라인 학습 콘텐츠 기획과 제작",
      date: "2025.09.20",
      location: "온라인",
      type: "세미나",
      category: "온라인세미나",
      participants: 500,
      price: 30000,
      duration: "4시간",
      image: "https://images.unsplash.com/photo-1552581234-26160f608093?w=400&h=250&fit=crop",
      featured: false,
      status: "접수중",
      organizer: "온라인교육개발원",
      tags: ["온라인교육", "콘텐츠제작", "이러닝"]
    }
  ];

  const categories = [
    { id: "all", name: "전체", count: seminarsData.length },
    { id: "교육학회", name: "교육학회", count: seminarsData.filter(s => s.category === "교육학회").length },
    { id: "AI 컨퍼런스", name: "AI 컨퍼런스", count: seminarsData.filter(s => s.category === "AI 컨퍼런스").length },
    { id: "워크샵", name: "워크샵", count: seminarsData.filter(s => s.category === "워크샵").length },
    { id: "심포지엄", name: "심포지엄", count: seminarsData.filter(s => s.category === "심포지엄").length },
    { id: "국제행사", name: "국제행사", count: seminarsData.filter(s => s.category === "국제행사").length },
    { id: "온라인세미나", name: "온라인세미나", count: seminarsData.filter(s => s.category === "온라인세미나").length }
  ];

  const filteredSeminars = seminarsData.filter(seminar => {
    const matchesSearch = seminar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         seminar.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || seminar.category === selectedCategory;
    const matchesType = selectedType === "all" || seminar.type === selectedType;
    const matchesLocation = selectedLocation === "all" || 
                           (selectedLocation === "online" && seminar.location === "온라인") ||
                           (selectedLocation === "offline" && seminar.location !== "온라인");
    
    return matchesSearch && matchesCategory && matchesType && matchesLocation;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "접수중": return "bg-green-500";
      case "접수예정": return "bg-blue-500";
      case "마감": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">학회 및 세미나</h1>
            <p className="text-xl text-blue-100 mb-6">
              최신 교육 트렌드와 전문 지식을 공유하는 학술 행사에 참여하세요
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>연중 운영</span>
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

      {/* Category Navigation */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">세미나 분야</h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 max-w-5xl">
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className={`text-center group cursor-pointer ${
                    selectedCategory === category.id ? 'transform scale-105' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className={`relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300 ${
                    selectedCategory === category.id ? 'ring-4 ring-blue-500' : ''
                  }`}>
                    <img 
                      src={category.id === "all" 
                        ? "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=120&h=120&fit=crop&crop=center"
                        : categories.find(c => c.id === category.id)?.id === "교육학회" 
                          ? "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=120&h=120&fit=crop&crop=center"
                          : categories.find(c => c.id === category.id)?.id === "AI 컨퍼런스"
                            ? "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=120&h=120&fit=crop&crop=center"
                            : categories.find(c => c.id === category.id)?.id === "워크샵"
                              ? "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&h=120&fit=crop&crop=center"
                              : categories.find(c => c.id === category.id)?.id === "국제행사"
                                ? "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=120&h=120&fit=crop&crop=center"
                                : "https://images.unsplash.com/photo-1552581234-26160f608093?w=120&h=120&fit=crop&crop=center"
                      }
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className={`absolute inset-0 bg-blue-600 ${
                      selectedCategory === category.id 
                        ? 'bg-opacity-30' 
                        : 'bg-opacity-20 group-hover:bg-opacity-10'
                    } transition-opacity duration-300`}></div>
                  </div>
                  <div className={`font-medium text-sm transition-colors ${
                    selectedCategory === category.id 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-800 group-hover:text-blue-600'
                  }`}>
                    {category.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{category.count}개</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="세미나/학회명 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="행사 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="학회">학회</SelectItem>
                <SelectItem value="컨퍼런스">컨퍼런스</SelectItem>
                <SelectItem value="세미나">세미나</SelectItem>
                <SelectItem value="워크샵">워크샵</SelectItem>
                <SelectItem value="심포지엄">심포지엄</SelectItem>
                <SelectItem value="포럼">포럼</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="참석 방식" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="online">온라인</SelectItem>
                <SelectItem value="offline">오프라인</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              검색
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            총 <span className="font-semibold text-gray-800">{filteredSeminars.length}</span>개의 세미나가 있습니다.
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">정렬:</span>
            <Select defaultValue="date">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">날짜순</SelectItem>
                <SelectItem value="popular">인기순</SelectItem>
                <SelectItem value="price-low">가격낮은순</SelectItem>
                <SelectItem value="price-high">가격높은순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Seminars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSeminars.map((seminar) => (
            <Card key={seminar.id} className={`group hover:shadow-lg transition-all duration-300 overflow-hidden ${seminar.featured ? 'border-2 border-yellow-400' : ''}`}>
              <div className="relative">
                <img src={seminar.image} alt={seminar.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                {seminar.featured && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      주목
                    </Badge>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge className={`${getStatusColor(seminar.status)} text-white`}>
                    {seminar.status}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge variant="outline" className="bg-white/90">{seminar.type}</Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {seminar.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{seminar.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{seminar.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{seminar.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{seminar.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{seminar.participants}명 예상</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4" />
                    <span>{seminar.price === 0 ? "무료" : `${seminar.price.toLocaleString()}원`}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {seminar.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} className={`text-xs text-white ${
                      index === 0 ? 'bg-blue-500 hover:bg-blue-600' :
                      index === 1 ? 'bg-green-500 hover:bg-green-600' :
                      'bg-purple-500 hover:bg-purple-600'
                    }`}>
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="space-y-2">
                  <Link href={`/seminars/${seminar.id}`}>
                    <Button className="w-full" variant={seminar.featured ? "default" : "outline"}>
                      {seminar.status === "접수중" ? "신청하기" : "관심등록"}
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500 text-center">주최: {seminar.organizer}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredSeminars.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500">다른 검색어나 필터를 사용해보세요.</p>
          </div>
        )}

        {/* Pagination */}
        {filteredSeminars.length > 6 && (
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">이전</Button>
              <Button variant="outline" size="sm" className="bg-blue-600 text-white">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">다음</Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}