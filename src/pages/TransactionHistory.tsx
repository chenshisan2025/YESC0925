// EDIT - 交易历史记录页面 - 重构UI与全局风格统一
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useLanguage } from '../hooks/useLanguage';
import { useTransactionHistory, TransactionRecord } from '../hooks/useTransactionHistory';
import { Clock, CheckCircle, AlertCircle, ExternalLink, Filter, Trash2, RefreshCw, Wallet, Activity, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import yesLogoSvg from '../assets/yes-logo.svg';

const TransactionHistory: React.FC = () => {
  const { language } = useLanguage();
  const { isConnected } = useAccount();
  const {
    transactions,
    isLoading,
    getTransactionStats,
    formatTransactionType,
    formatTransactionStatus,
    clearHistory,
    refresh
  } = useTransactionHistory();

  const [filterType, setFilterType] = useState<TransactionRecord['type'] | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TransactionRecord['status'] | 'all'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const stats = getTransactionStats();

  // 过滤交易记录
  const filteredTransactions = transactions.filter(tx => {
    const typeMatch = filterType === 'all' || tx.type === filterType;
    const statusMatch = filterStatus === 'all' || tx.status === filterStatus;
    return typeMatch && statusMatch;
  });

  // 获取状态图标
  const getStatusIcon = (status: TransactionRecord['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" style={{color: 'var(--graffiti-yellow)'}} />;
      case 'success':
        return <CheckCircle className="w-4 h-4" style={{color: 'var(--graffiti-green)'}} />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" style={{color: 'var(--accent-pink)'}} />;
      default:
        return <Clock className="w-4 h-4" style={{color: 'var(--text-muted)'}} />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: TransactionRecord['status']) => {
    switch (status) {
      case 'pending':
        return 'var(--graffiti-yellow)';
      case 'success':
        return 'var(--graffiti-green)';
      case 'failed':
        return 'var(--accent-pink)';
      default:
        return 'var(--text-muted)';
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: language === 'zh' ? zhCN : enUS
    });
  };

  // 处理清空历史
  const handleClearHistory = () => {
    clearHistory();
    setShowClearConfirm(false);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-bg-primary pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Wallet className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h2 className="font-graffiti text-2xl text-text-primary mb-2">
              {language === 'zh' ? '请连接钱包' : 'Please Connect Wallet'}
            </h2>
            <p className="text-text-secondary">
              {language === 'zh' ? '连接钱包后查看交易历史记录' : 'Connect wallet to view transaction history'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)'}}>
      {/* 页面标题 - 使用涂鸦风格渐变 */}
      <div className="graffiti-gradient p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-white" />
            <h1 className="graffiti-title text-white">
              {language === 'zh' ? '交易历史' : 'Transaction History'}
            </h1>
          </div>
          <p className="text-white/80 text-lg">
            {language === 'zh' ? '查看您的所有区块链交易记录' : 'View all your blockchain transaction records'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">

        {/* 统计信息 - 使用content-card样式 */}
        <div className="max-w-4xl mx-auto px-6 -mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="content-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{color: 'var(--text-muted)'}}>{language === 'zh' ? '总交易数' : 'Total Transactions'}</p>
                  <p className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>{stats.total}</p>
                </div>
                <Wallet className="w-8 h-8" style={{color: 'var(--graffiti-blue)'}} />
              </div>
            </div>
            <div className="content-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{color: 'var(--text-muted)'}}>{language === 'zh' ? '成功交易' : 'Successful'}</p>
                  <p className="text-2xl font-bold" style={{color: 'var(--graffiti-green)'}}>                    {stats.successful}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8" style={{color: 'var(--graffiti-green)'}} />
              </div>
            </div>
            <div className="content-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{color: 'var(--text-muted)'}}>{language === 'zh' ? '待确认' : 'Pending'}</p>
                  <p className="text-2xl font-bold" style={{color: 'var(--graffiti-yellow)'}}>                    {stats.pending}
                  </p>
                </div>
                <Clock className="w-8 h-8" style={{color: 'var(--graffiti-yellow)'}} />
              </div>
            </div>
          </div>
        </div>

        {/* 筛选器和操作 - 使用涂鸦主题样式 */}
        <div className="content-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 类型筛选 */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4" style={{color: 'var(--text-muted)'}} />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all w-full sm:w-auto"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    focusRingColor: 'var(--graffiti-blue)'
                  }}
                >
                  <option value="all">{language === 'zh' ? '所有类型' : 'All Types'}</option>
                  <option value="token_transfer">{formatTransactionType('token_transfer', language)}</option>
                  <option value="token_claim">{formatTransactionType('token_claim', language)}</option>
                  <option value="nft_mint">{formatTransactionType('nft_mint', language)}</option>
                  <option value="nft_transfer">{formatTransactionType('nft_transfer', language)}</option>
                  <option value="other">{formatTransactionType('other', language)}</option>
                </select>
              </div>

              {/* 状态筛选 */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                    focusRingColor: 'var(--graffiti-blue)'
                  }}
                >
                  <option value="all">{language === 'zh' ? '所有状态' : 'All Status'}</option>
                  <option value="pending">{formatTransactionStatus('pending', language)}</option>
                  <option value="success">{formatTransactionStatus('success', language)}</option>
                  <option value="failed">{formatTransactionStatus('failed', language)}</option>
                </select>
              </div>
            </div>

            {/* 操作按钮 - 使用涂鸦主题按钮样式 */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={refresh}
                disabled={isLoading}
                className="graffiti-btn graffiti-btn-blue flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {language === 'zh' ? '刷新' : 'Refresh'}
              </button>
              {transactions.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="graffiti-btn graffiti-btn-pink flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {language === 'zh' ? '清空历史' : 'Clear History'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 交易列表 - 使用涂鸦主题样式 */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <div className="content-card p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--graffiti-green-light)'}}>
                  <Wallet className="w-8 h-8" style={{color: 'var(--graffiti-green)'}} />
                </div>
              </div>
              <h3 className="graffiti-title text-xl mb-2" style={{color: 'var(--text-primary)'}}>
                {language === 'zh' ? '暂无交易记录' : 'No Transactions'}
              </h3>
              <p className="text-base" style={{color: 'var(--text-muted)'}}>
                {language === 'zh' ? '您还没有进行过任何交易' : 'You haven\'t made any transactions yet'}
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="content-card p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1">
                    {/* 状态图标 */}
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" 
                           style={{backgroundColor: `${getStatusColor(tx.status)}20`}}>
                        {getStatusIcon(tx.status)}
                      </div>
                    </div>

                    {/* 交易信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="font-bold text-sm sm:text-base" style={{color: 'var(--text-primary)'}}>
                          {formatTransactionType(tx.type, language)}
                        </h3>
                        <span className="text-xs sm:text-sm font-medium px-2 py-1 rounded-full self-start" 
                              style={{
                                color: getStatusColor(tx.status),
                                backgroundColor: `${getStatusColor(tx.status)}20`
                              }}>
                          {formatTransactionStatus(tx.status, language)}
                        </span>
                      </div>
                      
                      <p className="text-xs sm:text-sm mb-2" style={{color: 'var(--text-muted)'}}>
                        {tx.description}
                      </p>
                      
                      {/* 交易详情 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                        {tx.amount && (
                          <div style={{color: 'var(--text-muted)'}}>
                            {language === 'zh' ? '数量:' : 'Amount:'} 
                            <span className="font-mono ml-1" style={{color: 'var(--text-primary)'}}>
                              {tx.amount} {tx.tokenSymbol || ''}
                            </span>
                          </div>
                        )}
                        {tx.gasFee && (
                          <div style={{color: 'var(--text-muted)'}}>
                            {language === 'zh' ? 'Gas费:' : 'Gas Fee:'} 
                            <span className="font-mono ml-1" style={{color: 'var(--text-primary)'}}>
                              {tx.gasFee} BNB
                            </span>
                          </div>
                        )}
                        {tx.blockNumber && (
                          <div style={{color: 'var(--text-muted)'}}>
                            {language === 'zh' ? '区块:' : 'Block:'} 
                            <span className="font-mono ml-1" style={{color: 'var(--text-primary)'}}>
                              {tx.blockNumber}
                            </span>
                          </div>
                        )}
                        <div style={{color: 'var(--text-muted)'}}>
                          {language === 'zh' ? '时间:' : 'Time:'} 
                          <span className="ml-1" style={{color: 'var(--text-primary)'}}>
                            {formatTime(tx.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      {/* 交易哈希 */}
                      <div className="mt-3 p-2 sm:p-3 rounded text-xs" style={{backgroundColor: 'var(--bg-secondary)'}}>
                        <div className="flex items-center justify-between">
                          <span style={{color: 'var(--text-muted)'}}>
                            {language === 'zh' ? '交易哈希:' : 'Transaction Hash:'}
                          </span>
                          <a
                            href={`https://bscscan.com/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 transition-colors hover:opacity-80"
                            style={{color: 'var(--graffiti-blue)'}}
                          >
                            <span>{language === 'zh' ? '查看详情' : 'View Details'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <code className="font-mono break-all" style={{color: 'var(--text-primary)'}}>
                          {tx.txHash}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 清空确认模态框 - 使用涂鸦主题样式 */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="content-card max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                     style={{backgroundColor: 'var(--accent-pink-light)'}}>
                  <Trash2 className="w-5 h-5" style={{color: 'var(--accent-pink)'}} />
                </div>
                <h3 className="graffiti-title text-xl" style={{color: 'var(--text-primary)'}}>
                  {language === 'zh' ? '确认清空' : 'Confirm Clear'}
                </h3>
              </div>
              <p className="text-base mb-6" style={{color: 'var(--text-muted)'}}>
                {language === 'zh' 
                  ? '确定要清空所有交易历史记录吗？此操作不可撤销。' 
                  : 'Are you sure you want to clear all transaction history? This action cannot be undone.'}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="graffiti-btn graffiti-btn-gray px-4 py-2"
                >
                  {language === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  onClick={handleClearHistory}
                  className="graffiti-btn graffiti-btn-pink"
                >
                  {language === 'zh' ? '确认清空' : 'Confirm Clear'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;