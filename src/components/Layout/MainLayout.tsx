/**
 * Main Layout Component
 * Provides the main app layout with sidebar, header, and content area
 */

import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  FolderCopy as ProjectsIcon,
  Rocket as DeploymentsIcon,
  ReceiptLong as ReportsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle,
  Brightness4,
  Brightness7,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

const DRAWER_WIDTH = 240;

interface IMenuItem {
  Title: string;
  TitleAr: string;
  Path: string;
  Icon: React.ReactNode;
}

const MenuItems: IMenuItem[] = [
  {
    Title: "Dashboard",
    TitleAr: "لوحة التحكم",
    Path: "/dashboard",
    Icon: <DashboardIcon />,
  },
  {
    Title: "Projects",
    TitleAr: "المشاريع",
    Path: "/projects",
    Icon: <ProjectsIcon />,
  },
  {
    Title: "Deployments",
    TitleAr: "النشر",
    Path: "/deployments",
    Icon: <DeploymentsIcon />,
  },
  {
    Title: "Reports",
    TitleAr: "التقارير",
    Path: "/reports",
    Icon: <ReportsIcon />,
  },
  {
    Title: "Settings",
    TitleAr: "الإعدادات",
    Path: "/settings",
    Icon: <SettingsIcon />,
  },
];

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const { User, Logout } = useAuth();
  const { Mode, ToggleMode } = useTheme();
  const { Language, ChangeLanguage, t } = useLanguage();

  const [MobileOpen, setMobileOpen] = useState(false);
  const [UserMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const HandleDrawerToggle = () => {
    setMobileOpen(!MobileOpen);
  };

  const HandleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const HandleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const HandleLogout = () => {
    HandleUserMenuClose();
    Logout();
    navigate("/login");
  };

  const HandleLanguageToggle = () => {
    ChangeLanguage(Language === "en" ? "ar" : "en");
  };

  const DrawerContent = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          {t("app.name")}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {MenuItems.map((item) => {
          const isActive = location.pathname === item.Path;
          return (
            <ListItem key={item.Path} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  navigate(item.Path);
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
              >
                <ListItemIcon>{item.Icon}</ListItemIcon>
                <ListItemText
                  primary={Language === "ar" ? item.TitleAr : item.Title}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const isRTL = Language === 'ar';

  return (
    <Box sx={{ display: "flex" }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { xs: 0, md: isRTL ? 0 : `${DRAWER_WIDTH}px` },
          mr: { xs: 0, md: isRTL ? `${DRAWER_WIDTH}px` : 0 },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={HandleDrawerToggle}
            sx={{ [isRTL ? 'ml' : 'mr']: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {t("app.name")}
          </Typography>

          {/* Theme Toggle */}
          <IconButton color="inherit" onClick={ToggleMode}>
            {Mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {/* Language Toggle */}
          <IconButton color="inherit" onClick={HandleLanguageToggle}>
            <LanguageIcon />
          </IconButton>

          {/* User Menu */}
          <IconButton color="inherit" onClick={HandleUserMenuOpen}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>
              {User?.Username?.charAt(0).toUpperCase() || "U"}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={UserMenuAnchor}
            open={Boolean(UserMenuAnchor)}
            onClose={HandleUserMenuClose}
          >
            <MenuItem disabled>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>{User?.Username || "User"}</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={HandleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t("auth.logout")}</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          anchor={isRTL ? "right" : "left"}
          open={MobileOpen}
          onClose={HandleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
        >
          {DrawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          anchor={isRTL ? "right" : "left"}
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {DrawerContent}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100dvw - ${DRAWER_WIDTH}px)` },
          minHeight: "100dvh",
          bgcolor: "background.default",
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
};
