import React, { useState } from "react";
import { Button, Divider, FormControlLabel, Grid, Switch, TextField, Typography } from "@mui/material";
import { useToast } from "@/contexts/ToastContext";
import {
  useUserSettings,
  useUpdateNotificationSettings,
  useTestNotification,
} from "@/hooks/useUserSettings";

interface INotificationsTabProps {
  t: (key: string) => string;
}

export const NotificationsTab: React.FC<INotificationsTabProps> = ({ t }) => {
  const { showSuccess, showError } = useToast();
  const { data: settings } = useUserSettings();
  const updateNotificationSettings = useUpdateNotificationSettings();
  const testNotification = useTestNotification();

  // Local state
  const [emailNotifications, setEmailNotifications] = useState(
    settings?.EmailNotifications ?? true
  );
  const [discordWebhook, setDiscordWebhook] = useState(settings?.DiscordWebhookUrl || "");
  const [slackWebhook, setSlackWebhook] = useState(settings?.SlackWebhookUrl || "");
  const [notifySuccess, setNotifySuccess] = useState(settings?.NotifyOnSuccess ?? true);
  const [notifyFailure, setNotifyFailure] = useState(settings?.NotifyOnFailure ?? true);
  const [notifyProjectUpdate, setNotifyProjectUpdate] = useState(
    settings?.NotifyOnProjectUpdate ?? true
  );
  const [notifySystemAlert, setNotifySystemAlert] = useState(settings?.NotifyOnSystemAlert ?? true);
  // Synchronize local state with settings if it changes
  useEffect(() => {
    if (settings) {
      setEmailNotifications(settings.EmailNotifications);
      setDiscordWebhook(settings.DiscordWebhookUrl || "");
      setSlackWebhook(settings.SlackWebhookUrl || "");
      setNotifySuccess(settings.NotifyOnSuccess);
      setNotifyFailure(settings.NotifyOnFailure);
      setNotifyProjectUpdate(settings.NotifyOnProjectUpdate);
      setNotifySystemAlert(settings.NotifyOnSystemAlert);
    }
  }, [settings])

  const handleSave = () => {
    updateNotificationSettings.mutate(
      {
        EmailNotifications: emailNotifications,
        DiscordWebhookUrl: discordWebhook || null,
        SlackWebhookUrl: slackWebhook || null,
        NotifyOnSuccess: notifySuccess,
        NotifyOnFailure: notifyFailure,
        NotifyOnProjectUpdate: notifyProjectUpdate,
        NotifyOnSystemAlert: notifySystemAlert,
      },
      {
        onSuccess: () => showSuccess(t("settings.notificationsSaved")),
        onError: () => showError(t("settings.saveFailed")),
      }
    );
  };

  const handleTest = (type: "discord" | "slack") => {
    testNotification.mutate(type, {
      onSuccess: () => showSuccess(t("settings.testNotificationSent")),
      onError: () => showError(t("settings.saveFailed")),
    });
  };

  const isDisabled = updateNotificationSettings.isPending;

  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {t("settings.notificationSettings")}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid size={12}>
          <FormControlLabel
            control={
              <Switch
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                disabled={isDisabled}
              />
            }
            label={t("settings.emailNotifications")}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {t("settings.receiveEmailNotifications")}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Switch
                checked={notifySuccess}
                onChange={(e) => setNotifySuccess(e.target.checked)}
                disabled={isDisabled}
              />
            }
            label={t("settings.notifySuccess")}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Switch
                checked={notifyFailure}
                onChange={(e) => setNotifyFailure(e.target.checked)}
                disabled={isDisabled}
              />
            }
            label={t("settings.notifyFailure")}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Switch
                checked={notifyProjectUpdate}
                onChange={(e) => setNotifyProjectUpdate(e.target.checked)}
                disabled={isDisabled}
              />
            }
            label={t("settings.notifyProjectUpdates")}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Switch
                checked={notifySystemAlert}
                onChange={(e) => setNotifySystemAlert(e.target.checked)}
                disabled={isDisabled}
              />
            }
            label={t("settings.notifySystemAlerts")}
          />
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            label={t("settings.discordWebhook")}
            placeholder={t("settings.discordWebhookPlaceholder")}
            value={discordWebhook}
            disabled={isDisabled}
            onChange={(e) => setDiscordWebhook(e.target.value)}
          />
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            label={t("settings.slackWebhook")}
            placeholder={t("settings.slackWebhookPlaceholder")}
            value={slackWebhook}
            disabled={isDisabled}
            onChange={(e) => setSlackWebhook(e.target.value)}
          />
        </Grid>

        <Grid size={12}>
          <Button variant="contained" onClick={handleSave} disabled={isDisabled}>
            {t("settings.saveNotificationSettings")}
          </Button>
          <Button
            variant="outlined"
            sx={{ ml: 2 }}
            onClick={() => handleTest("discord")}
            disabled={isDisabled || !discordWebhook}
          >
            {t("settings.testDiscord")}
          </Button>
          <Button
            variant="outlined"
            sx={{ ml: 2 }}
            onClick={() => handleTest("slack")}
            disabled={isDisabled || !slackWebhook}
          >
            {t("settings.testSlack")}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default NotificationsTab;
