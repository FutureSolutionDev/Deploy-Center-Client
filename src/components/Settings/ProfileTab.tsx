'use client'
import React, { useState, useMemo } from "react";
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

  // Local state for pending changes to avoid setState in useEffect
  const [pendingChanges, setPendingChanges] = useState<{username?: string, email?: string, fullName?: string}>({});

  // Derived values - no need for state
  const lastLogin = useMemo(() => User?.LastLogin, [User?.LastLogin]);
  const memberSince = useMemo(() => User?.CreatedAt, [User?.CreatedAt]);
  const handleSave = async () => {
    const data = {
      Username: pendingChanges.username ?? User?.Username ?? "",
      Email: pendingChanges.email ?? User?.Email ?? "",
      FullName: pendingChanges.fullName ?? User?.FullName ?? "",
    };
    updateProfile.mutate(
      data,
      {
        onSuccess: async () => {
          setPendingChanges({}); // clear pending changes
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
            value={pendingChanges.fullName ?? User?.FullName ?? ""}
            disabled={updateProfile.isPending}
            onChange={(e) => setPendingChanges(prev => ({...prev, fullName: e.target.value}))}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label={t("settings.username")}
            value={pendingChanges.username ?? User?.Username ?? ""}
            disabled={updateProfile.isPending}
            onChange={(e) => setPendingChanges(prev => ({...prev, username: e.target.value}))}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label={t("settings.email")}
            type="email"
            value={pendingChanges.email ?? User?.Email ?? ""}
            disabled={updateProfile.isPending}
            onChange={(e) => setPendingChanges(prev => ({...prev, email: e.target.value}))}
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
