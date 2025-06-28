# NFT Marketplace Frontend

A modern, production-ready NFT marketplace built with Next.js 15, Web3 integration, and the Polygon Amoy network. Users can mint, list, and trade NFTs using DIP tokens.

## ✨ Features

- **🎨 NFT Minting**: Create unique NFTs with IPFS metadata storage
- **🏪 Marketplace**: List and purchase NFTs with DIP token payments
- **💳 Wallet Integration**: Connect wallets via RainbowKit with multi-provider support
- **📱 Responsive Design**: Mobile-first design with beautiful animations
- **🌐 Internationalization**: Cookie-based language detection with backend i18n API
- **⚡ Real-time Updates**: Live NFT catalog with pricing and availability
- **💰 Earnings Management**: Track sales and withdraw funds seamlessly

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Web3**: wagmi + viem + RainbowKit
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Storage**: IPFS via web3.storage
- **Network**: Polygon Amoy (chainId: 80002)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Web3.storage API key
- Polygon Amoy testnet setup

### Installation

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd nft-marketplace
pnpm install
```

2. **Environment Setup**:
Create `.env.local` with:
```env
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology
NEXT_PUBLIC_DIP_ADDRESS=0xYourDiploTokenAddress
NEXT_PUBLIC_NFT_ADDRESS=0xYourNFTContractAddress  
NEXT_PUBLIC_MARKET_ADDRESS=0xYourMarketplaceAddress
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_web3_storage_token
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_id
```

3. **Start Development Server**:
```bash
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
├── app/                    # Next.js 15 App Router pages
│   ├── (pages)/           # Route groups
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── Web3Provider.tsx  # Web3 configuration
│   ├── Header.tsx        # Navigation header
│   └── NFTCard.tsx       # NFT display component
├── hooks/                # Custom React hooks
│   ├── useMarketplace.ts # Marketplace interactions
│   ├── useIPFS.ts        # IPFS operations
│   └── useI18n.ts        # Internationalization
├── lib/                  # Utility libraries
│   ├── contracts.ts      # Contract ABIs and addresses
│   └── axios.ts          # API client configuration
├── store/                # Zustand state management
├── types/                # TypeScript type definitions
└── README.md
```

## 🔗 API Integration

The frontend consumes REST APIs from your existing backend:

- `GET /api/i18n` - Internationalization texts
- `POST /api/nfts/mint` - Mint new NFT
- `POST /api/market/list` - List NFT for sale
- `POST /api/market/withdraw` - Withdraw earnings
- `GET /api/market/listing/:id` - Get listing details
- `GET /api/nfts/user/:address` - Get user's NFTs

## 🌊 Web3 Integration

### Supported Wallets
- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow Wallet
- And more via RainbowKit

### Contract Interactions
- **ERC-20 (DIP)**: Token approvals and balance checks
- **ERC-721 (NFT)**: Token metadata and ownership
- **Marketplace**: Buying, listing, and withdrawals

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #1E40AF)
- **Secondary**: Purple accents (#8B5CF6)
- **Success**: Green (#10B981)
- **Warning**: Orange (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: 600-700 weight
- **Body**: 400-500 weight
- **Code**: Monaco/Consolas monospace

## 📱 Responsive Design

- **Mobile**: < 768px - Stack layout, compact cards
- **Tablet**: 768px - 1024px - 2-column grid
- **Desktop**: > 1024px - 4-column grid with sidebar

## 🔄 State Management

Uses Zustand for lightweight global state:
- User profile and wallet connection
- DIP token balance
- Pending withdrawals
- i18n text cache

## 🛡 Error Handling

- Network detection and switching prompts
- Transaction failure recovery
- Graceful IPFS upload retries
- User-friendly error messages via Sonner toasts

## 🎯 Performance Optimizations

- Image optimization with Next.js Image component
- Lazy loading for NFT metadata
- Efficient Web3 provider configuration
- Minimal bundle size with tree-shaking

## 🆕 Next.js 15 Features

- **Turbopack**: Faster development builds
- **React 18.3**: Latest React features
- **Improved TypeScript**: Better type checking
- **Enhanced Image Optimization**: Better performance
- **Updated ESLint**: Latest linting rules

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

Built with ❤️ using Next.js 15 and Web3 technologies.