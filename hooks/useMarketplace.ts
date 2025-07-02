import { useCallback } from 'react';
import { useWriteContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { CONTRACTS, ERC20_ABI, MARKETPLACE_ABI } from '@/lib/contracts';

export const useMarketplace = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const listNFT = useCallback(async (tokenId: number, price: string) => {
    try {
      const response = await api.post('/api/market/list', {
        tokenId,
        price: parseEther(price).toString(),
      });
      
      toast.success('NFT listado exitosamente!');
      return response.data;
    } catch (error) {
      console.error('Error listing NFT:', error);
      toast.error('Error al listar NFT');
      throw error;
    }
  }, []);

  const buyNFT = useCallback(async (tokenId: number, price: string) => {
    if (!address) {
      toast.error('Por favor conecta tu billetera');
      return;
    }

    try {
      // Step 1: Approve DIP token spending
      toast.info('Aprobando token DIP...');
      
      const approveHash = await writeContract({
        address: CONTRACTS.DIP_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.MARKET_ADDRESS, parseEther(price)],
      });

      // Wait for approval confirmation
      toast.info('Esperando confirmación de aprobación...');
      
      // Wait a bit for the approval transaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 2: Buy the NFT
      toast.info('Comprando NFT...');
      
      const buyHash = await writeContract({
        address: CONTRACTS.MARKET_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: 'buyNFT',
        args: [BigInt(tokenId)],
      });

      toast.success('NFT comprado exitosamente!');
      return { approveHash, buyHash };
    } catch (error: any) {
      console.error('Error buying NFT:', error);
      toast.error(error.message || 'Error al comprar NFT');
      throw error;
    }
  }, [address, writeContract]);

  const withdraw = useCallback(async () => {
    try {
      const response = await api.post('/api/market/withdraw');
      toast.success('¡Fondos retirados exitosamente!');
      return response.data;
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast.error('Error al retirar fondos');
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