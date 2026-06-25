import { api } from './client';
import type { Item, ItemFormData } from '../../features/items/types';

interface ItemsResponse {
  success: boolean;
  data: Item[];
  message?: string;
}

export async function getItems(): Promise<ItemsResponse> {
  const response = await api.get<ItemsResponse>('/items');
  return response.data;
}

export async function createItem(data: ItemFormData) {
  const response = await api.post('/items', data);
  return response.data;
}

export async function updateItem(id: string, data: ItemFormData) {
  const response = await api.put(`/items/${id}`, data);
  return response.data;
}

export async function deleteItem(id: string) {
  const response = await api.delete(`/items/${id}`);
  return response.data;
}
