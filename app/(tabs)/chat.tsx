import { Header } from '@/components/ui/Header';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  analyzeStock,
  generatePortfolio,
  searchStock,
} from '../../services/stockApi';

type ScreenMode = 'analyze' | 'portfolio';

interface SearchResult {
  name: string;
  ticker: string;
}

export default function ChatScreen() {
  const [mode, setMode] = useState<ScreenMode>('analyze');
  const [isLoading, setIsLoading] = useState(false);

  // 주식 분석 상태
  const [stockQuery, setStockQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');

  // 포트폴리오 상태
  const [portfolioModel, setPortfolioModel] = useState<string>('STOCK_ETF');
  const [riskLevel, setRiskLevel] = useState<number>(6);
  const [portfolioData, setPortfolioData] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userId = await AsyncStorage.getItem('user_id');
      console.log(userId);
    };

    loadUser();
  }, []);

  // 종목 검색
  const handleSearchStock = async () => {
    if (!stockQuery.trim()) return;

    try {
      setIsLoading(true);
      const result = await searchStock(stockQuery);
      if (result.success && result.stocks) {
        setSearchResults(result.stocks);
      }
    } catch (error) {
      Alert.alert(
        '검색 실패',
        error instanceof Error ? error.message : '종목 검색에 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 주식 분석 실행
  const handleAnalyzeStock = async (stock: SearchResult) => {
    try {
      setIsLoading(true);
      setSelectedStock(stock);
      setSearchResults([]);
      setStockQuery('');

      const result = await analyzeStock(stock.name, stock.ticker);

      if (result.success && result.report) {
        // success
      } else {
        throw new Error('분석 결과를 가져올 수 없습니다.');
      }
    } catch (error) {
      Alert.alert(
        '분석 실패',
        error instanceof Error ? error.message : '주식 분석에 실패했습니다.'
      );
      setAnalysisResult('');
    } finally {
      setIsLoading(false);
    }
  };

  // 포트폴리오 생성
  const handleGeneratePortfolio = async () => {
    try {
      setIsLoading(true);
      setPortfolioData(null); // 새 요청 시작 시 이전 데이터 초기화
      const result = await generatePortfolio(portfolioModel, riskLevel);

      if (result.success) {
        setPortfolioData(result);
        Alert.alert('포트폴리오 생성 완료', '포트폴리오가 생성되었습니다.');
      } else {
        throw new Error('포트폴리오를 생성할 수 없습니다.');
      }
    } catch (error) {
      setPortfolioData(null); // 실패 시 데이터 초기화
      Alert.alert(
        '생성 실패',
        error instanceof Error
          ? error.message
          : '포트폴리오 생성에 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 주식 분석 화면
  const renderAnalyze = () => (
    <KeyboardAvoidingView className="flex-1" behavior="padding">
      <ScrollView className="flex-1 px-4 py-4">
        {/* 검색 입력 */}
        <View className="mb-4">
          <Text className="mb-2 text-lg font-semibold">종목 검색</Text>
          <View className="flex flex-row items-center rounded-xl bg-gray-100 px-4 py-3">
            <TextInput
              className="flex-1 text-base"
              placeholder="종목명을 입력하세요 (예: 삼성전자)"
              value={stockQuery}
              onChangeText={setStockQuery}
              onSubmitEditing={handleSearchStock}
            />
            <TouchableOpacity onPress={handleSearchStock}>
              <Ionicons name="search" size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <View className="mb-4">
            <Text className="mb-2 text-base font-semibold">검색 결과</Text>
            {searchResults.map((stock, index) => (
              <TouchableOpacity
                key={index}
                className="mb-2 rounded-xl border border-gray-200 bg-white p-4"
                onPress={() => handleAnalyzeStock(stock)}
              >
                <Text className="text-base font-semibold">{stock.name}</Text>
                <Text className="text-sm text-gray-500">{stock.ticker}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 선택된 종목 */}
        {selectedStock && (
          <View className="mb-4 rounded-xl bg-blue-50 p-4">
            <Text className="text-base font-semibold">분석 종목</Text>
            <Text className="mt-1 text-lg font-bold">{selectedStock.name}</Text>
            <Text className="text-sm text-gray-600">
              {selectedStock.ticker}
            </Text>
          </View>
        )}

        {/* 로딩 */}
        {isLoading && (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-4 text-gray-600">분석 중입니다...</Text>
            <Text className="mt-1 text-sm text-gray-500">
              약 30초 ~ 1분 소요됩니다
            </Text>
          </View>
        )}

        {/* 분석 결과 */}
        {analysisResult && !isLoading && (
          <View className="mb-8">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-lg font-semibold">분석 결과</Text>
              <TouchableOpacity
                onPress={() => {
                  setAnalysisResult('');
                  setSelectedStock(null);
                }}
              >
                <Ionicons name="close-circle" size={24} color="gray" />
              </TouchableOpacity>
            </View>
            <View className="rounded-xl border border-gray-200 bg-white p-4">
              <Text className="text-base leading-6">{analysisResult}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // 포트폴리오 화면
  const renderPortfolio = () => (
    <ScrollView className="flex-1 px-4 py-4">
      {/* 모델 선택 */}
      <View className="mb-4">
        <Text className="mb-2 text-lg font-semibold">포트폴리오 모델</Text>
        <View className="flex-row flex-wrap gap-2">
          {[
            { label: '국내상장 (주식+ETF)', value: 'STOCK_ETF' },
            { label: 'ETF 전용', value: 'ETF' },
            { label: 'ETF+TQ', value: 'TFT_TOTAL_EQUAL' },
          ].map((item) => (
            <TouchableOpacity
              key={item.value}
              className={`rounded-full px-4 py-2 ${
                portfolioModel === item.value ? 'bg-green-500' : 'bg-gray-200'
              }`}
              onPress={() => setPortfolioModel(item.value)}
            >
              <Text
                className={`text-sm ${
                  portfolioModel === item.value ? 'text-white' : 'text-gray-700'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 위험도 선택 */}
      <View className="mb-4">
        <Text className="mb-2 text-lg font-semibold">
          위험도 레벨: {riskLevel}
        </Text>
        <View className="flex-row items-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <TouchableOpacity
              key={level}
              className={`flex-1 rounded-lg py-2 ${
                riskLevel === level ? 'bg-green-500' : 'bg-gray-200'
              }`}
              onPress={() => setRiskLevel(level)}
            >
              <Text
                className={`text-center text-xs ${
                  riskLevel === level ? 'text-white' : 'text-gray-700'
                }`}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text className="mt-2 text-xs text-gray-500">
          1: 안정형 ~ 6: 공격형
        </Text>
      </View>

      {/* 생성 버튼 */}
      <TouchableOpacity
        className={`my-4 rounded-2xl py-3 ${
          isLoading ? 'bg-gray-400' : 'bg-green-500'
        }`}
        onPress={handleGeneratePortfolio}
        disabled={isLoading}
      >
        <Text className="text-center text-base font-semibold text-white">
          {isLoading ? '생성 중...' : '📈 포트폴리오 생성'}
        </Text>
      </TouchableOpacity>

      {/* 로딩 */}
      {isLoading && (
        <View className="items-center py-8">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="mt-4 text-gray-600">포트폴리오 생성 중...</Text>
          <Text className="mt-1 text-sm text-gray-500">
            약 1~2분 소요됩니다
          </Text>
        </View>
      )}

      {/* 포트폴리오 결과 */}
      {portfolioData && !isLoading && (
        <View className="mb-4">
          <Text className="mb-3 text-lg font-semibold">생성된 포트폴리오</Text>

          {/* 요약 */}
          {portfolioData.summary && (
            <View className="mb-4 rounded-xl bg-green-50 p-4">
              <Text className="mb-2 text-base font-semibold">💡 AI 분석</Text>
              <Text className="text-sm leading-5">{portfolioData.summary}</Text>
            </View>
          )}

          {/* 종목 리스트 */}
          {portfolioData.data && portfolioData.data.length > 0 && (
            <View>
              <Text className="mb-2 text-base font-semibold">종목 구성</Text>
              {portfolioData.data.map((stock: any, index: number) => (
                <View
                  key={index}
                  className="mb-2 rounded-xl border border-gray-200 bg-white p-4"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-semibold">
                        {stock.koNm}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {stock.isuSrtCd}
                      </Text>
                      <Text className="mt-1 text-xs text-gray-400">
                        가격: {stock.trdPrc.toLocaleString()}원
                      </Text>
                    </View>
                    <View className="rounded-full bg-green-100 px-3 py-1">
                      <Text className="font-semibold text-green-700">
                        {(stock.weight * 100).toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* 헤더 */}
      <Header title="AI 주식 분석" />

      {/* 토글 메뉴 */}
      <View className="mx-4 mb-2 mt-3 flex-row rounded-xl bg-gray-50 p-1">
        <TouchableOpacity
          className={`flex-1 rounded-lg py-3 ${
            mode === 'analyze' ? 'bg-white shadow-sm' : 'bg-transparent'
          }`}
          onPress={() => setMode('analyze')}
        >
          <Text
            className={`text-center font-semibold ${
              mode === 'analyze' ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            📊 주식 분석
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 rounded-lg py-3 ${
            mode === 'portfolio' ? 'bg-white shadow-sm' : 'bg-transparent'
          }`}
          onPress={() => setMode('portfolio')}
        >
          <Text
            className={`text-center font-semibold ${
              mode === 'portfolio' ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            📈 포트폴리오
          </Text>
        </TouchableOpacity>
      </View>

      {/* 메인 컨텐츠 */}
      {mode === 'analyze' && renderAnalyze()}
      {mode === 'portfolio' && renderPortfolio()}
    </SafeAreaView>
  );
}
