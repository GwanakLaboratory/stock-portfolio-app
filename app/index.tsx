import { validateUser } from '@/api/edgeFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      if (!user_id || user_id === undefined) {
        setIsLoggedIn(false);
        return;
      }

      const data = await validateUser(user_id);
      console.log(data);
      if (data.success) {
        setIsLoggedIn(true);
        await AsyncStorage.setItem('user_id', data.user_id);
        const userData = {
          phoneNumber: data.phone,
          email: data.email,
          isLoggedIn: true,
        };
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Failed to check login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 로딩 완료 후 로그인 상태에 따라 리다이렉트
  return <Redirect href={isLoggedIn ? '/(tabs)' : '/login'} />;
}
