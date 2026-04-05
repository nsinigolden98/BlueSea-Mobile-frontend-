import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
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
  API_BASE
} from '@/types';
import { useGoogleLogin} from '@react-oauth/google'
import { TOKEN } from '@/types'

 interface SignUpResponse {
    state: boolean;
   message: string;
   errors: {
     email:Array<null>;
   };
};

interface AuthContextType extends AuthState {
  login: (data: LoginFormData) => Promise<string>;
  signup: (data: SignupFormData) => Promise<SignUpResponse>;
  logout: () => void;
  googleLogin: () => void;
  load?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  const getImageUrl = (path: string | undefined | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
  };

  useEffect( () => {
    const loadUser = async () => {
    try {
      if (TOKEN !== '') {
        const get_user = await getRequest(ENDPOINTS.user);
        const get_balance = await getRequest(ENDPOINTS.balance);
      
        const user: User = {
          email: get_user.email,
          firstName: get_user.other_names,
          surname: get_user.surname,
          phone: get_user.phone,
          profilePicture: getImageUrl(get_user.image),
          balance: get_balance.balance,
          lockedBalance: get_balance.locked_balance,
          availableBalance: get_balance.available_balance,
          pin_is_set: get_user.pin_is_set,
        };
       
        setState({
          isAuthenticated: true,
          user: user,
          loading: false,
        });
      }
       else {
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    } catch (error) {
      if (TOKEN !== '') {
        setState(prev => ({ ...prev, loading: false }));
      } else {
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
      console.log(error)
    }
  }
  loadUser()
       
  },[]);
  
  const login = useCallback(async (_data: LoginFormData) => {
    setState(prev => ({ ...prev, loading: true }));

    deleteCookie('access_token')
    deleteCookie('refresh_token')
    const response = await postRequest(ENDPOINTS.login, _data)
    if (response.detail === undefined) {
      if (response.user.email_verified) {
        setCookie('access_token',response.access_token);
        setCookie('refresh_token', response.refresh_token); 
        
        const get_user = await getRequest(ENDPOINTS.user);
        const get_balance = await getRequest(ENDPOINTS.balance);
        const user: User = {
          id: response.user.id,
          email: get_user.email,
          firstName: get_user.other_names,
          surname: get_user.surname,
          phone: get_user.phone,
          profilePicture: getImageUrl(get_user.image),
          balance: get_balance.balance,
          pin_is_set: get_user.pin_is_set
        }; 
        setState({
          isAuthenticated: true,
          user: user,
          loading: false,
        });
        window.location.reload();
        return user; // Return user on success
      } else {
        setState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
        return "Please verify your email";
      }
    } else {
      setState({
        isAuthenticated: false,
        user: null,
        loading: false,
      });
      return response.detail;
    }
  }, []);

  const signup = useCallback(async (data: SignupFormData) => {
    setState(prev => ({ ...prev, loading: true }));

    const user: User = {
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      surname: data.surname,
      balance: "0",
      pin_is_set: false,
    }
    setState({
        isAuthenticated: false,
        user: user,
        loading: false,
           });
    const payload = {
      email: data.email,
      phone: String(data.phone),
      other_names: data.firstName,
      surname: data.surname,
      password: data.surname
    };
    const response = await postRequest(ENDPOINTS.signup, payload);
    return response
    
  }, []);

  const logout = useCallback(async () => {
      setState(prev => ({ ...prev, loading: true }));
    
    const response =  await postRequest(ENDPOINTS.logout, {});
    if(response.state){
    deleteCookie("access_token");
    deleteCookie("refresh_token");
    setState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });
    window.location.reload();
    }else{
        return response.message
    }
    
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse: any) => {
      setState(prev => ({ ...prev, loading: true }));
      const redirect_uri = `${import.meta.env.VITE_BASE_URL}/dashboard`;
      const response = await postRequest(ENDPOINTS.oauthGoogle, {
       id_token: credentialResponse.credential,
        redirect_uri
      });
      console.log(credentialResponse);
      console.log(response);
      if (response.success) {
          setCookie('refresh_token', response.refresh_token);
        setCookie('access_token', response.access_token);
        const get_user = await getRequest(ENDPOINTS.user);
        const get_balance = await getRequest(ENDPOINTS.balance);

        const user: User = {
          id: get_user.id,
          email: get_user.email,
          firstName: get_user.other_names,
          surname: get_user.surname,
          phone: get_user.phone,
          profilePicture: getImageUrl(get_user.image),
          balance: get_balance.balance,
          pin_is_set: get_user.pin_is_set,
        }; 
        setState({
          isAuthenticated: true,
          user: user,
          loading: false,
        });
        window.location.reload()
        
      }
      else{
          setState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
      }
    }, 

  });

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        googleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


