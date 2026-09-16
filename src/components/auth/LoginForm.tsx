import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { 
  Lock, 
  User, 
  LogIn, 
  GraduationCap, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  EyeOff,
  Compass,
  KeyRound,
  ArrowRight
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
  const { login } = useAuth();
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
    <div className="w-full max-w-lg mx-auto my-4 sm:my-8 px-2 sm:px-4">
      
      {/* Editorial Header */}
      <div className="text-center mb-6 sm:mb-8 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          Sign In
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-sm mx-auto font-sans">
          Sign in to your account to view attendance and classes.
        </p>
      </div>

      {/* Main Plate Card */}
      <div className="relative bg-white/95 dark:bg-[#111318]/95 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-9 shadow-xl shadow-stone-900/5 dark:shadow-black/40 backdrop-blur-sm folio-card">
        
        {/* Corner Marks */}
        <div className="absolute top-3 left-3 text-[9px] font-mono text-stone-400 select-none">+</div>
        <div className="absolute top-3 right-3 text-[9px] font-mono text-stone-400 select-none">+</div>
        <div className="absolute bottom-3 left-3 text-[9px] font-mono text-stone-400 select-none">+</div>
        <div className="absolute bottom-3 right-3 text-[9px] font-mono text-stone-400 select-none">+</div>

        {/* Role Switch */}
        <div className="mb-7 bg-stone-100/90 dark:bg-stone-900/90 p-1.5 rounded-2xl border border-stone-200/90 dark:border-stone-800 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onRoleChange('student')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-heading font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              !isTeacher
                ? 'bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 shadow-md shadow-amber-500/10'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-200'
            }`}
          >
            <GraduationCap className="h-4 w-4 shrink-0" />
            <span className="tracking-wide">Student</span>
          </button>
          
          <button
            type="button"
            onClick={() => onRoleChange('teacher')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-heading font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              isTeacher
                ? 'bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 shadow-md shadow-amber-500/10'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-200'
            }`}
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="tracking-wide">Teacher</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-start space-x-3">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-600" />
            <div className="leading-relaxed font-sans">{error}</div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* User Code Field (ID) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              {isTeacher ? 'Teacher ID' : 'Student ID'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                id="login-user-code-input"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder={isTeacher ? 'e.g. T-2001' : 'e.g. S-10045'}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-[#0A0B0E] text-stone-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono tracking-wide"
              />
            </div>
            <p className="mt-1 text-[11px] text-stone-400">
              Enter your assigned ID code.
            </p>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                id="login-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-[#0A0B0E] text-stone-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            id="login-submit-btn"
            className="w-full py-3.5 px-5 rounded-2xl bg-stone-900 hover:bg-stone-800 dark:bg-gradient-to-r dark:from-amber-500 dark:to-amber-600 dark:hover:from-amber-400 dark:hover:to-amber-500 text-white dark:text-stone-950 font-heading font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-stone-900/10 dark:shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-stone-950/30 dark:border-t-stone-950 rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </button>

        </form>

        {/* Switch to Register */}
        <div className="mt-8 pt-5 border-t border-stone-200 dark:border-stone-800 text-center">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              id="switch-to-register-btn"
              className="font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
            >
              Register here →
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
