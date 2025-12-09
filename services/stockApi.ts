// 주식 분석 API 클라이언트

import { supabase } from '@/lib/supabase';

interface StockAnalysisResponse {
  success: boolean;
  stock_name?: string;
  stock_ticker?: string;
  latest_price?: number | string;
  report?: string;
  citations?: any[];
  error?: string;
}

interface PortfolioItem {
  isuSrtCd: string;
  koNm: string;
  trdPrc: number;
  weight: number;
}

interface PortfolioResponse {
  success: boolean;
  status?: string;
  data?: PortfolioItem[];
  error?: string | null;
}

interface SearchStockResponse {
  success: boolean;
  stocks?: { name: string; ticker: string }[];
  error?: string;
}

// 서버 주소 설정

const STOCK_API_BASE_URL = 'http://10.100.174.82:8000';

console.log('🌐 주식 API URL:', STOCK_API_BASE_URL);

/**
 * 단일 주식 분석 요청
 */
export async function analyzeStock(
  stockName: string,
  stockTicker: string
): Promise<StockAnalysisResponse> {
  try {
    console.log(`📊 주식 분석 요청: ${stockName} (${stockTicker})`);

    const response = await fetch(`${STOCK_API_BASE_URL}/api/stock/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stock_name: stockName,
        stock_ticker: stockTicker,
      }),
    });

    const data: StockAnalysisResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '주식 분석에 실패했습니다.');
    }

    console.log('✅ 주식 분석 완료');
    return data;
  } catch (error) {
    console.error('주식 분석 API 호출 오류:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        '통합 API 서버에 연결할 수 없습니다.\n' +
          `(${STOCK_API_BASE_URL})\n\n` +
          '서버 실행: yarn server'
      );
    }

    throw error;
  }
}

/**
 * AI 포트폴리오 생성
 */
export async function generatePortfolio(
  model: string = 'STOCK_ETF',
  riskLevel: number = 6
): Promise<PortfolioResponse> {
  try {
    console.log(
      `📈 포트폴리오 생성 요청 (모델: ${model}, 위험도: ${riskLevel})`
    );

    const { data, error } = await supabase.functions.invoke('generate-portfolio-and-response', {
      body: { model, risk_level: riskLevel },
    });

    if (error) {
      console.error('Error calling generate_portfolio function:', error);
      throw error;
    }

    // data가 문자열인 경우 파싱, 객체인 경우 그대로 사용
    const parsedData: PortfolioResponse = typeof data === 'string' 
      ? JSON.parse(data) 
      : data;

    if (!parsedData.success) {
      throw new Error(parsedData.error || '포트폴리오 생성에 실패했습니다.');
    }

    console.log('✅ 포트폴리오 생성 완료');
    return parsedData;
  } catch (error) {
    console.error('포트폴리오 API 호출 오류:', error);
    throw error;
  }
}

/**
 * 종목 검색
 */
export async function searchStock(query: string): Promise<SearchStockResponse> {
  try {
    const response = await fetch(
      `${STOCK_API_BASE_URL}/api/stock/search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data: SearchStockResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '종목 검색에 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('종목 검색 API 호출 오류:', error);
    throw error;
  }
}

/**
 * 서버 상태 확인
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${STOCK_API_BASE_URL}/api/stock/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}
