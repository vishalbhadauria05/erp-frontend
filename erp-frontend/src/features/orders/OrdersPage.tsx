import { useState } from "react";
import axios from "axios";

export function OrdersPage() {
  const [formData, setFormData] = useState({
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

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/orders",
        formData
      );

      alert("Order Created Successfully");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Create New Order
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 grid grid-cols-2 gap-4"
      >
        <input
          name="customerName"
          placeholder="Customer Name"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="itemName"
          placeholder="Item Name"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="itemSerialNumber"
          placeholder="Item Serial Number"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="dieSerialNumber"
          placeholder="Die Serial Number"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="quantityOrdered"
          placeholder="Quantity Ordered"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <select
          name="boxType"
          className="border p-2 rounded"
          onChange={handleChange}
        >
          <option value="">Select Box Type</option>
          <option>Pizza Type</option>
          <option>Flap Type</option>
          <option>Carton Type</option>
          <option>Ghera Patti</option>
          <option>Z Patti</option>
        </select>

        <input
          name="length"
          placeholder="Length"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="breadth"
          placeholder="Breadth"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="height"
          placeholder="Height"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="sheetLength"
          placeholder="Sheet Length"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="sheetBreadth"
          placeholder="Sheet Breadth"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="ply"
          placeholder="Ply"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <input
          name="gsm"
          placeholder="GSM"
          className="border p-2 rounded"
          onChange={handleChange}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="printed"
            onChange={handleChange}
          />
          Printed
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="laminated"
            onChange={handleChange}
          />
          Laminated
        </label>

        <button
          type="submit"
          className="col-span-2 bg-blue-600 text-white py-3 rounded-lg"
        >
          Save Order
        </button>
      </form>
    </div>
  );
}