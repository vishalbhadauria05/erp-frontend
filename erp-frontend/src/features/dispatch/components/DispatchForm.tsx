import type { ReactNode } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { DispatchFormData } from '../types';
import { Truck, Plus, Trash2, PackageMinus } from 'lucide-react';
import { useInventory } from '../../inventory/hooks/useInventory';

const dispatchItemSchema = z.object({
  id: z.string(),
  itemName: z.string().min(2, 'Item name is required'),
  brand: z.string().min(1, 'Brand is required'),
  boxName: z.string().min(1, 'Box name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

const schema = z.object({
  dispatchDate: z.string().min(1, 'Date is required'),
  customerName: z.string().min(2, 'Customer name is required'),
  customerAddress: z.string().min(5, 'Customer address is required'),
  senderName: z.string().min(1, 'Sender name is required'),
  items: z.array(dispatchItemSchema).min(1, 'At least one item is required'),
  consumedMaterialId: z.string().optional(),
  consumedWeight: z.number().min(0, 'Weight must be 0 or greater').optional(),
}).refine((data) => {
  if (data.consumedMaterialId && data.consumedMaterialId.trim() !== '') {
    return data.consumedWeight !== undefined && data.consumedWeight > 0;
  }
  return true;
}, {
  message: "Weight must be greater than 0 if a material is selected",
  path: ["consumedWeight"],
}).refine((data) => {
  if (data.consumedWeight !== undefined && data.consumedWeight > 0) {
    return data.consumedMaterialId && data.consumedMaterialId.trim() !== '';
  }
  return true;
}, {
  message: "Please select a material to deduct from",
  path: ["consumedMaterialId"],
});

type FormValues = z.infer<typeof schema>;

interface DispatchFormProps {
  onSubmit: (data: DispatchFormData) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<DispatchFormData>;
}

function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner';

export function DispatchForm({ onSubmit, isSubmitting, defaultValues }: DispatchFormProps) {
  const { data: inventoryData } = useInventory('All');
  const inventoryItems = inventoryData?.data || [];
  const printedMaterials = inventoryItems.filter((i: any) => i.itemRef?.type === 'Printed Duplex' || i.itemRef?.category?.toLowerCase() === 'printed duplex');

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      dispatchDate: new Date().toISOString().split('T')[0],
      customerName: '',
      customerAddress: '',
      senderName: 'Amar Packers',
      items: [{ id: '1', itemName: '', brand: '', boxName: '', quantity: 1 }],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onValidSubmit = (values: FormValues) => {
    onSubmit(values as DispatchFormData);
  };

  const sectionClass = "bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm";
  const sectionTitleClass = "text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide flex items-center mb-4 pb-2 border-b border-gray-100 dark:border-neutral-800";

  return (
    <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-6 bg-gray-50 dark:bg-black p-2 rounded-xl">
      
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>
          <Truck className="w-4 h-4 mr-2" /> Dispatch Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Dispatch Date *" error={errors.dispatchDate?.message}>
            <input type="date" {...register('dispatchDate')} className={inputClass} />
          </FormField>
          <FormField label="Sender Name *" error={errors.senderName?.message}>
            <input {...register('senderName')} readOnly className={`${inputClass} bg-gray-100 dark:bg-gray-900 cursor-not-allowed text-gray-500`} />
          </FormField>
          <FormField label="Customer Name *" error={errors.customerName?.message}>
            <input {...register('customerName')} placeholder="e.g. Anand Papers" className={inputClass} />
          </FormField>
          <FormField label="Customer Address *" error={errors.customerAddress?.message}>
            <input {...register('customerAddress')} placeholder="Delivery Address" className={inputClass} />
          </FormField>
        </div>
      </div>

      <div className={sectionClass}>
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
            Dispatch Items
          </h3>
          <button
            type="button"
            onClick={() => append({ id: Math.random().toString(), itemName: '', brand: '', boxName: '', quantity: 1 })}
            className="flex items-center text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-3 h-3 mr-1" /> Add Item
          </button>
        </div>

        {errors.items?.root && <p className="text-xs text-red-500 mb-4">{errors.items.root.message}</p>}

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-3 items-end bg-gray-50/50 dark:bg-black/20 p-3 rounded-lg border border-gray-100 dark:border-neutral-800/50">
              <div className="col-span-1 pb-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">#{index + 1}</span>
              </div>
              <div className="col-span-3">
                <FormField label="Item Name" error={errors.items?.[index]?.itemName?.message}>
                  <input {...register(`items.${index}.itemName`)} placeholder="Item" className={inputClass} />
                </FormField>
              </div>
              <div className="col-span-3">
                <FormField label="Brand" error={errors.items?.[index]?.brand?.message}>
                  <input {...register(`items.${index}.brand`)} placeholder="Brand" className={inputClass} />
                </FormField>
              </div>
              <div className="col-span-2">
                <FormField label="Box Name" error={errors.items?.[index]?.boxName?.message}>
                  <input {...register(`items.${index}.boxName`)} placeholder="Box Name" className={inputClass} />
                </FormField>
              </div>
              <div className="col-span-2">
                <FormField label="Qty" error={errors.items?.[index]?.quantity?.message}>
                  <input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true })} min="1" className={inputClass} />
                </FormField>
              </div>
              <div className="col-span-1 pb-2 flex justify-end">
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>
          <PackageMinus className="w-4 h-4 mr-2 text-orange-500" /> Material Consumption (Optional)
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Select the Printed Duplex stock consumed for manufacturing these dispatched boxes. This will deduct the stock from Inventory.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Consumed Printed Material" error={errors.consumedMaterialId?.message}>
            <select {...register('consumedMaterialId')} className={inputClass}>
              <option value="">-- No deduction --</option>
              {printedMaterials.map((m: any) => (
                <option key={m._id} value={m._id}>{m.itemRef?.itemName || m.itemRef?.name} (Stock: {m.currentStock})</option>
              ))}
            </select>
          </FormField>
          <FormField label="Consumed Weight (kg)" error={errors.consumedWeight?.message}>
            <input type="number" step="0.1" {...register('consumedWeight', { valueAsNumber: true })} placeholder="Auto-calculated or Manual" className={inputClass} />
          </FormField>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
        >
          {isSubmitting ? 'Creating Dispatch...' : 'Create Dispatch Challan'}
        </button>
      </div>
    </form>
  );
}
