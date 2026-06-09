import { ArrowDownRight, ArrowUpRight, History } from 'lucide-react';
import type { StockTransaction } from '../types';

interface StockLedgerProps {
  transactions: StockTransaction[];
  isLoading: boolean;
  unit: string;
}

export function StockLedger({ transactions, isLoading, unit }: StockLedgerProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-sm text-gray-500">Loading ledger history...</span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-900">No transaction history</p>
        <p className="text-xs text-gray-500 mt-1">Stock IN/OUT records will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((txn) => {
        const isIN = txn.type === 'IN';
        
        return (
          <div key={txn._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg mt-0.5 ${isIN ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                {isIN ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isIN ? 'text-green-600' : 'text-orange-600'}`}>
                    {isIN ? '+' : '-'}{txn.quantity} {unit}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                    Ref: {txn.referenceNumber}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <span>{new Date(txn.date).toLocaleString()}</span>
                  {txn.notes && (
                    <>
                      <span>•</span>
                      <span className="text-gray-700 italic">{txn.notes}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
