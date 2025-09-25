/**
 * 环境变量配置管理
 * Environment Configuration Management
 */

export interface ApiConfig {
  bscscan: {
    apiKey: string;
    baseUrl: string;
    retryAttempts: number;
    retryDelay: number;
    timeout: number;
  };
  dex: {
    pancakeswap: {
      apiUrl: string;
    };
    oneinch: {
      apiUrl: string;
    };
    coingecko: {
      apiUrl: string;
    };
  };
  token: {
    contractAddress: string;
    chainId: number;
    testnetChainId: number;
  };
  cache: {
    ttl: number;
    staleTime: number;
  };
  dev: {
    mode: boolean;
    debugApi: boolean;
  };
}

// 默认配置
const defaultConfig: ApiConfig = {
  bscscan: {
    apiKey: '',
    baseUrl: 'https://api.bscscan.com/api',
    retryAttempts: 3,
    retryDelay: 1000,
    timeout: 10000,
  },
  dex: {
    pancakeswap: {
      apiUrl: 'https://api.pancakeswap.info/api/v2',
    },
    oneinch: {
      apiUrl: 'https://api.1inch.io/v5.0/56',
    },
    coingecko: {
      apiUrl: 'https://api.coingecko.com/api/v3',
    },
  },
  token: {
    contractAddress: '0x20f663CEa80FaCE82ACDFA3aAE6862d246cE0333',
    chainId: 56,
    testnetChainId: 97,
  },
  cache: {
    ttl: 300000, // 5 minutes
    staleTime: 60000, // 1 minute
  },
  dev: {
    mode: false,
    debugApi: false,
  },
};

// 获取环境变量值
function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (value === undefined && defaultValue === undefined) {
    console.warn(`Environment variable ${key} is not defined`);
    return '';
  }
  return value || defaultValue || '';
}

// 获取数字类型环境变量
function getEnvNumber(key: string, defaultValue: number): number {
  const value = import.meta.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// 获取布尔类型环境变量
function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = import.meta.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
}

// 构建配置对象
export const config: ApiConfig = {
  bscscan: {
    apiKey: getEnvVar('VITE_BSCSCAN_API_KEY', ''),
    baseUrl: getEnvVar('VITE_BSCSCAN_BASE_URL', defaultConfig.bscscan.baseUrl),
    retryAttempts: getEnvNumber('VITE_API_RETRY_ATTEMPTS', defaultConfig.bscscan.retryAttempts),
    retryDelay: getEnvNumber('VITE_API_RETRY_DELAY', defaultConfig.bscscan.retryDelay),
    timeout: getEnvNumber('VITE_API_TIMEOUT', defaultConfig.bscscan.timeout),
  },
  dex: {
    pancakeswap: {
      apiUrl: getEnvVar('VITE_PANCAKESWAP_API_URL', defaultConfig.dex.pancakeswap.apiUrl),
    },
    oneinch: {
      apiUrl: getEnvVar('VITE_ONEINCH_API_URL', defaultConfig.dex.oneinch.apiUrl),
    },
    coingecko: {
      apiUrl: getEnvVar('VITE_COINGECKO_API_URL', defaultConfig.dex.coingecko.apiUrl),
    },
  },
  token: {
    contractAddress: getEnvVar('VITE_YESCOIN_CONTRACT_ADDRESS', defaultConfig.token.contractAddress),
    chainId: getEnvNumber('VITE_BSC_CHAIN_ID', defaultConfig.token.chainId),
    testnetChainId: getEnvNumber('VITE_BSC_TESTNET_CHAIN_ID', defaultConfig.token.testnetChainId),
  },
  cache: {
    ttl: getEnvNumber('VITE_CACHE_TTL', defaultConfig.cache.ttl),
    staleTime: getEnvNumber('VITE_CACHE_STALE_TIME', defaultConfig.cache.staleTime),
  },
  dev: {
    mode: getEnvBoolean('VITE_DEV_MODE', defaultConfig.dev.mode),
    debugApi: getEnvBoolean('VITE_DEBUG_API', defaultConfig.dev.debugApi),
  },
};

// 配置验证函数
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证必需的配置
  if (!config.token.contractAddress) {
    errors.push('Token contract address is required');
  }

  // 验证URL格式
  const urlFields = [
    { name: 'BSCScan Base URL', value: config.bscscan.baseUrl },
    { name: 'PancakeSwap API URL', value: config.dex.pancakeswap.apiUrl },
    { name: '1inch API URL', value: config.dex.oneinch.apiUrl },
    { name: 'CoinGecko API URL', value: config.dex.coingecko.apiUrl },
  ];

  urlFields.forEach(({ name, value }) => {
    try {
      new URL(value);
    } catch {
      errors.push(`Invalid URL for ${name}: ${value}`);
    }
  });

  // 验证数值范围
  if (config.bscscan.retryAttempts < 0 || config.bscscan.retryAttempts > 10) {
    errors.push('Retry attempts should be between 0 and 10');
  }

  if (config.bscscan.retryDelay < 100 || config.bscscan.retryDelay > 10000) {
    errors.push('Retry delay should be between 100ms and 10000ms');
  }

  if (config.bscscan.timeout < 1000 || config.bscscan.timeout > 60000) {
    errors.push('Timeout should be between 1000ms and 60000ms');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// 调试信息输出
if (config.dev.debugApi) {
  console.group('🔧 API Configuration');
  console.log('BSCScan API Key:', config.bscscan.apiKey ? '✅ Configured' : '❌ Missing');
  console.log('Token Contract:', config.token.contractAddress);
  console.log('Chain ID:', config.token.chainId);
  console.log('Cache TTL:', config.cache.ttl + 'ms');
  console.groupEnd();

  const validation = validateConfig();
  if (!validation.isValid) {
    console.group('⚠️ Configuration Errors');
    validation.errors.forEach(error => console.warn(error));
    console.groupEnd();
  }
}

export default config;