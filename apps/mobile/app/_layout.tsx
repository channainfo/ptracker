import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/src/providers/auth-provider';
import { WalletProvider } from '@/src/providers/wallet-provider';
import { SocketProvider } from '@/src/providers/socket-provider';
import { ToastProvider } from '@/src/providers/toast-provider';
import { useFonts } from 'expo-font';
import { useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import '../global.css';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
    'JetBrainsMono-Regular': require('../assets/fonts/JetBrainsMono-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WalletProvider>
          <SocketProvider>
            <ToastProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff' },
                }}
                onLayout={onLayoutRootView}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen 
                  name="onboarding" 
                  options={{ 
                    headerShown: false,
                    gestureEnabled: false,
                  }} 
                />
                <Stack.Screen 
                  name="settings" 
                  options={{ 
                    presentation: 'modal',
                    headerShown: true,
                    title: 'Settings',
                  }} 
                />
                <Stack.Screen 
                  name="wallet-connect" 
                  options={{ 
                    presentation: 'modal',
                    headerShown: true,
                    title: 'Connect Wallet',
                  }} 
                />
                <Stack.Screen 
                  name="qr-scanner" 
                  options={{ 
                    presentation: 'modal',
                    headerShown: true,
                    title: 'Scan QR Code',
                  }} 
                />
              </Stack>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            </ToastProvider>
          </SocketProvider>
        </WalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}