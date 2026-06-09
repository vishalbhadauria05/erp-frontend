import { mockInventory, mockTransactions, STOCK_CATEGORIES } from '../../mocks/inventory';
import type { InventoryRecord, StockTransaction } from '../../features/inventory/types';
// import { api } from './client'; // Uncomment when backend is ready

export async function getInventoryCategories(): Promise<{ data: string[] }> {
  return Promise.resolve({ data: STOCK_CATEGORIES });
}

export async function getInventoryByCategory(category: string): Promise<{ data: InventoryRecord[] }> {
  // return api.get(`/inventory?category=${encodeURIComponent(category)}`);
  
  // Mock implementation
  const filtered = category === 'All' 
    ? mockInventory 
    : mockInventory.filter(item => item.itemRef.category === category);
  
  return Promise.resolve({ data: filtered });
}

export async function addStockTransaction(data: Omit<StockTransaction, '_id' | 'date'>): Promise<{ data: StockTransaction }> {
  // return api.post('/inventory', data);
  
  // Mock implementation
  const newTxn: StockTransaction = {
    ...data,
    _id: `txn-${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toISOString()
  };
  
  // Update mock inventory stock
  const invItem = mockInventory.find(i => i._id === data.inventoryRef);
  if (invItem) {
    if (data.type === 'IN') {
      invItem.currentStock += data.quantity;
      invItem.lastRestockedDate = newTxn.date;
    } else {
      invItem.currentStock -= data.quantity;
    }
  }
  
  mockTransactions.unshift(newTxn);
  return Promise.resolve({ data: newTxn });
}

export async function getLedger(inventoryId: string): Promise<{ data: StockTransaction[] }> {
  // return api.get(`/inventory/ledger/${inventoryId}`);
  
  // Mock implementation
  const filtered = mockTransactions.filter(t => t.inventoryRef === inventoryId);
  return Promise.resolve({ data: filtered });
}
