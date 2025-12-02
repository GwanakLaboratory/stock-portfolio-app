import { Header } from '@/components/ui/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserData {
  phoneNumber: string;
  email: string;
  isLoggedIn: boolean;
}

export default function MyPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    console.log('로그아웃 버튼 클릭됨');
    
    const performLogout = async () => {
      console.log('로그아웃 확인됨, 데이터 삭제 시작');
      try {
        // 모든 사용자 데이터 삭제
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('user_id');
        console.log('데이터 삭제 완료, 로그인 화면으로 이동');
        
        // 로그인 페이지로 직접 이동
        router.replace('/login');
      } catch (error) {
        console.error('Failed to logout:', error);
        Alert.alert('오류', '로그아웃에 실패했습니다.');
      }
    };

    // 웹에서는 window.confirm 사용, 모바일에서는 Alert 사용
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('정말 로그아웃 하시겠어요?')) {
        await performLogout();
      } else {
        console.log('로그아웃 취소');
      }
    } else {
      Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => {
            console.log('로그아웃 취소');
          },
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: performLogout,
        },
      ]);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="내 정보" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>이메일</Text>
              <Text style={styles.infoValue}>{userData?.email || '-'}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>휴대전화</Text>
              <Text style={styles.infoValue}>
                {userData?.phoneNumber || '-'}
              </Text>
            </View>
          </View>

          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutButtonText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  infoSection: {
    marginBottom: 40,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  actionSection: {
    marginTop: 20,
  },
  logoutButton: {
    height: 56,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
