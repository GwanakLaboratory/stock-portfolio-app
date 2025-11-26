const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const OpenAI = require('openai').default;
const path = require('path');

// .env 파일 로드
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 8000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('\n❌ OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다!');
  console.error('💡 .env 파일 위치:', path.join(__dirname, '..', '.env'));
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, current_message, image_base64 } = req.body;

    if (!current_message) {
      return res.status(400).json({ error: '메시지를 입력해주세요.' });
    }

    // 대화 구성
    const conversation = [
      {
        role: 'system',
        content:
          '너는 친절하고 도움이 되는 AI 어시스턴트야. 한국어로 답변해줘. 이미지가 주어지면 자세히 분석해서 설명해줘.',
      },
    ];

    // 대화 히스토리 추가
    if (messages && messages.length > 0) {
      conversation.push(...messages);
    }

    // 현재 메시지 추가 (이미지 포함 여부에 따라 형식 다름)
    if (image_base64) {
      conversation.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: current_message,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${image_base64}`,
            },
          },
        ],
      });
    } else {
      conversation.push({
        role: 'user',
        content: current_message,
      });
    }

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: conversation,
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content =
      completion.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';

    res.json({
      content,
      success: true,
    });
  } catch (error) {
    console.error('Chat API 오류:', error.message);
    res.status(500).json({
      error: error.message || '서버 오류가 발생했습니다.',
      success: false,
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'API server is running' });
});

app.listen(PORT, () => {
  console.log(
    `\n🚀 채팅 API 서버가 http://localhost:${PORT} 에서 실행 중입니다.`
  );
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health\n`);
});
