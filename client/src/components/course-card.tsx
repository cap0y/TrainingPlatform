import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Star, Clock, Award } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  instructor?: string;
  duration?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  rating?: number;
  students?: number;
}

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const imageUrl = course.imageUrl || `https://images.unsplash.com/photo-${1522202176988 + course.id}-66273c2fd55f?w=400&h=250&fit=crop&crop=center`;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {course.category && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90">
              {course.category}
            </Badge>
          </div>
        )}
        {course.price && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-blue-600 text-white">
              {course.price.toLocaleString()}원
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {course.description}
        </p>
        
        {course.instructor && (
          <p className="text-sm text-gray-500 mb-3">강사: {course.instructor}</p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            {course.duration && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
            )}
            {course.students && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{course.students}명</span>
              </div>
            )}
            {course.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{course.rating}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link href={`/courses/${course.id}`} className="flex-1">
            <Button className="w-full">상세보기</Button>
          </Link>
          <Button variant="outline" size="icon">
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}