import React, { useState, useMemo } from "react";
import { Box, Card, CardContent, Tab, Tabs, Typography } from "@mui/material";
import {
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRole } from "@/contexts/RoleContext";
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

interface ITabConfig {
  label: string;
  icon: React.ReactElement;
  component: React.ReactElement;
  allowedForViewer: boolean;
}

export const SettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const { isViewer } = useRole();
  const [tabValue, setTabValue] = useState(0);

  // Define all tabs with role permissions
  const allTabs: ITabConfig[] = useMemo(() => [
    {
      label: t("settings.profile"),
      icon: <PersonIcon />,
      component: <ProfileTab t={t} />,
      allowedForViewer: true,
    },
    {
      label: t("settings.preferences"),
      icon: <PaletteIcon />,
      component: <PreferencesTab t={t} />,
      allowedForViewer: true,
    },
    {
      label: t("settings.notifications"),
      icon: <NotificationsIcon />,
      component: <NotificationsTab t={t} />,
      allowedForViewer: true,
    },
    {
      label: t("settings.apiKeys"),
      icon: <SecurityIcon />,
      component: <ApiKeysTab t={t} />,
      allowedForViewer: false, // API Keys hidden from Viewer
    },
    {
      label: t("settings.sessions"),
      icon: <AccountIcon />,
      component: <SessionsTab t={t} />,
      allowedForViewer: true, // Sessions are personal, allowed
    },
    {
      label: t("settings.security"),
      icon: <SecurityIcon />,
      component: <SecurityTab t={t} />,
      allowedForViewer: true,
    },
    {
      label: t("settings.account"),
      icon: <AccountIcon />,
      component: <AccountTab t={t} />,
      allowedForViewer: false, // Delete Account hidden from Viewer
    },
  ], [t]);

  // Filter tabs based on user role
  const visibleTabs = useMemo(() => {
    if (isViewer) {
      return allTabs.filter(tab => tab.allowedForViewer);
    }
    return allTabs;
  }, [allTabs, isViewer]);

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
            {visibleTabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ minHeight: 64 }}
              />
            ))}
          </Tabs>
        </Box>

        <CardContent>
          {visibleTabs.map((tab, index) => (
            <TabPanel key={index} value={tabValue} index={index}>
              {tab.component}
            </TabPanel>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage;
