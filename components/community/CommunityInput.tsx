import { Ionicons } from '@expo/vector-icons';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface CommunityInputProps {
  newPost: string;
  setNewPost: (value: string) => void;
}

export const CommunityInput = ({
  newPost,
  setNewPost,
}: CommunityInputProps) => {
  return (
    <View className="flex-row bg-white rounded-2xl px-4 py-2 flex items-center mb-6 shadow-sm">
      <TextInput
        value={newPost}
        onChangeText={setNewPost}
        placeholder="오늘은 어떤 얘기를 나누고 싶으세요?"
        placeholderTextColor="#9ca3af"
        className="flex-1 text-gray-900 text-sm"
      />
      <TouchableOpacity>
        <Ionicons name="add-circle" size={30} color="#3b82f6" />
      </TouchableOpacity>
    </View>
  );
};
