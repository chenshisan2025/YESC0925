// 全局类型定义
export interface User {
  id: string;
  wallet_address: string;
  username?: string;
  total_rewards: number;
  referral_code?: string;
  created_at: string;
}

export interface NFTCollection {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price_bnb: number;
  total_supply: number;
  minted_count: number;
  is_active: boolean;
}

export interface NFTMint {
  id: string;
  user_id: string;
  collection_id: string;
  token_id: number;
  tx_hash: string;
  minted_at: string;
  price_paid: number;
}

export interface AirdropTask {
  id: string;
  task_type: 'twitter_follow' | 'twitter_retweet' | 'telegram_join';
  title: string;
  description?: string;
  reward_amount: number;
  is_active: boolean;
}

export interface UserTask {
  id: string;
  user_id: string;
  task_id: string;
  status: 'pending' | 'completed' | 'verified';
  proof_url?: string;
  completed_at?: string;
  reward_claimed: number;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  totalSupply: string;
  currentPrice: number;
  marketCap: number;
  holders: number;
  circulatingSupply: string;
}

export interface Language {
  code: 'zh' | 'en';
  name: string;
}

export interface Translation {
  [key: string]: {
    zh: string;
    en: string;
  };
}