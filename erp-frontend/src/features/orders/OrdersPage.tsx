import { useState } from 'react';
import { Plus, Search, FileText, Package, CheckCircle2, Truck, Download, Printer, Send, AlertTriangle } from 'lucide-react';
import { exportToExcel } from '../../utils/exportToExcel';
import {
  useOrders,
  useCreateOrder,
  useUpdateOrderStatus,
  useUpdateDelivery,
  useCreateOrderJobWork,
  useCreateOrderDispatch,
} from './hooks/useOrders';
import { useInventory } from '../inventory/hooks/useInventory';
import { SlideOver } from '../../components/ui/SlideOver';
import { OrderForm } from './components/OrderForm';
import { useAuth } from '../auth/auth';
import type { Order, OrderFormData } from './types';

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  Approved: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
  'In Production': 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400',
  Completed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400',
  Dispatched: 'bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-400',
  Cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
};

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'In Production', 'Completed', 'Dispatched', 'Cancelled'];

type JobModalState = {
  order: Order;
  inventoryId: string;
  quantity: string;
  error: string;
};

type DispatchModalState = {
  order: Order;
  customerAddress: string;
  quantity: string;
  error: string;
};

export function OrdersPage() {
  const { isAdmin, canCreate } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [deliveryModal, setDeliveryModal] = useState<{ orderId: string; orderNumber: string; qtyOrdered: number; qtyDelivered: number } | null>(null);
  const [deliveryInput, setDeliveryInput] = useState('');
  const [jobModal, setJobModal] = useState<JobModalState | null>(null);
  const [dispatchModal, setDispatchModal] = useState<DispatchModalState | null>(null);

  const { data: ordersData, isLoading, isError } = useOrders();
  const { data: inventoryData } = useInventory('All');
  const createOrderMutation = useCreateOrder();
  const updateStatusMutation = useUpdateOrderStatus();
  const updateDeliveryMutation = useUpdateDelivery();
  const createOrderJobMutation = useCreateOrderJobWork();
  const createOrderDispatchMutation = useCreateOrderDispatch();

  const orders = ordersData?.data || [];
  const inventoryItems = inventoryData?.data || [];

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

  const getOrderJobType = (order: Order) => order.laminated ? 'Printed+Laminated' : 'Printed';

  const getOrderReadyForDispatch = (order: Order) => {
    if (order.dispatchRef || order.status === 'Dispatched' || order.status === 'Cancelled') return false;
    if (!order.printed) return true;
    return order.productionStage === 'Printed' || order.productionStage === 'Printed & Laminated';
  };

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

  const openDeliveryModal = (order: any) => {
    setDeliveryModal({
      orderId: order._id,
      orderNumber: order.orderNumber,
      qtyOrdered: order.quantityOrdered || 0,
      qtyDelivered: order.quantityDelivered || 0,
    });
    setDeliveryInput(String(order.quantityDelivered || 0));
  };

  const openJobModal = (order: Order) => {
    setJobModal({
      order,
      inventoryId: '',
      quantity: String(order.quantityOrdered || ''),
      error: '',
    });
  };

  const openDispatchModal = (order: Order) => {
    const qtyOrdered = Number(order.quantityOrdered) || 0;
    const qtyDelivered = order.quantityDelivered || 0;
    const remaining = Math.max(0, qtyOrdered - qtyDelivered);
    setDispatchModal({
      order,
      customerAddress: '',
      quantity: String(remaining || qtyOrdered || ''),
      error: '',
    });
  };

  const handleExport = () => {
    const exportData = orders.map((o) => ({
      'Order #': o.orderNumber,
      'Customer': o.customerName,
      'Brand': o.itemBrand || '',
      'Item': o.itemName,
      'Box Type': o.boxType,
      'Ordered': o.quantityOrdered,
      'Delivered': o.quantityDelivered || 0,
      'Remaining': o.quantityRemaining ?? (Number(o.quantityOrdered) - (o.quantityDelivered || 0)),
      'Status': o.status || 'Pending',
      'Production': o.productionStage || 'Not Started',
      'Created': o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '',
    }));
    exportToExcel(exportData, `Orders_${new Date().toISOString().slice(0,10)}`, 'Orders');
  };

  const handleUpdateDelivery = () => {
    if (!deliveryModal) return;
    const qty = Number(deliveryInput);
    if (isNaN(qty) || qty < 0) {
      alert('Please enter a valid number');
      return;
    }
    if (qty > deliveryModal.qtyOrdered) {
      alert(`Cannot deliver more than ordered (${deliveryModal.qtyOrdered})`);
      return;
    }
    updateDeliveryMutation.mutate(
      { id: deliveryModal.orderId, quantityDelivered: qty },
      { onSuccess: () => setDeliveryModal(null) }
    );
  };

  const handleCreateJobFromOrder = () => {
    if (!jobModal) return;
    const qty = Number(jobModal.quantity);
    const selectedInventory = inventoryItems.find((item: any) => item._id === jobModal.inventoryId);
    const availableStock = selectedInventory?.currentStock || 0;

    if (!jobModal.inventoryId) {
      setJobModal({ ...jobModal, error: 'Please select source inventory material.' });
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      setJobModal({ ...jobModal, error: 'Quantity must be a positive number.' });
      return;
    }
    if (qty > availableStock) {
      setJobModal({ ...jobModal, error: `Insufficient stock. Available: ${availableStock}, Requested: ${qty}.` });
      return;
    }

    createOrderJobMutation.mutate(
      {
        id: jobModal.order._id,
        data: {
          inventoryRef: jobModal.inventoryId,
          quantity: qty,
          jobNumber: `JOB-${jobModal.order.orderNumber}`,
        },
      },
      {
        onSuccess: () => setJobModal(null),
        onError: (error: any) => {
          setJobModal({
            ...jobModal,
            error: error?.response?.data?.message || 'Failed to send order to job work.',
          });
        },
      }
    );
  };

  const handleCreateDispatchFromOrder = () => {
    if (!dispatchModal) return;
    const qty = Number(dispatchModal.quantity);
    const qtyOrdered = Number(dispatchModal.order.quantityOrdered) || 0;
    const qtyDelivered = dispatchModal.order.quantityDelivered || 0;
    const qtyRemaining = Math.max(0, qtyOrdered - qtyDelivered);
    const maxDispatchQty = qtyRemaining > 0 ? qtyRemaining : qtyOrdered;

    if (dispatchModal.customerAddress.trim().length < 5) {
      setDispatchModal({ ...dispatchModal, error: 'Customer address is required.' });
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      setDispatchModal({ ...dispatchModal, error: 'Quantity must be a positive number.' });
      return;
    }
    if (qty > maxDispatchQty) {
      setDispatchModal({ ...dispatchModal, error: `Cannot dispatch more than remaining (${maxDispatchQty}).` });
      return;
    }

    createOrderDispatchMutation.mutate(
      {
        id: dispatchModal.order._id,
        data: {
          customerAddress: dispatchModal.customerAddress.trim(),
          dispatchDate: new Date().toISOString().slice(0, 10),
          quantity: qty,
          senderName: 'Amar Packers',
        },
      },
      {
        onSuccess: () => setDispatchModal(null),
        onError: (error: any) => {
          setDispatchModal({
            ...dispatchModal,
            error: error?.response?.data?.message || 'Failed to send order to dispatch.',
          });
        },
      }
    );
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
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Download size={18} />
            Export
          </button>
          {canCreate && (
            <button
              onClick={() => setIsSlideOverOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
            >
              <Plus size={18} />
              New Order
            </button>
          )}
        </div>
      </div>

      {/* Card with tabs + table */}
      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden flex flex-col">

        {/* Status Tabs */}
        <div className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-black px-4 pt-4">
          <div className="flex space-x-6 overflow-x-auto pb-px custom-scrollbar">
            {STATUS_FILTERS.map((status) => {
              const isActive = activeStatus === status;
              const count = status === 'All' ? orders.length : (statusCounts[status] || 0);
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
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Specs</th>
                <th className="px-6 py-4">Ordered</th>
                <th className="px-6 py-4">Delivery</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading orders...
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-red-500">Failed to load orders. Is the backend running?</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
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
                  const qtyOrdered = Number(order.quantityOrdered) || 0;
                  const qtyDelivered = order.quantityDelivered || 0;
                  const qtyRemaining = order.quantityRemaining ?? Math.max(0, qtyOrdered - qtyDelivered);
                  const deliveryPercent = qtyOrdered > 0 ? Math.round((qtyDelivered / qtyOrdered) * 100) : 0;
                  const isFullyDelivered = qtyDelivered >= qtyOrdered && qtyOrdered > 0;

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
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200">
                          {order.boxType || 'No Type'}
                        </span>
                        {(order.length || order.breadth || order.height) && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {order.length || 0}×{order.breadth || 0}×{order.height || 0}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
                        {qtyOrdered}
                      </td>

                      {/* Delivery Column */}
                      <td className="px-6 py-4">
                        <div className="min-w-[140px]">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {qtyDelivered}/{qtyOrdered}
                            </span>
                            <span className={`font-medium ${isFullyDelivered ? 'text-emerald-600' : qtyDelivered > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                              {deliveryPercent}%
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                isFullyDelivered ? 'bg-emerald-500' : qtyDelivered > 0 ? 'bg-amber-500' : 'bg-gray-300'
                              }`}
                              style={{ width: `${Math.min(deliveryPercent, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {qtyRemaining > 0 ? `${qtyRemaining} remaining` : 'Fully delivered'}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status || 'Pending'] || statusColors.Pending}`}>
                          {order.status || 'Pending'}
                        </span>
                        {order.printed && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                              <Printer size={11} />
                              {order.productionStage || 'Not Started'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isCompleted && !isAdmin && (
                            <span className="text-xs text-gray-400 italic">—</span>
                          )}
                          {!isCompleted && isAdmin && (
                            <>
                              {order.printed && !order.jobWorkRef && (
                                <button
                                  onClick={() => openJobModal(order)}
                                  disabled={createOrderJobMutation.isPending}
                                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 disabled:opacity-50 transition-colors"
                                  title="Send to job work"
                                >
                                  <Printer size={13} />
                                  Job
                                </button>
                              )}
                              {getOrderReadyForDispatch(order) && (
                                <button
                                  onClick={() => openDispatchModal(order)}
                                  disabled={createOrderDispatchMutation.isPending}
                                  className="inline-flex items-center gap-1 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 px-2.5 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/40 disabled:opacity-50 transition-colors"
                                  title="Send to dispatch"
                                >
                                  <Send size={13} />
                                  Dispatch
                                </button>
                              )}
                              <button
                                onClick={() => openDeliveryModal(order)}
                                className="inline-flex items-center gap-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                title="Update delivery"
                              >
                                <Truck size={13} />
                                Deliver
                              </button>
                              <button
                                onClick={() => handleMarkCompleted(order._id)}
                                disabled={updateStatusMutation.isPending}
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 disabled:opacity-50 transition-colors"
                                title="Mark as completed"
                              >
                                <CheckCircle2 size={13} />
                                Complete
                              </button>
                            </>
                          )}
                          {isCompleted && (
                            <span className="text-xs text-gray-400 italic">Done</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Update Modal */}
      {deliveryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-neutral-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              Update Delivery
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Order <span className="font-medium text-blue-600">{deliveryModal.orderNumber}</span> — {deliveryModal.qtyOrdered} ordered
            </p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Total Quantity Delivered
              </label>
              <input
                type="number"
                min="0"
                max={deliveryModal.qtyOrdered}
                value={deliveryInput}
                onChange={(e) => setDeliveryInput(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Remaining: {Math.max(0, deliveryModal.qtyOrdered - (Number(deliveryInput) || 0))} of {deliveryModal.qtyOrdered}
              </p>
            </div>

            {/* Quick buttons */}
            <div className="flex gap-2 mb-5">
              {[50, 100, 200, 500].filter(v => v <= deliveryModal.qtyOrdered).map((qty) => (
                <button
                  key={qty}
                  onClick={() => setDeliveryInput(String(Math.min(qty + (Number(deliveryInput) || 0), deliveryModal!.qtyOrdered)))}
                  className="text-xs px-2.5 py-1 rounded-md border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  +{qty}
                </button>
              ))}
              <button
                onClick={() => setDeliveryInput(String(deliveryModal.qtyOrdered))}
                className="text-xs px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                All
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeliveryModal(null)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDelivery}
                disabled={updateDeliveryMutation.isPending}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
              >
                {updateDeliveryMutation.isPending ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {jobModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-neutral-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              Send to Job Work
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {jobModal.order.orderNumber} will be sent as <span className="font-medium text-amber-600">{getOrderJobType(jobModal.order)}</span>.
            </p>

            {jobModal.error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                <AlertTriangle size={15} />
                {jobModal.error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Source Inventory Material
                </label>
                <select
                  value={jobModal.inventoryId}
                  onChange={(e) => setJobModal({ ...jobModal, inventoryId: e.target.value, error: '' })}
                  className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select inventory item</option>
                  {inventoryItems.map((record: any) => (
                    <option key={record._id} value={record._id}>
                      {record.itemRef?.itemName || 'Unknown'} ({record.itemRef?.category || 'No category'}) - Stock: {record.currentStock}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={jobModal.quantity}
                  onChange={(e) => setJobModal({ ...jobModal, quantity: e.target.value, error: '' })}
                  className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setJobModal(null)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJobFromOrder}
                disabled={createOrderJobMutation.isPending}
                className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-60 transition-colors shadow-sm"
              >
                {createOrderJobMutation.isPending ? 'Sending...' : 'Send to Job'}
              </button>
            </div>
          </div>
        </div>
      )}

      {dispatchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-neutral-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              Send to Dispatch
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Create a dispatch challan for <span className="font-medium text-violet-600">{dispatchModal.order.orderNumber}</span>.
            </p>

            {dispatchModal.error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                <AlertTriangle size={15} />
                {dispatchModal.error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Customer Address
                </label>
                <textarea
                  value={dispatchModal.customerAddress}
                  onChange={(e) => setDispatchModal({ ...dispatchModal, customerAddress: e.target.value, error: '' })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Delivery address"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Dispatch Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={Number(dispatchModal.order.quantityOrdered) || undefined}
                  value={dispatchModal.quantity}
                  onChange={(e) => setDispatchModal({ ...dispatchModal, quantity: e.target.value, error: '' })}
                  className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDispatchModal(null)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDispatchFromOrder}
                disabled={createOrderDispatchMutation.isPending}
                className="flex-1 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-60 transition-colors shadow-sm"
              >
                {createOrderDispatchMutation.isPending ? 'Creating...' : 'Create Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}

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
