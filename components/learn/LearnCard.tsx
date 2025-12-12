import { LearningContent } from '@/app/(tabs)/learn';
import { Text, TouchableOpacity, View } from 'react-native';

export const LearnCard = ({
  id,
  title,
  description,
  category,
  duration,
}: LearningContent) => {
  return (
    <View className="bg-white rounded-2xl p-5 mb-3 shadow-sm relative">
      <View className="flex-row items-center gap-2 mb-2">
        <Text className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {category}
        </Text>
        <Text className="text-[11px] text-gray-800">{duration}</Text>
      </View>

      <Text className="text-base font-semibold text-foreground mb-1">
        {title}
      </Text>

      <Text className="text-xs text-gray-500 leading-relaxed">
        {description}
      </Text>

      <TouchableOpacity className="absolute right-3 top-4 px-3 py-1.5 bg-blue-500/10 rounded-full">
        <Text className="text-xs font-medium text-blue-500">학습하기</Text>
      </TouchableOpacity>
    </View>
  );
};
