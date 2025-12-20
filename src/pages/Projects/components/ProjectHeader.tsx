import React from 'react';
import {
  Box,
  Button,
  Chip,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
  Rocket as DeployIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Power as PowerIcon,
  PowerOff as PowerOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { IProject } from '@/types';

interface IProjectHeaderProps {
  project: IProject;
  onRefresh: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onDeploy: () => void;
  togglingActive: boolean;
  deploying: boolean;
}

export const ProjectHeader: React.FC<IProjectHeaderProps> = ({
  project,
  onRefresh,
  onToggleActive,
  onDelete,
  onDeploy,
  togglingActive,
  deploying,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/projects')}
        sx={{ mb: 0.5 }}
      >
        {t('common.backToProjects')}
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            {project.Name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={project.IsActive ? t('common.active') : t('common.inactive')}
              color={project.IsActive ? 'success' : 'default'}
            />
            <Chip label={project.ProjectType} variant="outlined" />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/projects/edit/${project.Id}`)}
          >
            {t('common.edit')}
          </Button>
          <Button
            variant="outlined"
            color={project.IsActive ? 'warning' : 'success'}
            startIcon={
              togglingActive ? (
                <CircularProgress size={20} />
              ) : project.IsActive ? (
                <PowerOffIcon />
              ) : (
                <PowerIcon />
              )
            }
            onClick={onToggleActive}
            disabled={togglingActive}
          >
            {project.IsActive ? t('common.deactivate') : t('common.activate')}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={onDelete}
          >
            {t('common.delete')}
          </Button>
          <Button
            variant="contained"
            startIcon={<DeployIcon />}
            onClick={onDeploy}
            disabled={deploying || !project.IsActive}
          >
            {t('projects.deployNow')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
