import type { Item } from '../features/items/types';

export const STOCK_CATEGORIES = [
  'Reels Kraft', 'Reels Semi Kraft', 'Duplex Bundle', 'Duplex Reel',
  'Corrugated Rolls', 'Lamination Film', 'Fevicol', 'Corrugation Gum',
  'Pasting Gum', 'Stitching Wire', 'Strapping Bundles', 'Printing Plates',
  'Finished Boxes'
];

export const mockItems: Item[] = [
  {
    _id: 'itm-001',
    itemCode: 'RK-120',
    itemName: 'Kraft Reel 120 GSM',
    brand: 'Agarwal Paper Mills',
    type: 'RawMaterial',
    category: 'Reels Kraft',
    itemSpecification: { gsm: '120', dimensions: '40 inch' },
    unitOfMeasure: 'KG',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    _id: 'itm-002',
    itemCode: 'RK-150',
    itemName: 'Kraft Reel 150 GSM',
    brand: 'Agarwal Paper Mills',
    type: 'RawMaterial',
    category: 'Reels Kraft',
    itemSpecification: { gsm: '150', dimensions: '44 inch' },
    unitOfMeasure: 'KG',
    createdAt: '2026-01-11T10:00:00Z'
  },
  {
    _id: 'itm-003',
    itemCode: 'DB-250',
    itemName: 'Duplex Board 250 GSM',
    brand: 'ITC',
    type: 'RawMaterial',
    category: 'Duplex Bundle',
    itemSpecification: { gsm: '250', dimensions: '28x40 inch' },
    unitOfMeasure: 'Sheets',
    createdAt: '2026-01-12T10:00:00Z'
  },
  {
    _id: 'itm-box-01',
    itemCode: 'BOX-PZ-12',
    itemName: 'Pizza Box 12 Inch',
    brand: 'Generic',
    type: 'FinishedGood',
    category: 'Finished Boxes',
    boxSpecification: {
      boxType: 'Pizza Type',
      boxesPerSheet: 2,
      itemSerialNumber: 'SN-001',
      dieSerialNumber: 'DIE-001',
      length: 12,
      breadth: 12,
      height: 2,
      sheetLength: 24,
      sheetBreadth: 24,
    },
    unitOfMeasure: 'PCS',
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    _id: 'itm-004',
    itemCode: 'LF-BOPP-MAT',
    itemName: 'BOPP Matte Film',
    brand: 'Cosmo',
    type: 'Consumable',
    category: 'Lamination Film',
    itemSpecification: { dimensions: '20 inch' },
    unitOfMeasure: 'Rolls',
    createdAt: '2026-03-01T10:00:00Z'
  },
  {
    _id: 'itm-005',
    itemCode: 'FEV-MR',
    itemName: 'Fevicol MR 50kg Drum',
    brand: 'Pidilite',
    type: 'Consumable',
    category: 'Fevicol',
    unitOfMeasure: 'Drums',
    createdAt: '2026-03-05T10:00:00Z'
  },
  {
    _id: 'itm-006',
    itemCode: 'SW-12',
    itemName: 'Stitching Wire 12 Gauge',
    brand: 'Tata',
    type: 'Consumable',
    category: 'Stitching Wire',
    unitOfMeasure: 'Coils',
    createdAt: '2026-03-10T10:00:00Z'
  }
];
