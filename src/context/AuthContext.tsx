import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  type User,
  type AuthState,
  type LoginFormData,
  type SignupFormData,
  postRequest,
  deleteCookie,
  getRequest,
  setCookie,
  ENDPOINTS,
  API_BASE,
  getCookie,
} from '@/types';
import { createWalletWebSocket, type BalanceUpdate, type WalletConnected } from '@/services/walletWebSocket';
import type { CredentialResponse } from '@react-oauth/google';

type GoogleLoginInput = CredentialResponse | { credential?: string; idToken?: string };

interface SignUpResponse {
  state: boolean;
  message: string;
  errors: {
    email: Array<null>;
  };
}

interface AuthContextType extends AuthState {
  login: (data: LoginFormData) => Promise<string>;
  signup: (data: SignupFormData) => Promise<SignUpResponse>;
  logout: () => void;
  googleLogin: (credentialResponse: GoogleLoginInput) => Promise<void> | void;
  load?: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function unwrapResponse<T = any>(response: any): T {
  if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    return response.data as T;
  }
  return response as T;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  const walletSocketRef = useRef<ReturnType<typeof createWalletWebSocket> | null>(null);

  const getImageUrl = useCallback((path: string | undefined | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
  }, []);

  const buildUser = useCallback((profileResponse: any, balanceResponse: any, previous?: User | null): User => {
    const profile = unwrapResponse<any>(profileResponse) || {};
    const wallet = unwrapResponse<any>(balanceResponse) || {};

    return {
      id: profile.id ?? previous?.id,
      email: profile.email ?? previous?.email ?? '',
      firstName: profile.other_names ?? previous?.firstName ?? '',
      surname: profile.surname ?? previous?.surname ?? '',
      phone: profile.phone != null ? String(profile.phone) : (previous?.phone ?? ''),
      profilePicture: getImageUrl(profile.image ?? previous?.profilePicture),
      balance: wallet.balance ?? previous?.balance ?? '0',
      lockedBalance: wallet.locked_balance ?? previous?.lockedBalance ?? '0',
      availableBalance: wallet.available_balance ?? previous?.availableBalance ?? wallet.balance ?? '0',
      pin_is_set: Boolean(profile.pin_is_set ?? previous?.pin_is_set),
      referral_code: profile.referral_code ?? previous?.referral_code ?? '',
      has_DVA: Boolean(profile.has_DVA),
      dva_account: profile.has_DVA && profile.dva_account ? profile.dva_account : null,
      preference: profile.preference ?? previous?.preference,
    };
  }, [getImageUrl]);

