import { useState } from "react";
import { api } from "../../services/api/client";

const API_URL = "/orders";

export function OrdersPage() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    orderNumber: "",
    customerName: "",
    itemName: "",
    itemSerialNumber: "",
    dieSerialNumber: "",
    quantityOrdered: "",
    boxType: "",
    printed: false,
    laminated: false,
    length: "",
    breadth: "",
    height: "",
    sheetLength: "",
    sheetBreadth: "",
    ply: "",
    gsm: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post(API_URL, formData);

      console.log("Saved Order:", response.data);

      alert("Order Saved Successfully");

      setFormData({
        orderNumber: "",
        customerName: "",
        itemName: "",
        itemSerialNumber: "",
        dieSerialNumber: "",
        quantityOrdered: "",
        boxType: "",
        printed: false,
        laminated: false,
        length: "",
        breadth: "",
        height: "",
        sheetLength: "",
        sheetBreadth: "",
        ply: "",
        gsm: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Create New Order
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-6 grid grid-cols-2 gap-4"
      >
        <input
          name="orderNumber"
          value={formData.orderNumber}
          placeholder="Order Number"
          className="border rounded p-2"
          onChange={handleChange}
        />

        <input
          name="customerName"
          value={formData.customerName}
          placeholder="Customer Name"
          className="border rounded p-2"
          onChange={handleChange}
        />

        <input
          name="itemName"
          value={formData.itemName}
          placeholder="Item Name"
          className="border rounded p-2"
          onChange={handleChange}
        />

        <input
          name="itemSerialNumber"
          value={formData.itemSerialNumber}
          placeholder="Item Serial Number"
          className="border rounded p-2"
          onChange={handleChange}
        />

        <input
          name="dieSerialNumber"
          value={formData.dieSerialNumber}
          placeholder="Die Serial Number"
          className="border rounded p-2"
          onChange={handleChange}
        />

        <input
          name="quantityOrdered"
          value={formData.quantityOrdered}
          placeholder="Quantity Ordered"
          className="border rounded p-2"
          onChange={handleChange}
        />

        <select
          name="boxType"
          value={formData.boxType}
          className="border rounded p-2"
          onChange={handleChange}
        >
          <option value="">Select Box Type</option>
          <option value="Pizza Type">Pizza Type</option>
          <option value="Flap Type">Flap Type</option>
          <option value="Carton Type">Carton Type</option>
          <option value="Ghera Patti">Ghera Patti</option>
          <option value="Z Patti">Z Patti</option>
        </select>

        <input
          name="length"
          value={formData.length}
          placeholder="Length"
          className="border rounded p-2"
          onChange={handleChange}
        />

        <input
          name="breadth"
          value={formData.breadth}
          placeholder="Breadth"
          className="border rounded p-2"
          onChange={handleChange}
        />

        <input
          name="height"
          value={formData.height}
          placeholder="Height"
          className="border rounded p-2"
          onChange={handleChange}
        />

        <input
          name="sheetLength"
          value={formData.sheetLength}
          placeholder="Sheet Length"
          className="border rounded p-2"
          onChange={handleChange}
        />

        <input
          name="sheetBreadth"
          value={formData.sheetBreadth}
          placeholder="Sheet Breadth"
          className="border rounded p-2"
          onChange={handleChange}
        />

        <input
          name="ply"
          value={formData.ply}
          placeholder="Ply"
          className="border rounded p-2"
          onChange={handleChange}
        />

        <input
          name="gsm"
          value={formData.gsm}
          placeholder="GSM"
          className="border rounded p-2"
          onChange={handleChange}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="printed"
            checked={formData.printed}
            onChange={handleChange}
          />
          Printed
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="laminated"
            checked={formData.laminated}
            onChange={handleChange}
          />
          Laminated
        </label>

        <button
          type="submit"
          disabled={loading}
          className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
        >
          {loading ? "Saving..." : "Save Order"}
        </button>
      </form>
    </div>
  );
}
