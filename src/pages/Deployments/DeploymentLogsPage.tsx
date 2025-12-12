import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  alpha,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Replay as RetryIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DeploymentsService } from "@/services/deploymentsService";
import { useDateFormatter } from "@/hooks/useDateFormatter";
import type { IDeployment } from "@/types";

export const DeploymentLogsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { formatDateTime } = useDateFormatter();
  const logsEndRef = useRef<HTMLDivElement>(null);

  const [deployment, setDeployment] = useState<IDeployment | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll] = useState(true);

  const fetchDeployment = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const deployment = await DeploymentsService.getById(Number(id));
      setDeployment(deployment);
    } catch (error: unknown) {
      setError((error as any)?.message || t("deployments.failedToLoad"));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  const fetchLogs = useCallback(async () => {
    if (!id) return;

    try {
      const logsText = await DeploymentsService.getLogs(Number(id));

      // Split logs by newline and filter empty lines
      const logsArray = logsText
        .split('\n')
        .filter((line) => line.trim().length > 0);

      setLogs(logsArray);
    } catch (error: unknown) {
      console.error('Failed to fetch logs:', error);
      // Don't show error for logs, just keep existing logs
    }
  }, [id]);

  useEffect(() => {
    fetchDeployment();
    fetchLogs();

    // Auto-refresh logs every 3 seconds if deployment is in progress
    let interval: number | null = null;

    if (deployment?.Status === 'inProgress') {
      interval = setInterval(() => {
        fetchLogs();
        fetchDeployment();
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, deployment?.Status, fetchDeployment, fetchLogs]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactElement; label: string }> = {
      success: { color: "success", icon: <SuccessIcon fontSize="small" />, label: t("deployments.success") },
      failed: { color: "error", icon: <ErrorIcon fontSize="small" />, label: t("deployments.failed") },
      inProgress: { color: "warning", icon: <ScheduleIcon fontSize="small" />, label: t("deployments.inProgress") },
      pending: { color: "default", icon: <ScheduleIcon fontSize="small" />, label: t("deployments.pending") },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return <Chip label={config.label} color={config.color as any} size="small" icon={config.icon || undefined} />;
  };

  const getLogColor = (log: string) => {
    if (log.includes("[ERROR]") || log.includes("[FAILED]")) return "error.main";
    if (log.includes("[SUCCESS]")) return "success.main";
    if (log.includes("[WARNING]")) return "warning.main";
    if (log.includes("[INFO]")) return "info.main";
    return "text.primary";
  };

  const handleDownloadLogs = () => {
    const logsText = logs.join("\n");
    const blob = new Blob([logsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deployment-${id}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !deployment) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || t("deployments.notFound")}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate("/deployments")}>
          {t("common.backToDeployments")}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate("/deployments")}
          sx={{ mb: 2 }}
        >
          {t("common.backToDeployments")}
        </Button>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              {t("deployments.logsTitle", { id })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {deployment.ProjectName} • {deployment.Branch}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton onClick={fetchDeployment}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadLogs}
            >
              {t("logs.downloadLogs")}
            </Button>
            {deployment.Status === "failed" && (
              <Button
                variant="contained"
                startIcon={<RetryIcon />}
                onClick={async () => {
                  try {
                    await DeploymentsService.retry(Number(id));
                    // Refresh deployment and logs after retry
                    fetchDeployment();
                    fetchLogs();
                  } catch (error) {
                    console.error('Failed to retry deployment:', error);
                  }
                }}
              >
                {t("deployments.retryDeployment")}
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Deployment Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("deployments.status")}
              </Typography>
              <Box sx={{ mt: 0.5 }}>{getStatusChip(deployment.Status)}</Box>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("deployments.branch")}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                {deployment.Branch}
              </Typography>
            </Box>

            {deployment.Commit && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("deployments.commit")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.5,
                    fontFamily: "monospace",
                    bgcolor: (theme) => alpha(theme.palette.text.primary, 0.05),
                    px: 1,
                    py: 0.5,
                    borderRadius: 0.5,
                  }}
                >
                  {deployment.Commit.substring(0, 7)}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("deployments.startedAt")}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {formatDateTime(deployment.CreatedAt)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Logs Terminal */}
      <Paper
        sx={{
          bgcolor: "#1e1e1e",
          color: "#d4d4d4",
          p: 3,
          borderRadius: 2,
          fontFamily: "monospace",
          fontSize: "0.875rem",
          maxHeight: "600px",
          overflow: "auto",
          boxShadow: 3,
          position: "relative",
        }}
      >
        {/* Terminal Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            pb: 2,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "#ff5f56",
              }}
            />
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "#ffbd2e",
              }}
            />
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: "#27c93f",
              }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{ ml: 2, color: "rgba(255,255,255,0.6)" }}
          >
            deployment-{id}.log
          </Typography>
        </Box>

        {/* Logs */}
        <Box>
          {logs.length === 0 ? (
            <Typography sx={{ color: "rgba(255,255,255,0.6)", fontStyle: "italic" }}>
              {t("deployments.noLogsAvailable") || "No logs available yet..."}
            </Typography>
          ) : (
            logs.map((log, index) => (
              <Box
                key={index}
                sx={{
                  mb: 0.5,
                  color: getLogColor(log),
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {log}
              </Box>
            ))
          )}
          <div ref={logsEndRef} />
        </Box>

        {/* Live indicator for in-progress deployments */}
        {deployment.Status === "inProgress" && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "rgba(0,0,0,0.5)",
              px: 2,
              py: 1,
              borderRadius: 1,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "#27c93f",
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.3 },
                },
              }}
            />
            <Typography variant="caption" sx={{ color: "#27c93f" }}>
              {t("deployments.liveIndicator")}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
