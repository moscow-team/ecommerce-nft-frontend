import { useCallback, useState } from 'react';
import { Web3Storage } from 'web3.storage';
import { NFTMetadata } from '@/types';

const WEB3_STORAGE_TOKEN = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN || '';

export const useIPFS = () => {
  const [uploading, setUploading] = useState(false);

  const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const cid = await client.put([file], {
        name: `nft-image-${Date.now()}`,
        maxRetries: 3,
      });
      return `https://${cid}.ipfs.w3s.link/${file.name}`;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    } finally {
      setUploading(false);
    }
  }, [client]);

  const uploadMetadata = useCallback(async (metadata: NFTMetadata): Promise<string> => {
    setUploading(true);
    try {
      const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const file = new File([blob], 'metadata.json');
      
      const cid = await client.put([file], {
        name: `nft-metadata-${Date.now()}`,
        maxRetries: 3,
      });
      return `https://${cid}.ipfs.w3s.link/metadata.json`;
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      throw new Error('Failed to upload metadata to IPFS');
    } finally {
      setUploading(false);
    }
  }, [client]);

  const resolveCid = useCallback((cid: string): string => {
    if (cid.startsWith('http')) return cid;
    return `https://${cid}.ipfs.w3s.link`;
  }, []);

  return {
    uploadFile,
    uploadMetadata,
    resolveCid,
    uploading,
  };
};