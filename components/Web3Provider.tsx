'use client';

import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygonAmoy } from 'wagmi/chains';
import { useTheme } from 'next-themes';

import '@rainbow-me/rainbowkit/styles.css';

// Ensure we have a valid WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!projectId || projectId === 'demo') {
  console.warn(
    '⚠️  WalletConnect Project ID is missing or set to demo. ' +
    'Please set NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID in your .env.local file. ' +
    'Get a free Project ID at https://cloud.walletconnect.com/'
  );
}

const config = getDefaultConfig({
  appName: 'Moscow NFTs',
  projectId: projectId || 'demo',
  chains: [polygonAmoy],
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

interface Web3ProviderProps {
  children: ReactNode;
}

function RainbowKitWrapper({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <RainbowKitProvider
      modalSize="compact"
      initialChain={polygonAmoy}
      theme={theme === 'dark' ? darkTheme() : lightTheme()}
      showRecentTransactions={true}
    >
      {children}
    </RainbowKitProvider>
  );
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitWrapper>
          {children}
        </RainbowKitWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
}