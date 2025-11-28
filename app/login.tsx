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
        <View className="flex-1 pt-14 px-6">
          <View className="mb-14">
            <Text className="text-3xl text-gray-800 mb-3 font-bold">
              환영합니다! 👋
            </Text>
            <Text className="text-base text-gray-500">
              전화번호를 입력해주세요
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-sm text-gray-500 mb-2">전화번호</Text>
            <TextInput
              className="h-12 bg-gray-100 rounded-lg px-4 py-3 text-base text-gray-800"
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
            className={`h-14 bg-blue-500 rounded-xl flex justify-center items-center shadow-lg px-4 py-3 text-base text-white ${
              phoneNumber.length !== 11
                ? 'opacity-50 bg-gray-300 shadow-none'
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
