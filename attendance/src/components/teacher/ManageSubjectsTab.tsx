import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Subject } from '../../types';
import { 
  subscribeSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject 
} from '../../services/attendanceService';
import { 
  BookOpen, 
  PlusCircle, 
  Clock, 
  MapPin, 
  User, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Filter,
  UserCheck
} from 'lucide-react';

export const ManageSubjectsTab: React.FC = () => {
  const { userProfile, showToast } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filter tab: 'my' | 'all'
  const [filterMode, setFilterMode] = useState<'my' | 'all'>('my');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState('Mon/Wed 09:00 AM - 10:30 AM');
  const [room, setRoom] = useState('Room 201');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [quickSubjectName, setQuickSubjectName] = useState('');

  const handleQuickAddSubject = async (subName: string) => {
    if (!userProfile || !subName.trim()) return;
    const cleanName = subName.trim();
    const generatedCode = (cleanName.replace(/[^a-zA-Z]/g, '').substring(0, 4) || 'SUBJ').toUpperCase() + '101';
    try {
      await createSubject(
        generatedCode,
        cleanName,
        userProfile.uid,
        userProfile.name,
        'Mon/Wed 09:00 AM - 10:30 AM',
        'Room 201'
      );
      showToast(`Added subject '${cleanName}' (${generatedCode})!`, 'success');
      setQuickSubjectName('');
    } catch (err: any) {
      showToast(err.message || 'Failed to add subject', 'error');
    }
  };

  useEffect(() => {
    const unSub = subscribeSubjects(setSubjects);
    return () => unSub();
  }, []);

  const openCreateModal = () => {
    setEditingSubject(null);
    setCode('');
    setName('');
    setSchedule('Mon/Wed 09:00 AM - 10:30 AM');
    setRoom('Room 201');
    setShowModal(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setCode(subject.code);
    setName(subject.name);
    setSchedule(subject.schedule || 'Mon/Wed 09:00 AM - 10:30 AM');
    setRoom(subject.room || 'Room 201');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    if (!code.trim() || !name.trim()) {
      showToast('Subject Code and Subject Name are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSubject) {
        // Edit existing subject
        await updateSubject(
          editingSubject.id,
          {
            code: code.trim().toUpperCase(),
            name: name.trim(),
            schedule: schedule.trim(),
            room: room.trim()
          },
          userProfile.name
        );
        showToast(`Subject '${name}' updated successfully!`, 'success');
      } else {
        // Create new subject
        await createSubject(
          code,
          name,
          userProfile.uid,
          userProfile.name,
          schedule,
          room
        );
        showToast(`Subject '${name}' (${code.toUpperCase()}) created!`, 'success');
      }

      setShowModal(false);
      setCode('');
      setName('');
      setEditingSubject(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save subject.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimSubject = async (subject: Subject) => {
    if (!userProfile) return;
    try {
      await updateSubject(
        subject.id,
        {
          teacherId: userProfile.uid,
          teacherName: userProfile.name
        },
        userProfile.name
      );
      showToast(`You are now assigned as teacher for ${subject.code}!`, 'success');
    } catch (err: any) {
      showToast('Failed to assign subject.', 'error');
    }
  };

  const handleDelete = async (subject: Subject) => {
    if (!userProfile) return;
    if (window.confirm(`Are you sure you want to delete subject "${subject.name}" (${subject.code})?`)) {
      try {
        await deleteSubject(subject.id, subject.code, userProfile.name);
        showToast(`Subject ${subject.code} deleted.`, 'info');
      } catch (err: any) {
        showToast('Failed to delete subject.', 'error');
      }
    }
  };

  const mySubjects = subjects.filter(s => s.teacherId === userProfile?.uid);
  const displayedSubjects = filterMode === 'my' ? mySubjects : subjects;

  const DEFAULT_SUBJECT_OPTIONS = [
    'Mathematics',
    'Science & Technology',
    'Computer Science',
    'English & Literature',
    'History & Civics',
    'Web Development',
    'Physics & Engineering'
  ];

  return (
    <div className="space-y-6">
      
      {/* Subjects You Teach Pills & Input Widget */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            <span>SUBJECTS YOU TEACH</span>
          </h4>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Type a subject or click to quickly add</span>
        </div>

        {/* Input Field */}
        <div className="flex gap-2">
          <input
            type="text"
            id="manage-quick-subject-input"
            value={quickSubjectName}
            onChange={(e) => setQuickSubjectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleQuickAddSubject(quickSubjectName);
              }
            }}
            placeholder="Type subject name (e.g. Advanced Calculus, World History)..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <button
            type="button"
            onClick={() => handleQuickAddSubject(quickSubjectName)}
            id="manage-quick-add-subject-btn"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 transition-all shadow-sm flex items-center space-x-1.5"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Subject</span>
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {DEFAULT_SUBJECT_OPTIONS.map((sub) => {
            const isAssigned = mySubjects.some(s => s.name.toLowerCase() === sub.toLowerCase());
            return (
              <button
                key={sub}
                type="button"
                onClick={() => {
                  if (!isAssigned) {
                    handleQuickAddSubject(sub);
                  }
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all border flex items-center space-x-1.5 ${
                  isAssigned
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm cursor-default'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {isAssigned && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                <span>{sub}</span>
                {!isAssigned && <span className="text-[10px] text-indigo-500 font-normal ml-1">+ add</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header & Add Button */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <span>Subject & Curriculum Options</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage courses you teach, edit class schedules, or add new subjects to the portal.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            id="open-add-subject-modal-btn"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 self-start sm:self-auto transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add New Subject</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center space-x-2 border-t border-slate-100 dark:border-slate-800 pt-4">
          <button
            onClick={() => setFilterMode('my')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all ${
              filterMode === 'my'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Subjects You Teach ({mySubjects.length})</span>
          </button>

          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all ${
              filterMode === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>All School Subjects ({subjects.length})</span>
          </button>
        </div>
      </div>

      {/* Grid of Subjects */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedSubjects.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              <BookOpen className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              {filterMode === 'my' ? 'No Subjects Assigned to You Yet' : 'No Subjects Registered'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {filterMode === 'my' 
                ? 'Switch to "All School Subjects" to claim an existing subject or click "Add New Subject" to create one.'
                : 'Click "Add New Subject" to establish curriculum classes.'}
            </p>
          </div>
        ) : (
          displayedSubjects.map((subj) => {
            const isMySubject = subj.teacherId === userProfile?.uid;

            return (
              <div 
                key={subj.id}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between transition-all ${
                  isMySubject
                    ? 'border-emerald-300 dark:border-emerald-800/80 ring-1 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 font-mono font-bold text-xs text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                      {subj.code}
                    </span>

                    {isMySubject ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                        Teaching
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimSubject(subj)}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                      >
                        <UserCheck className="h-3 w-3 mr-1" />
                        Assign to Me
                      </button>
                    )}
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    {subj.name}
                  </h4>

                  <div className="text-xs text-slate-500 space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <User className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Instructor: <strong className="text-slate-800 dark:text-slate-200">{subj.teacherName || 'Unassigned'}</strong></span>
                    </div>
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

                {/* Actions Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {subj.id.slice(0, 6)}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(subj)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center space-x-1 transition-colors"
                      title="Edit Subject Options"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(subj)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                <span>{editingSubject ? 'Edit Subject Details' : 'Create Class Subject'}</span>
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Subject Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. MATH201 or CS101"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mathematics II or Web Engineering"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Schedule / Timing
                </label>
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="e.g. Mon/Wed/Fri 09:00 AM - 10:30 AM"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Room / Classroom
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Hall A, Lab 3"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="confirm-create-subject-btn"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-1"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>{editingSubject ? 'Save Changes' : 'Create Subject'}</span>
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
