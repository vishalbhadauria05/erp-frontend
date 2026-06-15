import { useState } from 'react';
import { Plus, Search, FileText, Package, CheckCircle2 } from 'lucide-react';
import { useOrders, useCreateOrder, useUpdateOrderStatus } from './hooks/useOrders';
import { SlideOver } from '../../components/ui/SlideOver';
import { OrderForm } from './components/OrderForm';
import type { OrderFormData } from './types';

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  Approved: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  'In Production': 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400',
  Completed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400',
  Dispatched: 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-400',
  Cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
};

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'In Production', 'Completed', 'Dispatched', 'Cancelled'];

export function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const { data: ordersData, isLoading, isError } = useOrders();
  const createOrderMutation = useCreateOrder();
  const updateStatusMutation = useUpdateOrderStatus();

  const orders = ordersData?.data || [];

  // Count orders per status for tab badges
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    const s = o.status || 'Pending';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });

  // Filter by status tab
  const statusFiltered = activeStatus === 'All'
    ? orders
    : orders.filter((o) => (o.status || 'Pending') === activeStatus);

  // Then filter by search
  const filteredOrders = statusFiltered.filter((order) =>
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrder = (data: OrderFormData) => {
    createOrderMutation.mutate(data, {
      onSuccess: () => {
        setIsSlideOverOpen(false);
      },
      onError: (error) => {
        console.error("Failed to create order", error);
        alert("Failed to create order. See console for details.");
      }
    });
  };

  const handleMarkCompleted = (orderId: string) => {
    updateStatusMutation.mutate({ id: orderId, status: 'Completed' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {orders.length} total orders
            {statusCounts['Pending'] ? ` · ${statusCounts['Pending']} pending` : ''}
            {statusCounts['Completed'] ? ` · ${statusCounts['Completed']} completed` : ''}
          </p>
        </div>
        <button
          onClick={() => setIsSlideOverOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
        >
          <Plus size={18} />
          New Order
        </button>
      </div>

      {/* Card with tabs + table */}
      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col">

        {/* Status Tabs */}
        <div className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-black px-4 pt-4">
          <div className="flex space-x-6 overflow-x-auto pb-px custom-scrollbar">
            {STATUS_FILTERS.map((status) => {
              const isActive = activeStatus === status;
              const count = status === 'All' ? orders.length : (statusCounts[status] || 0);
              // Hide tabs with 0 count (except All and the currently active)
              if (count === 0 && status !== 'All' && !isActive) return null;
              return (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {status}
                  <span className={`text-xs rounded-full px-2 py-0.5 ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-gray-800/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Order #, Customer, or Item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-800 bg-white dark:bg-black text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 font-medium border-b border-gray-200 dark:border-neutral-800 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Specs</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-red-500">Failed to load orders. Is the backend running?</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {activeStatus === 'All' ? 'No orders found' : `No ${activeStatus.toLowerCase()} orders`}
                    </p>
                    <p className="text-sm mt-1">
                      {activeStatus === 'All'
                        ? 'Try adjusting your search or create a new order.'
                        : 'Try selecting a different status filter.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isCompleted = order.status === 'Completed' || order.status === 'Dispatched' || order.status === 'Cancelled';
                  return (
                    <tr
                      key={order._id || order.orderNumber}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isCompleted ? 'opacity-60' : ''}`}
                    >
                      <td className="px-6 py-4 font-medium text-blue-600 whitespace-nowrap">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                        {order.customerName || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-gray-400" />
                          <span>{order.itemName || '-'}</span>
                        </div>
                        {(order.itemSerialNumber || order.dieSerialNumber) && (
                          <div className="text-xs text-gray-400 mt-1">
                            {order.itemSerialNumber && `Item SN: ${order.itemSerialNumber}`}
                            {order.dieSerialNumber && ` · Die SN: ${order.dieSerialNumber}`}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200">
                            {order.boxType || 'No Type'}
                          </span>
                          {(order.length || order.breadth || order.height) && (
                            <div className="text-gray-500 dark:text-gray-400 mt-1">
                              L×B×H: {order.length || 0}×{order.breadth || 0}×{order.height || 0}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
                        {order.quantityOrdered || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status || 'Pending'] || statusColors.Pending}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isCompleted && (
                          <button
                            onClick={() => handleMarkCompleted(order._id)}
                            disabled={updateStatusMutation.isPending}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 disabled:opacity-50 transition-colors"
                            title="Mark as completed"
                          >
                            <CheckCircle2 size={14} />
                            Complete
                          </button>
                        )}
                        {isCompleted && (
                          <span className="text-xs text-gray-400 italic">Done</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title="Create New Order"
      >
        <OrderForm
          onSubmit={handleCreateOrder}
          isSubmitting={createOrderMutation.isPending}
        />
      </SlideOver>
    </div>
  );
}
