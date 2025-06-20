import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, User, LogOut, Settings, BookOpen, Calendar, Award, Menu, X } from "lucide-react";

interface HeaderProps {
  onNotificationClick?: () => void;
}

export default function Header({ onNotificationClick }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigation = [
    { name: '연수과정', href: '/courses', icon: BookOpen },
    { name: '학회/세미나', href: '/seminars', icon: Calendar },
    { name: '마이페이지', href: '/mypage', icon: User },
  ];

  if (user?.isAdmin) {
    navigation.push({ name: '관리자', href: '/admin', icon: Settings });
  }

  if (user?.role === 'admin') {
    navigation.push({ name: '슈퍼 관리자', href: '/super-admin', icon: Settings });
  }

  return (
    <header className="bg-white shadow-sm border-b">
      {/* Top Bar */}
      <div className="bg-primary text-white py-1">
        <div className="container mx-auto px-4 flex justify-between items-center text-xs">
          <span>{new Date().toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'short' 
          })}</span>
          <div className="flex space-x-4">
            {!user ? (
              <>
                <Link href="/auth" className="hover:underline cursor-pointer">
                  로그인
                </Link>
                <span>|</span>
                <Link href="/auth" className="hover:underline cursor-pointer">
                  회원가입
                </Link>
                <span>|</span>
              </>
            ) : null}
            <a href="#" className="hover:underline cursor-pointer">고객센터</a>
          </div>
        </div>
      </div>
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-10">
            <Link href="/" className="flex items-center">
              <img 
                src="/attached_assets/logo_1749658792927_1750413164821.webp" 
                alt="Jinuchem 로고" 
                className="h-10 w-auto mr-3"
              />
              <span className="text-2xl font-bold text-primary">연수플랫폼</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className="flex items-center space-x-1 text-gray-700 hover:text-primary font-medium cursor-pointer transition-colors">
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="과정 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 rounded-full border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </form>

            {user ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNotificationClick}
                  className="relative p-2"
                >
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">
                    3
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-white text-sm">
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block font-medium">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {user.isAdmin && (
                        <Badge variant="secondary" className="mt-1">관리자</Badge>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={user.userType === "business" ? "/business-dashboard" : "/mypage"} className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        {user.userType === "business" ? "기관 관리" : "마이페이지"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/courses" className="flex items-center cursor-pointer">
                        <BookOpen className="mr-2 h-4 w-4" />
                        수강 과정
                      </Link>
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          관리자 페이지
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="text-red-600 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth">
                <Button className="bg-primary hover:bg-blue-700 text-white">
                  <User className="mr-2 h-4 w-4" />
                  로그인
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="과정 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-300"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary font-medium py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
