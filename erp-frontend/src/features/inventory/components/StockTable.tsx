import { Package, AlertTriangle, History } from 'lucide-react';
import type { InventoryRecord } from '../types';

interface StockTableProps {
  data: InventoryRecord[];
  isLoading: boolean;
  onViewLedger: (id: string) => void;
  onAddStock: (id: string) => void;
}

export function StockTable({ data, isLoading, onViewLedger, onAddStock }: StockTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading stock data...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-base font-medium text-gray-900 dark:text-gray-100">No stock items found</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">There are no items in this category yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 font-medium border-b border-gray-200 dark:border-neutral-800 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-6 py-4">Item Details</th>
            <th className="px-6 py-4">Specifications</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Stock Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((record) => {
            const item = record.itemRef;
            const isLowStock = record.currentStock <= record.reorderLevel;

            return (
              <tr key={record._id} className="hover:bg-gray-50 dark:bg-black transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{item.itemName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Code: {item.itemCode}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs space-y-1">
                    {item.specifications.gsm && <div>GSM: <span className="font-medium text-gray-900 dark:text-gray-100">{item.specifications.gsm}</span></div>}
                    {item.specifications.dimensions && <div>Size: <span className="font-medium text-gray-900 dark:text-gray-100">{item.specifications.dimensions}</span></div>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200">
                    {record.warehouseLocation || 'Unassigned'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-bold ${isLowStock ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                      {record.currentStock} {item.unitOfMeasure}
                    </span>
                    {isLowStock && (
                      <div className="flex items-center text-red-500 bg-red-50 px-1.5 py-0.5 rounded text-xs font-medium border border-red-100" title={`Reorder Level: ${record.reorderLevel}`}>
                        <AlertTriangle size={12} className="mr-1" /> Low
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Reserved: {record.reservedStock} {item.unitOfMeasure}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onViewLedger(record._id)}
                      className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Ledger"
                    >
                      <History size={16} />
                    </button>
                    <button
                      onClick={() => onAddStock(record._id)}
                      className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      + Stock
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
