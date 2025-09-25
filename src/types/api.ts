// BSCScan API Types
export interface BSCScanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
}

export interface BSCScanTokenTransfer {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}

export interface BSCScanTokenInfo {
  status: string;
  message: string;
  result: {
    contractAddress: string;
    tokenName: string;
    symbol: string;
    divisor: string;
    tokenType: string;
    totalSupply: string;
    blueCheckmark: string;
    description: string;
    website: string;
    email: string;
    blog: string;
    reddit: string;
    slack: string;
    facebook: string;
    twitter: string;
    bitcointalk: string;
    github: string;
    telegram: string;
    wechat: string;
    linkedin: string;
    discord: string;
    whitepaper: string;
    tokenPriceUSD: string;
  };
}

export interface BSCScanHolderData {
  TokenHolderAddress: string;
  TokenHolderQuantity: string;
}

// PancakeSwap API Types
export interface PancakeSwapTokenData {
  updated_at: number;
  data: {
    name: string;
    symbol: string;
    price: string;
    price_BNB: string;
  };
}

export interface PancakeSwapPairData {
  pair_address: string;
  base_name: string;
  base_symbol: string;
  base_address: string;
  quote_name: string;
  quote_symbol: string;
  quote_address: string;
  price: string;
  base_volume: string;
  quote_volume: string;
  liquidity: string;
  liquidity_BNB: string;
}

// 1inch API Types
export interface OneInchTokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logoURI: string;
  tags: string[];
}

export interface OneInchQuote {
  fromToken: OneInchTokenInfo;
  toToken: OneInchTokenInfo;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: any[];
  estimatedGas: number;
}

// CoinGecko API Types
export interface CoinGeckoTokenData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

// Common API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// API Configuration Types
export interface ApiConfig {
  baseURL: string;
  apiKey?: string;
  timeout: number;
  retries: number;
  rateLimit: number;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export interface CacheConfig {
  duration: number;
  maxSize: number;
  enabled: boolean;
}