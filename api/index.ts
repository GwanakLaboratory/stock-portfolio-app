import axios, {
  AxiosError,
  AxiosInstance,
  CreateAxiosDefaults,
  isAxiosError,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const setInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem('access_token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (err: AxiosError): Promise<AxiosError> => Promise.reject(err)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (isAxiosError(error) && error.response) {
        const { status, code, message } = error.response.data || {};
        console.log('API Error:', status, code, message);

        if (status === 401) {
          // TODO: refresh token 로직, 로그아웃 처리 등
        }

        if (status === 500) {
          // TODO: 서버 오류 처리
        }

        return Promise.reject(error);
      }

      console.error(error);
      return Promise.reject(error);
    }
  );

  return instance;
};

const options: CreateAxiosDefaults = {
  baseURL: process.env.BASE_API_URL,
  headers: {
    Accept: '*/*',
    'Content-Type': 'application/json; charset=UTF-8',
  },
};

const ax = axios.create(options);

setInterceptor(ax);

export default ax;
