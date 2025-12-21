import React, { useMemo, useState } from "react";
import { Box, Card, CardContent, Tab, Tabs, Typography } from "@mui/material";
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
import { useToast } from "@/contexts/ToastContext";
import type { IUserSettings } from "@/types";
import ProfileTab from "@/components/Settings/ProfileTab";
import PreferencesTab from "@/components/Settings/PreferencesTab";
import NotificationsTab from "@/components/Settings/NotificationsTab";
import SecurityTab from "@/components/Settings/SecurityTab";
import AccountTab from "@/components/Settings/AccountTab";
import ApiKeysTab, { type ICreateApiKeyInput } from "@/components/Settings/ApiKeysTab";
import SessionsTab from "@/components/Settings/SessionsTab";
import {
  useUserSettings,
  useApiKeys,
  useUserSessions,
  use2FAStatus,
  useUpdateProfile,
  useUpdateNotificationSettings,
  useUpdatePreferences,
  useTestNotification,
  useChangePassword,
  useGenerate2FA,
  useEnable2FA,
  useDisable2FA,
  useRegenerateBackupCodes,
  useGenerateApiKey,
  useRevokeApiKey,
  useReactivateApiKey,
  useRegenerateApiKey,
  useRevokeSession,
  useRevokeAllSessions,
  useDeleteAccount,
} from "@/hooks/useUserSettings";

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
  const { User, RefreshUser } = useAuth();
  const { Language, ChangeLanguage, t } = useLanguage();
  const { Mode, Color, ToggleMode, SetColor } = useTheme();
  const { showSuccess, showError } = useToast();

  // React Query hooks
  const { data: settings, isLoading: settingsLoading } = useUserSettings();
  const { data: apiKeys = [], isLoading: apiKeysLoading } = useApiKeys();
  const { data: sessions = [], isLoading: sessionsLoading } = useUserSessions();
  const { data: twoFAStatus } = use2FAStatus();

  const updateProfile = useUpdateProfile();
  const updateNotificationSettings = useUpdateNotificationSettings();
  const updatePreferences = useUpdatePreferences();
  const testNotification = useTestNotification();
  const changePassword = useChangePassword();
  const generate2FA = useGenerate2FA();
  const enable2FA = useEnable2FA();
  const disable2FA = useDisable2FA();
  const regenerateBackupCodes = useRegenerateBackupCodes();
  const generateApiKey = useGenerateApiKey();
  const revokeApiKey = useRevokeApiKey();
  const reactivateApiKey = useReactivateApiKey();
  const regenerateApiKey = useRegenerateApiKey();
  const revokeSession = useRevokeSession();
  const revokeAllSessions = useRevokeAllSessions();
  const deleteAccount = useDeleteAccount();

  const [tabValue, setTabValue] = useState(0);

  // 2FA state
  const [twoFactorQr, setTwoFactorQr] = useState<string | null>(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Profile state - controlled form values
  const [username, setUsername] = useState(User?.Username || "");
  const [email, setEmail] = useState(User?.Email || "");
  const [fullName, setFullName] = useState(User?.FullName || "");

  // Derived values from User
  const lastLogin = useMemo(() => User?.LastLogin, [User?.LastLogin]);
  const memberSince = useMemo(() => User?.CreatedAt, [User?.CreatedAt]);

  // Notification settings - controlled form values
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

  // Preferences - controlled form values
  const [timezone, setTimezone] = useState(settings?.Timezone || "UTC");
  const [dateFormat, setDateFormat] = useState(settings?.DateFormat || "YYYY-MM-DD");
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">(
    (settings?.TimeFormat as "12h" | "24h") || "24h"
  );

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

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTabValue(newValue);

  const handleLanguageChange = async (newLanguage: "en" | "ar") => {
    ChangeLanguage(newLanguage);
    await savePreferencesPartial({ Language: newLanguage });
  };

  const handleSaveProfile = async () => {
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

  const handleSaveNotifications = async () => {
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

  const handleSavePreferences = async () => {
    await savePreferencesPartial({});
  };

  const savePreferencesPartial = async (
    overrides: Partial<IUserSettings>,
    showToast: boolean = true
  ) => {
    updatePreferences.mutate(
      {
        Timezone: timezone,
        DateFormat: dateFormat,
        TimeFormat: timeFormat,
        Language,
        Theme: Mode,
        ColorTheme: Color,
        ...overrides,
      },
      {
        onSuccess: () => {
          if (showToast) {
            showSuccess(
              overrides.Language ? t("settings.languageUpdated") : t("settings.preferencesSaved")
            );
          }
        },
        onError: () => showError(t("settings.saveFailed")),
      }
    );
  };

  const handleTestNotification = async (type: "discord" | "slack") => {
    testNotification.mutate(type, {
      onSuccess: () => showSuccess(t("settings.testNotificationSent")),
      onError: () => showError(t("settings.saveFailed")),
    });
  };

  const handleGenerate2FA = async () => {
    generate2FA.mutate(undefined, {
      onSuccess: (result) => {
        setTwoFactorSecret(result.secret);
        setTwoFactorQr(result.qrCodeUrl);
        setBackupCodes([]);
      },
      onError: () => showError(t("settings.saveFailed")),
    });
  };

  const handleEnable2FA = async (code: string) => {
    enable2FA.mutate(code, {
      onSuccess: (result) => {
        setBackupCodes(result.backupCodes || []);
        setTwoFactorQr(null);
        setTwoFactorSecret(null);
        showSuccess(t("settings.2faEnabled"));
      },
      onError: () => showError(t("settings.saveFailed")),
    });
  };

  const handleDisable2FA = async (code: string) => {
    disable2FA.mutate(code, {
      onSuccess: () => {
        setTwoFactorQr(null);
        setTwoFactorSecret(null);
        setBackupCodes([]);
        showSuccess(t("settings.2faDisabled"));
      },
      onError: () => showError(t("settings.saveFailed")),
    });
  };

  const handleRegenerateBackupCodes = async () => {
    regenerateBackupCodes.mutate(undefined, {
      onSuccess: (codes) => {
        setBackupCodes(codes || []);
        showSuccess(t("settings.backupCodesRegenerated"));
      },
      onError: () => showError(t("settings.saveFailed")),
    });
  };

  const handleGenerateApiKey = async (input: ICreateApiKeyInput) => {
    try {
      return await generateApiKey.mutateAsync({
        name: input.name,
        scopes: input.scopes,
        expiresAt: input.expiresAt || undefined,
      });
    } catch {
      showError(t("settings.saveFailed"));
      return null;
    }
  };

  const handleRevokeApiKey = async (id: number) => {
    revokeApiKey.mutate(id, {
      onSuccess: () => showSuccess(t("settings.saveSuccess") || "API key revoked successfully"),
      onError: () => showError(t("settings.saveFailed")),
    });
  };

  const handleReactivateApiKey = async (id: number) => {
    reactivateApiKey.mutate(id, {
      onSuccess: () => showSuccess("API key reactivated successfully"),
      onError: () => showError(t("settings.saveFailed")),
    });
  };

  const handleRegenerateApiKey = async (id: number) => {
    try {
      return await regenerateApiKey.mutateAsync(id);
    } catch {
      showError(t("settings.saveFailed"));
      return null;
    }
  };

  const handleRevokeSession = async (id: number) => {
    revokeSession.mutate(id, { onError: () => showError(t("settings.saveFailed")) });
  };

  const handleRevokeAllSessions = async (keepId: number) => {
    revokeAllSessions.mutate(keepId, { onError: () => showError(t("settings.saveFailed")) });
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

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          showSuccess(t("settings.passwordUpdated"));
        },
        onError: () => showError(t("settings.saveFailed")),
      }
    );
  };

  const handleColorSelect = (value: string) => {
    SetColor(value as "blue" | "green" | "purple" | "orange" | "red");
    void savePreferencesPartial({ ColorTheme: value }, false);
  };

  const handleDeleteAccount = async () => {
    deleteAccount.mutate(undefined, {
      onSuccess: () => showSuccess(t("settings.deleteAccountSuccess")),
      onError: () => showError(t("settings.deleteAccountFailed")),
    });
  };

  const handleToggleMode = () => {
    ToggleMode();
    const nextTheme = Mode === "dark" ? "light" : "dark";
    void savePreferencesPartial({ Theme: nextTheme }, false);
  };

  const isLoading = settingsLoading || apiKeysLoading || sessionsLoading;

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
              label={t("settings.apiKeys")}
              icon={<SecurityIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              label={t("settings.sessions")}
              icon={<AccountIcon />}
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
          <TabPanel value={tabValue} index={0}>
            <ProfileTab
              fullName={fullName}
              username={username}
              email={email}
              lastLogin={lastLogin}
              memberSince={memberSince}
              disabled={isLoading || updateProfile.isPending}
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
              saving={updatePreferences.isPending}
              onLanguageChange={handleLanguageChange}
              onToggleMode={handleToggleMode}
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
              disabled={isLoading || updateNotificationSettings.isPending}
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
            <ApiKeysTab
              apiKeys={apiKeys}
              loading={isLoading}
              onGenerate={handleGenerateApiKey}
              onRevoke={handleRevokeApiKey}
              onReactivate={handleReactivateApiKey}
              onRegenerate={handleRegenerateApiKey}
              t={t}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <SessionsTab
              sessions={sessions}
              loading={isLoading}
              onRevoke={handleRevokeSession}
              onRevokeAll={handleRevokeAllSessions}
              t={t}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <SecurityTab
              currentPassword={currentPassword}
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              disabled={isLoading || changePassword.isPending}
              twoFactorEnabled={!!twoFAStatus?.enabled}
              twoFactorLoading={
                generate2FA.isPending ||
                enable2FA.isPending ||
                disable2FA.isPending ||
                regenerateBackupCodes.isPending
              }
              qrCodeUrl={twoFactorQr}
              secret={twoFactorSecret}
              backupCodes={backupCodes}
              onCurrentPasswordChange={setCurrentPassword}
              onNewPasswordChange={setNewPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onChangePassword={handleChangePassword}
              onGenerate2FA={handleGenerate2FA}
              onEnable2FA={handleEnable2FA}
              onDisable2FA={handleDisable2FA}
              onRegenerateBackupCodes={handleRegenerateBackupCodes}
              t={t}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={6}>
            <AccountTab t={t} onDeleteAccount={handleDeleteAccount} loading={isLoading} />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
