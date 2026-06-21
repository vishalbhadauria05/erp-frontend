import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { STOCK_CATEGORIES } from '../../../mocks/items';
import type { ItemFormData, Item } from '../types';
import { useEffect } from 'react';

const schema = z.object({
  itemName: z.string().min(2, 'Item Name is required'),
  brand: z.string().optional(),
  type: z.enum(['Duplex', 'Reel', 'PrintedPaper', 'FinishedGood', 'Consumable', 'RawMaterial']),
  category: z.string().min(1, 'Category is required'),
  unitOfMeasure: z.string().min(1, 'Unit is required'),
  itemSpecification: z.object({
    gsm: z.string().optional(),
    dimensions: z.string().optional()
  }).optional(),
  boxSpecification: z.object({
    boxType: z.string().optional(),
    boxesPerSheet: z.string().optional(),
    itemSerialNumber: z.string().optional(),
    dieSerialNumber: z.string().optional(),
    length: z.string().optional(),
    breadth: z.string().optional(),
    height: z.string().optional(),
    sheetLength: z.string().optional(),
    sheetBreadth: z.string().optional(),
  }).optional()
});

type FormValues = z.infer<typeof schema>;

interface ItemFormProps {
  initialData?: Item;
  onSubmit: (data: ItemFormData) => void;
  isSubmitting: boolean;
}

