import { mockCustomers } from '../../mocks/customers';
import type { Customer, CustomerFormData } from '../../features/customers/types';
export async function getCustomers(): Promise<{ data: Customer[] }> {
  return { data: [...mockCustomers] };
}

export async function createCustomer(data: CustomerFormData): Promise<{ data: Customer }> {
  const newCustomer: Customer = {
    ...data,
    _id: Date.now().toString(),
    outstandingBalance: 0,
    createdAt: new Date().toISOString(),
  };
  mockCustomers.push(newCustomer);
  return { data: newCustomer };
}

export async function updateCustomer(id: string, data: CustomerFormData): Promise<{ data: Customer }> {
  const index = mockCustomers.findIndex((c) => c._id === id);
  if (index === -1) throw new Error('Customer not found');
  mockCustomers[index] = { ...mockCustomers[index], ...data };
  return { data: mockCustomers[index] };
}

export async function deleteCustomer(id: string): Promise<void> {
  const index = mockCustomers.findIndex((c) => c._id === id);
  if (index !== -1) mockCustomers.splice(index, 1);
}
