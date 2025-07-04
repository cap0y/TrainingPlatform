import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/contexts/cart-context";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  Menu,
  X,
  Mail,
  MessageCircle,
  BookOpen,
  GraduationCap,
  Brain,
  Globe,
  Star,
  HeadphonesIcon,
  School,
  FileText,
  Award,
  Users,
  Calendar,
  PenTool,
  BookCheck,
  HelpCircle,
  Building2,
  FileSpreadsheet,
  Phone,
  MessageSquare,
  Presentation,
  MapPin,
  Plane,
  Clock,
  Shield,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MessagePanel from "@/components/messages/message-panel";

const mainMenuItems = [
  {
    name: "나의강의실",
    href: "/mypage",
    icon: <School className="w-5 h-5 text-blue-600" />,
  },
  {
    name: "연수과정",
    href: "/courses",
    icon: <BookOpen className="w-5 h-5 text-green-600" />,
  },
  {
    name: "세미나",
    href: "/seminars",
    icon: <Presentation className="w-5 h-5 text-purple-600" />,
  },
  {
    name: "해외연수",
    href: "/study-abroad",
    icon: <Plane className="w-5 h-5 text-orange-600" />,
  },
  {
    name: "고객지원",
    href: "/support",
    icon: <HeadphonesIcon className="w-5 h-5 text-red-600" />,
  },
];

const megaMenuItems = [
  {
    title: "나의강의실",
    icon: <School className="w-6 h-6 text-blue-600 mb-2" />,
    items: [
      {
        name: "대시보드",
        href: "/mypage",
        icon: <BookCheck className="w-4 h-4 text-blue-600" />,
      },
      {
        name: "장바구니",
        href: "/cart",
        icon: <FileSpreadsheet className="w-4 h-4 text-blue-600" />,
      },
      {
        name: "관리자 화면",
        href: "/admin",
        icon: <Shield className="w-4 h-4 text-blue-600" />,
        adminOnly: true,
      },
      {
        name: "슈퍼 관리자",
        href: "/super-admin",
        icon: <Shield className="w-4 h-4 text-red-600" />,
        superAdminOnly: true,
      },
    ],
  },
  {
    title: "연수과정",
    icon: <BookOpen className="w-6 h-6 text-green-600 mb-2" />,
    items: [
      {
        name: "전체 연수과정",
        href: "/courses",
        icon: <GraduationCap className="w-4 h-4 text-green-600" />,
      },
      {
        name: "법정의무교육",
        href: "/training-courses",
        icon: <FileText className="w-4 h-4 text-green-600" />,
      },
      {
        name: "직무연수",
        href: "/professional-development",
        icon: <Users className="w-4 h-4 text-green-600" />,
      },
      {
        name: "자격연수",
        href: "/certificate-courses",
        icon: <Award className="w-4 h-4 text-green-600" />,
      },
    ],
  },
  {
    title: "세미나",
    icon: <Presentation className="w-6 h-6 text-purple-600 mb-2" />,
    items: [
      {
        name: "전체 세미나",
        href: "/seminars",
        icon: <Calendar className="w-4 h-4 text-purple-600" />,
      },
      {
        name: "교육학회",
        href: `/seminars/category/${encodeURIComponent("교육학회")}`,
        icon: <Brain className="w-4 h-4 text-purple-600" />,
      },
      {
        name: "AI 컨퍼런스",
        href: `/seminars/category/${encodeURIComponent("AI 컨퍼런스")}`,
        icon: <PenTool className="w-4 h-4 text-purple-600" />,
      },
      {
        name: "워크샵",
        href: `/seminars/category/${encodeURIComponent("워크샵")}`,
        icon: <PenTool className="w-4 h-4 text-purple-600" />,
      },
      {
        name: "심포지엄",
        href: `/seminars/category/${encodeURIComponent("심포지엄")}`,
        icon: <MapPin className="w-4 h-4 text-purple-600" />,
      },
      {
        name: "국제행사",
        href: `/seminars/category/${encodeURIComponent("국제행사")}`,
        icon: <Globe className="w-4 h-4 text-purple-600" />,
      },
      {
        name: "온라인세미나",
        href: `/seminars/category/${encodeURIComponent("온라인세미나")}`,
        icon: <Globe className="w-4 h-4 text-purple-600" />,
      },
    ],
  },
  {
    title: "해외연수",
    icon: <Plane className="w-6 h-6 text-orange-600 mb-2" />,
    items: [
      {
        name: "전체 해외연수",
        href: "/study-abroad",
        icon: <Globe className="w-4 h-4 text-orange-600" />,
      },
      {
        name: "교육시찰",
        href: `/study-abroad/category/${encodeURIComponent("교육시찰")}`,
        icon: <School className="w-4 h-4 text-orange-600" />,
      },
      {
        name: "연구연수",
        href: `/study-abroad/category/${encodeURIComponent("연구연수")}`,
        icon: <Brain className="w-4 h-4 text-orange-600" />,
      },
      {
        name: "교육과정개발",
        href: `/study-abroad/category/${encodeURIComponent("교육과정개발")}`,
        icon: <PenTool className="w-4 h-4 text-orange-600" />,
      },
      {
        name: "국제교류",
        href: `/study-abroad/category/${encodeURIComponent("국제교류")}`,
        icon: <Users className="w-4 h-4 text-orange-600" />,
      },
      {
        name: "어학연수",
        href: `/study-abroad/category/${encodeURIComponent("어학연수")}`,
        icon: <MessageSquare className="w-4 h-4 text-orange-600" />,
      },
      {
        name: "문화체험",
        href: `/study-abroad/category/${encodeURIComponent("문화체험")}`,
        icon: <MapPin className="w-4 h-4 text-orange-600" />,
      },
    ],
  },
  {
    title: "고객지원",
    icon: <HeadphonesIcon className="w-6 h-6 text-red-600 mb-2" />,
    items: [
      {
        name: "공지사항",
        href: "/announcements",
        icon: <Bell className="w-4 h-4 text-red-600" />,
      },
      {
        name: "자주묻는 질문",
        href: "/help",
        icon: <HelpCircle className="w-4 h-4 text-red-600" />,
      },
      {
        name: "BrainAI 소개",
        href: "/support/about",
        icon: <Building2 className="w-4 h-4 text-red-600" />,
      },
    ],
  },
];

