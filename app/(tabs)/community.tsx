import { CommunityInput } from '@/components/community/CommunityInput';
import { PostCard } from '@/components/community/PostCard';
import { Header } from '@/components/ui/Header';
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface Post {
  id: string;
  author: string;
  avatar?: string;
  time: string;
  content: string;
  comments: number;
  likes: number;
  isAI?: boolean;
}

const initialPosts: Post[] = [
  {
    id: 'ai-1',
    author: 'AI Agent',
    time: '1시간 전',
    content:
      '📊 오늘의 시장 분석\n\n코스피가 2,650선에서 강보합 마감했습니다. 반도체·2차전지 섹터가 강세를 보였으며, 외국인은 순매수세를 유지했습니다.\n\n주요 이슈: 연준 금리 동결 기대감, HBM 수요 증가',
    comments: 24,
    likes: 156,
    isAI: true,
  },
  {
    id: '1',
    author: '투자고수',
    time: '2시간 전',
    content:
      '삼성전자 7만원대 진입 시 분할 매수 고려 중입니다. 반도체 사이클 바닥 의견 어떠신가요?',
    comments: 18,
    likes: 42,
  },
  {
    id: 'ai-2',
    author: 'AI Agent',
    time: '3시간 전',
    content:
      '💡 초보자 투자 팁\n\n주식 투자 시작 시 가장 중요한 3가지:\n1. 분산 투자로 리스크 관리\n2. 장기적 관점 유지\n3. 감정적 매매 자제\n\n자세한 내용은 학습 탭에서 확인하세요!',
    comments: 45,
    likes: 203,
    isAI: true,
  },
  {
    id: '2',
    author: 'ETF초보',
    time: '4시간 전',
    content:
      'S&P500 ETF vs 나스닥100 ETF 어떤 게 더 나을까요? 장기 투자 목적입니다 🤔',
    comments: 31,
    likes: 28,
  },
  {
    id: '3',
    author: '배당러',
    time: '5시간 전',
    content:
      '고배당주 포트폴리오 구성 완료! 예상 연 배당수익률 5.2% 달성했습니다. 은행주 + 통신주 위주로 갔어요.',
    comments: 15,
    likes: 67,
  },
];

export default function CommunityPage() {
  const [posts] = useState<Post[]>(initialPosts);
  const [newPost, setNewPost] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Header title="우리들의 커뮤니티" />

      <ScrollView
        className="px-5 pt-6 pb-40"
        showsVerticalScrollIndicator={false}
      >
        <CommunityInput newPost={newPost} setNewPost={setNewPost} />
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
