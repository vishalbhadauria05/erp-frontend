import { ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockOrders } from '../../../mocks/orders';
import { StatusBadge } from '../../../components/ui/StatusBadge';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <ClipboardList size={22} className="text-gray-400" aria-hidden="true" />
      </div>
      <p className="mt-3 text-sm font-medium text-gray-900">No orders yet</p>
      <p className="mt-1 text-sm text-gray-500">New orders will appear here once created.</p>
      <Link
        to="/orders"
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Create first order
      </Link>
    </div>
  );
}

export function RecentOrdersTable() {
  const orders = mockOrders.slice(0, 5);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
          <p className="text-xs text-gray-500 mt-0.5">Latest 5 orders across all customers</p>
        </div>
        <Link
          to="/orders"
          className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          View all →
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Order #
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Customer
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Box Type
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Qty
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors duration-100"
                >
                  <td className="px-5 py-3.5 font-medium text-blue-600">{order.orderNumber}</td>
                  <td className="px-5 py-3.5 text-gray-900">{order.customer}</td>
                  <td className="px-5 py-3.5 text-gray-600">{order.boxType}</td>
                  <td className="px-5 py-3.5 text-gray-600">{order.qty.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3.5 text-gray-500">{formatDate(order.date)}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
