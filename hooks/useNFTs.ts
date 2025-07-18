import { CONTRACTS, ERC721_ABI, MARKETPLACE_ABI } from '@/lib/contracts';
import { Listing, NFT } from '@/types';
import { ethers } from 'ethers';
import { useState } from 'react';
import { toast } from 'sonner';
import { useWalletClient } from 'wagmi';
import { useIPFS } from './useIPFS';

export const useNFTs = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const { resolveCid } = useIPFS();
  const { data: walletClient } = useWalletClient();

  const loadAllNFTs = async () => {
    setLoading(true);
    try {
      if (!walletClient) {
        console.error("No se pudo obtener el signer");
        toast.error("No se pudo obtener el signer");
        return;
      }

      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(CONTRACTS.NFT_ADDRESS, ERC721_ABI, signer);
      const marketContract = new ethers.Contract(CONTRACTS.MARKET_ADDRESS, MARKETPLACE_ABI, signer);

      const totalSupply: bigint = await nftContract.totalSupply();
      console.log('totalSuple: ', totalSupply)

      if (totalSupply === BigInt(0)) {
        setNfts([]);
        return;
      }

      const nftResults = await Promise.all(
        Array.from({ length: Number(totalSupply) }).map(async (_, i) => {
          const tokenId = i + 1;

          try {
            const tokenURI = await nftContract.tokenURI(tokenId);
            const owner = await nftContract.ownerOf(tokenId);
            const metadataUrl = resolveCid(tokenURI);
            const metadataRes = await fetch(metadataUrl);
            const metadata = await metadataRes.json();

            // Check listing status
            const listing = await marketContract.listings(tokenId);
            const isListed = listing.price > 0;

            return {
              id: tokenId.toString(),
              tokenId,
              name: metadata.name,
              description: metadata.description,
              image: resolveCid(metadata.image),
              owner,
              creator: owner,
              price: isListed ? listing.price.toString() : '0',
              isListed,
              tokenURI,
            };
          } catch (e) {
            console.warn(`❌ Error al procesar tokenId ${tokenId}:`, e);
            return {};
          }
        })
      );

      const valid = nftResults.filter((nft): nft is NFT => nft && Object.keys(nft).length > 0) as NFT[];
      setNfts(valid);
    } catch (error) {
      console.error("Error loading NFTs:", error);
      toast.error("Error cargando NFTs");
    } finally {
      setLoading(false);
    }
  };

  const loadUserNFTs = async () => {
  setLoading(true);
  try {
    if (!walletClient) {
      toast.error("No se pudo obtener el signer");
      return;
    }

    const provider = new ethers.BrowserProvider(walletClient.transport);
    const signer = await provider.getSigner();
    const nftContract = new ethers.Contract(CONTRACTS.NFT_ADDRESS, ERC721_ABI, signer);
    const marketContract = new ethers.Contract(CONTRACTS.MARKET_ADDRESS, MARKETPLACE_ABI, signer);

    const totalSupply: bigint = await nftContract.totalSupply();
    const userAddress = await signer.getAddress();

    const nftResults = await Promise.all(
      Array.from({ length: Number(totalSupply) }).map(async (_, i) => {
        const tokenId = i + 1;

        try {
          const owner = await nftContract.ownerOf(tokenId);
          if (owner.toLowerCase() !== userAddress.toLowerCase()) return null;

          const tokenURI = await nftContract.tokenURI(tokenId);
          const metadataUrl = resolveCid(tokenURI);
          const metadataRes = await fetch(metadataUrl);
          const metadata = await metadataRes.json();

          const listing = await marketContract.listings(tokenId);
          const isListed = listing.price > 0 && listing.seller !== ethers.ZeroAddress;

          return {
            id: tokenId.toString(),
            tokenId,
            name: metadata.name,
            description: metadata.description,
            image: resolveCid(metadata.image),
            owner,
            creator: owner,
            price: isListed ? listing.price.toString() : '0',
            isListed,
            tokenURI,
          } as NFT;
        } catch (e) {
          console.warn(`❌ Error procesando tokenId ${tokenId}:`, e);
          return null;
        }
      })
    );

    const valid = nftResults.filter((nft): nft is NFT => nft !== null);
    setNfts(valid);
  } catch (error) {
    console.error("Error loading user NFTs:", error);
    toast.error("Error cargando tus NFTs");
  } finally {
    setLoading(false);
  }
};

  const fetchNFTMetadata = async (
    tokenId: number,
  ): Promise<Partial<NFT> | null> => {
    try {
      if (!walletClient) {
        toast.error("No se pudo obtener el signer");
        return null;
      }

      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(CONTRACTS.NFT_ADDRESS, ERC721_ABI, signer);
      const marketContract = new ethers.Contract(CONTRACTS.MARKET_ADDRESS, MARKETPLACE_ABI, signer);

      // 1. Obtener tokenURI y owner desde contrato
      const tokenURI = await nftContract.tokenURI(tokenId);
      const owner = await nftContract.ownerOf(tokenId);

      // 2. Fetch desde IPFS
      const metadataUrl = resolveCid(tokenURI);
      const metadataResponse = await fetch(metadataUrl);
      const metadata = await metadataResponse.json();

      // 3. Obtener info del marketplace
      let listing: Listing | null = null;
      try {
        const listingData = await marketContract.listings(tokenId);

        listing = {
          tokenId,
          price: listingData.price.toString(),
          active: listingData.price > 0 && listingData.seller !== ethers.ZeroAddress,
          seller: listingData.seller,
        };
      } catch (e) {
        console.warn(`No se pudo obtener listing para tokenId ${tokenId}:`, e);
        // Puede no estar listado
      }

      return {
        id: tokenId.toString(),
        tokenId,
        name: metadata.name,
        description: metadata.description,
        image: resolveCid(metadata.image),
        owner,
        creator: owner,
        price: listing?.price || '0',
        isListed: listing?.active || false,
        tokenURI,
      };
    } catch (error) {
      console.error(`❌ Error fetching NFT ${tokenId}:`, error);
      return null;
    }
  };

  return {
    nfts,
    loading,
    loadAllNFTs,
    loadUserNFTs,
    fetchNFTMetadata
  };
};