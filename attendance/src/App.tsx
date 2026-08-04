import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { NotificationToast } from './components/common/NotificationToast';
import { RoleSelection } from './components/auth/RoleSelection';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { PendingApprovalState } from './components/auth/PendingApprovalState';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { GraduationCap, AlertOctagon, LogOut, Loader2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { firebaseUser, userProfile, loading, selectedRole, setSelectedRole, logout } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 animate-pulse">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight">AttendEase</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center space-x-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
              <span>Loading AttendEase system...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State (Single Centered Login Card with Role Pill Toggle)
  if (!firebaseUser && !userProfile) {
    const activeRole = selectedRole || 'student';

    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors overflow-x-hidden">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-start sm:justify-center px-3 sm:px-6 py-4 sm:py-8 w-full max-w-7xl mx-auto my-auto">
          {isRegistering ? (
            <RegisterForm 
              role={activeRole}
              onRoleChange={(r) => setSelectedRole(r)}
              onSwitchToLogin={() => setIsRegistering(false)}
            />
          ) : (
            <LoginForm 
              role={activeRole}
              onRoleChange={(r) => setSelectedRole(r)}
              onSwitchToRegister={() => setIsRegistering(true)}
            />
          )}
        </main>
        <Footer />
        <NotificationToast />
      </div>
    );
  }

  // 3. Authenticated - Check User Status & Profile
  if (!userProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-sm">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
            <p className="text-xs text-slate-500">Loading user profile attributes...</p>
          </div>
        </main>
        <Footer />
        <NotificationToast />
      </div>
    );
  }

  // Pending Status Screen
  if (userProfile.status === 'pending') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <PendingApprovalState />
        </main>
        <Footer />
        <NotificationToast />
      </div>
    );
  }

  // Rejected Status Screen
  if (userProfile.status === 'rejected') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <AlertOctagon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Not Approved</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                Your registration request was declined by faculty administration.
              </p>
              {userProfile.rejectedReason && (
                <p className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900">
                  Reason: "{userProfile.rejectedReason}"
                </p>
              )}
            </div>
            <button
              onClick={logout}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Return to Login</span>
            </button>
          </div>
        </main>
        <Footer />
        <NotificationToast />
      </div>
    );
  }

  // Approved Status -> Render Role Dashboard
  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors overflow-x-hidden">
      <Header />
      <main className="flex-grow w-full">
        {userProfile.role === 'teacher' ? (
          <TeacherDashboard />
        ) : (
          <StudentDashboard />
        )}
      </main>
      <Footer />
      <NotificationToast />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
