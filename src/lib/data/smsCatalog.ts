export interface SMSServiceItem {
  id: string;
  name: string;
  category?: string;
  usdCost: number; // Wholesale cost in USD
  baseCost: number; // Fallback wholesale in NGN (at 1650/$)
}

// GrizzlySMS (Server 1) Services
export const GRIZZLY_SERVICES: SMSServiceItem[] = [
  { id: 'wa', name: 'WhatsApp', category: 'Messaging', usdCost: 0.45, baseCost: 750 },
  { id: 'tg', name: 'Telegram', category: 'Messaging', usdCost: 0.40, baseCost: 650 },
  { id: 'go', name: 'Google / Gmail / YouTube', category: 'Social & Search', usdCost: 0.36, baseCost: 600 },
  { id: 'oa', name: 'OpenAI / ChatGPT', category: 'AI & Developer', usdCost: 0.55, baseCost: 900 },
  { id: 'ig', name: 'Instagram & Threads', category: 'Social Media', usdCost: 0.33, baseCost: 550 },
  { id: 'tk', name: 'TikTok', category: 'Social Media', usdCost: 0.30, baseCost: 500 },
  { id: 'fb', name: 'Facebook', category: 'Social Media', usdCost: 0.36, baseCost: 600 },
  { id: 'tw', name: 'Twitter / X', category: 'Social Media', usdCost: 0.42, baseCost: 700 },
  { id: 'nf', name: 'Netflix', category: 'Entertainment', usdCost: 0.48, baseCost: 800 },
  { id: 'st', name: 'Steam', category: 'Gaming', usdCost: 0.30, baseCost: 500 },
  { id: 'ds', name: 'Discord', category: 'Gaming & Chat', usdCost: 0.33, baseCost: 550 },
  { id: 'mm', name: 'Microsoft / Outlook', category: 'Work & Productivity', usdCost: 0.36, baseCost: 600 },
];

// SMSPool (Server 2) Services
export const SMSPOOL_SERVICES: SMSServiceItem[] = [
  { id: '907', name: 'Telegram', category: 'Messaging', usdCost: 0.60, baseCost: 1000 },
  { id: '395', name: 'Google / Gmail / YouTube', category: 'Social & Search', usdCost: 0.58, baseCost: 950 },
  { id: '671', name: 'OpenAI / ChatGPT', category: 'AI & Developer', usdCost: 0.85, baseCost: 1400 },
  { id: '457', name: 'Instagram / Threads', category: 'Social Media', usdCost: 0.64, baseCost: 1050 },
  { id: '924', name: 'TikTok / Douyin', category: 'Social Media', usdCost: 0.60, baseCost: 1000 },
  { id: '329', name: 'Facebook / Meta Viewpoints', category: 'Social Media', usdCost: 0.55, baseCost: 900 },
  { id: '948', name: 'Twitter / X', category: 'Social Media', usdCost: 0.67, baseCost: 1100 },
  { id: '630', name: 'Netflix', category: 'Entertainment', usdCost: 0.73, baseCost: 1200 },
  { id: '868', name: 'Steam', category: 'Gaming', usdCost: 0.52, baseCost: 850 },
  { id: '248', name: 'Discord', category: 'Gaming & Chat', usdCost: 0.55, baseCost: 900 },
  { id: '558', name: 'Microsoft / Outlook', category: 'Work & Productivity', usdCost: 0.58, baseCost: 950 },
];
