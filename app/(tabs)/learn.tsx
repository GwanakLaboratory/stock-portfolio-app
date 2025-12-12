import { Banner } from '@/components/learn/Banner';
import { CategoryTag } from '@/components/learn/CategoryTag';
import { LearnCard } from '@/components/learn/LearnCard';
import { Header } from '@/components/ui/Header';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface LearningContent {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
}

const learningContents: LearningContent[] = [
  {
    id: '1',
    title: '주식 투자의 기본 원칙',
    description: '장기 투자와 분산 투자의 중요성을 알아봅니다.',
    category: '기초 개념',
    duration: '5분',
  },
  {
    id: '2',
    title: 'PER과 PBR 완벽 이해하기',
    description: '기업 가치 평가의 핵심 지표를 쉽게 설명합니다.',
    category: '재무제표',
    duration: '7분',
  },
  {
    id: '3',
    title: 'ETF란 무엇인가?',
    description: 'ETF의 구조와 투자 장점을 알아봅니다.',
    category: 'ETF',
    duration: '6분',
  },
  {
    id: '4',
    title: '이동평균선 활용법',
    description: '20일선, 60일선, 120일선의 의미와 활용법.',
    category: '차트 분석',
    duration: '8분',
  },
  {
    id: '5',
    title: '배당주 투자 전략',
    description: '안정적인 배당 수익을 위한 종목 선정 기준.',
    category: '주식',
    duration: '6분',
  },
  {
    id: '6',
    title: '비트코인의 이해',
    description: '암호화폐의 기초와 블록체인 기술 소개.',
    category: '코인',
    duration: '10분',
  },
];

export default function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState('전체');

  const filteredContents =
    selectedCategory === '전체'
      ? learningContents
      : learningContents.filter((c) => c.category === selectedCategory);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header title="학습" />

      <View className="px-5 my-6">
        <Banner />
        <Text className="text-[15px] font-semibold text-gray-900 mb-3 mt-6">
          학습 카테고리
        </Text>
        <CategoryTag
          select={selectedCategory}
          setSelect={setSelectedCategory}
        />
      </View>

      {filteredContents.length > 0 ? (
        <ScrollView
          className="px-5 pb-40 pt-1"
          showsVerticalScrollIndicator={false}
        >
          {filteredContents.map((content) => (
            <LearnCard key={content.id} {...content} />
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-base font-light text-center text-gray-500">
            컨텐츠가 아직 없어요. 😅
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
