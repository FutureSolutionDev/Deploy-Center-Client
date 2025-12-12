import React from "react";
import { Button, Divider, TextField, Typography, Grid } from "@mui/material";

interface ISecurityTabProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  disabled?: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onChangePassword: () => void;
  t: (key: string) => string;
}

export const SecurityTab: React.FC<ISecurityTabProps> = ({
  currentPassword,
  newPassword,
  confirmPassword,
  disabled,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onChangePassword,
  t,
}) => {
  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {t("settings.securitySettings")}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            {t("settings.changePassword")}
          </Typography>
          <TextField
            fullWidth
            label={t("settings.currentPassword")}
            type="password"
            value={currentPassword}
            onChange={(e) => onCurrentPasswordChange(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={t("settings.newPassword")}
            type="password"
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={t("settings.confirmNewPassword")}
            type="password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={onChangePassword} disabled={disabled}>
            {t("settings.updatePassword")}
          </Button>
        </Grid>

        <Grid xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            {t("settings.twoFactorAuth")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("settings.twoFactorDesc")}
          </Typography>
          <Button variant="outlined" disabled>
            {t("settings.enable2fa")}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default SecurityTab;
