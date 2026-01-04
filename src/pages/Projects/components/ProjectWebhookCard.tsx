import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  Autorenew as RegenerateIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useRole } from '@/contexts/RoleContext';
import type { IProject } from '@/types';

interface IProjectWebhookCardProps {
  project: IProject;
  onRegenerateWebhook: () => Promise<void>;
  onCopyToClipboard: (text: string) => void;
  regeneratingWebhook: boolean;
}

export const ProjectWebhookCard: React.FC<IProjectWebhookCardProps> = ({
  project,
  onRegenerateWebhook,
  onCopyToClipboard,
  regeneratingWebhook,
}) => {
  const { t } = useTranslation();
  const { canManageProjects } = useRole();
  const [showWebhook, setShowWebhook] = useState(false);

  // Build webhook URL from current window location
  const webhookUrl = `${window.location.protocol}//${window.location.host}/api/webhooks/github/${project.Name}`;

  return (
    <Card sx={{ mb: 1 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {t('projects.webhook')}
        </Typography>
        <Divider sx={{ mb: 0.5 }} />
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('projects.webhook')}
        </Typography>

        <TextField
          fullWidth
          label={t('projects.webhookUrl')}
          type="text"
          value={webhookUrl}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={t('common.copy')}>
                  <IconButton
                    onClick={() => onCopyToClipboard(webhookUrl)}
                    edge="end"
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label={t('projects.webhookSecret')}
          type={showWebhook ? 'text' : 'password'}
          value={project.WebhookSecret || 'Not generated'}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowWebhook(!showWebhook)} edge="end">
                  {showWebhook ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
                <Tooltip title={t('common.copy')}>
                  <IconButton
                    onClick={() => onCopyToClipboard(project.WebhookSecret)}
                    edge="end"
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 0.5 }}
        />

        {canManageProjects && (
          <Button
            variant="outlined"
            color="warning"
            startIcon={
              regeneratingWebhook ? <CircularProgress size={20} /> : <RegenerateIcon />
            }
            onClick={onRegenerateWebhook}
            disabled={regeneratingWebhook}
            fullWidth
          >
            {t('projects.regenerateSecret')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
