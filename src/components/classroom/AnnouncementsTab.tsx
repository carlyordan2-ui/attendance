import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Pin, 
  Trash2, 
  MessageSquare, 
  Send, 
  Search, 
  Filter, 
  Sparkles,
  Calendar,
  X,
  UserCheck
} from 'lucide-react';
import { 
  UserProfile, 
  Subject, 
  Announcement, 
  AnnouncementComment 
} from '../../types';
import { 
  subscribeAnnouncements, 
  createAnnouncement, 
  deleteAnnouncement, 
  subscribeAnnouncementComments, 
  addAnnouncementComment 
} from '../../services/attendanceService';

interface AnnouncementsTabProps {
  userProfile: UserProfile;
  subjects: Subject[];
}

export const AnnouncementsTab: React.FC<AnnouncementsTabProps> = ({ userProfile, subjects }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('all');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expanded comment threads
  const [activeAnnouncementId, setActiveAnnouncementId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeAnnouncements((data) => {
      setAnnouncements(data);
    });
    return () => unsubscribe();
  }, []);

  const isTeacher = userProfile.role === 'teacher';

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    setIsSubmitting(true);
    try {
      let subCode = 'GENERAL';
      let subName = 'All Subjects';

      if (formSubjectId !== 'all') {
        const found = subjects.find(s => s.id === formSubjectId);
        if (found) {
          subCode = found.code;
          subName = found.name;
        }
      }

      await createAnnouncement(
        formTitle,
        formContent,
        userProfile.uid,
        userProfile.name,
        formSubjectId,
        subCode,
        subName,
        formIsPinned
      );

      setFormTitle('');
      setFormContent('');
      setFormSubjectId('all');
      setFormIsPinned(false);
      setIsCreating(false);
    } catch (err) {
      console.error('Error posting announcement:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      await deleteAnnouncement(id);
    }
  };

  const filteredAnnouncements = announcements.filter((item) => {
    const matchesSubject = selectedSubjectId === 'all' || item.subjectId === 'all' || item.subjectId === selectedSubjectId;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Stream Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Megaphone className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Classroom Stream</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Announcements & Updates
          </h2>
          <p className="text-indigo-100/80 text-xs sm:text-sm">
            Stay up to date with class notices, exam reminders, and official broadcasts from your instructors.
          </p>
        </div>
      </div>

      {/* Control Bar: Filter, Search & Create Action */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        <div className="flex flex-1 items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search stream notices..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Subject Selector */}
          <div className="relative">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 pr-8"
            >
              <option value="all">All Courses</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Create Announcement Button for Teachers */}
        {isTeacher && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      {/* Announcements Stream List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Megaphone className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              No Announcements Posted Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no stream updates for the selected course filter.
            </p>
          </div>
        ) : (
          filteredAnnouncements.map((item) => (
            <AnnouncementCard
              key={item.id}
              announcement={item}
              userProfile={userProfile}
              onDelete={handleDelete}
              isOpenComments={activeAnnouncementId === item.id}
              toggleComments={() => 
                setActiveAnnouncementId(activeAnnouncementId === item.id ? null : item.id)
              }
            />
          ))
        )}
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Megaphone className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  New Class Announcement
                </h3>
              </div>
              <button 
                onClick={() => setIsCreating(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Course / Subject
                </label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="all">Broadcast to All Courses</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Midterm Exam Coverage & Date"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Message Content
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write full notice details, instructions, or links..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pinToggle"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="pinToggle" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                  <Pin className="h-3.5 w-3.5 mr-1 text-amber-500" />
                  Pin notice to top of stream
                </label>
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
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                >
                  {isSubmitting ? 'Posting...' : 'Post Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Sub-component for individual Announcement Card
interface AnnouncementCardProps {
  announcement: Announcement;
  userProfile: UserProfile;
  onDelete: (id: string) => void;
  isOpenComments: boolean;
  toggleComments: () => void;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  userProfile,
  onDelete,
  isOpenComments,
  toggleComments
}) => {
  const [comments, setComments] = useState<AnnouncementComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let unsubscribe = () => {};
    if (isOpenComments) {
      unsubscribe = subscribeAnnouncementComments(announcement.id, (data) => {
        setComments(data);
      });
    }
    return () => unsubscribe();
  }, [isOpenComments, announcement.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSending(true);
    try {
      await addAnnouncementComment(
        announcement.id,
        userProfile.uid,
        userProfile.name,
        userProfile.role,
        newComment
      );
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setIsSending(false);
    }
  };

  const isTeacher = userProfile.role === 'teacher';
  const formattedDate = new Date(announcement.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 sm:p-6 transition-all shadow-sm ${
      announcement.isPinned 
        ? 'border-indigo-300 dark:border-indigo-800/80 ring-2 ring-indigo-500/10' 
        : 'border-slate-200 dark:border-slate-800'
    }`}>
      
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 mb-3">
        
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
            {announcement.teacherName ? announcement.teacherName[0].toUpperCase() : 'T'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {announcement.teacherName}
              </span>
              {announcement.isPinned && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                  <Pin className="h-3 w-3 mr-1" />
                  Pinned
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {announcement.subjectCode} • {announcement.subjectName}
              </span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {isTeacher && (
          <button
            onClick={() => onDelete(announcement.id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
            title="Delete Announcement"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Title & Body Content */}
      <div className="space-y-2 mb-4">
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
          {announcement.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
          {announcement.content}
        </p>
      </div>

      {/* Footer / Comments Toggle */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between">
        <button
          onClick={toggleComments}
          className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <MessageSquare className="h-4 w-4" />
          <span>{isOpenComments ? 'Hide Class Comments' : 'View Class Comments'}</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {isOpenComments && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
          
          {/* Comment List */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs italic text-slate-400 py-1">No comments yet. Start the conversation!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {c.authorName}
                      </span>
                      <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold uppercase ${
                        c.authorRole === 'teacher'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {c.authorRole}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {c.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Input Form */}
          <form onSubmit={handleAddComment} className="flex items-center space-x-2 pt-2">
            <input
              type="text"
              placeholder="Add class comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isSending || !newComment.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
