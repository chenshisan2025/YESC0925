import axios, { AxiosResponse } from 'axios';
import type {
  PancakeSwapTokenData,
  PancakeSwapPairData,
  OneInchTokenInfo,
  OneInchQuote,
  ApiResponse,
  CoinGeckoTokenPrice
} from '../types/api';
import { config } from '../lib/config';
import { errorHandler, ErrorType, ErrorSeverity, retry } from '../lib/error-handler';
import { apiCache, priceCache, cacheKeys } from '../lib/cache-manager';

// PancakeSwap API 服务
class PancakeSwapAPI {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseURL = config.dex.pancakeswap.apiUrl;
    this.timeout = config.bscscan.timeout;
    this.retryAttempts = config.bscscan.retryAttempts;
  }

  private async makeRequest<T>(
    endpoint: string,
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse = await axios.get(`${this.baseURL}${endpoint}`, {
        timeout: this.timeout
      });

      return {
        success: true,
        data: response.data,
        message: 'Success'
      };
    } catch (error: unknown) {
      if (retryCount < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(1000 * (retryCount + 1));
        return this.makeRequest<T>(endpoint, retryCount + 1);
      }

      const axiosError = error as { response?: { status?: number; data?: unknown }; message?: string };
      return {
        success: false,
        error: {
          code: axiosError.response?.status?.toString() || 'NETWORK_ERROR',
          message: axiosError.message || 'Request failed',
          details: axiosError.response?.data,
          timestamp: Date.now()
        }
      };
    }
  }

  private shouldRetry(error: unknown): boolean {
    const retryableCodes = [408, 429, 500, 502, 503, 504];
    const axiosError = error as { response?: { status?: number } };
    return retryableCodes.includes(axiosError.response?.status || 0) || !axiosError.response;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 获取代币信息
  async getTokenInfo(tokenAddress: string): Promise<ApiResponse<PancakeSwapTokenData>> {
    const cacheKey = cacheKeys.tokenInfo(tokenAddress);
    
    try {
      // 尝试从缓存获取
      const cached = apiCache.get<PancakeSwapTokenData>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Success (cached)'
        };
      }

      const result = await this.makeRequest<PancakeSwapTokenData>(`/tokens/${tokenAddress}`);
      
      // 缓存结果
      if (result.success && result.data) {
        apiCache.set(cacheKey, result.data);
      }
      
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Failed to get token price',
          timestamp: Date.now()
        }
      };
    } catch (error) {
      const appError = errorHandler.createError(
        ErrorType.API_ERROR,
        `PancakeSwap API error: ${(error as Error).message}`
      );
      errorHandler.handleError(appError);
      return {
        success: false,
        error: {
          code: 'CACHE_ERROR',
          message: 'Failed to get token info',
          details: error,
          timestamp: Date.now()
        }
      };
    }
  }

  // 获取交易对信息
  async getPairInfo(pairAddress: string): Promise<ApiResponse<PancakeSwapPairData>> {
    const cacheKey = `pancakeswap:pair:${pairAddress}`;
    
    try {
      // 尝试从缓存获取
      const cached = apiCache.get<PancakeSwapPairData>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Success (cached)'
        };
      }

      const result = await this.makeRequest<PancakeSwapPairData>(`/pairs/${pairAddress}`);
      
      // 缓存结果
      if (result.success && result.data) {
        apiCache.set(cacheKey, result.data);
      }
      
      return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to get liquidity info',
        timestamp: Date.now()
      }
    };
    } catch (error) {
      const appError = errorHandler.createError(
        ErrorType.API_ERROR,
        `PancakeSwap API error: ${(error as Error).message}`
      );
      errorHandler.handleError(appError);
      return {
        success: false,
        error: {
          code: 'CACHE_ERROR',
          message: 'Failed to get pair info',
          details: error,
          timestamp: Date.now()
        }
      };
    }
  }

  // 获取代币价格
  async getTokenPrice(tokenAddress: string): Promise<ApiResponse<{ price: string; priceUSD: string }>> {
    const cacheKey = cacheKeys.tokenPrice(tokenAddress);
    
    try {
      // 尝试从缓存获取
      const cached = priceCache.get<{ price: string; priceUSD: string }>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Success (cached)'
        };
      }

      const result = await this.makeRequest<{ price?: string; priceUSD?: string }>(`/tokens/${tokenAddress}`);
      
      if (result.success && result.data) {
        const priceData = {
          price: result.data.price || '0',
          priceUSD: result.data.priceUSD || '0'
        };
        
        // 缓存价格（较短的TTL）
        priceCache.set(cacheKey, priceData);
        
        return {
          success: true,
          data: priceData,
          message: 'Success'
        };
      }

      return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to get volume data',
        timestamp: Date.now()
      }
    };
    } catch (error) {
      const appError = errorHandler.createError(
        ErrorType.API_ERROR,
        `PancakeSwap API error: ${(error as Error).message}`
      );
      errorHandler.handleError(appError);
      return {
        success: false,
        error: {
          code: 'CACHE_ERROR',
          message: 'Failed to get token price',
          details: error,
          timestamp: Date.now()
        }
      };
    }
  }

  // 获取流动性信息
  async getLiquidityInfo(tokenAddress: string): Promise<ApiResponse<{ totalLiquidity: string; liquidityUSD: string }>> {
    const result = await this.makeRequest<{ totalLiquidity?: string; totalLiquidityUSD?: string }>(`/tokens/${tokenAddress}`);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: {
          totalLiquidity: result.data.totalLiquidity || '0',
          liquidityUSD: result.data.totalLiquidityUSD || '0'
        },
        message: 'Success'
      };
    }

    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to get liquidity info',
        timestamp: Date.now()
      }
    };
  }

  // 获取24小时交易量
  async getVolumeData(tokenAddress: string): Promise<ApiResponse<{ volume24h: string; volumeUSD24h: string }>> {
    const result = await this.makeRequest<{ volume?: string; volumeUSD?: string }>(`/tokens/${tokenAddress}`);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: {
          volume24h: result.data.volume || '0',
          volumeUSD24h: result.data.volumeUSD || '0'
        },
        message: 'Success'
      };
    }

    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Failed to get volume data',
        timestamp: Date.now()
      }
    };
  }
}

