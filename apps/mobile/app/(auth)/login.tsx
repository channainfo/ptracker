import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LoginForm } from '@/src/components/auth/login-form';
import { SocialLogin } from '@/src/components/auth/social-login';
import { WalletLogin } from '@/src/components/auth/wallet-login';

export default function LoginScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">
              Sign in to your account to continue
            </Text>
          </View>

          {/* Login Form */}
          <LoginForm />

          {/* Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
            <Text className="mx-4 text-gray-500 dark:text-gray-400">or</Text>
            <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Social Login */}
          <SocialLogin />

          {/* Wallet Login */}
          <WalletLogin />

          {/* Register Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-primary-600 font-semibold">
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}