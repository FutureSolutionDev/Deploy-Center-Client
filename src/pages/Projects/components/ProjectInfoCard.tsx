import React from 'react';
import { Box, Card, CardContent, Typography, Divider } from '@mui/material';
import { GitHub as GitHubIcon } from '@mui/icons-material';
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
