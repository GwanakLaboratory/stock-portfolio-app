import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function YouTubeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F]" edges={['top']}>
      <WebView
        source={{ uri: 'https://www.youtube.com/watch?v=3QPPZERkryc' }}
        className="flex-1"
        startInLoadingState={true}
      />
    </SafeAreaView>
  );
}
