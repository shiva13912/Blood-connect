import React from 'react';
import { Droplet } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white dark:border-slate-800/85 dark:bg-slate-950/80 py-8 transition-colors duration-200 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary-dark/15 dark:text-primary-dark">
              <Droplet className="h-4.5 w-4.5 fill-current" />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-255">BloodConnect AI</span>
          </div>
          <p className="text-xs text-slate-400 text-center md:text-right">
            &copy; {new Date().getFullYear()} BloodConnect AI. Intelligent donor management and emergency response network.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
