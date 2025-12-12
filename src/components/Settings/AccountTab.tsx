import React, { useState } from "react";
import { alpha, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography } from "@mui/material";

interface IAccountTabProps {
  t: (key: string) => string;
  onDeleteAccount: () => Promise<void>;
  loading?: boolean;
}

export const AccountTab: React.FC<IAccountTabProps> = ({ t, onDeleteAccount, loading }) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    await onDeleteAccount();
    setOpen(false);
  };

  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {t("settings.accountManagement")}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box
        sx={{
          p: 3,
          bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
          borderRadius: 2,
          border: 1,
          borderColor: "error.main",
        }}
      >
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: "error.main" }}>
          {t("settings.dangerZone")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("settings.deleteWarning")}
        </Typography>
        <Button variant="outlined" color="error" onClick={() => setOpen(true)} disabled={loading}>
          {t("settings.deleteAccount")}
        </Button>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{t("settings.deleteAccount")}</DialogTitle>
        <DialogContent>
          <Typography>{t("settings.deleteAccountConfirm")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t("settings.cancel")}</Button>
          <Button onClick={handleConfirm} color="error" variant="contained" disabled={loading}>
            {t("settings.deleteAccount")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountTab;
