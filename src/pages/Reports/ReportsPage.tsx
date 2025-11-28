import React, { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Divider,
    alpha,
} from "@mui/material";
import {
    Download as DownloadIcon,
    Assessment as AssessmentIcon,
    TrendingUp as TrendingUpIcon,
    PieChart as PieChartIcon,
} from "@mui/icons-material";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

export const ReportsPage: React.FC = () => {
    const { t } = useLanguage();
    const { } = useTheme();

    const [dateRange, setDateRange] = useState("last30");
    const [reportType, setReportType] = useState("overview");

    // Mock data for charts/stats
    const stats = {
        totalDeployments: 145,
        successRate: 92,
        avgDuration: "4m 12s",
        activeProjects: 8,
    };

    const handleExport = (format: "pdf" | "csv") => {
        // Mock export functionality
        console.log(`Exporting report as ${format}...`);
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 3 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                            {t("reports.title")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("reports.overview")}
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleExport("csv")}
                        >
                            CSV
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleExport("pdf")}
                        >
                            PDF
                        </Button>
                    </Box>
                </Box>

                {/* Filters */}
                <Card sx={{ mb: 4 }}>
                    <CardContent>
                        <Grid container spacing={3} alignItems="center">
                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>{t("reports.dateRange")}</InputLabel>
                                    <Select
                                        value={dateRange}
                                        label={t("reports.dateRange")}
                                        onChange={(e) => setDateRange(e.target.value)}
                                    >
                                        <MenuItem value="last7">{t("reports.last7Days")}</MenuItem>
                                        <MenuItem value="last30">{t("reports.last30Days")}</MenuItem>
                                        <MenuItem value="thisMonth">{t("reports.thisMonth")}</MenuItem>
                                        <MenuItem value="custom">{t("reports.customRange")}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Report Type</InputLabel>
                                    <Select
                                        value={reportType}
                                        label="Report Type"
                                        onChange={(e) => setReportType(e.target.value)}
                                    >
                                        <MenuItem value="overview">{t("reports.overview")}</MenuItem>
                                        <MenuItem value="projects">{t("reports.deploymentsByProject")}</MenuItem>
                                        <MenuItem value="status">{t("reports.deploymentsByStatus")}</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<AssessmentIcon />}
                                    color="secondary"
                                >
                                    {t("reports.generate")}
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 3, textAlign: "center", height: "100%" }}>
                        <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                            {stats.totalDeployments}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("dashboard.totalDeployments")}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 3, textAlign: "center", height: "100%" }}>
                        <Typography variant="h3" color="success.main" sx={{ fontWeight: 700, mb: 1 }}>
                            {stats.successRate}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("reports.successRate")}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 3, textAlign: "center", height: "100%" }}>
                        <Typography variant="h3" color="info.main" sx={{ fontWeight: 700, mb: 1 }}>
                            {stats.avgDuration}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("dashboard.averageDuration")}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 3, textAlign: "center", height: "100%" }}>
                        <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700, mb: 1 }}>
                            {stats.activeProjects}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t("dashboard.activeProjects")}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Charts Section (Mocked UI) */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {t("reports.deploymentsTrend")}
                                </Typography>
                                <TrendingUpIcon color="action" />
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <Box
                                sx={{
                                    height: 300,
                                    display: "flex",
                                    alignItems: "flex-end",
                                    justifyContent: "space-around",
                                    px: 2,
                                    pb: 2,
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                                    borderRadius: 2,
                                }}
                            >
                                {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            width: "8%",
                                            height: `${height}%`,
                                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.6),
                                            borderRadius: "4px 4px 0 0",
                                            transition: "all 0.3s",
                                            "&:hover": {
                                                height: `${height + 5}%`,
                                                bgcolor: "primary.main",
                                            },
                                        }}
                                    />
                                ))}
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-around", mt: 1 }}>
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                                    <Typography key={day} variant="caption" color="text.secondary">
                                        {day}
                                    </Typography>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: "100%" }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {t("reports.deploymentsByStatus")}
                                </Typography>
                                <PieChartIcon color="action" />
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <Box sx={{ position: "relative", height: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                {/* Simple CSS Pie Chart Mock */}
                                <Box
                                    sx={{
                                        width: 200,
                                        height: 200,
                                        borderRadius: "50%",
                                        background: `conic-gradient(
                      ${(theme: any) => theme.palette.success.main} 0% 70%, 
                      ${(theme: any) => theme.palette.error.main} 70% 85%, 
                      ${(theme: any) => theme.palette.warning.main} 85% 100%
                    )`,
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: "absolute",
                                        width: 140,
                                        height: 140,
                                        borderRadius: "50%",
                                        bgcolor: "background.paper",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexDirection: "column",
                                    }}
                                >
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        145
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Total
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "success.main" }} />
                                        <Typography variant="body2">Success</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>70%</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "error.main" }} />
                                        <Typography variant="body2">Failed</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>15%</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "warning.main" }} />
                                        <Typography variant="body2">Pending</Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>15%</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};
