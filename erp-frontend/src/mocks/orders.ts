export type OrderStatus = 'draft' | 'confirmed' | 'in-production' | 'dispatched';

export interface MockOrder {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  boxType: string;
  qty: number;
  status: OrderStatus;
  total: number;
}

export const mockOrders: MockOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-2026-048',
    customer: 'Sharma Enterprises',
    date: '2026-06-03',
    boxType: 'Pizza Type',
    qty: 2000,
    status: 'in-production',
    total: 48500,
  },
  {
    id: '2',
    orderNumber: 'ORD-2026-047',
    customer: 'Gupta Packaging Pvt. Ltd.',
    date: '2026-06-02',
    boxType: 'Flap Type',
    qty: 5000,
    status: 'confirmed',
    total: 112000,
  },
  {
    id: '3',
    orderNumber: 'ORD-2026-046',
    customer: 'Rajesh & Sons',
    date: '2026-06-01',
    boxType: 'Carton Type',
    qty: 1500,
    status: 'dispatched',
    total: 32000,
  },
  {
    id: '4',
    orderNumber: 'ORD-2026-045',
    customer: 'Mehta Industries',
    date: '2026-05-31',
    boxType: 'Z Patti Type',
    qty: 3000,
    status: 'confirmed',
    total: 67200,
  },
  {
    id: '5',
    orderNumber: 'ORD-2026-044',
    customer: 'Patel Corrugators',
    date: '2026-05-30',
    boxType: 'Ghera Patti',
    qty: 800,
    status: 'draft',
    total: 18900,
  },
];
