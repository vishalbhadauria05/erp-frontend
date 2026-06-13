import { api } from './client';
import type { Customer, CustomerFormData } from '../../features/customers/types';

export async function getCustomers(): Promise<{ data: Customer[] }> {
  try {
    const res = await api.get('/customers');
    return { data: res.data.data };
  } catch (error) {
    console.error("Error fetching customers data", error);
    return { data: [] };
  }
}

export async function createCustomer(data: CustomerFormData): Promise<{ data: Customer }> {
  const res = await api.post('/customers', data);
  return { data: res.data.data };
}

export async function updateCustomer(id: string, data: CustomerFormData): Promise<{ data: Customer }> {
  const res = await api.put(`/customers/${id}`, data);
  return { data: res.data.data };
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`);
}
