import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Subject, Enrollment, AttendanceRecord, AttendanceStatus, UserProfile } from '../../types';
import { 
  subscribeSubjects, 
  subscribeAllEnrollments, 
  subscribeAllAttendance, 
  recordAttendance, 
  subscribeAllUsers 
} from '../../services/attendanceService';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Edit3, 
  Calendar, 
  Check, 
  Save, 
  Sparkles,
  Info 
} from 'lucide-react';

export const MarkAttendanceTab: React.FC = () => {
  const { userProfile, showToast } = useAuth();
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Pending edits per student: { [studentId]: { status: AttendanceStatus, note: string } }
  const [studentEdits, setStudentEdits] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unSubSub = subscribeSubjects((subs) => {
      setSubjects(subs);
      if (subs.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subs[0].id);
      }
    });

    const unSubEnr = subscribeAllEnrollments((enrs) => {
      setEnrollments(enrs.filter(e => e.status === 'approved'));
    });

    const unSubAtt = subscribeAllAttendance(setAttendanceRecords);
    const unSubUsers = subscribeAllUsers(setAllUsers);

    return () => {
      unSubSub();
      unSubEnr();
      unSubAtt();
      unSubUsers();
    };
  }, []);

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  // Get enrolled students for current selected subject
  const enrolledStudents = enrollments
    .filter(e => e.subjectId === currentSubject?.id)
    .map(e => {
      const u = allUsers.find(usr => usr.uid === e.studentId);
      return {
        uid: e.studentId,
        name: e.studentName,
        userCode: e.studentUserCode,
        location: u?.departmentOrLocation || 'Main Campus'
      };
    });

  // Get existing attendance record for a student on selectedDate
  const getExistingRecord = (studentId: string) => {
    return attendanceRecords.find(
      r => r.studentId === studentId && r.subjectId === currentSubject?.id && r.date === selectedDate
    );
  };

  // Get current status for student (from pending edits or existing record or default 'present')
  const getStudentStatus = (studentId: string): AttendanceStatus => {
    if (studentEdits[studentId]) return studentEdits[studentId].status;
    const existing = getExistingRecord(studentId);
    if (existing) return existing.status;
    return 'present';
  };

  const getStudentNote = (studentId: string): string => {
    if (studentEdits[studentId] !== undefined) return studentEdits[studentId].note;
    const existing = getExistingRecord(studentId);
    return existing?.note || '';
  };

  const setStudentStatusAndNote = (studentId: string, status: AttendanceStatus, note?: string) => {
    setStudentEdits(prev => ({
      ...prev,
      [studentId]: {
        status,
        note: note !== undefined ? note : (prev[studentId]?.note || getStudentNote(studentId))
      }
    }));
  };

  const handleMarkAllPresent = () => {
    const edits: Record<string, { status: AttendanceStatus; note: string }> = {};
    enrolledStudents.forEach(st => {
      edits[st.uid] = { status: 'present', note: getStudentNote(st.uid) };
    });
    setStudentEdits(edits);
    showToast('Marked all students as Present!', 'info');
  };

  const handleSaveAttendance = async () => {
    if (!userProfile || !currentSubject) return;

    setIsSaving(true);
    try {
      let count = 0;
      for (const st of enrolledStudents) {
        const status = getStudentStatus(st.uid);
        const note = getStudentNote(st.uid);

        await recordAttendance(
          { uid: st.uid, name: st.name, userCode: st.userCode },
          { id: currentSubject.id, code: currentSubject.code, name: currentSubject.name },
          selectedDate,
          status,
          note,
          'teacher',
          { uid: userProfile.uid, name: userProfile.name }
        );
        count++;
      }

      showToast(`Saved attendance for ${count} students for ${selectedDate}!`, 'success');
      setStudentEdits({});
    } catch (err: any) {
      showToast(err.message || 'Failed to save attendance.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Selection Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Edit3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <span>Mark & Override Attendance</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record daily attendance for enrolled students or override self check-in entries
            </p>
          </div>

          <button
            onClick={handleMarkAllPresent}
            id="mark-all-present-btn"
            className="px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Sparkles className="h-4 w-4" />
            <span>Mark All Present</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Select Subject */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Subject Class
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setStudentEdits({});
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setStudentEdits({});
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

      </div>

      {/* Roster Marking List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            Students Enrolled ({enrolledStudents.length})
          </span>
          <span className="text-[11px] text-slate-400">
            Date: <strong>{selectedDate}</strong>
          </span>
        </div>

        {enrolledStudents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 rounded-2xl">
            No enrolled students found for this subject.
          </div>
        ) : (
          <div className="space-y-3">
            {enrolledStudents.map((st) => {
              const currentStatus = getStudentStatus(st.uid);
              const currentNote = getStudentNote(st.uid);
              const existingRecord = getExistingRecord(st.uid);

              return (
                <div 
                  key={st.uid}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {st.name}
                      </h4>
                      <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                        ID: {st.userCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Location: {st.location}
                      {existingRecord && (
                        <span className="ml-2 italic text-emerald-600 dark:text-emerald-400">
                          (Previously logged: {existingRecord.status.toUpperCase()} by {existingRecord.markedByName})
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Status Toggle Buttons & Note Input */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    
                    {/* Status Buttons */}
                    <div className="flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1 space-x-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setStudentStatusAndNote(st.uid, 'present')}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition-all ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Present</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudentStatusAndNote(st.uid, 'late')}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition-all ${
                          currentStatus === 'late'
                            ? 'bg-amber-600 text-white shadow'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Late</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStudentStatusAndNote(st.uid, 'absent')}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition-all ${
                          currentStatus === 'absent'
                            ? 'bg-rose-600 text-white shadow'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Absent</span>
                      </button>
                    </div>

                    {/* Note input */}
                    <input
                      type="text"
                      value={currentNote}
                      onChange={(e) => setStudentStatusAndNote(st.uid, currentStatus, e.target.value)}
                      placeholder="Note (optional)"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs w-full sm:w-44 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Save Button Bar */}
        {enrolledStudents.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleSaveAttendance}
              disabled={isSaving}
              id="save-attendance-btn"
              className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition-all"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save All Class Attendance</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
