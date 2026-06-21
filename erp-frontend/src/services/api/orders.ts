import { api } from "./client";
import type { Order, OrderFormData } from "../../features/orders/types";

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

export async function createOrder(
  data: OrderFormData
): Promise<{ data: Order }> {
  const response = await api.post(ENDPOINT, data);
  return response.data;
}

export async function updateOrder(
  id: string,
  data: Partial<OrderFormData>
): Promise<{ data: Order }> {
  const response = await api.put(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<any> {
  const response = await api.patch(`${ENDPOINT}/${id}/status`, { status });
  return response.data;
}

export async function updateDelivery(
  id: string,
  quantityDelivered: number
): Promise<any> {
  const response = await api.patch(`${ENDPOINT}/${id}/delivery`, { quantityDelivered });
  return response.data;
}

export async function createJobWorkFromOrder(
  id: string,
  data: { inventoryRef: string; quantity: number; jobNumber?: string }
): Promise<any> {
  const response = await api.post(`${ENDPOINT}/${id}/jobwork`, data);
  return response.data;
}

export async function createDispatchFromOrder(
  id: string,
  data: { customerAddress: string; dispatchDate?: string; quantity: number; senderName?: string }
): Promise<any> {
  const response = await api.post(`${ENDPOINT}/${id}/dispatch`, data);
  return response.data;
}

export async function deleteOrder(id: string): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}
