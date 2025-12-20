import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DeploymentsService } from '@/services/deploymentsService';
import type { IDeployment } from '@/types';

interface IUseDeploymentsOptions {
  limit?: number;
  offset?: number;
  status?: string;
  projectId?: number;
}

/**
 * Custom hook to fetch all deployments
 */
export const useDeployments = (options: IUseDeploymentsOptions = {}) => {
  const { projectId } = options;

  return useQuery<IDeployment[], Error>({
    queryKey: ['deployments', { projectId }],
    queryFn: async () => {
      if (projectId) {
        return DeploymentsService.getByProject(projectId);
      }
      return DeploymentsService.getAll();
    },
  });
};

/**
 * Custom hook to fetch a single deployment by ID
 * Optionally auto-refresh for running deployments
 */
export const useDeployment = (
  id: number | undefined,
  options: { enabled?: boolean; refetchInterval?: number } = {}
) => {
  const { enabled = true, refetchInterval } = options;

  return useQuery<IDeployment, Error>({
    queryKey: ['deployments', id],
    queryFn: () => DeploymentsService.getById(id!),
    enabled: enabled && id !== undefined,
    refetchInterval: refetchInterval, // Can be used for auto-refresh on deployment details page
  });
};

/**
 * Custom hook to get deployment logs
 */
export const useDeploymentLogs = (id: number | undefined, enabled: boolean = true) => {
  return useQuery<string, Error>({
    queryKey: ['deployments', id, 'logs'],
    queryFn: () => DeploymentsService.getLogs(id!),
    enabled: enabled && id !== undefined,
    refetchInterval: (query) => {
      // Auto-refresh logs every 3 seconds if deployment is still running
      const data = query.state.data;
      return data && data.includes('Status: running') ? 3000 : false;
    },
  });
};

/**
 * Custom hook to cancel a deployment
 */
export const useCancelDeployment = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => DeploymentsService.cancel(id),
    onSuccess: (_, deploymentId) => {
      // Invalidate the specific deployment and deployments list
      queryClient.invalidateQueries({ queryKey: ['deployments', deploymentId] });
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/**
 * Custom hook to retry a failed deployment
 */
export const useRetryDeployment = () => {
  const queryClient = useQueryClient();

  return useMutation<IDeployment, Error, number>({
    mutationFn: (id) => DeploymentsService.retry(id),
    onSuccess: () => {
      // Invalidate deployments to show the new retry deployment
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};


/**
 * Custom hook to get queue status
 */
export const useQueueStatus = () => {
  return useQuery({
    queryKey: ['queue', 'status'],
    queryFn: () => DeploymentsService.getQueueStatus(),
    refetchInterval: 5000, // Auto-refresh queue status every 5 seconds
  });
};
