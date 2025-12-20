import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  alpha,
  Alert,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Rocket as DeployIcon,
  Replay as RetryIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { useDeployments, useCancelDeployment, useRetryDeployment } from "@/hooks/useDeployments";
import { useSocket, useDeploymentEvents } from "@/hooks/useSocket";
import { useDateFormatter } from "@/hooks/useDateFormatter";

export const DeploymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { formatDateTime } = useDateFormatter();
  const { showSuccess, showError } = useToast();

  // React Query hooks
  const { data: deployments = [], isLoading, error, refetch } = useDeployments();
  const cancelDeployment = useCancelDeployment();
  const retryDeployment = useRetryDeployment();

  // Local UI state for filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Real-time updates via Socket.IO
  const { isConnected } = useSocket();

  useDeploymentEvents(
    () => refetch(), // onUpdate - refetch from cache or server
    () => refetch()  // onComplete - refetch from cache or server
  );

  const handleCancel = async (id: number) => {
    if (!window.confirm(t("deployments.confirmCancel"))) return;

    cancelDeployment.mutate(id, {
      onSuccess: () => {
        showSuccess("Deployment cancelled successfully");
      },
      onError: (error: Error) => {
        showError(error?.message || "Failed to cancel deployment");
      },
    });
  };

  const handleRetry = async (id: number) => {
    if (!window.confirm(t("deployments.confirmRetry"))) return;

    retryDeployment.mutate(id, {
      onSuccess: () => {
        showSuccess("Deployment retry initiated successfully");
      },
      onError: (error: Error) => {
        showError(error?.message || "Failed to retry deployment");
      },
    });
  };

  // Memoized filtered deployments (client-side filtering)
  const filteredDeployments = useMemo(() => {
    let filtered = deployments;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.Status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (d) =>
          (d.ProjectName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.Branch.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [deployments, statusFilter, searchQuery]);

  const getStatusChip = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; icon: React.ReactElement; label: string }
    > = {
      success: {
        color: "success",
        icon: <SuccessIcon fontSize="small" />,
        label: t("deployments.statuses.success"),
      },
      failed: {
        color: "error",
        icon: <ErrorIcon fontSize="small" />,
        label: t("deployments.statuses.failed"),
      },
      inProgress: {
        color: "warning",
        icon: <ScheduleIcon fontSize="small" />,
        label: t("deployments.statuses.inProgress"),
      },
      pending: {
        color: "default",
        icon: <ScheduleIcon fontSize="small" />,
        label: t("deployments.statuses.pending"),
      },
      queued: {
        color: "default",
        icon: <ScheduleIcon fontSize="small" />,
        label: t("deployments.statuses.queued"),
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Chip
        label={config.label}
        color={config.color as any}
        size="small"
        icon={config.icon || undefined}
      />
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              {t("deployments.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("deployments.description")}
            </Typography>
          </Box>

          <Button
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {t("common.refresh")}
          </Button>
        </Box>

        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField
            placeholder={t("deployments.searchPlaceholder")}
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t("deployments.statusLabel")}</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">{t("deployments.allStatuses")}</MenuItem>
              <MenuItem value="success">{t("deployments.success")}</MenuItem>
              <MenuItem value="failed">{t("deployments.failed")}</MenuItem>
              <MenuItem value="inProgress">{t("deployments.inProgress")}</MenuItem>
              <MenuItem value="pending">{t("deployments.pending")}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message}
        </Alert>
      )}

      {/* Deployments Table */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && filteredDeployments.length === 0 && (
        <Card sx={{ textAlign: "center", py: 8 }}>
          <DeployIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {deployments.length === 0
              ? t("deployments.noDeployments")
              : t("deployments.noDeploymentsMatch")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {deployments.length === 0
              ? t("deployments.deployToSee")
              : t("deployments.adjustFilters")}
          </Typography>
        </Card>
      )}

      {!isLoading && filteredDeployments.length > 0 && (
        <TableContainer
          component={Paper}
          elevation={2}
          variant="outlined"
          sx={{
            boxShadow: 2,
            borderRadius: 2,
            maxHeight: '60dvh',
            overflow: "auto",
          }}
        >
          <Table>
            <TableHead
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1,
                backgroundColor: 'background.paper',
              }}
            >
              <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>{t("deployments.project")}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t("deployments.branch")}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t("common.status")}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t("deployments.commit")}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t("deployments.timestamp")}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t("common.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDeployments.map((deployment) => (
                <TableRow
                  key={deployment.Id}
                  sx={{
                    "&:hover": {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                    },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {deployment?.Project?.Name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={deployment?.Branch} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{getStatusChip(deployment.Status)}</TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "monospace",
                        bgcolor: (theme) => alpha(theme.palette.text.primary, 0.05),
                        px: 1,
                        py: 0.5,
                        borderRadius: 0.5,
                      }}
                    >
                      {(deployment as any).CommitHash?.substring(0, 7) || "N/A"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDateTime(deployment.CreatedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate(`/deployments/${deployment.Id}`)}
                    >
                      {t("deployments.viewLogs")}
                    </Button>

                    {(deployment.Status === 'queued' || deployment.Status === 'inProgress') && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleCancel(deployment.Id)}
                        sx={{ ml: 1 }}
                        disabled={cancelDeployment.isPending}
                      >
                        {t("common.cancel")}
                      </Button>
                    )}

                    {deployment.Status === 'failed' && (
                      <Button
                        size="small"
                        color="warning"
                        startIcon={<RetryIcon />}
                        onClick={() => handleRetry(deployment.Id)}
                        sx={{ ml: 1 }}
                        disabled={retryDeployment.isPending}
                      >
                        {t("common.retry")}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Results Count + Connection Status */}
      {!isLoading && filteredDeployments.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Showing {filteredDeployments.length} of {deployments.length} deployments
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isConnected ? '⚡ Real-time updates active' : '🔌 Connecting...'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
