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
  Edit as EditIcon,
  Power as PowerIcon,
  PowerOff as PowerOffIcon,
  Settings as SettingsIcon,
  Code as CodeIcon,
  FolderOpen as FolderIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProjectsService } from "@/services/projectsService";
import { DeploymentsService } from "@/services/deploymentsService";
import { useDateFormatter } from "@/hooks/useDateFormatter";
import type { IProject, IDeployment, IProjectStatistics, IDeploymentRequest } from "@/types";
import { DeploymentModal } from "@/components/Projects/DeploymentModal";
import { SshKeyManagement } from "@/components/Projects/SshKeyManagement";
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
  const { formatDateTime } = useDateFormatter();

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
  const [togglingActive, setTogglingActive] = useState(false);

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

  const handleToggleActive = async () => {
    if (!project) return;

    try {
      setTogglingActive(true);
      await ProjectsService.update(project.Id, { IsActive: !project.IsActive });
      setProject({ ...project, IsActive: !project.IsActive });
      setSuccess(
        project.IsActive
          ? t("projects.deactivatedSuccessfully")
          : t("projects.activatedSuccessfully")
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error?.message || t("projects.failedToToggleActive"));
    } finally {
      setTogglingActive(false);
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, { color: any; icon: React.ReactElement }> = {
      success: { color: "success", icon: <SuccessIcon fontSize="small" /> },
      failed: { color: "error", icon: <ErrorIcon fontSize="small" /> },
      inProgress: { color: "warning", icon: <ScheduleIcon fontSize="small" /> },
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
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate("/projects")}
          sx={{ mb: 0.5 }}
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
              startIcon={<EditIcon />}
              onClick={() => navigate(`/projects/edit/${project.Id}`)}
            >
              {t("common.edit")}
            </Button>
            <Button
              variant="outlined"
              color={project.IsActive ? "warning" : "success"}
              startIcon={
                togglingActive ? (
                  <CircularProgress size={20} />
                ) : project.IsActive ? (
                  <PowerOffIcon />
                ) : (
                  <PowerIcon />
                )
              }
              onClick={handleToggleActive}
              disabled={togglingActive}
            >
              {project.IsActive ? t("common.deactivate") : t("common.activate")}
            </Button>
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
              disabled={deploying || !project.IsActive}
            >
              {t("projects.deployNow")}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={1}>
        {/* Left Column - Project Info & Webhook */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ mb: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {t("projects.projectInfo")}
              </Typography>
              <Divider sx={{ mb: 0.5 }} />

              <Box sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {t("projects.repoUrl")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                  <GitHubIcon sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
                  <Typography variant="body2">{project.RepoUrl}</Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {t("projects.branch")}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {project.Branch}
                </Typography>
              </Box>

              <Box sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {t("projects.projectType")}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
                  {project.ProjectType}
                </Typography>
              </Box>

              <Box sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {t("common.createdAt")}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {formatDateTime(project.CreatedAt)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("common.updatedAt")}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {formatDateTime(project.UpdatedAt)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Configuration Details */}
          <Card sx={{ mb: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t("projects.configuration")}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t("projects.environment")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                    {project.Config?.Environment || 'production'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t("projects.autoDeploy")}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={project.Config?.AutoDeploy ? t("common.enabled") : t("common.disabled")}
                      color={project.Config?.AutoDeploy ? "success" : "default"}
                      size="small"
                    />
                  </Box>
                </Grid>

                {project.Config?.Variables?.BuildCommand && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t("projects.buildCommand")}
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        mt: 0.5,
                        p: 1,
                        bgcolor: 'grey.50',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                      }}
                    >
                      {project.Config.Variables.BuildCommand}
                    </Paper>
                  </Grid>
                )}

                {project.Config?.Variables?.BuildOutput && (
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t("projects.buildOutput")}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <FolderIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {project.Config.Variables.BuildOutput}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {project.Config?.Variables?.TargetPath && (
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t("projects.targetPath")}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <FolderIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {project.Config.Variables.TargetPath}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {project.Config?.DeployOnPaths && project.Config.DeployOnPaths.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      {t("projects.deployOnPaths")}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {project.Config.DeployOnPaths.map((path, index) => (
                        <Chip
                          key={index}
                          label={path}
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Pipeline Steps */}
          {project.Config?.Pipeline && project.Config.Pipeline.length > 0 && (
            <Card sx={{ mb: 1 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t("projects.pipeline")} ({project.Config.Pipeline.length} {t("common.steps")})
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {project.Config.Pipeline.map((step, index) => (
                  <Paper
                    key={index}
                    variant="outlined"
                    sx={{
                      mb: 1.5,
                      p: 1.5,
                      '&:last-child': { mb: 0 },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={`${index + 1}`}
                        size="small"
                        color="primary"
                        sx={{ mr: 1, minWidth: 32 }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {step.Name}
                      </Typography>
                    </Box>

                    {step.RunIf && (
                      <Box sx={{ mb: 1 }}>
                        <Chip
                          label={`Condition: ${step.RunIf}`}
                          size="small"
                          variant="outlined"
                          color="info"
                          sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                        />
                      </Box>
                    )}

                    {step.Run && Array.isArray(step.Run) && step.Run.length > 0 && (
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1,
                          bgcolor: 'grey.900',
                          color: 'common.white',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          overflow: 'auto',
                        }}
                      >
                        {step.Run.map((cmd, cmdIndex) => (
                          <Box key={cmdIndex} sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            <Typography
                              component="span"
                              sx={{
                                color: 'success.light',
                                fontFamily: 'monospace',
                                fontSize: '0.75rem',
                                mr: 1,
                              }}
                            >
                              $
                            </Typography>
                            {cmd}
                          </Box>
                        ))}
                      </Paper>
                    )}
                  </Paper>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column - Statistics & History */}
        <Grid size={{ xs: 12, md: 6 }}>
          {/* Statistics */}
          {stats && (
            <Card sx={{ mb: 1 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {t("projects.statistics")}
                </Typography>
                <Divider sx={{ mb: 0.5 }} />

                <Grid container spacing={2} sx={{ mb: 1 }}>
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

                {stats?.DeploymentsByDay?.length > 0 && (
                  <Box sx={{ width: '100%', height: 100, minHeight: 100 }}>
                    <ResponsiveContainer
                      aspect={3}
                      width={400}
                      height={400}
                    >
                      <BarChart
                        data={stats.DeploymentsByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="Date" fontSize={9} />
                        <YAxis fontSize={9} />
                        <RechartsTooltip />
                        <Bar dataKey="Success" stackId="a" fill="#4caf50" />
                        <Bar dataKey="Failed" stackId="a" fill="#f44336" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Deployment History */}
          <Card sx={{ mb: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {t("dashboard.recentDeployments")}
              </Typography>
              <Divider sx={{ mb: 0.5 }} />

              {deployments.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <DeployIcon sx={{ fontSize: 48, color: "text.disabled", mb: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t("deployments.noDeployments")}
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 340 }} >
                  <Table size="small">
                    <TableHead
                      sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        backgroundColor: 'background.paper',
                      }}
                    >
                      <TableRow>
                        <TableCell>{t("deployments.status")}</TableCell>
                        <TableCell>{t("deployments.branch")}</TableCell>
                        <TableCell>{t("common.date")}</TableCell>
                        <TableCell>{t("common.actions")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deployments.slice(0, 50).map((deployment) => (
                        <TableRow
                          key={deployment.Id}
                          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                        >
                          <TableCell>{getStatusChip(deployment.Status)}</TableCell>
                          <TableCell>{deployment.Branch}</TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {formatDateTime(deployment.CreatedAt)}
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

          {/* Webhook Configuration */}
          <Card sx={{ mb: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {t("projects.webhook")}
              </Typography>
              <Divider sx={{ mb: 0.5 }} />
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
                sx={{ mb: 0.5 }}
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
          {/* SSH Key Management */}
          <SshKeyManagement project={project} onUpdate={fetchProjectDetails} />
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
