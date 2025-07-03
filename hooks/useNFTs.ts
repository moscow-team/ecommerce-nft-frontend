import { useState, useEffect, useCallback } from 'react';
import { useReadContract, useAccount, useWalletClient } from 'wagmi';
import api from '@/lib/axios';
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


  // const fetchNFTMetadata = useCallback(async (tokenId: number): Promise<Partial<NFT> | null> => {
  //   try {
  //     // Get token URI
  //     const { data: tokenURI } = await api.get(`/api/nfts/${tokenId}/uri`);
      
  //     if (!tokenURI) return null;

  //     // Fetch metadata from IPFS
  //     const metadataUrl = resolveCid(tokenURI);
  //     const metadataResponse = await fetch(metadataUrl);
  //     const metadata = await metadataResponse.json();

  //     // Get owner
  //     const { data: owner } = await api.get(`/api/nfts/${tokenId}/owner`);

  //     // Get listing info
  //     let listing: Listing | null = null;
  //     try {
  //       const { data: listingData } = await api.get(`/api/market/listing/${tokenId}`);
  //       listing = listingData;
  //     } catch (error) {
  //       // NFT might not be listed
  //     }

  //     return {
  //       id: `${tokenId}`,
  //       tokenId,
  //       name: metadata.name,
  //       description: metadata.description,
  //       image: resolveCid(metadata.image),
  //       owner: owner,
  //       creator: owner, // Simplified - could track original creator
  //       price: listing?.price || '0',
  //       isListed: listing?.active || false,
  //       tokenURI: tokenURI,
  //     };
  //   } catch (error) {
  //     console.error(`Error fetching NFT ${tokenId}:`, error);
  //     return null;
  //   }
  // }, [resolveCid]);

  const loadAllNFTs = useCallback(async () => {
    // if (!totalSupply || totalSupply === BigInt(0)) {
    //   setNfts([]);
    //   setLoading(false);
    //   return;
    // }

    setLoading(true);
    try {
      // const nftPromises = [];
      // for (let i = 1; i <= Number(totalSupply); i++) {
      //   nftPromises.push(fetchNFTMetadata(i));
      // }

      // const nftResults = await Promise.all(nftPromises);
      // const validNFTs = nftResults.filter((nft): nft is NFT => nft !== null) as NFT[];
      
      // setNfts(validNFTs);
      setNfts([]);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserNFTs = async () => {
    // if (!address) {
    //   setNfts([]);
    //   return;
    // }

    setLoading(true);
    try {
      
      if (!walletClient) {
        toast.error("No se pudo obtener el signer");
        return;
      }

      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      console.log("Signer:", signer);
      const marketPlaceContract = new ethers.Contract(CONTRACTS.MARKET_ADDRESS, MARKETPLACE_ABI, signer);
      console.log("MarketPlace Contract:");
      console.log(marketPlaceContract.getAddress())
      console.log("Address:", address);
      console.log(MARKETPLACE_ABI)
      console.log("MarketPlace Contract:");
console.log(marketPlaceContract.getAddress())

      const userListings = await marketPlaceContract.getAllListings();
      
      console.log("User Listings:");
      console.log(userListings);
      // const tokenId = mintResponse.data.tokenId;
      // const tokenId = receipt.events?.[0].args?.tokenId.toNumber() || 0;


      // const nftPromises = userNFTs.map((tokenId: number) => fetchNFTMetadata(tokenId));
      // const nftResults = await Promise.all(nftPromises);
      // const validNFTs = nftResults.filter((nft): nft is NFT => nft !== null) as NFT[];
      
      // setNfts(validNFTs);
      setNfts([])
    } catch (error) {
      console.error('Error loading user NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   loadAllNFTs();
  // }, [loadAllNFTs]);

  return {
    nfts,
    loading,
    loadAllNFTs,
    loadUserNFTs,
    // fetchNFTMetadata,
  };
};