import React from "react";
import { alpha, Box, Button, Divider, Typography } from "@mui/material";

interface IAccountTabProps {
  t: (key: string) => string;
}

export const AccountTab: React.FC<IAccountTabProps> = ({ t }) => {
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
        <Button variant="outlined" color="error" disabled>
          {t("settings.deleteAccount")}
        </Button>
      </Box>
    </>
  );
};

export default AccountTab;
