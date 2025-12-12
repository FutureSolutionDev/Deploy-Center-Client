import React from "react";
import Grid from "@mui/material/GridLegacy";
import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import { useDateFormatter } from "@/hooks/useDateFormatter";

interface IProfileTabProps {
  fullName: string;
  username: string;
  email: string;
  lastLogin?: Date;
  memberSince?: Date;
  disabled?: boolean;
  onFullNameChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSave: () => void;
  t: (key: string) => string;
}

export const ProfileTab: React.FC<IProfileTabProps> = ({
  fullName,
  username,
  email,
  lastLogin,
  memberSince,
  disabled,
  onFullNameChange,
  onUsernameChange,
  onEmailChange,
  onSave,
  t,
}) => {
  const { formatDateTime, formatDate } = useDateFormatter();
  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {t("settings.profileInformation")}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t("settings.fullName")}
            value={fullName}
            disabled={disabled}
            onChange={(e) => onFullNameChange(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t("settings.username")}
            value={username}
            disabled={disabled}
            onChange={(e) => onUsernameChange(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label={t("settings.email")}
            type="email"
            value={email}
            disabled={disabled}
            onChange={(e) => onEmailChange(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={6} display="flex" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("settings.lastLogin")}
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {lastLogin ? formatDateTime(lastLogin) : t("settings.notAvailable")}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6} display="flex" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("settings.memberSince")}
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {memberSince ? formatDate(memberSince) : t("settings.notAvailable")}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" onClick={onSave} disabled={disabled}>
            {t("settings.saveChanges")}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default ProfileTab;
