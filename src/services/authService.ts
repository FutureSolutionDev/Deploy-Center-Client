/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { isAxiosError } from "axios";
import ApiInstance from "./api";
import type {
  ILoginCredentials,
  IRegisterData,
  IAuthResponse,
  IUser,
  IApiResponse,
  ITwoFactorChallenge,
} from "@/types";

/** Error carrying the server's message and HTTP status. */
export class AuthApiError extends Error {
  public readonly Status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "AuthApiError";
    this.Status = status;
  }
}

const ToAuthError = (error: unknown, fallback: string): AuthApiError => {
  if (isAxiosError<{ Message?: string }>(error)) {
    return new AuthApiError(
      error.response?.data?.Message || fallback,
      error.response?.status
    );
  }
  return new AuthApiError(error instanceof Error ? error.message : fallback);
};

class AuthService {
  /**
   * Login user with credentials
   */
  public async Login(
    credentials: ILoginCredentials
  ): Promise<IAuthResponse | ITwoFactorChallenge> {
    const response = await ApiInstance.post<
      IApiResponse<IAuthResponse & Partial<ITwoFactorChallenge>>
    >("/auth/login", credentials);

    const data = response.data.Data;

    if (data?.TwoFactorRequired) {
      const challenge: ITwoFactorChallenge = {
        TwoFactorRequired: true,
        Username: data.Username ?? credentials.Username,
        ExpiresInSeconds: data.ExpiresInSeconds,
      };
      return challenge;
    }

    if (data?.User) {
      return data as IAuthResponse;
    }

    throw new Error(response.data.Message || "Login failed");
  }

  /**
   * Register new user
   */
  public async Register(data: IRegisterData): Promise<IAuthResponse> {
    const response = await ApiInstance.post<IApiResponse<IAuthResponse>>(
      "/auth/register",
      data
    );

    if (response.data.Data) {
      return response.data.Data;
    }

    throw new Error(response.data.Message || "Registration failed");
  }

  /**
   * Get current user profile
   */
  public async GetProfile(): Promise<IUser | { User: IUser }> {
    const response = await ApiInstance.get<IApiResponse<IUser | { User: IUser }>>(
      "/auth/profile"
    );

    if (response.data.Data) {
      return response.data.Data;
    }

    throw new Error(response.data.Message || "Failed to get profile");
  }

  /**
   * Logout user
   */
  public async Logout(): Promise<void> {
    await ApiInstance.post("/auth/logout");
  }

  /**
   * Refresh access token
   * Note: Server prefers refresh_token from httpOnly cookie
   * Body parameter is fallback for backward compatibility
   */
  public async RefreshToken(refreshToken?: string): Promise<void> {
    const payload = refreshToken ? { RefreshToken: refreshToken } : {};
    const response = await ApiInstance.post<IApiResponse<void>>(
      "/auth/refresh",
      payload
    );

    // If server signals error via message/code, throw
    if (
      response.data?.Message &&
      response.data.Code &&
      response.data.Code >= 400
    ) {
      throw new Error(response.data.Message || "Token refresh failed");
    }
  }

  /**
   * Verify 2FA code. The server identifies the user from the httpOnly
   * `mfa_pending` cookie set by Login, so only the code is sent.
   */
  public async Verify2FA(code: string): Promise<IAuthResponse> {
    try {
      const response = await ApiInstance.post<IApiResponse<IAuthResponse>>(
        "/auth/verify-2fa",
        { Code: code.trim() }
      );

      if (response.data.Data) {
        return response.data.Data;
      }

      throw new AuthApiError(response.data.Message || "2FA verification failed");
    } catch (error) {
      throw ToAuthError(error, "2FA verification failed");
    }
  }
}
export default new AuthService();
