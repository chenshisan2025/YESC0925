import type { ApiConfig } from '../../types/api';

// BSCScan API Configuration
export const bscscanConfig: ApiConfig = {
  baseURL: import.meta.env.VITE_BSCSCAN_API_URL || 'https://api.bscscan.com/api',
  apiKey: import.meta.env.VITE_BSCSCAN_API_KEY,
  timeout: 10000,
  retries: 3,
  rateLimit: parseInt(import.meta.env.VITE_API_RATE_LIMIT || '5'),
};

// PancakeSwap API Configuration
export const pancakeSwapConfig: ApiConfig = {
  baseURL: import.meta.env.VITE_PANCAKESWAP_API_URL || 'https://api.pancakeswap.info/api/v2',
  timeout: 8000,
  retries: 2,
  rateLimit: parseInt(import.meta.env.VITE_API_RATE_LIMIT || '5'),
};

// 1inch API Configuration
export const oneInchConfig: ApiConfig = {
  baseURL: import.meta.env.VITE_ONEINCH_API_URL || 'https://api.1inch.dev',
  apiKey: import.meta.env.VITE_ONEINCH_API_KEY,
  timeout: 10000,
  retries: 3,
  rateLimit: parseInt(import.meta.env.VITE_API_RATE_LIMIT || '5'),
};

// CoinGecko API Configuration
export const coinGeckoConfig: ApiConfig = {
  baseURL: import.meta.env.VITE_COINGECKO_API_URL || 'https://api.coingecko.com/api/v3',
  apiKey: import.meta.env.VITE_COINGECKO_API_KEY,
  timeout: 8000,
  retries: 2,
  rateLimit: parseInt(import.meta.env.VITE_API_RATE_LIMIT || '5'),
};

// Cache Configuration
export const cacheConfig = {
  duration: parseInt(import.meta.env.VITE_API_CACHE_DURATION || '300000'), // 5 minutes
  maxSize: 100,
  enabled: true,
};

// BSC Network Configuration
export const bscConfig = {
  chainId: 56, // BSC Mainnet
  testnetChainId: 97, // BSC Testnet
  rpcUrl: 'https://bsc-dataseed1.binance.org/',
  testnetRpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  explorerUrl: 'https://bscscan.com',
  testnetExplorerUrl: 'https://testnet.bscscan.com',
};

// Rate Limiting Configuration
export const rateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: parseInt(import.meta.env.VITE_API_RATE_LIMIT || '5'),
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

// Retry Configuration
export const retryConfig = {
  retries: 3,
  retryDelay: 1000, // 1 second
  retryCondition: (error: any) => {
    // Retry on network errors or 5xx status codes
    return !error.response || (error.response.status >= 500 && error.response.status <= 599);
  },
};

// API Endpoints
export const apiEndpoints = {
  bscscan: {
    tokenInfo: '/api',
    tokenTransfers: '/api',
    tokenHolders: '/api',
    transactions: '/api',
    tokenSupply: '/api',
  },
  pancakeSwap: {
    tokens: '/tokens',
    pairs: '/pairs',
    summary: '/summary',
  },
  oneInch: {
    tokens: '/v5.0/56/tokens',
    quote: '/v5.0/56/quote',
    swap: '/v5.0/56/swap',
  },
  coinGecko: {
    coins: '/coins',
    simple: '/simple',
    ping: '/ping',
  },
};

// Validation helpers
export const validateApiKey = (apiKey: string | undefined, serviceName: string): boolean => {
  if (!apiKey) {
    console.warn(`${serviceName} API key is not configured`);
    return false;
  }
  if (apiKey.includes('your_') || apiKey.includes('_here')) {
    console.warn(`${serviceName} API key appears to be a placeholder`);
    return false;
  }
  return true;
};

// Environment validation
export const validateEnvironment = () => {
  const warnings: string[] = [];
  
  if (!validateApiKey(bscscanConfig.apiKey, 'BSCScan')) {
    warnings.push('BSCScan API key is missing or invalid');
  }
  
  if (!validateApiKey(oneInchConfig.apiKey, '1inch')) {
    warnings.push('1inch API key is missing or invalid');
  }
  
  if (!validateApiKey(coinGeckoConfig.apiKey, 'CoinGecko')) {
    warnings.push('CoinGecko API key is missing or invalid');
  }
  
  if (warnings.length > 0) {
    console.warn('API Configuration Warnings:', warnings);
  }
  
  return warnings;
};