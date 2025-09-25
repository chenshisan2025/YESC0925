// NEW - 交易状态组件
import React from 'react';
import { CheckCircle, AlertCircle, Clock, ExternalLink, X } from 'lucide-react';
import { formatEther } from 'viem';

interface TransactionStatusProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'pending' | 'success' | 'error' | 'idle';
  txHash?: string;
  error?: string;
  gasEstimate?: bigint;
  gasPrice?: bigint;
  title?: string;
  description?: string;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({
  isOpen,
  onClose,
  status,
  txHash,
  error,
  gasEstimate,
  gasPrice,
  title = '交易处理中',
  description = '请在钱包中确认交易'
}) => {
  if (!isOpen) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="w-12 h-12 border-4 border-graffiti-yellow border-t-transparent rounded-full animate-spin"></div>
        );
      case 'success':
        return <CheckCircle className="w-12 h-12 text-graffiti-green" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-graffiti-red" />;
      default:
        return <Clock className="w-12 h-12 text-graffiti-blue" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'pending':
        return '交易确认中';
      case 'success':
        return '交易成功';
      case 'error':
        return '交易失败';
      default:
        return title;
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'pending':
        return '请等待区块链确认交易...';
      case 'success':
        return '交易已成功完成！';
      case 'error':
        return error || '交易执行失败，请重试';
      default:
        return description;
    }
  };

  const formatGasInfo = () => {
    if (!gasEstimate || !gasPrice) return null;
    
    const totalGas = gasEstimate * gasPrice;
    return {
      gasLimit: gasEstimate.toString(),
      gasPrice: formatEther(gasPrice),
      totalCost: formatEther(totalGas)
    };
  };

  const gasInfo = formatGasInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="content-card max-w-md w-full p-8 relative">
        {/* 关闭按钮 */}
        {status !== 'pending' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        )}

        {/* 状态图标 */}
        <div className="flex justify-center mb-6">
          {getStatusIcon()}
        </div>

        {/* 标题和描述 */}
        <div className="text-center mb-6">
          <h3 className="font-condensed font-bold text-xl text-text-primary mb-2">
            {getStatusTitle()}
          </h3>
          <p className="font-chinese text-text-secondary">
            {getStatusDescription()}
          </p>
        </div>

        {/* Gas费信息 */}
        {gasInfo && status === 'pending' && (
          <div className="bg-bg-secondary rounded-lg p-4 mb-6">
            <h4 className="font-condensed font-bold text-sm text-text-primary mb-3">
              Gas费估算
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Gas限制:</span>
                <span className="font-mono text-text-primary">{gasInfo.gasLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Gas价格:</span>
                <span className="font-mono text-text-primary">{gasInfo.gasPrice} ETH</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-text-secondary font-medium">预估费用:</span>
                <span className="font-mono text-graffiti-yellow font-bold">
                  {gasInfo.totalCost} BNB
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 交易哈希 */}
        {txHash && (
          <div className="bg-bg-secondary rounded-lg p-4 mb-6">
            <h4 className="font-condensed font-bold text-sm text-text-primary mb-2">
              交易哈希
            </h4>
            <div className="flex items-center gap-2">
              <code className="font-mono text-xs text-text-secondary bg-bg-primary px-2 py-1 rounded flex-1 truncate">
                {txHash}
              </code>
              <a
                href={`https://bscscan.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-bg-primary rounded transition-colors"
                title="在BSCScan上查看"
              >
                <ExternalLink className="w-4 h-4 text-graffiti-blue" />
              </a>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        {status === 'success' && (
          <button
            onClick={onClose}
            className="w-full graffiti-button py-3 rounded-lg font-condensed font-bold transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, var(--graffiti-green), var(--graffiti-blue))',
              color: 'white'
            }}
          >
            完成
          </button>
        )}

        {status === 'error' && (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg font-condensed font-bold border border-border hover:bg-bg-secondary transition-colors"
            >
              取消
            </button>
            <button
              onClick={onClose}
              className="flex-1 graffiti-button py-3 rounded-lg font-condensed font-bold transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--graffiti-yellow), var(--graffiti-orange))',
                color: 'var(--bg-dark-brick)'
              }}
            >
              重试
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionStatus;