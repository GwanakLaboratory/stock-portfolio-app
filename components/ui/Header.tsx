import { Text, View } from 'react-native';

interface HeaderProps {
  leftIcon?: React.ReactNode;
  title: string;
  rightIcon?: React.ReactNode;
}

export const Header = ({ leftIcon, title, rightIcon }: HeaderProps) => {
  return (
    <View className="flex-row items-center justify-between border-b border-gray-200 px-5 py-2.5">
      <View className="flex-row items-center gap-3 p-1">
        {leftIcon}
        <Text className="text-base font-medium">{title}</Text>
      </View>
      {rightIcon && rightIcon}
    </View>
  );
};
