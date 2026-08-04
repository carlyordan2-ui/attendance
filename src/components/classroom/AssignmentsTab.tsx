import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Sparkles, 
  Trash2, 
  UserCheck, 
  X, 
  Send,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { 
  UserProfile, 
  Subject, 
  Assignment, 
  AssignmentType, 
  Submission 
} from '../../types';
import { 
  subscribeAssignments, 
  createAssignment, 
  deleteAssignment, 
  subscribeSubmissions, 
  submitAssignmentWork, 
  gradeSubmission 
} from '../../services/attendanceService';

interface AssignmentsTabProps {
  userProfile: UserProfile;
  subjects: Subject[];
}

export const AssignmentsTab: React.FC<AssignmentsTabProps> = ({ userProfile, subjects }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Filtering
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isCreating, setIsCreating] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [gradingAssignment, setGradingAssignment] = useState<Assignment | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AssignmentType>('assignment');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [points, setPoints] = useState(100);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Student submission form
  const [studentContent, setStudentContent] = useState('');
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  // Teacher grading state
  const [gradingScores, setGradingScores] = useState<{ [subId: string]: number }>({});
  const [gradingFeedbacks, setGradingFeedbacks] = useState<{ [subId: string]: string }>({});

  useEffect(() => {
    const unsubAssign = subscribeAssignments((data) => setAssignments(data));
    const unsubSub = subscribeSubmissions((data) => setSubmissions(data));
    return () => {
      unsubAssign();
      unsubSub();
    };
  }, []);

  useEffect(() => {
    if (subjects.length > 0 && !subjectId) {
      setSubjectId(subjects[0].id);
    }
  }, [subjects, subjectId]);

  const isTeacher = userProfile.role === 'teacher';

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId || !dueDate) return;

    setIsSubmittingForm(true);
    try {
      const targetSub = subjects.find(s => s.id === subjectId);
      await createAssignment(
        title,
        description,
        type,
        subjectId,
        targetSub?.code || 'SUBJ',
        targetSub?.name || 'Subject',
        userProfile.uid,
        userProfile.name,
        dueDate,
        points
      );

      setTitle('');
      setDescription('');
      setType('assignment');
      setDueDate('');
      setPoints(100);
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create assignment:', err);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (window.confirm('Delete this classwork activity and all associated submissions?')) {
      await deleteAssignment(id);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment || !studentContent.trim()) return;

    setIsSubmittingWork(true);
    try {
      await submitAssignmentWork(
        submittingAssignment.id,
        {
          uid: userProfile.uid,
          name: userProfile.name,
          userCode: userProfile.userCode
        },
        submittingAssignment.subjectId,
        studentContent
      );
      setStudentContent('');
      setSubmittingAssignment(null);
    } catch (err) {
      console.error('Failed to submit work:', err);
    } finally {
      setIsSubmittingWork(false);
    }
  };

  const handleSaveGrade = async (submissionId: string) => {
    const grade = gradingScores[submissionId] ?? 100;
    const feedback = gradingFeedbacks[submissionId] || '';

    try {
      await gradeSubmission(submissionId, grade, feedback, userProfile.name);
      alert('Grade and feedback saved successfully!');
    } catch (err) {
      console.error('Error saving grade:', err);
    }
  };

  const filteredAssignments = assignments.filter((item) => {
    const matchesSubject = selectedSubjectId === 'all' || item.subjectId === selectedSubjectId;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <ClipboardList className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/30 text-emerald-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Classwork Module</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Assignments & Activities
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm">
            Access course projects, quizzes, and homework. Submit your work online and track graded feedback.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search assignments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Courses</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Activity Types</option>
            <option value="assignment">Assignments</option>
            <option value="quiz">Quizzes</option>
            <option value="activity">In-Class Activities</option>
            <option value="project">Projects</option>
          </select>
        </div>

        {/* Teacher Action */}
        {isTeacher && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Create Classwork</span>
          </button>
        )}
      </div>

      {/* Grid of Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssignments.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              No Classwork Activities Available
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no assignments, quizzes, or activities listed under the selected course.
            </p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => {
            const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignment.id);
            const mySubmission = assignmentSubmissions.find(s => s.studentId === userProfile.uid);

            return (
              <div 
                key={assignment.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-800 transition-all"
              >
                <div className="space-y-3">
                  {/* Top Bar: Subject & Type Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {assignment.subjectCode} • {assignment.type}
                    </span>

                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                      <Award className="h-3.5 w-3.5 mr-1" />
                      {assignment.points} pts
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {assignment.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                      {assignment.description}
                    </p>
                  </div>

                  {/* Due Date & Info */}
                  <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                    <span className="flex items-center font-medium">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      Due: <strong className="ml-1 text-slate-800 dark:text-slate-200">{assignment.dueDate}</strong>
                    </span>
                    
                    <span className="text-[11px]">
                      By {assignment.teacherName}
                    </span>
                  </div>
                </div>

                {/* Footer Status & Actions */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between gap-2">
                  
                  {/* Student View */}
                  {!isTeacher && (
                    <>
                      {mySubmission ? (
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center ${
                            mySubmission.status === 'graded'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {mySubmission.status === 'graded' ? `Graded: ${mySubmission.grade}/${assignment.points}` : 'Submitted'}
                          </span>
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-[10px] inline-flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Turn-In
                        </span>
                      )}

                      <button
                        onClick={() => setSubmittingAssignment(assignment)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                      >
                        {mySubmission ? 'View Work' : 'Turn In Work'}
                      </button>
                    </>
                  )}

                  {/* Teacher View */}
                  {isTeacher && (
                    <>
                      <div className="text-xs text-slate-500 font-medium">
                        Submissions: <strong className="text-slate-900 dark:text-white font-extrabold">{assignmentSubmissions.length}</strong>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setGradingAssignment(assignment)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                        >
                          Review & Grade
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl"
                          title="Delete Classwork"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal (Teacher) */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Create Classwork Activity
                </h3>
              </div>
              <button onClick={() => setIsCreating(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Course / Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AssignmentType)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="activity">In-Class Activity</option>
                    <option value="project">Project</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Chapter 3 Problem Set or Lab Report 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Instructions & Details
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail requirements, instructions, or submission links..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Points
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingForm}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                >
                  {isSubmittingForm ? 'Publishing...' : 'Publish Classwork'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Student Turn-In Modal */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {submittingAssignment.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {submittingAssignment.subjectCode} • Max Score: {submittingAssignment.points} pts
                </p>
              </div>
              <button onClick={() => setSubmittingAssignment(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Check if already submitted */}
            {(() => {
              const mySub = submissions.find(s => s.assignmentId === submittingAssignment.id && s.studentId === userProfile.uid);

              if (mySub) {
                return (
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl space-y-2 border border-slate-200/80 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">Your Submission</span>
                        <span className="text-[10px] text-slate-400">{new Date(mySub.submittedAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {mySub.content}
                      </p>
                    </div>

                    {mySub.status === 'graded' && (
                      <div className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 p-4 rounded-2xl space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                          <span>Grade & Feedback</span>
                          <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                            {mySub.grade} / {submittingAssignment.points}
                          </span>
                        </div>
                        {mySub.feedback && (
                          <p className="text-xs text-indigo-800 dark:text-indigo-300 italic">
                            "{mySub.feedback}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <form onSubmit={handleSubmitWork} className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl text-xs text-slate-600 dark:text-slate-300">
                    <strong>Instructions:</strong> {submittingAssignment.description}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Response / Online Link / Notes
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Paste your answer, code, essay summary, or cloud drive link..."
                      value={studentContent}
                      onChange={(e) => setStudentContent(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setSubmittingAssignment(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingWork}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                    >
                      {isSubmittingWork ? 'Submitting...' : 'Turn In Work'}
                    </button>
                  </div>
                </form>
              );
            })()}

          </div>
        </div>
      )}

      {/* Teacher Grading Drawer/Modal */}
      {gradingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Submissions for "{gradingAssignment.title}"
                </h3>
                <p className="text-xs text-slate-500">
                  {gradingAssignment.subjectCode} • Total Points: {gradingAssignment.points}
                </p>
              </div>
              <button onClick={() => setGradingAssignment(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List of submissions */}
            {(() => {
              const currentSubs = submissions.filter(s => s.assignmentId === gradingAssignment.id);

              if (currentSubs.length === 0) {
                return (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No student submissions turned in yet for this activity.
                  </div>
                );
              }

              return (
                <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {currentSubs.map((sub) => (
                    <div key={sub.id} className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {sub.studentName}
                          </span>
                          <span className="ml-2 font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                            ({sub.studentUserCode})
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          sub.status === 'graded'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {sub.status === 'graded' ? `Graded (${sub.grade}/${gradingAssignment.points})` : 'Submitted'}
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap border border-slate-200/80 dark:border-slate-700">
                        {sub.content}
                      </div>

                      {/* Grading Controls */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="w-28 shrink-0">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Score (/{gradingAssignment.points})</label>
                          <input
                            type="number"
                            min={0}
                            max={gradingAssignment.points}
                            value={gradingScores[sub.id] ?? sub.grade ?? gradingAssignment.points}
                            onChange={(e) => setGradingScores({ ...gradingScores, [sub.id]: Number(e.target.value) })}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-900 dark:text-white font-bold"
                          />
                        </div>

                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Teacher Feedback</label>
                          <input
                            type="text"
                            placeholder="Optional feedback or notes..."
                            value={gradingFeedbacks[sub.id] ?? sub.feedback ?? ''}
                            onChange={(e) => setGradingFeedbacks({ ...gradingFeedbacks, [sub.id]: e.target.value })}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-900 dark:text-white"
                          />
                        </div>

                        <button
                          onClick={() => handleSaveGrade(sub.id)}
                          className="self-end sm:self-auto px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 shadow-sm"
                        >
                          Save Grade
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              );
            })()}

          </div>
        </div>
      )}

    </div>
  );
};
