import { supabase } from '@/lib/supabase';

interface User {
  user_id: string;
  email: string;
  phone: string;
  is_new: boolean;
}

interface ValidateUserRequest {
  userId: string;
  // 필요한 필드 추가
}

interface ValidateUserResponse {
  success: boolean;
  message: string;
  user_id: string;
  phone: string;
  email: string;
}

/**
 * get-user Edge Function 호출
 * 사용자 정보를 가져옵니다
 */
export const getUser = async (email: string, phone: string): Promise<User> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-user', {
      body: { email, phone },
    });

    if (error) {
      console.error('Error calling get-user function:', error);
      throw error;
    }

    return JSON.parse(data) as User;
  } catch (err) {
    console.error('Failed to get user:', err);
    throw err;
  }
};

/**
 * validate-user Edge Function 호출
 * 사용자를 검증합니다
 */
export const validateUser = async (
  userId: string
): Promise<ValidateUserResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('validate-user', {
      body: { user_id: userId },
    });

    if (error) {
      console.error('Error calling validate-user function:', error);
      throw error;
    }

    return JSON.parse(data) as ValidateUserResponse;
  } catch (err) {
    console.error('Failed to validate user:', err);
    throw err;
  }
};