export function ItemForm({ initialData, onSubmit, isSubmitting }: ItemFormProps) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? {
      itemName: initialData.itemName,
      brand: initialData.brand || '',
      type: initialData.type,
      category: initialData.category,
      unitOfMeasure: initialData.unitOfMeasure,
      itemSpecification: initialData.itemSpecification || initialData.specifications || {},
      boxSpecification: {
        boxType: initialData.boxSpecification?.boxType || '',
        boxesPerSheet: String(initialData.boxSpecification?.boxesPerSheet || '1'),
        itemSerialNumber: initialData.boxSpecification?.itemSerialNumber || '',
        dieSerialNumber: initialData.boxSpecification?.dieSerialNumber || '',
        length: String(initialData.boxSpecification?.length || ''),
        breadth: String(initialData.boxSpecification?.breadth || ''),
        height: String(initialData.boxSpecification?.height || ''),
        sheetLength: String(initialData.boxSpecification?.sheetLength || ''),
        sheetBreadth: String(initialData.boxSpecification?.sheetBreadth || ''),
      },
    } : {
      type: 'FinishedGood',
      category: STOCK_CATEGORIES[0],
      unitOfMeasure: 'PCS',
      boxSpecification: {
        boxesPerSheet: '1',
      }
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        itemName: initialData.itemName,
        brand: initialData.brand || '',
        type: initialData.type,
        category: initialData.category,
        unitOfMeasure: initialData.unitOfMeasure,
        itemSpecification: initialData.itemSpecification || initialData.specifications || {},
        boxSpecification: {
          boxType: initialData.boxSpecification?.boxType || '',
          boxesPerSheet: String(initialData.boxSpecification?.boxesPerSheet || '1'),
          itemSerialNumber: initialData.boxSpecification?.itemSerialNumber || '',
          dieSerialNumber: initialData.boxSpecification?.dieSerialNumber || '',
          length: String(initialData.boxSpecification?.length || ''),
          breadth: String(initialData.boxSpecification?.breadth || ''),
          height: String(initialData.boxSpecification?.height || ''),
          sheetLength: String(initialData.boxSpecification?.sheetLength || ''),
          sheetBreadth: String(initialData.boxSpecification?.sheetBreadth || ''),
        },
      });
    }
  }, [initialData, reset]);

  const category = watch('category');
  const isFinishedGood = category === 'Finished Boxes';

  const onFormSubmit = (data: FormValues) => {
    const payload: any = { ...data };
    // Convert numeric strings in boxSpecification to numbers
    if (payload.boxSpecification) {
      const bs = payload.boxSpecification;
      payload.boxSpecification = {
        boxType: bs.boxType || '',
        boxesPerSheet: Number(bs.boxesPerSheet) || 1,
        itemSerialNumber: bs.itemSerialNumber || '',
        dieSerialNumber: bs.dieSerialNumber || '',
        length: Number(bs.length) || 0,
        breadth: Number(bs.breadth) || 0,
        height: Number(bs.height) || 0,
        sheetLength: Number(bs.sheetLength) || 0,
        sheetBreadth: Number(bs.sheetBreadth) || 0,
      };
    }
    onSubmit(payload as ItemFormData);
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner';

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 p-1 pb-10">
      
      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-neutral-800 pb-2">Basic Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name *</label>
            <input {...register('itemName')} placeholder="e.g. Pizza Box 12 Inch" className={inputClass} />
            {errors.itemName && <p className="mt-1 text-xs text-red-500">{errors.itemName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
            <input {...register('brand')} placeholder="e.g. ITC, Agarwal Paper" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
            <select {...register('category')} className={inputClass}>
              {STOCK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
            <select {...register('type')} className={inputClass}>
              <option value="RawMaterial">Raw Material</option>
              <option value="FinishedGood">Finished Good</option>
              <option value="Consumable">Consumable</option>
              <option value="Duplex">Duplex</option>
              <option value="Reel">Reel</option>
              <option value="PrintedPaper">Printed Paper</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Unit of Measure *</label>
          <select {...register('unitOfMeasure')} className={inputClass}>
            <option value="KG">KG</option>
            <option value="Sheets">Sheets</option>
            <option value="Rolls">Rolls</option>
            <option value="PCS">PCS</option>
            <option value="Bundles">Bundles</option>
          </select>
        </div>
      </div>

      {/* Raw Material Specifications */}
      {!isFinishedGood && (
        <div className="space-y-4 pt-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-neutral-800 pb-2">Material Specifications</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">GSM</label>
              <input {...register('itemSpecification.gsm')} placeholder="e.g. 250" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Dimensions / Size</label>
              <input {...register('itemSpecification.dimensions')} placeholder="e.g. 28x40 inch" className={inputClass} />
            </div>
          </div>
        </div>
      )}

      {/* Box Specifications — same fields as Order Form Section 2 */}
      {isFinishedGood && (
        <div className="space-y-4 pt-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-neutral-800 pb-2">Box Specifications</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Box Type</label>
              <select {...register('boxSpecification.boxType')} className={inputClass}>
                <option value="">Select Type</option>
                <option value="Pizza Type">Pizza Type</option>
                <option value="Flap Type">Flap Type</option>
                <option value="Carton Type">Carton Type</option>
                <option value="Ghera Patti">Ghera Patti</option>
                <option value="Z Patti">Z Patti</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Boxes Per Sheet</label>
              <select {...register('boxSpecification.boxesPerSheet')} className={inputClass}>
                <option value="0.5">0.5</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Item Serial No.</label>
              <input {...register('boxSpecification.itemSerialNumber')} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Die Serial No.</label>
              <input {...register('boxSpecification.dieSerialNumber')} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Length (in)</label>
              <input {...register('boxSpecification.length')} type="number" min="0" step="0.1" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Breadth (in)</label>
              <input {...register('boxSpecification.breadth')} type="number" min="0" step="0.1" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Height (in)</label>
              <input {...register('boxSpecification.height')} type="number" min="0" step="0.1" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sheet Length</label>
              <input {...register('boxSpecification.sheetLength')} type="number" min="0" step="0.1" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sheet Breadth</label>
              <input {...register('boxSpecification.sheetBreadth')} type="number" min="0" step="0.1" className={inputClass} />
            </div>
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-gray-200 dark:border-neutral-800">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? (initialData ? 'Updating Item...' : 'Creating Item...') : (initialData ? 'Update Item' : 'Create Item')}
        </button>
      </div>
    </form>
  );
}
