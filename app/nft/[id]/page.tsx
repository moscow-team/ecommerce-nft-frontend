'use client';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useNFTs } from '@/hooks/useNFTs';
import { CONTRACTS, ERC721_ABI, MARKETPLACE_ABI } from '@/lib/contracts';
import { NFT } from '@/types';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Loader2,
  ShoppingCart
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatEther, parseEther } from 'viem';
import {
  useAccount
} from 'wagmi';

interface ViewNFTPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ViewNFTPage({ params }: ViewNFTPageProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { fetchNFTMetadata } = useNFTs();
  const [nft, setNft] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(false);
  const [delisting, setDelisting] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const [tokenId, setTokenId] = useState<number>(0);


  useEffect(() => {
    const loadNFT = async () => {
      try {
        const resolvedParams = await params;
        const parsedTokenId = parseInt(resolvedParams.id);
        setTokenId(parsedTokenId);

        const nftData = await fetchNFTMetadata(parsedTokenId);
        if (nftData) {
          setNft(nftData as NFT);
        } else {
          toast.error('NFT no encontrado');
          router.push('/');
        }
      } catch (error) {
        console.error('Error loading NFT:', error);
        toast.error('Error al cargar NFT');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    loadNFT();
  }, [params, fetchNFTMetadata, router]);

  const isOwner = nft && address?.toLowerCase() === nft.owner.toLowerCase();

  const handleList = async () => {
    if (!nft || !priceInput || isNaN(Number(priceInput))) return;
    setListing(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(CONTRACTS.NFT_ADDRESS, ERC721_ABI, signer);
      const marketplaceContract = new ethers.Contract(
        CONTRACTS.MARKET_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      const txApprove = await nftContract.approve(CONTRACTS.MARKET_ADDRESS, nft.tokenId);
      await txApprove.wait();

      const txList = await marketplaceContract.listItem(
        nft.tokenId,
        parseEther(priceInput)
      );
      await txList.wait();

      toast.success('NFT listado exitosamente');
      router.refresh();
    } catch (error: any) {
      console.error('Error al listar NFT:', error);
      toast.error(error.message || 'Error al listar NFT');
    } finally {
      setListing(false);
    }
  };

  const handleDelist = async () => {
    if (!nft) return;
    setDelisting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const market = new ethers.Contract(CONTRACTS.MARKET_ADDRESS, MARKETPLACE_ABI, signer);
      const tx = await market.cancelListing(nft.tokenId); 
      await tx.wait();

      toast.success('NFT deslistado');
      router.refresh();
    } catch (e: any) {
      console.error('Error delisting NFT:', e);
      toast.error(e.message || 'Error al deslistar NFT');
    } finally {
      setDelisting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Card>
          <CardContent className="p-8">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-4">NFT No Encontrado</h2>
            <p className="text-muted-foreground mb-6">
              El NFT que buscas no existe o ha sido eliminado.
            </p>
            <Button asChild>
              <Link href="/">Volver al Mercado</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* NFT Image */}
        <Card className="overflow-hidden">
          <div className="aspect-square relative">
            <Image
              src={nft.image}
              alt={nft.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        </Card>

        {/* NFT Details & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{nft.name}</CardTitle>
                  <p className="text-muted-foreground">Token ID: #{nft.tokenId}</p>
                </div>
                {nft.isListed ? (
                  <Badge variant="default" className="bg-green-500">En Venta</Badge>
                ) : (
                  <Badge variant="secondary">No Listado</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{nft.description}</p>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Propietario</span>
                <span className="font-mono text-sm">
                  {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                </span>
              </div>

              {nft.isListed && nft.price && nft.price !== '0' && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Precio</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatEther(BigInt(nft.price))} DIP
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* List/Delist actions for owner */}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Gestionar NFT
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {nft.isListed ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleDelist}
                    disabled={delisting}
                  >
                    {delisting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cancelando venta...
                      </>
                    ) : (
                      'Cancelar venta'
                    )}
                  </Button>
                ) : (
                  <>
                    <Input
                      type="number"
                      placeholder="Precio en DIP"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                    />
                    <Button
                      className="w-full"
                      onClick={handleList}
                      disabled={!priceInput || isNaN(Number(priceInput)) || Number(priceInput) <= 0 || listing}
                    >
                      {listing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Listando...
                        </>
                      ) : (
                        `Listar NFT por ${priceInput || 0} DIP`
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ver en Polygonscan</span>
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href={`https://amoy.polygonscan.com/token/${CONTRACTS.NFT_ADDRESS}?a=${nft.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
