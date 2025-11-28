import React, { useEffect, useState, useRef } from "react";
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
  Divider,
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
import { useLanguage } from "@/contexts/LanguageContext";
import { DeploymentsService, type IDeployment } from "@/services/deploymentsService";

export const DeploymentLogsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const logsEndRef = useRef<HTMLDivElement>(null);

  const [deployment, setDeployment] = useState<IDeployment | null>(null);
  const [logs, setLogs] = useState<string[]>([
    "[INFO] Starting deployment...",
    "[INFO] Fetching latest code from repository...",
    "[INFO] Installing dependencies...",
    "[INFO] Running build process...",
    "[SUCCESS] Build completed successfully",
    "[INFO] Deploying to production server...",
    "[SUCCESS] Deployment completed successfully",
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const fetchDeployment = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const deployment = await DeploymentsService.getById(Number(id));
      setDeployment(deployment);
    } catch (error: any) {
      setError(error?.message || "Failed to load deployment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployment();
  }, [id]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, { color: any; icon: React.ReactNode; label: string }> = {
      success: { color: "success", icon: <SuccessIcon fontSize="small" />, label: "Success" },
      failed: { color: "error", icon: <ErrorIcon fontSize="small" />, label: "Failed" },
      in_progress: { color: "warning", icon: <ScheduleIcon fontSize="small" />, label: "In Progress" },
      pending: { color: "default", icon: <ScheduleIcon fontSize="small" />, label: "Pending" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return <Chip label={config.label} color={config.color} size="small" icon={config.icon} />;
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
          {error || "Deployment not found"}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate("/deployments")}>
          Back to Deployments
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
          Back to Deployments
        </Button>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Deployment Logs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {deployment.projectName} • {deployment.branch}
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
              Download Logs
            </Button>
            {deployment.status === "failed" && (
              <Button
                variant="contained"
                startIcon={<RetryIcon />}
                onClick={() => {
                  /* Retry logic */
                }}
              >
                Retry Deployment
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
                Status
              </Typography>
              <Box sx={{ mt: 0.5 }}>{getStatusChip(deployment.status)}</Box>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Branch
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                {deployment.branch}
              </Typography>
            </Box>

            {deployment.commit && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Commit
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
                  {deployment.commit.substring(0, 7)}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="caption" color="text.secondary">
                Started At
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {deployment.timestamp}
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
          {logs.map((log, index) => (
            <Box
              key={index}
              sx={{
                mb: 0.5,
                color: getLogColor(log),
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <Typography
                component="span"
                sx={{ color: "rgba(255,255,255,0.4)", mr: 2, fontSize: "0.75rem" }}
              >
                {new Date().toLocaleTimeString()}
              </Typography>
              {log}
            </Box>
          ))}
          <div ref={logsEndRef} />
        </Box>

        {/* Live indicator for in-progress deployments */}
        {deployment.status === "in_progress" && (
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
              LIVE
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
