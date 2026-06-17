import { Plus, Users, PackagePlus, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

const actions = [
  {
    name: 'Create New Order',
    description: 'Add a new sales order or PO',
    href: '/orders',
    icon: Plus,
    iconColor: 'text-blue-700',
    iconBg: 'bg-blue-100',
  },
  {
    name: 'Add Customer',
    description: 'Register a new party with GSTIN',
    href: '/customers',
    icon: Users,
    iconColor: 'text-indigo-700',
    iconBg: 'bg-indigo-100',
  },
  {
    name: 'Add Stock Entry',
    description: 'Update inventory for raw materials',
    href: '/inventory',
    icon: PackagePlus,
    iconColor: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
  },
  {
    name: 'New Job Work',
    description: 'Create a printing or spot UV job',
    href: '/jobwork',
    icon: Printer,
    iconColor: 'text-amber-700',
    iconBg: 'bg-amber-100',
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Common tasks and shortcuts</p>
      </div>

      <ul className="p-2 space-y-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.name}>
              <Link
                to={action.href}
                className="group flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-800 transition-colors"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${action.iconBg} dark:bg-opacity-20`}>
                  <Icon size={18} className={action.iconColor} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {action.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
