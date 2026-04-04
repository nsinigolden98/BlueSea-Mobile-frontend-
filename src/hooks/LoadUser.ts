import {ENDPOINTS,API_BASE,getRequest, type User, type AuthState } from '@/types';
import { useState, useEffect} from 'react';
import { TransactionsData } from '@/data';

const getImageUrl = (path: string | undefined | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
};

export function useLoadUser() {
  const [newState,setState] = useState<AuthState>({
    isAuthenticated: false,
    user:null,
    loading: false,
  });
  useEffect(() => {
    const load = async () => {
      setState(prev => ({ ...prev, loading: true }));
  
      try {
        const [get_user, get_balance, transaction] = await Promise.all([
          getRequest(ENDPOINTS.user),
          getRequest(ENDPOINTS.balance),
          TransactionsData()
        ]);
        const user: User = {
          email: get_user.email,
          firstName: get_user.other_names,
          surname: get_user.surname,
          phone: get_user.phone,
          profilePicture: getImageUrl(get_user.image),
          balance: get_balance.balance,
          pin_is_set: get_user.pin_is_set,
          transactions: transaction,
        };
       
        setState({
          isAuthenticated: true,
          user: user,
          loading: false,
        });
      } catch (error) {
        console.log(error)
        setState(prev => ({ ...prev, loading: false, isAuthenticated: false }));
      };
       
    };
    load();
  }, []);
 
  return {newState};
}
