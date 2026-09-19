import api from './client';

export interface TradingBot {
  id: string;
  name: string;
  description: string;
  symbol: string;
  strategy: string;
  interval: string;
  isActive: boolean;
  isPremium: boolean;
}

export interface BotSubscription {
  id: string;
  amount: string;
  period: '5m' | '15m' | '30m' | '24h';
  isActive: boolean;
  nextRunAt: string;
  bot: TradingBot;
}

export interface TradingBotAnalysis {
  symbol: string;
  interval: string;
  strategy: string;
  direction: 'rise' | 'fall';
  generatedAt: string;
  latestPrice: number;
  movingAverage: number;
  momentumPercent: number;
  candles: Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
}

export interface PremiumAccess {
  hasPremiumAccess: boolean;
  payment: {
    transactionHash: string;
    amount: string;
    status: string;
    verifiedAt: string;
    blockTimestamp: string;
  } | null;
}

export interface PremiumPaymentInfo {
  amount: number;
  asset: 'USDT';
  network: 'TRC20';
  treasuryAddress: string;
}

export const tradingBotsApi = {
  list: () => api.get<TradingBot[]>('/trading-bots'),
  analysis: (id: string, limit = 50) =>
    api.get<TradingBotAnalysis>(`/trading-bots/${id}/analysis`, { params: { limit } }),
  getPremiumAccess: () => api.get<PremiumAccess>('/trading-bots/premium-access'),
  getPremiumPaymentInfo: () => api.get<PremiumPaymentInfo>('/trading-bots/premium-payment-info'),
  verifyPremiumPayment: (transactionHash: string) =>
    api.post('/trading-bots/premium-payment', { transactionHash }),
  getBotSubscriptionStatus: (botId: string) =>
    api.get<{ botId: string; isSubscribed: boolean; status: string; subscription: BotSubscription | null }>(
      `/trading-bots/subscriptions/bot/${botId}`,
    ),
  listSubscriptions: () => api.get<BotSubscription[]>('/trading-bots/subscriptions'),
  subscribe: (data: { botId: string; Amount: string; Period: BotSubscription['period'] }) =>
    api.post<BotSubscription>('/trading-bots/subscriptions', data),
  stop: (id: string) => api.delete(`/trading-bots/subscriptions/${id}`),
};