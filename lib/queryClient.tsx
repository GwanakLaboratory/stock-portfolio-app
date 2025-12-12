import {
  QueryClient,
  QueryClientProvider as BaseQueryClientProvider,
} from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
    },
  },
});

type QueryClientProviderProps = {
  children: React.ReactNode;
};

export function QueryClientProvider({ children }: QueryClientProviderProps) {
  return (
    <BaseQueryClientProvider client={queryClient}>
      {children}
    </BaseQueryClientProvider>
  );
}
