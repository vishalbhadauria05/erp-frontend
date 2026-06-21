import { type ReactNode, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { OrderFormData } from '../types';
import { Calculator } from 'lucide-react';
import { getItems } from '../../../services/api/items';
import type { Item } from '../../items/types';

const schema = z.object({
  orderNumber: z.string().min(3, 'Order number must be at least 3 characters'),
  customerName: z.string().min(2, 'Customer name is required'),
  itemBrand: z.string().min(1, 'Item brand is required'),
  itemName: z.string().min(2, 'Item name is required'),
  quantityOrdered: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0 && Number.isInteger(Number(val)), 'Valid whole number > 0 required'),
  printed: z.boolean(),
  laminated: z.boolean(),
  boxesPerSheet: z.string().optional(),
  duplexLength: z.string().optional(),
  duplexBreadth: z.string().optional(),
  duplexGsm: z.string().optional(),
  duplexRate: z.string().optional(),
  numberOf2Ply: z.string().optional(),
  twoPlyGsm: z.string().optional(),
  twoPlyRate: z.string().optional(),
  spotUvSize: z.string().optional(),
  spotUvCost: z.string().optional(),
  spotUvSheets: z.string().optional(),
  lamRollSize: z.string().optional(),
  lamSheetLength: z.string().optional(),
  lamType: z.string().optional(),
  fevicolCostPerSheet: z.string().optional(),
  lamCostPerSheet: z.string().optional(),
  sheeterRate: z.string().optional(),
  pastingRate: z.string().optional(),
  dieRate: z.string().optional(),
  stitchingRate: z.string().optional(),
  strappingRate: z.string().optional(),
  printingCost: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<OrderFormData>;
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

export function OrderForm({ onSubmit, isSubmitting, defaultValues }: OrderFormProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedBrand, setSelectedBrand] = useState('');

  useEffect(() => {
    getItems().then(res => setItems(res.data || [])).catch(() => {});
  }, []);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      orderNumber: '',
      customerName: '',
      itemBrand: '',
      itemName: '',
      quantityOrdered: '',
      printed: false,
      laminated: false,
      boxesPerSheet: '1',
      duplexLength: '',
      duplexBreadth: '',
      duplexGsm: '',
      duplexRate: '',
      numberOf2Ply: '0',
      twoPlyGsm: '',
      twoPlyRate: '',
      spotUvSize: '',
      spotUvCost: '',
      spotUvSheets: '',
      lamRollSize: '',
      lamSheetLength: '',
      lamType: 'BOPP',
      fevicolCostPerSheet: '',
      lamCostPerSheet: '',
      sheeterRate: '',
      pastingRate: '',
      dieRate: '',
      stitchingRate: '',
      strappingRate: '',
      printingCost: '',
      ...defaultValues,
    },
  });

  const itemBrands = Array.from(
    new Set(items.map((item) => item.brand?.trim()).filter((brand): brand is string => Boolean(brand)))
  ).sort((a, b) => a.localeCompare(b));

  const filteredItems = selectedBrand
    ? items.filter((item) => item.brand?.trim() === selectedBrand)
    : [];

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedItem(null);
    setValue('itemBrand', brand, { shouldValidate: true });
    setValue('itemName', '', { shouldValidate: true });
    setValue('boxesPerSheet', '1');
  };

  // When an item is selected, auto-populate box specs
  const handleItemSelect = (itemId: string) => {
    const item = items.find(i => i._id === itemId);
    if (!item) {
      setSelectedItem(null);
      setValue('itemName', '', { shouldValidate: true });
      return;
    }
    setSelectedItem(item);
    setValue('itemBrand', item.brand || selectedBrand, { shouldValidate: true });
    setValue('itemName', item.itemName, { shouldValidate: true });

    const bs = item.boxSpecification;
    if (bs) {
      setValue('boxesPerSheet', String(bs.boxesPerSheet || 1));
    }
  };

  const onValidSubmit = (values: FormValues) => {
    // Attach box spec info from selected item
    const payload: any = { ...values };
    if (selectedItem?.boxSpecification) {
      payload.boxType = selectedItem.boxSpecification.boxType || '';
      payload.itemSerialNumber = selectedItem.boxSpecification.itemSerialNumber || '';
      payload.dieSerialNumber = selectedItem.boxSpecification.dieSerialNumber || '';
      payload.length = String(selectedItem.boxSpecification.length || '');
      payload.breadth = String(selectedItem.boxSpecification.breadth || '');
      payload.height = String(selectedItem.boxSpecification.height || '');
      payload.sheetLength = String(selectedItem.boxSpecification.sheetLength || '');
      payload.sheetBreadth = String(selectedItem.boxSpecification.sheetBreadth || '');
    }
    onSubmit(payload as unknown as OrderFormData);
  };

  const parseNum = (val: string | undefined) => parseFloat(val || '0');
  
  const qty = parseNum(watch('quantityOrdered'));
  const boxesPerSheet = parseNum(watch('boxesPerSheet')) || 1;
  const isPrinted = watch('printed');
  const isLaminated = watch('laminated');
  const num2Ply = parseNum(watch('numberOf2Ply'));

  const dL = parseNum(watch('duplexLength'));
  const dB = parseNum(watch('duplexBreadth'));
  const dGsm = parseNum(watch('duplexGsm'));
  const dRate = parseNum(watch('duplexRate'));
  
  const duplexWeightKg = (dL * dB) / 1550 * (dGsm / 1000);
  const duplexQtyReq = qty / boxesPerSheet;
  const duplexTotalWeight = duplexWeightKg * duplexQtyReq;
  const duplexTotalCost = duplexTotalWeight * dRate;

  const pGsm = parseNum(watch('twoPlyGsm'));
  const pRate = parseNum(watch('twoPlyRate'));
  const twoPlyWeightKg = (dL * dB) / 1550 * (pGsm / 1000);
  const twoPlyTotalWeight = twoPlyWeightKg * duplexQtyReq * num2Ply;
  const twoPlyTotalCost = twoPlyTotalWeight * pRate;

  const spotSheets = parseNum(watch('spotUvSheets'));
  const spotCostPer = parseNum(watch('spotUvCost'));
  const spotUvTotalCost = spotSheets * spotCostPer;

  const lamCostPerSht = parseNum(watch('lamCostPerSheet'));
  const fevicolCost = parseNum(watch('fevicolCostPerSheet'));
  const laminationTotalCost = isLaminated ? (lamCostPerSht + fevicolCost) * duplexQtyReq : 0;

  const printingCost = isPrinted ? parseNum(watch('printingCost')) || 0 : 0;

  const sheeterCost = parseNum(watch('sheeterRate')) * num2Ply;
  const pastingCost = parseNum(watch('pastingRate')) * duplexQtyReq;
  const dieCost = parseNum(watch('dieRate')) * duplexQtyReq;
  const stitchingCost = parseNum(watch('stitchingRate')) * qty;
  const strappingCost = parseNum(watch('strappingRate')) * (qty / 50);

  const processingTotal = sheeterCost + pastingCost + dieCost + stitchingCost + strappingCost;

  const totalCostOverall = duplexTotalCost + twoPlyTotalCost + spotUvTotalCost + laminationTotalCost + printingCost + processingTotal;
  const perBoxCost = qty > 0 ? totalCostOverall / qty : 0;

  const sectionClass = "bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm";
  const sectionTitleClass = "text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide flex items-center mb-4 pb-2 border-b border-gray-100 dark:border-neutral-800";

  return (
    <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-6 bg-gray-50 dark:bg-black p-2 rounded-xl">
      
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>1. Order & Party Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Order Number *" error={errors.orderNumber?.message}>
            <input {...register('orderNumber')} placeholder="e.g. ORD-1001" className={inputClass} />
          </FormField>
          <FormField label="Customer Name *" error={errors.customerName?.message}>
            <input {...register('customerName')} placeholder="Customer Name" className={inputClass} />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <FormField label="Item Brand *" error={errors.itemBrand?.message}>
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
            <input type="hidden" {...register('itemBrand')} />
          </FormField>
          <FormField label="Item Name *" error={errors.itemName?.message}>
            <select
              value={selectedItem?._id ?? ''}
              onChange={(e) => handleItemSelect(e.target.value)}
              className={inputClass}
              disabled={!selectedBrand}
            >
              <option value="">
                {selectedBrand ? '— Select Item —' : '— Select brand first —'}
              </option>
              {filteredItems.map(item => (
                <option key={item._id} value={item._id}>
                  {item.itemName} ({item.itemCode})
                </option>
              ))}
            </select>
            <input type="hidden" {...register('itemName')} />
          </FormField>
          <FormField label="Quantity Ordered *" error={errors.quantityOrdered?.message}>
            <input {...register('quantityOrdered')} type="number" min="0" placeholder="Qty" className={inputClass} />
          </FormField>
        </div>

        {/* Show selected item's box specs as read-only info */}
        {selectedItem?.boxSpecification && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-400 uppercase tracking-wider mb-2">Box Specs (from Item Master)</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 text-xs text-gray-700 dark:text-gray-300">
              {selectedItem.boxSpecification.boxType && (
                <div><span className="text-gray-500 dark:text-gray-400">Type:</span> <strong>{selectedItem.boxSpecification.boxType}</strong></div>
              )}
              {selectedItem.boxSpecification.length ? (
                <div><span className="text-gray-500 dark:text-gray-400">L×B×H:</span> <strong>{selectedItem.boxSpecification.length}×{selectedItem.boxSpecification.breadth}×{selectedItem.boxSpecification.height}</strong></div>
              ) : null}
              {selectedItem.boxSpecification.sheetLength ? (
                <div><span className="text-gray-500 dark:text-gray-400">Sheet:</span> <strong>{selectedItem.boxSpecification.sheetLength}×{selectedItem.boxSpecification.sheetBreadth}</strong></div>
              ) : null}
              {selectedItem.boxSpecification.boxesPerSheet ? (
                <div><span className="text-gray-500 dark:text-gray-400">Box/Sheet:</span> <strong>{selectedItem.boxSpecification.boxesPerSheet}</strong></div>
              ) : null}
              {selectedItem.boxSpecification.itemSerialNumber && (
                <div><span className="text-gray-500 dark:text-gray-400">Item S/N:</span> <strong>{selectedItem.boxSpecification.itemSerialNumber}</strong></div>
              )}
              {selectedItem.boxSpecification.dieSerialNumber && (
                <div><span className="text-gray-500 dark:text-gray-400">Die S/N:</span> <strong>{selectedItem.boxSpecification.dieSerialNumber}</strong></div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>2. Duplex / Paper Board Cost</h3>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <FormField label="Length (in)" error={errors.duplexLength?.message}>
            <input {...register('duplexLength')} type="number" step="any" min="0" className={inputClass} />
          </FormField>
          <FormField label="Breadth (in)" error={errors.duplexBreadth?.message}>
            <input {...register('duplexBreadth')} type="number" step="any" min="0" className={inputClass} />
          </FormField>
          <FormField label="GSM" error={errors.duplexGsm?.message}>
            <input {...register('duplexGsm')} type="number" min="0" className={inputClass} />
          </FormField>
          <FormField label="Rate (₹/kg)" error={errors.duplexRate?.message}>
            <input {...register('duplexRate')} type="number" step="any" min="0" className={inputClass} />
          </FormField>
        </div>
        <div className="bg-blue-50 dark:bg-black text-blue-800 dark:text-gray-200 p-3 rounded-lg text-xs flex justify-between items-center border border-transparent dark:border-neutral-800">
          <span>Area: <strong>{dL * dB} sq in</strong></span>
          <span>Weight/Sheet: <strong>{duplexWeightKg > 0 ? duplexWeightKg.toFixed(3) : 0} kg</strong></span>
          <span>Qty Req: <strong>{duplexQtyReq > 0 ? duplexQtyReq : 0} sheets</strong></span>
          <span>Duplex Cost: <strong>₹{duplexTotalCost.toFixed(2)}</strong></span>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>3. 2-Ply Cost</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <FormField label="No. of 2-Ply" error={errors.numberOf2Ply?.message}>
            <select {...register('numberOf2Ply')} className={inputClass}>
              <option value="0">None</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </FormField>
          <FormField label="GSM of Each Ply" error={errors.twoPlyGsm?.message}>
            <input {...register('twoPlyGsm')} type="number" min="0" className={inputClass} />
          </FormField>
          <FormField label="Rate of Roll (₹)" error={errors.twoPlyRate?.message}>
            <input {...register('twoPlyRate')} type="number" step="any" min="0" className={inputClass} />
          </FormField>
        </div>
        {num2Ply > 0 && (
          <div className="bg-blue-50 dark:bg-black text-blue-800 dark:text-gray-200 border border-transparent dark:border-neutral-800 p-3 rounded-lg text-xs text-right">
            2-Ply Total Cost: <strong>₹{twoPlyTotalCost.toFixed(2)}</strong>
          </div>
        )}
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>4. Finishing & Spot UV</h3>
        <div className="flex gap-6 mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
            <input type="checkbox" {...register('printed')} className="rounded w-4 h-4 text-blue-600" /> Printed
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
            <input type="checkbox" {...register('laminated')} className="rounded w-4 h-4 text-blue-600" /> Laminated
          </label>
        </div>

        {isLaminated && (
          <div className="grid grid-cols-5 gap-3 mb-6 p-4 bg-gray-50 dark:bg-black border border-gray-100 dark:border-neutral-800 rounded-lg">
            <FormField label="Roll Size (in)"><input {...register('lamRollSize')} type="number" step="any" min="0" className={inputClass} /></FormField>
            <FormField label="Sheet Len (in)"><input {...register('lamSheetLength')} type="number" step="any" min="0" className={inputClass} /></FormField>
            <FormField label="Type">
              <select {...register('lamType')} className={inputClass}>
                <option value="BOPP">BOPP</option>
                <option value="MAT">MAT</option>
              </select>
            </FormField>
            <FormField label="Fevicol/Sht (₹)"><input {...register('fevicolCostPerSheet')} type="number" step="any" min="0" className={inputClass} /></FormField>
            <FormField label="Cost/Sht (₹)"><input {...register('lamCostPerSheet')} type="number" step="any" min="0" className={inputClass} /></FormField>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Spot UV Size (sq in)"><input {...register('spotUvSize')} type="number" step="any" min="0" className={inputClass} /></FormField>
          <FormField label="Spot UV Sheets"><input {...register('spotUvSheets')} type="number" min="0" className={inputClass} /></FormField>
          <FormField label="Cost/Sheet (₹)"><input {...register('spotUvCost')} type="number" step="any" min="0" className={inputClass} /></FormField>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>5. Processing Costs</h3>
        <div className="grid grid-cols-5 gap-3">
          <FormField label="Sheeter (₹/2Ply)"><input {...register('sheeterRate')} type="number" step="any" min="0" className={inputClass} /></FormField>
          <FormField label="Pasting (₹/Sht)"><input {...register('pastingRate')} type="number" step="any" min="0" className={inputClass} /></FormField>
          <FormField label="Die (₹/Sht)"><input {...register('dieRate')} type="number" step="any" min="0" className={inputClass} /></FormField>
          <FormField label="Stitch (₹/Box)"><input {...register('stitchingRate')} type="number" step="any" min="0" className={inputClass} /></FormField>
          <FormField label="Strap (₹/Bndl)"><input {...register('strappingRate')} type="number" step="any" min="0" className={inputClass} /></FormField>
        </div>
        <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-2">
          Total Processing: <strong className="text-gray-900 dark:text-gray-100">₹{processingTotal.toFixed(2)}</strong>
        </div>
      </div>

      <div className="bg-blue-50/50 dark:bg-gray-800/50 rounded-xl p-6 border border-blue-100 dark:border-neutral-800">
        <div className="flex items-center gap-3 mb-4 border-b border-blue-200 dark:border-neutral-800 pb-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
            <Calculator className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Tentative Cost Summary</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 mb-6">
          <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Duplex Cost:</span> <span className="text-gray-900 dark:text-gray-100 font-medium">₹ {duplexTotalCost.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Lamination Cost:</span> <span className="text-gray-900 dark:text-gray-100 font-medium">₹ {laminationTotalCost.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">2-Ply Cost:</span> <span className="text-gray-900 dark:text-gray-100 font-medium">₹ {twoPlyTotalCost.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Processing Cost:</span> <span className="text-gray-900 dark:text-gray-100 font-medium">₹ {processingTotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Spot UV Cost:</span> <span className="text-gray-900 dark:text-gray-100 font-medium">₹ {spotUvTotalCost.toFixed(2)}</span></div>
        </div>

        <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 flex justify-between items-center border border-blue-100 dark:border-neutral-800 shadow-sm">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 font-medium">Per Box Cost</div>
            <div className="text-3xl font-bold text-green-600">₹ {perBoxCost.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 font-medium">Total Order Cost</div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">₹ {totalCostOverall.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
        >
          {isSubmitting ? 'Saving Order...' : 'Create Order & Save Data'}
        </button>
      </div>
    </form>
  );
}
