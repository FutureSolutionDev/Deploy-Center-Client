import React from 'react';
import { Box, Card, CardContent, Typography, Divider, Chip, Stack } from '@mui/material';
import { GitHub as GitHubIcon, Folder as FolderIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { IProject } from '@/types';

interface IProjectInfoCardProps {
  project: IProject;
  formatDateTime: (date: string | Date) => string;
}

export const ProjectInfoCard: React.FC<IProjectInfoCardProps> = ({
  project,
  formatDateTime,
}) => {
  const { t } = useTranslation();

  // Get deployment paths (backward compatibility)
  const deploymentPaths = project.DeploymentPaths && project.DeploymentPaths.length > 0
    ? project.DeploymentPaths
    : project.ProjectPath
    ? [project.ProjectPath]
    : [];

  return (
    <Card sx={{ mb: 1 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {t('projects.projectInfo')}
        </Typography>
        <Divider sx={{ mb: 0.5 }} />

        <Box sx={{ mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {t('projects.repoUrl')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <GitHubIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2">{project.RepoUrl}</Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {t('projects.branch')}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
            {project.Branch}
          </Typography>
        </Box>

        <Box sx={{ mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {t('projects.projectType')}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>
            {project.ProjectType}
          </Typography>
        </Box>

        <Box sx={{ mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FolderIcon sx={{ fontSize: 14 }} />
            {deploymentPaths.length > 1 ? 'Deployment Paths' : 'Deployment Path'}
          </Typography>
          <Stack spacing={1} sx={{ mt: 0.5 }}>
            {deploymentPaths.map((path, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {deploymentPaths.length > 1 && (
                  <Chip
                    label={index === 0 ? 'Primary' : `#${index + 1}`}
                    size="small"
                    color={index === 0 ? 'primary' : 'default'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {path}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Box sx={{ mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {t('common.createdAt')}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {formatDateTime(project.CreatedAt)}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            {t('common.updatedAt')}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {formatDateTime(project.UpdatedAt)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
