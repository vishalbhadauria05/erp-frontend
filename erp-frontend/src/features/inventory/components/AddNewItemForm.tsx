import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { STOCK_CATEGORIES } from '../../../mocks/inventory';

const schema = z.object({
  itemCode: z.string().min(2, 'Item Code is required'),
  itemName: z.string().min(2, 'Item Name is required'),
  type: z.enum(['RawMaterial', 'FinishedGood', 'Consumable']),
  category: z.string().min(1, 'Category is required'),
  unitOfMeasure: z.string().min(1, 'Unit is required'),
  specifications: z.object({
    gsm: z.string().optional(),
    dimensions: z.string().optional()
  }),
  initialStock: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, 'Must be a valid positive number'),
  reorderLevel: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, 'Must be a valid positive number'),
  warehouseLocation: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

interface AddNewItemFormProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  defaultCategory: string;
}

export function AddNewItemForm({ onSubmit, isSubmitting, defaultCategory }: AddNewItemFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      itemCode: '',
      type: 'RawMaterial',
      category: defaultCategory === 'All' ? STOCK_CATEGORIES[0] : defaultCategory,
      initialStock: '0',
      reorderLevel: '0'
    }
  });

  const category = watch('category');
  const gsm = watch('specifications.gsm');
  const dimensions = watch('specifications.dimensions');

  useEffect(() => {
    if (!category) return;
    // Get initials of category (e.g. "Duplex Reel" -> "DR")
    const initials = category.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 3);
    
    let suffix = '';
    if (gsm && gsm.trim() !== '') {
      suffix = `-${gsm.trim()}`;
    } else if (dimensions && dimensions.trim() !== '') {
      // take first part of dimensions e.g. "28x40"
      suffix = `-${dimensions.split(' ')[0]}`;
    } else {
      // fallback if no specs provided
      suffix = '-XXX';
    }
    
    setValue('itemCode', `${initials}${suffix}`, { shouldValidate: true });
  }, [category, gsm, dimensions, setValue]);

  const onValidSubmit = (data: FormValues) => {
    onSubmit(data);
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-5 p-1 pb-10">
      
      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Basic Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Item Code (Auto-Generated) *</label>
            <input 
              {...register('itemCode')} 
              readOnly
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-700 font-mono focus:outline-none cursor-not-allowed" 
            />
            {errors.itemCode && <p className="mt-1 text-xs text-red-500">{errors.itemCode.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Item Name *</label>
            <input {...register('itemName')} placeholder="e.g. Duplex Reel 350 GSM" className={inputClass} />
            {errors.itemName && <p className="mt-1 text-xs text-red-500">{errors.itemName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
            <select {...register('type')} className={inputClass}>
              <option value="RawMaterial">Raw Material</option>
              <option value="Consumable">Consumable</option>
              <option value="FinishedGood">Finished Good</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
            <select {...register('category')} className={inputClass}>
              {STOCK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Unit of Measure *</label>
          <select {...register('unitOfMeasure')} className={inputClass}>
            <option value="KG">KG</option>
            <option value="Sheets">Sheets</option>
            <option value="Rolls">Rolls</option>
            <option value="Drums">Drums</option>
            <option value="Coils">Coils</option>
            <option value="Bundles">Bundles</option>
            <option value="PCS">PCS</option>
          </select>
        </div>
      </div>

      {/* Specifications */}
      <div className="space-y-4 pt-2">
        <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Specifications</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">GSM</label>
            <input {...register('specifications.gsm')} placeholder="e.g. 250" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Dimensions / Size</label>
            <input {...register('specifications.dimensions')} placeholder="e.g. 28x40 inch" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Inventory Settings */}
      <div className="space-y-4 pt-2">
        <h4 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2">Inventory Settings</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Initial Stock *</label>
            <input {...register('initialStock')} type="number" step="0.01" className={inputClass} />
            {errors.initialStock && <p className="mt-1 text-xs text-red-500">{errors.initialStock.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Reorder Level *</label>
            <input {...register('reorderLevel')} type="number" step="0.01" className={inputClass} />
            {errors.reorderLevel && <p className="mt-1 text-xs text-red-500">{errors.reorderLevel.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Warehouse Location</label>
          <input {...register('warehouseLocation')} placeholder="e.g. Zone A - Rack 3" className={inputClass} />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating Item...' : 'Create Item Master'}
        </button>
      </div>
    </form>
  );
}
