// NEW - Gas费估算Hook
import { useState, useEffect } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { getContractAddress } from '../lib/contracts';

interface GasEstimateParams {
  contractAddress?: string;
  functionName?: string;
  args?: any[];
  value?: bigint;
  enabled?: boolean;
}

interface GasEstimateResult {
  gasLimit: bigint | null;
  gasPrice: bigint | null;
  totalCost: bigint | null;
  totalCostFormatted: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useGasEstimate = ({
  contractAddress,
  functionName,
  args = [],
  value = 0n,
  enabled = true
}: GasEstimateParams): GasEstimateResult => {
  const [gasLimit, setGasLimit] = useState<bigint | null>(null);
  const [gasPrice, setGasPrice] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (!enabled || !isConnected || !address || !publicClient || !contractAddress || !functionName) {
      return;
    }

    const estimateGas = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 获取当前Gas价格
        const currentGasPrice = await publicClient.getGasPrice();
        setGasPrice(currentGasPrice);

        // 估算Gas限制
        const estimatedGas = await publicClient.estimateContractGas({
          address: contractAddress as `0x${string}`,
          abi: [], // 这里需要根据具体合约传入ABI
          functionName,
          args,
          account: address,
          value
        });

        // 添加10%的缓冲
        const gasWithBuffer = (estimatedGas * 110n) / 100n;
        setGasLimit(gasWithBuffer);
      } catch (err) {
        console.error('Gas estimation failed:', err);
        setError('Gas费估算失败');
        
        // 设置默认值
        try {
          const currentGasPrice = await publicClient.getGasPrice();
          setGasPrice(currentGasPrice);
          setGasLimit(21000n); // 默认Gas限制
        } catch {
          setGasPrice(parseEther('0.000000005')); // 5 Gwei 默认
          setGasLimit(21000n);
        }
      } finally {
        setIsLoading(false);
      }
    };

    estimateGas();
  }, [enabled, isConnected, address, publicClient, contractAddress, functionName, JSON.stringify(args), value]);

  const totalCost = gasLimit && gasPrice ? gasLimit * gasPrice : null;
  const totalCostFormatted = totalCost ? formatEther(totalCost) : null;

  return {
    gasLimit,
    gasPrice,
    totalCost,
    totalCostFormatted,
    isLoading,
    error
  };
};

// 预设的Gas估算值
export const GAS_ESTIMATES = {
  TOKEN_TRANSFER: 21000n,
  TOKEN_APPROVE: 46000n,
  TOKEN_CLAIM: 65000n,
  NFT_MINT: 85000n,
  NFT_TRANSFER: 75000n,
  CONTRACT_INTERACTION: 100000n
} as const;

// 获取预设Gas估算
export const usePresetGasEstimate = (operation: keyof typeof GAS_ESTIMATES) => {
  const [gasPrice, setGasPrice] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const publicClient = usePublicClient();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected || !publicClient) return;

    const fetchGasPrice = async () => {
      setIsLoading(true);
      try {
        const currentGasPrice = await publicClient.getGasPrice();
        setGasPrice(currentGasPrice);
      } catch (err) {
        console.error('Failed to fetch gas price:', err);
        setGasPrice(parseEther('0.000000005')); // 5 Gwei 默认
      } finally {
        setIsLoading(false);
      }
    };

    fetchGasPrice();
  }, [isConnected, publicClient]);

  const gasLimit = GAS_ESTIMATES[operation];
  const totalCost = gasLimit && gasPrice ? gasLimit * gasPrice : null;
  const totalCostFormatted = totalCost ? formatEther(totalCost) : null;

  return {
    gasLimit,
    gasPrice,
    totalCost,
    totalCostFormatted,
    isLoading
  };
};