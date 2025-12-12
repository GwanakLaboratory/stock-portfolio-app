import { Header } from '@/components/ui/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserData {
  phoneNumber: string;
  email: string;
  isLoggedIn: boolean;
}

export default function MyPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('로그아웃 버튼 클릭됨');

    const performLogout = async () => {
      console.log('로그아웃 확인됨, 데이터 삭제 시작');
      try {
        // 모든 사용자 데이터 삭제
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('user_id');
        console.log('데이터 삭제 완료, 로그인 화면으로 이동');

        // 로그인 페이지로 직접 이동
        router.replace('/login');
      } catch (error) {
        console.error('Failed to logout:', error);
        Alert.alert('오류', '로그아웃에 실패했습니다.');
      }
    };

    // 웹에서는 window.confirm 사용, 모바일에서는 Alert 사용
    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        window.confirm('정말 로그아웃 하시겠어요?')
      ) {
        await performLogout();
      } else {
        console.log('로그아웃 취소');
      }
    } else {
      Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => {
            console.log('로그아웃 취소');
          },
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: performLogout,
        },
      ]);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-[16px] text-gray-500">로딩 중...</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="내 정보" />

      <ScrollView className="flex-1">
        <View className="flex-1 px-5 pb-20 pt-5">
          {/* 사용자 정보 */}
          <View className="mb-10">
            <View className="mb-3 rounded-2xl bg-white p-5 shadow-sm">
              <Text className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                이메일
              </Text>
              <Text className="text-[18px] font-semibold text-black">
                {userData?.email || '-'}
              </Text>
            </View>

            <View className="mb-3 rounded-2xl bg-white p-5 shadow-sm">
              <Text className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-gray-500">
                휴대전화
              </Text>
              <Text className="text-[18px] font-semibold text-black">
                {userData?.phoneNumber || '-'}
              </Text>
            </View>
          </View>

          {/* 로그아웃 버튼 */}
          <View>
            <TouchableOpacity
              className="h-14 items-center justify-center rounded-xl bg-green-500 shadow-md"
              activeOpacity={0.7}
              onPress={handleLogout}
            >
              <Text className="text-[16px] font-semibold text-white">
                로그아웃
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
