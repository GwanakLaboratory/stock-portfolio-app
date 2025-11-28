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
      const userData = await AsyncStorage.getItem('userData');
      setIsLoggedIn(!!userData);
    } catch (error) {
      console.error('Failed to check login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 로딩 완료 후 로그인 상태에 따라 리다이렉트
  return <Redirect href={isLoggedIn ? '/(tabs)' : '/login'} />;
}
