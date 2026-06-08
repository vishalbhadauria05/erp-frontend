import { useState } from 'react';
import { Plus, Search, FileText, Package } from 'lucide-react';
import { useOrders, useCreateOrder } from './hooks/useOrders';
import { SlideOver } from '../../components/ui/SlideOver';
import { OrderForm } from './components/OrderForm';
import type { OrderFormData } from './types';

export function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const { data: ordersData, isLoading, isError } = useOrders();
  const createOrderMutation = useCreateOrder();

  const orders = ordersData?.data || [];

  const filteredOrders = orders.filter((order) =>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage production orders and specifications.</p>
        </div>
        <button
          onClick={() => setIsSlideOverOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
        >
          <Plus size={18} />
          New Order
        </button>
      </div>

      {/* Filters and Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Order #, Customer, or Item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Specs</th>
                <th className="px-6 py-4">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-red-500">Failed to load orders. Is the backend running?</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-base font-medium text-gray-900">No orders found</p>
                    <p className="text-sm mt-1">Try adjusting your search or create a new order.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id || order.orderNumber} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600 whitespace-nowrap">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
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
                          {order.dieSerialNumber && ` • Die SN: ${order.dieSerialNumber}`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {order.boxType || 'No Type'}
                        </span>
                        {(order.length || order.breadth || order.height) && (
                          <div className="text-gray-500 mt-1">
                            L×B×H: {order.length || 0}×{order.breadth || 0}×{order.height || 0}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {order.quantityOrdered || 0}
                    </td>
                  </tr>
                ))
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
