import { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { MarketSentiment } from "@/components/market/market-sentiment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Market Sentiment - PTracker",
  description: "Analyze market sentiment and trends",
};

export default function MarketPage() {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Market Sentiment</h1>
            <p className="text-muted-foreground">
              Analyze market sentiment and trends across different indicators
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Sentiment Analysis */}
            <div className="lg:col-span-1">
              <MarketSentiment />
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Market Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">+12.5%</div>
                      <div className="text-sm text-muted-foreground">24h Change</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">$2.1T</div>
                      <div className="text-sm text-muted-foreground">Market Cap</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Movers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">BTC</span>
                        </div>
                        <span className="font-medium">Bitcoin</span>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-medium">+8.5%</div>
                        <div className="text-sm text-muted-foreground">$68,500</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">ETH</span>
                        </div>
                        <span className="font-medium">Ethereum</span>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-medium">+12.3%</div>
                        <div className="text-sm text-muted-foreground">$3,850</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">SOL</span>
                        </div>
                        <span className="font-medium">Solana</span>
                      </div>
                      <div className="text-right">
                        <div className="text-red-600 font-medium">-3.2%</div>
                        <div className="text-sm text-muted-foreground">$145</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Volume Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">24h Volume</span>
                    <span className="text-sm font-medium">$85.2B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Change</span>
                    <span className="text-sm font-medium text-green-600">+15.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Volume</span>
                    <span className="text-sm font-medium">$74.1B</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Social Sentiment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Twitter Mentions</span>
                    <span className="text-sm font-medium">+22%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Reddit Activity</span>
                    <span className="text-sm font-medium">+18%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">News Sentiment</span>
                    <span className="text-sm font-medium text-green-600">Positive</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Technical Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">RSI (14)</span>
                    <span className="text-sm font-medium">68.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">MACD</span>
                    <span className="text-sm font-medium text-green-600">Bullish</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Moving Avg</span>
                    <span className="text-sm font-medium text-green-600">Above</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}