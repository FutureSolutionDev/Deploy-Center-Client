import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import { Code as CodeIcon, RocketLaunch as RocketIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { IProject, IPipelineStep } from '@/types';

interface IProjectPipelineCardProps {
  project: IProject;
}

const PipelineSteps: React.FC<{ steps: IPipelineStep[], startIndex?: number }> = ({ steps, startIndex = 0 }) => {
  return (
    <>
      {steps.map((step, index) => (
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
              label={`${startIndex + index + 1}`}
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
    </>
  );
};

export const ProjectPipelineCard: React.FC<IProjectPipelineCardProps> = ({ project }) => {
  const { t } = useTranslation();

  const hasPipeline = project.Config?.Pipeline && project.Config.Pipeline.length > 0;
  const hasPostPipeline = project.Config?.PostDeploymentPipeline && project.Config.PostDeploymentPipeline.length > 0;

  if (!hasPipeline && !hasPostPipeline) {
    return null;
  }

  return (
    <Card sx={{ mb: 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('projects.pipeline')}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* Pre-Deployment Pipeline (runs in temp directory before rsync) */}
        {hasPipeline && (
          <Box sx={{ mb: hasPostPipeline ? 3 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <CodeIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'info.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Pre-Deployment Pipeline
              </Typography>
              <Chip
                label={`${project.Config.Pipeline.length} steps`}
                size="small"
                sx={{ ml: 1 }}
                color="info"
              />
            </Box>
            <Alert severity="info" sx={{ mb: 1.5, py: 0.5 }}>
              <Typography variant="caption">
                Runs in temporary directory before rsync
              </Typography>
            </Alert>
            <PipelineSteps steps={project.Config.Pipeline} startIndex={0} />
          </Box>
        )}

        {/* Post-Deployment Pipeline (runs in production path after rsync) */}
        {hasPostPipeline && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <RocketIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'success.main' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Post-Deployment Pipeline
              </Typography>
              <Chip
                label={`${project.Config.PostDeploymentPipeline!.length} steps`}
                size="small"
                sx={{ ml: 1 }}
                color="success"
              />
            </Box>
            <Alert severity="success" sx={{ mb: 1.5, py: 0.5 }}>
              <Typography variant="caption">
                Runs in production directory after rsync
                {project.Config.EnableRollbackOnPostDeployFailure !== false &&
                  ' • Rollback enabled'}
              </Typography>
            </Alert>
            <PipelineSteps
              steps={project.Config.PostDeploymentPipeline!}
              startIndex={project.Config.Pipeline?.length || 0}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
