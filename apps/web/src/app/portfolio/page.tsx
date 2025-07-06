import { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Eye, 
  EyeOff,
  MoreHorizontal,
  PieChart,
  Activity
} from "lucide-react";

export const metadata: Metadata = {
  title: "Portfolio - PTracker",
  description: "Manage and track your cryptocurrency portfolio",
};

export default function PortfolioPage() {
  const holdings = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      amount: "0.15",
      value: "$10,275.00",
      change: "+$425.30",
      changePercent: "+4.32%",
      isPositive: true,
      price: "$68,500.00",
      allocation: 45.2
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      amount: "2.5",
      value: "$9,625.00",
      change: "+$1,125.50",
      changePercent: "+13.25%",
      isPositive: true,
      price: "$3,850.00",
      allocation: 42.3
    },
    {
      symbol: "SOL",
      name: "Solana",
      amount: "15.0",
      value: "$2,175.00",
      change: "-$75.20",
      changePercent: "-3.34%",
      isPositive: false,
      price: "$145.00",
      allocation: 9.6
    },
    {
      symbol: "ADA",
      name: "Cardano",
      amount: "1,500",
      value: "$675.00",
      change: "+$25.50",
      changePercent: "+3.92%",
      isPositive: true,
      price: "$0.45",
      allocation: 3.0
    }
  ];

  const totalValue = holdings.reduce((sum, holding) => sum + parseFloat(holding.value.replace(/[$,]/g, "")), 0);
  const totalChange = holdings.reduce((sum, holding) => sum + parseFloat(holding.change.replace(/[$,+-]/g, "")), 0);
  const totalChangePercent = (totalChange / (totalValue - totalChange)) * 100;

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Portfolio</h1>
              <p className="text-muted-foreground">
                Track and manage your cryptocurrency investments
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Show Values
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </div>
          </div>

          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                  </div>
                  <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">24h Change</p>
                    <p className={`text-2xl font-bold ${totalChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {totalChange >= 0 ? "+" : ""}${totalChange.toFixed(2)}
                    </p>
                  </div>
                  {totalChange >= 0 ? (
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">24h Change %</p>
                    <p className={`text-2xl font-bold ${totalChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {totalChangePercent >= 0 ? "+" : ""}{totalChangePercent.toFixed(2)}%
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Content */}
          <Tabs defaultValue="holdings" className="w-full">
            <TabsList>
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
              <TabsTrigger value="allocation">Allocation</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="holdings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Your Holdings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {holdings.map((holding, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-bold text-primary">{holding.symbol}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{holding.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {holding.amount} {holding.symbol}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">{holding.value}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${holding.isPositive ? "text-green-600" : "text-red-600"}`}>
                              {holding.change}
                            </span>
                            <Badge
                              variant={holding.isPositive ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {holding.changePercent}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-right text-sm text-muted-foreground">
                          <p>{holding.price}</p>
                          <p>{holding.allocation}%</p>
                        </div>

                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="allocation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Portfolio Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {holdings.map((holding, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-bold text-primary text-xs">{holding.symbol}</span>
                          </div>
                          <span className="font-medium">{holding.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{holding.allocation}%</p>
                          <p className="text-sm text-muted-foreground">{holding.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent transactions</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Performance charts coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}