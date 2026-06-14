import { api } from './client';
import type { InventoryRecord, StockTransaction } from '../../features/inventory/types';

export async function getInventoryCategories(): Promise<{ data: string[] }> {
  try {
    const res = await api.get('/inventory/categories');
    return { data: res.data.data };
  } catch (error) {
    console.error("Error fetching categories", error);
    return { data: [] };
  }
}

export async function getInventoryByCategory(category: string): Promise<{ data: InventoryRecord[] }> {
  try {
    const res = await api.get(`/inventory?category=${encodeURIComponent(category)}`);
    return { data: res.data.data };
  } catch (error) {
    console.error("Error fetching inventory", error);
    return { data: [] };
  }
}

export async function addStockTransaction(data: Omit<StockTransaction, '_id' | 'date'>): Promise<{ data: StockTransaction }> {
  const res = await api.post('/inventory/transactions', data);
  return { data: res.data.data };
}

export async function getLedger(inventoryId: string): Promise<{ data: StockTransaction[] }> {
  try {
    const res = await api.get(`/inventory/ledger/${inventoryId}`);
    return { data: res.data.data };
  } catch (error) {
    console.error("Error fetching ledger", error);
    return { data: [] };
  }
}

export async function createNewItem(data: any): Promise<{ data: InventoryRecord }> {
  const res = await api.post('/inventory/items', data);
  return { data: res.data.data };
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await api.delete(`/inventory/${id}`);
}
