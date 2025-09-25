import useSWR from 'swr';
import { useMemo } from 'react';
import type {
  BSCScanTokenInfo,
  BSCScanTransaction,
  BSCScanHolderData,
  ApiResponse
} from '../types/api';
import { BSCScanService } from '../services/bscscan';
import { DEXService } from '../services/dex';
import { apiConfig } from '../lib/config/api';

// SWR 配置
const swrConfig = {
  refreshInterval: apiConfig.cache.refreshInterval,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  dedupingInterval: apiConfig.cache.staleTime
};

// 代币基本信息 Hook
export function useTokenInfo(contractAddress: string) {
  const { data, error, isLoading, mutate } = useSWR(
    contractAddress ? `token-info-${contractAddress}` : null,
    () => BSCScanService.getTokenInfo(contractAddress),
    swrConfig
  );

  return {
    tokenInfo: data?.success ? data.data : null,
    error: data?.success === false ? data.error : error,
    isLoading,
    refresh: mutate
  };
}

// 代币价格和市场数据 Hook
export function useTokenPrice(contractAddress: string) {
  const { data, error, isLoading, mutate } = useSWR(
    contractAddress ? `token-price-${contractAddress}` : null,
    () => DEXService.getTokenPrice(contractAddress),
    {
      ...swrConfig,
      refreshInterval: 30000 // 30秒刷新一次价格
    }
  );

  return {
    priceData: data?.success ? data.data : null,
    source: data?.source || null,
    error: data?.success === false ? data.error : error,
    isLoading,
    refresh: mutate
  };
}

// 代币市场数据 Hook
export function useTokenMarketData(contractAddress: string) {
  const { data, error, isLoading, mutate } = useSWR(
    contractAddress ? `token-market-${contractAddress}` : null,
    () => DEXService.getMarketData(contractAddress),
    {
      ...swrConfig,
      refreshInterval: 60000 // 1分钟刷新一次市场数据
    }
  );

  return {
    marketData: data,
    error,
    isLoading,
    refresh: mutate
  };
}

// 代币交易历史 Hook
export function useTokenTransactions(
  contractAddress: string,
  pagination = { page: 1, offset: 20 }
) {
  const { data, error, isLoading, mutate } = useSWR(
    contractAddress ? `token-transactions-${contractAddress}-${pagination.page}-${pagination.offset}` : null,
    () => BSCScanService.getTransactionHistory(contractAddress, pagination),
    {
      ...swrConfig,
      refreshInterval: 120000 // 2分钟刷新一次交易历史
    }
  );

  return {
    transactions: data?.success ? data.data : [],
    error: data?.success === false ? data.error : error,
    isLoading,
    refresh: mutate
  };
}

// 代币持有者数据 Hook
export function useTokenHolders(
  contractAddress: string,
  pagination = { page: 1, offset: 50 }
) {
  const { data, error, isLoading, mutate } = useSWR(
    contractAddress ? `token-holders-${contractAddress}-${pagination.page}-${pagination.offset}` : null,
    () => BSCScanService.getHolderData(contractAddress, pagination),
    {
      ...swrConfig,
      refreshInterval: 300000 // 5分钟刷新一次持有者数据
    }
  );

  return {
    holders: data?.success ? data.data : [],
    error: data?.success === false ? data.error : error,
    isLoading,
    refresh: mutate
  };
}

// 代币余额 Hook
export function useTokenBalance(contractAddress: string, userAddress: string) {
  const { data, error, isLoading, mutate } = useSWR(
    contractAddress && userAddress ? `token-balance-${contractAddress}-${userAddress}` : null,
    () => BSCScanService.getBalance(contractAddress, userAddress),
    {
      ...swrConfig,
      refreshInterval: 30000 // 30秒刷新一次余额
    }
  );

  return {
    balance: data?.success ? data.data : '0',
    error: data?.success === false ? data.error : error,
    isLoading,
    refresh: mutate
  };
}

// 代币总供应量 Hook
export function useTokenSupply(contractAddress: string) {
  const { data, error, isLoading, mutate } = useSWR(
    contractAddress ? `token-supply-${contractAddress}` : null,
    () => BSCScanService.getSupply(contractAddress),
    {
      ...swrConfig,
      refreshInterval: 600000 // 10分钟刷新一次总供应量
    }
  );

  return {
    totalSupply: data?.success ? data.data : '0',
    error: data?.success === false ? data.error : error,
    isLoading,
    refresh: mutate
  };
}

// 代币转账记录 Hook
export function useTokenTransfers(
  contractAddress: string,
  userAddress?: string,
  pagination = { page: 1, offset: 20 }
) {
  const { data, error, isLoading, mutate } = useSWR(
    contractAddress ? `token-transfers-${contractAddress}-${userAddress || 'all'}-${pagination.page}-${pagination.offset}` : null,
    () => BSCScanService.getTransfers(contractAddress, userAddress, pagination),
    {
      ...swrConfig,
      refreshInterval: 60000 // 1分钟刷新一次转账记录
    }
  );

  return {
    transfers: data?.success ? data.data : [],
    error: data?.success === false ? data.error : error,
    isLoading,
    refresh: mutate
  };
}

