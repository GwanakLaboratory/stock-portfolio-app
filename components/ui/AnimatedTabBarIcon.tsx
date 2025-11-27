import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type AnimatedTabBarIconProps = {
  name: any;
  color: string;
  focused: boolean;
};

export function AnimatedTabBarIcon({
  name,
  color,
  focused,
}: AnimatedTabBarIconProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withTiming(focused ? 1.2 : 1, {
      duration: 200,
    });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name} size={20} color={color} />
    </Animated.View>
  );
}
