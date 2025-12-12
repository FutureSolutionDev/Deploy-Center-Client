/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 * Uses secure httpOnly cookies for token storage
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AuthService from '@/services/authService';
import type {
  IUser,
  ILoginCredentials,
  IRegisterData,
  IAuthResponse,
  ITwoFactorChallenge,
} from '@/types';

interface IAuthContextValue {
  User: IUser | null;
  IsAuthenticated: boolean;
  IsLoading: boolean;
  Login: (credentials: ILoginCredentials) => Promise<IAuthResponse | ITwoFactorChallenge>;
  Verify2FA: (userId: number, code: string) => Promise<IAuthResponse>;
  Register: (data: IRegisterData) => Promise<void>;
  Logout: () => Promise<void>;
  RefreshUser: () => Promise<void>;
}

const AuthContext = createContext<IAuthContextValue | undefined>(undefined);

interface IAuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<IAuthProviderProps> = ({ children }) => {
  const [User, setUser] = useState<IUser | null>(null);
  const [IsLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state by checking if user is authenticated via cookie
  useEffect(() => {
    const InitializeAuth = async () => {
      try {
        // Try to fetch profile - if cookie exists and valid, this will succeed
        const profile = await AuthService.GetProfile();
        setUser(profile);
      } catch (_error: unknown) {
        // No valid cookie or session - user is not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    InitializeAuth();
  }, []);

  const Login = async (credentials: ILoginCredentials): Promise<IAuthResponse | ITwoFactorChallenge> => {
    try {
      const response = await AuthService.Login(credentials);

      // Cookie is set automatically by the backend (httpOnly)
      // We only need to update the user state
      if ('User' in response) {
        setUser(response.User);
      }
      // For 2FA, don't update user state - wait for verification
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const Verify2FA = async (userId: number, code: string): Promise<IAuthResponse> => {
    try {
      setIsLoading(true);
      const response = await AuthService.Verify2FA(userId, code);
      setUser(response.User);
      return response;
    } catch (error) {
      console.error('2FA verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const Register = async (data: IRegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await AuthService.Register(data);

      // Cookie is set automatically by the backend (httpOnly)
      // We only need to update the user state
      setUser(response.User);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const Logout = async (): Promise<void> => {
    try {
      // Call logout API endpoint to clear cookies on server-side
      await AuthService.Logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear user state regardless of API response
      setUser(null);
    }
  };

  const RefreshUser = async (): Promise<void> => {
    try {
      const profile = await AuthService.GetProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If profile fetch fails, user is likely not authenticated anymore
      setUser(null);
      throw error;
    }
  };

  const value: IAuthContextValue = {
    User,
    IsAuthenticated: !!User,
    IsLoading,
    Login,
    Verify2FA,
    Register,
    Logout,
    RefreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): IAuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
