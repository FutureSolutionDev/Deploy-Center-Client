import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Chip,
  Paper,
} from '@mui/material';
import { Settings as SettingsIcon, FolderOpen as FolderIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { IProject } from '@/types';

interface IProjectConfigCardProps {
  project: IProject;
}

export const ProjectConfigCard: React.FC<IProjectConfigCardProps> = ({ project }) => {
  const { t } = useTranslation();

  return (
    <Card sx={{ mb: 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('projects.configuration')}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              {t('projects.environment')}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
              {project.Config?.Environment || 'production'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography variant="caption" color="text.secondary">
              {t('projects.autoDeploy')}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip
                label={
                  project.Config?.AutoDeploy ? t('common.enabled') : t('common.disabled')
                }
                color={project.Config?.AutoDeploy ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Grid>

          {project.Config?.Variables?.BuildCommand && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                {t('projects.buildCommand')}
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  mt: 0.5,
                  p: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                }}
              >
                {project.Config.Variables.BuildCommand}
              </Paper>
            </Grid>
          )}

          {(project.Config?.BuildOutput || project.Config?.Variables?.BuildOutput) && (
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                Build Output Directory
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <FolderIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {project.Config.BuildOutput || project.Config.Variables?.BuildOutput}
                </Typography>
              </Box>
            </Grid>
          )}

          {project.Config?.Variables?.TargetPath && (
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary">
                {t('projects.targetPath')}
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
                {t('projects.deployOnPaths')}
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

          {project.Config?.SyncIgnorePatterns && project.Config.SyncIgnorePatterns.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Sync Ignore Patterns
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {project.Config.SyncIgnorePatterns.map((pattern, index) => (
                  <Chip
                    key={index}
                    label={pattern}
                    size="small"
                    variant="outlined"
                    color="warning"
                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            </Grid>
          )}

          {project.Config?.RsyncOptions && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary">
                Rsync Options
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  mt: 0.5,
                  p: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                }}
              >
                {project.Config.RsyncOptions}
              </Paper>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
