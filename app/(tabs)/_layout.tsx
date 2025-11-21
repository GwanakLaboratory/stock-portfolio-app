import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { AnimatedTabBarIcon } from '@/components/ui/AnimatedTabBarIcon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarIconStyle: { marginBottom: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon
              name={'house.fill'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: '채팅',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon
              name="list.bullet.rectangle.fill"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="naver"
        options={{
          title: '네이버',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon
              name="n.square.fill"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="google"
        options={{
          title: '구글',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon
              color={color}
              focused={focused}
              name="g.square.fill"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="youtube"
        options={{
          title: '유튜브',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabBarIcon
              color={color}
              focused={focused}
              name="play.rectangle.fill"
            />
          ),
        }}
      />
    </Tabs>
  );
}
