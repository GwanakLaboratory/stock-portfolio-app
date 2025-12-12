import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const CATEGORY = [
  '전체',
  '기초 개념',
  '주식',
  'ETF',
  '코인',
  '재무제표',
  '차트 분석',
];

interface CategoryTagProps {
  select: string;
  setSelect: (category: string) => void;
}

export const CategoryTag = ({ select, setSelect }: CategoryTagProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="-mx-3 px-3"
    >
      <View className="flex-row gap-2">
        {CATEGORY.map((category) => {
          const isSelected = select === category;
          return (
            <TouchableOpacity
              key={category}
              onPress={() => setSelect(category)}
              className={`px-4 py-1.5 rounded-2xl border ${
                isSelected
                  ? 'bg-gray-800 border-gray-800'
                  : 'bg-white border-gray-300'
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  isSelected ? 'text-white' : 'text-gray-500'
                }`}
              >
                {category}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};
