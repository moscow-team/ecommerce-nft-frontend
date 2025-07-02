'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Wallet, Download, Plus } from 'lucide-react';
import { formatEther } from 'viem';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NFTCard } from '@/components/NFTCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useNFTs } from '@/hooks/useNFTs';
import { useMarketplace } from '@/hooks/useMarketplace';
import api from '@/lib/axios';

export default function MyNFTsPage() {
  const { address, isConnected } = useAccount();
  const { nfts, loading, loadUserNFTs } = useNFTs();
  const { withdraw } = useMarketplace();
  const [pendingWithdrawals, setPendingWithdrawals] = useState('0');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const loadPendingWithdrawals = async () => {
      if (!address) return;
      
      try {
        const response = await api.get(`/api/market/withdrawals/${address}`);
        setPendingWithdrawals(response.data.amount || '0');
      } catch (error) {
        console.error('Error loading pending withdrawals:', error);
      }
    };

    if (isConnected && address) {
      loadUserNFTs();
      loadPendingWithdrawals();
    }
  }, [isConnected, address, loadUserNFTs]);

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      await withdraw();
      setPendingWithdrawals('0');
      toast.success('¡Fondos retirados exitosamente!');
    } catch (error) {
      console.error('Error withdrawing funds:', error);
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

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Mis NFTs
          </h1>
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
                  {formatEther(BigInt(pendingWithdrawals))} DIP
                </div>
                <div className="text-sm text-muted-foreground">Retiros Pendientes</div>
              </div>
              <Button
                size="sm"
                onClick={handleWithdraw}
                disabled={pendingWithdrawals === '0' || isWithdrawing}
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
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-square bg-gray-200 animate-pulse" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
                      <div className="h-3 bg-gray-200 animate-pulse rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : ownedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {ownedNFTs.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} showActions={false} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <CardContent>
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-semibold mb-2">Aún no tienes NFTs</h3>
                  <p className="text-muted-foreground mb-6">
                    ¡Crea tu primer NFT para comenzar!
                  </p>
                  <Button asChild>
                    <Link href="/create">Crea tu primer NFT</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="listed" className="mt-6">
            {listedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listedNFTs.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} showActions={false} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <CardContent>
                  <div className="text-6xl mb-4">🏪</div>
                  <h3 className="text-xl font-semibold mb-2">No hay NFTs Listados</h3>
                  <p className="text-muted-foreground mb-6">
                    ¡Lista tus NFTs para la venta y comienza a ganar!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}