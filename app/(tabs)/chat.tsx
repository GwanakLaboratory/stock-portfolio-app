import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function ChatScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <WebView
        source={{ uri: 'https://www.naver.com/' }}
        className="flex-1"
        startInLoadingState={true}
      />
    </SafeAreaView>
  );
}
