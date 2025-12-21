import React, { useState } from "react";
import { Box, Card, CardContent, Tab, Tabs, Typography } from "@mui/material";
import {
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { useLanguage } from "@/contexts/LanguageContext";
import ProfileTab from "@/components/Settings/ProfileTab";
import PreferencesTab from "@/components/Settings/PreferencesTab";
import NotificationsTab from "@/components/Settings/NotificationsTab";
import SecurityTab from "@/components/Settings/SecurityTab";
import AccountTab from "@/components/Settings/AccountTab";
import ApiKeysTab from "@/components/Settings/ApiKeysTab";
import SessionsTab from "@/components/Settings/SessionsTab";

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
  const { t } = useLanguage();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTabValue(newValue);

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
            <ProfileTab t={t} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <PreferencesTab t={t} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <NotificationsTab t={t} />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <ApiKeysTab t={t} />
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <SessionsTab t={t} />
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <SecurityTab t={t} />
          </TabPanel>

          <TabPanel value={tabValue} index={6}>
            <AccountTab t={t} />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
