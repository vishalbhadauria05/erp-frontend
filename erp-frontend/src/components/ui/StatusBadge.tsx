import clsx from 'clsx';
import type { OrderStatus } from '../../mocks/orders';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-600',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-blue-50 text-blue-700',
  },
  'in-production': {
    label: 'In Production',
    className: 'bg-amber-50 text-amber-700',
  },
  dispatched: {
    label: 'Dispatched',
    className: 'bg-emerald-50 text-emerald-700',
  },
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
