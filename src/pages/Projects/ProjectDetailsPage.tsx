import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
  Rocket as DeployIcon,
  GitHub as GitHubIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  Autorenew as RegenerateIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProjectsService } from "@/services/projectsService";
import { DeploymentsService } from "@/services/deploymentsService";
import type { IProject, IDeployment, IProjectStatistics, IDeploymentRequest } from "@/types";
import { DeploymentModal } from "@/components/Projects/DeploymentModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();


  const [project, setProject] = useState<IProject | null>(null);
  const [deployments, setDeployments] = useState<IDeployment[]>([]);
  const [stats, setStats] = useState<IProjectStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [regeneratingWebhook, setRegeneratingWebhook] = useState(false);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);

  const fetchProjectDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const [projectData, deploymentsData, statsData] = await Promise.all([
        ProjectsService.getById(Number(id)),
        DeploymentsService.getAll(),
        ProjectsService.getStatistics(Number(id)).catch(() => null),
      ]);

      setProject(projectData);
      setDeployments(
        deploymentsData.filter((d) => d.ProjectId === Number(id) || d.ProjectName === projectData.Name)
      );
      setStats(statsData);
    } catch (error: any) {
      setError(error?.message || t("projects.failedToLoadDetails"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleOpenDeploy = () => {
    setDeployDialogOpen(true);
  };

  const handleDeploy = async (data: IDeploymentRequest) => {
    if (!project) return;

    try {
      setDeploying(true);
      await ProjectsService.deploy(data.ProjectId, data);
      setSuccess(t("deployments.startedSuccessfully"));
      setDeployDialogOpen(false);
      setTimeout(() => {
        fetchProjectDetails();
        setSuccess(null);
      }, 3000);
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : t("deployments.failedToStart");
      throw new Error(errorMessage);
    } finally {
      setDeploying(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!project) return;

    try {
      await ProjectsService.delete(project.Id);
      navigate("/projects");
    } catch (error: any) {
      setError(error?.message || t("projects.failedToDelete"));
      setDeleteDialogOpen(false);
    }
  };

  const handleRegenerateWebhook = async () => {
    if (!project) return;
    if (!window.confirm(t("projects.webhookRegenerationWarning"))) return;

    try {
      setRegeneratingWebhook(true);
      const newSecret = await ProjectsService.regenerateWebhook(project.Id);
      setProject({ ...project, WebhookSecret: newSecret });
      setSuccess(t("projects.webhookRegenerated"));
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error?.message || t("projects.failedToRegenerateWebhook"));
    } finally {
      setRegeneratingWebhook(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess(t("common.copiedToClipboard"));
    setTimeout(() => setSuccess(null), 2000);
  };

  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, { color: any; icon: React.ReactElement }> = {
      success: { color: "success", icon: <SuccessIcon fontSize="small" /> },
      failed: { color: "error", icon: <ErrorIcon fontSize="small" /> },
      in_progress: { color: "warning", icon: <ScheduleIcon fontSize="small" /> },
      pending: { color: "default", icon: <ScheduleIcon fontSize="small" /> },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Chip
        label={status}
        color={config.color}
        size="small"
        icon={config.icon || undefined}
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !project) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate("/projects")}>
          {t("common.backToProjects")}
        </Button>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 3 }}>
          {t("deployments.notFound")}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate("/projects")}>
          {t("common.backToProjects")}
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
          onClick={() => navigate("/projects")}
          sx={{ mb: 2 }}
        >
          {t("common.backToProjects")}
        </Button>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              {project.Name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={project.IsActive ? t("common.active") : t("common.inactive")}
                color={project.IsActive ? "success" : "default"}
              />
              <Chip
                label={project.ProjectType}
                variant="outlined"
              />
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton onClick={fetchProjectDetails}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              {t("common.delete")}
            </Button>
            <Button
              variant="contained"
              startIcon={<DeployIcon />}
              onClick={handleOpenDeploy}
              disabled={deploying}
            >
              {t("projects.deployNow")}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column - Project Info & Webhook */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {t("projects.projectInfo")}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {t("projects.repoUrl")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                  <GitHubIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                  <Typography variant="body2">{project.RepoUrl}</Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {t("projects.branch")}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {project.Branch}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {t("projects.projectType")}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {project.ProjectType}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Webhook Configuration */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {t("projects.webhook")}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Typography variant="body2" color="text.secondary" paragraph>
                {t("projects.webhook")}
              </Typography>

              <TextField
                fullWidth
                label={t("projects.webhookSecret")}
                type={showWebhook ? "text" : "password"}
                value={project.WebhookSecret || "Not generated"}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowWebhook(!showWebhook)} edge="end">
                        {showWebhook ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                      <Tooltip title={t("common.copy")}>
                        <IconButton onClick={() => copyToClipboard(project.WebhookSecret)} edge="end">
                          <CopyIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <Button
                variant="outlined"
                color="warning"
                startIcon={regeneratingWebhook ? <CircularProgress size={20} /> : <RegenerateIcon />}
                onClick={handleRegenerateWebhook}
                disabled={regeneratingWebhook}
                fullWidth
              >
                {t("projects.regenerateSecret")}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Statistics & History */}
        <Grid size={{ xs: 12, md: 6 }}>
          {/* Statistics */}
          {stats && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {t("projects.statistics")}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 4 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        {stats.TotalDeployments}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("common.total")}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {stats.SuccessRate}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("projects.successRate")}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {Math.round(stats.AverageDuration)}s
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t("projects.avgDuration")}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ height: 200, width: '100%' }}>
                  <ResponsiveContainer>
                    <BarChart data={stats.DeploymentsByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="Date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <RechartsTooltip />
                      <Bar dataKey="Success" stackId="a" fill="#4caf50" name={t("deployments.success")} />
                      <Bar dataKey="Failed" stackId="a" fill="#f44336" name={t("deployments.failed")} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Deployment History */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {t("dashboard.recentDeployments")}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {deployments.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <DeployIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t("deployments.noDeployments")}
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("deployments.status")}</TableCell>
                        <TableCell>{t("deployments.branch")}</TableCell>
                        <TableCell>{t("common.date")}</TableCell>
                        <TableCell>{t("common.actions")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deployments.slice(0, 5).map((deployment) => (
                        <TableRow
                          key={deployment.Id}
                          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                        >
                          <TableCell>{getStatusChip(deployment.Status)}</TableCell>
                          <TableCell>{deployment.Branch}</TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {new Date(deployment.CreatedAt).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              onClick={() => navigate(`/deployments/${deployment.Id}`)}
                            >
                              {t("deployments.viewLogs")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Manual Deployment Dialog */}
      <DeploymentModal
        Open={deployDialogOpen}
        Project={project}
        OnClose={() => setDeployDialogOpen(false)}
        OnDeploy={handleDeploy}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("projects.deleteProject")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("projects.confirmDeleteDesc")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t("common.cancel")}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            startIcon={<DeleteIcon />}
          >
            {t("projects.deleteProject")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
