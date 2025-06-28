import { useCallback } from 'react';
import { useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { CONTRACTS, ERC20_ABI, MARKETPLACE_ABI } from '@/lib/contracts';
import { useI18n } from './useI18n';

export const useMarketplace = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { t } = useI18n();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const listNFT = useCallback(async (tokenId: number, price: string) => {
    try {
      const response = await api.post('/api/market/list', {
        tokenId,
        price: parseEther(price).toString(),
      });
      
      toast.success(t('success.listed'));
      return response.data;
    } catch (error) {
      console.error('Error listing NFT:', error);
      toast.error('Failed to list NFT');
      throw error;
    }
  }, [t]);

  const buyNFT = useCallback(async (tokenId: number, price: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      // Step 1: Approve DIP token spending
      toast.info('Approving DIP token...');
      
      const approveHash = await writeContract({
        address: CONTRACTS.DIP_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.MARKET_ADDRESS, parseEther(price)],
      });

      // Wait for approval confirmation
      toast.info('Waiting for approval confirmation...');
      
      // Wait a bit for the approval transaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 2: Buy the NFT
      toast.info('Purchasing NFT...');
      
      const buyHash = await writeContract({
        address: CONTRACTS.MARKET_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'buyNFT',
        args: [BigInt(tokenId)],
      });

      toast.success(t('success.bought'));
      return { approveHash, buyHash };
    } catch (error: any) {
      console.error('Error buying NFT:', error);
      toast.error(error.message || 'Failed to purchase NFT');
      throw error;
    }
  }, [address, writeContract, t]);

  const withdraw = useCallback(async () => {
    try {
      const response = await api.post('/api/market/withdraw');
      toast.success('Funds withdrawn successfully!');
      return response.data;
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast.error('Failed to withdraw funds');
      throw error;
    }
  }, []);

  return {
    listNFT,
    buyNFT,
    withdraw,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
};