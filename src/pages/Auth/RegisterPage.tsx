/**
 * Register Page
 * User registration page with form validation
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
  LinearProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  PersonAdd as RegisterIcon,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import type { IRegisterData } from "@/types";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { Register } = useAuth();
  const { t } = useLanguage();

  const [FormData, setFormData] = useState<IRegisterData>({
    Username: "",
    Email: "",
    Password: "",
    ConfirmPassword: "",
  });

  const [ShowPassword, setShowPassword] = useState(false);
  const [ShowConfirmPassword, setShowConfirmPassword] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [Error, setError] = useState<string | null>(null);
  const [Success, setSuccess] = useState(false);

  const HandleChange =
    (field: keyof IRegisterData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      setError(null);
    };

  const GetPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min((strength / 5) * 100, 100);
  };

  const GetPasswordStrengthColor = (strength: number): "error" | "warning" | "success" => {
    if (strength < 40) return "error";
    if (strength < 70) return "warning";
    return "success";
  };

  const GetPasswordStrengthLabel = (strength: number): string => {
    if (strength < 40) return "Weak";
    if (strength < 70) return "Medium";
    return "Strong";
  };

  const ValidateForm = (): string | null => {
    if (!FormData.Username.trim()) {
      return t("auth.usernameRequired");
    }

    if (FormData.Username.length < 3) {
      return "Username must be at least 3 characters";
    }

    if (!FormData.Email.trim()) {
      return "Email is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(FormData.Email)) {
      return "Invalid email format";
    }

    if (!FormData.Password) {
      return t("auth.passwordRequired");
    }

    if (FormData.Password.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (FormData.Password !== FormData.ConfirmPassword) {
      return "Passwords do not match";
    }

    return null;
  };

  const HandleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const validationError = ValidateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      await Register(FormData);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Registration failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = GetPasswordStrength(FormData.Password);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
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
          maxWidth: 500,
          width: "100%",
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {t("auth.createAccount")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("auth.registerSubtitle")}
            </Typography>
          </Box>

          {Error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {Error}
            </Alert>
          )}

          {Success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Account created successfully! Redirecting to login...
            </Alert>
          )}

          <form onSubmit={HandleSubmit}>
            <TextField
              fullWidth
              label={t("auth.username")}
              value={FormData.Username}
              onChange={HandleChange("Username")}
              margin="normal"
              autoComplete="username"
              autoFocus
              disabled={Loading || Success}
              helperText="Minimum 3 characters"
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={FormData.Email}
              onChange={HandleChange("Email")}
              margin="normal"
              autoComplete="email"
              disabled={Loading || Success}
            />

            <TextField
              fullWidth
              label={t("auth.password")}
              type={ShowPassword ? "text" : "password"}
              value={FormData.Password}
              onChange={HandleChange("Password")}
              margin="normal"
              autoComplete="new-password"
              disabled={Loading || Success}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      disabled={Loading || Success}
                    >
                      {ShowPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {FormData.Password && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Password Strength
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {GetPasswordStrengthLabel(passwordStrength)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={passwordStrength}
                  color={GetPasswordStrengthColor(passwordStrength)}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            )}

            <TextField
              fullWidth
              label="Confirm Password"
              type={ShowConfirmPassword ? "text" : "password"}
              value={FormData.ConfirmPassword}
              onChange={HandleChange("ConfirmPassword")}
              margin="normal"
              autoComplete="new-password"
              disabled={Loading || Success}
              error={
                FormData.ConfirmPassword !== "" &&
                FormData.Password !== FormData.ConfirmPassword
              }
              helperText={
                FormData.ConfirmPassword !== "" &&
                FormData.Password !== FormData.ConfirmPassword
                  ? "Passwords do not match"
                  : ""
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      edge="end"
                      disabled={Loading || Success}
                    >
                      {ShowConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              disabled={Loading || Success}
              startIcon={
                Loading ? <CircularProgress size={20} /> : <RegisterIcon />
              }
              sx={{ mt: 3, mb: 2 }}
            >
              {Loading ? "Creating Account..." : t("auth.register")}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {t("auth.haveAccount")}{" "}
                <Link component={RouterLink} to="/login" underline="hover">
                  {t("auth.login")}
                </Link>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};
