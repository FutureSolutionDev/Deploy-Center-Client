import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Divider, Grid, Stack, TextField, Typography } from "@mui/material";
import { useToast } from "@/contexts/ToastContext";
import {
  use2FAStatus,
  useChangePassword,
  useGenerate2FA,
  useEnable2FA,
  useDisable2FA,
  useRegenerateBackupCodes,
} from "@/hooks/useUserSettings";

interface ISecurityTabProps {
  t: (key: string) => string;
}

export const SecurityTab: React.FC<ISecurityTabProps> = ({ t }) => {
  const { showSuccess, showError } = useToast();
  const { data: twoFAStatus } = use2FAStatus();
  const changePassword = useChangePassword();
  const generate2FA = useGenerate2FA();
  const enable2FA = useEnable2FA();
  const disable2FA = useDisable2FA();
  const regenerateBackupCodes = useRegenerateBackupCodes();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 2FA state
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const [enableCode, setEnableCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const twoFactorEnabled = !!twoFAStatus?.enabled;
  const twoFactorLoading =
    generate2FA.isPending ||
    enable2FA.isPending ||
    disable2FA.isPending ||
    regenerateBackupCodes.isPending;
  const disabled = changePassword.isPending;
  // Synchronize local state with twoFAStatus if it changes
  useEffect(() => {
    if (twoFAStatus) {
      setQrCodeUrl(twoFAStatus.qrCodeUrl);
      setSecret(twoFAStatus.secret);
    }
  }, [twoFAStatus])
  const handleEnable = async () => {
    try {
      setStatusMessage(null);
      setErrorMessage(null);
      const result = await enable2FA.mutateAsync(enableCode);
      setBackupCodes(result.backupCodes);
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
      await disable2FA.mutateAsync(disableCode);
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
      const codes = await regenerateBackupCodes.mutateAsync(undefined);
      setBackupCodes(codes);
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
        <Grid size={12}>
          <Typography variant="subtitle1" gutterBottom>
            {t("settings.changePassword")}
          </Typography>
          <TextField
            fullWidth
            label={t("settings.currentPassword")}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={t("settings.newPassword")}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={t("settings.confirmNewPassword")}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={() => {
              if (!currentPassword || !newPassword || !confirmPassword) {
                showError(t("settings.passwordFieldsRequired"));
                return;
              }
              if (newPassword !== confirmPassword) {
                showError(t("settings.passwordMismatch"));
                return;
              }
              changePassword.mutate(
                { currentPassword, newPassword },
                {
                  onSuccess: () => {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    showSuccess(t("settings.passwordUpdated"));
                  },
                  onError: () => showError(t("settings.saveFailed")),
                }
              );
            }}
            disabled={disabled}
          >
            {t("settings.saveChanges")}
          </Button>
        </Grid>

        <Grid size={12}>
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
                <Button
                  variant="outlined"
                  onClick={async () => {
                    try {
                      setStatusMessage(null);
                      setErrorMessage(null);
                      const result = await generate2FA.mutateAsync();
                      setSecret(result.secret);
                      setQrCodeUrl(result.qrCodeUrl);
                    } catch (err) {
                      console.error(err);
                      setErrorMessage(t("settings.saveFailed"));
                    }
                  }}
                  disabled={twoFactorLoading}
                >
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
