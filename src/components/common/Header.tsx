import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LogOut, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Clock, 
  UserCog,
  Compass
} from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import { ProfileEditModal } from '../profile/ProfileEditModal';

export const Header: React.FC = () => {
  const { userProfile, logout, theme, toggleTheme } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 dark:border-stone-800/90 bg-stone-50/90 dark:bg-[#0E1015]/90 backdrop-blur-md transition-colors">
      {/* Top micro-line accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-amber-600/20 via-amber-500/60 to-amber-600/20" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Academic Crest */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative group cursor-pointer">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-stone-900 to-stone-800 dark:from-stone-800 dark:to-stone-900 border border-stone-700/60 dark:border-stone-700 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/5 group-hover:border-amber-500/60 transition-all">
              <Compass className="h-5 w-5 stroke-[1.75]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-stone-50 dark:ring-[#0E1015]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-stone-900 dark:text-stone-100">
                AttendEase
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-md bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-amber-400 border border-stone-300 dark:border-stone-700">
                Team Cedric
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-stone-500 dark:text-stone-400">
              <span>Attendance Portal</span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">{currentTime || 'LIVE'}</span>
            </div>
          </div>
        </div>

        {/* Right Section: Micro Telemetry / Profile / Theme / Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          
          {/* Theme Switcher Dial */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-btn"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="p-2 sm:p-2.5 rounded-xl text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-all cursor-pointer shadow-2xs"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4 text-stone-700 hover:text-amber-600 transition-colors" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </button>

          {/* User Logged In Info */}
          {userProfile && (
            <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-stone-200 dark:border-stone-800">
              
              {/* Profile Card */}
              <div 
                onClick={() => setIsProfileModalOpen(true)}
                title="Profile Settings"
                className="flex items-center space-x-2.5 cursor-pointer group px-2 py-1 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 hover:border-amber-500/40 transition-all"
              >
                <div className="relative">
                  <AvatarDisplay avatarId={userProfile.avatar} name={userProfile.name} size="sm" />
                </div>
                
                <div className="text-left hidden md:block">
                  <p className="text-xs font-heading font-bold text-stone-900 dark:text-stone-100 leading-tight truncate max-w-[120px] lg:max-w-[160px] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {userProfile.name}
                  </p>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                      {userProfile.userCode}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                      userProfile.role === 'teacher' 
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' 
                        : 'bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700'
                    }`}>
                      {userProfile.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="hidden lg:flex items-center">
                {userProfile.status === 'approved' ? (
                  <span className="inline-flex items-center text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    <Clock className="h-3 w-3 mr-1" /> Pending
                  </span>
                )}
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                id="header-edit-profile-btn"
                title="Edit Profile"
                className="p-2 text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl transition-all cursor-pointer"
              >
                <UserCog className="h-4 w-4" />
              </button>

              {/* Sign Out Button */}
              <button
                onClick={logout}
                id="header-logout-btn"
                title="Sign Out"
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-800 rounded-xl border border-stone-200 dark:border-stone-800 transition-all cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Profile & Avatar Edit Modal */}
      {isProfileModalOpen && userProfile && (
        <ProfileEditModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </header>
  );
};