// 1inch API 服务
class OneInchAPI {
  private baseURL: string;
  private apiKey: string;
  private timeout: number;
  private retryAttempts: number;
  private chainId: number;

  constructor() {
    this.baseURL = config.dex.oneinch.apiUrl;
    this.apiKey = ''; // 1inch doesn't require API key for basic endpoints
    this.timeout = config.bscscan.timeout;
    this.retryAttempts = config.bscscan.retryAttempts;
    this.chainId = config.token.chainId; // BSC mainnet
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, string | number> = {},
    useCache: boolean = true
  ): Promise<ApiResponse<T>> {
    // 生成缓存键
    const cacheKey = `oneinch:${endpoint}:${JSON.stringify(params)}`;
    
    // 尝试从缓存获取数据
    if (useCache) {
      const cachedData = priceCache.get<T>(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          message: 'Success (cached)'
        };
      }
    }

    try {
      const result = await retry(async () => {
        const headers: Record<string, string> = {
          'Accept': 'application/json'
        };

        if (this.apiKey) {
          headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        const response: AxiosResponse = await axios.get(
          `${this.baseURL}/${this.chainId}${endpoint}`,
          {
            params,
            headers,
            timeout: this.timeout
          }
        );

        if (response.status === 429) {
          throw errorHandler.createError(
            ErrorType.RATE_LIMIT_ERROR,
            '1inch API调用频率过高',
            ErrorSeverity.HIGH,
            new Error(`HTTP ${response.status}`),
            { endpoint, params }
          );
        }

        return response.data;
      }, this.retryAttempts, 1000);

      // 缓存结果
      if (useCache) {
        priceCache.set(cacheKey, result);
      }

      return {
        success: true,
        data: result,
        message: 'Success'
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } }; message?: string };
      const appError = errorHandler.createError(
        ErrorType.API_ERROR,
        `1inch API error: ${axiosError.message || 'Unknown error'}`
      );
      errorHandler.handleError(appError);
      return {
        success: false,
        error: {
          code: axiosError.response?.data?.error || 'API_ERROR',
          message: axiosError.message || 'Unknown error',
          details: axiosError.response?.data,
          timestamp: Date.now()
        },
        message: '1inch API request failed'
      };
    }
  }

  private shouldRetry(error: unknown): boolean {
    const retryableCodes = [408, 429, 500, 502, 503, 504];
    const axiosError = error as { response?: { status?: number } };
    return retryableCodes.includes(axiosError.response?.status || 0) || !axiosError.response;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 获取支持的代币列表
  async getSupportedTokens(): Promise<ApiResponse<Record<string, OneInchTokenInfo>>> {
    return this.makeRequest<Record<string, OneInchTokenInfo>>('/tokens');
  }

  // 获取代币信息
  async getTokenInfo(tokenAddress: string): Promise<ApiResponse<OneInchTokenInfo>> {
    const tokensResult = await this.getSupportedTokens();
    
    if (tokensResult.success && tokensResult.data) {
      const tokenInfo = tokensResult.data[tokenAddress.toLowerCase()];
      if (tokenInfo) {
        return {
          success: true,
          data: tokenInfo,
          message: 'Success'
        };
      }
    }

    return {
        success: false,
        error: {
          code: 'TOKEN_NOT_FOUND',
          message: 'Token not found in 1inch supported tokens',
          details: null,
          timestamp: Date.now()
        }
      };
  }

  // 获取交换报价
  async getQuote(
    fromToken: string,
    toToken: string,
    amount: string
  ): Promise<ApiResponse<OneInchQuote>> {
    const params = {
      fromTokenAddress: fromToken,
      toTokenAddress: toToken,
      amount
    };

    return this.makeRequest<OneInchQuote>('/quote', params);
  }

  // 获取代币价格（相对于USDT）
  async getTokenPrice(tokenAddress: string): Promise<ApiResponse<{ price: string; priceUSD: string }>> {
    const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // BSC USDT
    const amount = '1000000000000000000'; // 1 token (18 decimals)

    const quoteResult = await this.getQuote(tokenAddress, USDT_ADDRESS, amount);
    
    if (quoteResult.success && quoteResult.data) {
      const price = (parseFloat(quoteResult.data.toTokenAmount) / 1e18).toString();
      return {
        success: true,
        data: {
          price,
          priceUSD: price
        },
        message: 'Success'
      };
    }

    return {
      success: false,
      error: quoteResult.error,
      message: quoteResult.message
    };
  }
}

