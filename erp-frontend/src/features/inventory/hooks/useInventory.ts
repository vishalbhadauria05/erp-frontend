import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInventoryByCategory, getInventoryCategories, addStockTransaction, getLedger } from '../../../services/api/inventory';
import type { StockTransaction } from '../types';

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
    mutationFn: (data: Omit<StockTransaction, '_id' | 'date'>) => addStockTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryLedger'] });
    },
  });
}
