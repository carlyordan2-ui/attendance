import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AttendanceRecord, Subject } from '../../types';
import { subscribeStudentAttendance, subscribeSubjects } from '../../services/attendanceService';
import { 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  UserCheck, 
  BookOpen 
} from 'lucide-react';

export const AttendanceHistoryTab: React.FC = () => {
  const { userProfile } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filters
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchDate, setSearchDate] = useState<string>('');

  useEffect(() => {
    if (!userProfile) return;

    const unSubAtt = subscribeStudentAttendance(userProfile.uid, setRecords);
    const unSubSub = subscribeSubjects(setSubjects);

    return () => {
      unSubAtt();
      unSubSub();
    };
  }, [userProfile]);

  // Sort descending by timestamp
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Apply filters
  const filteredRecords = sortedRecords.filter((rec) => {
    if (selectedSubjectId !== 'all' && rec.subjectId !== selectedSubjectId) return false;
    if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
    if (searchDate && !rec.date.includes(searchDate)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span>Personal Attendance History</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete historical record of all class check-ins and teacher overrides
            </p>
          </div>

          <div className="text-xs text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl self-start md:self-auto">
            Total Records: <strong>{filteredRecords.length}</strong>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
          {/* Subject Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Filter by Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present Only</option>
              <option value="late">Late Only</option>
              <option value="absent">Absent Only</option>
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Specific Date
            </label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Logged By</th>
                <th className="px-6 py-4">Note / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No attendance records matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {rec.date}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {rec.subjectName}
                      </div>
                      <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                        {rec.subjectCode}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] uppercase inline-flex items-center space-x-1 ${
                        rec.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : rec.status === 'late'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                      }`}>
                        {rec.status === 'present' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {rec.status === 'late' && <Clock className="h-3 w-3 mr-1" />}
                        {rec.status === 'absent' && <XCircle className="h-3 w-3 mr-1" />}
                        <span>{rec.status}</span>
                      </span>
                    </td>

                    {/* Logged By */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        rec.markedBy === 'teacher' 
                          ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {rec.markedBy === 'teacher' ? `Teacher (${rec.markedByName})` : 'Self Check-In'}
                      </span>
                    </td>

                    {/* Note */}
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {rec.note || <span className="text-slate-400 text-[11px] italic">None</span>}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
