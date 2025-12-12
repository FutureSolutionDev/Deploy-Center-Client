/**
 * Login Page
 * User authentication page with login form
 */

import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Link,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ILoginCredentials, ITwoFactorChallenge } from "@/types";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { Login, Verify2FA } = useAuth();
  const { t } = useLanguage();

  const [Credentials, setCredentials] = useState<ILoginCredentials>({
    Username: "",
    Password: "",
    TotpCode: "",
  });
  const [RequireTotp, setRequireTotp] = useState(false);
  const [PendingUserId, setPendingUserId] = useState<number | null>(null);
  const [Info, setInfo] = useState<string | null>(null);

  const [ShowPassword, setShowPassword] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [Error, setError] = useState<string | null>(null);

  const HandleChange =
    (field: keyof ILoginCredentials) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials((prev) => ({
          ...prev,
          [field]: event.target.value,
        }));
        setError(null);
      };

  const HandleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    // Validation
    if (!Credentials.Username.trim()) {
      setError(t("auth.usernameRequired"));
      return;
    }

    if (!Credentials.Password) {
      setError(t("auth.passwordRequired"));
      return;
    }

    if (RequireTotp) {
      if (!Credentials.TotpCode) {
        setError(t("auth.totpRequired"));
        return;
      }

      if (!PendingUserId) {
        setError(t("auth.loginFailed"));
        return;
      }

      try {
        setLoading(true);
        await Verify2FA(PendingUserId, Credentials.TotpCode);
        navigate("/dashboard");
      } catch (error: unknown) {
        const errorMessage =
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : t("auth.loginFailed");

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const response = await Login(Credentials);

      if ("TwoFactorRequired" in response && response.TwoFactorRequired) {
        const challenge = response as ITwoFactorChallenge;
        setRequireTotp(true);
        setPendingUserId(challenge.UserId);
        setInfo(t("auth.totpPrompt"));
        setError(null);
        return;
      }

      navigate("/dashboard");
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : t("auth.loginFailed");

      const lower = errorMessage.toLowerCase();
      if (lower.includes("two-factor") || lower.includes("2fa")) {
        setRequireTotp(true);
        setInfo(t("auth.totpPrompt"));
        setError(null);
        return;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const HandleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        width: "100dvw",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: "100%",
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {t("app.name")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("auth.loginSubtitle")}
            </Typography>
          </Box>

          {Error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {Error}
            </Alert>
          )}
          {Info && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {Info}
            </Alert>
          )}

          <form onSubmit={HandleSubmit}>
            <TextField
              fullWidth
              label={t("auth.username")}
              value={Credentials.Username}
              onChange={HandleChange("Username")}
              margin="normal"
              autoComplete="username"
              autoFocus
              disabled={Loading}
            />

            <TextField
              fullWidth
              label={t("auth.password")}
              type={ShowPassword ? "text" : "password"}
              value={Credentials.Password}
              onChange={HandleChange("Password")}
              margin="normal"
              autoComplete="current-password"
              disabled={Loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={HandleTogglePassword}
                      edge="end"
                      disabled={Loading}
                    >
                      {ShowPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {RequireTotp && (
              <TextField
                fullWidth
                label={t("auth.totpCode")}
                value={Credentials.TotpCode || ""}
                onChange={HandleChange("TotpCode")}
                margin="normal"
                autoComplete="one-time-code"
                disabled={Loading}
              />
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={Loading}
              startIcon={
                Loading ? <CircularProgress size={20} /> : <LoginIcon />
              }
              sx={{ mt: 3, mb: 2 }}
            >
              {Loading ? t("auth.loggingIn") : t("auth.login")}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {t("auth.noAccount")}{" "}
                <Link component={RouterLink} to="/register" underline="hover">
                  {t("auth.register")}
                </Link>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};
