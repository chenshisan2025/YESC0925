import { createConfig, http } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

// TypeScript声明合并，注册config类型
declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

export const config = createConfig({
  chains: [bsc, bscTestnet],
  connectors: [
    metaMask(),
  ],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
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