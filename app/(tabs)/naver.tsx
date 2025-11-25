import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function NaverScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#EDF0F4]" edges={['top']}>
      <WebView
        source={{ uri: 'https://www.naver.com/' }}
        className="flex-1"
        startInLoadingState={true}
      />
    </SafeAreaView>
  );
}
