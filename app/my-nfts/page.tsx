'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { motion } from 'framer-motion';
import { Wallet, Download, Plus } from 'lucide-react';
import { formatEther } from 'viem';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NFTCard } from '@/components/NFTCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useNFTs } from '@/hooks/useNFTs';
import { useMarketplace } from '@/hooks/useMarketplace';
import { CONTRACTS, ERC20_ABI, MARKETPLACE_ABI } from '@/lib/contracts';

export default function MyNFTsPage() {
  const { address, isConnected } = useAccount();
  const { nfts, loadUserNFTs } = useNFTs();
  
  const { withdraw } = useMarketplace();
  const [proceeds, setProceeds] = useState<bigint>(BigInt(0));
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const { data: dipBalance } = useReadContract({
    address: CONTRACTS.DIP_ADDRESS as any,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: userProceeds, refetch: refetchProceeds } = useReadContract({
    address: CONTRACTS.MARKET_ADDRESS as any,
    abi: MARKETPLACE_ABI,
    functionName: 'proceeds',
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (userProceeds) {
      setProceeds(userProceeds as bigint);
    }
  }, [userProceeds]);

  useEffect(() => {
    if (isConnected && address) {
      loadUserNFTs();
    }
  }, [isConnected, address, nfts]);

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      await withdraw();
      toast.success('¡Fondos retirados exitosamente!');
      refetchProceeds(); // actualiza proceeds luego del retiro
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast.error('Error al retirar fondos');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Card>
          <CardContent className="p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-4">Conecta tu Billetera</h2>
            <p className="text-muted-foreground mb-6">
              Conecta tu billetera para ver tus NFTs y gestionar tu colección.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ownedNFTs = nfts.filter(nft => nft.owner.toLowerCase() === address?.toLowerCase());
  const listedNFTs = ownedNFTs.filter(nft => nft.isListed);
  const dip = typeof dipBalance === 'bigint' ? dipBalance : BigInt(0);
  const totalBalance = dip + proceeds;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Mis NFTs</h1>
          <p className="text-muted-foreground">
            Gestiona tu colección de NFTs y ganancias
          </p>
        </div>
        <Button asChild>
          <Link href="/create">
            <Plus className="h-4 w-4 mr-2" />
            Crear NFT
          </Link>
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{ownedNFTs.length}</div>
                <div className="text-sm text-muted-foreground">NFTs Propios</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Download className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{listedNFTs.length}</div>
                <div className="text-sm text-muted-foreground">Listados para Venta</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {formatEther(totalBalance)} DIP
                </div>
                <div className="text-sm text-muted-foreground">Total Disponible</div>
              </div>
              <Button
                size="sm"
                onClick={handleWithdraw}
                disabled={proceeds === BigInt(0) || isWithdrawing}
              >
                {isWithdrawing ? (
                  <LoadingSpinner size={16} />
                ) : (
                  'Retirar'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* NFTs Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="owned" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="owned">NFTs Propios ({ownedNFTs.length})</TabsTrigger>
            <TabsTrigger value="listed">Listados ({listedNFTs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="owned" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {ownedNFTs.map((nft) => (
                <NFTCard key={nft.id} nft={nft} showActions={false} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="listed" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listedNFTs.map((nft) => (
                <NFTCard key={nft.id} nft={nft} showActions={false} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
