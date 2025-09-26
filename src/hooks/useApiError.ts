import { useState, useCallback, useEffect } from 'react';
import useSWR, { SWRConfiguration, mutate } from 'swr';
import { toast } from 'sonner';
import { errorHandler, ErrorType, ErrorSeverity } from '../lib/error-handler';
import { apiCache, priceCache, cacheManager } from '../lib/cache-manager';
import type { ApiError } from '../types/api';

// API状态类型
export interface ApiStatus {
  isOnline: boolean;
  responseTime: number;
  lastCheck: number;
  errorCount: number;
}

// 缓存状态类型
export interface CacheStatus {
  hitRate: number;
  totalRequests: number;
  cacheHits: number;
  lastCleared: number;
}

// 错误类型定义
export interface ErrorState {
  hasError: boolean;
  error: ApiError | null;
  errorCount: number;
  lastErrorTime: number | null;
}

// 个人API错误管理Hook
export const useApiError = (apiName: string) => {
  const [errors, setErrors] = useState<ApiError[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);

  // 添加错误
  const addError = useCallback((error: Omit<ApiError, 'timestamp' | 'retryCount'>) => {
    const newError: ApiError = {
      ...error,
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    setErrors(prev => [newError, ...prev.slice(0, 9)]); // 保持最新10个错误
    
    // 使用全局错误处理器
    errorHandler.handleError(
      new Error(error.message),
      ErrorType.API_ERROR
    );
  }, [apiName]);

  // 清除错误
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // 重试机制（使用全局重试函数）
  const retry = useCallback(async (fn: () => Promise<any>, maxRetries = 3) => {
    setIsRetrying(true);
    
    try {
      const result = await errorHandler.retry(fn, maxRetries);
      setIsRetrying(false);
      return result;
    } catch (error: any) {
      addError({
        code: 'RETRY_FAILED',
        message: `重试${maxRetries}次后仍然失败`,
        details: error,
      });
      setIsRetrying(false);
      throw error;
    }
  }, [addError]);

  return {
    errors,
    isRetrying,
    addError,
    clearErrors,
    retry,
    hasErrors: errors.length > 0,
    latestError: errors[0] || null,
  };
};

// 错误处理 Hook
export function useApiErrorOld() {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorCount: 0,
    lastErrorTime: null
  });

  // 设置错误
  const setError = useCallback((error: ApiError | null) => {
    if (error) {
      setErrorState(prev => ({
        hasError: true,
        error,
        errorCount: prev.errorCount + 1,
        lastErrorTime: Date.now()
      }));
    } else {
      setErrorState({
        hasError: false,
        error: null,
        errorCount: 0,
        lastErrorTime: null
      });
    }
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorCount: 0,
      lastErrorTime: null
    });
  }, []);

  // 获取错误信息的友好显示
  const getErrorMessage = useCallback((error: ApiError | null): string => {
    if (!error) return '';

    switch (error.code) {
      case 'NETWORK_ERROR':
        return '网络连接失败，请检查网络设置';
      case 'TIMEOUT':
        return '请求超时，请稍后重试';
      case 'RATE_LIMIT':
      case 429:
        return 'API调用频率过高，请稍后重试';
      case 'UNAUTHORIZED':
      case 401:
        return 'API密钥无效或已过期';
      case 'FORBIDDEN':
      case 403:
        return '访问被拒绝，请检查API权限';
      case 'NOT_FOUND':
      case 404:
        return '请求的资源不存在';
      case 'SERVER_ERROR':
      case 500:
        return '服务器内部错误，请稍后重试';
      case 'TOKEN_NOT_FOUND':
        return '代币信息未找到';
      case 'INVALID_ADDRESS':
        return '无效的合约地址';
      case 'INSUFFICIENT_DATA':
        return '数据不足，无法完成请求';
      default:
        return error.message || '未知错误';
    }
  }, []);

  // 判断是否应该重试
  const shouldRetry = useCallback((error: ApiError | null): boolean => {
    if (!error) return false;

    const retryableCodes = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'SERVER_ERROR',
      500,
      502,
      503,
      504
    ];

    return retryableCodes.includes(error.code);
  }, []);

  // 获取重试延迟时间（指数退避）
  const getRetryDelay = useCallback((attemptCount: number): number => {
    return Math.min(1000 * Math.pow(2, attemptCount), 30000); // 最大30秒
  }, []);

  return {
    ...errorState,
    setError,
    clearError,
    getErrorMessage,
    shouldRetry,
    getRetryDelay
  };
}

