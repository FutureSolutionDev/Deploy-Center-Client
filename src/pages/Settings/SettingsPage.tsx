import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Card, CardContent, Tab, Tabs, Typography } from "@mui/material";
import {
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import UserSettingsService from "@/services/userSettingsService";
import type { IUser, IUserSettings } from "@/types";
import ProfileTab from "@/components/Settings/ProfileTab";
import PreferencesTab from "@/components/Settings/PreferencesTab";
import NotificationsTab from "@/components/Settings/NotificationsTab";
import SecurityTab from "@/components/Settings/SecurityTab";
import AccountTab from "@/components/Settings/AccountTab";

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

  const dateFormatOptions = useMemo(() => ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"], []);
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
        showError(t("settings.loadError"));
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
      showError(t("settings.saveFailed"));
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
      showError(t("settings.saveFailed"));
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
      showError(t("settings.saveFailed"));
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
      showSuccess(t("settings.preferencesSaved"));
    } catch (err) {
      console.error("Preferences update failed", err);
      showError(t("settings.saveFailed"));
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleTestNotification = async (type: "discord" | "slack") => {
    try {
      await UserSettingsService.testNotification(type);
      showSuccess(t("settings.testNotificationSent"));
    } catch (err) {
      console.error("Test notification failed", err);
      showError(t("settings.saveFailed"));
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError(t("settings.passwordFieldsRequired"));
      return;
    }

    if (newPassword !== confirmPassword) {
      showError(t("settings.passwordMismatch"));
      return;
    }

    try {
      setSavingPassword(true);
      await UserSettingsService.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showSuccess(t("settings.passwordUpdated"));
    } catch (err) {
      console.error("Change password failed", err);
      showError(t("settings.saveFailed"));
    } finally {
      setSavingPassword(false);
    }
  };

  const handleColorSelect = (value: string) => {
    SetColor(value as string);
    showSuccess(t("settings.colorThemeUpdated"));
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          {t("settings.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("settings.subtitle")}
        </Typography>
      </Box>

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
            <Tab label={t("settings.profile")} icon={<PersonIcon />} iconPosition="start" sx={{ minHeight: 64 }} />
            <Tab label={t("settings.preferences")} icon={<PaletteIcon />} iconPosition="start" sx={{ minHeight: 64 }} />
            <Tab
              label={t("settings.notifications")}
              icon={<NotificationsIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab label={t("settings.security")} icon={<SecurityIcon />} iconPosition="start" sx={{ minHeight: 64 }} />
            <Tab label={t("settings.account")} icon={<AccountIcon />} iconPosition="start" sx={{ minHeight: 64 }} />
          </Tabs>
        </Box>

        <CardContent>
          <TabPanel value={tabValue} index={0}>
            <ProfileTab
              fullName={fullName}
              username={username}
              email={email}
              lastLogin={lastLogin}
              memberSince={memberSince}
              disabled={isLoading || savingProfile}
              onFullNameChange={setFullName}
              onUsernameChange={setUsername}
              onEmailChange={setEmail}
              onSave={handleSaveProfile}
              t={t}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <PreferencesTab
              language={Language as "en" | "ar"}
              mode={Mode}
              color={Color}
              timezone={timezone}
              dateFormat={dateFormat}
              timeFormat={timeFormat}
              timezoneOptions={timezoneOptions}
              dateFormatOptions={dateFormatOptions}
              timeFormatOptions={timeFormatOptions}
              disabled={isLoading}
              saving={savingPreferences}
              onLanguageChange={handleLanguageChange}
              onToggleMode={ToggleMode}
              onColorSelect={handleColorSelect}
              onTimezoneChange={setTimezone}
              onDateFormatChange={setDateFormat}
              onTimeFormatChange={setTimeFormat}
              onSave={handleSavePreferences}
              t={t}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <NotificationsTab
              emailNotifications={emailNotifications}
              notifySuccess={notifySuccess}
              notifyFailure={notifyFailure}
              notifyProjectUpdate={notifyProjectUpdate}
              notifySystemAlert={notifySystemAlert}
              discordWebhook={discordWebhook}
              slackWebhook={slackWebhook}
              disabled={isLoading || savingNotifications}
              onEmailNotificationsChange={setEmailNotifications}
              onNotifySuccessChange={setNotifySuccess}
              onNotifyFailureChange={setNotifyFailure}
              onNotifyProjectUpdateChange={setNotifyProjectUpdate}
              onNotifySystemAlertChange={setNotifySystemAlert}
              onDiscordWebhookChange={setDiscordWebhook}
              onSlackWebhookChange={setSlackWebhook}
              onSave={handleSaveNotifications}
              onTest={handleTestNotification}
              t={t}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <SecurityTab
              currentPassword={currentPassword}
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              disabled={isLoading || savingPassword}
              onCurrentPasswordChange={setCurrentPassword}
              onNewPasswordChange={setNewPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onChangePassword={handleChangePassword}
              t={t}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <AccountTab t={t} />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
