export interface DispatchItem {
  id: string;
  itemName: string;
  brand: string;
  boxName: string;
  quantity: number;
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
}

export type DispatchFormData = Omit<DispatchRecord, '_id' | 'dispatchNo' | 'status'> & {
  consumedMaterialId?: string;
  consumedWeight?: number;
};
