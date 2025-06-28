import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import api from '@/lib/axios';

export const useI18n = () => {
  const { i18nTexts, setI18nTexts } = useStore();

  useEffect(() => {
    const loadTexts = async () => {
      try {
        const response = await api.get('/api/i18n');
        setI18nTexts(response.data);
      } catch (error) {
        console.error('Failed to load i18n texts:', error);
        // Fallback to English texts
        setI18nTexts({
          'home.title': 'NFT Marketplace',
          'home.subtitle': 'Discover, collect, and sell extraordinary NFTs',
          'nav.home': 'Home',
          'nav.create': 'Create',
          'nav.my_nfts': 'My NFTs',
          'nav.connect': 'Connect Wallet',
          'nft.buy': 'Buy Now',
          'nft.price': 'Price',
          'nft.not_listed': 'Not Listed',
          'create.title': 'Create NFT',
          'create.upload': 'Upload Image',
          'create.name': 'Name',
          'create.description': 'Description',
          'create.price': 'Price (DIP)',
          'create.mint': 'Mint & List',
          'my_nfts.title': 'My NFTs',
          'my_nfts.withdraw': 'Withdraw Funds',
          'buy.title': 'Purchase NFT',
          'buy.confirm': 'Confirm Purchase',
          'loading': 'Loading...',
          'error.network': 'Please switch to Polygon Amoy network',
          'success.minted': 'NFT minted successfully!',
          'success.listed': 'NFT listed successfully!',
          'success.bought': 'NFT purchased successfully!',
        });
      }
    };

    loadTexts();
  }, [setI18nTexts]);

  const t = (key: string, fallback?: string): string => {
    return i18nTexts[key] || fallback || key;
  };

  return { t, texts: i18nTexts };
};