'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useReadContract } from 'wagmi';
import { motion } from 'framer-motion';
import { formatEther, parseEther } from 'viem';
import { ShoppingCart, ExternalLink, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useNFTs } from '@/hooks/useNFTs';
import { CONTRACTS, ERC20_ABI } from '@/lib/contracts';
import { NFT } from '@/types';

interface BuyNFTPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BuyNFTPage({ params }: BuyNFTPageProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { buyNFT } = useMarketplace();
  const { fetchNFTMetadata } = useNFTs();
  
  const [nft, setNft] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [step, setStep] = useState<'approval' | 'purchase' | 'complete'>('approval');

  const [tokenId, setTokenId] = useState<number>(0);

  // Get user's DIP balance
  const { data: dipBalance } = useReadContract({
    address: CONTRACTS.DIP_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Get current allowance
  const { data: allowance } = useReadContract({
    address: CONTRACTS.DIP_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.MARKET_ADDRESS] : undefined,
  });

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

  const handlePurchase = async () => {
    if (!nft || !address || !isConnected) {
      toast.error('Por favor conecta tu billetera');
      return;
    }

    if (!nft.isListed || !nft.price || nft.price === '0') {
      toast.error('Este NFT no está en venta');
      return;
    }

    const price = nft.price;
    const priceInWei = BigInt(price);
    const userBalance = dipBalance || 0n;

    if (userBalance < priceInWei) {
      toast.error('Saldo insuficiente de DIP');
      return;
    }

    setPurchasing(true);
    
    try {
      await buyNFT(tokenId, formatEther(priceInWei));
      setStep('complete');
      
      setTimeout(() => {
        router.push('/my-nfts');
      }, 3000);
    } catch (error: any) {
      console.error('Purchase failed:', error);
      toast.error(error.message || 'Error en la compra');
    } finally {
      setPurchasing(false);
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

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Card>
          <CardContent className="p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-4">Conecta tu Billetera</h2>
            <p className="text-muted-foreground mb-6">
              Conecta tu billetera para comprar este NFT.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const price = nft.price ? formatEther(BigInt(nft.price)) : '0';
  const userBalance = dipBalance ? formatEther(dipBalance) : '0';
  const canAfford = dipBalance && nft.price ? dipBalance >= BigInt(nft.price) : false;
  const isOwner = nft.owner.toLowerCase() === address?.toLowerCase();

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

        {/* NFT Details & Purchase */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{nft.name}</CardTitle>
                  <p className="text-muted-foreground">Token ID: #{nft.tokenId}</p>
                </div>
                {nft.isListed ? (
                  <Badge variant="default" className="bg-green-500">
                    En Venta
                  </Badge>
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
                      {price} DIP
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Purchase Section */}
          {nft.isListed && nft.price && nft.price !== '0' && !isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Comprar NFT
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Tu Saldo de DIP</span>
                  <span className="font-semibold">{userBalance} DIP</span>
                </div>

                {!canAfford && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Saldo insuficiente de DIP. Necesitas {price} DIP para comprar este NFT.
                    </AlertDescription>
                  </Alert>
                )}

                {step === 'complete' ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">¡Compra Completada!</h3>
                    <p className="text-muted-foreground mb-4">
                      El NFT ha sido transferido a tu billetera.
                    </p>
                    <Button asChild>
                      <Link href="/my-nfts">Ver en Mis NFTs</Link>
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handlePurchase}
                    disabled={!canAfford || purchasing}
                    className="w-full"
                    size="lg"
                  >
                    {purchasing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Comprar por {price} DIP
                      </>
                    )}
                  </Button>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Esto aprobará el gasto de tokens DIP y completará la compra en dos transacciones.
                </p>
              </CardContent>
            </Card>
          )}

          {isOwner && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ya eres propietario de este NFT.
              </AlertDescription>
            </Alert>
          )}

          {/* External Links */}
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