"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, ExternalLink, Clock, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  category: "market" | "crypto" | "general";
  sentiment: "positive" | "negative" | "neutral";
  imageUrl?: string;
}

interface NewsStreamProps {
  maxItems?: number;
  category?: "market" | "crypto" | "general" | "all";
}

export function NewsStream({ maxItems = 10, category = "all" }: NewsStreamProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // For now, we'll simulate with mock data
        const mockNews: NewsItem[] = [
          {
            id: "1",
            title: "Bitcoin Reaches New All-Time High Amid Institutional Adoption",
            summary: "Bitcoin price surged past $70,000 as major institutions continue to invest in cryptocurrency portfolios.",
            source: "CryptoNews",
            publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            url: "#",
            category: "crypto",
            sentiment: "positive",
            imageUrl: "/api/placeholder/300/200"
          },
          {
            id: "2",
            title: "Federal Reserve Announces Interest Rate Decision",
            summary: "The Fed maintains current interest rates while signaling potential changes in monetary policy.",
            source: "Financial Times",
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            url: "#",
            category: "market",
            sentiment: "neutral"
          },
          {
            id: "3",
            title: "Ethereum 2.0 Staking Rewards Reach Record Levels",
            summary: "Ethereum validators are seeing increased rewards as network activity continues to grow.",
            source: "DeFi Pulse",
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            url: "#",
            category: "crypto",
            sentiment: "positive"
          },
          {
            id: "4",
            title: "Market Volatility Continues Amid Global Economic Uncertainty",
            summary: "Stock markets experience increased volatility as investors react to geopolitical developments.",
            source: "Market Watch",
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
            url: "#",
            category: "market",
            sentiment: "negative"
          },
          {
            id: "5",
            title: "New Cryptocurrency Regulations Proposed by EU Parliament",
            summary: "The European Union introduces comprehensive framework for digital asset regulation.",
            source: "EU Financial News",
            publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
            url: "#",
            category: "crypto",
            sentiment: "neutral"
          }
        ];

        // Filter by category if specified
        const filteredNews = category === "all" 
          ? mockNews 
          : mockNews.filter(item => item.category === category);

        setNews(filteredNews.slice(0, maxItems));
        setError(null);
      } catch (err) {
        setError("Failed to fetch news");
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [maxItems, category]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "negative":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "crypto":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "market":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            News Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            News Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="w-5 h-5" />
          News Stream
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((item) => (
            <div
              key={item.id}
              className="border-b border-border pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className={getCategoryColor(item.category)}
                    >
                      {item.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getSentimentColor(item.sentiment)}
                    >
                      {item.sentiment}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {item.summary}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{item.source}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(new Date(item.publishedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={() => window.open(item.url, "_blank")}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                {item.imageUrl && (
                  <div className="w-20 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {news.length === 0 && (
          <div className="text-center py-8">
            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No news articles available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}