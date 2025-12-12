import React, { useState } from "react";
import Grid from "@mui/material/GridLegacy";
import { Alert, Box, Button, Divider, Stack, TextField, Typography } from "@mui/material";

interface ISecurityTabProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  disabled?: boolean;
  twoFactorEnabled: boolean;
  twoFactorLoading?: boolean;
  qrCodeUrl?: string | null;
  secret?: string | null;
  backupCodes: string[];
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onChangePassword: () => void;
  onGenerate2FA: () => Promise<void>;
  onEnable2FA: (code: string) => Promise<void>;
  onDisable2FA: (code: string) => Promise<void>;
  onRegenerateBackupCodes: () => Promise<void>;
  t: (key: string) => string;
}

export const SecurityTab: React.FC<ISecurityTabProps> = ({
  currentPassword,
  newPassword,
  confirmPassword,
  disabled,
  twoFactorEnabled,
  twoFactorLoading,
  qrCodeUrl,
  secret,
  backupCodes,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onChangePassword,
  onGenerate2FA,
  onEnable2FA,
  onDisable2FA,
  onRegenerateBackupCodes,
  t,
}) => {
  const [enableCode, setEnableCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEnable = async () => {
    try {
      setStatusMessage(null);
      setErrorMessage(null);
      await onEnable2FA(enableCode);
      setStatusMessage(t("settings.2faEnabled"));
      setEnableCode("");
    } catch (err) {
      console.error(err);
      setErrorMessage(t("settings.saveFailed"));
    }
  };

  const handleDisable = async () => {
    try {
      setStatusMessage(null);
      setErrorMessage(null);
      await onDisable2FA(disableCode);
      setStatusMessage(t("settings.2faDisabled"));
      setDisableCode("");
    } catch (err) {
      console.error(err);
      setErrorMessage(t("settings.saveFailed"));
    }
  };

  const handleRegenerate = async () => {
    try {
      setStatusMessage(null);
      setErrorMessage(null);
      await onRegenerateBackupCodes();
      setStatusMessage(t("settings.backupCodesRegenerated"));
    } catch (err) {
      console.error(err);
      setErrorMessage(t("settings.saveFailed"));
    }
  };

  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {t("settings.securitySettings")}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12}>
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

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            {t("settings.twoFactorAuth")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("settings.twoFactorDesc")}
          </Typography>

          {statusMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {statusMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {!twoFactorEnabled && (
            <Stack spacing={2}>
              <Box>
                <Button variant="outlined" onClick={onGenerate2FA} disabled={twoFactorLoading}>
                  {t("settings.generate2fa")}
                </Button>
              </Box>

              {qrCodeUrl && (
                <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                  <img src={qrCodeUrl} alt="2FA QR" style={{ width: 180, height: 180 }} />
                  <Box>
                    <Typography variant="subtitle2">{t("settings.scanQr")}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {secret}
                    </Typography>
                  </Box>
                </Box>
              )}

              {qrCodeUrl && (
                <Box sx={{ maxWidth: 320 }}>
                  <TextField
                    fullWidth
                    label={t("settings.enterTotp")}
                    value={enableCode}
                    onChange={(e) => setEnableCode(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    sx={{ mt: 1.5 }}
                    onClick={handleEnable}
                    disabled={twoFactorLoading || !enableCode}
                  >
                    {t("settings.enable2fa")}
                  </Button>
                </Box>
              )}
            </Stack>
          )}

          {twoFactorEnabled && (
            <Stack spacing={2}>
              <Typography variant="body2" color="success.main">
                {t("settings.2faEnabled")}
              </Typography>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button variant="outlined" onClick={handleRegenerate} disabled={twoFactorLoading}>
                  {t("settings.regenerateBackupCodes")}
                </Button>
              </Box>

              {backupCodes && backupCodes.length > 0 && (
                <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t("settings.backupCodes")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    {t("settings.backupCodesNote")}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {backupCodes.map((code) => (
                      <Box
                        key={code}
                        sx={{
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 1,
                          bgcolor: "background.default",
                          border: 1,
                          borderColor: "divider",
                          fontFamily: "monospace",
                        }}
                      >
                        {code}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ maxWidth: 320 }}>
                <TextField
                  fullWidth
                  label={t("settings.enterDisableCode")}
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  helperText={t("settings.useTotpOrBackup")}
                />
                <Button
                  variant="outlined"
                  color="error"
                  sx={{ mt: 1.5 }}
                  onClick={handleDisable}
                  disabled={twoFactorLoading || !disableCode}
                >
                  {t("settings.disable2fa")}
                </Button>
              </Box>
            </Stack>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default SecurityTab;
