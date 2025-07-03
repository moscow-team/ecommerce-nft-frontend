import { useCallback, useState } from 'react';
import * as Client from '@web3-storage/w3up-client';
import { NFTMetadata } from '@/types';

export const useIPFS = () => {
  const [uploading, setUploading] = useState(false);
  const [client, setClient] = useState<Client.Client | null>(null);

  // Initialize client with authentication
  const initializeClient = useCallback(async () => {
    if (!client) {
      try {
        const newClient = await Client.create();
        
        // Check if client has a current space
        if (!newClient.currentSpace()) {
          // For development, you'll need to handle authentication
          // This is a placeholder - in production you'd want proper auth flow
          console.warn('Client not authenticated. Please set up authentication.');
        }
        
        setClient(newClient);
        return newClient;
      } catch (error) {
        console.error('Failed to initialize w3up client:', error);
        throw new Error('Failed to initialize IPFS client');
      }
    }
    return client;
  }, [client]);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const clientInstance = await initializeClient();
      
      // Upload file using the new w3up-client API
      const cid = await clientInstance.uploadFile(file);
      
      // Return the IPFS gateway URL
      return `https://${cid.toString()}.ipfs.w3s.link/${file.name}`;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      // Fallback to a more basic error message
      throw new Error('Failed to upload file to IPFS. Please check your authentication.');
    } finally {
      setUploading(false);
    }
  }, [initializeClient]);

  // const uploadMetadata = useCallback(async (metadata: NFTMetadata): Promise<string> => {
  //   setUploading(true);
  //   try {
  //     const clientInstance = await initializeClient();
      
  //     // Create a JSON file from metadata
  //     const blob = new Blob([JSON.stringify(metadata, null, 2)], { 
  //       type: 'application/json' 
  //     });
  //     const file = new File([blob], 'metadata.json', { 
  //       type: 'application/json' 
  //     });
      
  //     // Upload metadata file
  //     const cid = await clientInstance.uploadFile(file);
      
  //     // Return the IPFS gateway URL
  //     return `https://${cid.toString()}.ipfs.w3s.link/metadata.json`;
  //   } catch (error) {
  //     console.error('Error uploading metadata to IPFS:', error);
  //     throw new Error('Failed to upload metadata to IPFS. Please check your authentication.');
  //   } finally {
  //     setUploading(false);
  //   }
  // }, [initializeClient]);

  const uploadMetadata = (async (metadata: NFTMetadata): Promise<string> => {
    setUploading(true);
    try {
      // Create a JSON file from metadata
      const blob = new Blob([JSON.stringify(metadata, null, 2)], { 
        type: 'application/json' 
      });
      const file = new File([blob], 'metadata.json', { 
        type: 'application/json' 
      });
      
      // // Upload metadata file
      // const cid = await clientInstance.uploadFile(file);
      
      // Return the IPFS gateway URL
      // return `https://${cid.toString()}.ipfs.w3s.link/metadata.json`;



      
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      throw new Error('Failed to upload metadata to IPFS. Please check your authentication.');
    } finally {
      setUploading(false);
    }
  });




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