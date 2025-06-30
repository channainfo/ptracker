import { ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { HomeHeader } from '@/src/components/home/home-header';
import { PortfolioSummary } from '@/src/components/home/portfolio-summary';
import { MarketSentiment } from '@/src/components/home/market-sentiment';
import { TrendingAssets } from '@/src/components/home/trending-assets';
import { QuickActions } from '@/src/components/home/quick-actions';
import { RecentActivity } from '@/src/components/home/recent-activity';
import { PriceAlerts } from '@/src/components/home/price-alerts';
import { LearningProgress } from '@/src/components/home/learning-progress';

export default function HomeTab() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <HomeHeader />

        {/* Portfolio Summary */}
        <PortfolioSummary />

        {/* Quick Actions */}
        <QuickActions />

        {/* Market Sentiment */}
        <MarketSentiment />

        {/* Trending Assets */}
        <TrendingAssets />

        {/* Price Alerts */}
        <PriceAlerts />

        {/* Learning Progress */}
        <LearningProgress />

        {/* Recent Activity */}
        <RecentActivity />
      </ScrollView>
    </SafeAreaView>
  );
}