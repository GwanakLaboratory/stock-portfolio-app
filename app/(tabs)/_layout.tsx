import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { AnimatedTabBarIcon } from '@/components/ui/AnimatedTabBarIcon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// 각 화면의 상태바 스타일 정의
const screenStatusBarConfig: Record<string, 'light' | 'dark'> = {
  index: 'dark',
  chat: 'dark',
  naver: 'dark',
  google: 'dark',
  youtube: 'light',
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [currentStatusBarStyle, setCurrentStatusBarStyle] = useState<
    'light' | 'dark'
  >('dark');

  return (
    <>
      <StatusBar style={currentStatusBarStyle} animated={true} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarIconStyle: { marginBottom: 4 },
        }}
        screenListeners={{
          state: (e) => {
            // 현재 활성화된 탭의 이름 가져오기
            const state = e.data.state;
            const currentRoute = state.routes[state.index];
            const routeName = currentRoute.name;

            // 해당 화면의 상태바 스타일 적용
            if (screenStatusBarConfig[routeName]) {
              setCurrentStatusBarStyle(screenStatusBarConfig[routeName]);
            }
          },
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
    </>
  );
}
