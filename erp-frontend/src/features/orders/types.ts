export interface OrderFormData {
  orderNumber: string;
  customerName: string;
  itemName: string;
  itemSerialNumber: string;
  dieSerialNumber: string;
  quantityOrdered: string;
  boxType: string;
  printed: boolean;
  laminated: boolean;
  length: string;
  breadth: string;
  height: string;
  sheetLength: string;
  sheetBreadth: string;
  ply: string;
  gsm: string;
  
  // UI-only exhaustive calculation fields
  boxesPerSheet?: string;
  duplexLength?: string;
  duplexBreadth?: string;
  duplexGsm?: string;
  duplexRate?: string;
  numberOf2Ply?: string;
  twoPlyGsm?: string;
  twoPlyRate?: string;
  spotUvSize?: string;
  spotUvCost?: string;
  spotUvSheets?: string;
  lamRollSize?: string;
  lamSheetLength?: string;
  lamType?: string;
  fevicolCostPerSheet?: string;
  lamCostPerSheet?: string;
  sheeterRate?: string;
  pastingRate?: string;
  dieRate?: string;
  stitchingRate?: string;
  strappingRate?: string;
}

export interface Order extends OrderFormData {
  _id: string;
  status?: string;
  createdAt?: string;
  totalCost?: number;
  quantityDelivered?: number;
  quantityRemaining?: number;
}
