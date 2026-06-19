import type { DispatchRecord } from '../features/dispatch/types';

export const mockDispatches: DispatchRecord[] = [
  {
    _id: 'd1',
    dispatchNo: 'DISP-2026-001',
    dispatchDate: '2026-06-18',
    customerName: 'Anand Papers Pvt Ltd',
    customerAddress: 'Phase 1, Industrial Area, Okhla, New Delhi',
    senderName: 'Amar Packers',
    status: 'Dispatched',
    items: [
      {
        id: 'i1',
        itemName: 'Corrugated Box 3-Ply',
        brand: 'Premium Grade',
        boxName: 'Shoe Box Regular',
        quantity: 500,
      },
      {
        id: 'i2',
        itemName: 'Printed Pizza Box',
        brand: 'Food Safe',
        boxName: '12" Pizza Box',
        quantity: 1200,
      }
    ]
  },
  {
    _id: 'd2',
    dispatchNo: 'DISP-2026-002',
    dispatchDate: '2026-06-19',
    customerName: 'Balaji Traders',
    customerAddress: 'Sector 63, Noida, UP',
    senderName: 'Amar Packers',
    status: 'Pending',
    items: [
      {
        id: 'i3',
        itemName: 'Duplex Carton',
        brand: 'Standard',
        boxName: 'Medicine Box 500ml',
        quantity: 5000,
      }
    ]
  }
];
