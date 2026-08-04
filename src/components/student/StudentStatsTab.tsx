import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Subject, 
  Enrollment, 
  AttendanceRecord 
} from '../../types';
import { 
  subscribeStudentAttendance, 
  subscribeStudentEnrollments, 
  subscribeSubjects 
} from '../../services/attendanceService';
import { 
  PieChart, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  BookOpen, 
  TrendingUp, 
  Award,
  AlertTriangle
} from 'lucide-react';

export const StudentStatsTab: React.FC = () => {
  const { userProfile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (!userProfile) return;

    const unSubEnr = subscribeStudentEnrollments(userProfile.uid, (enrs) => {
      setEnrollments(enrs.filter(e => e.status === 'approved'));
    });
    const unSubSub = subscribeSubjects(setSubjects);
    const unSubAtt = subscribeStudentAttendance(userProfile.uid, setRecords);

    return () => {
      unSubEnr();
      unSubSub();
      unSubAtt();
    };
  }, [userProfile]);

  const approvedSubjectIds = enrollments.map(e => e.subjectId);
  const mySubjects = subjects.filter(s => approvedSubjectIds.includes(s.id));

  // Calculate Overall Stats
  const totalClasses = records.length;
  const presentCount = records.filter(r => r.status === 'present').length;
  const lateCount = records.filter(r => r.status === 'late').length;
  const absentCount = records.filter(r => r.status === 'absent').length;

  // Percentage calculation: Present = 1.0, Late = 0.5 (or full check-in count)
  // Standard Academic Attendance % formula = ((Present + Late) / Total) * 100
  const overallPercentage = totalClasses > 0 
    ? Math.round(((presentCount + lateCount) / totalClasses) * 100) 
    : 100;

  // Calculate Per-Subject Stats
  const getSubjectStats = (subjectId: string) => {
    const subRecords = records.filter(r => r.subjectId === subjectId);
    const total = subRecords.length;
    const p = subRecords.filter(r => r.status === 'present').length;
    const l = subRecords.filter(r => r.status === 'late').length;
    const a = subRecords.filter(r => r.status === 'absent').length;
    const pct = total > 0 ? Math.round(((p + l) / total) * 100) : 100;
    return { total, p, l, a, pct };
  };

  return (
    <div className="space-y-6">
      
      {/* Overall Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Attendance % Badge */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-3xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-200">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Attendance</span>
            <Award className="h-5 w-5" />
          </div>
          <div className="my-3">
            <span className="text-4xl sm:text-5xl font-black">{overallPercentage}%</span>
            <p className="text-[11px] text-indigo-200 mt-1">
              {overallPercentage >= 85 ? 'Exceeding target standard' : 'Below 85% warning threshold'}
            </p>
          </div>
          <div className="w-full bg-indigo-900/60 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                overallPercentage >= 85 ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

        {/* Present Count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Present</span>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{presentCount}</span>
            <span className="text-xs text-slate-400 ml-1">classes</span>
          </div>
          <span className="text-[11px] text-slate-500">On-time check-ins</span>
        </div>

        {/* Late Count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">Late</span>
            <Clock className="h-5 w-5" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{lateCount}</span>
            <span className="text-xs text-slate-400 ml-1">classes</span>
          </div>
          <span className="text-[11px] text-slate-500">Delayed arrival</span>
        </div>

        {/* Absent Count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider">Absent</span>
            <XCircle className="h-5 w-5" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{absentCount}</span>
            <span className="text-xs text-slate-400 ml-1">classes</span>
          </div>
          <span className="text-[11px] text-slate-500">Unexcused / Overridden</span>
        </div>

      </div>

      {/* Subject-by-Subject Breakdown */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Subject Attendance Analytics</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detailed attendance percentage breakdown per registered subject
            </p>
          </div>
        </div>

        {mySubjects.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            No approved subjects to display statistics for.
          </p>
        ) : (
          <div className="space-y-4">
            {mySubjects.map((subj) => {
              const stats = getSubjectStats(subj.id);

              return (
                <div 
                  key={subj.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {subj.code}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {subj.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Teacher: {subj.teacherName} • Schedule: {subj.schedule}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-xl font-black text-slate-900 dark:text-white">
                          {stats.pct}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {stats.total} sessions logged
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                    {stats.total > 0 ? (
                      <>
                        <div 
                          className="bg-emerald-500 h-full" 
                          style={{ width: `${(stats.p / stats.total) * 100}%` }}
                          title={`Present: ${stats.p}`}
                        />
                        <div 
                          className="bg-amber-500 h-full" 
                          style={{ width: `${(stats.l / stats.total) * 100}%` }}
                          title={`Late: ${stats.l}`}
                        />
                        <div 
                          className="bg-rose-500 h-full" 
                          style={{ width: `${(stats.a / stats.total) * 100}%` }}
                          title={`Absent: ${stats.a}`}
                        />
                      </>
                    ) : (
                      <div className="bg-slate-300 dark:bg-slate-700 h-full w-full" />
                    )}
                  </div>

                  {/* Stat pills */}
                  <div className="flex items-center space-x-4 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>
                      Present: <strong className="ml-1 text-slate-900 dark:text-white">{stats.p}</strong>
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
                      Late: <strong className="ml-1 text-slate-900 dark:text-white">{stats.l}</strong>
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-rose-500 mr-1"></span>
                      Absent: <strong className="ml-1 text-slate-900 dark:text-white">{stats.a}</strong>
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
