import React, { useState } from "react";
import {
  Box,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDateFormatter } from "@/hooks/useDateFormatter";
import type { IDeploymentRequest } from "@/types";
import { DeploymentModal } from "@/components/Projects/DeploymentModal";
import { SshKeyManagement } from "@/components/Projects/SshKeyManagement";
import { useToast } from "@/contexts/ToastContext";
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
  useDeployProject,
  useProjectStatistics,
  useRegenerateWebhook,
} from "@/hooks/useProjects";
import { useDeployments } from "@/hooks/useDeployments";
import {
  ProjectHeader,
  ProjectInfoCard,
  ProjectConfigCard,
  ProjectPipelineCard,
  ProjectStatsCard,
  ProjectDeploymentsTable,
  ProjectWebhookCard,
} from "./components";

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { formatDateTime } = useDateFormatter();
  const { showSuccess, showError } = useToast();

  // React Query hooks
  const { data: project, isLoading, error, refetch } = useProject(Number(id));
  const { data: allDeployments = [] } = useDeployments();
  const { data: stats } = useProjectStatistics(Number(id));
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const deployProject = useDeployProject();
  const regenerateWebhook = useRegenerateWebhook();

  // Local UI state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);

  // Filter deployments for this project
  const projectDeployments = allDeployments.filter(
    (d) => d.ProjectId === Number(id) || d.ProjectName === project?.Name
  );

  const handleOpenDeploy = () => {
    setDeployDialogOpen(true);
  };

  const handleDeploy = async (data: IDeploymentRequest) => {
    if (!project) return;

    try {
      await deployProject.mutateAsync({ id: data.ProjectId, data });
      showSuccess(t("deployments.startedSuccessfully"));
      setDeployDialogOpen(false);
      refetch();
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : t("deployments.failedToStart");
      throw new Error(errorMessage);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!project) return;

    deleteProject.mutate(project.Id, {
      onSuccess: () => {
        showSuccess(t("projects.deletedSuccessfully"));
        navigate("/projects");
      },
      onError: (error: Error) => {
        showError(error?.message || t("projects.failedToDelete"));
        setDeleteDialogOpen(false);
      },
    });
  };

  const handleToggleActive = async () => {
    if (!project) return;

    updateProject.mutate(
      {
        id: project.Id,
        data: { IsActive: !project.IsActive },
      },
      {
        onSuccess: () => {
          showSuccess(
            project.IsActive
              ? t("projects.deactivatedSuccessfully")
              : t("projects.activatedSuccessfully")
          );
        },
        onError: (error: Error) => {
          showError(error?.message || t("projects.failedToToggleActive"));
        },
      }
    );
  };

  const handleRegenerateWebhook = async () => {
    if (!project) return;
    if (!window.confirm(t("projects.webhookRegenerationWarning"))) return;

    regenerateWebhook.mutate(project.Id, {
      onSuccess: () => {
        showSuccess(t("projects.webhookRegenerated"));
      },
      onError: (error: Error) => {
        showError(error?.message || t("projects.failedToRegenerateWebhook"));
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess(t("common.copiedToClipboard"));
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error && !project) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate("/projects")}>
          {t("common.backToProjects")}
        </Button>
      </Box>
    );
  }

  // Not found state
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
      <ProjectHeader
        project={project}
        onRefresh={refetch}
        onToggleActive={handleToggleActive}
        onDelete={handleDeleteClick}
        onDeploy={handleOpenDeploy}
        togglingActive={updateProject.isPending}
        deploying={deployProject.isPending}
      />

      <Grid container spacing={1}>
        {/* Left Column - Project Info & Configuration */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ProjectInfoCard project={project} formatDateTime={formatDateTime} />
          <ProjectConfigCard project={project} />
          <ProjectPipelineCard project={project} />
        </Grid>

        {/* Right Column - Statistics & History */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ProjectStatsCard stats={stats || null} />
          <ProjectDeploymentsTable
            deployments={projectDeployments}
            formatDateTime={formatDateTime}
          />
          <ProjectWebhookCard
            project={project}
            onRegenerateWebhook={handleRegenerateWebhook}
            onCopyToClipboard={copyToClipboard}
            regeneratingWebhook={regenerateWebhook.isPending}
          />
          <SshKeyManagement project={project} onUpdate={() => refetch()} />
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
