import { useQuery } from '@tanstack/react-query';
import { DashboardService, type IDashboardSummary } from '@/services/dashboardService';

/**
 * Custom hook to fetch dashboard summary data
 * Returns stats (project/deployment counts) + recent 5 deployments
 *
 * Benefits:
 * - Replaces fetching ALL projects + ALL deployments
 * - Reduces payload from ~200KB to ~5KB
 * - Automatic caching and deduplication
 * - No duplicate requests in StrictMode
 */
export const useDashboardStats = () => {
  return useQuery<IDashboardSummary, Error>({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => DashboardService.getSummary(),
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard data should be relatively fresh
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
};
