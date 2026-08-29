import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Scan,
  ClipboardCheck,
  Package,
  FileText,
  Users,
  Settings,
  LogOut,
  Scale
} from 'lucide-react';
import packSureLogo from '../../assets/PackSurelogo_nobg.png';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Administrator', 'Enforcement Officer', 'Inspector', 'Reviewer']
    },
    {
      name: 'New Scan',
      path: '/inspection/new',
      icon: Scan,
      roles: ['Administrator', 'Enforcement Officer', 'Inspector']
    },
    {
      name: 'Inspections',
      path: '/inspections',
      icon: ClipboardCheck,
      roles: ['Administrator', 'Enforcement Officer', 'Inspector', 'Reviewer']
    },
    {
      name: 'Products',
      path: '/products',
      icon: Package,
      roles: ['Administrator', 'Enforcement Officer', 'Inspector', 'Reviewer']
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: FileText,
      roles: ['Administrator', 'Enforcement Officer', 'Inspector', 'Reviewer']
    },
    {
      name: 'User Management',
      path: '/admin/users',
      icon: Users,
      roles: ['Administrator']
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      roles: ['Administrator', 'Enforcement Officer', 'Inspector', 'Reviewer']
    }
  ];

  const allowedItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : 'U';
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container - Supports Light & Dark Theme */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-24 items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-950/20 shrink-0 select-none">
          <img src={packSureLogo} alt="PackSure Logo" className="h-20 w-auto object-contain" />
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            PackSure
          </span>
        </div>

        {/* User Profile Info Card */}
        {user && (
          <div className="mx-4 my-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-105 dark:bg-blue-950/30 text-blue-700 dark:text-blue-450 font-bold text-sm border border-blue-200/30">
              {getInitials(user.name)}
            </div>
            <div className="overflow-hidden text-left">
              <h4 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {user.name}
              </h4>
              <p className="truncate text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {user.role}
              </p>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 space-y-0.5 px-3 py-2 overflow-y-auto">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-l-4 border-blue-700 dark:border-blue-500 font-semibold pl-3'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="h-4.5 w-4.5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Sign Out Action */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50/35 dark:bg-slate-950/30">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <LogOut className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
