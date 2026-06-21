import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { InventoryItem } from '../types';
import { AlertTriangle } from 'lucide-react';

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
  gsm?: number;
  dimensions?: string;
  category?: string;
  linkedReels?: InventoryItem['linkedReels'];
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function AddStockForm({ inventoryId, itemName, unit, gsm, dimensions, category, linkedReels, onSubmit, isSubmitting }: AddStockFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'IN',
      quantity: '',
      referenceNumber: '',
      notes: ''
    }
  });

  const transactionType = watch('type');
  const quantity = watch('quantity');

  const isCorrugatedRoll = category === 'Corrugated Rolls';
  const hasLinkedReels = isCorrugatedRoll && linkedReels && (linkedReels.kraft || linkedReels.semiKraft);
  const showReelFields = hasLinkedReels && transactionType === 'IN';

  // Auto-calculated reel consumption
  const [kraftReelQty, setKraftReelQty] = useState('');
  const [semiKraftReelQty, setSemiKraftReelQty] = useState('');

  // Auto-calculate when quantity changes
  useEffect(() => {
    const qty = Number(quantity);
    if (!qty || qty <= 0 || !linkedReels) return;

    if (linkedReels.kraft?.ratio) {
      setKraftReelQty(String(Math.round(qty * linkedReels.kraft.ratio * 100) / 100));
    }
    if (linkedReels.semiKraft?.ratio) {
      setSemiKraftReelQty(String(Math.round(qty * linkedReels.semiKraft.ratio * 100) / 100));
    }
  }, [quantity, linkedReels]);

  const onValidSubmit = (data: FormValues) => {
    const payload: any = {
      inventoryRef: inventoryId,
      type: data.type,
      quantity: Number(data.quantity),
      referenceNumber: data.referenceNumber,
      notes: data.notes
    };

    // Attach reel deduction data for Corrugated Rolls Stock IN
    if (showReelFields) {
      if (linkedReels?.kraft?.inventoryId && Number(kraftReelQty) > 0) {
        payload.kraftReelInventoryId = linkedReels.kraft.inventoryId;
        payload.kraftReelQty = kraftReelQty;
      }
      if (linkedReels?.semiKraft?.inventoryId && Number(semiKraftReelQty) > 0) {
        payload.semiKraftReelInventoryId = linkedReels.semiKraft.inventoryId;
        payload.semiKraftReelQty = semiKraftReelQty;
      }
    }

    onSubmit(payload);
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner';

  return (
    <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-5 p-1">
      <div className="bg-gray-50 dark:bg-black rounded-lg p-4 border border-gray-100 dark:border-neutral-800 mb-6">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">Selected Item</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{itemName}</p>
        {(gsm || dimensions) && (
          <div className="flex items-center gap-3 mt-2">
            {gsm ? (
              <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                GSM: {gsm}
              </span>
            ) : null}
            {dimensions ? (
              <span className="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                Size: {dimensions}
              </span>
            ) : null}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction Type *</label>
          <select {...register('type')} className={inputClass}>
            <option value="IN">Stock IN (Receive)</option>
            <option value="OUT">Stock OUT (Issue)</option>
          </select>
          {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type.message}</p>}
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity ({unit}) *</label>
          <input 
            {...register('quantity')} 
            type="number" min="0" 
            step="0.01" 
            placeholder="e.g. 500" 
            className={inputClass} 
          />
          {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>}
        </div>
      </div>

      {/* Reel Consumption Section - only for Corrugated Rolls with Stock IN */}
      {showReelFields && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 border-b border-amber-300 dark:border-amber-700 pb-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle size={12} className="text-amber-600" />
            </span>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Reel Consumption (Auto-Calculated)</h4>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Based on the ratio from initial creation. You can adjust if actual usage differs.
          </p>

          {linkedReels?.kraft && (
            <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg p-3 border border-gray-200 dark:border-neutral-800">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                Kraft Reel Consumption
              </label>
              <p className="text-xs text-gray-400 mb-2">Ratio: {linkedReels.kraft.ratio?.toFixed(4)} per unit</p>
              <input
                type="number"
                min="0"
                step="0.01"
                value={kraftReelQty}
                onChange={(e) => setKraftReelQty(e.target.value)}
                placeholder="e.g. 500"
                className={inputClass}
              />
            </div>
          )}

          {linkedReels?.semiKraft && (
            <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg p-3 border border-gray-200 dark:border-neutral-800">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                Semi Kraft Reel Consumption
              </label>
              <p className="text-xs text-gray-400 mb-2">Ratio: {linkedReels.semiKraft.ratio?.toFixed(4)} per unit</p>
              <input
                type="number"
                min="0"
                step="0.01"
                value={semiKraftReelQty}
                onChange={(e) => setSemiKraftReelQty(e.target.value)}
                placeholder="e.g. 300"
                className={inputClass}
              />
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Reference Number (PO / WO) *</label>
        <input 
          {...register('referenceNumber')} 
          placeholder="e.g. PO-2024-001" 
          className={inputClass} 
        />
        {errors.referenceNumber && <p className="mt-1 text-xs text-red-500">{errors.referenceNumber.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
        <textarea 
          {...register('notes')} 
          placeholder="Add any additional details here..." 
          className={inputClass}
          rows={3}
        />
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-neutral-800">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving Transaction...' : showReelFields ? 'Save & Deduct Reels' : 'Save Transaction'}
        </button>
      </div>
    </form>
  );
}
