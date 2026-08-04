import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfile, Enrollment } from '../../types';
import { 
  subscribePendingUsers, 
  subscribeAllEnrollments, 
  approveUserAccount, 
  rejectUserAccount, 
  processEnrollment 
} from '../../services/attendanceService';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  GraduationCap, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export const PendingApprovalsTab: React.FC = () => {
  const { userProfile, showToast } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [pendingEnrollments, setPendingEnrollments] = useState<Enrollment[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const unSubUsers = subscribePendingUsers(setPendingUsers);
    const unSubEnr = subscribeAllEnrollments((enrs) => {
      setPendingEnrollments(enrs.filter(e => e.status === 'pending'));
    });

    return () => {
      unSubUsers();
      unSubEnr();
    };
  }, []);

  const handleApproveAccount = async (targetUser: UserProfile) => {
    if (!userProfile) return;
    setProcessingId(targetUser.uid);

    try {
      await approveUserAccount(targetUser.uid, userProfile.name, userProfile.uid);
      showToast(`Approved account for ${targetUser.name} (${targetUser.role.toUpperCase()})!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to approve account.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectAccount = async (targetUser: UserProfile) => {
    if (!userProfile) return;
    const reason = prompt(`Enter rejection reason for ${targetUser.name}:`) || 'Not approved by school administration.';
    setProcessingId(targetUser.uid);

    try {
      await rejectUserAccount(targetUser.uid, userProfile.name, reason);
      showToast(`Rejected account for ${targetUser.name}.`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to reject account.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleProcessEnrollmentAction = async (enrollment: Enrollment, status: 'approved' | 'rejected') => {
    if (!userProfile) return;
    setProcessingId(enrollment.id);

    try {
      await processEnrollment(enrollment.id, status, userProfile.name);
      showToast(`Enrollment request for ${enrollment.studentName} set to ${status.toUpperCase()}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update enrollment.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Account Approval Section */}
      <div className="soft-card p-6 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d9e0cf] dark:border-[#313a26] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-6 w-6 text-[#5a6344] dark:text-[#b2c098]" />
              <h3 className="text-xl font-serif font-bold text-[#2d3321] dark:text-[#e5eadc]">
                Pending Account Registrations
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#e9eee0] dark:bg-[#2a3320] text-[#5a6344] dark:text-[#b2c098] font-mono font-bold text-xs border border-[#d9e0cf] dark:border-[#313a26]">
                {pendingUsers.length}
              </span>
            </div>
            <p className="text-xs text-[#5a6344]/80 dark:text-[#a3b088]/80 mt-1">
              New Teachers and Students awaiting Faculty verification before full access is granted
            </p>
          </div>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#5a6344]/80 bg-[#f7f8f3] dark:bg-[#151910] rounded-2xl border border-[#d9e0cf] dark:border-[#313a26]">
            <CheckCircle2 className="h-8 w-8 mx-auto text-[#5a6344] mb-2" />
            <p className="font-bold text-[#2d3321] dark:text-[#e5eadc]">All Account Requests Handled</p>
            <p className="text-[11px] mt-1">There are no pending user account registrations at this time.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {pendingUsers.map((usr) => (
              <div 
                key={usr.uid}
                className="p-5 rounded-2xl bg-[#f7f8f3] dark:bg-[#151910] border border-[#d9e0cf] dark:border-[#313a26] space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#5a6344]/70">
                      ID: {usr.userCode}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#e9eee0] dark:bg-[#2a3320] text-[#5a6344] dark:text-[#b2c098] border border-[#d9e0cf] dark:border-[#313a26]">
                      {usr.role}
                    </span>
                  </div>

                  <h4 className="text-lg font-serif font-bold text-[#2d3321] dark:text-[#e5eadc]">
                    {usr.name}
                  </h4>

                  <div className="text-xs text-[#5a6344]/80 space-y-1">
                    <p>Department / Location: <strong className="text-[#2d3321] dark:text-[#e5eadc]">{usr.departmentOrLocation}</strong></p>
                    <p>Contact Email: <strong className="text-[#2d3321] dark:text-[#e5eadc]">{usr.email}</strong></p>
                    {usr.subjectsTaught && usr.subjectsTaught.length > 0 && (
                      <p>Subjects Taught: <strong className="text-[#2d3321] dark:text-[#e5eadc]">{usr.subjectsTaught.join(', ')}</strong></p>
                    )}
                    <p className="text-[11px] text-[#5a6344]/60">Registered on: {new Date(usr.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-[#d9e0cf] dark:border-[#313a26]">
                  <button
                    onClick={() => handleApproveAccount(usr)}
                    disabled={processingId === usr.uid}
                    id={`approve-user-btn-${usr.userCode}`}
                    className="flex-1 py-2.5 px-3 rounded-full bg-[#5a6344] hover:bg-[#4a5238] text-white font-bold text-xs shadow-md shadow-[#5a6344]/20 flex items-center justify-center space-x-1 transition-all"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => handleRejectAccount(usr)}
                    disabled={processingId === usr.uid}
                    id={`reject-user-btn-${usr.userCode}`}
                    className="py-2.5 px-3 rounded-full bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300 font-bold text-xs flex items-center justify-center space-x-1 transition-all"
                  >
                    <UserX className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 2. Subject Enrollment Approval Section */}
      <div className="soft-card p-6 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d9e0cf] dark:border-[#313a26] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-[#5a6344] dark:text-[#b2c098]" />
              <h3 className="text-xl font-serif font-bold text-[#2d3321] dark:text-[#e5eadc]">
                Pending Subject Enrollments
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#e9eee0] dark:bg-[#2a3320] text-[#5a6344] dark:text-[#b2c098] font-mono font-bold text-xs border border-[#d9e0cf] dark:border-[#313a26]">
                {pendingEnrollments.length}
              </span>
            </div>
            <p className="text-xs text-[#5a6344]/80 dark:text-[#a3b088]/80 mt-1">
              Students applying to join class subjects
            </p>
          </div>
        </div>

        {pendingEnrollments.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#5a6344]/80 bg-[#f7f8f3] dark:bg-[#151910] rounded-2xl border border-[#d9e0cf] dark:border-[#313a26]">
            <CheckCircle2 className="h-8 w-8 mx-auto text-[#5a6344] mb-2" />
            <p className="font-bold text-[#2d3321] dark:text-[#e5eadc]">No Pending Subject Enrollment Requests</p>
          </div>
        ) : (
          <div className="divide-y divide-[#d9e0cf] dark:divide-[#313a26]">
            {pendingEnrollments.map((enr) => (
              <div 
                key={enr.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-[#e9eee0] dark:bg-[#2a3320] font-mono text-xs font-bold text-[#5a6344] dark:text-[#b2c098] border border-[#d9e0cf] dark:border-[#313a26]">
                      {enr.subjectCode}
                    </span>
                    <h4 className="font-serif font-bold text-[#2d3321] dark:text-[#e5eadc] text-sm">
                      {enr.subjectName}
                    </h4>
                  </div>
                  <p className="text-xs text-[#5a6344]/80 dark:text-[#a3b088]/80 mt-1">
                    Student: <strong className="text-[#2d3321] dark:text-[#e5eadc]">{enr.studentName}</strong> (ID: {enr.studentUserCode})
                  </p>
                  <p className="text-[10px] text-[#5a6344]/60 mt-0.5">
                    Requested on: {new Date(enr.requestedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleProcessEnrollmentAction(enr, 'approved')}
                    disabled={processingId === enr.id}
                    id={`approve-enrollment-btn-${enr.id}`}
                    className="py-2 px-3 rounded-full bg-[#5a6344] hover:bg-[#4a5238] text-white font-bold text-xs shadow-md shadow-[#5a6344]/20 flex items-center space-x-1"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Approve Enrollment</span>
                  </button>

                  <button
                    onClick={() => handleProcessEnrollmentAction(enr, 'rejected')}
                    disabled={processingId === enr.id}
                    id={`reject-enrollment-btn-${enr.id}`}
                    className="py-2 px-3 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-xs flex items-center space-x-1"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
