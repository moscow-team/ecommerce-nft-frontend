'use client';

import { RainbowKitProvider, darkTheme, getDefaultConfig, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { localhost } from 'wagmi/chains';

import '@rainbow-me/rainbowkit/styles.css';

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (!projectId || projectId === 'demo') {
  console.warn(
    '⚠️  WalletConnect Project ID is missing or set to demo. ' +
    'Please set NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID in your .env.local file. ' +
    'Get a free Project ID at https://cloud.walletconnect.com/'
  );
}

const chains = [localhost] as const;

const config = getDefaultConfig({
  appName: 'Moscow NFTs',
  projectId: projectId || 'demo',
  chains,
  ssr: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
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
      initialChain={localhost} // 👈 puede ser polygonAmoy o localhost según contexto
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