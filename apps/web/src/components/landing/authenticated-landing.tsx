'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Briefcase, 
  TrendingUp, 
  Newspaper, 
  GraduationCap, 
  Settings,
  ArrowRight,
  Star,
  Target,
  BookOpen,
  Bell,
  Plus
} from 'lucide-react';

export function AuthenticatedLanding() {
  const { user } = useAuth();

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const getGreeting = () => {
    const timeOfDay = getTimeOfDay();
    const name = user?.firstName || 'there';
    return `Good ${timeOfDay}, ${name}!`;
  };

  const quickActions = [
    {
      title: 'View Dashboard',
      description: 'Check your portfolio performance and market overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      color: 'bg-blue-500',
      badge: 'Popular'
    },
    {
      title: 'Manage Portfolio',
      description: 'Add assets, track holdings, and analyze allocation',
      href: '/portfolio',
      icon: Briefcase,
      color: 'bg-green-500',
      badge: null
    },
    {
      title: 'Market Analysis',
      description: 'Explore market sentiment and trading insights',
      href: '/market',
      icon: TrendingUp,
      color: 'bg-purple-500',
      badge: 'Live'
    },
    {
      title: 'Latest News',
      description: 'Stay updated with crypto and market news',
      href: '/news',
      icon: Newspaper,
      color: 'bg-orange-500',
      badge: null
    }
  ];

  const learningResources = [
    {
      title: 'Advanced Trading Strategies',
      description: 'Learn sophisticated trading techniques and risk management',
      href: '/learn/advanced-trading',
      duration: '45 min',
      level: 'Advanced'
    },
    {
      title: 'DeFi and Yield Farming',
      description: 'Understand decentralized finance and earning opportunities',
      href: '/learn/defi',
      duration: '30 min',
      level: 'Intermediate'
    },
    {
      title: 'Technical Analysis Mastery',
      description: 'Master chart patterns and technical indicators',
      href: '/learn/technical-analysis',
      duration: '60 min',
      level: 'Intermediate'
    }
  ];

  const recentUpdates = [
    {
      title: 'New Portfolio Analytics Feature',
      description: 'Enhanced performance tracking with detailed metrics',
      time: '2 hours ago',
      type: 'feature'
    },
    {
      title: 'Market Alert: Bitcoin Momentum',
      description: 'BTC showing strong bullish momentum in the last 24h',
      time: '4 hours ago',
      type: 'alert'
    },
    {
      title: 'Educational Content Added',
      description: 'New course on cryptocurrency taxation available',
      time: '1 day ago',
      type: 'education'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {getGreeting()}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Welcome back to your crypto investment hub. Here's what's happening with your portfolio and the market.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">$12,450</div>
                <div className="text-sm text-muted-foreground">Portfolio Value</div>
                <div className="text-xs text-green-600 mt-1">+5.2% today</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">8</div>
                <div className="text-sm text-muted-foreground">Assets Tracked</div>
                <div className="text-xs text-muted-foreground mt-1">3 watchlist items</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">72</div>
                <div className="text-sm text-muted-foreground">Market Sentiment</div>
                <div className="text-xs text-orange-600 mt-1">Greed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-primary mb-2">3</div>
                <div className="text-sm text-muted-foreground">Active Alerts</div>
                <div className="text-xs text-blue-600 mt-1">2 price targets</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Quick Actions</h2>
            <p className="text-muted-foreground">Jump right into what you need to do</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <Link href={action.href}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      {action.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {action.description}
                    </p>
                    <div className="flex items-center text-primary text-sm group-hover:translate-x-1 transition-transform">
                      <span>Get started</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Two Column Layout */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Learning Resources */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Continue Learning</h2>
                <p className="text-muted-foreground">Enhance your trading skills with these recommended courses</p>
              </div>
              
              <div className="space-y-4">
                {learningResources.map((resource, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <BookOpen className="w-5 h-5 text-primary mt-1" />
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {resource.level}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {resource.duration}
                          </Badge>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {resource.description}
                      </p>
                      <Link href={resource.href}>
                        <Button variant="outline" size="sm">
                          <GraduationCap className="w-4 h-4 mr-2" />
                          Start Course
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6">
                <Link href="/learn">
                  <Button variant="outline" className="w-full">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse All Courses
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recent Updates & Notifications */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Recent Updates</h2>
                <p className="text-muted-foreground">Stay informed about platform updates and market alerts</p>
              </div>
              
              <div className="space-y-4">
                {recentUpdates.map((update, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${
                          update.type === 'feature' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' :
                          update.type === 'alert' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' :
                          'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {update.type === 'feature' ? <Star className="w-4 h-4" /> :
                           update.type === 'alert' ? <Bell className="w-4 h-4" /> :
                           <BookOpen className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">
                            {update.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {update.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {update.time}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 space-y-3">
                <Link href="/settings">
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Notifications
                  </Button>
                </Link>
                <Link href="/portfolio">
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Asset
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}