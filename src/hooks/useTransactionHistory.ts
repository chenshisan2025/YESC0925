// NEW - 交易历史记录Hook
import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

export interface TransactionRecord {
  id: string;
  txHash: string;
  type: 'token_transfer' | 'token_claim' | 'nft_mint' | 'nft_transfer' | 'other';
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  amount?: string;
  tokenSymbol?: string;
  nftId?: string;
  nftSeries?: string;
  gasUsed?: string;
  gasFee?: string;
  blockNumber?: number;
  from?: string;
  to?: string;
  description: string;
}

const STORAGE_KEY = 'yescoin_transaction_history';

export const useTransactionHistory = () => {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 获取存储键
  const getStorageKey = useCallback(() => {
    return address ? `${STORAGE_KEY}_${address.toLowerCase()}` : STORAGE_KEY;
  }, [address]);

  // 从本地存储加载交易历史
  const loadTransactions = useCallback(() => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        const parsed = JSON.parse(stored);
        setTransactions(Array.isArray(parsed) ? parsed : []);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to load transaction history:', error);
      setTransactions([]);
    }
  }, [getStorageKey]);

  // 保存交易历史到本地存储
  const saveTransactions = useCallback((txs: TransactionRecord[]) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(txs));
    } catch (error) {
      console.error('Failed to save transaction history:', error);
    }
  }, [getStorageKey]);

  // 添加新交易记录
  const addTransaction = useCallback((transaction: Omit<TransactionRecord, 'id' | 'timestamp'>) => {
    const newTransaction: TransactionRecord = {
      ...transaction,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    setTransactions(prev => {
      const updated = [newTransaction, ...prev].slice(0, 100); // 最多保存100条记录
      saveTransactions(updated);
      return updated;
    });

    return newTransaction.id;
  }, [saveTransactions]);

  // 更新交易状态
  const updateTransaction = useCallback((id: string, updates: Partial<TransactionRecord>) => {
    setTransactions(prev => {
      const updated = prev.map(tx => 
        tx.id === id ? { ...tx, ...updates } : tx
      );
      saveTransactions(updated);
      return updated;
    });
  }, [saveTransactions]);

  // 根据交易哈希更新交易
  const updateTransactionByHash = useCallback((txHash: string, updates: Partial<TransactionRecord>) => {
    setTransactions(prev => {
      const updated = prev.map(tx => 
        tx.txHash === txHash ? { ...tx, ...updates } : tx
      );
      saveTransactions(updated);
      return updated;
    });
  }, [saveTransactions]);

  // 删除交易记录
  const removeTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const updated = prev.filter(tx => tx.id !== id);
      saveTransactions(updated);
      return updated;
    });
  }, [saveTransactions]);

  // 清空交易历史
  const clearHistory = useCallback(() => {
    setTransactions([]);
    localStorage.removeItem(getStorageKey());
  }, [getStorageKey]);

  // 获取特定类型的交易
  const getTransactionsByType = useCallback((type: TransactionRecord['type']) => {
    return transactions.filter(tx => tx.type === type);
  }, [transactions]);

  // 获取待确认的交易
  const getPendingTransactions = useCallback(() => {
    return transactions.filter(tx => tx.status === 'pending');
  }, [transactions]);

  // 获取成功的交易
  const getSuccessfulTransactions = useCallback(() => {
    return transactions.filter(tx => tx.status === 'success');
  }, [transactions]);

  // 获取失败的交易
  const getFailedTransactions = useCallback(() => {
    return transactions.filter(tx => tx.status === 'failed');
  }, [transactions]);

  // 获取交易统计
  const getTransactionStats = useCallback(() => {
    const total = transactions.length;
    const pending = getPendingTransactions().length;
    const successful = getSuccessfulTransactions().length;
    const failed = getFailedTransactions().length;

    return {
      total,
      pending,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0
    };
  }, [transactions, getPendingTransactions, getSuccessfulTransactions, getFailedTransactions]);

  // 格式化交易类型显示文本
  const formatTransactionType = useCallback((type: TransactionRecord['type'], language: 'zh' | 'en' = 'zh') => {
    const typeMap = {
      zh: {
        token_transfer: '代币转账',
        token_claim: '代币领取',
        nft_mint: 'NFT铸造',
        nft_transfer: 'NFT转账',
        other: '其他交易'
      },
      en: {
        token_transfer: 'Token Transfer',
        token_claim: 'Token Claim',
        nft_mint: 'NFT Mint',
        nft_transfer: 'NFT Transfer',
        other: 'Other Transaction'
      }
    };
    return typeMap[language][type];
  }, []);

  // 格式化交易状态显示文本
  const formatTransactionStatus = useCallback((status: TransactionRecord['status'], language: 'zh' | 'en' = 'zh') => {
    const statusMap = {
      zh: {
        pending: '确认中',
        success: '成功',
        failed: '失败'
      },
      en: {
        pending: 'Pending',
        success: 'Success',
        failed: 'Failed'
      }
    };
    return statusMap[language][status];
  }, []);

  // 初始化时加载交易历史
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // 地址变化时重新加载
  useEffect(() => {
    if (address) {
      loadTransactions();
    } else {
      setTransactions([]);
    }
  }, [address, loadTransactions]);

  return {
    // 数据
    transactions,
    isLoading,
    
    // 操作方法
    addTransaction,
    updateTransaction,
    updateTransactionByHash,
    removeTransaction,
    clearHistory,
    
    // 查询方法
    getTransactionsByType,
    getPendingTransactions,
    getSuccessfulTransactions,
    getFailedTransactions,
    getTransactionStats,
    
    // 格式化方法
    formatTransactionType,
    formatTransactionStatus,
    
    // 刷新方法
    refresh: loadTransactions
  };
};