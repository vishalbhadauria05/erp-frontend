export type ItemType = 'RawMaterial' | 'FinishedGood' | 'Consumable';

export interface ItemSpecifications {
  gsm?: number;
  dimensions?: string;
  ply?: string;
  flute?: string;
}

export interface InventoryItem {
  _id: string;
  itemCode: string;
  itemName: string;
  type: ItemType;
  category: string;
  specifications: ItemSpecifications;
  unitOfMeasure: string;
}

export interface InventoryRecord {
  _id: string;
  itemRef: InventoryItem;
  warehouseLocation: string;
  currentStock: number;
  reservedStock: number;
  reorderLevel: number;
  lastRestockedDate?: string;
  batchNumber?: string;
}

export type TransactionType = 'IN' | 'OUT';

export interface StockTransaction {
  _id: string;
  inventoryRef: string;
  type: TransactionType;
  quantity: number;
  referenceNumber: string;
  date: string;
  notes?: string;
}
