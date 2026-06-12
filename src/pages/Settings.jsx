import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/common/Toast';
import { Settings as SettingsIcon, Sun, Database, Shield } from 'lucide-react';

export const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  return (
    <div className="flex-1 bg-bg-light dark:bg-bg-dark p-6 transition-colors duration-300">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Banner */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            System Configurations
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your display settings and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Display settings */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 pb-3 border-b border-slate-50 dark:border-slate-850">
              <Sun className="h-4.5 w-4.5 text-primary" /> Display Settings
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Dark Mode Interface</span>
                <span className="block text-[10px] text-slate-400">Toggle dark visual parameters.</span>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-850 cursor-pointer"
              >
                {theme === 'dark' ? 'Disable Dark Mode' : 'Enable Dark Mode'}
              </button>
            </div>
          </div>

          {/* Card 2: Environment details */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 pb-3 border-b border-slate-50 dark:border-slate-850">
              <Database className="h-4.5 w-4.5 text-emerald-500" /> Database Status
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <span className="block font-bold text-slate-700 dark:text-slate-350">Service Mode</span>
                  <span className="block text-[10px] text-slate-450">Active database connection layer.</span>
                </div>
                <span className="font-bold px-3 py-1 rounded text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                  API Connected
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Security & Privacy */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 pb-3 border-b border-slate-50 dark:border-slate-850">
              <Shield className="h-4.5 w-4.5 text-primary" /> Security & Privacy
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg">
                <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Encryption</p>
                <p className="text-slate-500 dark:text-slate-400">All data transmitted with industry-standard SSL/TLS encryption</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg">
                <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">HIPAA Compliance</p>
                <p className="text-slate-500 dark:text-slate-400">Your blood type and health data are protected under strict regulations</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg">
                <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Data Privacy</p>
                <p className="text-slate-500 dark:text-slate-400">Your personal information is never shared without explicit consent</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg">
                <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Authentication</p>
                <p className="text-slate-500 dark:text-slate-400">Two-factor authentication available for enhanced account security</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default Settings;
