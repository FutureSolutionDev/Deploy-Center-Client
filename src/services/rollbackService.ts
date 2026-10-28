/**
 * rollbackService — Deploy Center v3.0 / F-007 (T070).
 *
 * Thin wrapper around POST /api/deployments/:id/rollback. Maps server status
 * codes to friendly errors so the UI can show a coherent toast without
 * digging into the axios error body.
 */

import ApiInstance from './api';
import type { AxiosError } from 'axios';

export interface IRollbackResponse {
  FromDeploymentId: number;
  NewDeploymentId: number;
  ToCommitHash: string;
  QueueJobId: string;
}

export class RollbackClientError extends Error {
  public readonly StatusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'RollbackClientError';
    this.StatusCode = statusCode;
  }
}

function mapAxiosError(err: unknown): RollbackClientError {
  const axiosErr = err as AxiosError<{ Message?: string }>;
  const status = axiosErr.response?.status ?? 0;
  const serverMsg = axiosErr.response?.data?.Message;

  switch (status) {
    case 409:
      return new RollbackClientError(
        serverMsg || 'The last successful deployment is already on this commit.',
        409
      );
    case 422:
      return new RollbackClientError(
        serverMsg || 'Cannot roll back: no prior successful deployment, or target is not in a failed state.',
        422
      );
    case 503:
      return new RollbackClientError(
        serverMsg || 'Queue service is unavailable. Try again in a moment.',
        503
      );
    case 403:
      return new RollbackClientError(
        serverMsg || 'You do not have permission to roll back this deployment.',
        403
      );
    default:
      return new RollbackClientError(
        serverMsg || axiosErr.message || 'Rollback failed.',
        status || 500
      );
  }
}

export const RollbackService = {
  async rollback(deploymentId: number): Promise<IRollbackResponse> {
    try {
      const res = await ApiInstance.post(`/deployments/${deploymentId}/rollback`);
      const data = res.data?.Data as IRollbackResponse;
      if (!data) {
        throw new RollbackClientError('Server returned no rollback data', 500);
      }
      return data;
    } catch (err) {
      if (err instanceof RollbackClientError) throw err;
      throw mapAxiosError(err);
    }
  },
};

export default RollbackService;
