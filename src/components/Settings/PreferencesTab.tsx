import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Typography,
} from "@mui/material";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { useUserSettings, useUpdatePreferences } from "@/hooks/useUserSettings";
import type { IUserSettings } from "@/types";

interface IPreferencesTabProps {
  t: (key: string) => string;
}

export const PreferencesTab: React.FC<IPreferencesTabProps> = ({ t }) => {
  const { Language, ChangeLanguage } = useLanguage();
  const { Mode, Color, ToggleMode, SetColor } = useTheme();
  const { showSuccess, showError } = useToast();
  const { data: settings } = useUserSettings();
  const updatePreferences = useUpdatePreferences();

  // Local state for form fields
  const [timezone, setTimezone] = useState(settings?.Timezone || "UTC");
  const [dateFormat, setDateFormat] = useState(settings?.DateFormat || "YYYY-MM-DD");
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">(
    (settings?.TimeFormat as "12h" | "24h") || "24h"
  );
  // Synchronize local state with settings if it changes
  useEffect(() => {
    if (settings) {
      setTimezone(settings.Timezone || "UTC");
      setDateFormat(settings.DateFormat || "YYYY-MM-DD");
      setTimeFormat(settings.TimeFormat as "12h" | "24h" || "24h");
    }
  }, [settings])
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
  const colors = ["blue", "green", "purple", "orange", "red"];

  const savePreferencesPartial = (overrides: Partial<IUserSettings>, showToast: boolean = true) => {
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

  const handleLanguageChange = (newLanguage: "en" | "ar") => {
    ChangeLanguage(newLanguage);
    savePreferencesPartial({ Language: newLanguage });
  };

  const handleToggleMode = () => {
    ToggleMode();
    const nextTheme = Mode === "dark" ? "light" : "dark";
    savePreferencesPartial({ Theme: nextTheme }, false);
  };

  const handleColorSelect = (value: string) => {
    SetColor(value as "blue" | "green" | "purple" | "orange" | "red");
    savePreferencesPartial({ ColorTheme: value }, false);
  };

  const handleSave = () => {
    savePreferencesPartial({});
  };

  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {t("settings.appearanceLanguage")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("settings.changesApplyImmediately")}
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel>{t("settings.language")}</InputLabel>
            <Select
              value={Language}
              label={t("settings.language")}
              onChange={(e) => handleLanguageChange(e.target.value as "en" | "ar")}
              disabled={updatePreferences.isPending}
            >
              <MenuItem value="en">{t("settings.english")}</MenuItem>
              <MenuItem value="ar">{t("settings.arabic")}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Switch
                checked={Mode === "dark"}
                onChange={handleToggleMode}
                disabled={updatePreferences.isPending}
              />
            }
            label={Mode === "dark" ? t("settings.darkModeOn") : t("settings.darkModeOff")}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            {t("settings.toggleTheme")}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth>
            <InputLabel>{t("settings.timezone")}</InputLabel>
            <Select
              value={timezone}
              label={t("settings.timezone")}
              onChange={(e) => setTimezone(e.target.value)}
              disabled={updatePreferences.isPending}
            >
              {timezoneOptions.map((tz) => (
                <MenuItem key={tz} value={tz}>
                  {tz}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel>{t("settings.dateFormat")}</InputLabel>
            <Select
              value={dateFormat}
              label={t("settings.dateFormat")}
              onChange={(e) => setDateFormat(e.target.value)}
              disabled={updatePreferences.isPending}
            >
              {dateFormatOptions.map((fmt) => (
                <MenuItem key={fmt} value={fmt}>
                  {fmt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel>{t("settings.timeFormat")}</InputLabel>
            <Select
              value={timeFormat}
              label={t("settings.timeFormat")}
              onChange={(e) => setTimeFormat(e.target.value as "12h" | "24h")}
              disabled={updatePreferences.isPending}
            >
              {timeFormatOptions.map((fmt) => (
                <MenuItem key={fmt} value={fmt}>
                  {fmt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            {t("settings.colorTheme")}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
            {colors.map((option) => (
              <Box
                key={option}
                onClick={() => handleColorSelect(option)}
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 2,
                  bgcolor: `${option}`,
                  cursor: "pointer",
                  border: 3,
                  borderColor: Color === option ? "text.primary" : "transparent",
                  transition: "all 0.2s",
                  position: "relative",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                {Color === option && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "white",
                      fontSize: 18,
                      fontWeight: 700,
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

        <Grid size={12}>
          <Button variant="contained" onClick={handleSave} disabled={updatePreferences.isPending}>
            {t("settings.saveChanges")}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default PreferencesTab;
