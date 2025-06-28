import { NextResponse } from 'next/server';

export async function GET() {
  const i18nTexts = {
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
  };

  return NextResponse.json(i18nTexts);
}