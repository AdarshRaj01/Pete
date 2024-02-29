import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

const client = new QueryClient();

export default function QueryProvider({ children }: PropsWithChildren) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

// import { QueryClient, QueryClientProvider, useQuery } from 'react-query'

// const queryClient = new QueryClient()

// export default function App() {
//    return (
//      <QueryClientProvider client={queryClient}>
//        <Example />
//      </QueryClientProvider>
//    )
// }