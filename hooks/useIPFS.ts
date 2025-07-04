import axios from 'axios';

export const useIPFS = () => {
  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxContentLength: Infinity,
      headers: {
        'Content-Type': 'multipart/form-data',
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!,
      },
    });

    const cid = res.data.IpfsHash;
    return `ipfs://${cid}`;
  };

  const uploadMetadata = async (metadata: Record<string, any>) => {
    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      metadata,
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!,
        },
      }
    );
    const cid = res.data.IpfsHash;
    return `ipfs://${cid}`;
  };

  const resolveCid = (ipfsUrl: string): string => {
    if (!ipfsUrl.startsWith('ipfs://')) return ipfsUrl;
    const cid = ipfsUrl.replace('ipfs://', '');
    return `https://pink-key-jaguar-942.mypinata.cloud/ipfs/${cid}`;
  };

  return {
    uploadFile,
    uploadMetadata,
    resolveCid,
    uploading: false,
  };
};
