import { config } from '../lib/config';
import { errorHandler, ErrorType, ErrorSeverity, retry } from '../lib/error-handler';
import { apiCache, cacheKeys } from '../lib/cache-manager';

// BSCScan API响应接口
interface BSCScanResponse<T = any> {
  status: string;
  message: string;
  result: T;
}

// 代币信息接口
interface TokenInfo {
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
}

// 交易记录接口
interface Transaction {
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

// 持有者信息接口
interface TokenHolder {
  TokenHolderAddress: string;
  TokenHolderQuantity: string;
}

class BSCScanAPI {
  private baseUrl: string;
  private apiKey: string;
  private retryAttempts: number;
  private retryDelay: number;

  constructor() {
    this.baseUrl = config.bscscan.baseUrl;
    this.apiKey = config.bscscan.apiKey;
    this.retryAttempts = config.bscscan.retryAttempts;
    this.retryDelay = config.bscscan.retryDelay;
  }

  // 通用请求方法
  private async request<T>(
    module: string,
    action: string,
    params: Record<string, string> = {},
    useCache: boolean = true
  ): Promise<T> {
    // 生成缓存键
    const cacheKey = `bscscan:${module}:${action}:${JSON.stringify(params)}`;
    
    // 尝试从缓存获取数据
    if (useCache) {
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const url = new URL(this.baseUrl);
    url.searchParams.set('module', module);
    url.searchParams.set('action', action);
    url.searchParams.set('apikey', this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    try {
      const result = await retry(async () => {
        const response = await fetch(url.toString(), {
          timeout: config.bscscan.timeout,
        });
        
        if (!response.ok) {
          if (response.status === 429) {
            throw errorHandler.createError(
              ErrorType.RATE_LIMIT_ERROR,
              'BSCScan API调用频率过高',
              ErrorSeverity.HIGH,
              new Error(`HTTP ${response.status}`),
              { module, action, params }
            );
          }
          
          throw errorHandler.createError(
            ErrorType.API_ERROR,
            `BSCScan API请求失败: ${response.statusText}`,
            ErrorSeverity.MEDIUM,
            new Error(`HTTP ${response.status}`),
            { module, action, params }
          );
        }

        const data: BSCScanResponse<T> = await response.json();
        
        if (data.status !== '1') {
          throw errorHandler.createError(
            ErrorType.API_ERROR,
            `BSCScan API错误: ${data.message}`,
            ErrorSeverity.MEDIUM,
            new Error(data.message),
            { module, action, params, response: data }
          );
        }

        return data.result;
      }, this.retryAttempts, this.retryDelay);

      // 缓存结果
      if (useCache) {
        apiCache.set(cacheKey, result);
      }

      if (config.dev.debugApi) {
        console.log(`✅ BSCScan API Success: ${module}.${action}`);
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handleError(error as Error);
      throw appError;
    }
  }

  // 判断是否应该重试
  private shouldRetry(error: any): boolean {
    const retryableCodes = [408, 429, 500, 502, 503, 504];
    return retryableCodes.includes(error.response?.status) || !error.response;
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 获取代币信息
  async getTokenInfo(contractAddress: string): Promise<TokenInfo | null> {
    try {
      const cacheKey = cacheKeys.tokenInfo(contractAddress);
      const cached = apiCache.get<TokenInfo>(cacheKey);
      if (cached) return cached;

      const result = await this.request<TokenInfo>('token', 'tokeninfo', {
        contractaddress: contractAddress,
      });
      
      if (result) {
        apiCache.set(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      errorHandler.handleError(
        errorHandler.createError(
          ErrorType.API_ERROR,
          `获取代币信息失败: ${contractAddress}`,
          ErrorSeverity.MEDIUM,
          error as Error,
          { contractAddress }
        )
      );
      return null;
    }
  }

  // 获取代币交易历史
  async getTokenTransactions(
    contractAddress: string,
    address?: string,
    page: number = 1,
    offset: number = 100
  ): Promise<Transaction[]> {
    try {
      const cacheKey = cacheKeys.tokenTransactions(contractAddress, page);
      const cached = apiCache.get<Transaction[]>(cacheKey);
      if (cached) return cached;

      const params: Record<string, string> = {
        contractaddress: contractAddress,
        page: page.toString(),
        offset: offset.toString(),
        sort: 'desc',
      };

      if (address) {
        params.address = address;
      }

      const result = await this.request<Transaction[]>('account', 'tokentx', params);
      const transactions = result || [];
      
      if (transactions.length > 0) {
        apiCache.set(cacheKey, transactions);
      }
      
      return transactions;
    } catch (error) {
      errorHandler.handleError(
        errorHandler.createError(
          ErrorType.API_ERROR,
          `获取代币交易历史失败: ${contractAddress}`,
          ErrorSeverity.MEDIUM,
          error as Error,
          { contractAddress, address, page, offset }
        )
      );
      return [];
    }
  }

  // 获取代币转账记录
  async getTokenTransfers(
    contractAddress: string,
    address?: string,
    page: number = 1,
    offset: number = 100
  ): Promise<Transaction[]> {
    try {
      const params: Record<string, string> = {
        contractaddress: contractAddress,
        page: page.toString(),
        offset: offset.toString(),
        sort: 'desc',
      };

      if (address) {
        params.address = address;
      }

      const result = await this.request<Transaction[]>('account', 'tokentx', params);
      return result || [];
    } catch (error) {
      errorHandler.handleError(
        errorHandler.createError(
          ErrorType.API_ERROR,
          `获取代币转账记录失败: ${contractAddress}`,
          ErrorSeverity.MEDIUM,
          error as Error,
          { contractAddress, address, page, offset }
        )
      );
      return [];
    }
  }

  // 获取代币持有者数据
  async getTokenHolders(
    contractAddress: string,
    page: number = 1,
    offset: number = 100
  ): Promise<TokenHolder[]> {
    try {
      const cacheKey = cacheKeys.tokenHolders(contractAddress);
      const cached = apiCache.get<TokenHolder[]>(cacheKey);
      if (cached) return cached;

      const result = await this.request<TokenHolder[]>('token', 'tokenholderlist', {
        contractaddress: contractAddress,
        page: page.toString(),
        offset: offset.toString(),
      });
      
      const holders = result || [];
      if (holders.length > 0) {
        apiCache.set(cacheKey, holders);
      }
      
      return holders;
    } catch (error) {
      errorHandler.handleError(
        errorHandler.createError(
          ErrorType.API_ERROR,
          `获取代币持有者数据失败: ${contractAddress}`,
          ErrorSeverity.MEDIUM,
          error as Error,
          { contractAddress, page, offset }
        )
      );
      return [];
    }
  }

  // 获取代币总供应量
  async getTotalSupply(contractAddress: string): Promise<string | null> {
    try {
      const cacheKey = cacheKeys.tokenSupply(contractAddress);
      const cached = apiCache.get<string>(cacheKey);
      if (cached) return cached;

      const result = await this.request<string>('stats', 'tokensupply', {
        contractaddress: contractAddress,
      });
      
      if (result) {
        apiCache.set(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      errorHandler.handleError(
        errorHandler.createError(
          ErrorType.API_ERROR,
          `获取代币总供应量失败: ${contractAddress}`,
          ErrorSeverity.MEDIUM,
          error as Error,
          { contractAddress }
        )
      );
      return null;
    }
  }

  // 获取账户代币余额
  async getTokenBalance(
    contractAddress: string,
    address: string
  ): Promise<string | null> {
    try {
      const cacheKey = cacheKeys.tokenBalance(contractAddress, address);
      const cached = apiCache.get<string>(cacheKey);
      if (cached) return cached;

      const result = await this.request<string>('account', 'tokenbalance', {
        contractaddress: contractAddress,
        address: address,
        tag: 'latest',
      });
      
      if (result) {
        apiCache.set(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      errorHandler.handleError(
        errorHandler.createError(
          ErrorType.API_ERROR,
          `获取账户代币余额失败: ${contractAddress}`,
          ErrorSeverity.MEDIUM,
          error as Error,
          { contractAddress, address }
        )
      );
      return null;
    }
  }

  // 获取合约源码
  async getContractSource(contractAddress: string): Promise<any> {
    try {
      const result = await this.request('contract', 'getsourcecode', {
        address: contractAddress,
      });
      return result;
    } catch (error) {
      errorHandler.handleError(
        errorHandler.createError(
          ErrorType.API_ERROR,
          `获取合约源码失败: ${contractAddress}`,
          ErrorSeverity.LOW,
          error as Error,
          { contractAddress }
        )
      );
      return null;
    }
  }

  // 获取合约ABI
  async getContractABI(contractAddress: string): Promise<string | null> {
    try {
      const result = await this.request<string>('contract', 'getabi', {
        address: contractAddress,
      });
      return result;
    } catch (error) {
      errorHandler.handleError(
        errorHandler.createError(
          ErrorType.API_ERROR,
          `获取合约ABI失败: ${contractAddress}`,
          ErrorSeverity.LOW,
          error as Error,
          { contractAddress }
        )
      );
      return null;
    }
  }

  // 获取代币价格（通过交易对）
  async getTokenPrice(contractAddress: string): Promise<ApiResponse<any>> {
    // 注意：BSCScan 不直接提供价格数据，这里可以通过最近交易计算
    const transactions = await this.getTokenTransactions(contractAddress, {
      page: 1,
      offset: 10,
      sort: 'desc'
    });

    if (transactions.success && transactions.data) {
      // 这里可以添加价格计算逻辑
      // 实际项目中建议使用专门的价格API如CoinGecko
      return {
        success: true,
        data: null,
        message: 'Price calculation not implemented, use CoinGecko API instead'
      };
    }

    return transactions;
  }
}

// 导出单例实例
export const bscscanAPI = new BSCScanAPI();

// 导出便捷方法
export const BSCScanService = {
  // 获取代币基本信息
  getTokenInfo: (contractAddress: string) => 
    bscscanAPI.getTokenInfo(contractAddress),

  // 获取交易历史
  getTransactionHistory: (contractAddress: string, pagination?: PaginationParams) => 
    bscscanAPI.getTokenTransactions(contractAddress, pagination),

  // 获取持有者数据
  getHolderData: (contractAddress: string, pagination?: PaginationParams) => 
    bscscanAPI.getTokenHolders(contractAddress, pagination),

  // 获取代币余额
  getBalance: (contractAddress: string, address: string) => 
    bscscanAPI.getTokenBalance(contractAddress, address),

  // 获取总供应量
  getSupply: (contractAddress: string) => 
    bscscanAPI.getTokenSupply(contractAddress),

  // 获取转账记录
  getTransfers: (contractAddress: string, address?: string, pagination?: PaginationParams) => 
    bscscanAPI.getTokenTransfers(contractAddress, address, pagination),

  // 获取合约信息
  getContractInfo: async (contractAddress: string) => {
    const [source, abi] = await Promise.all([
      bscscanAPI.getContractSource(contractAddress),
      bscscanAPI.getContractABI(contractAddress)
    ]);

    return {
      source: source.success ? source.data : null,
      abi: abi.success ? abi.data : null,
      errors: [
        ...(source.success ? [] : [source.error]),
        ...(abi.success ? [] : [abi.error])
      ].filter(Boolean)
    };
  }
};

export default BSCScanService;