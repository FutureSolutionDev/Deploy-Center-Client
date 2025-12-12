import React from "react";
import Grid from "@mui/material/GridLegacy";
import { Box, Button, FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch, Typography } from "@mui/material";

interface IPreferencesTabProps {
  language: "en" | "ar";
  mode: "light" | "dark";
  color: string;
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  timezoneOptions: string[];
  dateFormatOptions: string[];
  timeFormatOptions: Array<"12h" | "24h">;
  colors?: string[];
  disabled?: boolean;
  saving?: boolean;
  onLanguageChange: (lang: "en" | "ar") => void;
  onToggleMode: () => void;
  onColorSelect: (color: string) => void;
  onTimezoneChange: (tz: string) => void;
  onDateFormatChange: (fmt: string) => void;
  onTimeFormatChange: (fmt: "12h" | "24h") => void;
  onSave: () => void;
  t: (key: string) => string;
}

export const PreferencesTab: React.FC<IPreferencesTabProps> = ({
  language,
  mode,
  color,
  timezone,
  dateFormat,
  timeFormat,
  timezoneOptions,
  dateFormatOptions,
  timeFormatOptions,
  colors = ["blue", "green", "purple", "orange", "red"],
  disabled,
  saving,
  onLanguageChange,
  onToggleMode,
  onColorSelect,
  onTimezoneChange,
  onDateFormatChange,
  onTimeFormatChange,
  onSave,
  t,
}) => {
  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {t("settings.appearanceLanguage")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("settings.changesApplyImmediately")}
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>{t("settings.language")}</InputLabel>
            <Select
              value={language}
              label={t("settings.language")}
              onChange={(e) => onLanguageChange(e.target.value as "en" | "ar")}
              disabled={saving || disabled}
            >
              <MenuItem value="en">{t("settings.english")}</MenuItem>
              <MenuItem value="ar">{t("settings.arabic")}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={<Switch checked={mode === "dark"} onChange={onToggleMode} disabled={saving || disabled} />}
            label={mode === "dark" ? t("settings.darkModeOn") : t("settings.darkModeOff")}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            {t("settings.toggleTheme")}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>{t("settings.timezone")}</InputLabel>
            <Select
              value={timezone}
              label={t("settings.timezone")}
              onChange={(e) => onTimezoneChange(e.target.value)}
              disabled={saving || disabled}
            >
              {timezoneOptions.map((tz) => (
                <MenuItem key={tz} value={tz}>
                  {tz}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>{t("settings.dateFormat")}</InputLabel>
            <Select
              value={dateFormat}
              label={t("settings.dateFormat")}
              onChange={(e) => onDateFormatChange(e.target.value)}
              disabled={saving || disabled}
            >
              {dateFormatOptions.map((fmt) => (
                <MenuItem key={fmt} value={fmt}>
                  {fmt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>{t("settings.timeFormat")}</InputLabel>
            <Select
              value={timeFormat}
              label={t("settings.timeFormat")}
              onChange={(e) => onTimeFormatChange(e.target.value as "12h" | "24h")}
              disabled={saving || disabled}
            >
              {timeFormatOptions.map((fmt) => (
                <MenuItem key={fmt} value={fmt}>
                  {fmt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            {t("settings.colorTheme")}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
            {colors.map((option) => (
              <Box
                key={option}
                onClick={() => onColorSelect(option)}
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: 2,
                  bgcolor: `${option}`,
                  cursor: "pointer",
                  border: 3,
                  borderColor: color === option ? "text.primary" : "transparent",
                  transition: "all 0.2s",
                  position: "relative",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                {color === option && (
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

        <Grid item xs={12}>
          <Button variant="contained" onClick={onSave} disabled={saving || disabled}>
            {t("settings.saveChanges")}
          </Button>
        </Grid>
      </Grid>
    </>
  );
};

export default PreferencesTab;
