import React, { useState } from "react";
import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from "@mui/material";
import { useDeleteAccount } from "@/hooks/useUserSettings";
import { useToast } from "@/contexts/ToastContext";

interface IAccountTabProps {
  t: (key: string) => string;
}

export const AccountTab: React.FC<IAccountTabProps> = ({ t }) => {
  const { showSuccess, showError } = useToast();
  const deleteAccount = useDeleteAccount();
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    deleteAccount.mutate(undefined, {
      onSuccess: () => showSuccess(t("settings.deleteAccountSuccess")),
      onError: () => showError(t("settings.deleteAccountFailed")),
    });
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
        <Button
          variant="outlined"
          color="error"
          onClick={() => setOpen(true)}
          disabled={deleteAccount.isPending}
        >
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
          <Button
            onClick={handleConfirm}
            color="error"
            variant="contained"
            disabled={deleteAccount.isPending}
          >
            {t("settings.deleteAccount")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountTab;
