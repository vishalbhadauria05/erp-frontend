import { api } from './client';
import type { Order, OrderFormData } from '../../features/orders/types';

const ENDPOINT = "/orders";

export async function getOrders(): Promise<{ data: Order[] }> {
  try {
    const response = await api.get(ENDPOINT);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch orders, returning empty array", error);
    return { data: [] };
  }
}

export async function createOrder(data: OrderFormData): Promise<{ data: Order }> {
  const response = await api.post(ENDPOINT, data);
  return response.data;
}

export async function updateOrder(id: string, data: Partial<OrderFormData>): Promise<{ data: Order }> {
  const response = await api.put(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteOrder(id: string): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}

export async function updateOrderStatus(id: string, status: string): Promise<{ data: Order }> {
  const response = await api.patch(`${ENDPOINT}/${id}/status`, { status });
  return response.data;
}
