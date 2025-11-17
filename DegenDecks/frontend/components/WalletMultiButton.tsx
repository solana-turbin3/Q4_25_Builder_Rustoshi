'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton as BaseWalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletMultiButton = () => {
  const { publicKey, connected } = useWallet();

  return (
    <div className="wallet-adapter-button-wrapper">
      <BaseWalletMultiButton 
        className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !rounded-lg !px-6 !py-3 !font-semibold !transition-all !duration-200 !shadow-lg hover:!shadow-xl"
      />
      {connected && publicKey && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          Connected: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </div>
      )}
    </div>
  );
};
