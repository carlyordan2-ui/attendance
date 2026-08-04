import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { 
  Lock, 
  User, 
  UserPlus, 
  GraduationCap, 
  UserCheck, 
  AlertCircle,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

interface RegisterFormProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSwitchToLogin: () => void;
}

const DEFAULT_SUBJECT_OPTIONS = [
  'Mathematics',
  'Science & Technology',
  'Computer Science',
  'English & Literature',
  'History & Civics',
  'Web Development',
  'Physics & Engineering'
];

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  role,
  onRoleChange,
  onSwitchToLogin
}) => {
  const { register } = useAuth();
  const [userCode, setUserCode] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [departmentOrLocation, setDepartmentOrLocation] = useState('Main Campus');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics']);
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTeacher = role === 'teacher';

  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [subjectOptions, setSubjectOptions] = useState<string[]>(DEFAULT_SUBJECT_OPTIONS);

  const handleAddCustomSubject = () => {
    const trimmed = customSubjectInput.trim();
    if (!trimmed) return;
    if (!subjectOptions.includes(trimmed)) {
      setSubjectOptions([...subjectOptions, trimmed]);
    }
    if (!selectedSubjects.includes(trimmed)) {
      setSelectedSubjects([...selectedSubjects, trimmed]);
    }
    setCustomSubjectInput('');
  };

  const toggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        userCode,
        name,
        password,
        role,
        departmentOrLocation,
        contactEmail,
        subjectsTaught: isTeacher ? selectedSubjects : []
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto my-2 sm:my-6 px-1 sm:px-4">
      
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6 space-y-1">
        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create an Account
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
          Apply for a student or teacher profile on AttendEase
        </p>
      </div>

      {/* Form Card */}
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
            <span>Student Registration</span>
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
            <span>Teacher Registration</span>
          </button>
        </div>

        {/* Info Box about Teacher Approval */}
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs flex items-start space-x-2.5">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
          <div className="leading-relaxed">
            <strong>Approval Notice:</strong> Self-registered {role}s start in <em>Pending Approval</em> status until verified by a Faculty Teacher.
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-rose-600" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* User ID Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              {isTeacher ? 'Teacher ID' : 'Student ID'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                id="register-user-code-input"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder={isTeacher ? 'e.g. T-2001' : 'e.g. S-10045'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              id="register-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marcus Vance"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                id="register-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Contact Email (Optional) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Contact Email <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                id="register-contact-email-input"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. user@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Department or Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              {isTeacher ? 'Department / Building' : 'Grade Level / Section'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="h-4 w-4" />
              </div>
              <input
                type="text"
                id="register-dept-input"
                value={departmentOrLocation}
                onChange={(e) => setDepartmentOrLocation(e.target.value)}
                placeholder={isTeacher ? 'e.g. Science Building - Room 302' : 'e.g. Year 10 - Section A'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* If Teacher: Subjects Taught */}
          {isTeacher && (
            <div className="pt-1 space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Subjects You Teach <span className="text-rose-500">*</span>
              </label>

              {/* Type Custom Subject Input Box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  id="register-custom-subject-input"
                  value={customSubjectInput}
                  onChange={(e) => setCustomSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSubject();
                    }
                  }}
                  placeholder="Type a subject name (e.g. Biology, AP History)..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSubject}
                  id="add-custom-subject-btn"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 transition-colors shadow-sm"
                >
                  + Add Subject
                </button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Type your subject above or click to select from popular subjects:
              </p>

              <div className="flex flex-wrap gap-1.5">
                {subjectOptions.map((sub) => {
                  const isSel = selectedSubjects.includes(sub);
                  return (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => toggleSubject(sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border ${
                        isSel
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isSel && <CheckCircle2 className="h-3 w-3 mr-1 shrink-0" />}
                      <span>{sub}</span>
                    </button>
                  );
                })}
              </div>

              {selectedSubjects.length === 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  Please type or select at least one subject.
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            id="register-submit-btn"
            className="w-full py-3 px-4 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Submit {isTeacher ? 'Teacher' : 'Student'} Registration</span>
              </>
            )}
          </button>

        </form>

        {/* Switch to Login */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              id="switch-to-login-btn"
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign In to Your Account
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

