import type { InventoryRecord, StockTransaction } from '../features/inventory/types';

export const STOCK_CATEGORIES = [
  'Reels Kraft', 'Reels Semi Kraft', 'Duplex Bundle', 'Duplex Reel',
  'Corrugated Rolls', 'Lamination Film', 'Printing Plates',
  'Printed Duplex Board', 'Printed Kraft', 'Printed Paper'
];

export const mockInventory: InventoryRecord[] = [
  // Reels Kraft
  {
    _id: 'inv-001',
    itemRef: {
      _id: 'itm-001',
      itemCode: 'RK-120',
      itemName: 'Kraft Reel 120 GSM',
      type: 'RawMaterial',
      category: 'Reels Kraft',
      specifications: { gsm: 120, dimensions: '40 inch' },
      unitOfMeasure: 'KG'
    },
    warehouseLocation: 'Zone A - Rack 1',
    currentStock: 4500,
    reservedStock: 500,
    reorderLevel: 2000,
    lastRestockedDate: '2026-05-15T10:00:00Z',
    batchNumber: 'B-2605'
  },
  {
    _id: 'inv-002',
    itemRef: {
      _id: 'itm-002',
      itemCode: 'RK-150',
      itemName: 'Kraft Reel 150 GSM',
      type: 'RawMaterial',
      category: 'Reels Kraft',
      specifications: { gsm: 150, dimensions: '44 inch' },
      unitOfMeasure: 'KG'
    },
    warehouseLocation: 'Zone A - Rack 2',
    currentStock: 1200,
    reservedStock: 300,
    reorderLevel: 1500, // Below reorder level
    lastRestockedDate: '2026-04-20T09:30:00Z',
    batchNumber: 'B-2604'
  },

  // Duplex Bundle
  {
    _id: 'inv-003',
    itemRef: {
      _id: 'itm-003',
      itemCode: 'DB-250',
      itemName: 'Duplex Board 250 GSM',
      type: 'RawMaterial',
      category: 'Duplex Bundle',
      specifications: { gsm: 250, dimensions: '28x40 inch' },
      unitOfMeasure: 'Sheets'
    },
    warehouseLocation: 'Zone B - Rack 1',
    currentStock: 8000,
    reservedStock: 1000,
    reorderLevel: 5000,
    lastRestockedDate: '2026-06-01T14:00:00Z',
    batchNumber: 'B-2606'
  },

  // Duplex Reel
  {
    _id: 'inv-003b',
    itemRef: {
      _id: 'itm-003b',
      itemCode: 'DR-300',
      itemName: 'Duplex Reel 300 GSM',
      type: 'RawMaterial',
      category: 'Duplex Reel',
      specifications: { gsm: 300, dimensions: '36 inch' },
      unitOfMeasure: 'KG'
    },
    warehouseLocation: 'Zone B - Rack 2',
    currentStock: 2500,
    reservedStock: 0,
    reorderLevel: 1000,
    lastRestockedDate: '2026-06-05T10:00:00Z',
    batchNumber: 'R-300-1'
  },

  // Lamination Film
  {
    _id: 'inv-004',
    itemRef: {
      _id: 'itm-004',
      itemCode: 'LF-BOPP-MAT',
      itemName: 'BOPP Matte Film',
      type: 'Consumable',
      category: 'Lamination Film',
      specifications: { dimensions: '20 inch' },
      unitOfMeasure: 'Rolls'
    },
    warehouseLocation: 'Zone C - Rack 3',
    currentStock: 15,
    reservedStock: 2,
    reorderLevel: 10,
    lastRestockedDate: '2026-05-28T11:15:00Z'
  },

  // Fevicol
  {
    _id: 'inv-005',
    itemRef: {
      _id: 'itm-005',
      itemCode: 'FEV-MR',
      itemName: 'Fevicol MR 50kg Drum',
      type: 'Consumable',
      category: 'Fevicol',
      specifications: {},
      unitOfMeasure: 'Drums'
    },
    warehouseLocation: 'Liquid Store',
    currentStock: 4,
    reservedStock: 0,
    reorderLevel: 5, // Below reorder level
    lastRestockedDate: '2026-05-10T08:00:00Z'
  },

  // Stitching Wire
  {
    _id: 'inv-006',
    itemRef: {
      _id: 'itm-006',
      itemCode: 'SW-12',
      itemName: 'Stitching Wire 12 Gauge',
      type: 'Consumable',
      category: 'Stitching Wire',
      specifications: {},
      unitOfMeasure: 'Coils'
    },
    warehouseLocation: 'Accessories Store',
    currentStock: 120,
    reservedStock: 0,
    reorderLevel: 50,
    lastRestockedDate: '2026-06-05T16:45:00Z'
  }
];

export const mockTransactions: StockTransaction[] = [
  {
    _id: 'txn-001',
    inventoryRef: 'inv-001',
    type: 'IN',
    quantity: 2000,
    referenceNumber: 'PO-2026-045',
    date: '2026-05-15T10:00:00Z',
    notes: 'Received from Agarwal Paper Mills'
  },
  {
    _id: 'txn-002',
    inventoryRef: 'inv-001',
    type: 'OUT',
    quantity: 500,
    referenceNumber: 'WO-2026-112',
    date: '2026-05-18T14:30:00Z',
    notes: 'Issued for Production (Pizza Boxes)'
  },
  {
    _id: 'txn-003',
    inventoryRef: 'inv-002',
    type: 'OUT',
    quantity: 800,
    referenceNumber: 'WO-2026-115',
    date: '2026-06-01T09:15:00Z',
    notes: 'Issued for Production (Master Cartons)'
  }
];
