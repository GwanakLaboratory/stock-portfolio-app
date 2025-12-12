import { getUser } from '@/api/edgeFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!email.trim()) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }

    // 간단한 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('알림', '올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // 중복 요청 방지
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const data = await getUser(email, phoneNumber);
      console.log(data, typeof data, data.user_id);
      await AsyncStorage.setItem('user_id', data.user_id);

      // userData도 함께 저장
      const userData = {
        phoneNumber,
        email,
        isLoggedIn: true,
      };
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // // 메인 화면으로 이동
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save user data:', error);
      Alert.alert('오류', '정보 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <View className="flex-1 pt-5 px-6">
          <TouchableOpacity className="py-2 mb-5" onPress={handleBack}>
            <Text className="text-base text-blue-500">← 뒤로</Text>
          </TouchableOpacity>

          <View className="mb-10">
            <Text className="text-3xl text-gray-800 mb-3 font-bold">
              거의 다 됐어요! 🎉
            </Text>
            <Text className="text-base text-gray-500">
              이메일을 입력해주세요
            </Text>
          </View>

          <View className="bg-gray-100 rounded-lg p-4 mb-7">
            <Text className="text-xs text-gray-500 mb-1">전화번호</Text>
            <Text className="text-base font-semibold text-gray-900">
              {phoneNumber.slice(0, 3)} - {phoneNumber.slice(3, 7)} -{' '}
              {phoneNumber.slice(7)}
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-sm text-gray-500 mb-2">이메일</Text>
            <TextInput
              className="h-12 bg-gray-100 rounded-lg px-4 py-3 text-base text-gray-800"
              placeholder="example@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
          </View>

          <TouchableOpacity
            className={`h-14 bg-blue-500 rounded-xl flex justify-center items-center shadow-lg px-4 py-3 text-base text-white ${
              !email.trim() || isLoading
                ? 'opacity-50 bg-gray-300 shadow-none'
                : ''
            }`}
            onPress={handleConfirm}
            disabled={!email.trim() || isLoading}
          >
            <Text className="text-base font-semibold text-white">
              {isLoading ? '처리 중...' : '확인'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
