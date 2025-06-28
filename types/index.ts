export interface NFT {
  id: string;
  tokenId: number;
  name: string;
  description: string;
  image: string;
  owner: string;
  creator: string;
  price?: string;
  isListed: boolean;
  tokenURI: string;
}

export interface Listing {
  tokenId: number;
  seller: string;
  price: string;
  active: boolean;
}

export interface User {
  address: string;
  dipBalance: string;
  nftsOwned: NFT[];
  pendingWithdrawals: string;
}

export interface MetadataAttribute {
  trait_type: string;
  value: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: MetadataAttribute[];
}

export interface I18nTexts {
  [key: string]: string;
}

export interface UploadProgress {
  ipfs: boolean;
  mint: boolean;
  list: boolean;
}