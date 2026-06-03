import { type ElementType } from 'react';
import { ShoppingCart, Factory, Package, Truck, TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

type Trend = 'up' | 'down' | 'neutral';

interface StatCard {
  label: string;
  value: string;
  sub: string;
  trend: Trend;
  trendLabel: string;
  icon: ElementType;
  iconBg: string;
  iconColor: string;
}

const stats: StatCard[] = [
  {
    label: 'Total Orders',
    value: '248',
    sub: 'This month',
    trend: 'up',
    trendLabel: '+12% from last month',
    icon: ShoppingCart,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Active Production',
    value: '34',
    sub: 'Jobs in progress',
    trend: 'up',
    trendLabel: '+5 since yesterday',
    icon: Factory,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    label: 'Inventory Items',
    value: '1,204',
    sub: 'Across 12 categories',
    trend: 'down',
    trendLabel: '−3% from last week',
    icon: Package,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Pending Deliveries',
    value: '18',
    sub: 'Awaiting dispatch',
    trend: 'neutral',
    trendLabel: 'No change',
    icon: Truck,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
];

function TrendBadge({ trend, label }: { trend: Trend; label: string }) {
  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
        <TrendingUp size={12} />
        {label}
      </span>
    );
  }
  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
        <TrendingDown size={12} />
        {label}
      </span>
    );
  }
  return <span className="text-xs text-gray-400">{label}</span>;
}

export function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500">Overview of your operations today.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg', stat.iconBg)}>
                  <Icon size={20} className={stat.iconColor} aria-hidden="true" />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="mt-0.5 text-sm font-medium text-gray-600">{stat.label}</p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <TrendBadge trend={stat.trend} label={stat.trendLabel} />
                <span className="text-xs text-gray-400">{stat.sub}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}