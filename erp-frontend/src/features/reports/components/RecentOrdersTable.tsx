import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/orders";

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
      <div className="rounded-xl border bg-white p-6">
        Loading Orders...
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">
          Recent Orders
        </h2>
      </div>

      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-3">Order</th>
            <th className="p-3">Customer</th>
            <th className="p-3">Item</th>
            <th className="p-3">Qty</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr
              key={order._id}
              className="border-t hover:bg-gray-50"
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
                <span className="rounded bg-yellow-100 px-2 py-1 text-sm">
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