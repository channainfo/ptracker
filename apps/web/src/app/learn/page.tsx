import { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Play, Clock, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Learn - PTracker",
  description: "Learn about cryptocurrency trading and investment strategies",
};

export default function LearnPage() {
  const courses = [
    {
      id: 1,
      title: "Cryptocurrency Fundamentals",
      description: "Learn the basics of cryptocurrency, blockchain technology, and how digital assets work.",
      level: "Beginner",
      duration: "2 hours",
      lessons: 8,
      progress: 0,
      image: "/api/placeholder/400/200"
    },
    {
      id: 2,
      title: "Technical Analysis Basics",
      description: "Master chart patterns, indicators, and technical analysis for crypto trading.",
      level: "Intermediate",
      duration: "3 hours",
      lessons: 12,
      progress: 45,
      image: "/api/placeholder/400/200"
    },
    {
      id: 3,
      title: "Portfolio Management",
      description: "Learn how to build and manage a diversified cryptocurrency portfolio.",
      level: "Intermediate",
      duration: "2.5 hours",
      lessons: 10,
      progress: 20,
      image: "/api/placeholder/400/200"
    },
    {
      id: 4,
      title: "DeFi and Yield Farming",
      description: "Understand decentralized finance protocols and yield farming strategies.",
      level: "Advanced",
      duration: "4 hours",
      lessons: 15,
      progress: 0,
      image: "/api/placeholder/400/200"
    }
  ];

  const articles = [
    {
      title: "Understanding Market Volatility",
      readTime: "5 min read",
      category: "Market Analysis"
    },
    {
      title: "How to Read Candlestick Charts",
      readTime: "8 min read",
      category: "Technical Analysis"
    },
    {
      title: "Dollar-Cost Averaging Strategy",
      readTime: "6 min read",
      category: "Investment Strategy"
    },
    {
      title: "Security Best Practices",
      readTime: "10 min read",
      category: "Security"
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Learn</h1>
            <p className="text-muted-foreground">
              Expand your knowledge of cryptocurrency trading and investment strategies
            </p>
          </div>

          {/* Featured Courses */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Featured Courses</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                      {course.progress > 0 && (
                        <Badge variant="outline">
                          {course.progress}% Complete
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{course.lessons} lessons</span>
                      </div>
                    </div>

                    {course.progress > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <Button className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      {course.progress > 0 ? "Continue Learning" : "Start Course"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Articles & Resources */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Articles & Resources</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((article, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{article.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge variant="outline">{article.category}</Badge>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{article.readTime}</span>
                          </div>
                        </div>
                      </div>
                      <BookOpen className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Learning Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-2">3</div>
                <div className="text-sm text-muted-foreground">Courses Started</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-2">12</div>
                <div className="text-sm text-muted-foreground">Lessons Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-2">8h</div>
                <div className="text-sm text-muted-foreground">Learning Time</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}