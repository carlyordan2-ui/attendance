import React, { useState, useEffect } from 'react';
import { Subject, Enrollment, AttendanceRecord, UserProfile } from '../../types';
import { 
  subscribeSubjects, 
  subscribeAllEnrollments, 
  subscribeAllAttendance, 
  subscribeAllUsers 
} from '../../services/attendanceService';
import { 
  Users, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  BarChart2, 
  GraduationCap 
} from 'lucide-react';

export const RosterAndStatsTab: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  useEffect(() => {
    const unSubSub = subscribeSubjects((subs) => {
      setSubjects(subs);
      if (subs.length > 0 && selectedSubjectId === 'all') {
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
  const enrolledStudentsForSubject = enrollments
    .filter(e => e.subjectId === currentSubject?.id)
    .map(e => {
      const profile = allUsers.find(u => u.uid === e.studentId);
      return {
        studentId: e.studentId,
        studentName: e.studentName,
        studentUserCode: e.studentUserCode,
        location: profile?.departmentOrLocation || 'Main Campus',
        email: profile?.email || ''
      };
    });

  // Helper to calculate student stats in subject
  const getStudentSubjectStats = (studentId: string, subjectId: string) => {
    const recs = attendanceRecords.filter(r => r.studentId === studentId && r.subjectId === subjectId);
    const total = recs.length;
    const present = recs.filter(r => r.status === 'present').length;
    const late = recs.filter(r => r.status === 'late').length;
    const absent = recs.filter(r => r.status === 'absent').length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

    return { total, present, late, absent, percentage };
  };

  // Average subject attendance %
  const totalRosterCount = enrolledStudentsForSubject.length;
  const avgAttendancePct = totalRosterCount > 0
    ? Math.round(
        enrolledStudentsForSubject.reduce((acc, st) => {
          return acc + getStudentSubjectStats(st.studentId, currentSubject?.id || '').percentage;
        }, 0) / totalRosterCount
      )
    : 100;

  return (
    <div className="space-y-6">
      
      {/* Header & Subject Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <span>Subject Class Roster & Attendance Stats</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live student roster and attendance percentage breakdowns
            </p>
          </div>

          {/* Dropdown */}
          <div className="w-full sm:w-72">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Subject Info Card */}
        {currentSubject && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                {currentSubject.code} • {currentSubject.name}
              </span>
              <p className="text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">
                Schedule: {currentSubject.schedule} | Room: {currentSubject.room} | Faculty: {currentSubject.teacherName}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 uppercase font-bold block">Enrolled Students</span>
                <span className="text-xl font-black text-emerald-900 dark:text-emerald-100">{totalRosterCount}</span>
              </div>
              <div className="text-right pl-4 border-l border-emerald-200 dark:border-emerald-900">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 uppercase font-bold block">Average Attendance</span>
                <span className="text-xl font-black text-emerald-900 dark:text-emerald-100">{avgAttendancePct}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Roster Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Student ID & Name</th>
                <th className="px-6 py-4">Location / Section</th>
                <th className="px-6 py-4">Attendance Rate (%)</th>
                <th className="px-6 py-4">Present</th>
                <th className="px-6 py-4">Late</th>
                <th className="px-6 py-4">Absent</th>
                <th className="px-6 py-4">Total Sessions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {enrolledStudentsForSubject.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No students currently enrolled in this subject.
                  </td>
                </tr>
              ) : (
                enrolledStudentsForSubject.map((st) => {
                  const stats = getStudentSubjectStats(st.studentId, currentSubject?.id || '');

                  return (
                    <tr key={st.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* Name & ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {st.studentName}
                        </div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                          ID: {st.studentUserCode}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {st.location}
                      </td>

                      {/* Attendance % */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`font-black text-sm ${
                            stats.percentage >= 85 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {stats.percentage}%
                          </span>
                          <div className="w-16 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${stats.percentage >= 85 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                              style={{ width: `${stats.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Counts */}
                      <td className="px-6 py-4 whitespace-nowrap text-emerald-600 font-bold">
                        {stats.present}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-amber-600 font-bold">
                        {stats.late}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-rose-600 font-bold">
                        {stats.absent}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-500">
                        {stats.total}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
