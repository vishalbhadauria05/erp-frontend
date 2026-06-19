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
}

export type DispatchFormData = Omit<DispatchRecord, '_id' | 'dispatchNo' | 'status'>;
