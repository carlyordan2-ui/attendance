import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  UserProfile, 
  Subject, 
  Enrollment, 
  AttendanceRecord, 
  ActivityLog, 
  ActivityType,
  AttendanceStatus,
  UserRole,
  Announcement,
  AnnouncementComment,
  Assignment,
  AssignmentType,
  Submission
} from '../types';

export const DOMAIN = 'cedric.edu';

export function getSyntheticEmail(userCode: string, role: UserRole): string {
  const cleanCode = userCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return `${role}.${cleanCode}@${DOMAIN}`;
}

// Activity Logging helper
export async function logActivity(
  type: ActivityType,
  userCode: string,
  userName: string,
  role: UserRole | 'unknown',
  details: string,
  severity: 'info' | 'warning' | 'critical' = 'info'
) {
  try {
    const logsRef = collection(db, 'activityLogs');
    await addDoc(logsRef, {
      type,
      userCode,
      userName,
      role,
      details,
      severity,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// Real-time listener for current user's profile
export function subscribeUserProfile(uid: string, callback: (profile: UserProfile | null) => void) {
  const docRef = doc(db, 'users', uid);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as UserProfile);
    } else {
      callback(null);
    }
  }, (err) => {
    console.error('Error listening to user profile:', err);
    callback(null);
  });
}

// Subscribe to pending users (for Teachers to review)
export function subscribePendingUsers(callback: (users: UserProfile[]) => void) {
  const q = query(collection(db, 'users'), where('status', '==', 'pending'));
  return onSnapshot(q, (snapshot) => {
    const users: UserProfile[] = [];
    snapshot.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });
    callback(users);
  });
}

// Subscribe to all users
export function subscribeAllUsers(callback: (users: UserProfile[]) => void) {
  const q = query(collection(db, 'users'));
  return onSnapshot(q, (snapshot) => {
    const users: UserProfile[] = [];
    snapshot.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });
    callback(users);
  });
}

// Check if any approved teacher exists
export async function hasApprovedTeacher(): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'teacher'), 
      where('status', '==', 'approved')
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (err) {
    console.error('Error checking approved teachers:', err);
    return false;
  }
}

// Subscribe to Subjects
export function subscribeSubjects(callback: (subjects: Subject[]) => void) {
  const q = query(collection(db, 'subjects'));
  return onSnapshot(q, (snapshot) => {
    const subjects: Subject[] = [];
    snapshot.forEach((doc) => {
      subjects.push({ id: doc.id, ...doc.data() } as Subject);
    });
    callback(subjects);
  });
}

// Subscribe to Enrollments (All or Subject/Student)
export function subscribeAllEnrollments(callback: (enrollments: Enrollment[]) => void) {
  const q = query(collection(db, 'enrollments'));
  return onSnapshot(q, (snapshot) => {
    const enrollments: Enrollment[] = [];
    snapshot.forEach((doc) => {
      enrollments.push({ id: doc.id, ...doc.data() } as Enrollment);
    });
    callback(enrollments);
  });
}

export function subscribeStudentEnrollments(studentId: string, callback: (enrollments: Enrollment[]) => void) {
  const q = query(collection(db, 'enrollments'), where('studentId', '==', studentId));
  return onSnapshot(q, (snapshot) => {
    const enrollments: Enrollment[] = [];
    snapshot.forEach((doc) => {
      enrollments.push({ id: doc.id, ...doc.data() } as Enrollment);
    });
    callback(enrollments);
  });
}

// Subscribe to Attendance Records
export function subscribeAllAttendance(callback: (records: AttendanceRecord[]) => void) {
  const q = query(collection(db, 'attendance'));
  return onSnapshot(q, (snapshot) => {
    const records: AttendanceRecord[] = [];
    snapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
    });
    callback(records);
  });
}

export function subscribeStudentAttendance(studentId: string, callback: (records: AttendanceRecord[]) => void) {
  const q = query(collection(db, 'attendance'), where('studentId', '==', studentId));
  return onSnapshot(q, (snapshot) => {
    const records: AttendanceRecord[] = [];
    snapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() } as AttendanceRecord);
    });
    callback(records);
  });
}

// Subscribe to Activity Logs
export function subscribeActivityLogs(callback: (logs: ActivityLog[]) => void) {
  const q = query(collection(db, 'activityLogs'));
  return onSnapshot(q, (snapshot) => {
    const logs: ActivityLog[] = [];
    snapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() } as ActivityLog);
    });
    // Sort descending by timestamp
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(logs);
  });
}

