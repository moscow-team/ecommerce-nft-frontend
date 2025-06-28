import { useState, useEffect, useCallback } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import api from '@/lib/axios';
import { NFT, Listing } from '@/types';
import { CONTRACTS, ERC721_ABI } from '@/lib/contracts';
import { useIPFS } from './useIPFS';

export const useNFTs = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();
  const { resolveCid } = useIPFS();

  // Get total supply
  const { data: totalSupply } = useReadContract({
    address: CONTRACTS.NFT_ADDRESS,
    abi: ERC721_ABI,
    functionName: 'totalSupply',
  });

  const fetchNFTMetadata = useCallback(async (tokenId: number): Promise<Partial<NFT> | null> => {
    try {
      // Get token URI
      const { data: tokenURI } = await api.get(`/api/nfts/${tokenId}/uri`);
      
      if (!tokenURI) return null;

      // Fetch metadata from IPFS
      const metadataUrl = resolveCid(tokenURI);
      const metadataResponse = await fetch(metadataUrl);
      const metadata = await metadataResponse.json();

      // Get owner
      const { data: owner } = await api.get(`/api/nfts/${tokenId}/owner`);

      // Get listing info
      let listing: Listing | null = null;
      try {
        const { data: listingData } = await api.get(`/api/market/listing/${tokenId}`);
        listing = listingData;
      } catch (error) {
        // NFT might not be listed
      }

      return {
        id: `${tokenId}`,
        tokenId,
        name: metadata.name,
        description: metadata.description,
        image: resolveCid(metadata.image),
        owner: owner,
        creator: owner, // Simplified - could track original creator
        price: listing?.price || '0',
        isListed: listing?.active || false,
        tokenURI: tokenURI,
      };
    } catch (error) {
      console.error(`Error fetching NFT ${tokenId}:`, error);
      return null;
    }
  }, [resolveCid]);

  const loadAllNFTs = useCallback(async () => {
    if (!totalSupply || totalSupply === 0n) {
      setNfts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const nftPromises = [];
      for (let i = 1; i <= Number(totalSupply); i++) {
        nftPromises.push(fetchNFTMetadata(i));
      }

      const nftResults = await Promise.all(nftPromises);
      const validNFTs = nftResults.filter((nft): nft is NFT => nft !== null) as NFT[];
      
      setNfts(validNFTs);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  }, [totalSupply, fetchNFTMetadata]);

  const loadUserNFTs = useCallback(async () => {
    if (!address) {
      setNfts([]);
      return;
    }

    setLoading(true);
    try {
      const { data: userNFTs } = await api.get(`/api/nfts/user/${address}`);
      
      const nftPromises = userNFTs.map((tokenId: number) => fetchNFTMetadata(tokenId));
      const nftResults = await Promise.all(nftPromises);
      const validNFTs = nftResults.filter((nft): nft is NFT => nft !== null) as NFT[];
      
      setNfts(validNFTs);
    } catch (error) {
      console.error('Error loading user NFTs:', error);
    } finally {
      setLoading(false);
    }
  }, [address, fetchNFTMetadata]);

  useEffect(() => {
    loadAllNFTs();
  }, [loadAllNFTs]);

  return {
    nfts,
    loading,
    loadAllNFTs,
    loadUserNFTs,
    fetchNFTMetadata,
  };
};