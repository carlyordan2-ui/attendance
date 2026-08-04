import React, { useState, useEffect } from 'react';
import { AttendanceRecord, Subject } from '../../types';
import { subscribeAllAttendance, subscribeSubjects } from '../../services/attendanceService';
import { 
  FileText, 
  Search, 
  Download, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle 
} from 'lucide-react';

export const AttendanceLogsTab: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filters
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const unSubAtt = subscribeAllAttendance(setRecords);
    const unSubSub = subscribeSubjects(setSubjects);

    return () => {
      unSubAtt();
      unSubSub();
    };
  }, []);

  // Filter records
  const filteredRecords = records.filter((rec) => {
    if (selectedSubjectId !== 'all' && rec.subjectId !== selectedSubjectId) return false;
    if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
    if (dateFilter && rec.date !== dateFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = rec.studentName.toLowerCase().includes(q);
      const matchCode = rec.studentUserCode.toLowerCase().includes(q);
      const matchSubj = rec.subjectName.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchSubj) return false;
    }
    return true;
  });

  // Sort descending by timestamp
  filteredRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Export CSV helper
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    const headers = ['Date', 'Student ID', 'Student Name', 'Subject Code', 'Subject Name', 'Status', 'Logged By', 'Note'];
    const rows = filteredRecords.map(r => [
      r.date,
      `"${r.studentUserCode}"`,
      `"${r.studentName}"`,
      `"${r.subjectCode}"`,
      `"${r.subjectName}"`,
      r.status.toUpperCase(),
      `"${r.markedByName}"`,
      `"${r.note || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span>Full Historical Attendance Log</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit and inspect raw attendance logs across all school subjects
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            id="export-attendance-csv-btn"
            className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-white transition-colors flex items-center space-x-1.5 self-start md:self-auto shadow-md"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV Report</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          
          {/* Search Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Search Student / ID
            </label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name or Student ID..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Filter Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              Filter Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present Only</option>
              <option value="late">Late Only</option>
              <option value="absent">Absent Only</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Date Filter
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

        </div>
      </div>

      {/* Log Table / Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Mobile & Tablet Card Layout (< 768px) */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No attendance log records found.
            </div>
          ) : (
            filteredRecords.map((rec) => (
              <div key={rec.id} className="p-4 space-y-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {rec.studentName}
                    </span>
                    <span className="ml-2 font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                      ID: {rec.studentUserCode}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase inline-flex items-center ${
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
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {rec.subjectName} ({rec.subjectCode})
                  </span>
                  <span className="font-mono text-[10px]">
                    {rec.date}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Logged by: {rec.markedByName} ({rec.markedBy})</span>
                  {rec.note && <span className="italic text-slate-500">Note: {rec.note}</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Recorded By</th>
                <th className="px-6 py-4">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No attendance log records found.
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

                    {/* Student */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {rec.studentName}
                      </div>
                      <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                        ID: {rec.studentUserCode}
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {rec.subjectName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {rec.subjectCode}
                      </div>
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
                      <span className="font-medium text-slate-900 dark:text-white">{rec.markedByName}</span>
                      <span className="text-[10px] text-slate-400 block capitalize">
                        Role: {rec.markedBy}
                      </span>
                    </td>

                    {/* Note */}
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {rec.note || <span className="text-slate-400 italic">None</span>}
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
