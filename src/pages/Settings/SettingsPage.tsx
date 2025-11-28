import React, { useState } from "react";
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
  Grid,
  alpha,
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

  // Profile state
  const [username, setUsername] = useState(User?.Username || "");
  const [email, setEmail] = useState(User?.Email || "");

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [slackWebhook, setSlackWebhook] = useState("");

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSuccess(null);
    setError(null);
  };

  const handleLanguageChange = (newLanguage: "en" | "ar") => {
    ChangeLanguage(newLanguage);
    setSuccess(t("settings.languageUpdated"));
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleSaveProfile = () => {
    // API call to update profile
    setSuccess(t("settings.profileUpdated"));
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSaveNotifications = () => {
    // API call to update notification settings
    setSuccess(t("settings.notificationsSaved"));
    setTimeout(() => setSuccess(null), 3000);
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
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={t("settings.username")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={t("settings.email")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button variant="contained" onClick={handleSaveProfile}>
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
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>{t("settings.language")}</InputLabel>
                  <Select
                    value={Language}
                    label={t("settings.language")}
                    onChange={(e) => handleLanguageChange(e.target.value as "en" | "ar")}
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
              <Grid size={{ xs: 12, md: 6 }}>
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

              {/* Color Theme Selection */}
              <Grid size={{ xs: 12 }}>
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
            </Grid>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {t("settings.notificationSettings")}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                  }
                  label={t("settings.emailNotifications")}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  {t("settings.receiveEmailNotifications")}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label={t("settings.discordWebhook")}
                  placeholder={t("settings.discordWebhookPlaceholder")}
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label={t("settings.slackWebhook")}
                  placeholder={t("settings.slackWebhookPlaceholder")}
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button variant="contained" onClick={handleSaveNotifications}>
                  {t("settings.saveNotificationSettings")}
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
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {t("settings.changePassword")}
                </Typography>
                <TextField
                  fullWidth
                  label={t("settings.currentPassword")}
                  type="password"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label={t("settings.newPassword")}
                  type="password"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label={t("settings.confirmNewPassword")}
                  type="password"
                  sx={{ mb: 2 }}
                />
                <Button variant="contained">{t("settings.updatePassword")}</Button>
              </Grid>

              <Grid size={{ xs: 12 }}>
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
