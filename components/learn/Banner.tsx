import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View } from 'react-native';

export const Banner = ({
  title = '5분 만에 PER·PBR\n이해하기',
  time = 7,
}: {
  title?: string;
  time?: number;
}) => {
  return (
    <LinearGradient
      colors={['#eef2ff', '#fcfcfc']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-3xl p-6 relative overflow-hidden"
    >
      <View className="absolute top-4 right-4">
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>

      <Text className="text-[12px] text-blue-600 font-medium mb-2">
        오늘의 필수 학습
      </Text>

      <Text className="text-[20px] font-bold text-gray-900 leading-8 mb-2">
        {title}
      </Text>

      <View className="flex-row items-center gap-2 mt-3">
        <Ionicons name="book-outline" size={18} color="#6b7280" />
        <Text className="text-[13px] text-gray-500">{time}분 소요</Text>
      </View>
    </LinearGradient>
  );
};
