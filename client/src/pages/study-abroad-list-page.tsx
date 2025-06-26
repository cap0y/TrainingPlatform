import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Calendar,
  Users,
  Star,
  Clock,
  Globe,
  Search,
  Filter,
  ChevronRight,
  Plane,
  Heart,
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

export default function StudyAbroadListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("전체");
  const [selectedLevel, setSelectedLevel] = useState("전체");

  // Fetch overseas programs from API
  const { data: programsData, isLoading } = useQuery<{
    programs: OverseasProgram[];
    total: number;
  }>({
    queryKey: [
      "/api/overseas-programs",
      {
        search: searchQuery,
        category: selectedCategory,
        country: selectedCountry,
        level: selectedLevel,
      },
    ],
  });

  const programs = programsData?.programs || [];

  // 해외연수 카테고리 정의
  const categories = [
    { id: "all", name: "전체", count: programs.length },
    {
      id: "교육시찰",
      name: "교육시찰",
      count: programs.filter((p) => p.type === "교육시찰").length,
    },
    {
      id: "연구연수",
      name: "연구연수",
      count: programs.filter((p) => p.type === "연구연수").length,
    },
    {
      id: "교육과정개발",
      name: "교육과정개발",
      count: programs.filter((p) => p.type === "교육과정개발").length,
    },
    {
      id: "국제교류",
      name: "국제교류",
      count: programs.filter((p) => p.type === "국제교류").length,
    },
    {
      id: "어학연수",
      name: "어학연수",
      count: programs.filter((p) => p.type === "어학연수").length,
    },
    {
      id: "문화체험",
      name: "문화체험",
      count: programs.filter((p) => p.type === "문화체험").length,
    },
  ];

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원";
  };

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch =
      program.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || program.type === selectedCategory;
    const matchesCountry =
      selectedCountry === "전체" ||
      program.destination.includes(selectedCountry);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesCountry &&
      program.status === "active" &&
      program.approvalStatus === "approved"
    );
  });

  // 해외연수 카테고리별 이미지
  const getCategoryImage = (categoryId: string) => {
    const imageMap: { [key: string]: string } = {
      all: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05",
      교육시찰: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
      연구연수: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
      교육과정개발:
        "https://images.unsplash.com/photo-1513258496099-48168024aec0",
      국제교류: "https://images.unsplash.com/photo-1511632765486-a01980e01a18",
      어학연수: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d",
      문화체험: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9",
    };
    return `${imageMap[categoryId] || imageMap["all"]}?w=300&h=300&fit=crop`;
  };

  const getCategoryColor = (categoryId: string) => {
    const colorMap: { [key: string]: string } = {
      교육시찰: "bg-blue-600",
      연구연수: "bg-green-600",
      교육과정개발: "bg-purple-600",
      국제교류: "bg-orange-600",
      어학연수: "bg-red-600",
      문화체험: "bg-indigo-600",
    };
    return colorMap[categoryId] || "bg-gray-600";
  };

  const getImageUrl = (program: OverseasProgram) => {
    if (program.imageUrl && program.imageUrl !== "/api/placeholder/400/250") {
      return program.imageUrl;
    }
    return "/uploads/images/study-abroad-default.jpg";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (program: OverseasProgram) => {
    const now = new Date();
    const startDate = new Date(program.startDate);

    if (startDate < now) {
      return { text: "마감", color: "bg-red-500" };
    } else if (
      program.maxParticipants &&
      program.currentParticipants &&
      program.currentParticipants >= program.maxParticipants
    ) {
      return { text: "마감", color: "bg-red-500" };
    } else if (!program.isActive) {
      return { text: "마감", color: "bg-red-500" };
    } else {
      return { text: "접수중", color: "bg-green-500" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNotificationClick={() => {}} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-800 text-white py-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/uploads/images/6.jpg"
            alt="글로벌 해외연수 배경"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">
              글로벌 해외연수 프로그램
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              세계 각국의 우수 교육기관과 함께하는 전문 해외연수 과정
            </p>
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
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-600">
              홈
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-800">해외연수</span>
          </div>
        </div>

        {/* Category Navigation */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">해외연수 분야</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`text-center cursor-pointer transition-all duration-300 ${
                  selectedCategory === category.id ? "transform scale-105" : ""
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <div
                    className={`absolute inset-0 rounded-full ${
                      selectedCategory === category.id
                        ? "bg-purple-100"
                        : "bg-gray-100"
                    }`}
                  ></div>
                  <img
                    src={getCategoryImage(category.id)}
                    alt={category.name}
                    className={`w-full h-full object-cover rounded-full relative z-10 transition-transform duration-300 ${
                      selectedCategory === category.id
                        ? "scale-110"
                        : "hover:scale-105"
                    }`}
                  />
                </div>
                <div
                  className={`font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "text-purple-600"
                      : "text-gray-800"
                  }`}
                >
                  {category.name}
                  <div className="text-sm text-gray-500 mt-1">
                    {category.count}개
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Search and Filters */}
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

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="기간" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체">전체 기간</SelectItem>
                <SelectItem value="단기">단기 (1-5일)</SelectItem>
                <SelectItem value="중기">중기 (6-10일)</SelectItem>
                <SelectItem value="장기">장기 (11일 이상)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            {selectedCategory !== "all" && (
              <span className="text-blue-600 font-medium mr-2">
                {categories.find((c) => c.id === selectedCategory)?.name}
              </span>
            )}
            총{" "}
            <span className="font-semibold text-gray-800">
              {filteredPrograms.length}
            </span>
            개의 해외연수 프로그램이 있습니다.
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">정렬:</span>
            <Select defaultValue="deadline">
              <SelectTrigger className="w-32">
                <SelectValue />
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
          ) : filteredPrograms.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {selectedCategory !== "all"
                  ? `${categories.find((c) => c.id === selectedCategory)?.name} 분야의 해외연수 프로그램이 없습니다`
                  : "등록된 해외연수 프로그램이 없습니다"}
              </h3>
              <p className="text-gray-500">
                새로운 프로그램이 곧 추가될 예정입니다.
              </p>
              {selectedCategory !== "all" && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSelectedCategory("all")}
                >
                  전체 프로그램 보기
                </Button>
              )}
            </div>
          ) : (
            filteredPrograms.map((program) => {
              const status = getStatusBadge(program);
              return (
                <Card
                  key={program.id}
                  className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={getImageUrl(program)}
                      alt={program.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src =
                          "/uploads/images/study-abroad-default.jpg";
                      }}
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className={`${status.color} text-white`}>
                        {status.text}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="bg-white/90">
                        {program.type}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-black/70 text-white">
                        <Plane className="h-3 w-3 mr-1" />
                        {program.destination}
                      </Badge>
                    </div>
                    {/* 관심등록 버튼 */}
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
                          <span>
                            {program.currentParticipants || 0}/
                            {program.maxParticipants}명
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(program.price)}
                      </span>
                    </div>

                    <Link href={`/study-abroad/${program.id}`}>
                      <Button className="w-full">자세히 보기</Button>
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
