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
    setSuccess("Language updated successfully!");
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleSaveProfile = () => {
    // API call to update profile
    setSuccess("Profile updated successfully!");
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleSaveNotifications = () => {
    // API call to update notification settings
    setSuccess("Notification settings saved successfully!");
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
          Manage your account settings and preferences
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
              label="Profile"
              icon={<PersonIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              label="Preferences"
              icon={<PaletteIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              label="Notifications"
              icon={<NotificationsIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              label="Security"
              icon={<SecurityIcon />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              label="Account"
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
              Profile Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button variant="contained" onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Preferences Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Appearance & Language
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={4}>
              {/* Language Selection */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={Language}
                    label="Language"
                    onChange={(e) => handleLanguageChange(e.target.value as "en" | "ar")}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="ar">العربية (Arabic)</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  Changes apply immediately
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
                  label={`Dark Mode ${Mode === "dark" ? "On" : "Off"}`}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  Toggle between light and dark theme
                </Typography>
              </Grid>

              {/* Color Theme Selection */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Color Theme
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
                  {["blue", "green", "purple", "orange", "red"].map((color) => (
                    <Box
                      key={color}
                      onClick={() => {
                        SetColor(color as string);
                        setSuccess("Color theme updated successfully!");
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
                  Select your preferred color theme • Changes apply instantly
                </Typography>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Notification Settings
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
                  label="Email Notifications"
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  Receive deployment notifications via email
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Discord Webhook URL"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Slack Webhook URL"
                  placeholder="https://hooks.slack.com/services/..."
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button variant="contained" onClick={handleSaveNotifications}>
                  Save Notification Settings
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Security Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Change Password
                </Typography>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  sx={{ mb: 2 }}
                />
                <Button variant="contained">Update Password</Button>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Two-Factor Authentication
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add an extra layer of security to your account
                </Typography>
                <Button variant="outlined">Enable 2FA</Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Account Tab */}
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Account Management
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
                Danger Zone
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Once you delete your account, there is no going back. Please be certain.
              </Typography>
              <Button variant="outlined" color="error">
                Delete Account
              </Button>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};
