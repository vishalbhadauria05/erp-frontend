import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { STOCK_CATEGORIES } from '../../../mocks/inventory';
import { useInventory } from '../hooks/useInventory';
import { AlertTriangle } from 'lucide-react';
import { getItems } from '../../../services/api/items';
import type { Item } from '../../items/types';

const schema = z.object({
  itemCode: z.string().min(2, 'Item Code is required'),
  brand: z.string().min(1, 'Brand is required'),
  itemName: z.string().min(2, 'Item Name is required'),
  type: z.enum(['Duplex', 'Reel', 'PrintedPaper', 'FinishedGood', 'Consumable', 'RawMaterial']),
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
  error?: string;
}

export function AddNewItemForm({ onSubmit, isSubmitting, defaultCategory, error }: AddNewItemFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      itemCode: '',
      brand: '',
      itemName: '',
      type: 'Duplex',
      category: defaultCategory === 'All' ? STOCK_CATEGORIES[0] : defaultCategory,
      unitOfMeasure: 'KG',
      specifications: {
        gsm: '',
        dimensions: '',
      },
      initialStock: '0',
      reorderLevel: '0'
    }
  });

  const [items, setItems] = useState<Item[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedMasterItem, setSelectedMasterItem] = useState<Item | null>(null);
  const [kraftReelInventoryId, setKraftReelInventoryId] = useState('');
  const [kraftReelQty, setKraftReelQty] = useState('');
  const [semiKraftReelInventoryId, setSemiKraftReelInventoryId] = useState('');
  const [semiKraftReelQty, setSemiKraftReelQty] = useState('');

  const category = watch('category');
  const gsm = watch('specifications.gsm');
  const dimensions = watch('specifications.dimensions');

  const isCorrugatedRolls = category === 'Corrugated Rolls';

  const { data: kraftData } = useInventory(isCorrugatedRolls ? 'Reels Kraft' : '');
  const { data: semiKraftData } = useInventory(isCorrugatedRolls ? 'Reels Semi Kraft' : '');

  const kraftItems = kraftData?.data || [];
  const semiKraftItems = semiKraftData?.data || [];

  const selectedKraft = kraftItems.find((i: any) => i._id === kraftReelInventoryId);
  const selectedSemiKraft = semiKraftItems.find((i: any) => i._id === semiKraftReelInventoryId);

  useEffect(() => {
    getItems().then(res => setItems(res.data || [])).catch(() => {});
  }, []);

  const itemBrands = Array.from(
    new Set(items.map((item) => item.brand?.trim()).filter((brand): brand is string => Boolean(brand)))
  ).sort((a, b) => a.localeCompare(b));

  const filteredItems = selectedBrand
    ? items.filter((item) => item.brand?.trim() === selectedBrand)
    : [];

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedMasterItem(null);
    setValue('brand', brand, { shouldValidate: true });
    setValue('itemName', '', { shouldValidate: true });
  };

  const handleItemSelect = (itemId: string) => {
    const item = items.find((candidate) => candidate._id === itemId);
    if (!item) {
      setSelectedMasterItem(null);
      setValue('itemName', '', { shouldValidate: true });
      return;
    }

    const specs = item.itemSpecification || item.specifications || {};

    setSelectedMasterItem(item);
    setValue('brand', item.brand || selectedBrand, { shouldValidate: true });
    // itemCode is derived from category + GSM + dimensions by the effect below,
    // so a variant of an existing item gets its own code instead of colliding.
    setValue('itemName', item.itemName, { shouldValidate: true });
    setValue('type', item.type, { shouldValidate: true });
    setValue('category', item.category, { shouldValidate: true });
    setValue('unitOfMeasure', item.unitOfMeasure, { shouldValidate: true });
    setValue('specifications.gsm', specs.gsm ? String(specs.gsm) : '', { shouldValidate: true });
    setValue('specifications.dimensions', specs.dimensions || '', { shouldValidate: true });
  };

  useEffect(() => {
    if (!category) return;
    const initials = category.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 3);

    let suffix = '';
    if (gsm && gsm.trim() !== '') {
      suffix = `-${gsm.trim()}`;
    } else if (dimensions && dimensions.trim() !== '') {
      suffix = `-${dimensions.split(' ')[0]}`;
    } else {
      suffix = '-XXX';
    }

    setValue('itemCode', `${initials}${suffix}`, { shouldValidate: true });
  }, [category, gsm, dimensions, setValue]);

  useEffect(() => {
    if (!isCorrugatedRolls) {
      setKraftReelInventoryId('');
      setKraftReelQty('');
      setSemiKraftReelInventoryId('');
      setSemiKraftReelQty('');
    }
  }, [isCorrugatedRolls]);

  const onValidSubmit = (data: FormValues) => {
    const payload: any = { ...data };

    if (isCorrugatedRolls) {
      if (kraftReelInventoryId && Number(kraftReelQty) > 0) {
        payload.kraftReelInventoryId = kraftReelInventoryId;
        payload.kraftReelQty = kraftReelQty;
      }
      if (semiKraftReelInventoryId && Number(semiKraftReelQty) > 0) {
        payload.semiKraftReelInventoryId = semiKraftReelInventoryId;
        payload.semiKraftReelQty = semiKraftReelQty;
      }
    }

    onSubmit(payload);
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-neutral-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner';

  return (
    <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-5 p-1 pb-10">

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-neutral-800 pb-2">Basic Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Item Brand *</label>
            <select
              value={selectedBrand}
              onChange={(e) => handleBrandSelect(e.target.value)}
              className={inputClass}
            >
              <option value="">— Select Brand —</option>
              {itemBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            <input type="hidden" {...register('brand')} />
            {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Item Name *</label>
            <select
              value={selectedMasterItem?._id ?? ''}
              onChange={(e) => handleItemSelect(e.target.value)}
              disabled={!selectedBrand}
              className={inputClass}
            >
              <option value="">
                {selectedBrand ? '— Select Item —' : '— Select brand first —'}
              </option>
              {filteredItems.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.itemName} ({item.itemCode})
                </option>
              ))}
            </select>
            <input type="hidden" {...register('itemName')} />
            {errors.itemName && <p className="mt-1 text-xs text-red-500">{errors.itemName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Item Code (Auto-Generated) *</label>
            <input
              {...register('itemCode')}
              readOnly
              className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 font-mono focus:outline-none cursor-not-allowed"
            />
            {errors.itemCode && <p className="mt-1 text-xs text-red-500">{errors.itemCode.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
            <select {...register('type')} className={inputClass}>
              <option value="Duplex">Duplex</option>
              <option value="Reel">Reel</option>
              <option value="PrintedPaper">Printed Paper</option>
              <option value="FinishedGood">Finished Good</option>
              <option value="Consumable">Consumable</option>
              <option value="RawMaterial">Raw Material</option>
            </select>
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
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Unit of Measure *</label>
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
      </div>

      {isCorrugatedRolls && (
        <div className="space-y-4 pt-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-amber-300 dark:border-amber-700 pb-2 flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle size={12} className="text-amber-600" />
            </span>
            Reel Consumption
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Select the kraft and semi kraft reels to consume. Stock will be auto-deducted.
          </p>

          {/* Kraft Reel */}
          <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800 space-y-3">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Kraft Reel</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Select Kraft Reel</label>
              <select
                value={kraftReelInventoryId}
                onChange={(e) => setKraftReelInventoryId(e.target.value)}
                className={inputClass}
              >
                <option value="">— None (skip) —</option>
                {kraftItems.map((item: any) => {
                  const name = item.itemRef?.itemName || 'Unknown';
                  return (
                    <option key={item._id} value={item._id}>
                      {name} — Stock: {item.currentStock}
                    </option>
                  );
                })}
              </select>
              {selectedKraft && (
                <p className="text-xs text-gray-400 mt-1">Available: <span className="font-medium text-emerald-600">{selectedKraft.currentStock}</span></p>
              )}
            </div>
            {kraftReelInventoryId && (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Quantity to consume</label>
                <input
                  type="number"
                  min="0"
                  value={kraftReelQty}
                  onChange={(e) => setKraftReelQty(e.target.value)}
                  placeholder="e.g. 500"
                  className={inputClass}
                />
                {Number(kraftReelQty) > (selectedKraft?.currentStock || 0) && Number(kraftReelQty) > 0 && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Exceeds available stock ({selectedKraft?.currentStock})
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Semi Kraft Reel */}
          <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-800 space-y-3">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Semi Kraft Reel</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Select Semi Kraft Reel</label>
              <select
                value={semiKraftReelInventoryId}
                onChange={(e) => setSemiKraftReelInventoryId(e.target.value)}
                className={inputClass}
              >
                <option value="">— None (skip) —</option>
                {semiKraftItems.map((item: any) => {
                  const name = item.itemRef?.itemName || 'Unknown';
                  return (
                    <option key={item._id} value={item._id}>
                      {name} — Stock: {item.currentStock}
                    </option>
                  );
                })}
              </select>
              {selectedSemiKraft && (
                <p className="text-xs text-gray-400 mt-1">Available: <span className="font-medium text-emerald-600">{selectedSemiKraft.currentStock}</span></p>
              )}
            </div>
            {semiKraftReelInventoryId && (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Quantity to consume</label>
                <input
                  type="number"
                  min="0"
                  value={semiKraftReelQty}
                  onChange={(e) => setSemiKraftReelQty(e.target.value)}
                  placeholder="e.g. 300"
                  className={inputClass}
                />
                {Number(semiKraftReelQty) > (selectedSemiKraft?.currentStock || 0) && Number(semiKraftReelQty) > 0 && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Exceeds available stock ({selectedSemiKraft?.currentStock})
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Specifications */}
      <div className="space-y-4 pt-2">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-neutral-800 pb-2">Specifications</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">GSM</label>
            <input {...register('specifications.gsm')} placeholder="e.g. 250" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Dimensions / Size</label>
            <input {...register('specifications.dimensions')} placeholder="e.g. 28x40 inch" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Inventory Settings */}
      <div className="space-y-4 pt-2">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-neutral-800 pb-2">Inventory Settings</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Stock *</label>
            <input {...register('initialStock')} type="number" min="0" step="0.01" className={inputClass} />
            {errors.initialStock && <p className="mt-1 text-xs text-red-500">{errors.initialStock.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Reorder Level *</label>
            <input {...register('reorderLevel')} type="number" min="0" step="0.01" className={inputClass} />
            {errors.reorderLevel && <p className="mt-1 text-xs text-red-500">{errors.reorderLevel.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Warehouse Location</label>
          <input {...register('warehouseLocation')} placeholder="e.g. Zone A - Rack 3" className={inputClass} />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-neutral-800">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating Item...' : isCorrugatedRolls ? 'Create Item & Deduct Reels' : 'Create Item Master'}
        </button>
      </div>
    </form>
  );
}
