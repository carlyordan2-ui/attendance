import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Clock, 
  ShieldAlert, 
  RefreshCw, 
  LogOut, 
  AlertCircle
} from 'lucide-react';

export const PendingApprovalState: React.FC = () => {
  const { userProfile, logout, showToast } = useAuth();

  if (!userProfile) return null;

  const handleRefresh = () => {
    showToast('Checking approval status live with Cedric Institute database...', 'info');
  };

  return (
    <div className="max-w-xl mx-auto my-12 px-4">
      <div className="soft-card p-6 sm:p-8 text-center space-y-6 shadow-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl">
        
        {/* Animated Clock / Pending Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/10 relative">
          <Clock className="h-10 w-10 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        {/* Heading */}
        <div>
          <span className="inline-block px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            Status: Pending Approval
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Account Under Review
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Hello, <strong className="text-slate-900 dark:text-white">{userProfile.name}</strong>! Your {userProfile.role} registration has been submitted successfully to Cedric Institute.
          </p>
        </div>

        {/* Notice Card */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span>Registration Details</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 pt-1">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">ID Code</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{userProfile.userCode}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Assigned Role</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize">{userProfile.role}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Department / Section</span>
              <span className="text-slate-900 dark:text-white">{userProfile.departmentOrLocation}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block font-bold">Submitted At</span>
              <span className="text-slate-900 dark:text-white">{new Date(userProfile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 text-left flex items-start space-x-2.5">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <div>
            <strong>What happens next?</strong> An approved Faculty Teacher must review and approve your account request. Once approved, this screen will instantly update in real time without refreshing!
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleRefresh}
            id="pending-refresh-btn"
            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Check Approval Status</span>
          </button>

          <button
            onClick={logout}
            id="pending-logout-btn"
            className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center space-x-2 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};

