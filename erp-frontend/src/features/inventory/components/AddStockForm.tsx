import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { StockTransaction } from '../types';

const schema = z.object({
  type: z.enum(['IN', 'OUT']),
  quantity: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Must be a valid positive number'),
  referenceNumber: z.string().min(2, 'Reference number is required'),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

interface AddStockFormProps {
  inventoryId: string;
  itemName: string;
  unit: string;
  onSubmit: (data: Omit<StockTransaction, '_id' | 'date'>) => void;
  isSubmitting: boolean;
}

export function AddStockForm({ inventoryId, itemName, unit, onSubmit, isSubmitting }: AddStockFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'IN',
      quantity: '',
      referenceNumber: '',
      notes: ''
    }
  });

  const onValidSubmit = (data: FormValues) => {
    onSubmit({
      inventoryRef: inventoryId,
      type: data.type,
      quantity: Number(data.quantity),
      referenceNumber: data.referenceNumber,
      notes: data.notes
    });
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-5 p-1">
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-6">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Selected Item</p>
        <p className="text-sm font-semibold text-gray-900">{itemName}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Transaction Type *</label>
          <select {...register('type')} className={inputClass}>
            <option value="IN">Stock IN (Receive)</option>
            <option value="OUT">Stock OUT (Issue)</option>
          </select>
          {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>}
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Quantity ({unit}) *</label>
          <input 
            {...register('quantity')} 
            type="number" 
            step="0.01" 
            placeholder="e.g. 500" 
            className={inputClass} 
          />
          {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Reference Number (PO / WO) *</label>
        <input 
          {...register('referenceNumber')} 
          placeholder="e.g. PO-2024-001" 
          className={inputClass} 
        />
        {errors.referenceNumber && <p className="mt-1 text-xs text-red-500">{errors.referenceNumber.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Notes (Optional)</label>
        <textarea 
          {...register('notes')} 
          placeholder="Add any additional details here..." 
          className={inputClass}
          rows={3}
        />
      </div>

      <div className="pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving Transaction...' : 'Save Transaction'}
        </button>
      </div>
    </form>
  );
}
