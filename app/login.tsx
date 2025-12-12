import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleNext = () => {
    if (phoneNumber.length === 11) {
      // 전화번호를 다음 화면으로 전달
      router.push({
        pathname: '/signup',
        params: { phoneNumber },
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <View className="flex-1 px-6 pt-14">
          <View className="mb-14">
            <Text className="mb-3 text-3xl font-bold text-gray-800">
              환영합니다! 👋
            </Text>
            <Text className="text-base text-gray-500">
              전화번호를 입력해주세요
            </Text>
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-sm text-gray-500">전화번호</Text>
            <TextInput
              className="h-12 rounded-lg bg-gray-100 px-4 py-3 text-base text-gray-800"
              placeholder="010-0000-0000"
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={11}
              autoFocus
            />
          </View>

          <TouchableOpacity
            className={`flex h-14 items-center justify-center rounded-xl bg-blue-500 px-4 py-3 text-base text-white shadow-lg ${
              phoneNumber.length !== 11
                ? 'bg-gray-300 opacity-50 shadow-none'
                : ''
            }`}
            onPress={handleNext}
            disabled={phoneNumber.length !== 11}
          >
            <Text className="text-base font-semibold text-white">다음</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
