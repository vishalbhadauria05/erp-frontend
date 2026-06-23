import { useState } from 'react';
import { useDispatchRecords, useCreateDispatch, useUpdateDispatchStatus } from './hooks/useDispatch';
import { DispatchForm } from './components/DispatchForm';
import { PrintableChallan } from './components/PrintableChallan';
import { SlideOver } from '../../components/ui/SlideOver';
import { Search, Plus, Truck, Download } from 'lucide-react';
import { exportToExcel } from '../../utils/exportToExcel';
import { useAuth } from '../auth/auth';
import type { DispatchFormData } from './types';

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  Dispatched: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  Delivered: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400',
};

export function DispatchPage() {
  const { isAdmin, canCreate } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForPrint, setSelectedForPrint] = useState<any>(null);

  const { data: response, isLoading } = useDispatchRecords();
  const createDispatch = useCreateDispatch();
  const updateStatus = useUpdateDispatchStatus();

  const handleCreateDispatch = (data: DispatchFormData) => {
    createDispatch.mutate(data, {
      onSuccess: () => {
        setIsFormOpen(false);
      },
    });
  };

  const handlePrint = (dispatchData: any) => {
    setSelectedForPrint(dispatchData);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const dispatches = response?.data || [];
  const filteredDispatches = dispatches.filter(d => 
    d.dispatchNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    const exportData = filteredDispatches.map(d => ({
      'Challan No': d.dispatchNo,
      'Date': d.dispatchDate,
      'Customer Name': d.customerName,
      'Customer Address': d.customerAddress,
      'Items Count': d.items.length,
      'Status': d.status
    }));
    exportToExcel(exportData, `Dispatch_Records_${new Date().toISOString().slice(0, 10)}`, 'Dispatches');
  };

  return (
    <div className="space-y-6">
      <PrintableChallan dispatchData={selectedForPrint} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" /> Dispatch Module
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage outbound shipments and delivery challans</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Download size={18} />
            Export
          </button>
          {canCreate && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> New Dispatch
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by challan or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-black rounded-xl shadow-sm border border-gray-200 dark:border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
            <thead className="bg-gray-50 dark:bg-neutral-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Challan No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">Loading dispatches...</td>
                </tr>
              ) : filteredDispatches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">No dispatches found.</td>
                </tr>
              ) : (
                filteredDispatches.map((dispatch) => (
                  <tr key={dispatch._id} className="hover:bg-gray-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {dispatch.dispatchNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {dispatch.dispatchDate}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{dispatch.customerName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-[200px]">{dispatch.customerAddress}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {dispatch.items.length} items
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[dispatch.status]}`}>
                        {dispatch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                      <button
                        onClick={() => handlePrint(dispatch)}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        Print Challan
                      </button>
                      {isAdmin && dispatch.status === 'Pending' && (
                        <button
                          onClick={() => updateStatus.mutate({ id: dispatch._id, status: 'Dispatched' })}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Mark Dispatched
                        </button>
                      )}
                      {isAdmin && dispatch.status === 'Dispatched' && (
                        <button
                          onClick={() => updateStatus.mutate({ id: dispatch._id, status: 'Delivered' })}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SlideOver
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Create Dispatch Challan"
      >
        <DispatchForm
          onSubmit={handleCreateDispatch}
          isSubmitting={createDispatch.isPending}
        />
      </SlideOver>
    </div>
  );
}
