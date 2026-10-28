/**
 * RollbackButton — Deploy Center v3.0 / F-007 (T072).
 *
 * Renders only when `deployment.Status === 'failed'` (FR-029). Loads the
 * project's last successful deployment in the background to determine
 * eligibility:
 *   - no prior success → disabled with tooltip
 *   - same commit as the failed deployment → disabled with tooltip
 *   - otherwise → enabled, opens RollbackModal on click
 *
 * Auto-hides on success / pending / running / cancelled.
 */

import React, { useMemo, useState } from 'react';
import { Button, Tooltip, CircularProgress } from '@mui/material';
import { Restore as RestoreIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { DeploymentsService } from '@/services/deploymentsService';
import { EDeploymentStatus, type IDeployment } from '@/types';
import { RollbackModal } from './RollbackModal';

interface IProps {
  deployment: IDeployment;
  /** Called after a rollback is successfully queued so the parent can refresh. */
  onRolledBack?: () => void;
}

export const RollbackButton: React.FC<IProps> = ({ deployment, onRolledBack }) => {
  // CRITICAL: all hooks MUST run unconditionally on every render. Previous
  // version had an early `return null` BEFORE the hooks below it, which
  // crashed React with Rules-of-Hooks violation whenever a socket update
  // flipped `deployment.Status` between Failed and not-Failed on the same
  // component instance. We declare hooks first, then short-circuit the
  // render at the bottom — and gate the network query with `enabled` so we
  // don't waste a fetch when the deployment isn't Failed.
  const [modalOpen, setModalOpen] = useState(false);
  const isFailed = deployment.Status === EDeploymentStatus.Failed;

  // Look up the last successful deployment for this project. We pull the
  // list, filter to Success, sort by CreatedAt desc, and take the first one
  // that isn't this deployment.
  const { data: candidate, isLoading } = useQuery({
    queryKey: ['rollback-candidate', deployment.ProjectId, deployment.Id],
    queryFn: async (): Promise<IDeployment | null> => {
      const list = await DeploymentsService.getByProject(deployment.ProjectId);
      const successes = list
        .filter(
          (d) => d.Status === EDeploymentStatus.Success && d.Id !== deployment.Id
        )
        .sort(
          (a, b) =>
            new Date(b.CreatedAt as unknown as string).getTime() -
            new Date(a.CreatedAt as unknown as string).getTime()
        );
      return successes[0] ?? null;
    },
    // Cheap, stable for the lifetime of the page; only run when the
    // deployment is actually Failed.
    enabled: isFailed,
    staleTime: 30_000,
  });

  const disabledReason = useMemo<string | null>(() => {
    if (isLoading) return 'Checking eligibility…';
    if (!candidate) return 'No prior successful deployment to roll back to';
    if (candidate.Commit === deployment.Commit) {
      return 'Last successful deployment is already on this commit';
    }
    return null;
  }, [candidate, isLoading, deployment.Commit]);

  // FR-029: render nothing unless the deployment is in Failed state.
  // Safe to short-circuit here because every hook above has already run.
  if (!isFailed) {
    return null;
  }

  const button = (
    <span>
      <Button
        variant="outlined"
        color="warning"
        size="small"
        startIcon={
          isLoading ? <CircularProgress size={14} /> : <RestoreIcon fontSize="small" />
        }
        disabled={!!disabledReason}
        onClick={() => setModalOpen(true)}
      >
        Rollback
      </Button>
    </span>
  );

  return (
    <>
      {disabledReason ? (
        <Tooltip title={disabledReason}>{button}</Tooltip>
      ) : (
        button
      )}
      {modalOpen && (
        <RollbackModal
          open={modalOpen}
          failedDeployment={deployment}
          lastSuccessful={candidate ?? null}
          onClose={(rolledBack) => {
            setModalOpen(false);
            if (rolledBack && onRolledBack) onRolledBack();
          }}
        />
      )}
    </>
  );
};

export default RollbackButton;
