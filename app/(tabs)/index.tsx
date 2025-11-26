import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendMessageToOpenAI } from '../../services/chatApi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imageUri?: string;
}

const STORAGE_KEY = '@chat_messages';

export default function HomeScreen() {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // 앱 시작 시 저장된 메시지 불러오기
  useEffect(() => {
    loadMessages();
  }, []);

  // 메시지 로드 함수
  const loadMessages = async () => {
    try {
      const savedMessages = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // timestamp를 Date 객체로 변환
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
        console.log('💾 저장된 메시지 로드:', messagesWithDates.length, '개');
      }
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    }
  };

  // 메시지 저장 함수
  const saveMessages = async (newMessages: Message[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
      console.log('💾 메시지 저장:', newMessages.length, '개');
    } catch (error) {
      console.error('메시지 저장 실패:', error);
    }
  };

  // 메시지가 변경될 때마다 저장
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
      // 스크롤
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if ((message.trim().length === 0 && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim() || '이미지를 분석해주세요.',
      timestamp: new Date(),
      imageUri: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentImage = selectedImage;
    setMessage('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // 이미지를 base64로 변환
      let imageBase64 = null;
      if (currentImage) {
        const response = await fetch(currentImage);
        const blob = await response.blob();
        imageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            // "data:image/jpeg;base64," 부분을 제거하고 순수 base64만 추출
            resolve(base64.split(',')[1]);
          };
          reader.readAsDataURL(blob);
        });
      }

      // OpenAI API 호출
      const conversationHistory = [
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      const responseContent = await sendMessageToOpenAI(
        conversationHistory,
        userMessage.content,
        imageBase64
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `죄송합니다. 오류가 발생했습니다.\n\n${
          error instanceof Error ? error.message : '알 수 없는 오류'
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      // Alert.alert(
      //   '오류',
      //   error instanceof Error
      //     ? error.message
      //     : '알 수 없는 오류가 발생했습니다.'
      // );
    } finally {
      setIsLoading(false);
    }
  };

  const pickImageAsync = async () => {
    try {
      // 현재 권한 상태 확인
      const { status: currentStatus } =
        await ImagePicker.getMediaLibraryPermissionsAsync();

      let finalStatus = currentStatus;

      // 권한이 없으면 요청
      if (currentStatus !== 'granted') {
        const { status: requestStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        finalStatus = requestStatus;
      }

      // 권한이 거부되었을 때
      if (finalStatus !== 'granted') {
        Alert.alert(
          '사진 접근 권한 필요',
          '이미지를 선택하려면 사진 라이브러리 접근 권한이 필요합니다.',
          [
            {
              text: '취소',
              style: 'cancel',
            },
            {
              text: '설정으로 이동',
              onPress: () => {
                // iOS와 Android 모두 앱 설정으로 이동
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
        return;
      }

      // 권한이 있으면 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8, // 성능을 위해 약간 압축
        base64: false, // base64는 나중에 변환
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('이미지 선택 중 오류:', error);
      Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <View className="flex-row justify-between items-center px-5 py-2.5 border-b border-gray-200">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="p-1">
            <Ionicons name="menu-outline" size={24} color="gray" />
          </TouchableOpacity>

          <Text className="text-base font-medium">ChatGPT 5.1</Text>
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            className="p-1"
            onPress={() => {
              // 채팅 초기화 확인 팝업
              Alert.alert(
                '채팅 초기화',
                '모든 대화 내용을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
                [
                  {
                    text: '취소',
                    style: 'cancel',
                  },
                  {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        // AsyncStorage에서 데이터 삭제
                        await AsyncStorage.removeItem(STORAGE_KEY);
                        // 메시지 상태 초기화
                        setMessages([]);
                        console.log('🗑️ 채팅 데이터 삭제 완료');

                        // 삭제 완료 알림 (선택사항)
                        Alert.alert('완료', '대화 내용이 삭제되었습니다.');
                      } catch (error) {
                        console.error('데이터 삭제 실패:', error);
                        Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
                      }
                    },
                  },
                ],
                { cancelable: true }
              );
            }}
          >
            <Ionicons name="trash-outline" size={20} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 키보드에 반응하는 컨테이너 */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* 메시지 리스트 */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View className="flex-1 justify-center items-center px-5">
              <Text className="text-2xl font-light text-center text-gray-600">
                준비되면 얘기해 주세요.
              </Text>
            </View>
          ) : (
            <View className="px-4 py-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <View
                    key={msg.id}
                    className={`mb-4 ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <View
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isUser ? 'bg-black' : 'bg-gray-100'
                      }`}
                    >
                      {msg.imageUri && (
                        <Image
                          source={{ uri: msg.imageUri }}
                          className="w-48 h-48 rounded-xl mb-2"
                          resizeMode="cover"
                        />
                      )}
                      <Text
                        className={`text-base ${
                          isUser ? 'text-white' : 'text-gray-800'
                        }`}
                      >
                        {msg.content}
                      </Text>
                    </View>
                  </View>
                );
              })}

              {isLoading && (
                <View className="items-start mb-4">
                  <View className="bg-gray-100 rounded-2xl px-4 py-3">
                    <ActivityIndicator size="small" color="gray" />
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* 입력창 - 키보드 위에 고정됨 */}
        <View className="flex-row items-center px-4 py-3 bg-white">
          <TouchableOpacity
            className="bg-gray-100 rounded-full p-2"
            onPress={pickImageAsync}
          >
            <Ionicons name="add-outline" size={24} color="gray" />
          </TouchableOpacity>

          <View
            className="flex-1 flex flex-row items-center justify-between bg-gray-100 rounded-2xl pl-4 pr-2 ml-2"
            style={{ minHeight: 40 }}
          >
            <View className="flex flex-col gap-2 justify-center flex-1">
              {/* 이미지 미리보기 */}
              {selectedImage && (
                <View className="mb-1 flex-row items-center pt-2">
                  <View className="relative">
                    <Image
                      source={{ uri: selectedImage }}
                      className="w-16 h-16 rounded-lg"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      className="absolute top-1 right-1 bg-black rounded-full w-4 h-4 items-center justify-center"
                      onPress={() => setSelectedImage(null)}
                    >
                      <Ionicons name="close" size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              <TextInput
                className="text-gray-800 text-sm py-2"
                placeholder="무엇이든 물어보세요"
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={500}
                onSubmitEditing={sendMessage}
                editable={!isLoading}
                onFocus={() => {
                  // 포커스될 때 스크롤
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                }}
              />
            </View>

            {message.trim().length === 0 && !selectedImage ? (
              <View className="flex flex-row gap-2">
                <TouchableOpacity className="p-1">
                  <Ionicons name="mic-outline" size={20} color="gray" />
                </TouchableOpacity>

                <TouchableOpacity className="bg-black rounded-full p-1">
                  <Ionicons name="pulse-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className={`rounded-full p-1 ${
                  isLoading ? 'bg-gray-400' : 'bg-black'
                }`}
                onPress={sendMessage}
                disabled={isLoading}
              >
                <Ionicons name="arrow-up" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
