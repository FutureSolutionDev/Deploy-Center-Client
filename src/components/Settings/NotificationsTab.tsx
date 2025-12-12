import React from "react";
import { Grid, Button, Divider, FormControlLabel, Switch, TextField, Typography } from "@mui/material";

interface INotificationsTabProps {
  emailNotifications: boolean;
  notifySuccess: boolean;
  notifyFailure: boolean;
  notifyProjectUpdate: boolean;
  notifySystemAlert: boolean;
  discordWebhook: string;
  slackWebhook: string;
  disabled?: boolean;
  onEmailNotificationsChange: (value: boolean) => void;
  onNotifySuccessChange: (value: boolean) => void;
  onNotifyFailureChange: (value: boolean) => void;
  onNotifyProjectUpdateChange: (value: boolean) => void;
  onNotifySystemAlertChange: (value: boolean) => void;
  onDiscordWebhookChange: (value: string) => void;
  onSlackWebhookChange: (value: string) => void;
  onSave: () => void;
  onTest: (type: "discord" | "slack") => void;
  t: (key: string) => string;
}

export const NotificationsTab: React.FC<INotificationsTabProps> = ({
  emailNotifications,
  notifySuccess,
  notifyFailure,
  notifyProjectUpdate,
  notifySystemAlert,
  discordWebhook,
  slackWebhook,
  disabled,
  onEmailNotificationsChange,
  onNotifySuccessChange,
  onNotifyFailureChange,
  onNotifyProjectUpdateChange,
  onNotifySystemAlertChange,
  onDiscordWebhookChange,
  onSlackWebhookChange,
  onSave,
  onTest,
  t,
}) => {
  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {t("settings.notificationSettings")}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={emailNotifications}
                onChange={(e) => onEmailNotificationsChange(e.target.checked)}
                disabled={disabled}
              />
            }
            label={t("settings.emailNotifications")}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {t("settings.receiveEmailNotifications")}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={notifySuccess}
                onChange={(e) => onNotifySuccessChange(e.target.checked)}
                disabled={disabled}
              />
            }
            label={t("settings.notifySuccess")}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={notifyFailure}
                onChange={(e) => onNotifyFailureChange(e.target.checked)}
                disabled={disabled}
              />
            }
            label={t("settings.notifyFailure")}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={notifyProjectUpdate}
                onChange={(e) => onNotifyProjectUpdateChange(e.target.checked)}
                disabled={disabled}
              />
            }
            label={t("settings.notifyProjectUpdates")}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={notifySystemAlert}
                onChange={(e) => onNotifySystemAlertChange(e.target.checked)}
                disabled={disabled}
              />
            }
            label={t("settings.notifySystemAlerts")}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("settings.discordWebhook")}
            placeholder={t("settings.discordWebhookPlaceholder")}
            value={discordWebhook}
            disabled={disabled}
            onChange={(e) => onDiscordWebhookChange(e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("settings.slackWebhook")}
            placeholder={t("settings.slackWebhookPlaceholder")}
            value={slackWebhook}
            disabled={disabled}
            onChange={(e) => onSlackWebhookChange(e.target.value)}
          />
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" onClick={onSave} disabled={disabled}>
            {t("settings.saveNotificationSettings")}
          </Button>
          <Button
            variant="outlined"
            sx={{ ml: 2 }}
            onClick={() => onTest("discord")}
            disabled={disabled || !discordWebhook}
          >
            {t("settings.testDiscord")}
          </Button>
          <Button
            variant="outlined"
            sx={{ ml: 2 }}
            onClick={() => onTest("slack")}
            disabled={disabled || !slackWebhook}
          >
            {t("settings.testSlack")}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default NotificationsTab;