// CoinGecko API 服务（用于获取更准确的价格和市场数据）
class CoinGeckoAPI {
  private baseURL: string;
  private apiKey: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseURL = config.dex.coingecko.apiUrl;
    this.apiKey = process.env.VITE_COINGECKO_API_KEY || '';
    this.timeout = 10000;
    this.retryAttempts = 3;
  }

  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, string | number | boolean> = {},
    useCache: boolean = true
  ): Promise<ApiResponse<T>> {
    // 生成缓存键
    const cacheKey = `coingecko:${endpoint}:${JSON.stringify(params)}`;
    
    // 尝试从缓存获取数据
    if (useCache) {
      const cachedData = priceCache.get<T>(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          message: 'Success (cached)'
        };
      }
    }

    try {
      const result = await retry(async () => {
        const headers: Record<string, string> = {
          'Accept': 'application/json'
        };

        if (this.apiKey) {
          headers['x-cg-demo-api-key'] = this.apiKey;
        }

        const response: AxiosResponse = await axios.get(
          `${this.baseURL}${endpoint}`,
          {
            params,
            headers,
            timeout: this.timeout
          }
        );

        if (response.status === 429) {
          throw errorHandler.createError(
            ErrorType.RATE_LIMIT_ERROR,
            'CoinGecko API调用频率过高',
            ErrorSeverity.HIGH,
            new Error(`HTTP ${response.status}`),
            { endpoint, params }
          );
        }

        return response.data;
      }, this.retryAttempts, 1000);

      // 缓存结果
      if (useCache) {
        priceCache.set(cacheKey, result);
      }

      return {
        success: true,
        data: result,
        message: 'Success'
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: unknown }; message?: string };
      const appError = errorHandler.createError(
        ErrorType.API_ERROR,
        axiosError.message || 'CoinGecko API请求失败',
        ErrorSeverity.MEDIUM,
        error as Error,
        { endpoint, params, service: 'CoinGecko' }
      );
      
      errorHandler.handleError(appError);
      
      return {
        success: false,
        error: {
          code: axiosError.response?.status?.toString() || 'NETWORK_ERROR',
          message: axiosError.message || 'Request failed',
          details: axiosError.response?.data,
          timestamp: Date.now()
        },
        timestamp: Date.now()
      };
    }
  }

  private shouldRetry(error: unknown): boolean {
    const retryableCodes = [408, 429, 500, 502, 503, 504];
    const axiosError = error as { response?: { status?: number } };
    return retryableCodes.includes(axiosError.response?.status || 0) || !axiosError.response;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 通过合约地址获取代币价格
  async getTokenPriceByContract(
    contractAddress: string,
    vsCurrency = 'usd'
  ): Promise<ApiResponse<CoinGeckoTokenPrice>> {
    const params = {
      contract_addresses: contractAddress,
      vs_currencies: vsCurrency,
      include_market_cap: true,
      include_24hr_vol: true,
      include_24hr_change: true
    };

    return this.makeRequest<CoinGeckoTokenPrice>('/simple/token_price/binance-smart-chain', params);
  }
}

