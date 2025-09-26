import { createConfig, http } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import { metaMask, walletConnect, injected } from 'wagmi/connectors';

// 从环境变量获取RPC URL
const BSC_RPC_URL = import.meta.env.VITE_BSC_RPC_URL || 'https://bsc-dataseed1.binance.org/';
const BSC_TESTNET_RPC_URL = import.meta.env.VITE_BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/';
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

export const config = createConfig({
  chains: [bsc, bscTestnet],
  connectors: [
    injected(),
    metaMask(),
    ...(WALLETCONNECT_PROJECT_ID ? [walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      metadata: {
        name: import.meta.env.VITE_APP_NAME || 'YesCoin Web3',
        description: import.meta.env.VITE_APP_DESCRIPTION || 'YesCoin Web3 DeFi Platform',
        url: import.meta.env.VITE_APP_URL || 'https://yescoin-web3.vercel.app',
        icons: [import.meta.env.VITE_APP_ICON || 'https://yescoin-web3.vercel.app/favicon.ico']
      }
    })] : []),
  ],
  transports: {
    [bsc.id]: http(BSC_RPC_URL),
    [bscTestnet.id]: http(BSC_TESTNET_RPC_URL),
  },
});

// 导出链配置
export { bsc, bscTestnet };

// 合约地址配置
export const CONTRACTS = {
  // BSC主网合约地址
  [bsc.id]: {
    YES_TOKEN: '0x...', // YesCoin代币合约地址
    NFT_CONTRACT: '0x...', // NFT合约地址
  },
  // BSC测试网合约地址
  [bscTestnet.id]: {
    YES_TOKEN: '0x...', // 测试网代币合约地址
    NFT_CONTRACT: '0x...', // 测试网NFT合约地址
  },
};

// 获取当前网络的合约地址
export const getContractAddress = (chainId: number, contractName: 'YES_TOKEN' | 'NFT_CONTRACT') => {
  return CONTRACTS[chainId as keyof typeof CONTRACTS]?.[contractName];
};