import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm py-5 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        
        {/* Left */}
        <div className="font-medium text-slate-700 dark:text-slate-300">
          © 2026 AttendEase • Student Attendance System
        </div>

        {/* Right */}
        <div className="flex items-center space-x-4 text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Shield className="h-3.5 w-3.5 text-indigo-500" />
            <span>Cedric Institute Academic Portal</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