// Actions
export async function approveUserAccount(targetUid: string, approverName: string, approverUid: string) {
  const userRef = doc(db, 'users', targetUid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const targetUser = snap.data() as UserProfile;

  await updateDoc(userRef, {
    status: 'approved',
    approvedBy: `${approverName} (${approverUid})`,
    approvedAt: new Date().toISOString()
  });

  await logActivity(
    'account_approval',
    targetUser.userCode,
    targetUser.name,
    targetUser.role,
    `Account approved by Teacher ${approverName}`,
    'info'
  );
}

export async function rejectUserAccount(targetUid: string, rejecterName: string, reason?: string) {
  const userRef = doc(db, 'users', targetUid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const targetUser = snap.data() as UserProfile;

  await updateDoc(userRef, {
    status: 'rejected',
    rejectedReason: reason || 'Not approved by school administration.'
  });

  await logActivity(
    'account_rejection',
    targetUser.userCode,
    targetUser.name,
    targetUser.role,
    `Account rejected by Teacher ${rejecterName}. Reason: ${reason || 'None specified'}`,
    'warning'
  );
}

export async function createSubject(code: string, name: string, teacherId: string, teacherName: string, schedule: string, room: string) {
  const subjectsRef = collection(db, 'subjects');
  const newSubject = {
    code: code.trim().toUpperCase(),
    name: name.trim(),
    teacherId,
    teacherName,
    schedule: schedule.trim() || 'Mon-Fri 09:00 AM',
    room: room.trim() || 'Room 101',
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(subjectsRef, newSubject);

  return docRef.id;
}

export async function updateSubject(
  subjectId: string,
  data: Partial<Subject>,
  teacherName: string
) {
  const subjectRef = doc(db, 'subjects', subjectId);
  await updateDoc(subjectRef, data);

  await logActivity(
    'subject_created',
    data.code || 'SUBJECT',
    teacherName,
    'teacher',
    `Updated subject details for '${data.name || subjectId}'`,
    'info'
  );
}

export async function deleteSubject(subjectId: string, subjectCode: string, teacherName: string) {
  await deleteDoc(doc(db, 'subjects', subjectId));

  await logActivity(
    'subject_created',
    subjectCode || 'SUBJECT',
    teacherName,
    'teacher',
    `Deleted subject (${subjectCode})`,
    'warning'
  );
}

export async function requestEnrollment(student: UserProfile, subject: Subject) {
  const enrollmentsRef = collection(db, 'enrollments');
  const newEnrollment = {
    studentId: student.uid,
    studentName: student.name,
    studentUserCode: student.userCode,
    subjectId: subject.id,
    subjectCode: subject.code,
    subjectName: subject.name,
    teacherId: subject.teacherId,
    status: 'pending',
    requestedAt: new Date().toISOString()
  };
  await addDoc(enrollmentsRef, newEnrollment);

  await logActivity(
    'enrollment_request',
    student.userCode,
    student.name,
    'student',
    `Applied to enroll in subject ${subject.name} (${subject.code})`,
    'info'
  );
}

export async function processEnrollment(enrollmentId: string, status: 'approved' | 'rejected', teacherName: string) {
  const enrollmentRef = doc(db, 'enrollments', enrollmentId);
  const snap = await getDoc(enrollmentRef);
  if (!snap.exists()) return;
  const enr = snap.data() as Enrollment;

  await updateDoc(enrollmentRef, {
    status,
    updatedAt: new Date().toISOString()
  });

  await logActivity(
    'enrollment_action',
    enr.studentUserCode,
    enr.studentName,
    'student',
    `Enrollment for ${enr.subjectName} set to ${status} by Teacher ${teacherName}`,
    status === 'approved' ? 'info' : 'warning'
  );
}

export async function recordAttendance(
  student: { uid: string; name: string; userCode: string },
  subject: { id: string; code: string; name: string },
  date: string, // YYYY-MM-DD
  status: AttendanceStatus,
  note: string = '',
  markedBy: 'student' | 'teacher',
  markerInfo: { uid: string; name: string }
) {
  // Check if attendance record exists for this student + subject + date
  const q = query(
    collection(db, 'attendance'),
    where('studentId', '==', student.uid),
    where('subjectId', '==', subject.id),
    where('date', '==', date)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    // Override existing
    const existingDoc = snap.docs[0];
    await updateDoc(doc(db, 'attendance', existingDoc.id), {
      status,
      note,
      timestamp: new Date().toISOString(),
      markedBy,
      markedByName: markerInfo.name,
      markedById: markerInfo.uid
    });

    await logActivity(
      markedBy === 'teacher' ? 'attendance_override' : 'attendance_checkin',
      student.userCode,
      student.name,
      markedBy === 'teacher' ? 'teacher' : 'student',
      `${markedBy === 'teacher' ? 'Teacher ' + markerInfo.name + ' updated' : 'Student updated'} check-in status to '${status.toUpperCase()}' for ${subject.name} on ${date}${note ? ' (Note: ' + note + ')' : ''}`,
      'info'
    );
  } else {
    // Create new record
    const attendanceRef = collection(db, 'attendance');
    await addDoc(attendanceRef, {
      studentId: student.uid,
      studentName: student.name,
      studentUserCode: student.userCode,
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectName: subject.name,
      date,
      status,
      note,
      timestamp: new Date().toISOString(),
      markedBy,
      markedByName: markerInfo.name,
      markedById: markerInfo.uid
    });

    await logActivity(
      'attendance_checkin',
      student.userCode,
      student.name,
      markedBy === 'teacher' ? 'teacher' : 'student',
      `Checked in as '${status.toUpperCase()}' for ${subject.name} on ${date}${note ? ' (Note: ' + note + ')' : ''}`,
      'info'
    );
  }
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
}

// ==========================================
// CLASSROOM: ANNOUNCEMENTS & STREAM
// ==========================================

export function subscribeAnnouncements(callback: (announcements: Announcement[]) => void) {
  const q = query(collection(db, 'announcements'));
  return onSnapshot(q, (snapshot) => {
    const list: Announcement[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Announcement);
    });
    // Sort pinned top, then descending by createdAt
    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    callback(list);
  });
}

export async function createAnnouncement(
  title: string,
  content: string,
  teacherId: string,
  teacherName: string,
  subjectId: string,
  subjectCode: string,
  subjectName: string,
  isPinned: boolean = false
) {
  const ref = collection(db, 'announcements');
  const data = {
    title: title.trim(),
    content: content.trim(),
    teacherId,
    teacherName,
    subjectId,
    subjectCode,
    subjectName,
    isPinned,
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(ref, data);

  await logActivity(
    'subject_created',
    subjectCode || 'STREAM',
    teacherName,
    'teacher',
    `Posted announcement: "${title.trim()}" for ${subjectName}`,
    'info'
  );

  return docRef.id;
}

export async function deleteAnnouncement(announcementId: string) {
  await deleteDoc(doc(db, 'announcements', announcementId));
}

export function subscribeAnnouncementComments(announcementId: string, callback: (comments: AnnouncementComment[]) => void) {
  const q = query(
    collection(db, 'announcementComments'),
    where('announcementId', '==', announcementId)
  );
  return onSnapshot(q, (snapshot) => {
    const comments: AnnouncementComment[] = [];
    snapshot.forEach((docSnap) => {
      comments.push({ id: docSnap.id, ...docSnap.data() } as AnnouncementComment);
    });
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    callback(comments);
  });
}

export async function addAnnouncementComment(
  announcementId: string,
  authorId: string,
  authorName: string,
  authorRole: UserRole,
  content: string
) {
  const ref = collection(db, 'announcementComments');
  await addDoc(ref, {
    announcementId,
    authorId,
    authorName,
    authorRole,
    content: content.trim(),
    createdAt: new Date().toISOString()
  });
}

// ==========================================
// CLASSROOM: ASSIGNMENTS & SUBMISSIONS
// ==========================================

export function subscribeAssignments(callback: (assignments: Assignment[]) => void) {
  const q = query(collection(db, 'assignments'));
  return onSnapshot(q, (snapshot) => {
    const list: Assignment[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Assignment);
    });
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  });
}

