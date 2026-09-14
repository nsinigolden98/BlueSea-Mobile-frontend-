import { createContext } from 'react';
import type { RefreshContextType } from './types';

export const RefreshContext = createContext<RefreshContextType | null>(null);