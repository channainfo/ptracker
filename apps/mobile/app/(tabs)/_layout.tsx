import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { 
  HomeIcon, 
  ChartBarIcon, 
  BookOpenIcon, 
  WalletIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import { 
  HomeIcon as HomeIconSolid, 
  ChartBarIcon as ChartBarIconSolid, 
  BookOpenIcon as BookOpenIconSolid, 
  WalletIcon as WalletIconSolid,
  UserIcon as UserIconSolid,
} from 'react-native-heroicons/solid';

function TabBarIcon({ 
  name, 
  focused, 
  color 
}: { 
  name: string; 
  focused: boolean; 
  color: string;
}) {
  const iconProps = { 
    size: 24, 
    color,
    strokeWidth: focused ? 2 : 1.5,
  };

  switch (name) {
    case 'home':
      return focused ? 
        <HomeIconSolid {...iconProps} /> : 
        <HomeIcon {...iconProps} />;
    case 'portfolio':
      return focused ? 
        <WalletIconSolid {...iconProps} /> : 
        <WalletIcon {...iconProps} />;
    case 'market':
      return focused ? 
        <ChartBarIconSolid {...iconProps} /> : 
        <ChartBarIcon {...iconProps} />;
    case 'learn':
      return focused ? 
        <BookOpenIconSolid {...iconProps} /> : 
        <BookOpenIcon {...iconProps} />;
    case 'profile':
      return focused ? 
        <UserIconSolid {...iconProps} /> : 
        <UserIcon {...iconProps} />;
    default:
      return <HomeIcon {...iconProps} />;
  }
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#9ca3af' : '#6b7280',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="portfolio" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Market',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="market" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="learn" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="profile" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}