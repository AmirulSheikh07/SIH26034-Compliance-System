import React, { useState } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { useTheme } from '../../shared/context/ThemeContext';
import { Shield, Bell, Monitor, User, Save, CheckCircle } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Settings State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inspectionAlerts, setInspectionAlerts] = useState(true);
  const [reviewAlerts, setReviewAlerts] = useState(false);
  const [reportAlerts, setReportAlerts] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 antialiased text-slate-800 dark:text-slate-200 max-w-3xl">
      
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">System Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Configure account details, application themes, and event notifications alerts</p>
      </div>

      {isSaved && (
        <div className="rounded border border-emerald-250 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900 p-3.5 flex items-center gap-2 text-xs text-emerald-805 dark:text-emerald-400 font-medium transition-all">
          <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-700 dark:text-emerald-500" />
          <span>System configuration preferences saved successfully.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Section 1: User Account details */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Account Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Employee Name</span>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="mt-1 block w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-550 dark:text-slate-400 font-medium focus:outline-hidden"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Official Email Address</span>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="mt-1 block w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-550 dark:text-slate-400 font-medium focus:outline-hidden"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">Metrology Department</span>
              <input
                type="text"
                disabled
                value={user?.department || ''}
                className="mt-1 block w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-550 dark:text-slate-400 font-medium focus:outline-hidden"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase tracking-wider">System Role</span>
              <input
                type="text"
                disabled
                value={user?.role || ''}
                className="mt-1 block w-full rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-550 dark:text-slate-400 font-medium focus:outline-hidden uppercase tracking-wider"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Notifications Alerts */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Bell className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Alert Preferences</h3>
          </div>

          <div className="space-y-3">
            
            {/* Email Alert Toggle */}
            <div className="flex items-start">
              <input
                id="email-alerts"
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-750 text-blue-700 focus:ring-blue-600 mt-0.5"
              />
              <label htmlFor="email-alerts" className="ml-3 block text-xs">
                <span className="font-semibold text-slate-850 dark:text-slate-300 block">General Email Notifications</span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] leading-relaxed block mt-0.5">
                  Receive summary reports and critical warnings directly to your official email.
                </span>
              </label>
            </div>

            {/* Inspection Alert Toggle */}
            <div className="flex items-start border-t border-slate-100 dark:border-slate-800 pt-3">
              <input
                id="inspection-alerts"
                type="checkbox"
                checked={inspectionAlerts}
                onChange={(e) => setInspectionAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-750 text-blue-700 focus:ring-blue-600 mt-0.5"
              />
              <label htmlFor="inspection-alerts" className="ml-3 block text-xs">
                <span className="font-semibold text-slate-850 dark:text-slate-300 block">Critical Inspection Alerts</span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] leading-relaxed block mt-0.5">
                  Get notified immediately on your dashboard when a product fails metrology compliance checks.
                </span>
              </label>
            </div>

            {/* Review alerts toggle */}
            <div className="flex items-start border-t border-slate-100 dark:border-slate-800 pt-3">
              <input
                id="review-alerts"
                type="checkbox"
                checked={reviewAlerts}
                onChange={(e) => setReviewAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-750 text-blue-700 focus:ring-blue-600 mt-0.5"
              />
              <label htmlFor="review-alerts" className="ml-3 block text-xs">
                <span className="font-semibold text-slate-850 dark:text-slate-300 block">Manual Review Requests</span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] leading-relaxed block mt-0.5">
                  Alert when an AI OCR confidence drops below 60% and requests human review validation.
                </span>
              </label>
            </div>

            {/* Report Alerts toggle */}
            <div className="flex items-start border-t border-slate-100 dark:border-slate-800 pt-3">
              <input
                id="report-alerts"
                type="checkbox"
                checked={reportAlerts}
                onChange={(e) => setReportAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-750 text-blue-700 focus:ring-blue-600 mt-0.5"
              />
              <label htmlFor="report-alerts" className="ml-3 block text-xs">
                <span className="font-semibold text-slate-850 dark:text-slate-300 block">Report Signatures Alerts</span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] leading-relaxed block mt-0.5">
                  Notify when a draft seizure memo report has been signed by the senior reviewer.
                </span>
              </label>
            </div>

          </div>
        </div>

        {/* Section 3: Appearance Themes settings */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Monitor className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Application Theme</h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div className="flex items-center">
              <input
                id="theme-light"
                type="radio"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={() => toggleTheme('light')}
                className="h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-600 cursor-pointer"
              />
              <label htmlFor="theme-light" className="ml-2 block text-xs font-semibold text-slate-800 dark:text-slate-350 cursor-pointer">
                Light Theme (Official Minimalist)
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="theme-dark"
                type="radio"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={() => toggleTheme('dark')}
                className="h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-600 cursor-pointer"
              />
              <label htmlFor="theme-dark" className="ml-2 block text-xs font-semibold text-slate-800 dark:text-slate-350 cursor-pointer">
                Dark Theme (Night Operations)
              </label>
            </div>
          </div>
        </div>

        {/* Form Action buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded bg-slate-800 dark:bg-slate-200 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </button>
        </div>

      </form>

    </div>
  );
};

export default SettingsPage;
