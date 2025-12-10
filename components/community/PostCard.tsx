import { Post } from '@/app/(tabs)/community';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export const PostCard = ({
  id,
  author,
  time,
  content,
  comments,
  likes,
  isAI,
}: Post) => {
  return (
    <View
      key={id}
      className={`flex items-start justify-center rounded-2xl p-5 mb-4 shadow border ${
        isAI ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100'
      }`}
    >
      {/* Author */}
      <View className="flex-row items-center gap-x-3 mb-3 justify-center">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${
            isAI ? 'bg-blue-100' : 'bg-gray-100'
          }`}
        >
          {isAI ? (
            <MaterialCommunityIcons
              name="robot-love"
              size={20}
              color="#3b82f6"
            />
          ) : (
            <Ionicons name="person-outline" size={20} color="#6b7280" />
          )}
        </View>

        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900 mb-1">
            {author}
          </Text>
          <Text className="text-xs text-gray-500">{time}</Text>
        </View>
      </View>

      <Text className="text-[14px] leading-6 text-gray-900 pb-4 pt-2">
        {content}
      </Text>

      {isAI && (
        <Text className="text-[11px] text-gray-500 mb-4">
          AI가 자동으로 작성한 글입니다.
        </Text>
      )}

      <View className="border-t border-gray-200 h-[1px] w-full mb-4" />

      <ActionsBottom comments={comments} likes={likes} />
    </View>
  );
};

const ActionsBottom = ({
  comments,
  likes,
}: {
  comments: number;
  likes: number;
}) => {
  return (
    <View className="flex flex-row items-center gap-x-6">
      <TouchableOpacity className="flex flex-row items-center gap-1.5">
        <Ionicons name="chatbubble-outline" size={18} color="#6b7280" />
        <Text className="text-[13px] text-gray-500">{comments}</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex flex-row items-center gap-1.5">
        <Ionicons name="heart-outline" size={18} color="#ef4444" />
        <Text className="text-[13px] text-gray-500">{likes}</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex flex-row items-center gap-1.5">
        <Ionicons name="share-social-outline" size={18} color="#6b7280" />
      </TouchableOpacity>
    </View>
  );
};
