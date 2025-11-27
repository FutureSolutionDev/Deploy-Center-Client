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
import type { ILoginCredentials } from "@/types";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { Login } = useAuth();
  const { t } = useLanguage();

  const [Credentials, setCredentials] = useState<ILoginCredentials>({
    Username: "",
    Password: "",
  });

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

    // Validation
    if (!Credentials.Username.trim()) {
      setError(t("auth.usernameRequired"));
      return;
    }

    if (!Credentials.Password) {
      setError(t("auth.passwordRequired"));
      return;
    }

    try {
      setLoading(true);
      await Login(Credentials);
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
  };

  const HandleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        height: "100%",
        minWidth: "100dvh",
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
