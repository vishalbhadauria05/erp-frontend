import { api } from './client';
import type { DispatchRecord, DispatchFormData } from '../../features/dispatch/types';

export async function getDispatches() {
  try {
    const res = await api.get('/dispatch');
    return { data: res.data.data as DispatchRecord[] };
  } catch (error) {
    console.error('Failed to fetch dispatches', error);
    return { data: [] };
  }
}

export async function createDispatch(data: DispatchFormData) {
  const res = await api.post('/dispatch', data);
  return { data: res.data.data as DispatchRecord };
}

export async function updateDispatchStatus(id: string, status: DispatchRecord['status']) {
  const res = await api.patch(`/dispatch/${id}/status`, { status });
  return { data: res.data.data as DispatchRecord };
}
