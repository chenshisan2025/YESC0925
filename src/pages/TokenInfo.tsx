import React, { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../lib/translations';
import { Copy, ExternalLink, TrendingUp, Users, DollarSign, BarChart3, Wallet, Clock, CheckCircle, AlertCircle, Filter, RefreshCw, ArrowUpRight, Activity, Zap, XCircle, Coins, Hash, FileText, Shield, Info, PieChart, Send, Receive, Swap, ArrowLeft, Download, TrendingDown, Eye, EyeOff } from 'lucide-react';
import yesLogoSvg from '../assets/yes-logo.svg';
import { toast } from 'react-hot-toast';
import { 
  useTokenBalance, 
  useTokenInfo, 
  formatTokenAmount, 
  formatAddress,
  getContractAddress 
} from '../lib/contracts';
import TransactionStatus from '../components/TransactionStatus';
import { useTransactionManager } from '../hooks/useTransactionManager';
import { usePresetGasEstimate } from '../hooks/useGasEstimate';
import { useTransactionHistory, TransactionRecord } from '../hooks/useTransactionHistory';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

const TokenInfo: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  // 标签页状态
  const [activeTab, setActiveTab] = useState<'balance' | 'history'>('balance');
  
  // 交易历史相关状态
  const [filterType, setFilterType] = useState<TransactionRecord['type'] | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TransactionRecord['status'] | 'all'>('all');
  
  // 交互状态管理
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  
  // 获取真实的代币信息
  const tokenInfo = useTokenInfo();
  const { data: userBalance, isLoading: balanceLoading } = useTokenBalance(address);
  
  // 交易历史hook
  const {
    transactions,
    isLoading: historyLoading,
    getTransactionStats,
    formatTransactionType,
    formatTransactionStatus,
    refresh: refreshHistory
  } = useTransactionHistory();
  
  // 交易管理（用于未来可能的代币操作）
  const transactionManager = useTransactionManager({
    onSuccess: (txHash) => {
      toast.success(language === 'zh' ? '交易成功！' : 'Transaction Successful!', {
        // description: language === 'zh' ? '交易已确认' : 'Transaction confirmed'
      });
    },
    onError: (error) => {
      console.error('Transaction failed:', error);
    },
    successMessage: language === 'zh' ? '交易成功！' : 'Transaction Successful!',
    errorMessage: language === 'zh' ? '交易失败' : 'Transaction Failed'
  });
  
  // Gas费估算
  const gasEstimate = usePresetGasEstimate('TOKEN_TRANSFER');
  
  // 代币概览数据
  const tokenOverview = {
    name: tokenInfo.name,
    symbol: tokenInfo.symbol,
    blockchain: 'BSC (BEP-20)',
    totalSupply: tokenInfo.totalSupply,
    contract: '0xeccf5b5b0a7c482da8008faf8a9f20a2d51005f9',
  };

  const marketMetrics = {
    currentPrice: '$0.000012',
    marketCap: '$12,500,000',
    holders: '15,234',
    circulatingSupply: '750,000,000,000',
    volume24h: '$2,340,000',
    priceChange24h: '+15.67%',
  };

  // 增强的复制功能
  const copyToClipboard = async (text: string, type: string = 'default') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      
      // 触觉反馈（如果支持）
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      toast.success(language === 'zh' ? '已复制到剪贴板' : 'Copied to clipboard', {
        description: type === 'address' 
          ? (language === 'zh' ? '合约地址已复制' : 'Contract address copied')
          : undefined
      });
      
      // 3秒后清除复制状态
      setTimeout(() => setCopiedAddress(null), 3000);
    } catch (error) {
      toast.error(language === 'zh' ? '复制失败' : 'Copy failed');
    }
  };
  
  // 刷新功能
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshHistory();
      toast.success(language === 'zh' ? '数据已刷新' : 'Data refreshed');
    } catch (error) {
      toast.error(language === 'zh' ? '刷新失败' : 'Refresh failed');
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };
  
  // 卡片悬停处理
  const handleCardHover = (cardId: string | null) => {
    setHoveredCard(cardId);
  };

  // 格式化用户余额
  const formatUserBalance = () => {
    if (!isConnected) return '未连接钱包';
    if (balanceLoading) return '加载中...';
    if (!userBalance) return '0';
    return formatTokenAmount(userBalance);
  };
  
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
        return <AlertCircle className="w-4 h-4" style={{color: 'var(--graffiti-red)'}} />;
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
        return 'var(--graffiti-red)';
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
  
  // 获取交易统计
  const stats = getTransactionStats();

  return (
    <div className="min-h-screen py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 - 响应式优化 */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center shadow-lg">
              <img src={yesLogoSvg} alt="Yes Logo" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain" />
            </div>
            <h1 className="graffiti-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-center sm:text-left" style={{color: 'var(--graffiti-yellow)'}}>
              {t.token.title}
            </h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4 sm:px-0" style={{color: 'var(--text-muted)'}}>
            {language === 'zh' ? '探索YesCoin代币的详细信息、市场数据和交易历史' : 'Explore YesCoin token details, market data and transaction history'}
          </p>
          <div className="w-32 h-1 mx-auto mt-6 rounded-full" style={{background: 'linear-gradient(90deg, var(--graffiti-pink), var(--graffiti-purple))'}}></div>
        </div>

        {/* 页面内导航栏 - 响应式优化 */}
        <div className="mb-6 sm:mb-8 sticky top-2 sm:top-4 z-40">
          {/* 导航栏内容可以在这里添加 */}
        </div>

        {/* 快速操作栏 - 使用涂鸦主题按钮样式 */}
        {isConnected && (
          <div id="quick-actions" className="mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <button 
                className="graffiti-btn graffiti-btn-green p-4 sm:p-6 text-center group" 
                onMouseEnter={() => handleCardHover('balance')}
                onMouseLeave={() => handleCardHover(null)}
                onClick={() => setActiveTab('balance')}
              >
                <div className="relative">
                  <Wallet className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 transition-transform duration-300 ${hoveredCard === 'balance' ? 'scale-110 rotate-12' : ''}`} style={{color: 'var(--text-light)'}} />
                  {hoveredCard === 'balance' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse" style={{backgroundColor: 'var(--graffiti-yellow)'}}></div>
                  )}
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2" style={{color: 'var(--text-light)'}}>
                  {formatUserBalance()}
                </h3>
                <p className="text-xs sm:text-sm opacity-90" style={{color: 'var(--text-light)'}}>
                  {language === 'zh' ? '我的余额' : 'My Balance'}
                </p>
                <div className={`mt-1 sm:mt-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300`} style={{color: 'rgba(255,255,255,0.8)'}}>
                  {language === 'zh' ? '点击查看详情' : 'Click to view details'}
                </div>
              </button>
              
              <button 
                className="graffiti-btn graffiti-btn-yellow p-4 sm:p-6 text-center group" 
                onMouseEnter={() => handleCardHover('transactions')}
                onMouseLeave={() => handleCardHover(null)}
                onClick={() => setActiveTab('history')}
              >
                <div className="relative">
                  <Activity className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 transition-transform duration-300 ${hoveredCard === 'transactions' ? 'scale-110 rotate-12' : ''}`} style={{color: 'var(--text-dark)'}} />
                  {hoveredCard === 'transactions' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse" style={{backgroundColor: 'var(--graffiti-green)'}}></div>
                  )}
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2" style={{color: 'var(--text-dark)'}}>
                  {stats.total}
                </h3>
                <p className="text-xs sm:text-sm opacity-90" style={{color: 'var(--text-dark)'}}>
                  {language === 'zh' ? '总交易数' : 'Total Transactions'}
                </p>
                <div className={`mt-1 sm:mt-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300`} style={{color: 'rgba(0,0,0,0.7)'}}>
                  {language === 'zh' ? '点击查看历史' : 'Click to view history'}
                </div>
              </button>
              
              <button 
                className="graffiti-btn graffiti-btn-purple p-4 sm:p-6 text-center group" 
                onMouseEnter={() => handleCardHover('network')}
                onMouseLeave={() => handleCardHover(null)}
              >
                <div className="relative">
                  <Zap className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 transition-transform duration-300 ${hoveredCard === 'network' ? 'scale-110 rotate-12' : ''}`} style={{color: 'var(--text-light)'}} />
                  {hoveredCard === 'network' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse" style={{backgroundColor: 'var(--graffiti-yellow)'}}></div>
                  )}
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-1 sm:mb-2" style={{color: 'var(--text-light)'}}>
                  BSC
                </h3>
                <p className="text-xs sm:text-sm opacity-90" style={{color: 'var(--text-light)'}}>
                  {language === 'zh' ? '网络' : 'Network'}
                </p>
                <div className={`mt-1 sm:mt-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300`} style={{color: 'rgba(255,255,255,0.8)'}}>
                  {language === 'zh' ? '币安智能链' : 'Binance Smart Chain'}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 用户详细信息卡片 - 重新设计 */}
        {isConnected && (
          <div id="wallet-details" className="mb-12 content-card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, var(--graffiti-green), var(--graffiti-blue))'}}>
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6" style={{color: 'var(--text-light)'}} />
                </div>
                <div>
                  <h2 className="graffiti-title text-xl sm:text-2xl" style={{color: 'var(--text-dark)'}}>
                    {language === 'zh' ? '钱包详情' : 'Wallet Details'}
                  </h2>
                  <p className="text-xs sm:text-sm" style={{color: 'var(--text-muted)'}}>
                    {language === 'zh' ? '查看余额和交易历史' : 'View balance and transaction history'}
                  </p>
                </div>
              </div>
              
              {/* 增强的标签页导航 */}
              <div className="relative flex bg-white rounded-2xl p-1 shadow-lg border w-full sm:w-auto" style={{borderColor: 'var(--border-light)'}}>
                {/* 滑动背景指示器 */}
                <div 
                  className="absolute top-1 bottom-1 rounded-xl transition-all duration-500 ease-out shadow-lg"
                  style={{
                    left: activeTab === 'balance' ? '4px' : 'calc(50% + 2px)',
                    width: 'calc(50% - 4px)',
                    background: activeTab === 'balance' 
                      ? 'linear-gradient(135deg, var(--graffiti-green), var(--graffiti-blue))'
                      : 'linear-gradient(135deg, var(--graffiti-blue), var(--graffiti-purple))'
                  }}
                />
                
                <button
                  onClick={() => setActiveTab('balance')}
                  className={`relative z-10 flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-3 sm:px-6 rounded-xl font-medium transition-all duration-300 flex-1 justify-center group ${
                    activeTab === 'balance' 
                      ? 'text-white' 
                      : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                  }`}
                  onMouseEnter={() => handleCardHover('balance-tab')}
                  onMouseLeave={() => handleCardHover(null)}
                >
                  <Wallet className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 ${hoveredCard === 'balance-tab' && activeTab !== 'balance' ? 'scale-110' : ''}`} />
                  <span className="text-xs sm:text-sm">{language === 'zh' ? '余额概览' : 'Balance'}</span>
                  {activeTab === 'balance' && (
                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{backgroundColor: 'var(--graffiti-yellow)'}}></div>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab('history')}
                  className={`relative z-10 flex items-center gap-1 sm:gap-2 py-2 sm:py-3 px-3 sm:px-6 rounded-xl font-medium transition-all duration-300 flex-1 justify-center group ${
                    activeTab === 'history' 
                      ? 'text-white' 
                      : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                  }`}
                  onMouseEnter={() => handleCardHover('history-tab')}
                  onMouseLeave={() => handleCardHover(null)}
                >
                  <Activity className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 ${hoveredCard === 'history-tab' && activeTab !== 'history' ? 'scale-110' : ''}`} />
                  <span className="text-xs sm:text-sm">{language === 'zh' ? '交易历史' : 'History'}</span>
                  {activeTab === 'history' && (
                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse" style={{backgroundColor: 'var(--graffiti-yellow)'}}></div>
                  )}
                </button>
              </div>
            </div>
            
            {/* 标签页内容 */}
            {activeTab === 'balance' ? (
              <div className="space-y-8">
                {/* 钱包地址卡片 - 重新设计 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-4 sm:p-6 rounded-2xl border" style={{backgroundColor: 'var(--bg-light)', borderColor: 'var(--border-light)'}}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: 'var(--graffiti-green)'}}>
                        <Copy className="w-4 h-4 sm:w-5 sm:h-5" style={{color: 'var(--text-light)'}} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base" style={{color: 'var(--text-dark)'}}>
                          {language === 'zh' ? '钱包地址' : 'Wallet Address'}
                        </h3>
                        <p className="text-xs sm:text-sm" style={{color: 'var(--text-muted)'}}>
                          {language === 'zh' ? '点击复制地址' : 'Click to copy address'}
                        </p>
                      </div>
                    </div>
                    <div 
                      className="relative p-3 rounded-xl cursor-pointer hover:scale-105 transition-all duration-300 border-2 border-dashed group"
                      style={{backgroundColor: 'white', borderColor: 'var(--graffiti-green)'}}
                      onClick={() => address && copyToClipboard(address, 'address')}
                      onMouseEnter={() => handleCardHover('wallet-address')}
                      onMouseLeave={() => handleCardHover(null)}
                    >
                      <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                        <p className="font-mono text-xs sm:text-sm" style={{color: 'var(--text-dark)'}}>
                          {address ? `${address.slice(0, 6)}...${address.slice(-6)}` : ''}
                        </p>
                        <Copy className={`w-3 h-3 sm:w-4 sm:h-4 transition-all duration-300 ${hoveredCard === 'wallet-address' ? 'scale-110 text-blue-500' : ''}`} style={{color: copiedAddress === 'address' ? 'var(--graffiti-green)' : 'var(--text-muted)'}} />
                      </div>
                      
                      {/* 复制成功提示 */}
                      {copiedAddress === 'address' && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs text-white animate-bounce" style={{backgroundColor: 'var(--graffiti-green)'}}>
                          {language === 'zh' ? '已复制!' : 'Copied!'}
                        </div>
                      )}
                      
                      {/* 悬停提示 */}
                      {hoveredCard === 'wallet-address' && copiedAddress !== 'address' && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{backgroundColor: 'var(--text-dark)', color: 'white'}}>
                          {language === 'zh' ? '点击复制' : 'Click to copy'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 rounded-2xl border" style={{backgroundColor: 'var(--bg-light)', borderColor: 'var(--border-light)'}}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: 'var(--graffiti-blue)'}}>
                        <Activity className="w-4 h-4 sm:w-5 sm:h-5" style={{color: 'var(--text-light)'}} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base" style={{color: 'var(--text-dark)'}}>
                          {language === 'zh' ? '网络状态' : 'Network Status'}
                        </h3>
                        <p className="text-xs sm:text-sm" style={{color: 'var(--text-muted)'}}>
                          {language === 'zh' ? '当前连接状态' : 'Current connection status'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm" style={{color: 'var(--text-muted)'}}>
                          {language === 'zh' ? '网络' : 'Network'}
                        </span>
                        <span className="font-medium px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm" style={{backgroundColor: 'var(--graffiti-yellow)', color: 'var(--text-dark)'}}>
                          BSC
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm" style={{color: 'var(--text-muted)'}}>
                          {language === 'zh' ? '状态' : 'Status'}
                        </span>
                        <span className="font-medium px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm" style={{backgroundColor: 'var(--graffiti-green)', color: 'white'}}>
                          {language === 'zh' ? '已连接' : 'Connected'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 代币余额 - 重新设计 */}
                <div className="p-6 sm:p-8 rounded-3xl text-center" style={{background: 'linear-gradient(135deg, var(--graffiti-green), var(--graffiti-blue))'}}>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                    <Wallet className="w-6 h-6 sm:w-8 sm:h-8" style={{color: 'var(--text-light)'}} />
                  </div>
                  <h3 className="text-base sm:text-lg mb-2" style={{color: 'var(--text-light)'}}>
                    {language === 'zh' ? 'YesCoin 余额' : 'YesCoin Balance'}
                  </h3>
                  <p className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6" style={{color: 'var(--text-light)'}}>
                    {formatUserBalance()}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-2xl" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
                      <p className="text-xs sm:text-sm mb-1" style={{color: 'var(--text-light)', opacity: 0.8}}>
                        {language === 'zh' ? '可用余额' : 'Available'}
                      </p>
                      <p className="font-bold text-sm sm:text-base" style={{color: 'var(--text-light)'}}>
                        {formatUserBalance()}
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-2xl" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
                      <p className="text-xs sm:text-sm mb-1" style={{color: 'var(--text-light)', opacity: 0.8}}>
                        {language === 'zh' ? '锁定余额' : 'Locked'}
                      </p>
                      <p className="font-bold text-sm sm:text-base" style={{color: 'var(--text-light)'}}>
                        0 YES
                      </p>
                    </div>
                    <div className="p-3 sm:p-4 rounded-2xl" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
                      <p className="text-xs sm:text-sm mb-1" style={{color: 'var(--text-light)', opacity: 0.8}}>
                        {language === 'zh' ? '总余额' : 'Total'}
                      </p>
                      <p className="font-bold text-sm sm:text-base" style={{color: 'var(--text-light)'}}>
                        {formatUserBalance()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 交易统计 - 重新设计 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 sm:p-6 rounded-2xl text-center hover:scale-105 transition-all duration-300" style={{background: 'linear-gradient(135deg, var(--graffiti-blue), var(--graffiti-purple)'}}>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                      <Activity className="w-4 h-4 sm:w-6 sm:h-6" style={{color: 'var(--text-light)'}} />
                    </div>
                    <p className="text-xl sm:text-3xl font-bold mb-1" style={{color: 'var(--text-light)'}}>
                      {stats.total}
                    </p>
                    <p className="text-xs sm:text-sm opacity-90" style={{color: 'var(--text-light)'}}>
                      {language === 'zh' ? '总交易数' : 'Total Transactions'}
                    </p>
                  </div>
                  
                  <div className="p-4 sm:p-6 rounded-2xl text-center hover:scale-105 transition-all duration-300" style={{background: 'linear-gradient(135deg, var(--graffiti-green), var(--graffiti-blue)'}}>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                      <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" style={{color: 'var(--text-light)'}} />
                    </div>
                    <p className="text-xl sm:text-3xl font-bold mb-1" style={{color: 'var(--text-light)'}}>
                      {stats.successful}
                    </p>
                    <p className="text-xs sm:text-sm opacity-90" style={{color: 'var(--text-light)'}}>
                      {language === 'zh' ? '成功交易' : 'Successful'}
                    </p>
                  </div>
                  
                  <div className="p-4 sm:p-6 rounded-2xl text-center hover:scale-105 transition-all duration-300" style={{background: 'linear-gradient(135deg, var(--graffiti-yellow), var(--graffiti-pink)'}}>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                      <Clock className="w-4 h-4 sm:w-6 sm:h-6" style={{color: 'var(--text-dark)'}} />
                    </div>
                    <p className="text-xl sm:text-3xl font-bold mb-1" style={{color: 'var(--text-dark)'}}>
                      {stats.pending}
                    </p>
                    <p className="text-xs sm:text-sm opacity-90" style={{color: 'var(--text-dark)'}}>
                      {language === 'zh' ? '待确认' : 'Pending'}
                    </p>
                  </div>
                  
                  <div className="p-4 sm:p-6 rounded-2xl text-center hover:scale-105 transition-all duration-300" style={{background: 'linear-gradient(135deg, var(--graffiti-pink), var(--graffiti-purple)'}}>
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center" style={{backgroundColor: 'rgba(255,255,255,0.2)'}}>
                      <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6" style={{color: 'var(--text-light)'}} />
                    </div>
                    <p className="text-xl sm:text-3xl font-bold mb-1" style={{color: 'var(--text-light)'}}>
                      {stats.failed}
                    </p>
                    <p className="text-xs sm:text-sm opacity-90" style={{color: 'var(--text-light)'}}>
                      {language === 'zh' ? '失败交易' : 'Failed'}
                    </p>
                  </div>
                </div>
                
                {/* 过滤器 - 重新设计 */}
                <div className="p-4 sm:p-6 rounded-2xl border" style={{backgroundColor: 'var(--bg-light)', borderColor: 'var(--border-light)'}}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center" style={{backgroundColor: 'var(--graffiti-purple)'}}>
                        <Filter className="w-4 h-4 sm:w-5 sm:h-5" style={{color: 'var(--text-light)'}} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base" style={{color: 'var(--text-dark)'}}>
                          {language === 'zh' ? '交易筛选' : 'Transaction Filters'}
                        </h3>
                        <p className="text-xs sm:text-sm" style={{color: 'var(--text-muted)'}}>
                          {language === 'zh' ? '按类型和状态筛选交易' : 'Filter transactions by type and status'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setFilterType('all');
                          setFilterStatus('all');
                        }}
                        className="graffiti-btn graffiti-btn-yellow px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm"
                      >
                        {language === 'zh' ? '重置' : 'Reset'}
                      </button>
                      <button
                        onClick={handleRefresh}
                        disabled={isRefreshing || historyLoading}
                        className="graffiti-btn graffiti-btn-blue p-2 sm:p-3 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing || historyLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2" style={{color: 'var(--text-dark)'}}>
                        {language === 'zh' ? '交易类型' : 'Transaction Type'}
                      </label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all duration-300 focus:scale-105 hover:shadow-lg focus:shadow-xl focus:outline-none"
                        style={{
                          backgroundColor: 'white',
                          borderColor: filterType === 'all' ? 'var(--border-light)' : 'var(--graffiti-green)',
                          color: 'var(--text-dark)',
                          boxShadow: filterType !== 'all' ? '0 0 0 3px rgba(34, 197, 94, 0.1)' : 'none'
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
                    
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2" style={{color: 'var(--text-dark)'}}>
                        {language === 'zh' ? '交易状态' : 'Transaction Status'}
                      </label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all duration-300 focus:scale-105 hover:shadow-lg focus:shadow-xl focus:outline-none"
                        style={{
                          backgroundColor: 'white',
                          borderColor: filterStatus === 'all' ? 'var(--border-light)' : 'var(--graffiti-blue)',
                          color: 'var(--text-dark)',
                          boxShadow: filterStatus !== 'all' ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'
                        }}
                      >
                        <option value="all">{language === 'zh' ? '所有状态' : 'All Status'}</option>
                        <option value="pending">{formatTransactionStatus('pending', language)}</option>
                        <option value="success">{formatTransactionStatus('success', language)}</option>
                        <option value="failed">{formatTransactionStatus('failed', language)}</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* 交易列表 - 重新设计 */}
                <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 rounded-2xl" style={{backgroundColor: 'var(--bg-light)'}}>
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--graffiti-purple)'}}>
                        <Activity className="w-6 h-6 sm:w-8 sm:h-8" style={{color: 'var(--text-light)'}} />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-2" style={{color: 'var(--text-dark)'}}>
                        {language === 'zh' ? '暂无交易记录' : 'No Transactions Found'}
                      </h3>
                      <p className="text-xs sm:text-sm" style={{color: 'var(--text-muted)'}}>
                        {language === 'zh' ? '您的交易记录将在这里显示' : 'Your transaction history will appear here'}
                      </p>
                    </div>
                  ) : (
                    filteredTransactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="group p-4 sm:p-6 rounded-2xl border-2 cursor-pointer hover:scale-[1.02] transition-all duration-300 hover:shadow-xl" style={{
                        backgroundColor: 'var(--bg-light)', 
                        borderColor: 'var(--border-light)',
                        background: `linear-gradient(135deg, var(--bg-light) 0%, rgba(255,255,255,0.8) 100%)`
                      }}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div 
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300" 
                              style={{backgroundColor: getStatusColor(tx.status)}}
                            >
                              {getStatusIcon(tx.status)}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-sm sm:text-lg mb-1" style={{color: 'var(--text-dark)'}}>
                                {formatTransactionType(tx.type, language)}
                              </div>
                              <div className="text-xs sm:text-sm font-medium" style={{color: 'var(--text-muted)'}}>
                                {tx.description}
                              </div>
                              <div className="text-xs mt-1 px-2 py-1 rounded-lg inline-block" style={{
                                backgroundColor: getStatusColor(tx.status),
                                color: 'white'
                              }}>
                                {formatTransactionStatus(tx.status, language)}
                              </div>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-xs mb-1" style={{color: 'var(--text-muted)'}}>
                              {formatTime(tx.timestamp)}
                            </div>
                            {tx.amount && (
                              <div 
                                className="text-lg sm:text-xl font-bold" 
                                style={{color: parseFloat(tx.amount) > 0 ? 'var(--graffiti-green)' : 'var(--graffiti-pink)'}}
                              >
                                {parseFloat(tx.amount) > 0 ? '+' : ''}{tx.amount} {tx.tokenSymbol || ''}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* 悬停时显示的额外信息 */}
                        <div className="mt-4 pt-4 border-t opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{borderColor: 'var(--border-light)'}}>
                          <div className="flex items-center justify-between text-sm">
                            <span style={{color: 'var(--text-muted)'}}>
                              {language === 'zh' ? '交易ID' : 'Transaction ID'}
                            </span>
                            <span className="font-mono text-xs" style={{color: 'var(--graffiti-blue)'}}>
                              {tx.id ? `${tx.id.slice(0, 10)}...${tx.id.slice(-8)}` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {filteredTransactions.length > 5 && (
                    <div className="text-center p-4 rounded-xl" style={{backgroundColor: 'var(--bg-light)'}}>
                      <span className="text-sm font-medium" style={{color: 'var(--text-muted)'}}>
                        {language === 'zh' ? `还有 ${filteredTransactions.length - 5} 条记录...` : `${filteredTransactions.length - 5} more transactions...`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 代币信息卡片 - 使用涂鸦主题样式 */}
        <div className="content-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* 代币图标和基本信息 */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 graffiti-gradient rounded-full flex items-center justify-center">
                <img src={yesLogoSvg} alt="YES" className="w-10 h-10" />
              </div>
              <div>
                <h1 className="graffiti-title text-2xl lg:text-3xl mb-1" style={{color: 'var(--text-primary)'}}>
                  {tokenInfo.name}
                </h1>
                <p className="text-base" style={{color: 'var(--text-muted)'}}>
                  {tokenInfo.symbol} • BSC
                </p>
              </div>
            </div>

            {/* 价格信息 */}
            <div className="flex-1 lg:text-right">
              <div className="flex flex-col lg:items-end gap-2">
                <div className="text-3xl lg:text-4xl font-black" style={{color: 'var(--text-primary)'}}>
                  $0.000012
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium`}
                     style={{color: 'var(--graffiti-green)'}}>
                  <TrendingUp className="w-4 h-4" />
                  +15.67%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 统计信息网格 - 使用涂鸦主题样式 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="content-card p-6 text-center">
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" 
                 style={{backgroundColor: 'var(--graffiti-green-light)'}}>
              <DollarSign className="w-6 h-6" style={{color: 'var(--graffiti-green)'}} />
            </div>
            <div className="text-xl font-black mb-1" style={{color: 'var(--text-primary)'}}>
              $12,500,000
            </div>
            <div className="text-sm" style={{color: 'var(--text-muted)'}}>
              {language === 'zh' ? '市值' : 'Market Cap'}
            </div>
          </div>
          
          <div className="content-card p-6 text-center">
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" 
                 style={{backgroundColor: 'var(--graffiti-blue-light)'}}>
              <BarChart3 className="w-6 h-6" style={{color: 'var(--graffiti-blue)'}} />
            </div>
            <div className="text-xl font-black mb-1" style={{color: 'var(--text-primary)'}}>
              $2,340,000
            </div>
            <div className="text-sm" style={{color: 'var(--text-muted)'}}>
              {language === 'zh' ? '24h交易量' : '24h Volume'}
            </div>
          </div>
          
          <div className="content-card p-6 text-center">
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" 
                 style={{backgroundColor: 'var(--graffiti-yellow-light)'}}>
              <Users className="w-6 h-6" style={{color: 'var(--graffiti-yellow)'}} />
            </div>
            <div className="text-xl font-black mb-1" style={{color: 'var(--text-primary)'}}>
              15,234
            </div>
            <div className="text-sm" style={{color: 'var(--text-muted)'}}>
              {language === 'zh' ? '持有者' : 'Holders'}
            </div>
          </div>
          
          <div className="content-card p-6 text-center">
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" 
                 style={{backgroundColor: 'var(--graffiti-purple-light)'}}>
              <Coins className="w-6 h-6" style={{color: 'var(--graffiti-purple)'}} />
            </div>
            <div className="text-xl font-black mb-1" style={{color: 'var(--text-primary)'}}>
              1000T
            </div>
            <div className="text-sm" style={{color: 'var(--text-muted)'}}>
              {language === 'zh' ? '总供应量' : 'Total Supply'}
            </div>
          </div>
        </div>

        {/* 新的代币信息板块 */}
        <section id="token-info" className="py-12 sm:py-16 lg:py-20">

          <div className="graffiti-card p-6 sm:p-8 max-w-6xl mx-auto text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Left Column */}
              <div className="space-y-4">
                <p className="text-sm sm:text-base">
                  <strong data-lang-key="token_name_label" className="font-semibold" style={{color: 'var(--text-dark)'}}>
                    {language === 'zh' ? '代币名称:' : 'Token Name:'}
                  </strong> 
                  <span className="ml-2" style={{color: 'var(--text-dark)'}}>YesCoin</span>
                </p>
                <p className="text-sm sm:text-base">
                  <strong data-lang-key="token_symbol_label" className="font-semibold" style={{color: 'var(--text-dark)'}}>
                    {language === 'zh' ? '代币符号:' : 'Token Symbol:'}
                  </strong> 
                  <span className="ml-2" style={{color: 'var(--text-dark)'}}>Yes</span>
                </p>
                <p className="text-sm sm:text-base">
                  <strong data-lang-key="token_chain_label" className="font-semibold" style={{color: 'var(--text-dark)'}}>
                    {language === 'zh' ? '区块链:' : 'Blockchain:'}
                  </strong> 
                  <span className="ml-2" style={{color: 'var(--text-dark)'}}>BSC ({language === 'zh' ? '币安智能链' : 'Binance Smart Chain'})</span>
                </p>
                <p className="text-sm sm:text-base">
                  <strong data-lang-key="token_supply_label" className="font-semibold" style={{color: 'var(--text-dark)'}}>
                    {language === 'zh' ? '总供应量:' : 'Total Supply:'}
                  </strong> 
                  <span className="ml-2" style={{color: 'var(--text-dark)'}}>{language === 'zh' ? '1000 万亿' : '1000 Trillion'}</span>
                </p>
                <button 
                  className="graffiti-btn graffiti-btn-pink text-sm px-4 py-2 w-full" 
                  data-lang-key="copy_contract_button"
                  onClick={() => copyToClipboard(tokenOverview.contract, 'contract')}
                >
                  {language === 'zh' ? '复制合约地址' : 'Copy Contract Address'}
                </button>
                <p className="text-sm sm:text-base">
                  <strong data-lang-key="token_distribution_label" className="font-semibold" style={{color: 'var(--text-dark)'}}>
                    {language === 'zh' ? '代币分配方案:' : 'Token Distribution:'}
                  </strong> 
                  <span className="ml-2" data-lang-key="token_distribution_value" style={{color: 'var(--text-dark)'}}>
                    {language === 'zh' ? '100% 社区发行' : '100% Community Distribution'}
                  </span>
                </p>
                <p className="text-sm text-gray-400" data-lang-key="fair_launch_tagline">
                  {language === 'zh' ? '无团队预留，公平发行' : 'No team allocation, fair launch'}
                </p>
              </div>
              {/* Right Column */}
              <div>
                <h3 className="font-graffiti-title text-2xl sm:text-3xl mb-4 text-spray-gradient" data-lang-key="market_metrics_title">
                  {language === 'zh' ? '关键市场指标' : 'Key Market Metrics'}
                </h3>
                <div className="space-y-3 font-bold">
                  <p className="flex justify-between text-sm sm:text-base">
                    <span style={{color: 'var(--text-muted)'}}>{language === 'zh' ? '流通供应量:' : 'Circulating Supply:'}</span> 
                    <span style={{color: 'var(--text-dark)'}}>-</span>
                  </p>
                  <p className="flex justify-between text-sm sm:text-base">
                    <span style={{color: 'var(--text-muted)'}}>{language === 'zh' ? '持有者数量:' : 'Holders:'}</span> 
                    <span style={{color: 'var(--text-dark)'}}>-</span>
                  </p>
                  <p className="flex justify-between text-sm sm:text-base">
                    <span style={{color: 'var(--text-muted)'}}>{language === 'zh' ? '当前价格:' : 'Current Price:'}</span> 
                    <span style={{color: 'var(--text-dark)'}}>-</span>
                  </p>
                  <p className="flex justify-between text-sm sm:text-base">
                    <span style={{color: 'var(--text-muted)'}}>{language === 'zh' ? '24h 交易量:' : '24h Volume:'}</span> 
                    <span style={{color: 'var(--text-dark)'}}>-</span>
                  </p>
                  <p className="flex justify-between text-sm sm:text-base">
                    <span style={{color: 'var(--text-muted)'}}>{language === 'zh' ? '市值:' : 'Market Cap:'}</span> 
                    <span style={{color: 'var(--text-dark)'}}>-</span>
                  </p>
                  <p className="flex justify-between text-sm sm:text-base">
                    <span style={{color: 'var(--text-muted)'}}>FDV:</span> 
                    <span style={{color: 'var(--text-dark)'}}>-</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 border-t border-dashed border-gray-600">
              <div>
                <h3 className="font-graffiti-title text-2xl sm:text-3xl mb-4 text-spray-gradient" data-lang-key="fair_launch_title">
                  {language === 'zh' ? '公平发行理念' : 'Fair Launch Philosophy'}
                </h3>
                <ul className="space-y-2 font-bold">
                  <li data-lang-key="fair_launch_item1" className="text-sm sm:text-base" style={{color: 'var(--text-dark)'}}>
                    ✓ {language === 'zh' ? '100% 社区分发：所有代币完全用于社区，无团队预留份额' : '100% Community Distribution: All tokens fully allocated to community, no team allocation'}
                  </li>
                  <li data-lang-key="fair_launch_item2" className="text-sm sm:text-base" style={{color: 'var(--text-dark)'}}>
                    ✓ {language === 'zh' ? '无私募：拒绝内部人利益，保证社区主导权' : 'No Private Sale: Rejecting insider benefits, ensuring community governance'}
                  </li>
                  <li data-lang-key="fair_launch_item3" className="text-sm sm:text-base" style={{color: 'var(--text-dark)'}}>
                    ✓ {language === 'zh' ? '透明公开：所有分配过程完全透明，可在区块链上验证' : 'Transparent & Open: All allocation processes fully transparent and verifiable on blockchain'}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-graffiti-title text-2xl sm:text-3xl mb-4 text-spray-gradient" data-lang-key="future_plan_title">
                  {language === 'zh' ? '未来发展规划' : 'Future Development Plans'}
                </h3>
                <ul className="space-y-2 font-bold">
                  <li data-lang-key="future_plan_item1" className="text-sm sm:text-base" style={{color: 'var(--text-dark)'}}>
                    🎯 {language === 'zh' ? '治理投票：持有者参与社区重大决策投票' : 'Governance Voting: Token holders participate in major community decisions'}
                  </li>
                  <li data-lang-key="future_plan_item2" className="text-sm sm:text-base" style={{color: 'var(--text-dark)'}}>
                    🎮 {language === 'zh' ? '游戏支付：在生态游戏中作为支付和奖励代币' : 'Gaming Payment: Used as payment and reward token in ecosystem games'}
                  </li>
                  <li data-lang-key="future_plan_item3" className="text-sm sm:text-base" style={{color: 'var(--text-dark)'}}>
                    🌟 {language === 'zh' ? '生态扩展：逐步构建完整的DeFi生态系统' : 'Ecosystem Expansion: Gradually building a complete DeFi ecosystem'}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>




      </div>
      

    </div>
  );
};

export default TokenInfo;