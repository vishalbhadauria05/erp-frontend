import type { DispatchFormData } from '../types';

interface PrintableChallanProps {
  dispatchData: any; // We will pass the full record here
}

export function PrintableChallan({ dispatchData }: PrintableChallanProps) {
  if (!dispatchData) return null;

  return (
    <div id="print-area" className="hidden print:block bg-white text-black p-12 w-full">
      <div className="border-2 border-gray-800 p-6 rounded-lg">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold uppercase tracking-wider mb-2">Amar Packers</h1>
          <p className="text-gray-600">Manufacturer of Corrugated Boxes & Rolls</p>
          <p className="text-sm font-semibold uppercase mt-4 text-gray-800 tracking-widest border border-gray-800 inline-block px-4 py-1 rounded">Delivery Challan</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-sm text-gray-600 font-semibold mb-1">To,</p>
            <h2 className="text-lg font-bold">{dispatchData.customerName}</h2>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{dispatchData.customerAddress}</p>
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="text-sm text-gray-600 font-semibold inline-block w-24">Challan No:</span>
              <span className="font-bold text-gray-900">{dispatchData.dispatchNo}</span>
            </div>
            <div>
              <span className="text-sm text-gray-600 font-semibold inline-block w-24">Date:</span>
              <span className="font-medium text-gray-900">{dispatchData.dispatchDate}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left border-collapse border border-gray-800 mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-800 px-4 py-2 text-sm font-bold w-12 text-center">S.No</th>
              <th className="border border-gray-800 px-4 py-2 text-sm font-bold">Item Name & Brand</th>
              <th className="border border-gray-800 px-4 py-2 text-sm font-bold">Box Name</th>
              <th className="border border-gray-800 px-4 py-2 text-sm font-bold text-center w-24">Qty</th>
            </tr>
          </thead>
          <tbody>
            {dispatchData.items?.map((item: any, index: number) => (
              <tr key={index}>
                <td className="border border-gray-800 px-4 py-3 text-sm text-center">{index + 1}</td>
                <td className="border border-gray-800 px-4 py-3 text-sm">
                  <div className="font-semibold">{item.itemName}</div>
                  <div className="text-xs text-gray-600">Brand: {item.brand}</div>
                </td>
                <td className="border border-gray-800 px-4 py-3 text-sm">{item.boxName}</td>
                <td className="border border-gray-800 px-4 py-3 text-sm text-center font-bold">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex justify-between items-end mt-16 pt-8">
          <div className="text-center">
            <div className="border-t border-gray-400 w-40 pt-2 text-sm font-medium">Receiver's Signature</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium mb-8">For Amar Packers</div>
            <div className="border-t border-gray-400 w-48 pt-2 text-sm font-medium">Authorized Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
}