  const applyBalanceUpdate = useCallback((message: WalletConnected | BalanceUpdate) => {
    setState((prev) => {
      if (!prev.user) return prev;

      const balance = message.balance ?? prev.user.balance;
      const lockedBalance = message.locked_balance ?? prev.user.lockedBalance;
      const availableBalance = message.available_balance ?? prev.user.availableBalance;

      return {
        ...prev,
        user: {
          ...prev.user,
          balance,
          lockedBalance,
          availableBalance,
        },
      };
    });
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getCookie('access_token');
    if (!token) return;

    try {
      const [profileResponse, balanceResponse] = await Promise.all([
        getRequest(ENDPOINTS.user),
        getRequest(ENDPOINTS.balance),
      ]);

      const profile = unwrapResponse<any>(profileResponse);
      const balance = unwrapResponse<any>(balanceResponse);

      if (!profile || typeof profile !== 'object' || !profile.email) return;

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user: buildUser(profile, balance, prev.user),
      }));
    } catch (error) {
      console.error('Failed to synchronize authenticated user state:', error);
    }
  }, [buildUser]);

  const referral = useCallback(async () => {
    const refCode = getCookie('ref');
    if (!refCode) return;

    try {
      const response = await postRequest(ENDPOINTS.referral, { referral_code: refCode });
      if (response?.success) {
        deleteCookie('ref');
        console.log('Referral applied:', response.message);
      } else {
        console.log('Referral error:', response?.error);
      }
    } catch (error) {
      console.error('Referral application failed:', error);
    }
  }, []);

  // Bootstrap authenticated state from the backend once on application start.
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      const token = getCookie('access_token');

      if (!token) {
        if (!cancelled) {
          setState({ isAuthenticated: false, user: null, loading: false });
        }
        return;
      }

      try {
        const [profileResponse, balanceResponse] = await Promise.all([
          getRequest(ENDPOINTS.user),
          getRequest(ENDPOINTS.balance),
        ]);

        const profile = unwrapResponse<any>(profileResponse);
        const balance = unwrapResponse<any>(balanceResponse);

        if (!profile?.email) {
          throw new Error('Authenticated profile was not returned by the backend.');
        }

        if (!cancelled) {
          setState({
            isAuthenticated: true,
            user: buildUser(profile, balance),
            loading: false,
          });
        }
      } catch (error) {
        console.error('Failed to load authenticated user:', error);
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [buildUser]);

  // One wallet WebSocket per authenticated application session.
  useEffect(() => {
    if (!state.isAuthenticated || !getCookie('access_token')) return;

    walletSocketRef.current?.close();
    walletSocketRef.current = createWalletWebSocket(
      API_BASE,
      applyBalanceUpdate,
      (code) => {
        if (code === 4401) {
          // Token refresh/re-authentication belongs to the existing auth flow.
          // Do not manufacture a second token system inside the WebSocket client.
          console.warn('Wallet WebSocket authentication expired. Waiting for the existing auth session to refresh.');
        }
      },
    );

    return () => {
      walletSocketRef.current?.close();
      walletSocketRef.current = null;
    };
  }, [state.isAuthenticated, applyBalanceUpdate]);

  const login = useCallback(async (data: LoginFormData) => {
    setState((prev) => ({ ...prev, loading: true }));

    deleteCookie('access_token');
    deleteCookie('refresh_token');

    try {
      const response = await postRequest(ENDPOINTS.login, data);

      if (response?.detail !== undefined) {
        setState({ isAuthenticated: false, user: null, loading: false });
        return response.detail;
      }

      if (!response?.access_token || !response?.refresh_token) {
        setState({ isAuthenticated: false, user: null, loading: false });
        return response?.message || 'Login failed. Please try again.';
      }

      if (!response?.user?.email_verified) {
        setState({ isAuthenticated: false, user: null, loading: false });
        return 'Please verify your email';
      }

      setCookie('access_token', response.access_token);
      setCookie('refresh_token', response.refresh_token);

      await referral();

      const [profileResponse, balanceResponse] = await Promise.all([
        getRequest(ENDPOINTS.user),
        getRequest(ENDPOINTS.balance),
      ]);

      const profile = unwrapResponse<any>(profileResponse);
      const balance = unwrapResponse<any>(balanceResponse);

      if (!profile?.email) {
        throw new Error('Login succeeded but the authenticated profile could not be loaded.');
      }

      setState({
        isAuthenticated: true,
        user: buildUser(profile, balance),
        loading: false,
      });

      return profile.email;
    } catch (error: any) {
      console.error('Login failed:', error);
      setState({ isAuthenticated: false, user: null, loading: false });
      return error?.message || 'Login failed. Please try again.';
    }
  }, [buildUser, referral]);

  const signup = useCallback(async (data: SignupFormData) => {
    setState((prev) => ({ ...prev, loading: true }));

    const pendingUser: User = {
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      surname: data.surname,
      balance: '0',
      lockedBalance: '0',
      availableBalance: '0',
      pin_is_set: false,
      referral_code: '',
      has_DVA: false,
      dva_account: null,
    };

    setState({ isAuthenticated: false, user: pendingUser, loading: false });

    try {
      return await postRequest(ENDPOINTS.signup, {
        email: data.email,
        phone: String(data.phone),
        other_names: data.firstName,
        surname: data.surname,
        password: data.password,
      });
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await postRequest(ENDPOINTS.logout, {});
      if (response?.state === false) {
        setState((prev) => ({ ...prev, loading: false }));
        return response.message;
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      walletSocketRef.current?.close();
      walletSocketRef.current = null;
      deleteCookie('access_token');
      deleteCookie('refresh_token');
      setState({ isAuthenticated: false, user: null, loading: false });
    }
  }, []);

  const googleLogin = useCallback(async (credentialResponse: GoogleLoginInput) => {
    setState((prev) => ({ ...prev, loading: true }));

    const redirect_uri = `${import.meta.env.VITE_BASE_URL}/dashboard`;
    const idToken = 'credential' in credentialResponse && credentialResponse.credential
      ? credentialResponse.credential
      : (credentialResponse as any).idToken || (credentialResponse as any).credential;

    if (!idToken) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const response = await postRequest(ENDPOINTS.oauthGoogle, {
        id_token: idToken,
        redirect_uri,
      });

      if (!response?.success || !response?.access_token || !response?.refresh_token) {
        setState({ isAuthenticated: false, user: null, loading: false });
        return;
      }

      setCookie('refresh_token', response.refresh_token);
      setCookie('access_token', response.access_token);

      await referral();

      const [profileResponse, balanceResponse] = await Promise.all([
        getRequest(ENDPOINTS.user),
        getRequest(ENDPOINTS.balance),
      ]);

      const profile = unwrapResponse<any>(profileResponse);
      const balance = unwrapResponse<any>(balanceResponse);

      if (!profile?.email) throw new Error('Google login succeeded but profile loading failed.');

      setState({
        isAuthenticated: true,
        user: buildUser(profile, balance),
        loading: false,
      });
    } catch (error) {
      console.error('Google login failed:', error);
      setState({ isAuthenticated: false, user: null, loading: false });
    }
  }, [buildUser, referral]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        googleLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
