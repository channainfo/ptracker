import { Metadata } from "next";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { NewsStream } from "@/components/news/news-stream";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "News Stream - PTracker",
  description: "Stay updated with the latest cryptocurrency and market news",
};

export default function NewsPage() {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">News Stream</h1>
            <p className="text-muted-foreground">
              Stay updated with the latest cryptocurrency and market news
            </p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All News</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <NewsStream category="all" maxItems={20} />
            </TabsContent>
            
            <TabsContent value="crypto" className="space-y-4">
              <NewsStream category="crypto" maxItems={20} />
            </TabsContent>
            
            <TabsContent value="market" className="space-y-4">
              <NewsStream category="market" maxItems={20} />
            </TabsContent>
            
            <TabsContent value="general" className="space-y-4">
              <NewsStream category="general" maxItems={20} />
            </TabsContent>
          </Tabs>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}