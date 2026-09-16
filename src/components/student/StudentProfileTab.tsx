import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../services/attendanceService';
import { AVATAR_PRESETS, getAvatarPreset } from '../../utils/avatars';
import { AvatarDisplay } from '../common/AvatarDisplay';
import { 
  User, 
  Mail, 
  MapPin, 
  Shield, 
  Save, 
  CheckCircle2, 
  Lock,
  GraduationCap,
  FileText
} from 'lucide-react';

export const StudentProfileTab: React.FC = () => {
  const { userProfile, showToast } = useAuth();

  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [departmentOrLocation, setDepartmentOrLocation] = useState(userProfile?.departmentOrLocation || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.avatar || 'grad');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!userProfile) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await updateUserProfile(userProfile.uid, {
        name: name.trim(),
        email: email.trim(),
        departmentOrLocation: departmentOrLocation.trim(),
        bio: bio.trim(),
        avatar: selectedAvatar
      });
      showToast('Profile and avatar updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Header with Live Avatar */}
        <div className="flex items-center space-x-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <AvatarDisplay avatarId={selectedAvatar} name={name} size="lg" />
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Student Profile Management
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalize your avatar, contact info, and academic presence
            </p>
          </div>
        </div>

        {/* Read-Only Identity Card */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800 pb-2">
            <span className="flex items-center">
              <Lock className="h-3.5 w-3.5 mr-1 text-slate-400" /> Immutable Student Credentials
            </span>
            <span className="text-[10px] uppercase text-indigo-600 dark:text-indigo-400 font-mono">
              Role: Student
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="min-w-0">
              <span className="text-[10px] uppercase text-slate-400 block">Student ID</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white break-all">{userProfile.userCode}</span>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase text-slate-400 block">System Role</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize">{userProfile.role}</span>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase text-slate-400 block">Account Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 capitalize">{userProfile.status}</span>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase text-slate-400 block">Approved By</span>
              <span className="text-slate-700 dark:text-slate-300 break-all">{userProfile.approvedBy || 'System'}</span>
            </div>
          </div>
        </div>

        {/* Editable Form */}
        <form onSubmit={handleSaveProfile} className="space-y-5">
          
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <span>Choose Your Avatar</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                {getAvatarPreset(selectedAvatar).label}
              </span>
            </label>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedAvatar === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedAvatar(preset.id)}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all relative ${
                      isSelected
                        ? 'ring-2 ring-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/80'
                        : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${preset.bgGradient} flex items-center justify-center text-xl shadow-xs`}>
                      {preset.emoji}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1 truncate max-w-full">
                      {preset.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[8px]">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Contact Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@cedric.edu"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Location / Grade */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Grade Level / Section / Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={departmentOrLocation}
                onChange={(e) => setDepartmentOrLocation(e.target.value)}
                placeholder="e.g. Year 10 - Section B"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Personal Bio / Academic Interests
            </label>
            <div className="relative">
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Aspiring software engineer interested in robotics and web development."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              id="save-student-profile-btn"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 transition-all"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
