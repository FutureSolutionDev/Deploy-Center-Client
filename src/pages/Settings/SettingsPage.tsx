import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  alpha,
  Grid,
} from "@mui/material";
import {
  Person as PersonIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  AccountCircle as AccountIcon,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import UserSettingsService from "@/services/userSettingsService";
import type { IUser, IUserSettings } from "@/types";

interface ITabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<ITabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const { User } = useAuth();
  const { Language, ChangeLanguage, t } = useLanguage();
  const { Mode, Color, ToggleMode, SetColor } = useTheme();

  const [tabValue, setTabValue] = useState(0);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [savingNotifications, setSavingNotifications] = useState<boolean>(false);
  const [savingPreferences, setSavingPreferences] = useState<boolean>(false);
  const [savingPassword, setSavingPassword] = useState<boolean>(false);

  // Profile state
  const [username, setUsername] = useState(User?.Username || "");
  const [email, setEmail] = useState(User?.Email || "");
  const [fullName, setFullName] = useState(User?.FullName || "");
  const [lastLogin, setLastLogin] = useState<Date | undefined>(User?.LastLogin);
  const [memberSince, setMemberSince] = useState<Date | undefined>(User?.CreatedAt);

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [slackWebhook, setSlackWebhook] = useState("");
  const [notifySuccess, setNotifySuccess] = useState(true);
  const [notifyFailure, setNotifyFailure] = useState(true);
  const [notifyProjectUpdate, setNotifyProjectUpdate] = useState(true);
  const [notifySystemAlert, setNotifySystemAlert] = useState(true);

  // Preferences
  const [timezone, setTimezone] = useState("UTC");
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h");

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const timezoneOptions = useMemo(
    () => [
      "UTC",
      "Europe/London",
      "Europe/Berlin",
      "Africa/Cairo",
      "Asia/Riyadh",
      "Asia/Dubai",
      "Asia/Karachi",
      "Asia/Kolkata",
      "Asia/Singapore",
      "Asia/Tokyo",
      "America/New_York",
      "America/Los_Angeles",
      "America/Chicago",
    ],
    []
  );

  const dateFormatOptions = useMemo(
    () => ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"],
    []
  );

  const timeFormatOptions: Array<"12h" | "24h"> = ["12h", "24h"];

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 2500);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3500);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const profile = await UserSettingsService.getProfile();
        const settings = (await UserSettingsService.getSettings()) as IUserSettings;

        const user: IUser | undefined = profile?.User;
        if (user) {
          setUsername(user.Username || "");
          setEmail(user.Email || "");
          setFullName(user.FullName || "");
          setLastLogin(user.LastLogin);
          setMemberSince(user.CreatedAt);
        }

        if (settings) {
          setEmailNotifications(!!settings.EmailNotifications);
          setDiscordWebhook(settings.DiscordWebhookUrl || "");
          setSlackWebhook(settings.SlackWebhookUrl || "");
          setNotifySuccess(!!settings.NotifyOnSuccess);
          setNotifyFailure(!!settings.NotifyOnFailure);
          setNotifyProjectUpdate(!!settings.NotifyOnProjectUpdate);
          setNotifySystemAlert(!!settings.NotifyOnSystemAlert);
          setTimezone(settings.Timezone || "UTC");
          setDateFormat(settings.DateFormat || "YYYY-MM-DD");
          setTimeFormat((settings.TimeFormat as "12h" | "24h") || "24h");
        }
      } catch (err) {
        console.error("Failed to load settings", err);
        showError(t("settings.loadError") || "Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [t]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSuccess(null);
    setError(null);
  };

  const handleLanguageChange = async (newLanguage: "en" | "ar") => {
    try {
      ChangeLanguage(newLanguage);
      setSavingPreferences(true);
      await UserSettingsService.updatePreferences({
        Language: newLanguage,
        Theme: Mode,
        ColorTheme: Color,
        Timezone: timezone,
        DateFormat: dateFormat,
        TimeFormat: timeFormat,
      });
      showSuccess(t("settings.languageUpdated"));
    } catch (err) {
      console.error("Language update failed", err);
      showError(t("settings.saveFailed") || "Failed to update language");
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      await UserSettingsService.updateProfile({
        Username: username,
        Email: email,
        FullName: fullName,
      });
      showSuccess(t("settings.profileUpdated"));
    } catch (err) {
      console.error("Profile update failed", err);
      showError(t("settings.saveFailed") || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true);
      await UserSettingsService.updateNotificationSettings({
        EmailNotifications: emailNotifications,
        DiscordWebhookUrl: discordWebhook || null,
        SlackWebhookUrl: slackWebhook || null,
        NotifyOnSuccess: notifySuccess,
        NotifyOnFailure: notifyFailure,
        NotifyOnProjectUpdate: notifyProjectUpdate,
        NotifyOnSystemAlert: notifySystemAlert,
      });
      showSuccess(t("settings.notificationsSaved"));
    } catch (err) {
      console.error("Notification update failed", err);
      showError(t("settings.saveFailed") || "Failed to update notifications");
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSavingPreferences(true);
      await UserSettingsService.updatePreferences({
        Timezone: timezone,
        DateFormat: dateFormat,
        TimeFormat: timeFormat,
        Language,
        Theme: Mode,
        ColorTheme: Color,
      });
      showSuccess(t("settings.preferencesSaved") || "Preferences updated");
    } catch (err) {
      console.error("Preferences update failed", err);
      showError(t("settings.saveFailed") || "Failed to update preferences");
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleTestNotification = async (type: "discord" | "slack") => {
    try {
      await UserSettingsService.testNotification(type);
      showSuccess(t("settings.testNotificationSent") || "Test notification sent");
    } catch (err) {
      console.error("Test notification failed", err);
      showError(t("settings.saveFailed") || "Failed to send test notification");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError(t("settings.passwordFieldsRequired") || "Please fill all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError(t("settings.passwordMismatch") || "New password and confirmation do not match");
      return;
    }

    try {
      setSavingPassword(true);
      await UserSettingsService.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showSuccess(t("settings.passwordUpdated") || "Password updated");
    } catch (err) {
      console.error("Change password failed", err);
      showError(t("settings.saveFailed") || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          {t("settings.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("settings.subtitle")}
        </Typography>
      </Box>

      {/* Global Alerts */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable">
            <Tab
              label={t("settings.profile")}
              icon={<PersonIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              label={t("settings.preferences")}
              icon={<PaletteIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              label={t("settings.notifications")}
              icon={<NotificationsIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              label={t("settings.security")}
              icon={<SecurityIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              label={t("settings.account")}
              icon={<AccountIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          </Tabs>
        </Box>

        <CardContent>
          {/* Profile Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {t("settings.profileInformation")}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t("settings.fullName") || "Full Name"}
                  value={fullName}
                  disabled={isLoading || savingProfile}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t("settings.username")}
                  value={username}
                  disabled={isLoading || savingProfile}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t("settings.email")}
                  type="email"
                  value={email}
                  disabled={isLoading || savingProfile}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid xs={12} md={6} display="flex" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.lastLogin") || "Last login"}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {lastLogin ? new Date(lastLogin).toLocaleString() : t("settings.notAvailable")}
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={12} md={6} display="flex" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t("settings.memberSince") || "Member since"}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {memberSince ? new Date(memberSince).toLocaleDateString() : t("settings.notAvailable")}
                  </Typography>
                </Box>
              </Grid>
              <Grid xs={12}>
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  disabled={isLoading || savingProfile}
                >
                  {t("settings.saveChanges")}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Preferences Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {t("settings.appearanceLanguage")}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={4}>
              {/* Language Selection */}
              <Grid xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t("settings.language")}</InputLabel>
                  <Select
                    value={Language}
                    label={t("settings.language")}
                    onChange={(e) => handleLanguageChange(e.target.value as "en" | "ar")}
                    disabled={savingPreferences || isLoading}
                  >
                    <MenuItem value="en">{t("settings.english")}</MenuItem>
                    <MenuItem value="ar">{t("settings.arabic")}</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  {t("settings.changesApplyImmediately")}
                </Typography>
              </Grid>

              {/* Theme Mode */}
              <Grid xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={Mode === "dark"}
                      onChange={ToggleMode}
                    />
                  }
                  label={Mode === "dark" ? t("settings.darkModeOn") : t("settings.darkModeOff")}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  {t("settings.toggleTheme")}
                </Typography>
              </Grid>

              {/* Timezone */}
              <Grid xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>{t("settings.timezone") || "Timezone"}</InputLabel>
                  <Select
                    value={timezone}
                    label={t("settings.timezone") || "Timezone"}
                    onChange={(e) => setTimezone(e.target.value)}
                    disabled={savingPreferences || isLoading}
                  >
                    {timezoneOptions.map((tz) => (
                      <MenuItem key={tz} value={tz}>
                        {tz}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Date format */}
              <Grid xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>{t("settings.dateFormat") || "Date Format"}</InputLabel>
                  <Select
                    value={dateFormat}
                    label={t("settings.dateFormat") || "Date Format"}
                    onChange={(e) => setDateFormat(e.target.value)}
                    disabled={savingPreferences || isLoading}
                  >
                    {dateFormatOptions.map((fmt) => (
                      <MenuItem key={fmt} value={fmt}>
                        {fmt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Time format */}
              <Grid xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>{t("settings.timeFormat") || "Time Format"}</InputLabel>
                  <Select
                    value={timeFormat}
                    label={t("settings.timeFormat") || "Time Format"}
                    onChange={(e) => setTimeFormat(e.target.value as "12h" | "24h")}
                    disabled={savingPreferences || isLoading}
                  >
                    {timeFormatOptions.map((fmt) => (
                      <MenuItem key={fmt} value={fmt}>
                        {fmt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Color Theme Selection */}
              <Grid xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  {t("settings.colorTheme")}
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
                  {["blue", "green", "purple", "orange", "red"].map((color) => (
                    <Box
                      key={color}
                      onClick={() => {
                        SetColor(color as "blue" | "green" | "purple" | "orange" | "red");
                        setSuccess(t("settings.colorThemeUpdated"));
                        setTimeout(() => setSuccess(null), 2000);
                      }}
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 2,
                        bgcolor: `${color}`,
                        cursor: "pointer",
                        border: 3,
                        borderColor:
                          Color === color ? "text.primary" : "transparent",
                        transition: "all 0.2s",
                        position: "relative",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      {Color === color && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            color: "white",
                            fontSize: 24,
                          }}
                        >
                          ✓
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                  {t("settings.selectPreferredColor")}
                </Typography>
              </Grid>

              <Grid xs={12}>
                <Button
                  variant="contained"
                  onClick={handleSavePreferences}
                  disabled={savingPreferences || isLoading}
                >
                  {t("settings.saveChanges")}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {t("settings.notificationSettings")}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      disabled={savingNotifications || isLoading}
                    />
                  }
                  label={t("settings.emailNotifications")}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  {t("settings.receiveEmailNotifications")}
                </Typography>
              </Grid>

              <Grid xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifySuccess}
                      onChange={(e) => setNotifySuccess(e.target.checked)}
                      disabled={savingNotifications || isLoading}
                    />
                  }
                  label={t("settings.notifySuccess") || "Notify on success"}
                />
              </Grid>

              <Grid xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifyFailure}
                      onChange={(e) => setNotifyFailure(e.target.checked)}
                      disabled={savingNotifications || isLoading}
                    />
                  }
                  label={t("settings.notifyFailure") || "Notify on failure"}
                />
              </Grid>

              <Grid xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifyProjectUpdate}
                      onChange={(e) => setNotifyProjectUpdate(e.target.checked)}
                      disabled={savingNotifications || isLoading}
                    />
                  }
                  label={t("settings.notifyProjectUpdates") || "Project updates"}
                />
              </Grid>

              <Grid xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifySystemAlert}
                      onChange={(e) => setNotifySystemAlert(e.target.checked)}
                      disabled={savingNotifications || isLoading}
                    />
                  }
                  label={t("settings.notifySystemAlerts") || "System alerts"}
                />
              </Grid>

              <Grid xs={12}>
                <TextField
                  fullWidth
                  label={t("settings.discordWebhook")}
                  placeholder={t("settings.discordWebhookPlaceholder")}
                  value={discordWebhook}
                  disabled={savingNotifications || isLoading}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                />
              </Grid>

              <Grid xs={12}>
                <TextField
                  fullWidth
                  label={t("settings.slackWebhook")}
                  placeholder={t("settings.slackWebhookPlaceholder")}
                  value={slackWebhook}
                  disabled={savingNotifications || isLoading}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                />
              </Grid>

              <Grid xs={12}>
                <Button
                  variant="contained"
                  onClick={handleSaveNotifications}
                  disabled={savingNotifications || isLoading}
                >
                  {t("settings.saveNotificationSettings")}
                </Button>
                <Button
                  variant="outlined"
                  sx={{ ml: 2 }}
                  onClick={() => handleTestNotification("discord")}
                  disabled={savingNotifications || isLoading || !discordWebhook}
                >
                  {t("settings.testDiscord") || "Test Discord"}
                </Button>
                <Button
                  variant="outlined"
                  sx={{ ml: 2 }}
                  onClick={() => handleTestNotification("slack")}
                  disabled={savingNotifications || isLoading || !slackWebhook}
                >
                  {t("settings.testSlack") || "Test Slack"}
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {t("settings.securitySettings")}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid xs={12}>
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
                  onClick={handleChangePassword}
                  disabled={savingPassword || isLoading}
                >
                  {t("settings.updatePassword")}
                </Button>
              </Grid>

              <Grid xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  {t("settings.twoFactorAuth")}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t("settings.twoFactorDesc")}
                </Typography>
                <Button variant="outlined">{t("settings.enable2fa")}</Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Account Tab */}
          <TabPanel value={tabValue} index={4}>
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
              <Button variant="outlined" color="error">
                {t("settings.deleteAccount")}
              </Button>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};
