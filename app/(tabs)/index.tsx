import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [message, setMessage] = useState<string>('');

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row justify-between items-center px-5 py-2.5 border-b border-gray-200">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="p-1">
            <Ionicons name="menu-outline" size={24} color="gray" />
          </TouchableOpacity>

          <Text className="text-base font-medium">ChatGPT 5.1</Text>
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity className="p-1">
            <Ionicons name="chatbubble-outline" size={20} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center">
          <View className="p-5">
            <Text className="text-3xl font-light text-center">
              준비되면 얘기해 주세요.
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View className="flex-row items-center px-4 py-3 bg-white">
          <TouchableOpacity className="bg-gray-100 rounded-full p-2">
            <Ionicons name="add-outline" size={24} color="gray" />
          </TouchableOpacity>

          <View className="flex-1 flex flex-row items-center justify-center h-10 bg-gray-100 rounded-full pl-4 pr-2 mx-2">
            <TextInput
              className=" text-gray-800 flex-1 text-sm"
              placeholder="무엇이든 물어보세요"
              value={message}
              onChangeText={setMessage}
            />

            {message.trim().length === 0 ? (
              <View className="flex flex-row gap-2">
                <TouchableOpacity className="p-1">
                  <Ionicons name="mic-outline" size={20} color="gray" />
                </TouchableOpacity>

                <TouchableOpacity className="bg-black rounded-full p-1">
                  <Ionicons name="pulse-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity className="bg-black rounded-full p-1">
                <Ionicons name="arrow-up" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
