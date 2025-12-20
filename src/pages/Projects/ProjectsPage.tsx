import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  GitHub as GitHubIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Rocket as DeployIcon,
  Visibility as ViewIcon,
  PowerSettingsNew as ToggleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import {
  useProjects,
  useUpdateProject,
  useDeleteProject,
  useDeployProject,
} from "@/hooks/useProjects";
import type { IProject, IDeploymentRequest } from "@/types";
import { ProjectWizard } from "@/components/Projects/Wizard/ProjectWizard";
import { DeploymentModal } from "@/components/Projects/DeploymentModal";

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  // React Query hooks
  const { data: projects = [], isLoading, error, refetch } = useProjects(true);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const deployProject = useDeployProject();

  // Local UI state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<IProject | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [deployingProject, setDeployingProject] = useState<IProject | null>(null);

  const handleOpenDialog = (project?: IProject) => {
    setEditingProject(project || null);
    setOpenDialog(true);
  };

  const handleSaveProject = async (projectData: Partial<IProject>) => {
    if (editingProject) {
      await updateProject.mutateAsync(
        { id: editingProject.Id, data: projectData },
        {
          onSuccess: () => {
            showSuccess("Project updated successfully");
            setOpenDialog(false);
            setEditingProject(null);
          },
          onError: (error: Error) => {
            throw new Error(error?.message || "Failed to update project");
          },
        }
      );
    } else {
      // For create, the wizard will handle the mutation
      throw new Error("Create functionality should use the wizard's internal mutation");
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: IProject) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleEdit = () => {
    if (selectedProject) {
      handleOpenDialog(selectedProject);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;

    deleteProject.mutate(selectedProject.Id, {
      onSuccess: () => {
        showSuccess("Project deleted successfully");
        setDeleteDialogOpen(false);
        setSelectedProject(null);
      },
      onError: (error: Error) => {
        showError(error?.message || "Failed to delete project");
        setDeleteDialogOpen(false);
      },
    });
  };

  const handleOpenDeploy = (project: IProject) => {
    setDeployingProject(project);
    setDeployDialogOpen(true);
  };

  const handleDeploy = async (data: IDeploymentRequest) => {
    try {
      await deployProject.mutateAsync({ id: data.ProjectId, data });
      showSuccess("Deployment started successfully");
      setDeployDialogOpen(false);
      setDeployingProject(null);
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Failed to trigger deployment";
      throw new Error(errorMessage);
    }
  };

  const handleToggleActive = async () => {
    if (!selectedProject) return;

    updateProject.mutate(
      {
        id: selectedProject.Id,
        data: { IsActive: !selectedProject.IsActive },
      },
      {
        onSuccess: () => {
          showSuccess(
            `Project ${selectedProject.IsActive ? "deactivated" : "activated"} successfully`
          );
          handleMenuClose();
        },
        onError: (error: Error) => {
          showError(error?.message || "Failed to update project");
          handleMenuClose();
        },
      }
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t("projects.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("projects.baseInfo")}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
            sx={{ height: "2.5rem" }}
          >
            {t("common.refresh")}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ height: "2.5rem" }}
          >
            {t("projects.createProject")}
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message}
        </Alert>
      )}

      {/* Projects Grid */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {projects.length === 0 ? (
            <Card sx={{ textAlign: "center", py: 8 }}>
              <CardContent>
                <GitHubIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {t("projects.noProjects")}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first project to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  {t("projects.createProject")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {projects.map((project) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.Id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.3s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {project.Name}
                        </Typography>
                        <Chip
                          label={project.IsActive ? t("common.active") : t("common.inactive")}
                          color={project.IsActive ? "success" : "default"}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <GitHubIcon sx={{ fontSize: 16, mr: 0.5 }} />
                          {project.RepoUrl}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Branch: <strong>{project.Branch}</strong> • Type:{" "}
                          <strong>{project.ProjectType}</strong>
                        </Typography>
                      </Box>
                    </CardContent>

                    <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                      <Box>
                        <Button
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => navigate(`/projects/${project.Id}`)}
                        >
                          {t("projects.viewDetails")}
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DeployIcon />}
                          onClick={() => handleOpenDeploy(project)}
                          color="primary"
                        >
                          {t("projects.deploy")}
                        </Button>
                      </Box>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, project)}>
                        <MoreVertIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("common.edit")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleActive}>
          <ListItemIcon>
            <ToggleIcon
              fontSize="small"
              color={selectedProject?.IsActive ? "error" : "success"}
            />
          </ListItemIcon>
          <ListItemText>
            {selectedProject?.IsActive ? t("common.deactivate") : t("common.activate")}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "error.main" }}>{t("common.delete")}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Create/Edit Project Wizard Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: "80vh" },
        }}
      >
        {openDialog && (
          <ProjectWizard
            initialData={editingProject || undefined}
            onClose={() => setOpenDialog(false)}
            onSubmit={handleSaveProject}
          />
        )}
      </Dialog>

      {/* Manual Deployment Dialog */}
      <DeploymentModal
        Open={deployDialogOpen}
        Project={deployingProject}
        OnClose={() => {
          setDeployDialogOpen(false);
          setDeployingProject(null);
        }}
        OnDeploy={handleDeploy}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("projects.confirmDelete")}</DialogTitle>
        <DialogContent>
          <Typography>{t("projects.confirmDeleteDesc")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t("common.cancel")}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            startIcon={<DeleteIcon />}
          >
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
