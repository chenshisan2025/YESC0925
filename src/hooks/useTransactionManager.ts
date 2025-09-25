// NEW - 交易管理Hook
import React, { useState, useCallback } from 'react';
import { useWaitForTransactionReceipt } from 'wagmi';
import { toast } from 'sonner';

interface TransactionState {
  isOpen: boolean;
  status: 'idle' | 'pending' | 'success' | 'error';
  txHash?: string;
  error?: string;
  gasEstimate?: bigint;
  gasPrice?: bigint;
}

interface TransactionManagerOptions {
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useTransactionManager = (options: TransactionManagerOptions = {}) => {
  const [transactionState, setTransactionState] = useState<TransactionState>({
    isOpen: false,
    status: 'idle'
  });

  // 监听交易确认
  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: transactionState.txHash as `0x${string}`,
    query: {
      enabled: !!transactionState.txHash && transactionState.status === 'pending'
    }
  });

  // 开始交易
  const startTransaction = useCallback((gasEstimate?: bigint, gasPrice?: bigint) => {
    setTransactionState({
      isOpen: true,
      status: 'pending',
      gasEstimate,
      gasPrice
    });
  }, []);

  // 交易提交成功（获得txHash）
  const onTransactionSubmitted = useCallback((txHash: string) => {
    setTransactionState(prev => ({
      ...prev,
      txHash,
      status: 'pending'
    }));
    
    toast.info('交易已提交，等待确认...', {
      description: `交易哈希: ${txHash.slice(0, 10)}...`
    });
  }, []);

  // 交易失败
  const onTransactionError = useCallback((error: string) => {
    setTransactionState(prev => ({
      ...prev,
      status: 'error',
      error
    }));
    
    const errorMessage = options.errorMessage || '交易失败';
    toast.error(errorMessage, {
      description: error
    });
    
    options.onError?.(error);
  }, [options]);

  // 交易成功确认
  React.useEffect(() => {
    if (receipt && transactionState.status === 'pending') {
      setTransactionState(prev => ({
        ...prev,
        status: 'success'
      }));
      
      const successMessage = options.successMessage || '交易成功完成！';
      toast.success(successMessage, {
        description: `区块高度: ${receipt.blockNumber}`
      });
      
      options.onSuccess?.(transactionState.txHash!);
    }
  }, [receipt, transactionState.status, transactionState.txHash, options]);

  // 关闭弹窗
  const closeModal = useCallback(() => {
    setTransactionState({
      isOpen: false,
      status: 'idle'
    });
  }, []);

  // 重试交易
  const retryTransaction = useCallback(() => {
    setTransactionState(prev => ({
      ...prev,
      status: 'idle',
      error: undefined,
      txHash: undefined
    }));
  }, []);

  // 获取用户友好的错误信息
  const getErrorMessage = useCallback((error: any): string => {
    if (typeof error === 'string') return error;
    
    const message = error?.message || error?.reason || String(error);
    
    // 常见错误类型处理
    if (message.includes('User rejected')) {
      return '用户取消了交易';
    }
    if (message.includes('insufficient funds')) {
      return '余额不足，无法支付Gas费';
    }
    if (message.includes('gas required exceeds allowance')) {
      return 'Gas限制过低，请增加Gas限制';
    }
    if (message.includes('nonce too low')) {
      return '交易序号过低，请重试';
    }
    if (message.includes('replacement transaction underpriced')) {
      return 'Gas价格过低，请提高Gas价格';
    }
    if (message.includes('already known')) {
      return '交易已存在，请等待确认';
    }
    if (message.includes('network')) {
      return '网络连接错误，请检查网络';
    }
    
    return message.length > 100 ? '交易执行失败，请重试' : message;
  }, []);

  return {
    // 状态
    transactionState,
    isConfirming,
    
    // 方法
    startTransaction,
    onTransactionSubmitted,
    onTransactionError,
    closeModal,
    retryTransaction,
    getErrorMessage,
    
    // 便捷属性
    isTransactionPending: transactionState.status === 'pending' || isConfirming,
    isTransactionSuccess: transactionState.status === 'success',
    isTransactionError: transactionState.status === 'error'
  };
};