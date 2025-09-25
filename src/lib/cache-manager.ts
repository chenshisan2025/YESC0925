/**
 * 缓存管理器
 * Cache Manager for API Data and Performance Optimization
 */

import { config } from './config';
import { errorHandler, ErrorType, ErrorSeverity } from './error-handler';

// 缓存项接口
interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccessed: number;
  key: string;
}

// 缓存统计
interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  totalSize: number;
  hitRate: number;
}

// 缓存策略
enum CacheStrategy {
  LRU = 'LRU', // Least Recently Used
  LFU = 'LFU', // Least Frequently Used
  TTL = 'TTL', // Time To Live
}

class CacheManager {
  private cache = new Map<string, CacheItem>();
  private maxSize: number;
  private strategy: CacheStrategy;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    totalSize: 0,
    hitRate: 0,
  };

  constructor(
    maxSize: number = config.cache.maxSize,
    strategy: CacheStrategy = CacheStrategy.LRU
  ) {
    this.maxSize = maxSize;
    this.strategy = strategy;
    
    // 定期清理过期缓存
    setInterval(() => this.cleanup(), config.cache.cleanupInterval);
  }

  // 获取缓存数据
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // 更新访问信息
    item.accessCount++;
    item.lastAccessed = Date.now();
    
    this.stats.hits++;
    this.updateHitRate();
    
    if (config.dev.debugApi) {
      console.log(`📦 Cache hit: ${key}`);
    }
    
    return item.data;
  }

  // 设置缓存数据
  set<T>(key: string, data: T, ttl?: number): void {
    try {
      const now = Date.now();
      const itemTtl = ttl || this.getDefaultTtl(key);
      
      const item: CacheItem<T> = {
        data,
        timestamp: now,
        ttl: itemTtl,
        accessCount: 1,
        lastAccessed: now,
        key,
      };

      // 如果缓存已满，执行清理策略
      if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
        this.evict();
      }

      this.cache.set(key, item);
      this.stats.sets++;
      this.stats.totalSize = this.cache.size;
      
      if (config.dev.debugApi) {
        console.log(`📦 Cache set: ${key} (TTL: ${itemTtl}ms)`);
      }
    } catch (error) {
      errorHandler.handleError(
        errorHandler.createError(
          ErrorType.UNKNOWN_ERROR,
          `缓存设置失败: ${key}`,
          ErrorSeverity.LOW,
          error as Error,
          { key, dataType: typeof data }
        ),
        false
      );
    }
  }

  // 删除缓存项
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.stats.totalSize = this.cache.size;
      
      if (config.dev.debugApi) {
        console.log(`📦 Cache delete: ${key}`);
      }
    }
    return deleted;
  }

  // 检查缓存是否存在且未过期
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (this.isExpired(item)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  // 清空所有缓存
  clear(): void {
    this.cache.clear();
    this.stats.totalSize = 0;
    
    if (config.dev.debugApi) {
      console.log('📦 Cache cleared');
    }
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.stats.totalSize = this.cache.size;
      
      if (config.dev.debugApi) {
        console.log(`📦 Cache cleanup: removed ${cleanedCount} expired items`);
      }
    }
  }

  // 缓存清理策略
  private evict(): void {
    if (this.cache.size === 0) return;
    
    let keyToEvict: string;
    
    switch (this.strategy) {
      case CacheStrategy.LRU:
        keyToEvict = this.findLRUKey();
        break;
      case CacheStrategy.LFU:
        keyToEvict = this.findLFUKey();
        break;
      case CacheStrategy.TTL:
        keyToEvict = this.findExpiredKey() || this.findLRUKey();
        break;
      default:
        keyToEvict = this.findLRUKey();
    }
    
    this.cache.delete(keyToEvict);
    this.stats.evictions++;
    this.stats.totalSize = this.cache.size;
    
    if (config.dev.debugApi) {
      console.log(`📦 Cache eviction (${this.strategy}): ${keyToEvict}`);
    }
  }

  // 查找最近最少使用的键
  private findLRUKey(): string {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }

  // 查找最少使用的键
  private findLFUKey(): string {
    let leastUsedKey = '';
    let leastCount = Infinity;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.accessCount < leastCount) {
        leastCount = item.accessCount;
        leastUsedKey = key;
      }
    }
    
    return leastUsedKey;
  }

  // 查找过期的键
  private findExpiredKey(): string | null {
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        return key;
      }
    }
    return null;
  }

  // 检查缓存项是否过期
  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  // 获取默认TTL
  private getDefaultTtl(key: string): number {
    // 根据数据类型设置不同的TTL
    if (key.includes('price') || key.includes('quote')) {
      return config.cache.priceDataTtl;
    }
    if (key.includes('transaction') || key.includes('tx')) {
      return config.cache.transactionDataTtl;
    }
    if (key.includes('token') || key.includes('contract')) {
      return config.cache.tokenDataTtl;
    }
    return config.cache.defaultTtl;
  }

  // 更新命中率
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  // 获取缓存统计
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // 获取缓存大小
  getSize(): number {
    return this.cache.size;
  }

  // 获取所有缓存键
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  // 批量删除缓存
  deleteBatch(pattern: string | RegExp): number {
    let deletedCount = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    if (deletedCount > 0) {
      this.stats.deletes += deletedCount;
      this.stats.totalSize = this.cache.size;
      
      if (config.dev.debugApi) {
        console.log(`📦 Cache batch delete: ${deletedCount} items matching ${pattern}`);
      }
    }
    
    return deletedCount;
  }

  // 预热缓存
  async warmup(keys: string[], dataFetcher: (key: string) => Promise<any>): Promise<void> {
    const promises = keys.map(async (key) => {
      try {
        if (!this.has(key)) {
          const data = await dataFetcher(key);
          this.set(key, data);
        }
      } catch (error) {
        errorHandler.handleError(
          errorHandler.createError(
            ErrorType.API_ERROR,
            `缓存预热失败: ${key}`,
            ErrorSeverity.LOW,
            error as Error,
            { key }
          ),
          false
        );
      }
    });
    
    await Promise.allSettled(promises);
    
    if (config.dev.debugApi) {
      console.log(`📦 Cache warmup completed for ${keys.length} keys`);
    }
  }
}

