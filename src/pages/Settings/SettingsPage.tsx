import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const SettingsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<SecurityIcon />} label="General & Security" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<PersonIcon />} label="Users & Roles" />
        </Tabs>
      </Paper>

      <Paper>
        {/* General Settings */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>System Configuration</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600 }}>
            <TextField
              label="Log Retention (Days)"
              type="number"
              defaultValue={30}
              fullWidth
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable Maintenance Mode"
            />
            <Divider />
            <Typography variant="h6" gutterBottom>Security</Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enforce 2FA for Admins"
            />
            <FormControlLabel
              control={<Switch />}
              label="Allow Public Registration"
            />
            <Box>
              <Button variant="contained" startIcon={<SaveIcon />}>
                Save Changes
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Notification Channels</Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Discord Webhooks"
                secondary="Send deployment notifications to Discord channels"
              />
              <ListItemSecondaryAction>
                <Switch defaultChecked />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemText
                primary="Email Notifications"
                secondary="Send critical alerts via email"
              />
              <ListItemSecondaryAction>
                <Switch />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemText
                primary="Slack Integration"
                secondary="Connect with Slack workspace"
              />
              <ListItemSecondaryAction>
                <Switch />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </TabPanel>

        {/* User Settings */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>User Management</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Manage users and their permissions.
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, textAlign: 'center' }}>
            <Typography>User management table will be implemented here.</Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};
