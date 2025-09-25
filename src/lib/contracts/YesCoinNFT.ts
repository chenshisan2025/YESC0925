// YesCoin NFT合约ABI和接口定义
export const YesCoinNFTABI = [
  // ERC721标准函数
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "from", "type": "address"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getApproved",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "operator", "type": "address"},
      {"internalType": "bool", "name": "approved", "type": "bool"}
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "operator", "type": "address"}
    ],
    "name": "isApprovedForAll",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  // YesCoin NFT特有功能
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "seriesId", "type": "uint256"},
      {"internalType": "string", "name": "metadataURI", "type": "string"}
    ],
    "name": "mint",
    "outputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "seriesId", "type": "uint256"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "batchMint",
    "outputs": [{"internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "seriesId", "type": "uint256"}],
    "name": "getMintPrice",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "seriesId", "type": "uint256"}],
    "name": "getSeriesInfo",
    "outputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "uint256", "name": "maxSupply", "type": "uint256"},
      {"internalType": "uint256", "name": "currentSupply", "type": "uint256"},
      {"internalType": "uint256", "name": "price", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "getTokensByOwner",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getTokenSeries",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveSeries",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  // 管理员功能
  {
    "inputs": [
      {"internalType": "uint256", "name": "seriesId", "type": "uint256"},
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "uint256", "name": "maxSupply", "type": "uint256"},
      {"internalType": "uint256", "name": "price", "type": "uint256"}
    ],
    "name": "createSeries",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "seriesId", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "name": "setSeriesActive",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // 事件
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "approved", "type": "address"},
      {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "operator", "type": "address"},
      {"indexed": false, "internalType": "bool", "name": "approved", "type": "bool"}
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"indexed": true, "internalType": "uint256", "name": "seriesId", "type": "uint256"}
    ],
    "name": "NFTMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "seriesId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "maxSupply", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "price", "type": "uint256"}
    ],
    "name": "SeriesCreated",
    "type": "event"
  }
] as const;

// NFT合约接口类型定义
export interface YesCoinNFTContract {
  name(): Promise<string>;
  symbol(): Promise<string>;
  tokenURI(tokenId: bigint): Promise<string>;
  balanceOf(owner: string): Promise<bigint>;
  ownerOf(tokenId: bigint): Promise<string>;
  transferFrom(from: string, to: string, tokenId: bigint): Promise<void>;
  approve(to: string, tokenId: bigint): Promise<void>;
  getApproved(tokenId: bigint): Promise<string>;
  setApprovalForAll(operator: string, approved: boolean): Promise<void>;
  isApprovedForAll(owner: string, operator: string): Promise<boolean>;
  mint(to: string, seriesId: bigint, metadataURI: string): Promise<bigint>;
  batchMint(seriesId: bigint, amount: bigint): Promise<bigint[]>;
  getMintPrice(seriesId: bigint): Promise<bigint>;
  getSeriesInfo(seriesId: bigint): Promise<{
    name: string;
    maxSupply: bigint;
    currentSupply: bigint;
    price: bigint;
    isActive: boolean;
  }>;
  getTokensByOwner(owner: string): Promise<bigint[]>;
  getTokenSeries(tokenId: bigint): Promise<bigint>;
  totalSupply(): Promise<bigint>;
  getActiveSeries(): Promise<bigint[]>;
}

// NFT系列信息类型
export interface NFTSeries {
  id: number;
  name: string;
  description: string;
  maxSupply: number;
  currentSupply: number;
  price: string; // 以BNB为单位
  isActive: boolean;
  imageUrl: string;
  metadataBaseURI: string;
}

// NFT信息常量
export const YESCOIN_NFT_INFO = {
  name: 'YesCoin NFT',
  symbol: 'YESNFT',
  baseURI: 'https://api.yescoin.com/nft/metadata/',
  defaultSeries: [
    {
      id: 1,
      name: '创世系列',
      description: 'YesCoin创世纪念NFT',
      maxSupply: 1000,
      price: '0.01', // 0.01 BNB
      imageUrl: '/images/nft-genesis.jpg'
    },
    {
      id: 2,
      name: '黄金系列',
      description: 'YesCoin黄金会员NFT',
      maxSupply: 500,
      price: '0.05', // 0.05 BNB
      imageUrl: '/images/nft-gold.jpg'
    },
    {
      id: 3,
      name: '钻石系列',
      description: 'YesCoin钻石VIP NFT',
      maxSupply: 100,
      price: '0.1', // 0.1 BNB
      imageUrl: '/images/nft-diamond.jpg'
    }
  ]
} as const;