export async function createAssignment(
  title: string,
  description: string,
  type: AssignmentType,
  subjectId: string,
  subjectCode: string,
  subjectName: string,
  teacherId: string,
  teacherName: string,
  dueDate: string,
  points: number = 100
) {
  const ref = collection(db, 'assignments');
  const data = {
    title: title.trim(),
    description: description.trim(),
    type,
    subjectId,
    subjectCode,
    subjectName,
    teacherId,
    teacherName,
    dueDate,
    points,
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(ref, data);

  await logActivity(
    'subject_created',
    subjectCode,
    teacherName,
    'teacher',
    `Created ${type.toUpperCase()}: "${title.trim()}" due ${dueDate}`,
    'info'
  );

  return docRef.id;
}

export async function deleteAssignment(assignmentId: string) {
  await deleteDoc(doc(db, 'assignments', assignmentId));
}

export function subscribeSubmissions(callback: (submissions: Submission[]) => void) {
  const q = query(collection(db, 'submissions'));
  return onSnapshot(q, (snapshot) => {
    const list: Submission[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Submission);
    });
    callback(list);
  });
}

export async function submitAssignmentWork(
  assignmentId: string,
  student: { uid: string; name: string; userCode: string },
  subjectId: string,
  content: string
) {
  // Check if existing submission doc
  const q = query(
    collection(db, 'submissions'),
    where('assignmentId', '==', assignmentId),
    where('studentId', '==', student.uid)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    const existingDoc = snap.docs[0];
    await updateDoc(doc(db, 'submissions', existingDoc.id), {
      content,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    });
  } else {
    await addDoc(collection(db, 'submissions'), {
      assignmentId,
      studentId: student.uid,
      studentName: student.name,
      studentUserCode: student.userCode,
      subjectId,
      content,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    });
  }

  await logActivity(
    'attendance_checkin',
    student.userCode,
    student.name,
    'student',
    `Submitted work for assignment ID: ${assignmentId}`,
    'info'
  );
}

export async function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback: string,
  teacherName: string
) {
  const ref = doc(db, 'submissions', submissionId);
  await updateDoc(ref, {
    grade,
    feedback: feedback.trim(),
    status: 'graded',
    gradedAt: new Date().toISOString(),
    gradedByName: teacherName
  });
}
