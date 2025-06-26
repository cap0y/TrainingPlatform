import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  MapPin,
  Users,
  Star,
  Clock,
  DollarSign,
  Search,
  Heart,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

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
  price?: number;
  duration?: string;
  status?: string;
  organizer?: string;
  tags?: string[];
  featured?: boolean;
  isActive?: boolean | null;
  createdAt?: Date | string | null;
  updatedAt?: string;
}

export default function SeminarsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const { data: seminarsData, isLoading: seminarsLoading } = useQuery<
    Seminar[]
  >({
    queryKey: ["/api/seminars"],
  });

  const seminars = seminarsData || [];

  const categories = [
    { id: "all", name: "전체", count: seminars.length },
    {
      id: "교육학회",
      name: "교육학회",
      count: seminars.filter((s) => s.type === "교육학회").length,
    },
    {
      id: "AI 컨퍼런스",
      name: "AI 컨퍼런스",
      count: seminars.filter((s) => s.type === "AI 컨퍼런스").length,
    },
    {
      id: "워크샵",
      name: "워크샵",
      count: seminars.filter((s) => s.type === "워크샵").length,
    },
    {
      id: "심포지엄",
      name: "심포지엄",
      count: seminars.filter((s) => s.type === "심포지엄").length,
    },
    {
      id: "국제행사",
      name: "국제행사",
      count: seminars.filter((s) => s.type === "국제행사").length,
    },
    {
      id: "온라인세미나",
      name: "온라인세미나",
      count: seminars.filter((s) => s.type === "온라인세미나").length,
    },
  ];

  const filteredSeminars = seminars.filter((seminar) => {
    const matchesSearch =
      seminar.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (seminar.description &&
        seminar.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" || seminar.type === selectedCategory;
    const matchesType = selectedType === "all" || seminar.type === selectedType;
    const matchesLocation =
      selectedLocation === "all" ||
      (selectedLocation === "online" && seminar.location === "온라인") ||
      (selectedLocation === "offline" && seminar.location !== "온라인");

    return matchesSearch && matchesCategory && matchesType && matchesLocation;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "접수중":
        return "bg-green-500";
      case "접수예정":
        return "bg-blue-500";
      case "마감":
        return "bg-red-500";
      default:
        return "bg-green-500";
    }
  };

  const getImageUrl = (seminar: Seminar) => {
    if (seminar.imageUrl && seminar.imageUrl !== "/api/placeholder/400/250") {
      return seminar.imageUrl;
    }
    return "/uploads/images/course-default.jpg";
  };

  const getSeminarStatus = (seminar: Seminar) => {
    const now = new Date();
    const seminarDate =
      typeof seminar.date === "string" ? new Date(seminar.date) : seminar.date;

    if (seminarDate < now) {
      return "마감";
    } else if (
      seminar.maxParticipants &&
      seminar.currentParticipants &&
      seminar.currentParticipants >= seminar.maxParticipants
    ) {
      return "마감";
    } else {
      return "접수중";
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 관심등록 뮤테이션
  const wishlistMutation = useMutation({
    mutationFn: async ({
      seminarId,
      action,
    }: {
      seminarId: number;
      action: "add" | "remove";
    }) => {
      const response = await fetch(`/api/seminars/${seminarId}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "관심등록 처리 중 오류가 발생했습니다.");
      }
      return response.json();
    },
    onSuccess: (data) => {
      alert(data.message);
      queryClient.invalidateQueries({ queryKey: ["/api/seminars"] });
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  // 관심등록 핸들러
  const handleWishlist = (seminarId: number, event: React.MouseEvent) => {
    event.preventDefault(); // Link 클릭 방지
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    // 일단 add 액션으로 고정 (실제로는 현재 상태를 확인해야 함)
    wishlistMutation.mutate({ seminarId, action: "add" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-800 text-white py-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/uploads/images/6.jpg"
            alt="학회 및 세미나 배경"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
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
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            세미나 분야
          </h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 max-w-5xl">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`text-center group cursor-pointer ${
                    selectedCategory === category.id
                      ? "transform scale-105"
                      : ""
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div
                    className={`relative w-16 h-16 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300 ${
                      selectedCategory === category.id
                        ? "ring-4 ring-blue-500"
                        : ""
                    }`}
                  >
                    <img
                      src={
                        category.id === "all"
                          ? "/uploads/images/course-default.jpg"
                          : category.id === "교육학회"
                            ? "/uploads/photo3.jpg"
                            : category.id === "AI 컨퍼런스"
                              ? "/uploads/photo6.jpg"
                              : category.id === "워크샵"
                                ? "/uploads/photo7.jpg"
                                : category.id === "심포지엄"
                                  ? "/uploads/photo8.jpg"
                                  : category.id === "국제행사"
                                    ? "/uploads/photo9.jpg"
                                    : "/uploads/photo10.jpg"
                      }
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div
                      className={`absolute inset-0 bg-blue-600 ${
                        selectedCategory === category.id
                          ? "bg-opacity-30"
                          : "bg-opacity-20 group-hover:bg-opacity-10"
                      } transition-opacity duration-300`}
                    ></div>
                  </div>
                  <div
                    className={`font-medium text-sm transition-colors ${
                      selectedCategory === category.id
                        ? "text-blue-600 font-semibold"
                        : "text-gray-800 group-hover:text-blue-600"
                    }`}
                  >
                    {category.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {category.count}개
                  </div>
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

            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
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
            총{" "}
            <span className="font-semibold text-gray-800">
              {filteredSeminars.length}
            </span>
            개의 세미나가 있습니다.
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
          {seminarsLoading ? (
            Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                <CardContent className="p-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-20 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredSeminars.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                등록된 세미나가 없습니다
              </h3>
              <p className="text-gray-500">
                새로운 세미나가 곧 등록될 예정입니다.
              </p>
            </div>
          ) : (
            filteredSeminars.map((seminar) => (
              <Card
                key={seminar.id}
                className={`group hover:shadow-lg transition-all duration-300 overflow-hidden ${seminar.featured ? "border-2 border-yellow-400" : ""}`}
              >
                <div className="relative">
                  <img
                    src={getImageUrl(seminar)}
                    alt={seminar.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {seminar.featured && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        주목
                      </Badge>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge
                      className={`${getStatusColor(getSeminarStatus(seminar))} text-white`}
                    >
                      {getSeminarStatus(seminar)}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="outline" className="bg-white/90">
                      {seminar.type}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {seminar.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {seminar.description ||
                      "세미나에 대한 상세 정보를 확인해보세요."}
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
                    {/* 임시 태그 표시 */}
                    <Badge className="text-xs bg-blue-100 text-blue-800">
                      {seminar.type}
                    </Badge>
                    <Badge className="text-xs bg-green-100 text-green-800">
                      교육
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => handleWishlist(seminar.id, e)}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        관심등록
                      </Button>
                      <Link href={`/seminars/${seminar.id}`}>
                        <Button variant="outline" size="sm" className="flex-1">
                          신청하기
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Empty State */}
        {!seminarsLoading &&
          filteredSeminars.length === 0 &&
          seminars.length > 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-500">
                다른 검색어나 필터를 사용해보세요.
              </p>
            </div>
          )}

        {/* Pagination */}
        {filteredSeminars.length > 6 && (
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-600 text-white"
              >
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                다음
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
