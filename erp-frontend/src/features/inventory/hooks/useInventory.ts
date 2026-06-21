import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInventoryByCategory, getInventoryCategories, addStockTransaction, getLedger, createNewItem, deleteInventoryItem } from '../../../services/api/inventory';

export function useInventoryCategories() {
  return useQuery({
    queryKey: ['inventoryCategories'],
    queryFn: getInventoryCategories,
  });
}

export function useInventory(category: string) {
  return useQuery({
    queryKey: ['inventory', category],
    queryFn: () => getInventoryByCategory(category),
  });
}

export function useLedger(inventoryId: string | null) {
  return useQuery({
    queryKey: ['inventoryLedger', inventoryId],
    queryFn: () => inventoryId ? getLedger(inventoryId) : Promise.resolve({ data: [] }),
    enabled: !!inventoryId,
  });
}

export function useAddStockTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => addStockTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryLedger'] });
    },
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createNewItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
