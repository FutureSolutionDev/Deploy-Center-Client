'use client'
import React, { useState, useMemo, useEffect } from "react";
import { Box, Button, Divider, Grid, TextField, Typography } from "@mui/material";
import { useDateFormatter } from "@/hooks/useDateFormatter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useUpdateProfile } from "@/hooks/useUserSettings";

interface IProfileTabProps {
  t: (key: string) => string;
}

export const ProfileTab: React.FC<IProfileTabProps> = ({ t }) => {
  const { formatDateTime, formatDate } = useDateFormatter();
  const { User, RefreshUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const updateProfile = useUpdateProfile();

  // Local state for form fields
  const [username, setUsername] = useState(User?.Username || "");
  const [email, setEmail] = useState(User?.Email || "");
  const [fullName, setFullName] = useState(User?.FullName || "");

  // Derived values - no need for state
  const lastLogin = useMemo(() => User?.LastLogin, [User?.LastLogin]);
  const memberSince = useMemo(() => User?.CreatedAt, [User?.CreatedAt]);
  // Synchronize local state with User from context if it changes
  useEffect(()=> {
    if(User) {
      setUsername(User?.Username || "");
      setEmail(User?.Email || "");
      setFullName(User?.FullName || "");
    }
  }, [User])
  const handleSave = async () => {
    updateProfile.mutate(
      { Username: username, Email: email, FullName: fullName },
      {
        onSuccess: async () => {
          await RefreshUser();
          showSuccess(t("settings.profileUpdated"));
        },
        onError: () => showError(t("settings.saveFailed")),
      }
    );
  };

  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {t("settings.profileInformation")}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label={t("settings.fullName")}
            value={fullName}
            disabled={updateProfile.isPending}
            onChange={(e) => setFullName(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label={t("settings.username")}
            value={username}
            disabled={updateProfile.isPending}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label={t("settings.email")}
            type="email"
            value={email}
            disabled={updateProfile.isPending}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} display="flex" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("settings.lastLogin")}
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {lastLogin ? formatDateTime(lastLogin) : t("settings.notAvailable")}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} display="flex" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t("settings.memberSince")}
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {memberSince ? formatDate(memberSince) : t("settings.notAvailable")}
            </Typography>
          </Box>
        </Grid>
        <Grid size={12}>
          <Button variant="contained" onClick={handleSave} disabled={updateProfile.isPending}>
            {t("settings.saveChanges")}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default ProfileTab;
