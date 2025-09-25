import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Wallet, Globe, AlertTriangle } from 'lucide-react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../lib/translations';
import { switchToBSC } from '../lib/web3';
import { toast } from 'sonner';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { address, isConnected, isConnecting: wagmiConnecting } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  const t = translations[language];

  const navigation = [
    { name: t.nav.home, href: '/' },
    { name: t.nav.token, href: '/token' },
    { name: t.nav.nft, href: '/nft' },
    { name: t.nav.airdrop, href: '/airdrop' },
    { name: t.nav.faq, href: '/faq' },
  ];

  // BSC网络ID
  const BSC_MAINNET_ID = 56;
  const BSC_TESTNET_ID = 97;
  
  // 检查是否在正确的网络
  const isCorrectNetwork = chainId === BSC_MAINNET_ID || chainId === BSC_TESTNET_ID;
  
  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const metamaskConnector = connectors.find(connector => connector.name === 'MetaMask');
      if (metamaskConnector) {
        await connect({ connector: metamaskConnector });
        toast.success(language === 'zh' ? '钱包连接成功！' : 'Wallet connected successfully!');
      } else {
        toast.error(language === 'zh' ? '未找到MetaMask钱包' : 'MetaMask wallet not found');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error(language === 'zh' ? '钱包连接失败' : 'Wallet connection failed');
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: BSC_MAINNET_ID });
      toast.success(language === 'zh' ? '网络切换成功！' : 'Network switched successfully!');
    } catch (error) {
      console.error('Network switch failed:', error);
      toast.error(language === 'zh' ? '网络切换失败' : 'Network switch failed');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success(language === 'zh' ? '钱包已断开连接' : 'Wallet disconnected');
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isActivePage = (href: string) => {
    return location.pathname === href;
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b-2" 
            style={{
              backgroundColor: 'var(--bg-dark-brick)', 
              borderColor: 'var(--cta-yellow-spray)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="font-graffiti text-4xl md:text-5xl tracking-wider transform hover:scale-105 transition-transform duration-200">
            <span className="graffiti-title">YesCoin</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-link-graffiti-underline text-lg font-condensed font-bold tracking-wide transition-all duration-300 ${
                  isActivePage(item.href) ? 'text-yellow-400' : 'text-gray-200 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
              className="graffiti-button btn-blue-spray text-sm px-3 py-2 font-bold"
              title={t.common.switchLanguage}
            >
              <Globe className="w-4 h-4 mr-1 inline" />
              {language.toUpperCase()}
            </button>

            {/* Buy YES Button - Hidden on mobile */}
            <button className="graffiti-button btn-pink-spray text-sm px-4 py-2 hidden md:block font-bold">
              {t.nav.buyYes}
            </button>

            {/* Wallet Connection */}
            {isConnected && address ? (
              <div className="flex items-center space-x-2">
                {/* 网络状态指示器 */}
                {!isCorrectNetwork && (
                  <button
                    onClick={handleSwitchNetwork}
                    className="graffiti-button btn-red-spray text-xs px-2 py-1 font-bold flex items-center"
                    title={language === 'zh' ? '点击切换到BSC网络' : 'Click to switch to BSC network'}
                  >
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {language === 'zh' ? '错误网络' : 'Wrong Network'}
                  </button>
                )}
                
                <div className="graffiti-button btn-yellow-spray text-sm px-3 py-2 font-mono">
                  <Wallet className="w-4 h-4 mr-1 inline" />
                  {formatAddress(address)}
                </div>
                <button
                  onClick={handleDisconnect}
                  className="graffiti-button btn-pink-spray text-sm px-3 py-2 font-bold"
                >
                  {t.wallet.disconnect}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting || wagmiConnecting || isPending}
                className="graffiti-button btn-yellow-spray text-sm px-4 py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting || wagmiConnecting || isPending ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline mr-1"></div>
                ) : (
                  <Wallet className="w-4 h-4 mr-1 inline" />
                )}
                {isConnecting || wagmiConnecting || isPending ? 
                  (language === 'zh' ? '连接中...' : 'Connecting...') : 
                  t.wallet.connect
                }
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden graffiti-button btn-pink-spray text-sm px-3 py-2"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t-2 animate-fade-in" 
               style={{borderColor: 'var(--cta-yellow-spray)'}}>
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`nav-link-graffiti-underline text-left text-lg font-condensed font-bold py-2 ${
                    isActivePage(item.href) ? 'text-yellow-400' : 'text-gray-200'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <button className="graffiti-button btn-pink-spray text-sm px-4 py-2 mt-3 text-left font-bold">
                {t.nav.buyYes}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}