import { createContext } from 'react';
import { RefreshContextType } from './types';

export const RefreshContext = createContext<RefreshContextType | null>(null);