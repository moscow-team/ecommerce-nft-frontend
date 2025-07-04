'use client';

import { motion } from 'framer-motion';
import { Search, Filter, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NFTCard } from '@/components/NFTCard';
import { useNFTs } from '@/hooks/useNFTs';
import { useAccount, useWalletClient } from 'wagmi';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import { CONTRACTS, ERC20_ABI } from '@/lib/contracts';
import { useState } from 'react';

export default function HomePage() {
  const { nfts, loading } = useNFTs();

  const listedNFTs = nfts.filter(nft => nft.isListed);
  const featuredNFTs = listedNFTs.slice(0, 3);
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const [mintTo, setMintTo] = useState('');

  const handleMint = async () => {
    try {
      if (!walletClient) {
        toast.error('Conectá tu billetera');
        return;
      }

      if (!ethers.isAddress(mintTo)) {
        toast.error('Dirección inválida');
        return;
      }

      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const token = new ethers.Contract(CONTRACTS.DIP_ADDRESS, ERC20_ABI, signer);

      const tx = await token.transfer(mintTo, ethers.parseUnits('1000', 18));
      await tx.wait();

      toast.success(`✅ 1000 DIP enviados a ${mintTo.slice(0, 6)}...`);
      setMintTo('');
    } catch (error) {
      console.error('Error en mint:', error);
      toast.error('Error al enviar DIP');
    }
  };


  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 px-4"
      >
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent mb-6">
          Moscow NFTs
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Descubre, colecciona y vende NFTs extraordinarios en la red Polygon
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="px-8">
            Explorar NFTs
          </Button>
          <Button size="lg" variant="outline" className="px-8">
            Crear NFT
          </Button>
        </div>
      </motion.section>
      {/* Sección para el owner: Transferir 1000 DIP a otra address */}
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Transferir 1000 DIP (como Owner)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="Dirección de destino (0x...)"
            value={mintTo}
            onChange={(e) => setMintTo(e.target.value)}
          />
          <Button onClick={handleMint} disabled={!mintTo}>
            Enviar 1000 DIP
          </Button>
        </CardContent>
      </Card>


      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{nfts.length}</div>
            <div className="text-muted-foreground">Total de NFTs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{listedNFTs.length}</div>
            <div className="text-muted-foreground">En Venta</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {new Set(nfts.map(nft => nft.owner)).size}
            </div>
            <div className="text-muted-foreground">Coleccionistas Activos</div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Featured NFTs */}
      {featuredNFTs.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold">NFTs Destacados</h2>
            <Badge variant="secondary">Populares</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredNFTs.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Filters and Search */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar NFTs..."
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </motion.section>

      {/* All NFTs Grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold mb-6">Todos los NFTs</h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
                  <div className="h-3 bg-gray-200 animate-pulse rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : nfts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <CardContent>
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">No se encontraron NFTs</h3>
              <p className="text-muted-foreground mb-6">
                ¡Sé el primero en crear un NFT en este mercado!
              </p>
              <Button>Crea tu primer NFT</Button>
            </CardContent>
          </Card>
        )}
      </motion.section>
    </div>
  );
}