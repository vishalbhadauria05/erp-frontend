import { useState } from 'react'; // HMR trigger
import { Plus, Users, Search, Pencil, Trash2, Download } from 'lucide-react';
import { exportToExcel } from '../../utils/exportToExcel';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from './hooks/useCustomers';
import { CustomerForm } from './components/CustomerForm';
import { SlideOver } from '../../components/ui/SlideOver';
import { useAuth } from '../auth/auth';
import type { Customer, CustomerFormData } from './types';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={7}>
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800">
            <Users size={22} className="text-gray-400" />
          </div>
          <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">No customers yet</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add your first customer to get started.</p>
        </div>
      </td>
    </tr>
  );
}

export function CustomersPage() {
  const { isAdmin, canCreate } = useAuth();
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useCustomers();
  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer();
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer();
  const { mutate: deleteCustomer } = useDeleteCustomer();

  const allCustomers = data?.data ?? [];
  const customers = allCustomers.filter((c) =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    (c.contactPerson ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.gstNumber ?? '').toLowerCase().includes(search.toLowerCase())
  );

  function handleOpenAdd() {
    setEditingCustomer(null);
    setIsSlideOverOpen(true);
  }

  function handleOpenEdit(customer: Customer) {
    setEditingCustomer(customer);
    setIsSlideOverOpen(true);
  }

  function handleDelete(customer: Customer) {
    if (window.confirm(`Delete "${customer.companyName}"? This cannot be undone.`)) {
      deleteCustomer(customer._id);
    }
  }

  function handleSubmit(formData: CustomerFormData) {
    if (editingCustomer) {
      updateCustomer(
        { id: editingCustomer._id, data: formData },
        { onSuccess: () => setIsSlideOverOpen(false) }
      );
    } else {
      createCustomer(formData, { onSuccess: () => setIsSlideOverOpen(false) });
    }
  }

  const isSubmitting = isCreating || isUpdating;

  const handleExport = () => {
    const exportData = allCustomers.map((c) => ({
      'Company Name': c.companyName,
      'Contact Person': c.contactPerson || '',
      'Email': c.email || '',
      'Phone': c.phone || '',
      'GSTIN': c.gstNumber || '',
      'Address': c.billingAddress || '',
      'Credit Limit': c.creditLimit || 0,
      'Outstanding': c.outstandingBalance || 0,
    }));
    exportToExcel(exportData, `Customers_${new Date().toISOString().slice(0,10)}`, 'Customers');
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Customers</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{allCustomers.length} registered parties</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Download size={16} />
            Export
          </button>
          {canCreate && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add Customer
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="relative w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, contact, GSTIN…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-black py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-gray-800/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Company</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">GSTIN</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Contact</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Address</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Credit Limit</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Outstanding</th>
                {isAdmin && <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">Loading...</td>
                </tr>
              ) : customers.length === 0 ? (
                <EmptyState />
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 dark:bg-black transition-colors duration-100">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{customer.companyName}</p>
                      {customer.phone && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{customer.phone}</p>}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-600 dark:text-gray-400">{customer.gstNumber || '—'}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-gray-900 dark:text-gray-100">{customer.contactPerson || '—'}</p>
                      {customer.email && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{customer.email}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{customer.billingAddress || '—'}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-gray-900 dark:text-gray-100">{formatCurrency(customer.creditLimit)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={customer.outstandingBalance > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}>
                        {customer.outstandingBalance > 0 ? formatCurrency(customer.outstandingBalance) : '—'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(customer)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:bg-neutral-800 hover:text-gray-600 dark:text-gray-400 transition-colors"
                            aria-label="Edit customer"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(customer)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            aria-label="Delete customer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => setIsSlideOverOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
      >
        <CustomerForm
          key={editingCustomer?._id ?? 'new'}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          defaultValues={editingCustomer ?? undefined}
          mode={editingCustomer ? 'edit' : 'create'}
        />
      </SlideOver>
    </div>
  );
}