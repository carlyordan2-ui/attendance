import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Subject, 
  Enrollment, 
  AttendanceRecord, 
  AttendanceStatus 
} from '../../types';
import { 
  recordAttendance, 
  subscribeStudentAttendance, 
  subscribeStudentEnrollments, 
  subscribeSubjects 
} from '../../services/attendanceService';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  BookOpen, 
  MapPin, 
  Send, 
  Info,
  Video,
  KeyRound,
  ShieldCheck,
  Lock,
  FileCheck2,
  X
} from 'lucide-react';

export const DailyCheckInTab: React.FC = () => {
  const { userProfile, showToast } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  
  // Modal state for checking in
  const [selectedSubjectForCheckIn, setSelectedSubjectForCheckIn] = useState<Subject | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<AttendanceStatus>('present');
  const [enteredPin, setEnteredPin] = useState('');
  const [checkInNote, setCheckInNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  useEffect(() => {
    if (!userProfile) return;

    const unSubEnr = subscribeStudentEnrollments(userProfile.uid, (enrs) => {
      setEnrollments(enrs.filter(e => e.status === 'approved'));
    });

    const unSubSub = subscribeSubjects(setSubjects);
    const unSubAtt = subscribeStudentAttendance(userProfile.uid, setAttendanceRecords);

    return () => {
      unSubEnr();
      unSubSub();
      unSubAtt();
    };
  }, [userProfile]);

  // Enrolled Subject Objects
  const enrolledSubjectIds = enrollments.map(e => e.subjectId);
  const myEnrolledSubjects = subjects.filter(s => enrolledSubjectIds.includes(s.id));

  // Get Today's attendance record for a subject
  const getTodayRecordForSubject = (subjectId: string): AttendanceRecord | undefined => {
    return attendanceRecords.find(r => r.subjectId === subjectId && r.date === todayStr);
  };

  const handleOpenCheckIn = (subj: Subject) => {
    setSelectedSubjectForCheckIn(subj);
    setCheckInStatus('present');
    setEnteredPin('');
    setCheckInNote('');
  };

  const handleConfirmCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !selectedSubjectForCheckIn) return;

    // PIN Verification enforcement: If teacher opened a live session, student MUST match PIN
    if (selectedSubjectForCheckIn.isSessionOpen) {
      const activePin = selectedSubjectForCheckIn.activeSessionCode?.trim();
      const cleanEntered = enteredPin.trim();

      if (!cleanEntered) {
        showToast('Please enter the 4-digit class PIN displayed by your instructor.', 'error');
        return;
      }

      if (activePin && cleanEntered !== activePin) {
        showToast('Invalid PIN. Please check the code projected on the classroom board.', 'error');
        return;
      }
    } else {
      // If instructor requires in-person PIN and session is NOT open
      showToast('Attendance is locked by instructor. Please ask your instructor to open the live session PIN.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await recordAttendance(
        { uid: userProfile.uid, name: userProfile.name, userCode: userProfile.userCode },
        { id: selectedSubjectForCheckIn.id, code: selectedSubjectForCheckIn.code, name: selectedSubjectForCheckIn.name },
        todayStr,
        checkInStatus,
        checkInNote,
        'student',
        { uid: userProfile.uid, name: userProfile.name },
        true // Live PIN verified
      );

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore if canvas confetti restricted
      }

      showToast(`Verified check-in as '${checkInStatus.toUpperCase()}' for ${selectedSubjectForCheckIn.name}!`, 'success');
      setSelectedSubjectForCheckIn(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to check in.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Atelier Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white/90 dark:bg-[#111318]/90 border border-stone-200 dark:border-stone-800 shadow-sm folio-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold border border-amber-500/20 mb-2">
            <span>Verified Attendance Session</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Class Attendance Check-In
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5 font-sans">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 shrink-0 flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="font-mono font-bold">{todayStr}</span>
        </div>
      </div>

      {/* Enrolled Subjects Check-in Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-heading font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-amber-600" />
            <span>My Enrolled Classes ({myEnrolledSubjects.length})</span>
          </h3>
          <span className="text-xs text-stone-500 font-mono">
            Requires live classroom PIN verification
          </span>
        </div>

        {myEnrolledSubjects.length === 0 ? (
          <div className="bg-white dark:bg-[#111318] border border-stone-200 dark:border-stone-800 rounded-3xl p-8 text-center text-stone-500 space-y-3 folio-card">
            <Info className="h-10 w-10 mx-auto text-amber-500" />
            <p className="font-heading font-bold text-stone-900 dark:text-stone-100 text-sm">
              No Approved Subject Enrollments
            </p>
            <p className="text-xs max-w-md mx-auto">
              Please visit the <strong>"Enroll in Subjects"</strong> tab to join classes.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {myEnrolledSubjects.map((subj) => {
              const todayRecord = getTodayRecordForSubject(subj.id);
              const isOpen = subj.isSessionOpen;

              return (
                <div 
                  key={subj.id}
                  className="bg-white/95 dark:bg-[#111318]/95 border border-stone-200 dark:border-stone-800 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 folio-card"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold font-mono border border-stone-200 dark:border-stone-700">
                        {subj.code}
                      </span>
                      
                      {todayRecord ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${
                          todayRecord.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : todayRecord.status === 'late'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : todayRecord.status === 'excused'
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                        }`}>
                          {todayRecord.status === 'present' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          ) : todayRecord.status === 'excused' ? (
                            <FileCheck2 className="h-3.5 w-3.5 mr-1" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 mr-1" />
                          )}
                          <span className="uppercase">{todayRecord.status}</span>
                        </span>
                      ) : isOpen ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1" />
                          <span>Session Active</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 text-xs font-bold flex items-center space-x-1">
                          <Lock className="h-3 w-3 mr-1" />
                          <span>Session Locked</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-display font-bold text-stone-900 dark:text-stone-100">
                      {subj.name}
                    </h4>

                    <div className="text-xs text-stone-500 dark:text-stone-400 space-y-1 font-sans">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3.5 w-3.5 text-stone-400" />
                        <span>{subj.schedule}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3.5 w-3.5 text-stone-400" />
                        <span>{subj.room} • Faculty: {subj.teacherName}</span>
                      </div>

                      {subj.meetUrl && (
                        <div className="pt-1">
                          <a
                            href={subj.meetUrl.startsWith('http') ? subj.meetUrl : `https://${subj.meetUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white font-bold text-xs transition-colors"
                          >
                            <Video className="h-3.5 w-3.5 text-amber-400" />
                            <span>Join Video Call</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Today Status or Action Button */}
                  {todayRecord ? (
                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/60 rounded-2xl p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-stone-500">Recorded:</span>
                        <span className="text-stone-900 dark:text-stone-100 font-mono">
                          {new Date(todayRecord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {todayRecord.sessionCodeVerified && ' (PIN Verified)'}
                        </span>
                      </div>
                      {todayRecord.note && (
                        <p className="text-stone-600 dark:text-stone-400 italic text-[11px] pt-1">
                          "{todayRecord.note}"
                        </p>
                      )}
                    </div>
                  ) : isOpen ? (
                    <button
                      onClick={() => handleOpenCheckIn(subj)}
                      id={`checkin-btn-${subj.code}`}
                      className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                    >
                      <KeyRound className="h-4 w-4" />
                      <span>Enter Class PIN to Check In</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-center">
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        Check-in locked. Instructor has not yet opened a live classroom session PIN.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Check-In Modal with PIN Verification */}
      {selectedSubjectForCheckIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#16181e] border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 folio-card">
            
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-amber-600">
                  {selectedSubjectForCheckIn.code}
                </span>
                <h3 className="text-lg font-display font-bold text-stone-900 dark:text-stone-100">
                  {selectedSubjectForCheckIn.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedSubjectForCheckIn(null)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCheckIn} className="space-y-4">
              
              {/* Classroom PIN Input */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <label className="block text-xs font-heading font-bold text-stone-900 dark:text-stone-100">
                  4-Digit Classroom PIN
                </label>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 font-sans">
                  Enter the code displayed on the board by your teacher:
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder="e.g. 4829"
                  autoFocus
                  required
                  className="w-full text-center tracking-widest text-2xl font-mono font-black py-2.5 rounded-xl border border-amber-500/40 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                />
              </div>

              {/* Status selection */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                  My Attendance Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckInStatus('present')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-heading font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      checkInStatus === 'present'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Present (On-Time)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckInStatus('late')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-heading font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      checkInStatus === 'late'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>Late</span>
                  </button>
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-xs font-heading font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Optional Note
                </label>
                <input
                  type="text"
                  value={checkInNote}
                  onChange={(e) => setCheckInNote(e.target.value)}
                  placeholder="e.g. In 2nd row, left side"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedSubjectForCheckIn(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="confirm-checkin-btn"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Verify & Check In</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
