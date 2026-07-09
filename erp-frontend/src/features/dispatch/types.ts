export interface DispatchItem {
  id: string;
  itemName: string;
  brand: string;
  boxName: string;
  quantity: number;
}

export interface CorrugatedConsumption {
  rollName?: string;
  quantityKg?: number;
  reelSize?: number;
  gsm?: number;
  length?: number;
  noOf2Ply?: number;
  totalSheets?: number;
}

export interface DispatchRecord {
  _id: string;
  dispatchNo: string;
  dispatchDate: string;
  customerName: string;
  customerAddress: string;
  senderName: string;
  items: DispatchItem[];
  status: 'Pending' | 'Dispatched' | 'Delivered';
  sourceOrderRef?: string | null;
  corrugatedConsumption?: CorrugatedConsumption | null;
}

export type DispatchFormData = Omit<DispatchRecord, '_id' | 'dispatchNo' | 'status'> & {
  consumedMaterialId?: string;
  consumedWeight?: number;
};
