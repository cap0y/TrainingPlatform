import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Card } from "@/components/ui/card";

interface Notice {
  id: number;
  title: string;
  date: string;
  category: string;
}

const AllAnnouncementsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [notices, setNotices] = useState<Notice[]>([
    { id: 1, title: '2025년 하계 연수 일정 안내', date: '2025.06.15', category: '공지' },
    { id: 2, title: '교육부 인정 연수 과정 업데이트 안내', date: '2025.06.10', category: '안내' },
    { id: 3, title: '연수 플랫폼 서비스 개선 안내', date: '2025.06.05', category: '공지' },
    { id: 4, title: '하계 학회 참가 신청 마감 연장', date: '2025.06.01', category: '안내' },
    { id: 5, title: '2025년 교원 자격 연수 신청 안내', date: '2025.05.28', category: '공지' },
    { id: 6, title: '플랫폼 이용 가이드 업데이트 안내', date: '2025.05.25', category: '안내' },
    { id: 7, title: '교육부 주관 세미나 참가자 모집', date: '2025.05.20', category: '공지' },
    { id: 8, title: '온라인 연수 신규 과정 오픈 안내', date: '2025.05.15', category: '안내' },
    { id: 9, title: '시스템 점검에 따른 서비스 일시 중단 안내', date: '2025.05.10', category: '공지' },
    { id: 10, title: '교육 연구 공모전 참가자 모집', date: '2025.05.05', category: '기타' },
    { id: 11, title: '2025년 2학기 학점 인정 연수 안내', date: '2025.05.01', category: '공지' },
    { id: 12, title: '교육 콘텐츠 개발자 모집 공고', date: '2025.04.28', category: '기타' },
    { id: 13, title: '교원 평가 관련 워크숍 개최 안내', date: '2025.04.25', category: '안내' },
    { id: 14, title: '연수 플랫폼 모바일 앱 출시 안내', date: '2025.04.20', category: '공지' },
    { id: 15, title: '교육 혁신 포럼 참가자 모집', date: '2025.04.15', category: '안내' },
    { id: 16, title: '2025년 교육 트렌드 보고서 발간 안내', date: '2025.04.10', category: '기타' },
    { id: 17, title: '신규 회원 가입 혜택 안내', date: '2025.04.05', category: '공지' },
    { id: 18, title: '연수 수료증 발급 절차 변경 안내', date: '2025.04.01', category: '안내' },
    { id: 19, title: '교육 콘텐츠 품질 향상을 위한 설문조사 참여 안내', date: '2025.03.28', category: '기타' },
    { id: 20, title: '2025년 봄학기 연수 과정 안내', date: '2025.03.25', category: '공지' },
    { id: 21, title: '결제 시스템 업데이트 안내', date: '2025.03.20', category: '안내' },
    { id: 22, title: '교육 전문가 초청 특강 안내', date: '2025.03.15', category: '공지' },
    { id: 23, title: '학습자 커뮤니티 오픈 안내', date: '2025.03.10', category: '안내' },
    { id: 24, title: '연수 플랫폼 이용 만족도 조사 결과 발표', date: '2025.03.05', category: '기타' },
    { id: 25, title: '2025년 교육 정책 설명회 개최 안내', date: '2025.03.01', category: '공지' }
  ]);

  const itemsPerPage = 10;
  const filteredNotices = notices.filter(notice => {
    const matchesCategory = activeCategory === '전체' || notice.category === activeCategory;
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const currentNotices = filteredNotices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (id: number, currentTitle: string) => {
    setIsEditing(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = (id: number) => {
    setNotices(prev => 
      prev.map(notice => 
        notice.id === id ? { ...notice, title: editTitle } : notice
      )
    );
    setIsEditing(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditTitle('');
  };

  const handleAddNotice = () => {
    const newId = Math.max(...notices.map(n => n.id)) + 1;
    const newNotice: Notice = {
      id: newId,
      title: '새 공지사항',
      date: new Date().toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).replace(/\. /g, '.').replace('.', ''),
      category: '공지'
    };
    setNotices(prev => [newNotice, ...prev]);
    setIsEditing(newId);
    setEditTitle('새 공지사항');
  };

  const handleDelete = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setNotices(prev => prev.filter(notice => notice.id !== id));
    }
  };

  const categories = ['전체', '공지', '안내', '기타'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-blue-600">에듀플랫폼</h1>
              <nav className="hidden md:flex space-x-6">
                <a href="/" className="text-gray-600 hover:text-blue-600">홈</a>
                <a href="/training" className="text-gray-600 hover:text-blue-600">연수 프로그램</a>
                <a href="/courses" className="text-gray-600 hover:text-blue-600">교육과정</a>
                <a href="/seminars" className="text-gray-600 hover:text-blue-600">세미나</a>
                <a href="/notices" className="text-blue-600 font-medium">공지사항</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">로그인</Button>
              <Button>회원가입</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">공지사항</h2>
          <p className="text-xl mb-8">최신 소식과 중요한 안내사항을 확인하세요</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="공지사항을 검색하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={handleAddNotice} className="bg-blue-600 hover:bg-blue-700">
              <i className="fas fa-plus mr-2"></i>
              새 공지 작성
            </Button>
          </div>

          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Notice List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                총 {filteredNotices.length}건의 공지사항
              </h3>
              <span className="text-sm text-gray-500">
                {currentPage} / {totalPages} 페이지
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {currentNotices.length > 0 ? (
              currentNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge 
                          variant={notice.category === '공지' ? 'default' : 'secondary'}
                          className={notice.category === '공지' ? 'bg-blue-600' : ''}
                        >
                          {notice.category}
                        </Badge>
                        <span className="text-sm text-gray-500">{notice.date}</span>
                      </div>
                      
                      {isEditing === notice.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(notice.id);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(notice.id)}
                          >
                            저장
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            취소
                          </Button>
                        </div>
                      ) : (
                        <h4 className="text-lg font-medium text-gray-800 hover:text-blue-600 cursor-pointer">
                          {notice.title}
                        </h4>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {isEditing !== notice.id && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(notice.id, notice.title)}
                          >
                            <i className="fas fa-edit mr-1"></i>
                            편집
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(notice.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <i className="fas fa-trash mr-1"></i>
                            삭제
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost">
                        <i className="fas fa-chevron-right"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <i className="fas fa-search text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
                <p className="text-gray-400 text-sm mt-2">
                  다른 검색어나 카테고리를 시도해보세요.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-6 border-t border-gray-200">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => handlePageChange(totalPages)}
                          isActive={currentPage === totalPages}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">빠른 바로가기</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center">
                <i className="fas fa-bell text-3xl text-blue-600 mb-2"></i>
                <h4 className="font-medium mb-1">알림 설정</h4>
                <p className="text-sm text-gray-600">새 공지사항 알림 받기</p>
              </div>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center">
                <i className="fas fa-download text-3xl text-green-600 mb-2"></i>
                <h4 className="font-medium mb-1">자료 다운로드</h4>
                <p className="text-sm text-gray-600">공지사항 첨부파일</p>
              </div>
            </Card>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center">
                <i className="fas fa-headset text-3xl text-purple-600 mb-2"></i>
                <h4 className="font-medium mb-1">고객지원</h4>
                <p className="text-sm text-gray-600">궁금한 점이 있으신가요?</p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4">에듀플랫폼</h4>
              <p className="text-gray-400">전문적인 교육 서비스를 제공하는 온라인 플랫폼입니다.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">바로가기</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/courses" className="hover:text-white">교육과정</a></li>
                <li><a href="/seminars" className="hover:text-white">세미나</a></li>
                <li><a href="/notices" className="hover:text-white">공지사항</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">고객지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li>전화: 02-1234-5678</li>
                <li>이메일: support@eduplatform.kr</li>
                <li>운영시간: 평일 09:00-18:00</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AllAnnouncementsPage;