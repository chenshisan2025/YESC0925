import React, { useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../lib/translations';
import { Minus, Plus, Zap, Share2, ChevronLeft, ChevronRight, ExternalLink, Wallet, Sparkles, Gift, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  useNFTBalance, 
  useNFTInfo, 
  useNFTSeriesInfo, 
  useUserNFTs, 
  useMintNFT, 
  calculateNFTPrice,
  getErrorMessage,
  YESCOIN_NFT_INFO 
} from '../lib/contracts';
import TransactionStatus from '../components/TransactionStatus';
import { useTransactionManager } from '../hooks/useTransactionManager';
import { usePresetGasEstimate } from '../hooks/useGasEstimate';

const NFT: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const { address, isConnected } = useAccount();
  const [mintAmount, setMintAmount] = useState(1);
  const [selectedSeries, setSelectedSeries] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [quickMintAmount, setQuickMintAmount] = useState(1);
  const galleryRef = useRef<HTMLDivElement>(null);
  
  // 获取NFT相关数据
  const nftInfo = useNFTInfo();
  const { data: userNFTBalance } = useNFTBalance(address);
  const { data: userNFTs } = useUserNFTs(address);
  const seriesInfo = useNFTSeriesInfo(selectedSeries);
  const { mintNFT, isPending, isConfirming, isSuccess, error } = useMintNFT();

  // 交易管理
  const transactionManager = useTransactionManager({
    onSuccess: (txHash) => {
      toast.success(language === 'zh' ? 'NFT铸造成功！您的NFT已成功铸造' : 'NFT Minted Successfully! Your NFT has been minted successfully');
      // 刷新用户NFT列表
      // userNFTs会自动刷新，无需手动调用
    },
    onError: (error) => {
      console.error('NFT minting failed:', error);
    },
    successMessage: language === 'zh' ? 'NFT铸造成功！' : 'NFT Minted Successfully!',
    errorMessage: language === 'zh' ? 'NFT铸造失败' : 'NFT Minting Failed'
  });
  
  // Gas费估算
  const gasEstimate = usePresetGasEstimate('NFT_MINT');

  // 获取NFT系列数据
  const nftSeries = YESCOIN_NFT_INFO.defaultSeries.map(series => ({
    ...series,
    currentSupply: seriesInfo?.currentSupply || 0,
    maxSupply: seriesInfo?.maxSupply || series.maxSupply,
    isActive: seriesInfo?.isActive || true,
  }));
  
  const nftCollection = {
    name: 'Street Graffiti Collection',
    totalSupply: 10000,
    minted: 3456,
    price: '0.1 BNB',
    maxPerTx: 10,
  };

  // 模拟NFT画廊数据
  const nftGallery = [
    {
      id: 1,
      name: 'YES#1',
      series: '水泥墙系列 #1',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=concrete%20wall%20graffiti%20yellow%20YES%20street%20art%20urban%20spray%20paint%20texture&image_size=square',
      rarity: 'Legendary',
      attributes: ['水泥墙', '黄色主题', '街头艺术'],
    },
    {
      id: 2,
      name: 'YES#2',
      series: '红砖墙系列 #1',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=red%20brick%20wall%20graffiti%20pink%20YES%20street%20art%20urban%20spray%20paint%20texture&image_size=square',
      rarity: 'Epic',
      attributes: ['红砖墙', '粉色主题', '街头艺术'],
    },
    {
      id: 3,
      name: 'YES#3',
      series: '纸板系列 #2',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cardboard%20graffiti%20cyan%20YES%20street%20art%20urban%20spray%20paint%20texture&image_size=square',
      rarity: 'Rare',
      attributes: ['纸板', '青色主题', '街头艺术'],
    },
    {
      id: 4,
      name: 'YES#4',
      series: '木板系列 #1',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=wooden%20board%20graffiti%20gray%20YES%20street%20art%20urban%20spray%20paint%20texture&image_size=square',
      rarity: 'Common',
      attributes: ['木板', '灰色主题', '街头艺术'],
    },
    {
      id: 5,
      name: 'YES#5',
      series: '金属系列 #1',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=metal%20surface%20graffiti%20blue%20YES%20street%20art%20urban%20spray%20paint%20texture&image_size=square',
      rarity: 'Epic',
      attributes: ['金属', '蓝色主题', '街头艺术'],
    },
    {
      id: 6,
      name: 'YES#6',
      series: '玻璃系列 #1',
      image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=glass%20surface%20graffiti%20green%20YES%20street%20art%20urban%20spray%20paint%20texture&image_size=square',
      rarity: 'Rare',
      attributes: ['玻璃', '绿色主题', '街头艺术'],
    },
  ];

  const mintProgress = (nftCollection.minted / nftCollection.totalSupply) * 100;

  const handleMint = async () => {
    if (!isConnected) {
      toast.error(language === 'zh' ? '请先连接钱包' : 'Please connect wallet first');
      return;
    }
    
    if (!seriesInfo) {
      toast.error(language === 'zh' ? '无法获取NFT系列信息' : 'Unable to get NFT series info');
      return;
    }
    
    try {
      // 开始交易流程
      transactionManager.startTransaction(gasEstimate.gasLimit, gasEstimate.gasPrice);
      
      const result = await mintNFT(selectedSeries, mintAmount);
      
      // 交易提交成功
      transactionManager.onTransactionSubmitted('transaction_submitted');
    } catch (err) {
      const errorMsg = transactionManager.getErrorMessage(err);
      transactionManager.onTransactionError(errorMsg);
      console.error('Minting failed:', err);
    }
  };

  const handleQuickMint = async () => {
    if (!isConnected) {
      toast.error(language === 'zh' ? '请先连接钱包' : 'Please connect wallet first');
      return;
    }
    
    try {
      // 开始交易流程
      transactionManager.startTransaction(gasEstimate.gasLimit, gasEstimate.gasPrice);
      
      // 使用固定系列1和快速铸造数量
      const result = await mintNFT(1, quickMintAmount);
      
      // 交易提交成功
      transactionManager.onTransactionSubmitted('transaction_submitted');
    } catch (err) {
      const errorMsg = transactionManager.getErrorMessage(err);
      transactionManager.onTransactionError(errorMsg);
      console.error('Quick minting failed:', err);
    }
  };
  
  // 监听铸造成功
  React.useEffect(() => {
    if (isSuccess) {
      toast.success(
        language === 'zh' 
          ? `成功铸造 ${mintAmount} 个NFT！` 
          : `Successfully minted ${mintAmount} NFT${mintAmount > 1 ? 's' : ''}!`
      );
      setMintAmount(1);
      setQuickMintAmount(1);
    }
  }, [isSuccess, mintAmount, language]);

  const generateInviteLink = () => {
    const link = `${window.location.origin}/nft?ref=${address || 'user123'}`;
    setInviteLink(link);
    toast.success(language === 'zh' ? '邀请链接已生成' : 'Invite link generated');
  };

  const copyInviteLink = async () => {
    const link = inviteLink || `${window.location.origin}/nft?ref=${address || 'user123'}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success(language === 'zh' ? '邀请链接已复制' : 'Invite link copied');
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error(language === 'zh' ? '复制失败' : 'Copy failed');
    }
  };

  // 生成邀请链接
  React.useEffect(() => {
    if (address) {
      setInviteLink(`${window.location.origin}/nft?ref=${address}`);
    }
  }, [address]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'text-graffiti-yellow bg-graffiti-yellow/20';
      case 'Epic': return 'text-graffiti-pink bg-graffiti-pink/20';
      case 'Rare': return 'text-graffiti-blue bg-graffiti-blue/20';
      default: return 'text-text-secondary bg-bg-secondary';
    }
  };

  const scrollGallery = (direction: 'left' | 'right') => {
    if (galleryRef.current) {
      const scrollAmount = 320; // 卡片宽度 + gap
      const currentScroll = galleryRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      galleryRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-dark-brick pt-20">
      {/* NFT Gallery Section */}
      <section id="nft" className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="font-graffiti-title text-6xl mb-4 text-spray-gradient" data-lang-key="nft_title">
            {language === 'zh' ? 'Yescoin NFT' : 'Yescoin NFT'}
          </h2>
          <p className="max-w-3xl mx-auto mb-12 font-bold" data-lang-key="nft_subtitle">
            {language === 'zh' ? '总量 55315. 每一件作品都是独一无二的街头宣言。这不仅是收藏品，这是你的帮派符号。' : 'Total 55315. Each piece is a unique street statement. This is not just a collectible, this is your gang symbol.'}
          </p>
          
          {/* NFT Preview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
            <img 
              src="https://placehold.co/300x300/282828/FFF500?text=YES" 
              alt="Yescoin NFT Preview" 
              className="w-full rounded-lg border-2 border-gray-600 hover:scale-105 transition-transform" 
            />
            <img 
              src="https://placehold.co/300x300/282828/FF0077?text=YES" 
              alt="Yescoin NFT Preview" 
              className="w-full rounded-lg border-2 border-gray-600 hover:scale-105 transition-transform" 
            />
            <img 
              src="https://placehold.co/300x300/282828/00FFFF?text=YES" 
              alt="Yescoin NFT Preview" 
              className="w-full rounded-lg border-2 border-gray-600 hover:scale-105 transition-transform" 
            />
            <img 
              src="https://placehold.co/300x300/282828/EAEAEA?text=YES" 
              alt="Yescoin NFT Preview" 
              className="w-full rounded-lg border-2 border-gray-600 hover:scale-105 transition-transform" 
            />
            <img 
              src="https://placehold.co/300x300/282828/999999?text=YES" 
              alt="Yescoin NFT Preview" 
              className="w-full rounded-lg border-2 border-gray-600 hover:scale-105 transition-transform" 
            />
            <img 
              src="https://placehold.co/300x300/282828/FF5733?text=YES" 
              alt="Yescoin NFT Preview" 
              className="w-full rounded-lg border-2 border-gray-600 hover:scale-105 transition-transform" 
            />
            <img 
              src="https://placehold.co/300x300/282828/C70039?text=YES" 
              alt="Yescoin NFT Preview" 
              className="w-full rounded-lg border-2 border-gray-600 hover:scale-105 transition-transform" 
            />
            <img 
              src="https://placehold.co/300x300/282828/DAF7A6?text=YES" 
              alt="Yescoin NFT Preview" 
              className="w-full rounded-lg border-2 border-gray-600 hover:scale-105 transition-transform" 
            />
          </div>

          {/* Minting Card */}
          <div className="graffiti-card p-8 max-w-2xl mx-auto text-left">
            <p className="font-graffiti-title text-2xl mb-2 text-center" data-lang-key="nft_mint_progress">
              {language === 'zh' ? '铸造进度: 8,888 / 55,315' : 'Minting Progress: 8,888 / 55,315'}
            </p>
            <div className="w-full bg-gray-700 rounded-full h-4 my-4 border-2 border-gray-500 overflow-hidden">
              <div className="bg-yellow-400 h-full rounded-full" style={{width: '16%'}}></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-6">
              <div className="text-center">
                <label className="font-graffiti-title text-2xl block mb-2" data-lang-key="nft_price">
                  {language === 'zh' ? '价格' : 'Price'}
                </label>
                <p className="text-4xl font-graffiti-title" style={{color: 'var(--cta-pink-spray)'}}>0.05 BNB</p>
              </div>
              <div className="text-center">
                <label htmlFor="mint-amount" className="font-graffiti-title text-2xl block mb-2" data-lang-key="nft_amount">
                  {language === 'zh' ? '数量 (最大100)' : 'Amount (Max 100)'}
                </label>
                <input 
                  type="number" 
                  id="mint-amount" 
                  value={mintAmount} 
                  min="1" 
                  max="100" 
                  onChange={(e) => setMintAmount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full p-2 text-center bg-transparent border-2 rounded-lg font-graffiti-title text-2xl" 
                  style={{borderColor: 'var(--border-color)'}} 
                />
              </div>
            </div>
            
            <button 
              onClick={handleMint}
              disabled={isPending || isConfirming || transactionManager.isTransactionPending || !isConnected}
              className="graffiti-button btn-yellow-spray w-full py-3 font-graffiti-title text-4xl" 
              data-lang-key="nft_mint_now"
            >
              {!isConnected ? (
                language === 'zh' ? '连接钱包' : 'Connect Wallet'
              ) : (isPending || isConfirming || transactionManager.isTransactionPending) ? (
                language === 'zh' ? '铸造中...' : 'Minting...'
              ) : (
                language === 'zh' ? '铸造' : 'Mint'
              )}
            </button>
            
            {/* Invite Section */}
            <div className="mt-8 pt-8 border-t-2 border-dashed" style={{borderColor: 'var(--cta-pink-spray)'}}>
              <h3 className="font-graffiti-title text-3xl mb-2 text-center" data-lang-key="nft_invite_title">
                {language === 'zh' ? '拉兄弟入伙 🤙' : 'Invite Friends 🤙'}
              </h3>
              <p className="font-bold text-center" data-lang-key="nft_invite_desc">
                {language === 'zh' ? '邀请的好友每铸造一个，奖励 1000 万 YES 币' : 'Earn 10 million YES coins for each NFT minted by invited friends'}
              </p>
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                <div className="bg-black/20 border-2 border-dashed border-gray-500 p-2 text-sm text-gray-300 truncate w-full sm:w-auto rounded-lg">
                  {inviteLink || 'https://yescoin.xyz/?ref=0x123...'}
                </div>
                <button 
                  onClick={copyInviteLink}
                  className="graffiti-button btn-pink-spray text-sm px-4 py-2 w-full sm:w-auto" 
                  data-lang-key="nft_invite_copy_btn"
                >
                  {language === 'zh' ? '复制' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      
      {/* 交易状态弹窗 */}
      <TransactionStatus
        isOpen={transactionManager.transactionState.isOpen}
        onClose={transactionManager.closeModal}
        status={transactionManager.transactionState.status}
        txHash={transactionManager.transactionState.txHash}
        error={transactionManager.transactionState.error}
        gasEstimate={transactionManager.transactionState.gasEstimate}
        gasPrice={transactionManager.transactionState.gasPrice}
        title={language === 'zh' ? 'NFT铸造' : 'NFT Minting'}
        description={language === 'zh' ? '正在处理您的NFT铸造请求' : 'Processing your NFT minting request'}
      />
    </div>
  );
};

export default NFT;