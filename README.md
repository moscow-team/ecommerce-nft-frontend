# Moscow NFTs Frontend

Un Moscow NFTs moderno y listo para producción construido con Next.js 15, integración Web3 y la red Polygon Amoy. Los usuarios pueden crear, listar e intercambiar NFTs utilizando tokens DIP.

## ✨ Características

- **🎨 Creación de NFTs**: Crea NFTs únicos con almacenamiento de metadatos en IPFS
- **🏪 Mercado**: Lista y compra NFTs con pagos en tokens DIP
- **💳 Integración de Billeteras**: Conecta billeteras a través de RainbowKit con soporte multi-proveedor
- **📱 Diseño Responsivo**: Diseño mobile-first con hermosas animaciones
- **⚡ Actualizaciones en Tiempo Real**: Catálogo de NFTs en vivo con precios y disponibilidad
- **💰 Gestión de Ganancias**: Rastrea las ventas y retira fondos sin problemas

## 🛠 Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS + shadcn/ui
- **Web3**: wagmi + viem + RainbowKit
- **Gestión de Estado**: Zustand
- **Animaciones**: Framer Motion
- **Almacenamiento**: IPFS vía @web3-storage/w3up-client
- **Red**: Polygon Amoy (chainId: 80002)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Web3.Storage authentication setup (ver IPFS_SETUP.md)
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

3. **Iniciar Servidor de Desarrollo**:
```bash
pnpm dev
```

Visita `http://localhost:3000` para ver la aplicación.

## 📁 Estructura del Proyecto

```
├── app/                    # Páginas de Next.js 15 App Router
│   ├── (pages)/           # Grupos de rutas
│   ├── globals.css        # Estilos globales
│   └── layout.tsx         # Layout raíz
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes shadcn/ui
│   ├── Web3Provider.tsx  # Configuración Web3
│   ├── Header.tsx        # Header de navegación
│   └── NFTCard.tsx       # Componente de visualización NFT
├── hooks/                # Custom React hooks
│   ├── useMarketplace.ts # Interacciones del mercado
│   └── useIPFS.ts        # Operaciones IPFS
├── lib/                  # Librerías de utilidad
│   ├── contracts.ts      # ABIs y direcciones de contratos
│   └── axios.ts          # Configuración del cliente API
├── store/                # Gestión de estado Zustand
├── types/                # Definiciones de tipos TypeScript
└── README.md
```

## 🔗 Integración API

El frontend consume APIs REST de tu backend existente:

- `POST /api/nfts/mint` - Crear nuevo NFT
- `POST /api/market/list` - Listar NFT para la venta
- `POST /api/market/withdraw` - Retirar ganancias
- `GET /api/market/listing/:id` - Obtener detalles del listado
- `GET /api/nfts/user/:address` - Obtener NFTs del usuario

## 🌊 Integración Web3

### Billeteras Soportadas
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