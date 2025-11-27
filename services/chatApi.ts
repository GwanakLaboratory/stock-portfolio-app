// 백엔드 API 클라이언트
// openai.ts 서버를 호출합니다

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface BackendResponse {
  content?: string;
  success?: boolean;
  error?: string;
}

// 백엔드 서버 주소
// .env 파일에서 설정하거나 기본값 사용
const API_BASE_URL = 'http://10.100.174.82:8000';
console.log('🌐 설정된 API_BASE_URL:', API_BASE_URL);

export async function sendMessageToOpenAI(
  messages: Message[],
  currentMessage: string,
  imageBase64?: string | null
): Promise<string> {
  try {
    console.log('🔗 API 요청 URL:', `${API_BASE_URL}/api/chat`);
    console.log('📤 요청 데이터:', {
      messageLength: currentMessage.length,
      hasImage: !!imageBase64,
    });

    // Node.js Express 서버 (server.js) 호출
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
        current_message: currentMessage,
        image_base64: imageBase64 || null,
      }),
    });

    console.log('📥 응답 상태:', response.status, response.statusText);

    // 응답 텍스트를 먼저 확인
    const responseText = await response.text();
    console.log('📄 응답 내용:', responseText.substring(0, 200)); // 처음 200자만

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        throw new Error(`서버 오류: ${response.status} - ${responseText}`);
      }
      throw new Error(
        errorData.error ||
          `서버 오류: ${response.status} ${response.statusText}`
      );
    }

    const data: BackendResponse = JSON.parse(responseText);

    if (!data.success || !data.content) {
      throw new Error(data.error || '응답을 받지 못했습니다.');
    }

    return data.content;
  } catch (error) {
    console.error('백엔드 API 호출 오류:', error);

    // 네트워크 오류 처리
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        '통합 API 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.\n' +
          `(${API_BASE_URL})\n\n` +
          '서버 실행: yarn server'
      );
    }

    throw error;
  }
}
