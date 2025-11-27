/**
 * Project Details Page
 * Detailed view of a single project with deployments history
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Refresh as RefreshIcon,
  Rocket as DeployIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GitHub as GitHubIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { ProjectsService, type IProject } from '@/services/projectsService';
import { DeploymentsService, type IDeployment } from '@/services/deploymentsService';
import { useLanguage } from '@/contexts/LanguageContext';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { Language } = useLanguage();

  const [project, setProject] = useState<IProject | null>(null);
  const [deployments, setDeployments] = useState<IDeployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [deployBranch, setDeployBranch] = useState('');

  useEffect(() => {
    if (id) {
      fetchProjectData(parseInt(id));
    }
  }, [id]);

  const fetchProjectData = async (projectId: number) => {
    setLoading(true);
    try {
      const [projectData, deploymentsData] = await Promise.all([
        ProjectsService.getById(projectId),
        DeploymentsService.getByProject(projectId),
      ]);
      setProject(projectData);
      setDeployments(deploymentsData);
      setDeployBranch(projectData.branch || 'master');
    } catch (error) {
      console.error('Failed to fetch project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!id) return;

    try {
      // Call deploy API
      await ProjectsService.deploy(parseInt(id), deployBranch);
      setDeployDialogOpen(false);
      // Refresh deployments
      fetchProjectData(parseInt(id));
    } catch (error) {
      console.error('Deploy failed:', error);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await ProjectsService.delete(parseInt(id));
      navigate('/projects');
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'in_progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5">Project not found</Typography>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/projects')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">{project.name}</Typography>
          <Chip label={project.status} color={project.status === 'active' ? 'success' : 'default'} />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<RefreshIcon />} onClick={() => fetchProjectData(parseInt(id!))}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<DeployIcon />} onClick={() => setDeployDialogOpen(true)}>
            Deploy
          </Button>
          <IconButton color="primary">
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Project Info */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Repository URL
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <GitHubIcon fontSize="small" />
                    <Typography variant="body1">{project.repoUrl}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Branch
                  </Typography>
                  <Typography variant="body1">{project.branch}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Project Type
                  </Typography>
                  <Typography variant="body1">{project.type}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Project Path
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {project.repoUrl}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Deployments
                  </Typography>
                  <Typography variant="h4">{deployments.length}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Success Rate
                  </Typography>
                  <Typography variant="h4">
                    {deployments.length > 0
                      ? Math.round(
                          (deployments.filter((d) => d.status === 'success').length /
                            deployments.length) *
                            100
                        )
                      : 0}
                    %
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Deployments History */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Deployment History
        </Typography>
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Commit</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Trigger</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deployments.map((deployment) => (
                  <TableRow key={deployment.id} hover>
                    <TableCell>#{deployment.id}</TableCell>
                    <TableCell>{deployment.branch}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{deployment.commitHash}</TableCell>
                    <TableCell>
                      <Chip
                        label={deployment.status}
                        color={getStatusColor(deployment.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{deployment.triggerType}</TableCell>
                    <TableCell>{deployment.timestamp}</TableCell>
                    <TableCell>{deployment.duration || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/deployments/${deployment.id}`)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {deployments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      No deployments yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Deploy Dialog */}
      <Dialog open={deployDialogOpen} onClose={() => setDeployDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Deploy Project</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Branch"
              fullWidth
              value={deployBranch}
              onChange={(e) => setDeployBranch(e.target.value)}
              helperText="Enter the branch name to deploy"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeployDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleDeploy} startIcon={<DeployIcon />}>
            Deploy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
