import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CustomerFormData } from '../types';

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const phoneRegex = /^[6-9]\d{9}$/;

const schema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactPerson: z.string(),
  email: z.union([z.string().email('Invalid email address'), z.literal('')]),
  phone: z.union([z.string().regex(phoneRegex, 'Enter valid 10-digit mobile number'), z.literal('')]),
  gstNumber: z.union([z.string().regex(gstinRegex, 'Invalid GSTIN format (e.g. 07ABCDE1234F1Z5)'), z.literal('')]),
  billingAddress: z.string(),
  shippingAddress: z.string(),
  creditLimit: z.coerce.number().min(0, 'Credit limit cannot be negative'),
});

type FormValues = z.infer<typeof schema>;

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<CustomerFormData>;
  mode?: 'create' | 'edit';
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

export function CustomerForm({ onSubmit, isSubmitting, defaultValues, mode = 'create' }: CustomerFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      gstNumber: '',
      billingAddress: '',
      shippingAddress: '',
      creditLimit: 0,
      ...defaultValues,
    },
  });

  const onValidSubmit = (values: FormValues) => {
    onSubmit(values as unknown as CustomerFormData);
  };

  return (
    <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Company Info</p>
        <div className="space-y-3">
          <FormField label="Company Name *" error={errors.companyName?.message}>
            <input {...register('companyName')} placeholder="e.g. Sharma Enterprises" className={inputClass} />
          </FormField>
          <FormField label="GSTIN" error={errors.gstNumber?.message}>
            <input {...register('gstNumber')} placeholder="07ABCDE1234F1Z5" className={inputClass} style={{ textTransform: 'uppercase' }} />
          </FormField>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Contact Details</p>
        <div className="space-y-3">
          <FormField label="Contact Person" error={errors.contactPerson?.message}>
            <input {...register('contactPerson')} placeholder="Full name" className={inputClass} />
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            <input {...register('phone')} placeholder="10-digit mobile number" className={inputClass} maxLength={10} />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <input {...register('email')} type="email" placeholder="email@company.com" className={inputClass} />
          </FormField>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Addresses</p>
        <div className="space-y-3">
          <FormField label="Billing Address" error={errors.billingAddress?.message}>
            <textarea {...register('billingAddress')} placeholder="Full billing address" className={`${inputClass} resize-none`} rows={2} />
          </FormField>
          <FormField label="Shipping Address" error={errors.shippingAddress?.message}>
            <textarea {...register('shippingAddress')} placeholder="Full shipping address (leave blank if same)" className={`${inputClass} resize-none`} rows={2} />
          </FormField>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Financial</p>
        <FormField label="Credit Limit (₹)" error={errors.creditLimit?.message}>
          <input {...register('creditLimit')} type="number" placeholder="0" className={inputClass} min={0} />
        </FormField>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Customer' : 'Add Customer'}
        </button>
      </div>
    </form>
  );
}

