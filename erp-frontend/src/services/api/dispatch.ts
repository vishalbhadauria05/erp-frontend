import { mockDispatches } from '../../mocks/dispatch';
import type { DispatchRecord, DispatchFormData } from '../../features/dispatch/types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getDispatches() {
  await delay(500);
  // return api.get('/dispatch'); // Uncomment when backend is ready
  return { data: mockDispatches, success: true, message: 'Dispatches fetched successfully' };
}

export async function createDispatch(data: DispatchFormData) {
  await delay(800);
  // return api.post('/dispatch', data); // Uncomment when backend is ready
  
  const newDispatch: DispatchRecord = {
    ...data,
    _id: Math.random().toString(36).substr(2, 9),
    dispatchNo: `DISP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    status: 'Pending',
  };
  
  mockDispatches.unshift(newDispatch);
  
  return { data: newDispatch, success: true, message: 'Dispatch created successfully' };
}

export async function updateDispatchStatus(id: string, status: DispatchRecord['status']) {
  await delay(500);
  // return api.put(`/dispatch/${id}/status`, { status }); // Uncomment when backend is ready
  
  const dispatch = mockDispatches.find(d => d._id === id);
  if (dispatch) {
    dispatch.status = status;
  }
  
  return { data: dispatch, success: true, message: 'Status updated' };
}
