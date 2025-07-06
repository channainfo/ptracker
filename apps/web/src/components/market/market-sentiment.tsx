"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SentimentData {
  overall: number;
  fear: number;
  greed: number;
  volume: number;
  momentum: number;
  socialMedia: number;
  surveys: number;
  volatility: number;
  marketCap: number;
  dominance: number;
}

interface MarketSentimentProps {
  compact?: boolean;
}

export function MarketSentiment({ compact = false }: MarketSentimentProps) {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        setLoading(true);
        // Mock data - in a real app, this would be an API call
        const mockSentiment: SentimentData = {
          overall: 72,
          fear: 28,
          greed: 72,
          volume: 65,
          momentum: 78,
          socialMedia: 68,
          surveys: 75,
          volatility: 45,
          marketCap: 82,
          dominance: 58
        };

        setSentiment(mockSentiment);
        setError(null);
      } catch (err) {
        setError("Failed to fetch market sentiment");
        console.error("Error fetching sentiment:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, []);

  const getSentimentLabel = (value: number) => {
    if (value >= 80) return "Extreme Greed";
    if (value >= 60) return "Greed";
    if (value >= 40) return "Neutral";
    if (value >= 20) return "Fear";
    return "Extreme Fear";
  };

  const getSentimentColor = (value: number) => {
    if (value >= 80) return "text-red-500";
    if (value >= 60) return "text-orange-500";
    if (value >= 40) return "text-yellow-500";
    if (value >= 20) return "text-blue-500";
    return "text-purple-500";
  };

  const getSentimentIcon = (value: number) => {
    if (value >= 50) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Market Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-24 bg-muted rounded-lg mb-4"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !sentiment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Market Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{error || "Unable to load sentiment data"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="w-4 h-4" />
            Market Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall</span>
              <div className="flex items-center gap-2">
                {getSentimentIcon(sentiment.overall)}
                <span className={cn("text-sm font-bold", getSentimentColor(sentiment.overall))}>
                  {sentiment.overall}
                </span>
              </div>
            </div>
            <Progress value={sentiment.overall} className="h-2" />
            <div className="text-center">
              <Badge variant="outline" className={getSentimentColor(sentiment.overall)}>
                {getSentimentLabel(sentiment.overall)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Market Sentiment Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Sentiment */}
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="mx-auto w-32 h-32 rounded-full border-8 border-muted flex items-center justify-center">
                <div className="text-center">
                  <div className={cn("text-3xl font-bold", getSentimentColor(sentiment.overall))}>
                    {sentiment.overall}
                  </div>
                  <div className="text-xs text-muted-foreground">INDEX</div>
                </div>
              </div>
              <div className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, 
                    ${sentiment.overall >= 80 ? '#ef4444' : 
                      sentiment.overall >= 60 ? '#f97316' : 
                      sentiment.overall >= 40 ? '#eab308' : 
                      sentiment.overall >= 20 ? '#3b82f6' : '#8b5cf6'} 
                    ${sentiment.overall * 3.6}deg, 
                    transparent 0deg)`
                }}
              />
            </div>
            <div>
              <Badge variant="outline" className={cn("text-sm", getSentimentColor(sentiment.overall))}>
                {getSentimentLabel(sentiment.overall)}
              </Badge>
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Sentiment Breakdown
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Volume</span>
                  <span className="text-sm font-medium">{sentiment.volume}%</span>
                </div>
                <Progress value={sentiment.volume} className="h-1" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Momentum</span>
                  <span className="text-sm font-medium">{sentiment.momentum}%</span>
                </div>
                <Progress value={sentiment.momentum} className="h-1" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Social Media</span>
                  <span className="text-sm font-medium">{sentiment.socialMedia}%</span>
                </div>
                <Progress value={sentiment.socialMedia} className="h-1" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Surveys</span>
                  <span className="text-sm font-medium">{sentiment.surveys}%</span>
                </div>
                <Progress value={sentiment.surveys} className="h-1" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Volatility</span>
                  <span className="text-sm font-medium">{sentiment.volatility}%</span>
                </div>
                <Progress value={sentiment.volatility} className="h-1" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Market Cap</span>
                  <span className="text-sm font-medium">{sentiment.marketCap}%</span>
                </div>
                <Progress value={sentiment.marketCap} className="h-1" />
              </div>
            </div>
          </div>

          {/* Fear & Greed Indicators */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-purple-500">{sentiment.fear}</div>
              <div className="text-sm text-muted-foreground">Fear Index</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-orange-500">{sentiment.greed}</div>
              <div className="text-sm text-muted-foreground">Greed Index</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}