import React, { useEffect, useState } from 'react';
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
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  GitHub as GitHubIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProjectsService, type IProject } from '@/services/projectsService';

export const ProjectsPage: React.FC = () => {
  const { } = useLanguage();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await ProjectsService.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchProjects}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProject}
          >
            Add Project
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{project.name}</Typography>
                    <Chip
                      label={project.status}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <GitHubIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {project.repoUrl}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Branch: <strong>{project.branch}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Type: {project.type}
                  </Typography>
                  {project.lastDeployment && (
                    <Box sx={{ mt: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                      <Typography variant="caption" display="block">
                        Last Deployment:
                      </Typography>
                      <Typography variant="body2" color={project.lastDeployment.status === 'success' ? 'success.main' : 'error.main'}>
                        {project.lastDeployment.status.toUpperCase()} - {project.lastDeployment.timestamp}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small">Details</Button>
                  <Button size="small">Deploy</Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Project Dialog (Placeholder) */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Project</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Project Name" fullWidth />
            <TextField label="Repository URL" fullWidth />
            <TextField label="Branch" fullWidth defaultValue="master" />
            <TextField select label="Type" fullWidth defaultValue="node">
              <MenuItem value="node">Node.js</MenuItem>
              <MenuItem value="static">Static Site</MenuItem>
              <MenuItem value="docker">Docker</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleCloseDialog}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
