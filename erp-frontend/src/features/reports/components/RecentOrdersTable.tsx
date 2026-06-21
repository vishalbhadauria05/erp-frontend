import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5001/api/orders";

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  itemName: string;
  quantityOrdered: number;
  status: string;
}

export function RecentOrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(API_URL);
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 p-6 text-gray-900 dark:text-gray-100">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 shadow-sm">
      <div className="border-b border-gray-200 dark:border-gray-800 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Recent Orders
        </h2>
      </div>

      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800/50 text-left text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
            <th className="p-3 font-medium text-sm">Order</th>
            <th className="p-3 font-medium text-sm">Customer</th>
            <th className="p-3 font-medium text-sm">Item</th>
            <th className="p-3 font-medium text-sm">Qty</th>
            <th className="p-3 font-medium text-sm">Status</th>
          </tr>
        </thead>

        <tbody className="text-sm text-gray-700 dark:text-gray-300">
          {orders.map((order) => (
            <tr
              key={order._id}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="p-3">
                {order.orderNumber}
              </td>

              <td className="p-3">
                {order.customerName}
              </td>

              <td className="p-3">
                {order.itemName}
              </td>

              <td className="p-3">
                {order.quantityOrdered}
              </td>

              <td className="p-3">
                <span className="rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 px-2 py-1 text-xs font-medium">
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}