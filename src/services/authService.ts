/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import ApiInstance from './api';
import type {
  ILoginCredentials,
  IRegisterData,
  IAuthResponse,
  IUser,
  IApiResponse,
  ITwoFactorChallenge
} from '@/types';

class AuthService {
  /**
   * Login user with credentials
   */
  async Login(credentials: ILoginCredentials): Promise<IAuthResponse | ITwoFactorChallenge> {
    const response = await ApiInstance.post<IApiResponse<IAuthResponse & Partial<ITwoFactorChallenge>>>(
      '/auth/login',
      credentials
    );

    const data = response.data.Data;

    if (data?.TwoFactorRequired) {
      const challenge: ITwoFactorChallenge = {
        TwoFactorRequired: true,
        UserId: (data as any).UserId,
        Username: (data as any).Username,
      };
      return challenge;
    }

    if (data?.User) {
      return data as IAuthResponse;
    }

    throw new Error(response.data.Message || 'Login failed');
  }

  /**
   * Register new user
   */
  async Register(data: IRegisterData): Promise<IAuthResponse> {
    const response = await ApiInstance.post<IApiResponse<IAuthResponse>>(
      '/auth/register',
      data
    );

    if (response.data.Data) {
      return response.data.Data;
    }

    throw new Error(response.data.Message || 'Registration failed');
  }

  /**
   * Get current user profile
   */
  async GetProfile(): Promise<IUser> {
    const response = await ApiInstance.get<IApiResponse<IUser>>('/auth/profile');

    if (response.data.Data) {
      return response.data.Data;
    }

    throw new Error(response.data.Message || 'Failed to get profile');
  }

  /**
   * Logout user
   */
  async Logout(): Promise<void> {
    await ApiInstance.post('/auth/logout');
  }

  /**
   * Refresh access token
   * Note: Server prefers refresh_token from httpOnly cookie
   * Body parameter is fallback for backward compatibility
   */
  async RefreshToken(refreshToken?: string): Promise<void> {
    const payload = refreshToken ? { RefreshToken: refreshToken } : {};
    const response = await ApiInstance.post<IApiResponse<void>>(
      '/auth/refresh',
      payload
    );

    // Check for success (some APIs return different response structures)
    if (response.data.Success === false) {
      throw new Error(response.data.Message || 'Token refresh failed');
    }
  }

  /**
   * Verify 2FA code
   */
  async Verify2FA(userId: number, code: string): Promise<IAuthResponse> {
    const response = await ApiInstance.post<IApiResponse<IAuthResponse>>(
      '/auth/verify-2fa',
      { UserId: userId, Code: code }
    );

    if (response.data.Data) {
      return response.data.Data;
    }

    throw new Error(response.data.Message || '2FA verification failed');
  }
}

export default new AuthService();