// 创建不同用途的缓存实例
export const cacheManager = new CacheManager(config.cache.maxSize, CacheStrategy.LRU);
export const apiCache = new CacheManager(config.cache.maxSize, CacheStrategy.LRU);
export const priceCache = new CacheManager(100, CacheStrategy.TTL);
export const tokenCache = new CacheManager(200, CacheStrategy.LFU);

// 缓存键生成器
export const cacheKeys = {
  // BSCScan相关
  tokenInfo: (address: string) => `bscscan:token:${address}`,
  tokenTransactions: (address: string, page: number = 1) => `bscscan:transactions:${address}:${page}`,
  tokenHolders: (address: string) => `bscscan:holders:${address}`,
  tokenBalance: (tokenAddress: string, walletAddress: string) => `bscscan:balance:${tokenAddress}:${walletAddress}`,
  tokenSupply: (address: string) => `bscscan:supply:${address}`,
  
  // DEX相关
  tokenPrice: (address: string) => `dex:price:${address}`,
  tokenMarketData: (address: string) => `dex:market:${address}`,
  swapQuote: (fromToken: string, toToken: string, amount: string) => `dex:quote:${fromToken}:${toToken}:${amount}`,
  liquidityData: (address: string) => `dex:liquidity:${address}`,
  volumeData: (address: string) => `dex:volume:${address}`,
  
  // 组合数据
  tokenOverview: (address: string) => `overview:${address}`,
};

// 便捷函数
export const clearTokenCache = (address: string) => {
  const pattern = new RegExp(`(bscscan|dex|overview):.*:${address}`);
  return apiCache.deleteBatch(pattern);
};

export const clearAllApiCache = () => {
  apiCache.clear();
  priceCache.clear();
  tokenCache.clear();
};

export default apiCache;