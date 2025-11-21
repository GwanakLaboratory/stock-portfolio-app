import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function GoogleScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <WebView
        source={{
          uri: 'https://www.google.com/search?q=react+native+expo+0.83&oq=&gs_lcrp=EgZjaHJvbWUqCQgBECMYJxjqAjIPCAAQIxgnGOoCGIAEGIoFMgkIARAjGCcY6gIyDwgCECMYJxjqAhiABBiKBTIPCAMQIxgnGOoCGIAEGIoFMg8IBBAjGCcY6gIYgAQYigUyCQgFECMYJxjqAjIPCAYQIxgnGOoCGIAEGIoFMg8IBxAjGCcY6gIYgAQYigXSAQkxNTM1ajBqMTWoAgiwAgHxBcp3-Jbn9NQO8QXKd_iW5_TUDg&sourceid=chrome&ie=UTF-8',
        }}
        className="flex-1"
        startInLoadingState={true}
      />
    </SafeAreaView>
  );
}
