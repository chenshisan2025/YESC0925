import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../lib/translations';
import { Gift, Users, Clock, CheckCircle, Copy, Share2, Twitter, MessageCircle, ExternalLink, Check, Wallet } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAccount } from 'wagmi';
import { 
  useAirdropInfo, 
  useClaimAirdrop, 
  formatTokenAmount, 
  formatAddress, 
  getErrorMessage 
} from '../lib/contracts';
import TransactionStatus from '../components/TransactionStatus';
import { useTransactionManager } from '../hooks/useTransactionManager';
import { usePresetGasEstimate } from '../hooks/useGasEstimate';

interface Task {
  id: string;
  type: 'twitter_follow' | 'twitter_retweet' | 'telegram_join';
  status: 'pending' | 'completed' | 'verified' | 'claimed';
  reward: string;
  url?: string;
}

const Airdrop: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const { address, isConnected } = useAccount();
  
  // Web3 hooks
  const airdropInfo = useAirdropInfo(address);
  const { claimAirdrop, isPending, isSuccess, error } = useClaimAirdrop();
  
  // 交易管理
  const transactionManager = useTransactionManager({
    onSuccess: (txHash) => {
      toast.success(language === 'zh' ? '空投领取成功！' : 'Airdrop Claimed Successfully!');
      // airdropInfo会自动刷新
      // 更新任务状态为已领取
      setTasks(prevTasks => 
        prevTasks.map(task => ({ ...task, status: 'claimed' as const }))
      );
    },
    onError: (error) => {
      console.error('Airdrop claim failed:', error);
    },
    successMessage: language === 'zh' ? '空投领取成功！' : 'Airdrop Claimed Successfully!',
    errorMessage: language === 'zh' ? '空投领取失败' : 'Airdrop Claim Failed'
  });
  
  // Gas费估算
  const gasEstimate = usePresetGasEstimate('TOKEN_CLAIM');
  
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      type: 'twitter_follow',
      status: 'pending',
      reward: '1,000,000',
      url: 'https://x.com/yescoin_globalx?s=21',
    },
    {
      id: '2',
      type: 'twitter_retweet',
      status: 'pending',
      reward: '500,000',
      url: 'https://x.com/yescoin_globalx?s=21',
    },
    {
      id: '3',
      type: 'telegram_join',
      status: 'pending',
      reward: '1,000,000',
      url: 'https://t.me/Yes_CoinX',
    },
  ]);

  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const getTaskInfo = (type: string) => {
    switch (type) {
      case 'twitter_follow':
        return {
          type: 'twitter_follow',
          title: t.airdrop.tasks.twitterFollow.title,
          description: t.airdrop.tasks.twitterFollow.description,
          icon: <Twitter className="w-6 h-6" />,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500'
        };
      case 'twitter_retweet':
        return {
          type: 'twitter_retweet',
          title: t.airdrop.tasks.twitterRetweet.title,
          description: t.airdrop.tasks.twitterRetweet.description,
          icon: <Twitter className="w-6 h-6" />,
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/20',
          borderColor: 'border-cyan-500'
        };
      case 'telegram_join':
        return {
          type: 'telegram_join',
          title: t.airdrop.tasks.telegramJoin.title,
          description: t.airdrop.tasks.telegramJoin.description,
          icon: <MessageCircle className="w-6 h-6" />,
          color: 'text-indigo-400',
          bgColor: 'bg-indigo-500/20',
          borderColor: 'border-indigo-500'
        };
      default:
        return {
          type: 'unknown',
          title: '',
          description: '',
          icon: <Gift className="w-6 h-6" />,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500'
        };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: t.airdrop.status.pending,
          icon: <Clock className="w-4 h-4" />,
          color: 'text-gray-500 bg-gray-100',
        };
      case 'completed':
        return {
          label: t.airdrop.status.completed,
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'text-blue-600 bg-blue-100',
        };
      case 'verified':
        return {
          label: t.airdrop.status.verified,
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'text-green-600 bg-green-100',
        };
      case 'claimed':
        return {
          label: t.airdrop.status.claimed,
          icon: <Gift className="w-4 h-4" />,
          color: 'text-purple-600 bg-purple-100',
        };
      default:
        return {
          label: 'Unknown',
          icon: <Clock className="w-4 h-4" />,
          color: 'text-gray-500 bg-gray-100',
        };
    }
  };

  // 监听空投领取成功
  useEffect(() => {
    if (isSuccess) {
      toast.success(language === 'zh' ? '空投领取成功！' : 'Airdrop claimed successfully!');
      // airdropInfo会自动刷新
      // 更新任务状态为已领取
      setTasks(prevTasks => 
        prevTasks.map(task => ({ ...task, status: 'claimed' as const }))
      );
    }
  }, [isSuccess, language]);

  // 监听错误
  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error));
    }
  }, [error]);

  const handleTaskAction = async (taskId: string, action: 'complete' | 'verify' | 'claim') => {
    if (!isConnected) {
      toast.error(language === 'zh' ? '请先连接钱包' : 'Please connect wallet first');
      return;
    }

    setIsProcessing(taskId);
    
    try {
      if (action === 'claim') {
        // 真实的空投领取
        if (!airdropInfo?.isClaimed) {
           claimAirdrop();
         } else {
           toast.error(language === 'zh' ? '空投已领取' : 'Airdrop already claimed');
         }
      } else {
        // 模拟任务完成和验证过程
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setTasks(prevTasks => 
          prevTasks.map(task => {
            if (task.id === taskId) {
              switch (action) {
                case 'complete':
                  return { ...task, status: 'completed' as const };
                case 'verify':
                  return { ...task, status: 'verified' as const };
                default:
                  return task;
              }
            }
            return task;
          })
        );
        
        if (action === 'verify') {
          toast.success(language === 'zh' ? '任务验证成功！' : 'Task verified successfully!');
        } else {
          toast.success(language === 'zh' ? '任务完成！' : 'Task completed!');
        }
      }
    } catch (error) {
      toast.error(language === 'zh' ? '操作失败，请重试' : 'Operation failed, please try again');
    } finally {
      setIsProcessing(null);
    }
  };

  const openTaskUrl = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const getActionButton = (task: Task) => {
    const isLoading = isProcessing === task.id;
    
    switch (task.status) {
      case 'pending':
        const getTaskButtonText = (taskType: string) => {
          switch (taskType) {
            case 'twitter_follow':
              return t.airdrop.tasks.twitterFollow.button;
            case 'twitter_retweet':
              return t.airdrop.tasks.twitterRetweet.button;
            case 'telegram_join':
              return t.airdrop.tasks.telegramJoin.button;
            default:
              return t.airdrop.buttons.complete;
          }
        };
        
        return (
          <div className="flex gap-2">
            <button
              onClick={() => openTaskUrl(task.url)}
              className="graffiti-button px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg transform hover:-rotate-1 flex items-center justify-center gap-3"
              style={{
                background: 'linear-gradient(135deg, var(--cta-blue-spray), var(--accent-cyan-spray))',
                color: 'white'
              }}
            >
              <ExternalLink className="w-5 h-5" />
              <span className="font-condensed">{getTaskButtonText(task.type)}</span>
            </button>
          </div>
        );
      case 'completed':
        return (
          <button
            onClick={() => handleTaskAction(task.id, 'verify')}
            disabled={isLoading}
            className="graffiti-button w-full px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg transform hover:-rotate-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg, var(--cta-green-spray), var(--accent-lime-spray))',
              color: 'white'
            }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            <span className="font-condensed">
              {isLoading ? t.common.loading : t.airdrop.buttons.verify}
            </span>
          </button>
        );
      case 'verified':
        return (
          <button
            onClick={() => handleTaskAction(task.id, 'claim')}
            disabled={isLoading}
            className="graffiti-button w-full px-8 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg transform hover:-rotate-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(135deg, var(--cta-yellow-spray), var(--cta-orange-spray))',
              color: 'var(--bg-dark-brick)'
            }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Gift className="w-5 h-5" />
            )}
            <span className="font-condensed">
              {isLoading ? t.airdrop.buttons.claiming : t.airdrop.buttons.claim}
            </span>
          </button>
        );
      case 'claimed':
        return (
          <div className="w-full px-8 py-3 rounded-xl font-bold text-center flex items-center justify-center gap-3" style={{ backgroundColor: 'var(--graffiti-green)' + '20', color: 'var(--graffiti-green)' }}>
            <CheckCircle className="w-5 h-5" />
            <span className="font-condensed">✓ {t.airdrop.status.claimed}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const totalRewards = tasks.reduce((sum, task) => {
    if (task.status === 'verified' || task.status === 'claimed') {
      return sum + parseInt(task.reward.replace(/,/g, ''));
    }
    return sum;
  }, 0);

  const claimableRewards = tasks.filter(task => task.status === 'verified').length;

  const handleClaimAll = async () => {
    if (!isConnected) {
      toast.error(language === 'zh' ? '请先连接钱包' : 'Please connect wallet first');
      return;
    }

    if (airdropInfo?.isClaimed) {
       toast.error(language === 'zh' ? '空投已领取' : 'Airdrop already claimed');
       return;
     }

    setIsProcessing('claim-all');
    
    try {
      // 开始交易流程
      transactionManager.startTransaction(gasEstimate.gasLimit, gasEstimate.gasPrice);
      
      const txHash = await claimAirdrop();
      
      // 交易提交成功
      transactionManager.onTransactionSubmitted('transaction_submitted');
    } catch (error) {
      const errorMessage = transactionManager.getErrorMessage(error);
      transactionManager.onTransactionError(errorMessage);
      console.error('Claim failed:', error);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-brick pt-20">
      {/* 英雄区块 */}
      <section className="py-20 lg:py-24 px-4 text-center relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-16 left-8 w-20 h-20 rounded-full animate-pulse" style={{backgroundColor: 'var(--cta-yellow-spray)'}}></div>
          <div className="absolute top-32 right-12 w-16 h-16 rounded-lg transform rotate-45 animate-pulse delay-300" style={{backgroundColor: 'var(--cta-pink-spray)'}}></div>
          <div className="absolute bottom-24 left-1/4 w-24 h-24 rounded-full animate-pulse delay-700" style={{backgroundColor: 'var(--accent-green-spray)'}}></div>
          <div className="absolute bottom-32 right-1/3 w-18 h-18 rounded-lg transform -rotate-12 animate-pulse delay-500" style={{backgroundColor: 'var(--accent-blue-spray)'}}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Gift className="w-12 h-12 text-graffiti-yellow" />
            <h1 className="font-graffiti text-5xl lg:text-7xl text-graffiti-yellow drop-shadow-2xl">
              {t.airdrop.title}
            </h1>
          </div>
          <p className="font-chinese text-lg lg:text-xl mb-8 lg:mb-12 max-w-2xl mx-auto leading-relaxed text-text-secondary">
            {t.airdrop.description}
          </p>
          <div className="w-24 h-1 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, var(--graffiti-yellow), var(--graffiti-pink))' }}></div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20">

        {/* 用户空投信息 */}
        {isConnected && (
          <div className="content-card p-8 mb-8 border-l-4 border-graffiti-purple">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-graffiti-purple" />
                <h3 className="font-condensed font-bold text-xl text-text-primary">
                  {language === 'zh' ? '我的空投信息' : 'My Airdrop Info'}
                </h3>
              </div>
              <div className="text-sm font-chinese text-text-secondary">
                {formatAddress(address!)}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
               <div className="p-4 rounded-lg bg-bg-secondary">
                 <div className="flex items-center gap-2 mb-2">
                   <Gift className="w-5 h-5 text-graffiti-yellow" />
                   <span className="font-chinese text-sm text-text-secondary">
                     {language === 'zh' ? '可领取数量' : 'Claimable Amount'}
                   </span>
                 </div>
                 <div className="font-graffiti text-2xl font-black text-graffiti-yellow">
                   {airdropInfo?.amount || '0'} YES
                 </div>
               </div>
               
               <div className="p-4 rounded-lg bg-bg-secondary">
                 <div className="flex items-center gap-2 mb-2">
                   <CheckCircle className="w-5 h-5 text-graffiti-green" />
                   <span className="font-chinese text-sm text-text-secondary">
                     {language === 'zh' ? '领取状态' : 'Claim Status'}
                   </span>
                 </div>
                 <div className={`font-condensed font-bold ${
                   airdropInfo?.isClaimed ? 'text-graffiti-green' : 'text-graffiti-yellow'
                 }`}>
                   {airdropInfo?.isClaimed ? 
                     (language === 'zh' ? '已领取' : 'Claimed') :
                     (language === 'zh' ? '可领取' : 'Available')
                   }
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* 奖励统计 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="content-card hover-card-rotate p-8 text-center border-l-4 border-graffiti-yellow">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gift className="w-8 h-8 text-graffiti-yellow" />
              <div className="font-graffiti text-4xl font-black text-graffiti-yellow">
                {totalRewards.toLocaleString()}
              </div>
            </div>
            <div className="font-chinese text-text-secondary mb-2">{t.airdrop.stats.total}</div>
            <div className="font-condensed text-sm font-bold text-graffiti-yellow">YES {language === 'zh' ? '代币' : 'Tokens'}</div>
          </div>
          
          <div className="content-card hover-card-rotate p-8 text-center border-l-4 border-graffiti-green">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-graffiti-green" />
              <div className="font-graffiti text-4xl font-black text-graffiti-green">
                {tasks.filter(task => task.status === 'claimed').length}
              </div>
            </div>
            <div className="font-chinese text-text-secondary mb-2">{t.airdrop.stats.claimed}</div>
            <div className="font-condensed text-sm font-bold text-graffiti-green">{language === 'zh' ? '共' : 'of'} {tasks.length} {language === 'zh' ? '个任务' : 'tasks'}</div>
          </div>
          
          <div className="content-card hover-card-rotate p-8 text-center border-l-4 border-graffiti-pink">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="w-8 h-8 text-graffiti-pink" />
              <div className="font-graffiti text-4xl font-black text-graffiti-pink">
                {claimableRewards}
              </div>
            </div>
            <div className="font-chinese text-text-secondary mb-2">{t.airdrop.stats.claimable}</div>
            <div className="font-condensed text-sm font-bold text-graffiti-pink">{language === 'zh' ? '待领取' : 'Ready to claim'}</div>
          </div>
        </div>

        {/* 一键领取按钮 */}
        {isConnected && !airdropInfo?.isClaimed && (
          <div className="text-center mb-16">
            <div>
              <button
                onClick={handleClaimAll}
                disabled={isPending || isProcessing === 'claim-all' || transactionManager.isTransactionPending}
                className="graffiti-button px-10 py-5 text-xl font-black rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl transform hover:-rotate-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full"
                style={{
                  background: 'linear-gradient(135deg, var(--cta-yellow-spray), var(--cta-orange-spray))',
                  color: 'var(--bg-dark-brick)',
                  boxShadow: '0 12px 40px rgba(255, 193, 7, 0.4)'
                }}
              >
                {isPending || isProcessing === 'claim-all' || transactionManager.isTransactionPending ? (
                  <div className="w-7 h-7 border-2 border-current border-t-transparent rounded-full animate-spin inline mr-3"></div>
                ) : (
                  <Gift className="w-7 h-7 inline mr-3" />
                )}
                <span className="font-graffiti">
                  {isPending || isProcessing === 'claim-all' || transactionManager.isTransactionPending ? 
                    (language === 'zh' ? '领取中...' : 'Claiming...') : 
                    (language === 'zh' ? `领取 ${airdropInfo?.amount || '0'} YES` : `Claim ${airdropInfo?.amount || '0'} YES`)
                  }
                </span>
              </button>
              
              {/* Gas费信息 */}
              {gasEstimate.totalCostFormatted && (
                <div className="mt-4 p-3 bg-bg-secondary rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">
                      {language === 'zh' ? '预估Gas费:' : 'Estimated Gas:'}
                    </span>
                    <span className="font-mono text-graffiti-yellow font-bold">
                      {gasEstimate.totalCostFormatted} BNB
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 任务列表 */}
        <div className="space-y-8">
          {tasks.map((task) => {
            const taskInfo = getTaskInfo(task.type);
            const statusInfo = getStatusInfo(task.status);
            
            return (
              <div key={task.id} className="content-card hover-card-rotate p-8 flex items-center justify-between border-l-4" style={{borderLeftColor: taskInfo.color}}>
                <div className="flex items-center space-x-6">
                  <div className="p-4 rounded-2xl" style={{ backgroundColor: taskInfo.color + '20' }}>
                    {taskInfo.icon}
                  </div>
                  <div>
                    <h3 className="font-condensed font-bold text-xl mb-2 text-text-primary">{taskInfo.title}</h3>
                    <p className="font-chinese text-text-secondary mb-3">{taskInfo.description}</p>
                    <div className="flex items-center space-x-6">
                      <span className="font-graffiti text-lg font-black text-graffiti-yellow">
                        +{task.reward} YES
                      </span>
                      <span 
                        className="font-condensed text-sm px-3 py-1 rounded-full font-bold"
                        style={{ 
                          backgroundColor: statusInfo.color + '20',
                          color: statusInfo.color 
                        }}
                      >
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  {getActionButton(task)}
                </div>
              </div>
            );
          })}
        </div>

        {/* 连接钱包提示 */}
        {!isConnected && (
          <div className="text-center mt-20 p-12 rounded-3xl relative overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {/* 背景装饰 */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 w-12 h-12 rounded-full animate-pulse" style={{backgroundColor: 'var(--graffiti-purple)'}}></div>
              <div className="absolute bottom-6 right-12 w-16 h-16 rounded-lg transform rotate-12 animate-pulse delay-300" style={{backgroundColor: 'var(--graffiti-blue)'}}></div>
            </div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--graffiti-purple)' + '20' }}>
                <Users className="w-10 h-10" style={{ color: 'var(--graffiti-purple)' }} />
              </div>
              <h3 className="font-graffiti text-2xl lg:text-3xl font-black mb-4 text-graffiti-purple">
                {language === 'zh' ? '连接钱包开始赚取' : 'Connect Wallet to Start Earning'}
              </h3>
              <p className="font-chinese text-lg mb-8 max-w-md mx-auto leading-relaxed text-text-secondary">
                {language === 'zh' ? '连接您的钱包以完成任务并领取 YES 代币奖励' : 'Connect your wallet to complete tasks and claim YES token rewards'}
              </p>
              <button 
                className="graffiti-button px-10 py-4 rounded-2xl font-black text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl transform hover:-rotate-1"
                style={{
                  background: 'linear-gradient(135deg, var(--cta-purple-spray), var(--cta-indigo-spray))',
                  color: 'white',
                  boxShadow: '0 12px 40px rgba(139, 69, 219, 0.4)'
                }}
              >
                <Users className="w-6 h-6 inline mr-3" />
                <span className="font-graffiti">
                  {language === 'zh' ? '连接钱包' : 'Connect Wallet'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 交易状态弹窗 */}
      <TransactionStatus
        isOpen={transactionManager.transactionState.isOpen}
        onClose={transactionManager.closeModal}
        status={transactionManager.transactionState.status}
        txHash={transactionManager.transactionState.txHash}
        error={transactionManager.transactionState.error}
        gasEstimate={transactionManager.transactionState.gasEstimate}
        gasPrice={transactionManager.transactionState.gasPrice}
        title={language === 'zh' ? '空投领取' : 'Claim Airdrop'}
        description={language === 'zh' ? '正在处理您的空投领取请求...' : 'Processing your airdrop claim request...'}
      />
    </div>
  );
};

export default Airdrop;