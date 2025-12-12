import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Paper,
  Divider,
} from '@mui/material';
import {
  Key as KeyIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProjectsService } from '@/services/projectsService';
import type { IProject } from '@/types';

interface ISshKeyManagementProps {
  project: IProject;
  onUpdate: () => void;
}

export const SshKeyManagement: React.FC<ISshKeyManagementProps> = ({
  project,
  onUpdate,
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPublicKey, setShowPublicKey] = useState(false);
  const [sshKeyInfo, setSshKeyInfo] = useState<{
    PublicKey: string;
    Fingerprint: string;
    KeyType: string;
    CreatedAt: Date;
    RotatedAt: Date | null;
  } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'generate' | 'regenerate' | 'delete' | null;
  }>({ open: false, action: null });

  const hasSSHKey = project.UseSshKey && project.SshPublicKey;

  // Load SSH key info if exists
  useEffect(() => {
    if (hasSSHKey) {
      loadSshKeyInfo();
    }
  }, [hasSSHKey, project.Id]);

  const loadSshKeyInfo = async () => {
    try {
      const keyInfo = await ProjectsService.getSshPublicKey(project.Id);
      setSshKeyInfo(keyInfo);
    } catch (err) {
      console.error('Failed to load SSH key info', err);
    }
  };

  const handleGenerateKey = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await ProjectsService.generateSshKey(project.Id, {
        keyType: 'ed25519',
      });

      setSuccess(t('projects.sshKeyGenerated') || 'SSH key generated successfully! Copy the public key and add it to your GitHub repository.');
      setSshKeyInfo({
        PublicKey: result.PublicKey,
        Fingerprint: result.Fingerprint,
        KeyType: result.KeyType,
        CreatedAt: new Date(),
        RotatedAt: null,
      });
      setShowPublicKey(true);
      onUpdate();
    } catch (err) {
      setError((err as Error)?.message || 'Failed to generate SSH key');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: null });
    }
  };

  const handleRegenerateKey = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await ProjectsService.regenerateSshKey(project.Id);

      setSuccess(t('projects.sshKeyRegenerated') || 'SSH key regenerated successfully! Update the public key in your GitHub repository.');
      setSshKeyInfo({
        PublicKey: result.PublicKey,
        Fingerprint: result.Fingerprint,
        KeyType: result.KeyType,
        CreatedAt: sshKeyInfo?.CreatedAt || new Date(),
        RotatedAt: new Date(),
      });
      setShowPublicKey(true);
      onUpdate();
    } catch (err) {
      setError((err as Error)?.message || 'Failed to regenerate SSH key');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: null });
    }
  };

  const handleDeleteKey = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await ProjectsService.deleteSshKey(project.Id);
      setSuccess(t('projects.sshKeyDeleted') || 'SSH key deleted successfully!');
      setSshKeyInfo(null);
      onUpdate();
    } catch (err) {
      setError((err as Error)?.message || 'Failed to delete SSH key');
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, action: null });
    }
  };

  const handleCopyPublicKey = () => {
    if (sshKeyInfo?.PublicKey) {
      navigator.clipboard.writeText(sshKeyInfo.PublicKey);
      setSuccess(t('projects.publicKeyCopied') || 'Public key copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <KeyIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              {t('projects.sshKeyManagement') || 'SSH Key Management'}
            </Typography>
          </Box>
          {hasSSHKey && (
            <Chip
              label={t('common.active') || 'Active'}
              color="success"
              size="small"
            />
          )}
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {!hasSSHKey ? (
          // No SSH Key - Show Generate Button
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                {t('projects.noSshKeyConfigured') ||
                  'No SSH key configured for this project. Generate an ED25519 SSH key to enable secure access to private GitHub repositories.'}
              </Typography>
            </Alert>

            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'start' }}>
                  <InfoIcon sx={{ fontSize: 18, mr: 1, mt: 0.5, color: 'info.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('projects.sshKeyInstructions') ||
                      'After generating the SSH key, copy the public key and add it to your GitHub repository: Settings → Deploy Keys → Add deploy key (read-only access).'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Button
              variant="contained"
              startIcon={<KeyIcon />}
              onClick={() => setConfirmDialog({ open: true, action: 'generate' })}
              disabled={loading}
            >
              {t('projects.generateSshKey') || 'Generate SSH Key'}
            </Button>
          </Box>
        ) : (
          // Has SSH Key - Show Key Info
          <Box>
            {sshKeyInfo && (
              <Box sx={{ mb: 2 }}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>{t('projects.keyType') || 'Key Type'}:</strong> {sshKeyInfo.KeyType?.toUpperCase()}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      <strong>{t('projects.fingerprint') || 'Fingerprint'}:</strong>
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        wordBreak: 'break-all'
                      }}
                    >
                      {sshKeyInfo.Fingerprint}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('projects.created') || 'Created'}:</strong> {formatDate(sshKeyInfo.CreatedAt)}
                  </Typography>

                  {sshKeyInfo.RotatedAt && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>{t('projects.lastRotated') || 'Last Rotated'}:</strong> {formatDate(sshKeyInfo.RotatedAt)}
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Public Key Display */}
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2">
                  {t('projects.publicKey') || 'Public Key'}:
                </Typography>
                <Box>
                  <Tooltip title={showPublicKey ? t('common.hide') : t('common.show')}>
                    <IconButton
                      size="small"
                      onClick={() => setShowPublicKey(!showPublicKey)}
                    >
                      {showPublicKey ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('common.copy') || 'Copy to clipboard'}>
                    <IconButton size="small" onClick={handleCopyPublicKey}>
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {showPublicKey && sshKeyInfo?.PublicKey && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={sshKeyInfo.PublicKey}
                  InputProps={{
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: '0.75rem' },
                  }}
                />
              )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => setConfirmDialog({ open: true, action: 'regenerate' })}
                disabled={loading}
              >
                {t('projects.regenerateKey') || 'Regenerate Key'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setConfirmDialog({ open: true, action: 'delete' })}
                disabled={loading}
              >
                {t('common.delete') || 'Delete'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, action: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {confirmDialog.action === 'generate' && (t('projects.confirmGenerateSshKey') || 'Generate SSH Key?')}
            {confirmDialog.action === 'regenerate' && (t('projects.confirmRegenerateSshKey') || 'Regenerate SSH Key?')}
            {confirmDialog.action === 'delete' && (t('projects.confirmDeleteSshKey') || 'Delete SSH Key?')}
          </DialogTitle>
          <DialogContent>
            {confirmDialog.action === 'generate' && (
              <Typography>
                {t('projects.generateSshKeyDescription') ||
                  'This will generate a new ED25519 SSH key pair for this project. You will need to add the public key to your GitHub repository as a deploy key.'}
              </Typography>
            )}
            {confirmDialog.action === 'regenerate' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {t('projects.regenerateSshKeyWarning') ||
                  'This will generate a new SSH key and invalidate the old one. You must update the deploy key in your GitHub repository. This action cannot be undone.'}
              </Alert>
            )}
            {confirmDialog.action === 'delete' && (
              <Alert severity="error">
                {t('projects.deleteSshKeyWarning') ||
                  'This will delete the SSH key from this project. Deployments will fall back to HTTPS. This action cannot be undone.'}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog({ open: false, action: null })}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              onClick={
                confirmDialog.action === 'generate'
                  ? handleGenerateKey
                  : confirmDialog.action === 'regenerate'
                  ? handleRegenerateKey
                  : handleDeleteKey
              }
              color={confirmDialog.action === 'delete' ? 'error' : 'primary'}
              variant="contained"
              disabled={loading}
            >
              {loading ? (t('common.processing') || 'Processing...') : (t('common.confirm') || 'Confirm')}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SshKeyManagement;
