'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { injectedWallet } from '@rainbow-me/rainbowkit/wallets';
import { WagmiProvider } from 'wagmi';
import { hardhat, localhost } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';

const config = getDefaultConfig({
  appName: 'Podium Referee',
  projectId: 'f36f7f706a5807add3957297e68fb217', 
  chains: [hardhat, localhost],
  ssr: true,
  wallets: [{ groupName: 'Browser Extension', wallets: [injectedWallet] }],
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
