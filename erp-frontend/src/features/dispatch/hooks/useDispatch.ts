import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDispatches, createDispatch, updateDispatchStatus } from '../../../services/api/dispatch';
import type { DispatchFormData, DispatchRecord } from '../types';

export function useDispatchRecords() {
  return useQuery({
    queryKey: ['dispatches'],
    queryFn: getDispatches,
  });
}

export function useCreateDispatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DispatchFormData) => createDispatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatches'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateDispatchStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DispatchRecord['status'] }) => updateDispatchStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatches'] });
    },
  });
}
