import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { 
  Lock, 
  User, 
  LogIn, 
  GraduationCap, 
  UserCheck, 
  AlertCircle,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';

interface LoginFormProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  role,
  onRoleChange,
  onSwitchToRegister
}) => {
  const { login, enterAdminMode } = useAuth();
  const [userCode, setUserCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(userCode, password, role);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTeacher = role === 'teacher';

  return (
    <div className="w-full max-w-md mx-auto my-2 sm:my-6 px-1 sm:px-4">
      
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6 space-y-1">
        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome to AttendEase
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
          Sign in to access daily attendance & course records
        </p>
      </div>

      {/* Single Centered Form Card */}
      <div className="soft-card p-4 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl">
        
        {/* Segmented Pill Role Toggle */}
        <div className="mb-6 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center">
          <button
            type="button"
            onClick={() => onRoleChange('student')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              !isTeacher
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="h-4 w-4 shrink-0" />
            <span>Student Login</span>
          </button>
          
          <button
            type="button"
            onClick={() => onRoleChange('teacher')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              isTeacher
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="h-4 w-4 shrink-0" />
            <span>Teacher Login</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-600" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* User Code Field (ID) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              {isTeacher ? 'Teacher ID' : 'Student ID'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                id="login-user-code-input"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder={isTeacher ? 'e.g. T-2001 or T-MATH' : 'e.g. S-10045 or 2026-0012'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Note: ID is not an email address.
            </p>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                id="login-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            id="login-submit-btn"
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Sign In as {isTeacher ? 'Teacher' : 'Student'}</span>
              </>
            )}
          </button>

        </form>

        {/* Switch to Register */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              id="switch-to-register-btn"
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Register as {isTeacher ? 'Teacher' : 'Student'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

