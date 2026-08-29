import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { Bell, Menu, Check, AlertTriangle, ShieldAlert } from 'lucide-react';
import { mockNotifications } from '../data/mockData';

const AppLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 dark:border-slate-400 border-t-transparent" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SUCCESS':
        return <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'ERROR':
        return <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-500" />;
      default:
        return null;
    }
  };

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
    <div className="relative flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 antialiased font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        
        {/* Official Government Tricolor Top Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 flex z-50">
          <div className="flex-1 bg-[#FF9933]"></div> {/* Saffron */}
          <div className="flex-1 bg-white"></div>       {/* White */}
          <div className="flex-1 bg-[#138808]"></div> {/* Green */}
        </div>

        {/* Official Gov Accessibility Top-Header */}
        <div className="w-full bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850/60 text-[10px] text-slate-555 dark:text-slate-400 py-1.5 px-6 flex justify-between items-center select-none shrink-0 pt-2 z-40">
          <div className="flex items-center gap-3 font-semibold uppercase tracking-wider">
            <span>भारत सरकार</span>
            <span className="text-slate-350 dark:text-slate-800">|</span>
            <span>Government of India</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 font-medium">
            <a href="#main-content" className="hover:text-slate-800 dark:hover:text-white">Skip to main content</a>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <a href="#accessibility" className="hover:text-slate-800 dark:hover:text-white">Screen Reader Access</a>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">English</span>
          </div>
        </div>

        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 px-6">
          
          {/* Left: Mobile Navigation Button & Titles */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-5 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Department of Consumer Affairs
                </span>
                <span className="text-slate-300 dark:text-slate-800">|</span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  Legal Metrology Division
                </span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                PackSure Verification System
              </span>
            </div>
          </div>

          {/* Right: Notifications & User Profile */}
          <div className="flex items-center gap-4 relative">
            
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-md p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Panel */}
            {showNotifications && (
              <div className="absolute right-0 top-12 z-40 w-80 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-950/20">
                  <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">System Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">No active alerts</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => {
                          navigate(n.link);
                          setShowNotifications(false);
                        }}
                        className={`flex gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${!n.read ? 'bg-blue-50/10 dark:bg-blue-900/10' : ''}`}
                      >
                        <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                          <span className="text-[9px] text-slate-400 dark:text-slate-555 mt-1 block">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            {/* User Session Profile */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-2xs">
                {getInitials(user.name)}
              </div>
              <div className="hidden flex-col items-start lg:flex text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {user.name}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
            </div>

          </div>
        </header>

        {/* Routed Main Dashboard View */}
        <main id="main-content" className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
