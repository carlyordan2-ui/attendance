import React, { useState, useEffect } from 'react';
import { UserProfile, Enrollment } from '../../types';
import { 
  subscribePendingUsers, 
  approveUserAccount, 
  rejectUserAccount,
  subscribeAllEnrollments, 
  processEnrollment 
} from '../../services/attendanceService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Clock, 
  BookOpen, 
  GraduationCap, 
  AlertCircle,
  Search,
  CheckCircle2,
  XCircle,
  Users
} from 'lucide-react';
import { AvatarDisplay } from '../common/AvatarDisplay';

export const PendingApprovalsTab: React.FC = () => {
  const { userProfile, showToast } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'enrollments'>('accounts');
  
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [pendingEnrollments, setPendingEnrollments] = useState<Enrollment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Reject modal state
  const [rejectModalData, setRejectModalData] = useState<{
    type: 'user' | 'enrollment';
    id: string;
    name: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const unSubUsers = subscribePendingUsers(setPendingUsers);
    const unSubEnr = subscribeAllEnrollments((allEnrs) => {
      setPendingEnrollments(allEnrs.filter(e => e.status === 'pending'));
    });

    return () => {
      unSubUsers();
      unSubEnr();
    };
  }, []);

  const handleApproveUser = async (targetUser: UserProfile) => {
    if (!userProfile) return;
    setProcessingId(targetUser.uid);
    try {
      await approveUserAccount(targetUser.uid, userProfile.name, userProfile.uid);
      showToast(`Account approved for ${targetUser.name} (${targetUser.userCode})`, 'success');
    } catch (err: any) {
      showToast(`Failed to approve: ${err.message}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalData || !userProfile) return;
    setProcessingId(rejectModalData.id);

    try {
      if (rejectModalData.type === 'user') {
        await rejectUserAccount(rejectModalData.id, userProfile.name, rejectReason);
        showToast(`Rejected registration for ${rejectModalData.name}`, 'info');
      } else {
        await processEnrollment(rejectModalData.id, 'rejected', userProfile.name);
        showToast(`Declined course enrollment for ${rejectModalData.name}`, 'info');
      }
      setRejectModalData(null);
      setRejectReason('');
    } catch (err: any) {
      showToast(`Failed to process rejection: ${err.message}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveEnrollment = async (enrollment: Enrollment) => {
    if (!userProfile) return;
    setProcessingId(enrollment.id);
    try {
      await processEnrollment(enrollment.id, 'approved', userProfile.name);
      showToast(`Approved enrollment for ${enrollment.studentName} in ${enrollment.subjectCode}`, 'success');
    } catch (err: any) {
      showToast(`Failed to approve enrollment: ${err.message}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = pendingUsers.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.userCode.toLowerCase().includes(q) ||
      u.departmentOrLocation.toLowerCase().includes(q)
    );
  });

  const filteredEnrollments = pendingEnrollments.filter(e => {
    const q = searchQuery.toLowerCase();
    return (
      e.studentName.toLowerCase().includes(q) ||
      e.studentUserCode.toLowerCase().includes(q) ||
      e.subjectCode.toLowerCase().includes(q) ||
      e.subjectName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white/90 dark:bg-[#111318]/90 border border-stone-200 dark:border-stone-800 shadow-sm folio-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <ShieldCheck className="h-6 w-6 stroke-[1.75]" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-stone-900 dark:text-stone-100">
              Pending Approvals
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
              Review and approve user accounts and course enrollments.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <button
            onClick={() => setActiveSubTab('accounts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'accounts'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs border border-stone-200/80 dark:border-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Accounts</span>
            {pendingUsers.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 text-[10px] font-mono font-bold">
                {pendingUsers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('enrollments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'enrollments'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs border border-stone-200/80 dark:border-stone-700'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Enrollments</span>
            {pendingEnrollments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 text-[10px] font-mono font-bold">
                {pendingEnrollments.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-stone-400" />
        <input
          type="text"
          placeholder={activeSubTab === 'accounts' ? "Search candidate name, ID code, or division..." : "Search student name, ID, or course code..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-[#111318]/90 border border-stone-200 dark:border-stone-800 rounded-2xl text-xs font-sans text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
        />
      </div>

      {/* Sub-Tab 1: Account Requests */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/90 dark:bg-[#111318]/90 border border-stone-200 dark:border-stone-800 space-y-2 folio-card">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto opacity-70" />
              <h3 className="font-heading font-bold text-sm text-stone-900 dark:text-stone-100">
                All account registration dossiers processed
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                No new candidates are currently awaiting endorsement at this time.
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.uid}
                className="p-5 rounded-3xl bg-white/95 dark:bg-[#111318]/95 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-stone-300 dark:hover:border-stone-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 folio-card"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <AvatarDisplay name={user.name} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-heading font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                        {user.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono font-bold text-[10px] border border-stone-200 dark:border-stone-700">
                        {user.userCode}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        {user.role}
                      </span>
                    </div>

                    <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{user.email}</span>
                      <span>•</span>
                      <span>{user.departmentOrLocation}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px] text-stone-400 flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Submitted {new Date(user.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setRejectModalData({ type: 'user', id: user.uid, name: `${user.name} (${user.userCode})` })}
                    disabled={processingId === user.uid}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 text-xs font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    <span>Decline</span>
                  </button>

                  <button
                    onClick={() => handleApproveUser(user)}
                    disabled={processingId === user.uid}
                    className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>{processingId === user.uid ? 'Saving...' : 'Approve'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sub-Tab 2: Course Enrollments */}
      {activeSubTab === 'enrollments' && (
        <div className="space-y-3">
          {filteredEnrollments.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/90 dark:bg-[#111318]/90 border border-stone-200 dark:border-stone-800 space-y-2 folio-card">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto opacity-70" />
              <h3 className="font-heading font-bold text-sm text-stone-900 dark:text-stone-100">
                No pending course enrollments
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                All subject enrollment petitions are fully reviewed.
              </p>
            </div>
          ) : (
            filteredEnrollments.map((enr) => (
              <div
                key={enr.id}
                className="p-5 rounded-3xl bg-white/95 dark:bg-[#111318]/95 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-stone-300 dark:hover:border-stone-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 folio-card"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <AvatarDisplay name={enr.studentName} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-heading font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                        {enr.studentName}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono font-bold text-[10px] border border-stone-200 dark:border-stone-700">
                        {enr.studentUserCode}
                      </span>
                    </div>

                    <div className="text-xs text-amber-700 dark:text-amber-400 font-mono mt-1 flex items-center space-x-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{enr.subjectCode} — {enr.subjectName}</span>
                    </div>
                    <div className="text-[11px] font-mono text-stone-400 mt-0.5 flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Lodged {new Date(enr.requestedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setRejectModalData({ type: 'enrollment', id: enr.id, name: `${enr.studentName} (${enr.subjectCode})` })}
                    disabled={processingId === enr.id}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 text-xs font-heading font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Decline</span>
                  </button>

                  <button
                    onClick={() => handleApproveEnrollment(enr)}
                    disabled={processingId === enr.id}
                    className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 text-xs font-heading font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{processingId === enr.id ? 'Saving...' : 'Approve'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#111318] border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 folio-card">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertCircle className="h-6 w-6" />
              <h3 className="font-heading font-bold text-base text-stone-900 dark:text-white">
                Decline Request
              </h3>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Are you sure you want to decline {rejectModalData.type === 'user' ? 'registration' : 'enrollment'} for <strong>{rejectModalData.name}</strong>?
            </p>

            {rejectModalData.type === 'user' && (
              <div>
                <label className="block text-xs font-heading font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Reason (Optional)
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Optional reason..."
                  className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                />
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setRejectModalData(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-heading font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!!processingId}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
