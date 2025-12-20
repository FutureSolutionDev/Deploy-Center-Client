import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import { Code as CodeIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { IProject } from '@/types';

interface IProjectPipelineCardProps {
  project: IProject;
}

export const ProjectPipelineCard: React.FC<IProjectPipelineCardProps> = ({ project }) => {
  const { t } = useTranslation();

  if (!project.Config?.Pipeline || project.Config.Pipeline.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('projects.pipeline')} ({project.Config.Pipeline.length} {t('common.steps')})
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
  );
};