export default function Header({
  onNotificationClick,
}: {
  onNotificationClick?: () => void;
}) {
  const { user, logoutMutation } = useAuth();
  const { itemCount } = useCart();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [showMessagePanel, setShowMessagePanel] = useState(false);

  // 읽지 않은 쪽지 수 조회
  const { data: unreadMessageCount } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread/count"],
    enabled: !!user,
    refetchInterval: 30000, // 30초마다 갱신
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleMessageClick = () => {
    if (user) {
      setShowMessagePanel(true);
    } else {
      setLocation("/auth");
    }
  };

  return (
    <>
      <header className="relative z-50">
        {/* Top Bar */}
        <div className="bg-primary text-white py-1">
          <div className="container mx-auto px-4 flex justify-between items-center text-xs">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img
                  src="/uploads/images/logo_1749658792927.webp"
                  alt="BrainAI 로고"
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="고품격 명강의"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[300px] pl-10 pr-4 py-1 rounded-full text-gray-900 text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </form>
            <div className="flex items-center space-x-6">
              <button
                onClick={handleMessageClick}
                className="flex items-center text-sm hover:bg-white/10 px-2 py-1 rounded transition-colors space-x-1 md:space-x-1"
              >
                {user && unreadMessageCount && unreadMessageCount.count > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-red-500 text-white border-none"
                  >
                    {unreadMessageCount.count}
                  </Badge>
                )}
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">쪽지</span>
              </button>
              <Link
                href="/cart"
                className="flex items-center text-sm space-x-1 md:space-x-1"
              >
                {itemCount > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-red-500 text-white border-none"
                  >
                    {itemCount}
                  </Badge>
                )}
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">장바구니</span>
              </Link>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white text-sm">
                      <User className="h-4 w-4 mr-1" />
                      <span>{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {user.isAdmin && (
                        <Badge variant="secondary" className="mt-1">
                          관리자
                        </Badge>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/mypage" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        마이페이지
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleMessageClick}>
                      <Mail className="mr-2 h-4 w-4" />
                      쪽지함
                      {unreadMessageCount && unreadMessageCount.count > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-auto text-xs"
                        >
                          {unreadMessageCount.count}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          관리자 화면
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/super-admin" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4 text-red-600" />
                          슈퍼 관리자
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={logoutMutation?.isPending}
                      className="text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {logoutMutation?.isPending
                        ? "로그아웃 중..."
                        : "로그아웃"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" className="text-white text-sm">
                    로그인
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="hidden md:flex justify-center space-x-8">
              {mainMenuItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setHoveredMenu(item.name)}
                  onMouseLeave={() => setHoveredMenu(null)}
                >
                  <Link href={item.href}>
                    <button className="px-4 py-4 text-gray-700 hover:text-primary font-medium flex items-center space-x-2 whitespace-nowrap">
                      {item.icon}
                      <span>{item.name}</span>
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </nav>

        {/* Mega Menu */}
        {hoveredMenu && (
          <div
            className="absolute w-full bg-white shadow-lg border-t z-40"
            onMouseEnter={() => setHoveredMenu(hoveredMenu)}
            onMouseLeave={() => setHoveredMenu(null)}
            style={{ top: "100%" }}
          >
            <div className="container mx-auto px-4 py-4">
              <div className="grid grid-cols-5 gap-4">
                {megaMenuItems.map((menu, index) => (
                  <div
                    key={menu.title}
                    className={cn(
                      "space-y-2 relative",
                      hoveredMenu === menu.title ? "opacity-100" : "opacity-70",
                      index < megaMenuItems.length - 1
                        ? "border-r border-gray-200"
                        : "",
                    )}
                  >
                    <div className="flex items-center space-x-2 px-4">
                      {menu.icon}
                      <h3 className="font-semibold text-gray-900">
                        {menu.title}
                      </h3>
                    </div>
                    <ul className="space-y-1 px-4">
                      {menu.items.map(
                        (item) =>
                          (!item.adminOnly ||
                            (item.adminOnly && user?.isAdmin)) &&
                          (!item.superAdminOnly ||
                            (item.superAdminOnly &&
                              user?.role === "admin")) && (
                            <li key={item.name}>
                              <Link href={item.href}>
                                <div className="block text-sm text-gray-600 hover:text-primary transition-colors duration-200">
                                  <span className="font-medium">
                                    {item.name}
                                  </span>
                                </div>
                              </Link>
                            </li>
                          ),
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="md:hidden fixed top-8 right-4 z-50 bg-white p-2 rounded-full shadow-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-y-0 bg-white z-40 md:hidden overflow-y-auto pt-16 w-1/2 shadow-lg">
            <div className="px-4 py-4">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="연수과정 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </form>
              <div className="space-y-4">
                {megaMenuItems.map((menu) => (
                  <div key={menu.title} className="mb-4">
                    <div className="flex items-center space-x-2 mb-3">
                      {menu.icon}
                      <h3 className="font-semibold text-base">{menu.title}</h3>
                    </div>
                    <ul className="space-y-2 pl-8">
                      {menu.items.map(
                        (item) =>
                          (!item.adminOnly ||
                            (item.adminOnly && user?.isAdmin)) &&
                          (!item.superAdminOnly ||
                            (item.superAdminOnly &&
                              user?.role === "admin")) && (
                            <li key={item.name}>
                              <Link href={item.href}>
                                <div
                                  className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <span>{item.name}</span>
                                </div>
                              </Link>
                            </li>
                          ),
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Message Panel Modal */}
      {showMessagePanel && (
        <MessagePanel onClose={() => setShowMessagePanel(false)} />
      )}
    </>
  );
}
