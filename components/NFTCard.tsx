'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatEther } from 'viem';
import { Eye, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NFT } from '@/types';
import { cn } from '@/lib/utils';

interface NFTCardProps {
  nft: NFT;
  showActions?: boolean;
  className?: string;
}

export const NFTCard = ({ nft, showActions = true, className }: NFTCardProps) => {
  const [imageLoading, setImageLoading] = useState(true);

  const price = nft.price && nft.price !== '0' ? formatEther(BigInt(nft.price)) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn("group", className)}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
        <div className="relative aspect-square overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <Image
            src={nft.image}
            alt={nft.name}
            fill
            className={cn(
              "object-cover transition-transform duration-300 group-hover:scale-105",
              imageLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          
          {/* Status badge */}
          <div className="absolute top-3 right-3">
            {nft.isListed ? (
              <Badge variant="default" className="bg-green-500 text-white">
                En Venta
              </Badge>
            ) : (
              <Badge variant="secondary">
                No Listado
              </Badge>
            )}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" asChild>
                <Link href={`/nft/${nft.tokenId}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Link>
              </Button>
              {nft.isListed && price && (
                <Button size="sm" asChild>
                  <Link href={`/buy/${nft.tokenId}`}>
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Comprar
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 truncate">{nft.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {nft.description}
          </p>
          
          {price && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Precio
              </span>
              <span className="font-semibold text-lg text-primary">
                {price} DIP
              </span>
            </div>
          )}
        </CardContent>

        {showActions && (
          <CardFooter className="p-4 pt-0">
            {nft.isListed && price ? (
              <Button asChild className="w-full">
                <Link href={`/buy/${nft.tokenId}`}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Comprar Ahora
                </Link>
              </Button>
            ) : (
              <Button variant="outline" disabled className="w-full">
                No Listado
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};