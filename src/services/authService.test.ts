import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";

const post = vi.fn();
vi.mock("./api", () => ({ default: { post: (...args: unknown[]) => post(...args) } }));

import AuthService, { AuthApiError } from "./authService";

describe("AuthService 2FA (SEC-C3)", () => {
  beforeEach(() => {
    post.mockReset();
  });

  it("Verify2FA sends only the code; the user comes from the mfa_pending cookie", async () => {
    post.mockResolvedValue({ data: { Data: { User: { Id: 1 }, SessionId: 2 } } });
    await AuthService.Verify2FA(" 123456 ");
    expect(post).toHaveBeenCalledWith("/auth/verify-2fa", { Code: "123456" });
  });

  it("Login challenge does not expose a user id", async () => {
    post.mockResolvedValue({
      data: { Data: { TwoFactorRequired: true, Username: "alice", ExpiresInSeconds: 300 } },
    });
    const result = await AuthService.Login({ Username: "alice", Password: "pw" });
    expect(result).toEqual({ TwoFactorRequired: true, Username: "alice", ExpiresInSeconds: 300 });
    expect("UserId" in result).toBe(false);
  });

  it("Verify2FA surfaces the server message and status", async () => {
    const config = { headers: new AxiosHeaders() };
    post.mockRejectedValue(
      new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
        status: 429,
        statusText: "Too Many Requests",
        headers: {},
        config,
        data: { Message: "Too many failed two-factor attempts. Try again later." },
      })
    );
    const error = await AuthService.Verify2FA("000000").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(AuthApiError);
    expect((error as AuthApiError).Status).toBe(429);
    expect((error as AuthApiError).message).toMatch(/two-factor/);
  });
});