// 创建服务实例
export const pancakeSwapAPI = new PancakeSwapAPI();
export const oneInchAPI = new OneInchAPI();
export const coinGeckoAPI = new CoinGeckoAPI();

// 导出统一的DEX服务
export const DEXService = {
  // 获取代币价格（优先使用CoinGecko，备用PancakeSwap和1inch）
  getTokenPrice: async (tokenAddress: string): Promise<ApiResponse<{ price: string; priceUSD: string; marketCap?: string; volume24h?: string; change24h?: string }>> => {
    // 首先尝试CoinGecko
    const coinGeckoResult = await coinGeckoAPI.getTokenPriceByContract(tokenAddress);
    if (coinGeckoResult.success) {
      const data = coinGeckoResult.data[tokenAddress.toLowerCase()];
      if (data) {
        return {
          success: true,
          data: {
            price: data.usd?.toString() || '0',
            priceUSD: data.usd?.toString() || '0',
            marketCap: data.usd_market_cap?.toString() || '0',
            volume24h: data.usd_24h_vol?.toString() || '0',
            change24h: data.usd_24h_change?.toString() || '0'
          },
          message: 'Success from CoinGecko'
        };
      }
    }

    // 备用：尝试PancakeSwap
    const pancakeResult = await pancakeSwapAPI.getTokenPrice(tokenAddress);
    if (pancakeResult.success) {
      return {
        success: true,
        data: pancakeResult.data,
        message: 'Success from PancakeSwap'
      };
    }

    // 最后尝试1inch
    const oneInchResult = await oneInchAPI.getTokenPrice(tokenAddress);
    if (oneInchResult.success) {
      return {
        success: true,
        data: oneInchResult.data,
        message: 'Success from 1inch'
      };
    }

    // 所有API都失败
    return {
      success: false,
      error: {
        code: 'ALL_APIS_FAILED',
        message: '所有价格API都无法获取数据',
        details: 'CoinGecko, PancakeSwap, and 1inch all failed',
        timestamp: Date.now()
      },
      message: 'All price APIs failed'
    };
  },

  // 获取流动性信息
  getLiquidityInfo: (tokenAddress: string) => 
    pancakeSwapAPI.getLiquidityInfo(tokenAddress),

  // 获取交易量数据
  getVolumeData: (tokenAddress: string) => 
    pancakeSwapAPI.getVolumeData(tokenAddress),

  // 获取交换报价
  getSwapQuote: (fromToken: string, toToken: string, amount: string) => 
    oneInchAPI.getQuote(fromToken, toToken, amount),

  // 获取代币信息
  getTokenInfo: async (tokenAddress: string) => {
    const [pancakeResult, oneInchResult] = await Promise.all([
      pancakeSwapAPI.getTokenInfo(tokenAddress),
      oneInchAPI.getTokenInfo(tokenAddress)
    ]);

    return {
      pancakeswap: pancakeResult.success ? pancakeResult.data : null,
      oneinch: oneInchResult.success ? oneInchResult.data : null,
      errors: [
        ...(!pancakeResult.success && 'error' in pancakeResult && pancakeResult.error ? [pancakeResult.error] : []),
        ...(!oneInchResult.success && 'error' in oneInchResult && oneInchResult.error ? [oneInchResult.error] : [])
      ].filter(Boolean)
    };
  },

  // 获取综合市场数据
  getMarketData: async (tokenAddress: string) => {
    const [priceResult, liquidityResult, volumeResult] = await Promise.all([
      DEXService.getTokenPrice(tokenAddress),
      pancakeSwapAPI.getLiquidityInfo(tokenAddress),
      pancakeSwapAPI.getVolumeData(tokenAddress)
    ]);

    return {
      price: priceResult.success ? priceResult.data : null,
      liquidity: liquidityResult.success ? liquidityResult.data : null,
      volume: volumeResult.success ? volumeResult.data : null,
      errors: [
        ...(!priceResult.success && 'error' in priceResult && priceResult.error ? [priceResult.error] : []),
        ...(!liquidityResult.success && 'error' in liquidityResult && liquidityResult.error ? [liquidityResult.error] : []),
        ...(!volumeResult.success && 'error' in volumeResult && volumeResult.error ? [volumeResult.error] : [])
      ].filter(Boolean)
    };
  }
};

export default DEXService;