/* eslint-disable no-undef */
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const OpenAI = require('openai').default;
const path = require('path');

// .env 파일 로드
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 8000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.GPT_API_KEY;

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

// ==================== 서버 상태 확인 ====================
app.get('/api/stock/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Stock API server is running',
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'API server is running' });
});

// ==================== ChatGPT API ====================
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

// 주식 분석
app.post('/api/stock/analyze', async (req, res) => {
  try {
    const { stock_name, stock_ticker } = req.body;

    if (!stock_name || !stock_ticker) {
      return res.status(400).json({
        error: '종목명과 종목코드를 입력해주세요.',
        success: false,
      });
    }

    console.log(`📊 ${stock_name} (${stock_ticker}) 분석 시작...`);

    // GPT-4o를 사용한 주식 분석
    const today = new Date().toISOString().split('T')[0];
    const prompt = `${stock_name}(티커: ${stock_ticker})에 대한 상세 주식 분석 보고서를 900자 내외로 제공해 줘. 말투는 ~이다 를 사용해

분석 시에는 '네이버 증권', '연합인포맥스', 'DART 공시'의 정보를 우선적으로 참고해 줘.

보고서는 다음 섹션에 따라 한국어로 구성하고 마크다운 형식으로 제공해 주고 각 섹션의 타이틀은 h2크기로 제공해. 타이틀 뒤에는 항상 계행이 들어가야돼.

다음 섹션을 제외한 내용은 넣지말고 표도 사용하지마.

종목에 대한 한문장 요약을 하돼, 타이틀을 넣지마

모든 분석은 현재 시점(${today})까지 발표된 가장 최신 정보를 바탕으로 해야 한다. 특히 '최근 실적 및 뉴스' 섹션은 ${today}을 포함한 최근 시장 동향, 공시, 뉴스 기사를 최대한 반영하여 작성해 줘.

1. **기본적 분석(Fundamental Analysis)**

2. **최근 실적 및 뉴스(Recent Performance & News)**

3. **성장 동력 및 미래 전망(Growth Drivers & Future Outlook)**

4. **리스크 요인(Risk Factors)**

5. **가치 평가 요약(Valuation Summary)**`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            '넌 지금부터 분기별로 투자포트폴리오를 구상하는 ai펀드 매니저야. 한국 주식시장의 종목들을 분석하여 상세한 투자 리포트를 작성해줘.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    });

    const report =
      completion.choices[0]?.message?.content ||
      '분석 결과를 생성할 수 없습니다.';

    console.log(`✅ ${stock_name} 분석 완료`);

    res.json({
      success: true,
      stock_name,
      stock_ticker,
      latest_price: 'N/A', // 주가는 별도 API 필요
      report,
      citations: [],
    });
  } catch (error) {
    console.error('주식 분석 오류:', error.message);
    res.status(500).json({
      error: error.message || '주식 분석 중 오류가 발생했습니다.',
      success: false,
    });
  }
});

