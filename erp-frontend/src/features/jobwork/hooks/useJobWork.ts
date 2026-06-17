import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobWorks, createJobWork, completeJobWork } from '../../../services/api/jobwork';
import type { CreateJobWorkData } from '../../../services/api/jobwork';

export function useJobWorks() {
  return useQuery({
    queryKey: ['jobworks'],
    queryFn: getJobWorks,
  });
}

export function useCreateJobWork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobWorkData) => createJobWork(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobworks'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useCompleteJobWork() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeJobWork(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobworks'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
