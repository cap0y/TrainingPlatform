import React, { useState } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Tag,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface Notice {
  id: number;
  title: string;
  date: string;
  category: string;
  content: string;
  author: string;
  views: number;
  important: boolean;
  createdAt: string;
}

const AllAnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [expandedNotice, setExpandedNotice] = useState<number | null>(null);
  const [newNotice, setNewNotice] = useState({
    title: "",
    category: "",
    content: "",
    important: false
  });

  const itemsPerPage = 10;

  // 공지사항 목록 조회
  const { data: noticesData, isLoading, error } = useQuery<{ notices: Notice[] }>({
    queryKey: ["/api/notices"],
  });

  // 공지사항 생성 뮤테이션
  const createNoticeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("공지사항 생성에 실패했습니다.");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      setIsAddDialogOpen(false);
      setEditingNotice(null);
      setNewNotice({ title: "", category: "", content: "", important: false });
    },
  });

  // 공지사항 수정 뮤테이션
  const updateNoticeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/notices/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("공지사항 수정에 실패했습니다.");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      setIsAddDialogOpen(false);
      setEditingNotice(null);
      setNewNotice({ title: "", category: "", content: "", important: false });
    },
  });

  // 공지사항 삭제 뮤테이션
  const deleteNoticeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/notices/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("공지사항 삭제에 실패했습니다.");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
    },
  });

  // 조회수 증가 뮤테이션
  const incrementViewsMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/notices/${id}/views`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("조회수 증가에 실패했습니다.");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
    },
  });

  const notices = noticesData?.notices || [];
  const categories = ["all", "공지", "안내", "이벤트", "점검"];

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || notice.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNotices = filteredNotices.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNoticeClick = (noticeId: number) => {
    if (expandedNotice === noticeId) {
      setExpandedNotice(null);
    } else {
      setExpandedNotice(noticeId);
      // 조회수 증가
      incrementViewsMutation.mutate(noticeId);
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setNewNotice({
      title: notice.title,
      category: notice.category,
      content: notice.content,
      important: notice.important
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      deleteNoticeMutation.mutate(id);
    }
  };

  const handleAddNotice = () => {
    setEditingNotice(null);
    setNewNotice({ title: "", category: "", content: "", important: false });
    setIsAddDialogOpen(true);
  };

  const handleSaveNotice = () => {
    if (!newNotice.title || !newNotice.category || !newNotice.content) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    if (editingNotice) {
      // 수정
      updateNoticeMutation.mutate({
        id: editingNotice.id,
        data: newNotice
      });
    } else {
      // 새 공지사항 추가
      createNoticeMutation.mutate(newNotice);
    }
  };

  const isAdmin = user?.isAdmin || user?.role === 'admin';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">공지사항을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">공지사항을 불러오는데 실패했습니다.</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/notices"] })}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">공지사항</h1>
          <p className="text-xl">중요한 공지사항과 업데이트 소식을 확인하세요</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="공지사항 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 items-center">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {categories.slice(1).map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isAdmin && (
                  <Button onClick={handleAddNotice}>
                    <Plus className="h-4 w-4 mr-2" />
                    공지사항 작성
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Notice List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-200">
              {currentNotices.map((notice) => (
                <div key={notice.id} className="hover:bg-gray-50 transition-colors">
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => handleNoticeClick(notice.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {notice.important && (
                            <Badge className="bg-red-500 text-white">중요</Badge>
                          )}
                          <Badge variant="outline">{notice.category}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {notice.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{notice.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{notice.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{notice.views}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(notice);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notice.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {expandedNotice === notice.id ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {expandedNotice === notice.id && (
                    <div className="px-6 pb-6 border-t bg-gray-50">
                      <div className="pt-4">
                        <div className="prose max-w-none">
                          <div className="whitespace-pre-wrap text-gray-700">
                            {notice.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Notice Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingNotice ? '공지사항 수정' : '새 공지사항 작성'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={newNotice.title}
                onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                placeholder="공지사항 제목을 입력하세요"
              />
            </div>
            
            <div>
              <Label htmlFor="category">카테고리</Label>
              <Select value={newNotice.category} onValueChange={(value) => setNewNotice({...newNotice, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {categories.slice(1).map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={newNotice.content}
                onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                placeholder="공지사항 내용을 입력하세요"
                className="min-h-[200px]"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="important"
                checked={newNotice.important}
                onChange={(e) => setNewNotice({...newNotice, important: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="important">중요 공지사항</Label>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSaveNotice}>
              {editingNotice ? '수정' : '작성'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AllAnnouncementsPage;