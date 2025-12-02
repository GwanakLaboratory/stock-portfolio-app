import { Header } from '@/components/ui/Header';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendMessageToOpenAI } from '../../services/chatApi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = '@chat_messages';

export default function HomeScreen() {
  const [sessionId, setSessionId] = useState<string | null>(null);  
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
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setSelectedImage(null);
    setIsLoading(true);

    try {

      // OpenAI API 호출
      const response = await sendMessageToOpenAI(
        userMessage.content,
        sessionId || ''
      );
      if (response.session_id) {
        setSessionId(response.session_id);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response || '',
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

  // // 이미지 선택 옵션 표시
  // const showImagePickerOptions = () => {
  //   Alert.alert('이미지 선택', '이미지를 가져올 방법을 선택하세요.', [
  //     {
  //       text: '취소',
  //       style: 'cancel',
  //     },
  //     {
  //       text: '카메라 촬영',
  //       onPress: launchCamera,
  //     },
  //     {
  //       text: '앨범 접근하기',
  //       onPress: launchImageLibrary,
  //     },
  //   ]);
  // };

  // 카메라로 사진 촬영
  // const launchCamera = async () => {
  //   try {
  //     // 카메라 권한 확인
  //     const { status: currentStatus } =
  //       await ImagePicker.getCameraPermissionsAsync();

  //     let finalStatus = currentStatus;

  //     // 권한이 없으면 요청
  //     if (currentStatus !== 'granted') {
  //       const { status: requestStatus } =
  //         await ImagePicker.requestCameraPermissionsAsync();
  //       finalStatus = requestStatus;
  //     }

  //     // 권한이 거부되었을 때
  //     if (finalStatus !== 'granted') {
  //       Alert.alert(
  //         '카메라 접근 권한 필요',
  //         '카메라를 사용하려면 카메라 접근 권한이 필요합니다.',
  //         [
  //           {
  //             text: '취소',
  //             style: 'cancel',
  //           },
  //           {
  //             text: '설정으로 이동',
  //             onPress: () => {
  //               if (Platform.OS === 'ios') {
  //                 Linking.openURL('app-settings:');
  //               } else {
  //                 Linking.openSettings();
  //               }
  //             },
  //           },
  //         ]
  //       );
  //       return;
  //     }

  //     // 카메라 실행
  //     const result = await ImagePicker.launchCameraAsync({
  //       mediaTypes: ['images'],
  //       allowsEditing: true,
  //       quality: 0.8,
  //       base64: false,
  //     });

  //     if (!result.canceled && result.assets[0]) {
  //       setSelectedImage(result.assets[0].uri);
  //     }
  //   } catch (error) {
  //     console.error('카메라 실행 중 오류:', error);
  //     Alert.alert('오류', '카메라를 실행하는 중 오류가 발생했습니다.');
  //   }
  // };

  // // 앨범에서 이미지 선택
  // const launchImageLibrary = async () => {
  //   try {
  //     // 앨범 권한 확인
  //     const { status: currentStatus } =
  //       await ImagePicker.getMediaLibraryPermissionsAsync();

  //     let finalStatus = currentStatus;

  //     // 권한이 없으면 요청
  //     if (currentStatus !== 'granted') {
  //       const { status: requestStatus } =
  //         await ImagePicker.requestMediaLibraryPermissionsAsync();
  //       finalStatus = requestStatus;
  //     }

  //     // 권한이 거부되었을 때
  //     if (finalStatus !== 'granted') {
  //       Alert.alert(
  //         '사진 접근 권한 필요',
  //         '이미지를 선택하려면 사진 라이브러리 접근 권한이 필요합니다.',
  //         [
  //           {
  //             text: '취소',
  //             style: 'cancel',
  //           },
  //           {
  //             text: '설정으로 이동',
  //             onPress: () => {
  //               if (Platform.OS === 'ios') {
  //                 Linking.openURL('app-settings:');
  //               } else {
  //                 Linking.openSettings();
  //               }
  //             },
  //           },
  //         ]
  //       );
  //       return;
  //     }

  //     // 앨범에서 이미지 선택
  //     const result = await ImagePicker.launchImageLibraryAsync({
  //       mediaTypes: ['images'],
  //       allowsEditing: true,
  //       quality: 0.8,
  //       base64: false,
  //     });

  //     if (!result.canceled && result.assets[0]) {
  //       setSelectedImage(result.assets[0].uri);
  //     }
  //   } catch (error) {
  //     console.error('이미지 선택 중 오류:', error);
  //     Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
  //   }
  // };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}

      <Header
        leftIcon={
          <TouchableOpacity>
            <Ionicons name="menu-outline" size={24} color="gray" />
          </TouchableOpacity>
        }
        title="ChatGPT 5.1"
        rightIcon={
          <TouchableOpacity
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
        }
      />

      {/* 키보드에 반응하는 컨테이너 */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={'padding'}
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
                      {/* {msg.imageUri && (
                        <Image
                          source={{ uri: msg.imageUri }}
                          className="w-48 h-48 rounded-xl mb-2"
                          resizeMode="cover"
                        />
                      )} */}
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
          {/* <TouchableOpacity
            className="bg-gray-100 rounded-full p-2"
            onPress={showImagePickerOptions}
          >
            <Ionicons name="add-outline" size={24} color="gray" />
          </TouchableOpacity> */}

          <View
            className="flex-1 flex flex-row items-center justify-between bg-gray-100 rounded-2xl pl-4 pr-2 ml-2"
            style={{ minHeight: 40 }}
          >
            <View className="flex flex-col gap-2 justify-center flex-1">
              {/* 이미지 미리보기 */}
              {/* {selectedImage && (
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
              )} */}
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