// 流动性信息 Hook
export function useTokenLiquidity(contractAddress: string) {
  const { data, error, isLoading, mutate } = useSWR(
    contractAddress ? `token-liquidity-${contractAddress}` : null,
    () => DEXService.getLiquidityInfo(contractAddress),
    {
      ...swrConfig,
      refreshInterval: 120000 // 2分钟刷新一次流动性
    }
  );

  return {
    liquidityData: data?.success ? data.data : null,
    error: data?.success === false ? data.error : error,
    isLoading,
    refresh: mutate
  };
}

// 交易量数据 Hook
export function useTokenVolume(contractAddress: string) {
  const { data, error, isLoading, mutate } = useSWR(
    contractAddress ? `token-volume-${contractAddress}` : null,
    () => DEXService.getVolumeData(contractAddress),
    {
      ...swrConfig,
      refreshInterval: 60000 // 1分钟刷新一次交易量
    }
  );

  return {
    volumeData: data?.success ? data.data : null,
    error: data?.success === false ? data.error : error,
    isLoading,
    refresh: mutate
  };
}

// 综合代币数据 Hook（组合多个数据源）
export function useTokenOverview(contractAddress: string) {
  const tokenInfo = useTokenInfo(contractAddress);
  const priceData = useTokenPrice(contractAddress);
  const marketData = useTokenMarketData(contractAddress);
  const supply = useTokenSupply(contractAddress);
  const liquidity = useTokenLiquidity(contractAddress);
  const volume = useTokenVolume(contractAddress);

  const isLoading = useMemo(() => {
    return tokenInfo.isLoading || 
           priceData.isLoading || 
           marketData.isLoading || 
           supply.isLoading;
  }, [
    tokenInfo.isLoading,
    priceData.isLoading,
    marketData.isLoading,
    supply.isLoading
  ]);

  const hasError = useMemo(() => {
    return tokenInfo.error || 
           priceData.error || 
           marketData.error || 
           supply.error;
  }, [
    tokenInfo.error,
    priceData.error,
    marketData.error,
    supply.error
  ]);

  const overview = useMemo(() => {
    if (!tokenInfo.tokenInfo) return null;

    return {
      // 基本信息
      name: tokenInfo.tokenInfo.name || 'Unknown',
      symbol: tokenInfo.tokenInfo.symbol || 'UNKNOWN',
      decimals: tokenInfo.tokenInfo.decimals || '18',
      totalSupply: supply.totalSupply || '0',
      
      // 价格信息
      price: priceData.priceData?.price || '0',
      priceUSD: priceData.priceData?.priceUSD || '0',
      marketCap: priceData.priceData?.marketCap || '0',
      change24h: priceData.priceData?.change24h || '0',
      
      // 市场数据
      volume24h: marketData.marketData?.volume?.volumeUSD24h || volume.volumeData?.volumeUSD24h || '0',
      liquidity: marketData.marketData?.liquidity?.liquidityUSD || liquidity.liquidityData?.liquidityUSD || '0',
      
      // 数据源
      priceSource: priceData.source || 'unknown'
    };
  }, [
    tokenInfo.tokenInfo,
    priceData.priceData,
    priceData.source,
    marketData.marketData,
    supply.totalSupply,
    liquidity.liquidityData,
    volume.volumeData
  ]);

  const refresh = () => {
    tokenInfo.refresh();
    priceData.refresh();
    marketData.refresh();
    supply.refresh();
    liquidity.refresh();
    volume.refresh();
  };

  return {
    overview,
    isLoading,
    hasError,
    errors: {
      tokenInfo: tokenInfo.error,
      priceData: priceData.error,
      marketData: marketData.error,
      supply: supply.error,
      liquidity: liquidity.error,
      volume: volume.error
    },
    refresh
  };
}

// 交换报价 Hook
export function useSwapQuote(
  fromToken: string,
  toToken: string,
  amount: string,
  enabled = true
) {
  const { data, error, isLoading, mutate } = useSWR(
    enabled && fromToken && toToken && amount ? 
      `swap-quote-${fromToken}-${toToken}-${amount}` : null,
    () => DEXService.getSwapQuote(fromToken, toToken, amount),
    {
      ...swrConfig,
      refreshInterval: 15000 // 15秒刷新一次报价
    }
  );

  return {
    quote: data?.success ? data.data : null,
    error: data?.success === false ? data.error : error,
    isLoading,
    refresh: mutate
  };
}

// 批量刷新所有缓存的工具函数
export function useRefreshAllTokenData() {
  const { mutate } = useSWR(null);
  
  const refreshAll = () => {
    // 清除所有相关的缓存
    mutate(
      key => typeof key === 'string' && (
        key.startsWith('token-') ||
        key.startsWith('swap-')
      ),
      undefined,
      { revalidate: true }
    );
  };

  return refreshAll;
}