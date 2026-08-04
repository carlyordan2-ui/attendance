import React, { useState, useEffect } from 'react';
import { ActivityLog } from '../../types';
import { subscribeActivityLogs } from '../../services/attendanceService';
import { 
  ShieldAlert, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Lock, 
  KeyRound, 
  UserPlus, 
  FileText 
} from 'lucide-react';

export const ActivityLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const unSub = subscribeActivityLogs(setLogs);
    return () => unSub();
  }, []);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCode = log.userCode.toLowerCase().includes(q);
      const matchName = log.userName.toLowerCase().includes(q);
      const matchDet = log.details.toLowerCase().includes(q);
      const matchType = log.type.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchDet && !matchType) return false;
    }
    return true;
  });

  const getSeverityBadge = (sev?: string) => {
    switch (sev) {
      case 'critical':
      case 'warning':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px] uppercase inline-flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>{sev}</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold text-[10px] uppercase">
            Info
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              <span>Security & Activity Audit Log</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time audit log tracking logins, registration attempts, suspicious activity, and overrides
            </p>
          </div>

          <div className="text-xs text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
            Total Audit Records: <strong>{filteredLogs.length}</strong>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Search */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Search Log Entries
            </label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ID, Name, or event details..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Severity Level
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Severities</option>
              <option value="warning">Warnings & Suspicious Only</option>
              <option value="info">Info Only</option>
            </select>
          </div>
        </div>

      </div>

      {/* Log Feed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No activity log entries found.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {getSeverityBadge(log.severity)}
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      [{log.type.toUpperCase()}]
                    </span>
                    <span className="text-[10px] text-slate-400">
                      • {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed pt-1">
                    {log.details}
                  </p>

                  <div className="text-[11px] text-slate-500 space-x-2">
                    <span>User: <strong>{log.userName}</strong></span>
                    <span>(ID: <strong className="font-mono">{log.userCode}</strong>)</span>
                    <span className="capitalize text-indigo-600 dark:text-indigo-400 font-semibold">• Role: {log.role}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