// 포트폴리오 생성
app.post('/api/stock/portfolio', async (req, res) => {
  try {
    const { model = 'STOCK_ETF', risk_level = 6 } = req.body;

    console.log(
      `📈 포트폴리오 생성 중... (모델: ${model}, 위험도: ${risk_level})`
    );

    // 위험도에 따른 포트폴리오 구성
    const riskProfiles = {
      low: [
        // 1~3: 안정형
        { name: '삼성전자', ticker: '005930', sector: 'IT' },
        { name: 'KODEX 200', ticker: '069500', sector: 'ETF' },
        { name: 'SK하이닉스', ticker: '000660', sector: 'IT' },
        { name: 'NAVER', ticker: '035420', sector: 'IT' },
      ],
      medium: [
        // 4~6: 중립형
        { name: '삼성전자', ticker: '005930', sector: 'IT' },
        { name: 'SK하이닉스', ticker: '000660', sector: 'IT' },
        { name: 'NAVER', ticker: '035420', sector: 'IT' },
        { name: 'LG에너지솔루션', ticker: '373220', sector: '배터리' },
        { name: '현대차', ticker: '005380', sector: '자동차' },
        { name: 'KODEX 200', ticker: '069500', sector: 'ETF' },
      ],
      high: [
        // 7~10: 공격형
        { name: '삼성전자', ticker: '005930', sector: 'IT' },
        { name: 'SK하이닉스', ticker: '000660', sector: 'IT' },
        { name: 'NAVER', ticker: '035420', sector: 'IT' },
        { name: '카카오', ticker: '035720', sector: 'IT' },
        { name: 'LG에너지솔루션', ticker: '373220', sector: '배터리' },
        { name: 'HD현대일렉트릭', ticker: '267260', sector: '전기/전자' },
        { name: '삼성바이오로직스', ticker: '207940', sector: '바이오' },
        { name: 'LG전자', ticker: '066570', sector: '전자' },
      ],
    };

    // 위험도에 따른 프로필 선택
    let selectedProfile;
    if (risk_level <= 3) {
      selectedProfile = riskProfiles.low;
    } else if (risk_level <= 6) {
      selectedProfile = riskProfiles.medium;
    } else {
      selectedProfile = riskProfiles.high;
    }

    // 비중 계산 (단순화된 버전)
    const totalStocks = selectedProfile.length;
    const portfolio = selectedProfile.map((stock, index) => ({
      ...stock,
      weight: 1 / totalStocks, // 균등 분배
    }));

    // GPT로 포트폴리오 요약 생성
    const portfolioStr = portfolio
      .map((item) => `${item.name}(${(item.weight * 100).toFixed(2)}%)`)
      .join(', ');

    const summaryPrompt = `당신은 시니어 포트폴리오 매니저입니다.
다음과 같이 구성된 주식 포트폴리오에 대한 간결한 종합 평가를 작성해 주세요.

포트폴리오 구성: ${portfolioStr}

평가는 다음 내용을 포함해야 합니다:
1. 포트폴리오의 전반적인 특징 (예: 특정 섹터 집중도, 안정성, 성장 가능성 등)
2. 긍정적인 측면과 잠재적 리스크 (단, 최대한 긍정적으로 나오지만 리스크도 짧게나마 나오게)
3. 전체 내용을 3~4개의 문단으로 요약하고, 말투는 '~로 보입니다.' 또는 '~입니다.'와 같이 전문적인 분석가 톤을 사용해 주세요.`;

    const summaryCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            '당신은 시니어 포트폴리오 매니저입니다. 제공된 포트폴리오 구성에 대해 객관적인 시각으로 평가해주세요.',
        },
        {
          role: 'user',
          content: summaryPrompt,
        },
      ],
      max_tokens: 2048,
      temperature: 0.7,
    });

    const summary =
      summaryCompletion.choices[0]?.message?.content ||
      '포트폴리오 평가를 생성할 수 없습니다.';

    console.log('✅ 포트폴리오 생성 완료');

    res.json({
      success: true,
      portfolio,
      summary,
      model,
      risk_level,
    });
  } catch (error) {
    console.error('포트폴리오 생성 오류:', error.message);
    res.status(500).json({
      error: error.message || '포트폴리오 생성 중 오류가 발생했습니다.',
      success: false,
    });
  }
});

// 종목 검색
app.get('/api/stock/search', (req, res) => {
  try {
    const query = req.query.q || '';

    // 샘플 종목 데이터
    const sampleStocks = [
      { name: '삼성전자', ticker: '005930' },
      { name: 'SK하이닉스', ticker: '000660' },
      { name: 'LG전자', ticker: '066570' },
      { name: '현대차', ticker: '005380' },
      { name: 'NAVER', ticker: '035420' },
      { name: '카카오', ticker: '035720' },
      { name: 'LG에너지솔루션', ticker: '373220' },
      { name: '삼성바이오로직스', ticker: '207940' },
      { name: 'KODEX 200', ticker: '069500' },
      { name: 'KB금융', ticker: '105560' },
      { name: '신한지주', ticker: '055550' },
      { name: 'POSCO홀딩스', ticker: '005490' },
      { name: '기아', ticker: '000270' },
      { name: 'HD현대일렉트릭', ticker: '267260' },
      { name: 'HMM', ticker: '011200' },
    ];

    let filtered;
    if (query) {
      filtered = sampleStocks.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.ticker.includes(query)
      );
    } else {
      filtered = sampleStocks;
    }

    res.json({
      success: true,
      stocks: filtered,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false,
    });
  }
});

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(
    `🚀 통합 API 서버가 http://localhost:${PORT} 에서 실행 중입니다.`
  );
  console.log('='.repeat(60));
  console.log('\n📱 ChatGPT API:');
  console.log(`   💬 Chat: http://localhost:${PORT}/api/chat`);
  console.log('\n📊 주식 분석 API:');
  console.log(`   📈 주식 분석: http://localhost:${PORT}/api/stock/analyze`);
  console.log(`   📊 포트폴리오: http://localhost:${PORT}/api/stock/portfolio`);
  console.log(`   🔍 종목 검색: http://localhost:${PORT}/api/stock/search`);
  console.log('\n🔧 기타:');
  console.log(`   ❤️  Health check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(60) + '\n');
});
