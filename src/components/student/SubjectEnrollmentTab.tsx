import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Subject, Enrollment } from '../../types';
import { 
  subscribeSubjects, 
  subscribeStudentEnrollments, 
  requestEnrollment 
} from '../../services/attendanceService';
import { 
  BookOpen, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Clock3, 
  User, 
  MapPin,
  Sparkles
} from 'lucide-react';

export const SubjectEnrollmentTab: React.FC = () => {
  const { userProfile, showToast } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [submittingSubjectId, setSubmittingSubjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!userProfile) return;

    const unSubSubjects = subscribeSubjects(setSubjects);
    const unSubEnrollments = subscribeStudentEnrollments(userProfile.uid, setEnrollments);

    return () => {
      unSubSubjects();
      unSubEnrollments();
    };
  }, [userProfile]);

  const handleApply = async (subject: Subject) => {
    if (!userProfile) return;
    setSubmittingSubjectId(subject.id);

    try {
      await requestEnrollment(userProfile, subject);
      showToast(`Enrollment request for '${subject.name}' sent to Teacher!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to apply for subject.', 'error');
    } finally {
      setSubmittingSubjectId(null);
    }
  };

  const getEnrollmentStatus = (subjectId: string): Enrollment | undefined => {
    return enrollments.find(e => e.subjectId === subjectId);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <span>Available Subject Catalog</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Apply for class subjects taught at Cedric Institute. Teacher approval is required before check-ins open.
        </p>
      </div>

      {/* Grid of Subjects */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center text-xs text-slate-500">
            No subjects created by Faculty Teachers yet.
          </div>
        ) : (
          subjects.map((subj) => {
            const enrollment = getEnrollmentStatus(subj.id);

            return (
              <div 
                key={subj.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs border border-indigo-200 dark:border-indigo-800/50">
                      {subj.code}
                    </span>

                    {/* Enrollment Status Pill */}
                    {enrollment ? (
                      enrollment.status === 'approved' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Enrolled</span>
                        </span>
                      ) : enrollment.status === 'pending' ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center space-x-1">
                          <Clock3 className="h-3.5 w-3.5" />
                          <span>Pending Approval</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-xs font-bold">
                          Rejected
                        </span>
                      )
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                        Not Enrolled
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      {subj.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
                      <User className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Faculty: {subj.teacherName}</span>
                    </p>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                      <span>{subj.schedule}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{subj.room}</span>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                {!enrollment && (
                  <button
                    onClick={() => handleApply(subj)}
                    disabled={submittingSubjectId === subj.id}
                    id={`apply-enrollment-btn-${subj.code}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-1.5"
                  >
                    {submittingSubjectId === subj.id ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <PlusCircle className="h-4 w-4" />
                        <span>Apply for Enrollment</span>
                      </>
                    )}
                  </button>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
