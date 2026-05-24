/**
 * RollbackModal — Deploy Center v3.0 / F-007 (T071).
 *
 * Confirmation dialog before rolling back a failed deployment. The "target"
 * passed in is the candidate last-successful deployment (the commit we'd
 * re-deploy). If no candidate exists, render a disabled state so the user
 * understands why the button is locked.
 */

import React from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { RollbackService, RollbackClientError } from '@/services/rollbackService';
import type { IDeployment } from '@/types';
import { useToast } from '@/contexts/ToastContext';

interface IProps {
  open: boolean;
  failedDeployment: IDeployment;
  /** Most recent Success for the same project, or null if none exists. */
  lastSuccessful: IDeployment | null;
  onClose: (rolledBack: boolean) => void;
}

export const RollbackModal: React.FC<IProps> = ({
  open,
  failedDeployment,
  lastSuccessful,
  onClose,
}) => {
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: () => RollbackService.rollback(failedDeployment.Id),
    onSuccess: (data) => {
      toast.showSuccess(`Rollback queued (deployment #${data.NewDeploymentId})`);
      onClose(true);
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof RollbackClientError ? err.message : 'Rollback failed';
      toast.showError(msg);
    },
  });

  const noTarget = !lastSuccessful;
  const sameCommit =
    !noTarget && lastSuccessful!.Commit === failedDeployment.Commit;

  return (
    <Dialog
      open={open}
      onClose={() => !mutation.isPending && onClose(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Roll back deployment</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            This will create a new deployment that re-deploys the last
            successful commit. The original failed deployment is not modified.
          </Typography>

          {noTarget && (
            <Alert severity="warning">
              There is no prior successful deployment for this project to
              roll back to.
            </Alert>
          )}

          {sameCommit && (
            <Alert severity="warning">
              The last successful deployment is already on the same commit as
              the failed deployment. Rollback would be a no-op.
            </Alert>
          )}

          {!noTarget && !sameCommit && (
            <>
              <Divider textAlign="left">Rolling back to</Divider>
              <Stack spacing={0.5}>
                <Typography variant="body2">
                  <strong>Deployment:</strong> #{lastSuccessful!.Id}
                </Typography>
                <Typography variant="body2">
                  <strong>Commit:</strong>{' '}
                  <code>{lastSuccessful!.Commit?.substring(0, 12)}</code>
                </Typography>
                {lastSuccessful!.CommitMessage && (
                  <Typography variant="body2">
                    <strong>Message:</strong> {lastSuccessful!.CommitMessage}
                  </Typography>
                )}
                {lastSuccessful!.CommitAuthor && (
                  <Typography variant="body2">
                    <strong>Author:</strong> {lastSuccessful!.CommitAuthor}
                  </Typography>
                )}
                {lastSuccessful!.CreatedAt && (
                  <Typography variant="body2">
                    <strong>Deployed:</strong>{' '}
                    {new Date(lastSuccessful!.CreatedAt).toLocaleString()}
                  </Typography>
                )}
              </Stack>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onClose(false)}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => mutation.mutate()}
          disabled={noTarget || sameCommit || mutation.isPending}
          startIcon={
            mutation.isPending ? <CircularProgress size={16} /> : undefined
          }
        >
          {mutation.isPending ? 'Rolling back…' : 'Roll back'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RollbackModal;
