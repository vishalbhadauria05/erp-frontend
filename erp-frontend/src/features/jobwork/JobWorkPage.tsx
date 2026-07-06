import { useState } from 'react';
import { Plus, CheckCircle2, Printer, Download, Package, AlertTriangle } from 'lucide-react';
import { useJobWorks, useCreateJobWork, useCompleteJobWork } from './hooks/useJobWork';
import { useInventory } from '../inventory/hooks/useInventory';
import { useItems } from '../items/hooks/useItems';
import { SlideOver } from '../../components/ui/SlideOver';
import { exportToExcel } from '../../utils/exportToExcel';
import { useAuth } from '../auth/auth';

const STATUS_FILTERS = ['All', 'Pending', 'Completed'];

// Print prefix used to name the produced finished stock (mirrors the backend).
const getPrintedPrefix = (jobType: string) =>
  jobType === 'Printed+Laminated'
    ? 'Printed + Laminated'
    : jobType === 'Printed+SpotUV'
      ? 'Printed + Spot UV'
      : 'Printed';

export function JobWorkPage() {
  const { isAdmin, canCreate } = useAuth();
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState('All');
  const [formError, setFormError] = useState('');

  // Form state
  const [jobNumber, setJobNumber] = useState('');
  const [jobType, setJobType] = useState<'Printed' | 'Printed+SpotUV' | 'Printed+Laminated'>('Printed');
  const [selectedInventory, setSelectedInventory] = useState('');
  const [quantity, setQuantity] = useState('');

  // Complete-job modal state
  const [completeModal, setCompleteModal] = useState<{ job: any; outputItemId: string; sheets: string; error: string } | null>(null);

  const { data: jobsData, isLoading } = useJobWorks();
  const { data: inventoryData } = useInventory('All');
  const { data: itemsData } = useItems();
  const createMutation = useCreateJobWork();
  const completeMutation = useCompleteJobWork();

  const jobs = jobsData?.data || [];
  const inventoryItems = inventoryData?.data || [];
  // Finished-item choices for completion — every Item Master item except raw materials.
  const finishedItems = (itemsData?.data || []).filter((it: any) => it.type !== 'RawMaterial');
  const selectedOutputItem = completeModal
    ? finishedItems.find((it: any) => it._id === completeModal.outputItemId)
    : undefined;

  // Status counts
  const statusCounts: Record<string, number> = {};
  jobs.forEach((j: any) => {
    const s = j.status || 'Pending';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });

  // Filter
  const filteredJobs = activeStatus === 'All'
    ? jobs
    : jobs.filter((j: any) => j.status === activeStatus);

  // Get selected inventory's current stock
  const selectedInvItem = inventoryItems.find((i: any) => i._id === selectedInventory);
  const availableStock = selectedInvItem?.currentStock || 0;
  const materialName = selectedInvItem?.itemRef?.itemName || '';
  const selectedUnit = selectedInvItem?.itemRef?.unitOfMeasure || '';

  const resetForm = () => {
    setJobNumber('');
    setJobType('Printed');
    setSelectedInventory('');
    setQuantity('');
    setFormError('');
  };

  const handleCreate = () => {
    setFormError('');

    if (!jobNumber.trim()) {
      setFormError('Job number is required');
      return;
    }
    if (!selectedInventory) {
      setFormError('Please select a material');
      return;
    }
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      setFormError('Quantity must be a positive number');
      return;
    }
    if (qty > availableStock) {
      setFormError(`Insufficient stock! Available: ${availableStock}, Requested: ${qty}`);
      return;
    }

    createMutation.mutate(
      { jobNumber: jobNumber.trim(), jobType, inventoryRef: selectedInventory, quantity: qty },
      {
        onSuccess: () => {
          setIsSlideOverOpen(false);
          resetForm();
        },
        onError: (error: any) => {
          setFormError(error?.response?.data?.message || 'Failed to create job');
        },
      }
    );
  };

  const openCompleteModal = (job: any) => {
    setCompleteModal({
      job,
      outputItemId: '',
      sheets: String(job.quantity || ''),
      error: '',
    });
  };

  const handleConfirmComplete = () => {
    if (!completeModal) return;
    const sheets = Number(completeModal.sheets);

    if (!completeModal.outputItemId) {
      setCompleteModal({ ...completeModal, error: 'Please select the finished item to produce.' });
      return;
    }
    if (isNaN(sheets) || sheets <= 0) {
      setCompleteModal({ ...completeModal, error: 'Number of sheets must be a positive number.' });
      return;
    }

    completeMutation.mutate(
      { id: completeModal.job._id, outputItemId: completeModal.outputItemId, producedSheets: sheets },
      {
        onSuccess: () => setCompleteModal(null),
        onError: (error: any) => {
          setCompleteModal({
            ...completeModal,
            error: error?.response?.data?.message || 'Failed to complete job.',
          });
        },
      }
    );
  };

  const handleExport = () => {
    const exportData = jobs.map((j: any) => ({
      'Job #': j.jobNumber,
      'Type': j.jobType,
      'Material': j.materialName,
      'Quantity': j.quantity,
      'Status': j.status,
      'Output': j.outputInventoryRef?.itemRef?.itemName || '—',
      'Created': j.createdAt ? new Date(j.createdAt).toLocaleDateString() : '',
    }));
    exportToExcel(exportData, `JobWork_${new Date().toISOString().slice(0, 10)}`, 'Job Work');
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Job Work</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {jobs.length} total jobs
            {statusCounts['Pending'] ? ` · ${statusCounts['Pending']} pending` : ''}
            {statusCounts['Completed'] ? ` · ${statusCounts['Completed']} completed` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 border border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Download size={18} />
            Export
          </button>
          {canCreate && (
            <button
              onClick={() => { resetForm(); setIsSlideOverOpen(true); }}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
            >
              <Plus size={18} />
              New Job
            </button>
          )}
        </div>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
        {/* Status Tabs */}
        <div className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-black px-4 pt-4">
          <div className="flex space-x-6 overflow-x-auto pb-px">
            {STATUS_FILTERS.map((status) => {
              const isActive = activeStatus === status;
              const count = status === 'All' ? jobs.length : (statusCounts[status] || 0);
              if (count === 0 && status !== 'All' && !isActive) return null;
              return (
                <button
                  key={status}
                  onClick={() => setActiveStatus(status)}
                  className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {status}
                  <span className={`text-xs rounded-full px-2 py-0.5 ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 font-medium border-b border-gray-200 dark:border-neutral-800 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Job #</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Material</th>
                <th className="px-6 py-4">Qty</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Output Stock</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex justify-center items-center gap-3">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Loading jobs...
                    </div>
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <Printer className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {activeStatus === 'All' ? 'No jobs yet' : `No ${activeStatus.toLowerCase()} jobs`}
                    </p>
                    <p className="text-sm mt-1">Create a new job to get started.</p>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job: any) => {
                  const isCompleted = job.status === 'Completed';
                  const outputName = job.outputInventoryRef?.itemRef?.itemName || '—';
                  const jobUnit = job.inventoryRef?.itemRef?.unitOfMeasure || '';
                  return (
                    <tr key={job._id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isCompleted ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 font-medium text-blue-600 whitespace-nowrap">{job.jobNumber}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          job.jobType === 'Printed'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                            : job.jobType === 'Printed+Laminated'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                        }`}>
                          <Printer size={12} />
                          {job.jobType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{job.materialName}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                        {job.quantity}{jobUnit ? ` ${jobUnit}` : ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isCompleted
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <Package size={14} />
                            {outputName}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isCompleted ? (
                          isAdmin ? (
                            <button
                              onClick={() => openCompleteModal(job)}
                              disabled={completeMutation.isPending}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 disabled:opacity-50 transition-colors"
                            >
                              <CheckCircle2 size={13} />
                              Complete
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">—</span>
                          )
                        ) : (
                          <span className="text-xs text-gray-400 italic">Done</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Job SlideOver */}
      <SlideOver
        isOpen={isSlideOverOpen}
        onClose={() => { setIsSlideOverOpen(false); resetForm(); }}
        title="Create New Job"
      >
        <div className="space-y-5 p-1">
          {formError && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              <AlertTriangle size={16} />
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job Number *</label>
            <input
              value={jobNumber}
              onChange={(e) => setJobNumber(e.target.value)}
              placeholder="e.g. JOB-001"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job Type *</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value as any)}
              className={inputClass}
            >
              <option value="Printed">Printed</option>
              <option value="Printed+SpotUV">Printing + Spot UV</option>
              <option value="Printed+Laminated">Printed + Laminated</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select Material *</label>
            <select
              value={selectedInventory}
              onChange={(e) => setSelectedInventory(e.target.value)}
              className={inputClass}
            >
              <option value="">— Select from inventory —</option>
              {inventoryItems.map((item: any) => {
                const name = item.itemRef?.itemName || 'Unknown';
                const category = item.itemRef?.category || '';
                return (
                  <option key={item._id} value={item._id}>
                    {name} ({category}) — Stock: {item.currentStock}
                  </option>
                );
              })}
            </select>
            {selectedInventory && (
              <p className="text-xs text-gray-400 mt-1">
                Available stock: <span className={`font-medium ${availableStock <= 0 ? 'text-red-500' : 'text-emerald-600'}`}>{availableStock}{selectedUnit ? ` ${selectedUnit}` : ''}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Quantity *{selectedUnit ? ` (${selectedUnit})` : ''}
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={availableStock}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className={inputClass}
              />
              {selectedUnit && (
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                  {selectedUnit}
                </span>
              )}
            </div>
            {Number(quantity) > availableStock && availableStock > 0 && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertTriangle size={12} />
                Exceeds available stock ({availableStock})
              </p>
            )}
          </div>

          {/* Preview */}
          {selectedInventory && Number(quantity) > 0 && Number(quantity) <= availableStock && (
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-300 mb-2">Preview</p>
              <p className="text-blue-700 dark:text-blue-400">
                <strong>{Number(quantity)}</strong> units of <strong>{materialName}</strong> will be consumed.
              </p>
              <p className="text-blue-700 dark:text-blue-400 mt-1">
                On completion you'll pick the finished item and enter the sheets produced.
              </p>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            {createMutation.isPending ? 'Creating Job...' : 'Create Job & Deduct Stock'}
          </button>
        </div>
      </SlideOver>

      {/* Complete Job Modal */}
      {completeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Complete Job
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 mt-2">
              Job <span className="font-medium text-blue-600">{completeModal.job.jobNumber}</span>{' '}
              (<span className="font-medium">{completeModal.job.jobType}</span>) — consumed{' '}
              <span className="font-medium">{completeModal.job.quantity}</span> of {completeModal.job.materialName}.
            </p>

            {completeModal.error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
                <AlertTriangle size={15} />
                {completeModal.error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Finished Item (from Item Master)
                </label>
                <select
                  value={completeModal.outputItemId}
                  onChange={(e) => setCompleteModal({ ...completeModal, outputItemId: e.target.value, error: '' })}
                  className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">— Select finished item —</option>
                  {finishedItems.map((it: any) => (
                    <option key={it._id} value={it._id}>
                      {it.itemName} ({it.category}) — {it.unitOfMeasure}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Number of Sheets Produced
                </label>
                <input
                  type="number"
                  min="1"
                  value={completeModal.sheets}
                  onChange={(e) => setCompleteModal({ ...completeModal, sheets: e.target.value, error: '' })}
                  className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Produced stock is always added in sheets.</p>
              </div>

              {selectedOutputItem && Number(completeModal.sheets) > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-sm">
                  <p className="text-emerald-700 dark:text-emerald-400">
                    <strong>{Number(completeModal.sheets)}</strong> sheets of{' '}
                    <strong>{getPrintedPrefix(completeModal.job.jobType)} ({selectedOutputItem.itemName})</strong>{' '}
                    will be added to inventory (in Sheets).
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCompleteModal(null)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmComplete}
                disabled={completeMutation.isPending}
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-sm"
              >
                {completeMutation.isPending ? 'Completing...' : 'Complete Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