// 全局错误处理 Hook
export function useGlobalErrorHandler() {
  const [globalErrors, setGlobalErrors] = useState<Map<string, ApiError>>(new Map());
  const { setError, shouldRetry, getRetryDelay } = useApiErrorOld();

  // 添加全局错误
  const addGlobalError = useCallback((key: string, error: ApiError) => {
    setGlobalErrors(prev => new Map(prev).set(key, error));
  }, []);

  // 移除全局错误
  const removeGlobalError = useCallback((key: string) => {
    setGlobalErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  // 清除所有错误
  const clearAllErrors = useCallback(() => {
    setGlobalErrors(new Map());
  }, []);

  // 获取所有错误
  const getAllErrors = useCallback(() => {
    return Array.from(globalErrors.values());
  }, [globalErrors]);

  // 检查是否有特定类型的错误
  const hasErrorType = useCallback((errorCode: string | number) => {
    return Array.from(globalErrors.values()).some(error => error.code === errorCode);
  }, [globalErrors]);

  return {
    globalErrors,
    addGlobalError,
    removeGlobalError,
    clearAllErrors,
    getAllErrors,
    hasErrorType,
    hasErrors: globalErrors.size > 0
  };
}

// 重试机制 Hook
export function useRetry<T>(
  asyncFunction: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  // 使用旧版本的错误处理函数
  const { setError, shouldRetry, getRetryDelay } = useApiErrorOld();

  const executeWithRetry = useCallback(async (): Promise<T | null> => {
    setIsRetrying(true);
    setRetryCount(0);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await asyncFunction();
        setIsRetrying(false);
        setRetryCount(0);
        setError(null);
        return result;
      } catch (error: any) {
        const apiError: ApiError = {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'Unknown error occurred',
          details: error.details || null
        };

        setRetryCount(attempt + 1);

        if (attempt === maxRetries || !shouldRetry(apiError)) {
          setIsRetrying(false);
          setError(apiError);
          throw error;
        }

        // 等待重试延迟
        const delay = getRetryDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    setIsRetrying(false);
    return null;
  }, [asyncFunction, maxRetries, setError, shouldRetry, getRetryDelay]);

  return {
    executeWithRetry,
    isRetrying,
    retryCount
  };
}

// 缓存状态监控Hook
export const useCacheStatus = () => {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus>({
    hitRate: 0,
    totalRequests: 0,
    cacheHits: 0,
    lastCleared: 0,
  });

  // 更新缓存统计
  const updateCacheStats = useCallback(() => {
    // 从实际的缓存管理器获取统计信息
    const apiStats = apiCache.getStats();
    const priceStats = priceCache.getStats();
    
    const totalStats = {
      hitRate: (apiStats.hitRate + priceStats.hitRate) / 2,
      totalRequests: apiStats.totalRequests + priceStats.totalRequests,
      cacheHits: apiStats.hits + priceStats.hits,
      lastCleared: Math.max(apiStats.lastCleared || 0, priceStats.lastCleared || 0),
    };
    
    setCacheStatus(totalStats);
  }, []);

  // 清除缓存
  const clearCache = useCallback((type?: 'api' | 'price' | 'all') => {
    switch (type) {
      case 'api':
        apiCache.clear();
        toast.success('API缓存已清除');
        break;
      case 'price':
        priceCache.clear();
        toast.success('价格缓存已清除');
        break;
      default:
        cacheManager.clearAllApiCache();
        toast.success('所有缓存已清除');
    }
    
    updateCacheStats();
  }, [updateCacheStats]);

  // 预热缓存
  const warmCache = useCallback(async (tokenAddress: string) => {
    try {
      await cacheManager.warmCache(tokenAddress);
      toast.success('缓存预热完成');
      updateCacheStats();
    } catch (error) {
      toast.error('缓存预热失败');
    }
  }, [updateCacheStats]);

  useEffect(() => {
    updateCacheStats();
    const interval = setInterval(updateCacheStats, 30000); // 每30秒更新一次
    return () => clearInterval(interval);
  }, [updateCacheStats]);

  return {
    cacheStatus,
    updateCacheStats,
    clearCache,
    warmCache,
  };
};

// API状态监控 Hook
export function useApiStatus() {
  const [apiStatus, setApiStatus] = useState({
    bscscan: { online: true, lastCheck: Date.now(), responseTime: 0 },
    pancakeswap: { online: true, lastCheck: Date.now(), responseTime: 0 },
    oneinch: { online: true, lastCheck: Date.now(), responseTime: 0 },
    coingecko: { online: true, lastCheck: Date.now(), responseTime: 0 }
  });

  // 更新API状态
  const updateApiStatus = useCallback((api: string, online: boolean, responseTime: number) => {
    setApiStatus(prev => ({
      ...prev,
      [api]: {
        online,
        lastCheck: Date.now(),
        responseTime
      }
    }));
  }, []);

  // 检查所有API状态
  const checkAllApiStatus = useCallback(async () => {
    // 这里可以实现实际的API健康检查
    // 暂时返回模拟数据
    const apis = ['bscscan', 'pancakeswap', 'oneinch', 'coingecko'];
    
    for (const api of apis) {
      try {
        const startTime = Date.now();
        // 实际项目中这里应该调用对应的健康检查端点
        await new Promise(resolve => setTimeout(resolve, 100));
        const responseTime = Date.now() - startTime;
        updateApiStatus(api, true, responseTime);
      } catch (error) {
        updateApiStatus(api, false, 0);
      }
    }
  }, [updateApiStatus]);

  // 定期检查API状态
  useEffect(() => {
    const interval = setInterval(checkAllApiStatus, 300000); // 5分钟检查一次
    return () => clearInterval(interval);
  }, [checkAllApiStatus]);

  return {
    apiStatus,
    updateApiStatus,
    checkAllApiStatus
  };
}