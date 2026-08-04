import React, { useState, useEffect } from 'react';
import { DailyCheckInTab } from './DailyCheckInTab';
import { StudentStatsTab } from './StudentStatsTab';
import { SubjectEnrollmentTab } from './SubjectEnrollmentTab';
import { AttendanceHistoryTab } from './AttendanceHistoryTab';
import { StudentProfileTab } from './StudentProfileTab';
import { AnnouncementsTab } from '../classroom/AnnouncementsTab';
import { AssignmentsTab } from '../classroom/AssignmentsTab';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeSubjects } from '../../services/attendanceService';
import { Subject } from '../../types';
import { 
  CalendarCheck, 
  BarChart2, 
  BookOpen, 
  Clock, 
  User,
  PanelLeft,
  PanelLeftClose,
  Menu,
  X,
  Megaphone,
  ClipboardList
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'stream' | 'classwork' | 'checkin' | 'stats' | 'enroll' | 'history' | 'profile'>('stream');
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Desktop sidebar collapse toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Mobile/Tablet slide-over drawer state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeSubjects((data) => setSubjects(data));
    return () => unsub();
  }, []);

  const tabs = [
    { id: 'stream', label: "Stream & Notices", shortLabel: "Stream", icon: Megaphone },
    { id: 'classwork', label: "Assignments & Classwork", shortLabel: "Classwork", icon: ClipboardList },
    { id: 'checkin', label: "Class Check-In", shortLabel: "Check-In", icon: CalendarCheck },
    { id: 'stats', label: "Stats & %", shortLabel: "Stats", icon: BarChart2 },
    { id: 'enroll', label: "Enroll in Subjects", shortLabel: "Enroll", icon: BookOpen },
    { id: 'history', label: "History Log", shortLabel: "History", icon: Clock },
    { id: 'profile', label: "Student Profile", shortLabel: "Profile", icon: User },
  ] as const;

  const activeTabObj = tabs.find(t => t.id === activeTab);

  if (!userProfile) return null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      
      {/* Top Bar with Sidebar/Drawer Symbol Toggle Button */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setIsMobileDrawerOpen(!isMobileDrawerOpen);
              } else {
                setIsSidebarOpen(!isSidebarOpen);
              }
            }}
            id="toggle-student-sidebar-btn"
            title="Toggle Navigation Menu"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 transition-colors shadow-sm flex items-center space-x-2"
          >
            <Menu className="h-5 w-5 lg:hidden" />
            <span className="hidden lg:inline-block">
              {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              Navigation
            </span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 dark:text-slate-600 text-sm font-bold">/</span>
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
              {activeTabObj?.label}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400 hidden sm:inline">
            Student Portal
          </span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative">
        
        {/* Desktop Left Sidebar App-Shell (1024px+) */}
        {isSidebarOpen && (
          <aside className="hidden lg:block w-64 lg:w-72 shrink-0 sticky top-20">
            <div className="soft-card p-4 space-y-3 shadow-sm rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center justify-between">
                <span>Classroom Menu</span>
                <span className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">Live</span>
                </span>
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      id={`student-tab-${tab.id}`}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all text-left border ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                          : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}

        {/* Mobile & Tablet Slide-Over Drawer Navigation */}
        {isMobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-start">
            <div className="bg-white dark:bg-slate-900 w-72 h-full p-5 space-y-4 shadow-2xl border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <PanelLeft className="h-4 w-4 text-indigo-600" />
                    <span>Student Navigation</span>
                  </span>
                  <button
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-1.5 mt-4">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileDrawerOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-all text-left border ${
                          isActive
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5 shrink-0" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 text-center font-mono">
                Cedric Institute Student Portal
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          {activeTab === 'stream' && <AnnouncementsTab userProfile={userProfile} subjects={subjects} />}
          {activeTab === 'classwork' && <AssignmentsTab userProfile={userProfile} subjects={subjects} />}
          {activeTab === 'checkin' && <DailyCheckInTab />}
          {activeTab === 'stats' && <StudentStatsTab />}
          {activeTab === 'enroll' && <SubjectEnrollmentTab />}
          {activeTab === 'history' && <AttendanceHistoryTab />}
          {activeTab === 'profile' && <StudentProfileTab />}
        </main>

      </div>
    </div>
  );
};



