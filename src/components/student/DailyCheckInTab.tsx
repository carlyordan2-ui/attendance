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
  Sparkles,
  Info
} from 'lucide-react';

export const DailyCheckInTab: React.FC = () => {
  const { userProfile, showToast } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  
  // Modal state for checking in
  const [selectedSubjectForCheckIn, setSelectedSubjectForCheckIn] = useState<Subject | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<AttendanceStatus>('present');
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
    setCheckInNote('');
  };

  const handleConfirmCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !selectedSubjectForCheckIn) return;

    setIsSubmitting(true);
    try {
      await recordAttendance(
        { uid: userProfile.uid, name: userProfile.name, userCode: userProfile.userCode },
        { id: selectedSubjectForCheckIn.id, code: selectedSubjectForCheckIn.code, name: selectedSubjectForCheckIn.name },
        todayStr,
        checkInStatus,
        checkInNote,
        'student',
        { uid: userProfile.uid, name: userProfile.name }
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

      showToast(`Successfully checked in as '${checkInStatus.toUpperCase()}' for ${selectedSubjectForCheckIn.name}!`, 'success');
      setSelectedSubjectForCheckIn(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to check in.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Today's Attendance Window</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Class Attendance Check-In
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 mt-1">
            Today is <strong>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs text-indigo-100 shrink-0 flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-indigo-300" />
          <span className="font-mono font-bold text-white">{todayStr}</span>
        </div>
      </div>

      {/* Enrolled Subjects Check-in Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>My Enrolled Subjects ({myEnrolledSubjects.length})</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            One check-in permitted per subject per day
          </span>
        </div>

        {myEnrolledSubjects.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <Info className="h-10 w-10 mx-auto text-indigo-500" />
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              No Approved Subject Enrollments Yet
            </p>
            <p className="text-xs max-w-md mx-auto">
              Please switch to the <strong>"Enroll in Subjects"</strong> tab to apply for class subjects taught by Faculty Teachers.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {myEnrolledSubjects.map((subj) => {
              const todayRecord = getTodayRecordForSubject(subj.id);

              return (
                <div 
                  key={subj.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold font-mono border border-indigo-200 dark:border-indigo-800/50">
                        {subj.code}
                      </span>
                      {todayRecord ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${
                          todayRecord.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : todayRecord.status === 'late'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                        }`}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          <span className="uppercase">{todayRecord.status}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                          Not Checked In
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      {subj.name}
                    </h4>

                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3.5 w-3.5 text-indigo-500" />
                        <span>{subj.schedule}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{subj.room} • Faculty: {subj.teacherName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Today Status or Action Button */}
                  {todayRecord ? (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-slate-500">Check-in Recorded:</span>
                        <span className="text-slate-900 dark:text-white font-mono">
                          {new Date(todayRecord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {todayRecord.note && (
                        <p className="text-slate-600 dark:text-slate-400 italic text-[11px] pt-1">
                          "{todayRecord.note}"
                        </p>
                      )}
                      <button
                        onClick={() => handleOpenCheckIn(subj)}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline mt-1 block"
                      >
                        Update Check-in Note or Status
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenCheckIn(subj)}
                      id={`checkin-btn-${subj.code}`}
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Check In for Today</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Check-In Modal */}
      {selectedSubjectForCheckIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedSubjectForCheckIn.code}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Check In: {selectedSubjectForCheckIn.name}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedSubjectForCheckIn(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmCheckIn} className="space-y-4">
              
              {/* Select Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  My Attendance Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckInStatus('present')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                      checkInStatus === 'present'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Present (On Time)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckInStatus('late')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                      checkInStatus === 'late'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>Late</span>
                  </button>
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Optional Note / Reason
                </label>
                <input
                  type="text"
                  value={checkInNote}
                  onChange={(e) => setCheckInNote(e.target.value)}
                  placeholder="e.g., Traffic delay, submitted homework sheet"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSubjectForCheckIn(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="confirm-checkin-btn"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Check-In</span>
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
