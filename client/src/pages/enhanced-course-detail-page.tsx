import React, { useState, useEffect } from 'react';
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Play, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Users, 
  Star, 
  Download, 
  BookOpen, 
  Video, 
  FileQuestion,
  Laptop,
  Award,
  Calendar,
  MapPin,
  Globe,
  Heart,
  Share2,
  Eye,
  Volume2,
  SkipForward,
  Pause
} from "lucide-react";
import MultimediaLesson from "@/components/ui/multimedia-lesson";
import LearningProgressTracker from "@/components/ui/learning-progress-tracker";
import CourseProgressWidget from "@/components/ui/course-progress-widget";

export default function EnhancedCourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("intro");
  const [isSticky, setIsSticky] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});
  const [lessonProgress, setLessonProgress] = useState([
    {
      id: "lesson-1",
      title: "교육과정 개정의 배경과 필요성",
      type: "video" as const,
      duration: 30,
      completed: true,
      progress: 100,
      score: 95,
      timeSpent: 28
    },
    {
      id: "lesson-2", 
      title: "주요 변경 사항 분석",
      type: "reading" as const,
      duration: 20,
      completed: false,
      progress: 65,
      timeSpent: 13
    },
    {
      id: "lesson-3",
      title: "실습: 교육과정 설계",
      type: "assignment" as const,
      duration: 45,
      completed: false,
      progress: 0,
      timeSpent: 0
    },
    {
      id: "lesson-4",
      title: "이해도 평가 퀴즈",
      type: "quiz" as const,
      duration: 15,
      completed: false,
      progress: 0,
      timeSpent: 0
    }
  ]);

  // Fetch course data
  const { data: course, isLoading } = useQuery({
    queryKey: ["/api/courses", id],
    enabled: !!id,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const courseData = {
    title: "2025 교육과정 개정안 이해와 적용",
    period: "2025.07.01 - 2025.08.30",
    credit: 3,
    price: 150000,
    discountPrice: 120000,
    discountRate: 20,
    type: "온라인",
    totalHours: 45,
    level: "중급",
    students: 256,
    rating: 4.8,
    reviewCount: 78,
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop&crop=center"
  };

  const curriculumData = [
    {
      week: 1,
      title: "교육과정 개정의 배경과 필요성",
      totalDuration: 185,
      lessons: [
        { 
          id: "1-1",
          title: "교육과정 개정의 역사적 맥락", 
          duration: 60, 
          type: "영상",
          icon: Video,
          description: "교육과정 개정의 역사적 배경과 사회적 맥락을 이해합니다.",
          thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop"
        },
        { 
          id: "1-2",
          title: "2025 개정 교육과정의 배경", 
          duration: 50, 
          type: "영상",
          icon: Video,
          description: "미래 사회 변화에 따른 교육과정 개정의 필요성을 탐구합니다.",
          thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop"
        },
        { 
          id: "1-3",
          title: "국내외 교육과정 동향 분석", 
          duration: 45, 
          type: "영상",
          icon: Video,
          description: "세계 각국의 교육과정 개혁 사례를 분석하고 시사점을 도출합니다.",
          thumbnail: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=300&h=200&fit=crop"
        },
        { 
          id: "1-4",
          title: "1주차 학습 정리 및 퀴즈", 
          duration: 30, 
          type: "퀴즈",
          icon: FileQuestion,
          description: "1주차 학습 내용을 점검하고 이해도를 확인합니다.",
          questions: [
            {
              id: "q1-1",
              question: "2025 교육과정 개정의 가장 중요한 배경은 무엇인가요?",
              options: [
                "디지털 전환과 미래 역량 강화",
                "입시제도 개선",
                "교사 업무 경감",
                "교육비 절감"
              ],
              correct: 0
            },
            {
              id: "q1-2", 
              question: "핵심 역량 중심 교육과정의 특징으로 올바른 것은?",
              options: [
                "암기 중심 학습 강화",
                "창의적 문제해결력 중시",
                "표준화된 평가 확대",
                "교과 분리 강화"
              ],
              correct: 1
            }
          ]
        }
      ]
    },
    {
      week: 2,
      title: "2025 교육과정 개정안의 핵심 내용",
      totalDuration: 195,
      lessons: [
        { 
          id: "2-1",
          title: "핵심 역량 중심 교육과정의 이해", 
          duration: 55, 
          type: "영상",
          icon: Video,
          description: "미래 사회가 요구하는 핵심 역량과 교육과정의 연계를 학습합니다.",
          thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop"
        },
        { 
          id: "2-2",
          title: "교과별 성취기준 변화", 
          duration: 60, 
          type: "영상",
          icon: Video,
          description: "각 교과의 성취기준 변화와 특징을 상세히 분석합니다.",
          thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=200&fit=crop"
        },
        { 
          id: "2-3",
          title: "교수학습 및 평가 방향", 
          duration: 50, 
          type: "영상",
          icon: Video,
          description: "새로운 교수학습 방법과 과정 중심 평가의 방향을 제시합니다.",
          thumbnail: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=300&h=200&fit=crop"
        },
        { 
          id: "2-4",
          title: "2주차 실습 과제", 
          duration: 30, 
          type: "실습",
          icon: Laptop,
          description: "교과별 성취기준 분석 실습을 진행합니다.",
          materials: [
            { name: "성취기준 분석 워크시트", type: "DOCX", size: "2MB" },
            { name: "실습 가이드", type: "PDF", size: "5MB" }
          ]
        }
      ]
    }
  ];

  const instructors = [
    {
      name: "김교육 교수",
      position: "서울대학교 교육학과",
      expertise: "교육과정 및 교수설계",
      profile: "교육과정 전문가로 20년 이상의 연구 경력을 보유하고 있으며, 교육부 교육과정 개정 위원회 위원장을 역임했습니다.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
    },
    {
      name: "이혁신 박사",
      position: "한국교육개발원 연구위원",
      expertise: "교육정책 및 교육평가",
      profile: "교육정책 및 교육평가 분야의 전문가로 다수의 국가 교육정책 연구를 주도했습니다.",
      imageUrl: "https://images.unsplash.com/photo-1494790108755-2616c64e0ce7?w=200&h=200&fit=crop&crop=face"
    }
  ];

  const learningFeatures = [
    {
      icon: Video,
      title: "HD 고화질 동영상 강의",
      description: "1080p 고화질 동영상으로 선명한 강의를 제공합니다"
    },
    {
      icon: FileQuestion,
      title: "실시간 퀴즈 및 평가",
      description: "학습 진도에 따른 즉시 피드백 제공"
    },
    {
      icon: Laptop,
      title: "실습 중심 학습",
      description: "이론과 실무를 연계한 체험형 학습"
    },
    {
      icon: Award,
      title: "수료증 발급",
      description: "교육부 인정 수료증 자동 발급"
    }
  ];

  const handleVideoPlay = (lessonId: string) => {
    setIsVideoPlaying(true);
    console.log(`Playing video for lesson: ${lessonId}`);
  };

  const handleQuizSubmit = (weekIndex: number, lessonIndex: number, questionId: string) => {
    const lesson = curriculumData[weekIndex].lessons[lessonIndex];
    if (lesson.type === "퀴즈" && lesson.questions) {
      const question = lesson.questions.find(q => q.id === questionId);
      if (question) {
        const userAnswer = selectedQuizAnswer[questionId];
        const isCorrect = parseInt(userAnswer) === question.correct;
        setQuizResults(prev => ({
          ...prev,
          [questionId]: isCorrect
        }));
      }
    }
  };

  const renderLessonContent = (lesson: any, weekIndex: number, lessonIndex: number) => {
    switch (lesson.type) {
      case "영상":
        return (
          <div className="space-y-4">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              <img 
                src={lesson.thumbnail} 
                alt={lesson.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <Button 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 rounded-full p-4"
                  onClick={() => handleVideoPlay(lesson.id)}
                >
                  <Play className="h-6 w-6 ml-1" />
                </Button>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{lesson.duration}분</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600">{lesson.description}</p>
          </div>
        );
      
      case "퀴즈":
        return (
          <div className="space-y-6">
            <p className="text-gray-600">{lesson.description}</p>
            {lesson.questions?.map((question: any, qIndex: number) => (
              <Card key={question.id} className="p-4">
                <h4 className="font-medium mb-4">{question.question}</h4>
                <div className="space-y-2">
                  {question.options.map((option: string, optIndex: number) => (
                    <label key={optIndex} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name={question.id}
                        value={optIndex}
                        onChange={(e) => setSelectedQuizAnswer(prev => ({
                          ...prev,
                          [question.id]: e.target.value
                        }))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
                <Button 
                  className="mt-4"
                  onClick={() => handleQuizSubmit(weekIndex, lessonIndex, question.id)}
                  disabled={!selectedQuizAnswer[question.id]}
                >
                  정답 확인
                </Button>
                {quizResults[question.id] !== undefined && (
                  <div className={`mt-2 text-sm ${quizResults[question.id] ? 'text-green-600' : 'text-red-600'}`}>
                    {quizResults[question.id] ? '✓ 정답입니다!' : '✗ 틀렸습니다. 다시 시도해보세요.'}
                  </div>
                )}
              </Card>
            ))}
          </div>
        );
      
      case "실습":
        return (
          <div className="space-y-4">
            <p className="text-gray-600">{lesson.description}</p>
            {lesson.materials && (
              <div className="space-y-2">
                <h4 className="font-medium">실습 자료</h4>
                {lesson.materials.map((material: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{material.name}</p>
                        <p className="text-xs text-gray-500">{material.type} • {material.size}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      다운로드
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      default:
        return <p className="text-gray-600">{lesson.description}</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Course Image */}
                <div className="relative rounded-lg overflow-hidden aspect-video">
                  <img 
                    src={courseData.imageUrl} 
                    alt={courseData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <div className="flex items-center space-x-4 mb-4">
                      <Badge className="bg-blue-600 text-white">{courseData.type}</Badge>
                      <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                        {courseData.level}
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{courseData.title}</h1>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{courseData.totalHours}시간</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{courseData.students}명 수강</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{courseData.rating}점</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Features */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {learningFeatures.map((feature, index) => (
                    <Card key={index} className="p-4 text-center">
                      <feature.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className={`${isSticky ? 'fixed top-4 w-80' : ''} transition-all duration-300`}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="text-2xl font-bold text-blue-600">
                          {courseData.discountPrice?.toLocaleString()}원
                        </span>
                        {courseData.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {courseData.price.toLocaleString()}원
                          </span>
                        )}
                      </div>
                      {courseData.discountRate && (
                        <Badge variant="destructive">{courseData.discountRate}% 할인</Badge>
                      )}
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">수강 기간</span>
                        <span className="font-medium">{courseData.period}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">학점</span>
                        <span className="font-medium">{courseData.credit}학점</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">총 시간</span>
                        <span className="font-medium">{courseData.totalHours}시간</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        지금 수강신청
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4 mr-2" />
                          찜하기
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          공유
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="intro">강의 소개</TabsTrigger>
            <TabsTrigger value="curriculum">커리큘럼</TabsTrigger>
            <TabsTrigger value="instructor">강사 소개</TabsTrigger>
            <TabsTrigger value="reviews">수강후기</TabsTrigger>
          </TabsList>

          {/* Curriculum Tab with Enhanced Features */}
          <TabsContent value="curriculum" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>상세 커리큘럼</CardTitle>
                <p className="text-gray-600">
                  총 {curriculumData.length}주 과정으로 구성된 체계적인 학습 프로그램입니다.
                </p>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {curriculumData.map((week, weekIndex) => (
                    <AccordionItem key={week.week} value={`week-${week.week}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="text-left">
                            <h3 className="font-semibold">{week.week}주차: {week.title}</h3>
                            <p className="text-sm text-gray-600">
                              {week.lessons.length}개 강의 • 총 {week.totalDuration}분
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          {week.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0 mt-1">
                                    <lesson.icon className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{lesson.title}</h4>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                      <span className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{lesson.duration}분</span>
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {lesson.type}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {renderLessonContent(lesson, weekIndex, lessonIndex)}
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs content... */}
          <TabsContent value="intro">
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <h2>강의 소개</h2>
                  <p>
                    2025 교육과정 개정안은 미래 사회가 요구하는 역량을 갖춘 인재를 양성하기 위한 중요한 변화입니다. 
                    본 연수는 교육과정 개정안의 배경과 주요 내용을 체계적으로 이해하고, 이를 학교 현장에 효과적으로 
                    적용할 수 있는 실질적인 방법을 제공합니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor">
            <div className="grid gap-6 md:grid-cols-2">
              {instructors.map((instructor, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={instructor.imageUrl} alt={instructor.name} />
                        <AvatarFallback>{instructor.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{instructor.name}</h3>
                        <p className="text-blue-600 font-medium">{instructor.position}</p>
                        <p className="text-sm text-gray-600 mb-2">{instructor.expertise}</p>
                        <p className="text-sm text-gray-700">{instructor.profile}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-gray-500">수강후기가 준비 중입니다.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}