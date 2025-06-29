import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/src/stores/auth-store';
import { getStorageItem } from '@/src/utils/storage';

export default function Index() {
  const { setUser, setIsAuthenticated } = useAuthStore();

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Check if user has completed onboarding
        const hasCompletedOnboarding = await getStorageItem('hasCompletedOnboarding');
        
        if (!hasCompletedOnboarding) {
          router.replace('/onboarding');
          return;
        }

        // Check for stored auth token
        const token = await getStorageItem('authToken');
        const userData = await getStorageItem('userData');

        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        router.replace('/(auth)/login');
      }
    };

    checkAuthState();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <ActivityIndicator size="large" className="text-primary-600" />
    </View>
  );
}