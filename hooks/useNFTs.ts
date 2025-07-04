import { useState, useEffect, useCallback } from 'react';
import { useReadContract, useAccount, useWalletClient } from 'wagmi';
import { NFT, Listing } from '@/types';
import { CONTRACTS, ERC721_ABI, MARKETPLACE_ABI } from '@/lib/contracts';
import { useIPFS } from './useIPFS';
import { toast } from 'sonner';
import { ethers } from 'ethers';

export const useNFTs = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();
  const { resolveCid } = useIPFS();
  const { data: walletClient } = useWalletClient();

  const loadAllNFTs = useCallback(async () => {
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

      const valid = nftResults.filter((nft): nft is NFT => nft !== null);
      setNfts(valid);
    } catch (error) {
      console.error("Error loading NFTs:", error);
      toast.error("Error cargando NFTs");
    } finally {
      setLoading(false);
    }
  }, [walletClient]);


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

      // 1. Obtener listados
      const [tokenIds, prices] = await marketContract.getAllListings();

      if (!tokenIds.length) {
        setNfts([]);
        return;
      }

      // 2. Obtener metadatas
      const nftResults = await Promise.all(
        tokenIds.map(async (id: bigint, index: number) => {
          try {
            const tokenId = Number(id);
            const tokenURI = await nftContract.tokenURI(tokenId);
            const owner = await nftContract.ownerOf(tokenId);
            const metadataUrl = resolveCid(tokenURI);
            const metadataResponse = await fetch(metadataUrl);
            const metadata = await metadataResponse.json();

            return {
              id: tokenId.toString(),
              tokenId,
              name: metadata.name,
              description: metadata.description,
              image: resolveCid(metadata.image),
              owner,
              creator: owner, // o ajustar si querés trackear minter original
              price: prices[index].toString(),
              isListed: true,
              tokenURI,
            };
          } catch (e) {
            console.warn(`Error al procesar NFT ${id.toString()}:`, e);
            return null;
          }
        })
      );

      const validNFTs = nftResults.filter((nft): nft is NFT => nft !== null);
      setNfts(validNFTs);
    } catch (error) {
      console.error("Error loading NFTs:", error);
      toast.error("Error cargando NFTs");
    } finally {
      setLoading(false);
    }
  };

  const fetchNFTMetadata = useCallback(async (
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
  }, []);



  useEffect(() => {
    loadAllNFTs();
  }, [loadAllNFTs]);

  return {
    nfts,
    loading,
    loadAllNFTs,
    loadUserNFTs,
    fetchNFTMetadata
  };
};