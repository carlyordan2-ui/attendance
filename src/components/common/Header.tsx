import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  GraduationCap, 
  LogOut, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Clock, 
  Zap
} from 'lucide-react';

export const Header: React.FC = () => {
  const { userProfile, logout, selectedRole, setSelectedRole, theme, toggleTheme, enterAdminMode } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between">
        
        {/* Brand & App Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 shrink-0">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 truncate">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 dark:text-white truncate">
                AttendEase
              </span>
              <span className="hidden xs:inline-block px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shrink-0">
                Cedric
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
              Student Attendance System
            </p>
          </div>
        </div>

        {/* Right Section: Role / Profile / Theme / Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-btn"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors focus:outline-none"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4 text-slate-600" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </button>

          {/* User Logged In Info */}
          {userProfile && (
            <div className="flex items-center space-x-2 sm:space-x-3 pl-1.5 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
              
              {/* User Avatar & Info */}
              <div className="flex items-center space-x-2">
                <div 
                  title={`${userProfile.name} (${userProfile.role})`}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs sm:text-sm border border-indigo-200 dark:border-indigo-800 shrink-0"
                >
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[110px] lg:max-w-[160px]">
                    {userProfile.name}
                  </p>
                  <div className="flex items-center space-x-1 mt-0.5">
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 font-mono">
                      {userProfile.userCode}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold capitalize ${
                      userProfile.role === 'teacher' 
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {userProfile.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center">
                {userProfile.status === 'approved' ? (
                  <span className="hidden md:inline-flex items-center text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Approved
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900">
                    <Clock className="h-3 w-3 mr-1" /> Pending
                  </span>
                )}
              </div>

              {/* Sign Out Button */}
              <button
                onClick={logout}
                id="header-logout-btn"
                title="Sign Out"
                className="flex items-center space-x-1.5 p-2 sm:px-3 sm:py-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl border border-rose-200 dark:border-rose-900/50 transition-colors shrink-0"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};


