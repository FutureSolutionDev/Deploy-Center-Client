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
import { UserRole } from "@/contexts/RoleContext";
import ProfileTab from "@/components/Settings/ProfileTab";
import PreferencesTab from "@/components/Settings/PreferencesTab";
import NotificationsTab from "@/components/Settings/NotificationsTab";
import SecurityTab from "@/components/Settings/SecurityTab";
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
  allowedRoles?: UserRole[]; // If not specified, allowed for all roles
}

export const SettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const { role } = useRole();
  const [tabValue, setTabValue] = useState(0);

  // Define all tabs with role permissions
  const allTabs: ITabConfig[] = useMemo(() => [
    {
      label: t("settings.profile"),
      icon: <PersonIcon />,
      component: <ProfileTab t={t} />,
      // Allowed for all roles
    },
    {
      label: t("settings.preferences"),
      icon: <PaletteIcon />,
      component: <PreferencesTab t={t} />,
      // Allowed for all roles
    },
    {
      label: t("settings.notifications"),
      icon: <NotificationsIcon />,
      component: <NotificationsTab t={t} />,
      // Allowed for all roles
    },
    {
      label: t("settings.apiKeys"),
      icon: <SecurityIcon />,
      component: <ApiKeysTab t={t} />,
      allowedRoles: [UserRole.Admin, UserRole.Manager], // Only Admin and Manager
    },
    {
      label: t("settings.sessions"),
      icon: <AccountIcon />,
      component: <SessionsTab t={t} />,
      // Allowed for all roles (personal security)
    },
    {
      label: t("settings.security"),
      icon: <SecurityIcon />,
      component: <SecurityTab t={t} />,
      // Allowed for all roles
    },
  ], [t]);

  // Filter tabs based on user role
  const visibleTabs = useMemo(() => {
    return allTabs.filter(tab => {
      // If no allowedRoles specified, tab is allowed for all roles
      if (!tab.allowedRoles) {
        return true;
      }
      // Check if current user role is in the allowed roles list
      return role ? tab.allowedRoles.includes(role) : false;
    });
  }, [allTabs, role]);

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
