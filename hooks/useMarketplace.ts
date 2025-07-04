import { useCallback } from 'react';
import { useWriteContract, useAccount, useWaitForTransactionReceipt, useWalletClient, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';
import { CONTRACTS, ERC20_ABI, MARKETPLACE_ABI } from '@/lib/contracts';
import { ethers } from 'ethers';

export const useMarketplace = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { data: walletClient } = useWalletClient();
  const { refetch: refetchProceeds } = useReadContract({
    address: CONTRACTS.MARKET_ADDRESS as any,
    abi: MARKETPLACE_ABI,
    functionName: 'proceeds',
    args: address ? [address] : undefined,
  });

  const { data: dipBalance } = useReadContract({
    address: CONTRACTS.DIP_ADDRESS as any,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const listNFT = useCallback(async (tokenId: number, price: string) => {
    try {
      if (!walletClient) {
        toast.error("No se pudo obtener el signer");
        return;
      }

      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      const marketPlaceContract = new ethers.Contract(CONTRACTS.MARKET_ADDRESS, MARKETPLACE_ABI, signer);
      const parsedPrice = parseEther(price); // precio como "0.1" => bigint
      console.log('Listing NFT with tokenId:', tokenId, 'and price:', parsedPrice.toString());
      const tx = await marketPlaceContract.listItem(tokenId, parsedPrice);
      await tx.wait();
      console.log('NFT listed successfully:', tx.hash);

      toast.success('✅ NFT listado exitosamente');
      return tx.hash;
    } catch (error) {
      console.error('❌ Error listing NFT:', error);
      toast.error('Error al listar NFT');
      throw error;
    }
  }, []);


  const buyNFT = useCallback(async (tokenId: number, price: string) => {
    if (!walletClient || !address) {
      toast.error('Conecta tu billetera');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      const dipTokenContract = new ethers.Contract(CONTRACTS.DIP_ADDRESS, ERC20_ABI, signer);
      const marketContract = new ethers.Contract(CONTRACTS.MARKET_ADDRESS, MARKETPLACE_ABI, signer);
      const parsedPrice = ethers.parseEther(price);

      // Paso 1: aprobar DIP para el marketplace
      toast.info('Aprobando gasto en DIP...');
      const approveTx = await dipTokenContract.approve(CONTRACTS.MARKET_ADDRESS, parsedPrice);
      await approveTx.wait();
      toast.success('Aprobación completada');

      // Paso 2: ejecutar la compra
      toast.info('Comprando NFT...');
      const buyTx = await marketContract.buyItem(BigInt(tokenId));
      await buyTx.wait();

      toast.success('✅ NFT comprado!');
      return buyTx.hash;
    } catch (error: any) {
      console.error('Error al comprar NFT:', error);
      toast.error(error.message || 'Error al comprar NFT');
      throw error;
    }
  }, [walletClient, address]);


  const withdraw = useCallback(async () => {
  if (!walletClient) {
    toast.error('No se encontró el signer');
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(walletClient.transport);
    const signer = await provider.getSigner();

    const marketContract = new ethers.Contract(
      CONTRACTS.MARKET_ADDRESS,
      MARKETPLACE_ABI,
      signer
    );

    const tx = await marketContract.withdrawProceeds();
    toast.info('⏳ Confirmando retiro...');
    await tx.wait();

    toast.success('💰 Fondos retirados exitosamente');

    // 👉 Refrescamos el estado
    await refetchProceeds();
  } catch (error: any) {
    console.error('❌ Error al retirar fondos:', error);
    toast.error(error.message || 'Error al retirar fondos');
  }
}, [walletClient, refetchProceeds, dipBalance]);


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