import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Package, Box, ChevronRight, LogOut, Menu, Moon, Sun, Printer } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../features/auth/auth';
import { useTheme } from '../../contexts/ThemeContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/jobwork', label: 'Job Work', icon: Printer },
];

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/orders': 'Orders',
  '/customers': 'Customers',
  '/inventory': 'Inventory',
  '/jobwork': 'Job Work',
};

export function AppLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pageTitle = routeNames[location.pathname] ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-200 flex">
      <aside
        className="group fixed left-0 top-0 h-screen w-16 hover:w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black flex flex-col transition-all duration-200 ease-in-out overflow-hidden z-20"
      >
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-gray-100 dark:border-gray-800 min-w-64">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
            <Box size={16} className="text-white" aria-hidden="true" />
          </div>

          <div className="flex-1 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-75">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight whitespace-nowrap">Amar Packers</p>
            <p className="text-xs text-gray-400 leading-tight">ERP System</p>
          </div>

          <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400">
            <Menu size={18} />
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-2 py-4 flex-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={label}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 min-w-max',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={clsx('shrink-0', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 dark:text-gray-400')}
                    aria-hidden="true"
                  />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-75 whitespace-nowrap">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-75">
          <p className="text-xs text-gray-400 whitespace-nowrap">v1.0.0</p>
        </div>
      </aside>

      <div className="ml-16 flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 flex h-14 items-center border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black px-8 transition-colors duration-200">
          <div className="flex flex-1 items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <span>Home</span>
            <ChevronRight size={14} className="text-gray-400 dark:text-gray-600 dark:text-gray-400" aria-hidden="true" />
            <span className="font-medium text-gray-900 dark:text-gray-100">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 transition hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
              aria-label="Toggle Theme"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <span className="max-w-64 truncate text-sm text-gray-500 dark:text-gray-400 hidden sm:inline-block">{user?.email}</span>
            <button
              type="button"
              onClick={() => void logout()}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 transition hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 text-gray-900 dark:text-gray-100 transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
