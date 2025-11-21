import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { IconSymbol, IconSymbolName } from './icon-symbol';

type AnimatedTabBarIconProps = {
  name: IconSymbolName;
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
      <IconSymbol name={name} size={28} color={color} />
    </Animated.View>
  );
}
