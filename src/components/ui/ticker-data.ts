import { 
  Zap, 
  Gift, 
  ShoppingBag, 
  Clock, 
  Users, 
  CreditCard, 
  Ticket, 
  Globe 
} from 'lucide-react';
import React from 'react';

export type TickerCategory = 
  | 'feature' 
  | 'reward' 
  | 'marketplace' 
  | 'upcoming' 
  | 'campaigns' 
  | 'social' 
  | 'payments' 
  | 'tickets';

export interface TickerItem {
  id: string;
  text: string;
  icon: React.ElementType;
  accentColor: string;
  category: TickerCategory;
  badge?: string;
  upcoming: boolean;
  priority: number;
}

export const TICKER_ITEMS: TickerItem[] = [
  {
    id: '1',
    text: 'Cross-border transfers to 50+ countries now live',
    icon: Globe,
    accentColor: '#3b82f6',
    category: 'payments',
    badge: 'LIVE',
    upcoming: false,
    priority: 1,
  },
  {
    id: '2',
    text: 'BlueSea Hotels arriving Summer 2026',
    icon: Clock,
    accentColor: '#8b5cf6',
    category: 'upcoming',
    badge: 'COMING SOON',
    upcoming: true,
    priority: 2,
  },
  {
    id: '3',
    text: 'Earn 5% cashback on all Marketplace purchases',
    icon: Gift,
    accentColor: '#f59e0b',
    category: 'reward',
    badge: 'PROMO',
    upcoming: false,
    priority: 1,
  },
  {
    id: '4',
    text: 'Creator monetization tools launching next month',
    icon: Zap,
    accentColor: '#10b981',
    category: 'upcoming',
    badge: 'BETA',
    upcoming: true,
    priority: 2,
  },
  {
    id: '5',
    text: 'New exclusive BlueSea NFT drop in the Marketplace',
    icon: ShoppingBag,
    accentColor: '#ec4899',
    category: 'marketplace',
    badge: 'NEW',
    upcoming: false,
    priority: 1,
  },
  {
    id: '6',
    text: 'Flight booking system integration in progress',
    icon: Clock,
    accentColor: '#6366f1',
    category: 'upcoming',
    badge: 'SOON',
    upcoming: true,
    priority: 3,
  },
  {
    id: '7',
    text: 'Join the BlueSea Community Discord for exclusive alpha',
    icon: Users,
    accentColor: '#4f46e5',
    category: 'social',
    badge: 'COMMUNITY',
    upcoming: false,
    priority: 2,
  },
  {
    id: '8',
    text: 'Global Concert Tickets now available in-app',
    icon: Ticket,
    accentColor: '#ef4444',
    category: 'tickets',
    badge: 'HOT',
    upcoming: false,
    priority: 1,
  },
  {
    id: '9',
    text: 'Virtual BlueSea Debit Cards are now rolling out',
    icon: CreditCard,
    accentColor: '#06b6d4',
    category: 'payments',
    badge: 'UPDATE',
    upcoming: false,
    priority: 1,
  }
];

/**
 * Shuffles items intelligently to avoid immediate repetitions 
 * and ensure different users see different initial views.
 */
export const getShuffledTickerData = (): TickerItem[] => {
  return [...TICKER_ITEMS].sort(() => Math.random() - 0.5);
};
