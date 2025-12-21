import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectsService } from "@/services/projectsService";
import type { IProject, IDeploymentRequest } from "@/types";

/**
 * Custom hook to fetch all projects
 */
export const useProjects = (includeInactive: boolean = false) => {
  return useQuery<IProject[], Error>({
    queryKey: ["projects", { includeInactive }],
    queryFn: () => ProjectsService.getAll(includeInactive),
  });
};

/**
 * Custom hook to fetch a single project by ID
 */
export const useProject = (id: number | undefined, enabled: boolean = true) => {
  return useQuery<IProject, Error>({
    queryKey: ["projects", id],
    queryFn: () => ProjectsService.getById(id!),
    enabled: enabled && id !== undefined,
  });
};

/**
 * Custom hook to create a new project
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation<IProject, Error, Partial<IProject>>({
    mutationFn: (data) => ProjectsService.create(data),
    onSuccess: () => {
      // Invalidate projects list to refetch
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

/**
 * Custom hook to update a project
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation<IProject, Error, { id: number; data: Partial<IProject> }>({
    mutationFn: ({ id, data }) => ProjectsService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both the specific project and projects list
      queryClient.invalidateQueries({ queryKey: ["projects", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

/**
 * Custom hook to delete a project
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => ProjectsService.delete(id),
    onSuccess: () => {
      // Invalidate projects list to refetch
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};

/**
 * Custom hook to trigger project deployment
 */
export const useDeployProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: IDeploymentRequest }) =>
      ProjectsService.deploy(id, data),
    onSuccess: () => {
      // Invalidate deployments to show the new deployment
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

/**
 * Custom hook to get project statistics
 */
export const useProjectStatistics = (
  id: number | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["projects", id, "statistics"],
    queryFn: () => ProjectsService.getStatistics(id!),
    enabled: enabled && id !== undefined,
  });
};

/**
 * Custom hook to regenerate webhook secret
 */
export const useRegenerateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, number>({
    mutationFn: (id) => ProjectsService.regenerateWebhook(id),
    onSuccess: (_, id) => {
      // Invalidate the specific project to refetch with new webhook
      queryClient.invalidateQueries({ queryKey: ["projects", id] });
    },
  });
};
