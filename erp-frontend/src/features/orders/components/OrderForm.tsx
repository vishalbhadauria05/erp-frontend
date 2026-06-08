import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { OrderFormData } from '../types';
import { Calculator } from 'lucide-react';

const isPositiveNumber = (val: string) => !val || (!isNaN(Number(val)) && Number(val) > 0);

const schema = z.object({
  orderNumber: z.string().min(3, 'Order number must be at least 3 characters'),
  customerName: z.string().min(2, 'Customer name is required'),
  itemName: z.string().min(2, 'Item name is required'),
  itemSerialNumber: z.string().optional(),
  dieSerialNumber: z.string().optional(),
  quantityOrdered: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0 && Number.isInteger(Number(val)), 'Valid whole number > 0 required'),
  boxType: z.string().min(1, 'Please select a Box Type'),
  printed: z.boolean(),
  laminated: z.boolean(),
  length: z.string().refine(isPositiveNumber, 'Must be > 0'),
  breadth: z.string().refine(isPositiveNumber, 'Must be > 0'),
  height: z.string().refine(isPositiveNumber, 'Must be > 0'),
  sheetLength: z.string().refine(isPositiveNumber, 'Must be > 0'),
  sheetBreadth: z.string().refine(isPositiveNumber, 'Must be > 0'),
  ply: z.string().optional(),
  gsm: z.string().optional(),
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
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

export function OrderForm({ onSubmit, isSubmitting, defaultValues }: OrderFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      orderNumber: '',
      customerName: '',
      itemName: '',
      itemSerialNumber: '',
      dieSerialNumber: '',
      quantityOrdered: '',
      boxType: '',
      printed: false,
      laminated: false,
      length: '',
      breadth: '',
      height: '',
      sheetLength: '',
      sheetBreadth: '',
      ply: '',
      gsm: '',
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

  const onValidSubmit = (values: FormValues) => {
    const backendData = { ...values } as Partial<FormValues>;
    delete backendData.boxesPerSheet;
    delete backendData.duplexLength;
    delete backendData.duplexBreadth;
    delete backendData.duplexGsm;
    delete backendData.duplexRate;
    delete backendData.numberOf2Ply;
    delete backendData.twoPlyGsm;
    delete backendData.twoPlyRate;
    delete backendData.spotUvSize;
    delete backendData.spotUvCost;
    delete backendData.spotUvSheets;
    delete backendData.lamRollSize;
    delete backendData.lamSheetLength;
    delete backendData.lamType;
    delete backendData.fevicolCostPerSheet;
    delete backendData.lamCostPerSheet;
    delete backendData.sheeterRate;
    delete backendData.pastingRate;
    delete backendData.dieRate;
    delete backendData.stitchingRate;
    delete backendData.strappingRate;
    delete backendData.printingCost;
    
    onSubmit(backendData as unknown as OrderFormData);
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

  const sectionClass = "bg-white p-5 rounded-xl border border-gray-200 shadow-sm";
  const sectionTitleClass = "text-sm font-semibold text-gray-800 uppercase tracking-wide flex items-center mb-4 pb-2 border-b border-gray-100";

  return (
    <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-6 bg-gray-50/50 p-2 rounded-xl">
      
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>1. Order & Party Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Order Number *" error={errors.orderNumber?.message}>
            <input {...register('orderNumber')} placeholder="e.g. ORD-1001" className={inputClass} />
          </FormField>
          <FormField label="Customer Name *" error={errors.customerName?.message}>
            <input {...register('customerName')} placeholder="Customer Name" className={inputClass} />
          </FormField>
          <FormField label="Item Name *" error={errors.itemName?.message}>
            <input {...register('itemName')} placeholder="Item Description" className={inputClass} />
          </FormField>
          <FormField label="Quantity Ordered *" error={errors.quantityOrdered?.message}>
            <input {...register('quantityOrdered')} type="number" placeholder="Qty" className={inputClass} />
          </FormField>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>2. Box Specifications</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <FormField label="Box Type *" error={errors.boxType?.message}>
            <select {...register('boxType')} className={inputClass}>
              <option value="">Select Type</option>
              <option value="Pizza Type">Pizza Type</option>
              <option value="Flap Type">Flap Type</option>
              <option value="Carton Type">Carton Type</option>
              <option value="Ghera Patti">Ghera Patti</option>
              <option value="Z Patti">Z Patti</option>
            </select>
          </FormField>
          <FormField label="Boxes Per Sheet" error={errors.boxesPerSheet?.message}>
            <select {...register('boxesPerSheet')} className={inputClass}>
              <option value="0.5">0.5</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
          </FormField>
          <FormField label="Item Serial No." error={errors.itemSerialNumber?.message}>
            <input {...register('itemSerialNumber')} className={inputClass} />
          </FormField>
          <FormField label="Die Serial No." error={errors.dieSerialNumber?.message}>
            <input {...register('dieSerialNumber')} className={inputClass} />
          </FormField>
        </div>
        <div className="grid grid-cols-5 gap-3">
          <FormField label="Length (in)" error={errors.length?.message}>
            <input {...register('length')} type="number" step="0.1" className={inputClass} />
          </FormField>
          <FormField label="Breadth (in)" error={errors.breadth?.message}>
            <input {...register('breadth')} type="number" step="0.1" className={inputClass} />
          </FormField>
          <FormField label="Height (in)" error={errors.height?.message}>
            <input {...register('height')} type="number" step="0.1" className={inputClass} />
          </FormField>
          <FormField label="Sheet Length" error={errors.sheetLength?.message}>
            <input {...register('sheetLength')} type="number" step="0.1" className={inputClass} />
          </FormField>
          <FormField label="Sheet Breadth" error={errors.sheetBreadth?.message}>
            <input {...register('sheetBreadth')} type="number" step="0.1" className={inputClass} />
          </FormField>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>3. Duplex / Paper Board Cost</h3>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <FormField label="Length" error={errors.duplexLength?.message}>
            <input {...register('duplexLength')} type="number" step="0.1" className={inputClass} />
          </FormField>
          <FormField label="Breadth" error={errors.duplexBreadth?.message}>
            <input {...register('duplexBreadth')} type="number" step="0.1" className={inputClass} />
          </FormField>
          <FormField label="GSM" error={errors.duplexGsm?.message}>
            <input {...register('duplexGsm')} type="number" className={inputClass} />
          </FormField>
          <FormField label="Rate" error={errors.duplexRate?.message}>
            <input {...register('duplexRate')} type="number" step="0.1" className={inputClass} />
          </FormField>
        </div>
        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs flex justify-between items-center">
          <span>Area: <strong>{dL * dB} sq in</strong></span>
          <span>Weight/Sheet: <strong>{duplexWeightKg > 0 ? duplexWeightKg.toFixed(3) : 0} kg</strong></span>
          <span>Qty Req: <strong>{duplexQtyReq > 0 ? duplexQtyReq : 0} sheets</strong></span>
          <span>Duplex Cost: <strong>₹{duplexTotalCost.toFixed(2)}</strong></span>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>4. 2-Ply Cost</h3>
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
            <input {...register('twoPlyGsm')} type="number" className={inputClass} />
          </FormField>
          <FormField label="Rate of Roll" error={errors.twoPlyRate?.message}>
            <input {...register('twoPlyRate')} type="number" step="0.1" className={inputClass} />
          </FormField>
        </div>
        {num2Ply > 0 && (
          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs text-right">
            2-Ply Total Cost: <strong>₹{twoPlyTotalCost.toFixed(2)}</strong>
          </div>
        )}
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>5. Finishing & Spot UV</h3>
        <div className="flex gap-6 mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
            <input type="checkbox" {...register('printed')} className="rounded w-4 h-4 text-blue-600" /> Printed
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 font-medium">
            <input type="checkbox" {...register('laminated')} className="rounded w-4 h-4 text-blue-600" /> Laminated
          </label>
        </div>

        {isLaminated && (
          <div className="grid grid-cols-5 gap-3 mb-6 p-4 bg-gray-50 border border-gray-100 rounded-lg">
            <FormField label="Roll Size"><input {...register('lamRollSize')} className={inputClass} /></FormField>
            <FormField label="Sheet Len"><input {...register('lamSheetLength')} className={inputClass} /></FormField>
            <FormField label="Type">
              <select {...register('lamType')} className={inputClass}>
                <option value="BOPP">BOPP</option>
                <option value="MAT">MAT</option>
              </select>
            </FormField>
            <FormField label="Fevicol/Sht"><input {...register('fevicolCostPerSheet')} type="number" step="0.1" className={inputClass} /></FormField>
            <FormField label="Cost/Sht"><input {...register('lamCostPerSheet')} type="number" step="0.1" className={inputClass} /></FormField>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Spot UV Size"><input {...register('spotUvSize')} className={inputClass} /></FormField>
          <FormField label="Spot UV Sheets"><input {...register('spotUvSheets')} type="number" className={inputClass} /></FormField>
          <FormField label="Cost per Sheet"><input {...register('spotUvCost')} type="number" step="0.1" className={inputClass} /></FormField>
        </div>
      </div>

      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>6. Processing Costs</h3>
        <div className="grid grid-cols-5 gap-3">
          <FormField label="Sheeter (Cost/2Ply)"><input {...register('sheeterRate')} type="number" step="0.1" className={inputClass} /></FormField>
          <FormField label="Pasting (Cost/Sht)"><input {...register('pastingRate')} type="number" step="0.1" className={inputClass} /></FormField>
          <FormField label="Die (Cost/Sht)"><input {...register('dieRate')} type="number" step="0.1" className={inputClass} /></FormField>
          <FormField label="Stitch (Cost/Box)"><input {...register('stitchingRate')} type="number" step="0.1" className={inputClass} /></FormField>
          <FormField label="Strap (Cost/Bndl)"><input {...register('strappingRate')} type="number" step="0.1" className={inputClass} /></FormField>
        </div>
        <div className="text-right text-xs text-gray-500 mt-2">
          Total Processing: <strong className="text-gray-900">₹{processingTotal.toFixed(2)}</strong>
        </div>
      </div>

      <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-4 border-b border-blue-200 pb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Calculator className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="text-base font-semibold text-gray-900 uppercase tracking-wider">Tentative Cost Summary</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 mb-6">
          <div className="flex justify-between text-sm"><span className="text-gray-600">Duplex Cost:</span> <span className="text-gray-900 font-medium">₹ {duplexTotalCost.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Lamination Cost:</span> <span className="text-gray-900 font-medium">₹ {laminationTotalCost.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">2-Ply Cost:</span> <span className="text-gray-900 font-medium">₹ {twoPlyTotalCost.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Processing Cost:</span> <span className="text-gray-900 font-medium">₹ {processingTotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-600">Spot UV Cost:</span> <span className="text-gray-900 font-medium">₹ {spotUvTotalCost.toFixed(2)}</span></div>
        </div>

        <div className="bg-white rounded-lg p-4 flex justify-between items-center border border-blue-100 shadow-sm">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Per Box Cost</div>
            <div className="text-3xl font-bold text-green-600">₹ {perBoxCost.toFixed(2)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">Total Order Cost</div>
            <div className="text-xl font-bold text-gray-900">₹ {totalCostOverall.toFixed(2)}</div>
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
