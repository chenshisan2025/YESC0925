// 合约工具函数和hooks
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useAccount } from 'wagmi';
import { Address, formatEther, parseEther } from 'viem';
import { bsc, bscTestnet, getContractAddress } from '../wagmi';
import { YesCoinTokenABI, YESCOIN_TOKEN_INFO } from './YesCoinToken';
import { YesCoinNFTABI, YESCOIN_NFT_INFO } from './YesCoinNFT';
// 导出所有合约相关内容
export * from './YesCoinToken';
export * from './YesCoinNFT';
export { getContractAddress } from '../wagmi';

// 代币相关hooks
export function useTokenBalance(address?: Address) {
  const chainId = useChainId();
  return useReadContract({
    address: getContractAddress(chainId, 'YES_TOKEN') as Address,
    abi: YesCoinTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useTokenInfo() {
  const chainId = useChainId();
  const tokenAddress = getContractAddress(chainId, 'YES_TOKEN') as Address;
  
  const { data: name } = useReadContract({
    address: tokenAddress,
    abi: YesCoinTokenABI,
    functionName: 'name',
  });

  const { data: symbol } = useReadContract({
    address: tokenAddress,
    abi: YesCoinTokenABI,
    functionName: 'symbol',
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: YesCoinTokenABI,
    functionName: 'decimals',
  });

  const { data: totalSupply } = useReadContract({
    address: tokenAddress,
    abi: YesCoinTokenABI,
    functionName: 'totalSupply',
  });

  return {
    name: name || YESCOIN_TOKEN_INFO.name,
    symbol: symbol || YESCOIN_TOKEN_INFO.symbol,
    decimals: decimals || YESCOIN_TOKEN_INFO.decimals,
    totalSupply: totalSupply ? formatEther(totalSupply) : YESCOIN_TOKEN_INFO.totalSupply,
  };
}

export function useAirdropInfo(address?: Address) {
  const chainId = useChainId();
  const tokenAddress = getContractAddress(chainId, 'YES_TOKEN') as Address;
  
  const { data: isClaimed } = useReadContract({
    address: tokenAddress,
    abi: YesCoinTokenABI,
    functionName: 'isAirdropClaimed',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const { data: airdropAmount } = useReadContract({
    address: tokenAddress,
    abi: YesCoinTokenABI,
    functionName: 'getAirdropAmount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    isClaimed: isClaimed || false,
    amount: airdropAmount ? formatEther(airdropAmount) : YESCOIN_TOKEN_INFO.airdropAmount,
  };
}

export function useClaimAirdrop() {
  const chainId = useChainId();
  const { address: account } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  // 获取当前链对象
  const currentChain = chainId === bsc.id ? bsc : bscTestnet;
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimAirdrop = () => {
    writeContract({
      address: getContractAddress(chainId, 'YES_TOKEN') as Address,
      abi: YesCoinTokenABI,
      functionName: 'claimAirdrop',
      account,
      chain: currentChain,
    });
  };

  return {
    claimAirdrop,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// NFT相关hooks
export function useNFTBalance(address?: Address) {
  const chainId = useChainId();
  return useReadContract({
    address: getContractAddress(chainId, 'NFT_CONTRACT') as Address,
    abi: YesCoinNFTABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useNFTInfo() {
  const chainId = useChainId();
  const nftAddress = getContractAddress(chainId, 'NFT_CONTRACT') as Address;
  
  const { data: name } = useReadContract({
    address: nftAddress,
    abi: YesCoinNFTABI,
    functionName: 'name',
  });

  const { data: symbol } = useReadContract({
    address: nftAddress,
    abi: YesCoinNFTABI,
    functionName: 'symbol',
  });

  const { data: totalSupply } = useReadContract({
    address: nftAddress,
    abi: YesCoinNFTABI,
    functionName: 'totalSupply',
  });

  return {
    name: name || YESCOIN_NFT_INFO.name,
    symbol: symbol || YESCOIN_NFT_INFO.symbol,
    totalSupply: totalSupply ? Number(totalSupply) : 0,
  };
}

export function useNFTSeriesInfo(seriesId: number) {
  const chainId = useChainId();
  const nftAddress = getContractAddress(chainId, 'NFT_CONTRACT') as Address;
  
  const { data: seriesInfo } = useReadContract({
    address: nftAddress,
    abi: YesCoinNFTABI,
    functionName: 'getSeriesInfo',
    args: [BigInt(seriesId)],
  });

  const { data: mintPrice } = useReadContract({
    address: nftAddress,
    abi: YesCoinNFTABI,
    functionName: 'getMintPrice',
    args: [BigInt(seriesId)],
  });

  if (seriesInfo && mintPrice) {
    return {
      name: seriesInfo[0],
      maxSupply: Number(seriesInfo[1]),
      currentSupply: Number(seriesInfo[2]),
      price: formatEther(seriesInfo[3]),
      isActive: seriesInfo[4],
      mintPrice: formatEther(mintPrice),
    };
  }

  // 返回默认信息
  const defaultSeries = YESCOIN_NFT_INFO.defaultSeries.find(s => s.id === seriesId);
  return defaultSeries ? {
    name: defaultSeries.name,
    maxSupply: defaultSeries.maxSupply,
    currentSupply: 0,
    price: defaultSeries.price,
    isActive: true,
    mintPrice: defaultSeries.price,
  } : null;
}

export function useUserNFTs(address?: Address) {
  const chainId = useChainId();
  return useReadContract({
    address: getContractAddress(chainId, 'NFT_CONTRACT') as Address,
    abi: YesCoinNFTABI,
    functionName: 'getTokensByOwner',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}

export function useMintNFT() {
  const chainId = useChainId();
  const { address: account } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  // 获取当前链对象
  const currentChain = chainId === bsc.id ? bsc : bscTestnet;
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintNFT = (seriesId: number, amount: number = 1) => {
    const nftAddress = getContractAddress(chainId, 'NFT_CONTRACT') as Address;
    const seriesInfo = YESCOIN_NFT_INFO.defaultSeries.find(s => s.id === seriesId);
    if (!seriesInfo) {
      throw new Error('Invalid series ID');
    }

    const totalPrice = parseEther((parseFloat(seriesInfo.price) * amount).toString());

    if (amount === 1) {
      writeContract({
        address: nftAddress,
        abi: YesCoinNFTABI,
        functionName: 'mint',
        args: [nftAddress, BigInt(seriesId), ''],
        value: totalPrice,
        account,
        chain: currentChain,
      });
    } else {
      writeContract({
        address: nftAddress,
        abi: YesCoinNFTABI,
        functionName: 'batchMint',
        args: [BigInt(seriesId), BigInt(amount)],
        value: totalPrice,
        account,
        chain: currentChain,
      });
    }
  };

  return {
    mintNFT,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// 工具函数
export function formatTokenAmount(amount: bigint | string, decimals: number = 18): string {
  if (typeof amount === 'string') {
    return amount;
  }
  return formatEther(amount);
}

export function parseTokenAmount(amount: string): bigint {
  return parseEther(amount);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function calculateNFTPrice(seriesId: number, amount: number): string {
  const seriesInfo = YESCOIN_NFT_INFO.defaultSeries.find(s => s.id === seriesId);
  if (!seriesInfo) return '0';
  
  return (parseFloat(seriesInfo.price) * amount).toString();
}

// 错误处理工具
export function getErrorMessage(error: any): string {
  if (error?.message) {
    if (error.message.includes('User rejected')) {
      return '用户取消了交易';
    }
    if (error.message.includes('insufficient funds')) {
      return '余额不足';
    }
    if (error.message.includes('execution reverted')) {
      return '合约执行失败';
    }
    return error.message;
  }
  return '未知错误';
}