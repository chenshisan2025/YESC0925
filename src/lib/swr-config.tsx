import React, { ReactNode } from 'react';
import { SWRConfiguration, SWRConfig } from 'swr';
import { toast } from 'sonner';
import { errorHandler, ErrorType, ErrorSeverity } from './error-handler';
import { apiCache, priceCache } from './cache-manager';
import { apiConfig } from './config/api';
import type { ApiError } from '../types/api';

// SWR全局配置
export const swrConfig: SWRConfiguration = {
  // 缓存策略
  refreshInterval: 30000, // 30秒自动刷新
  revalidateOnFocus: true, // 窗口获得焦点时重新验证
  revalidateOnReconnect: true, // 网络重连时重新验证
  revalidateIfStale: true, // 数据过期时重新验证
  
  // 错误重试
  errorRetryCount: 3, // 最大重试次数
  errorRetryInterval: 5000, // 重试间隔（毫秒）
  
  // 去重和加载
  dedupingInterval: 2000, // 去重间隔
  loadingTimeout: 3000, // 加载超时
  
  // 全局错误处理
  onError: (error, key) => {
    console.error('SWR Error:', error, 'Key:', key);
    
    // 使用全局错误处理器
    errorHandler.handleError(error, true);
  },
  
  // 全局成功处理
  onSuccess: (data, key, config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('SWR Success:', key, data);
    }
  },
  
  // 数据比较函数
  compare: (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
  },
  
  // 错误重试条件
  shouldRetryOnError: (error) => {
    // 不重试4xx错误（客户端错误）
    if (error.status >= 400 && error.status < 500) {
      return false;
    }
    return true;
  },
};

// 保持向后兼容
export const swrGlobalConfig = swrConfig;

// SWR Provider 组件
interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
}

// 缓存键生成器
export const cacheKeys = {
  // 代币相关
  tokenInfo: (address: string) => `token-info-${address.toLowerCase()}`,
  tokenPrice: (address: string) => `token-price-${address.toLowerCase()}`,
  tokenMarket: (address: string) => `token-market-${address.toLowerCase()}`,
  tokenSupply: (address: string) => `token-supply-${address.toLowerCase()}`,
  tokenBalance: (tokenAddress: string, userAddress: string) => 
    `token-balance-${tokenAddress.toLowerCase()}-${userAddress.toLowerCase()}`,
  
  // 交易相关
  tokenTransactions: (address: string, page: number, offset: number) => 
    `token-transactions-${address.toLowerCase()}-${page}-${offset}`,
  tokenTransfers: (tokenAddress: string, userAddress: string | undefined, page: number, offset: number) => 
    `token-transfers-${tokenAddress.toLowerCase()}-${userAddress ? userAddress.toLowerCase() : 'all'}-${page}-${offset}`,
  
  // 持有者相关
  tokenHolders: (address: string, page: number, offset: number) => 
    `token-holders-${address.toLowerCase()}-${page}-${offset}`,
  
  // DEX 相关
  tokenLiquidity: (address: string) => `token-liquidity-${address.toLowerCase()}`,
  tokenVolume: (address: string) => `token-volume-${address.toLowerCase()}`,
  swapQuote: (fromToken: string, toToken: string, amount: string) => 
    `swap-quote-${fromToken.toLowerCase()}-${toToken.toLowerCase()}-${amount}`,
  
  // 合约相关
  contractInfo: (address: string) => `contract-info-${address.toLowerCase()}`,
  contractABI: (address: string) => `contract-abi-${address.toLowerCase()}`
};

// 缓存管理工具
export const cacheManager = {
  // 清除特定模式的缓存
  clearByPattern: (pattern: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(window.localStorage);
      keys.forEach(key => {
        if (key.includes(pattern)) {
          window.localStorage.removeItem(key);
        }
      });
    }
  },
  
  // 清除代币相关缓存
  clearTokenCache: (tokenAddress: string) => {
    const patterns = [
      `token-info-${tokenAddress.toLowerCase()}`,
      `token-price-${tokenAddress.toLowerCase()}`,
      `token-market-${tokenAddress.toLowerCase()}`,
      `token-supply-${tokenAddress.toLowerCase()}`,
      `token-liquidity-${tokenAddress.toLowerCase()}`,
      `token-volume-${tokenAddress.toLowerCase()}`,
      `token-transactions-${tokenAddress.toLowerCase()}`,
      `token-transfers-${tokenAddress.toLowerCase()}`,
      `token-holders-${tokenAddress.toLowerCase()}`
    ];
    
    patterns.forEach(pattern => {
      cacheManager.clearByPattern(pattern);
    });
  },
  
  // 清除用户相关缓存
  clearUserCache: (userAddress: string) => {
    cacheManager.clearByPattern(userAddress.toLowerCase());
  },
  
  // 清除所有API缓存
  clearAllCache: () => {
    const patterns = [
      'token-',
      'swap-',
      'contract-'
    ];
    
    patterns.forEach(pattern => {
      cacheManager.clearByPattern(pattern);
    });
  },
  
  // 获取缓存大小
  getCacheSize: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      let totalSize = 0;
      const keys = Object.keys(window.localStorage);
      
      keys.forEach(key => {
        if (key.startsWith('token-') || key.startsWith('swap-') || key.startsWith('contract-')) {
          totalSize += window.localStorage.getItem(key)?.length || 0;
        }
      });
      
      return totalSize;
    }
    return 0;
  },
  
  // 获取缓存统计
  getCacheStats: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(window.localStorage);
      const apiKeys = keys.filter(key => 
        key.startsWith('token-') || 
        key.startsWith('swap-') || 
        key.startsWith('contract-')
      );
      
      return {
        totalKeys: apiKeys.length,
        totalSize: cacheManager.getCacheSize(),
        keysByType: {
          token: apiKeys.filter(key => key.startsWith('token-')).length,
          swap: apiKeys.filter(key => key.startsWith('swap-')).length,
          contract: apiKeys.filter(key => key.startsWith('contract-')).length
        }
      };
    }
    
    return {
      totalKeys: 0,
      totalSize: 0,
      keysByType: {
        token: 0,
        swap: 0,
        contract: 0
      }
    };
  }
};

// 预加载工具
export const preloader = {
  // 预加载代币基本信息
  preloadTokenInfo: async (tokenAddress: string) => {
    const { mutate } = await import('swr');
    
    // 预加载基本信息
    mutate(cacheKeys.tokenInfo(tokenAddress));
    mutate(cacheKeys.tokenPrice(tokenAddress));
    mutate(cacheKeys.tokenSupply(tokenAddress));
  },
  
  // 预加载代币市场数据
  preloadMarketData: async (tokenAddress: string) => {
    const { mutate } = await import('swr');
    
    mutate(cacheKeys.tokenMarket(tokenAddress));
    mutate(cacheKeys.tokenLiquidity(tokenAddress));
    mutate(cacheKeys.tokenVolume(tokenAddress));
  },
  
  // 预加载用户相关数据
  preloadUserData: async (tokenAddress: string, userAddress: string) => {
    const { mutate } = await import('swr');
    
    mutate(cacheKeys.tokenBalance(tokenAddress, userAddress));
    mutate(cacheKeys.tokenTransfers(tokenAddress, userAddress, 1, 20));
  }
};

export default swrConfig;