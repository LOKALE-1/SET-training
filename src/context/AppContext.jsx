import { createContext, useState, useEffect, useContext } from 'react';
import { db, isFirebaseReady } from '../firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);



export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); 
  const [firebaseActive, setFirebaseActive] = useState(isFirebaseReady);

  // Persistent State Handlers (used for Offline Fallback)
  const usePersistentState = (key, initialValue) => {
    const [state, setState] = useState(() => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    });

    useEffect(() => {
      if (!isFirebaseReady || !firebaseActive) {
        localStorage.setItem(key, JSON.stringify(state));
      }
    }, [key, state, firebaseActive]);

    return [state, setState];
  };

  const [students, setStudents] = usePersistentState('set_students', []);
  const [facilitators, setFacilitators] = usePersistentState('set_facilitators', []);
  
  const [assignments, setAssignments] = usePersistentState('set_assignments', []);
  const [submissions, setSubmissions] = usePersistentState('set_submissions', []); 
  const [materials, setMaterials] = usePersistentState('set_materials', []);
  const [attendance, setAttendance] = usePersistentState('set_attendance', []); 
  
  const [classwork, setClasswork] = usePersistentState('set_classwork', []);
  const [classworkSubmissions, setClassworkSubmissions] = usePersistentState('set_classwork_submissions', []);
  
  const [tests, setTests] = usePersistentState('set_tests', []);
  const [testSubmissions, setTestSubmissions] = usePersistentState('set_test_submissions', []);
  const [lessonPlans, setLessonPlans] = usePersistentState('set_lesson_plans', []);
  const [feedbacks, setFeedbacks] = usePersistentState('set_feedbacks', []);

  const [announcements, setAnnouncements] = usePersistentState('set_announcements', []);
  const [notifications, setNotifications] = usePersistentState('set_notifications', []);
  const [sharedNotes, setSharedNotes] = usePersistentState('set_shared_notes', []);


  // Firebase Real-time Subscriptions with Permission Denied Fallbacks
  useEffect(() => {
    if (!isFirebaseReady || !firebaseActive) return;

    // Subscribe to changes (catch permission errors in third argument)
    const handleListenError = (collectionName, err) => {
      if (err.code === 'permission-denied') {
        console.warn(`Firestore permission denied on collection '${collectionName}'. Falling back to offline simulator.`);
        setFirebaseActive(false);
      } else {
        console.error(`Firestore listener error on '${collectionName}':`, err);
      }
    };

    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      const list = [];
      snap.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      setStudents(list);
    }, (err) => handleListenError('students', err));

    const unsubFacilitators = onSnapshot(collection(db, 'facilitators'), (snap) => {
      const list = [];
      snap.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      setFacilitators(list);
    }, (err) => handleListenError('facilitators', err));

    const unsubAssignments = onSnapshot(collection(db, 'assignments'), (snap) => {
      const list = [];
      snap.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      setAssignments(list);
    }, (err) => handleListenError('assignments', err));

    const unsubSubmissions = onSnapshot(collection(db, 'submissions'), (snap) => {
      const list = [];
      snap.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      setSubmissions(list);
    }, (err) => handleListenError('submissions', err));

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snap) => {
      const list = [];
      snap.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      setAttendance(list);
    }, (err) => handleListenError('attendance', err));

    const unsubTests = onSnapshot(collection(db, 'tests'), (snap) => {
      const list = [];
      snap.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      setTests(list);
    }, (err) => handleListenError('tests', err));

    const unsubTestSubmissions = onSnapshot(collection(db, 'testSubmissions'), (snap) => {
      const list = [];
      snap.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      setTestSubmissions(list);
    }, (err) => handleListenError('testSubmissions', err));

    const unsubClasswork = onSnapshot(collection(db, 'classwork'), (snap) => {
      const list = [];
      snap.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      setClasswork(list);
    }, (err) => handleListenError('classwork', err));

    const unsubClassworkSubmissions = onSnapshot(collection(db, 'classworkSubmissions'), (snap) => {
      const list = [];
      snap.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      setClassworkSubmissions(list);
    }, (err) => handleListenError('classworkSubmissions', err));

    const unsubLessonPlans = onSnapshot(collection(db, 'lessonPlans'), (snap) => {
      const list = [];
      snap.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      setLessonPlans(list);
    }, (err) => handleListenError('lessonPlans', err));

    const unsubFeedbacks = onSnapshot(collection(db, 'feedbacks'), (snap) => {
      const list = [];
      snap.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      setFeedbacks(list);
    }, (err) => handleListenError('feedbacks', err));

    return () => {
      unsubStudents();
      unsubFacilitators();
      unsubAssignments();
      unsubSubmissions();
      unsubAttendance();
      unsubClasswork();
      unsubClassworkSubmissions();
      unsubTests();
      unsubTestSubmissions();
      unsubLessonPlans();
      unsubFeedbacks();
    };
  }, [isFirebaseReady, firebaseActive]);

  // Actions
  const login = (role, userId) => {
    if (role === 'student') {
      const student = students.find(s => s.id === userId);
      if (student) setCurrentUser({ ...student, role: 'student' });
    } else if (role === 'moderator') {
      const facilitator = facilitators.find(f => f.id === userId);
      if (facilitator) setCurrentUser({ ...facilitator, role: 'moderator' });
    }
  };

  const logout = () => setCurrentUser(null);

  const updateProfile = async (profileData) => {
    const updatedStudents = students.map(s => s.id === currentUser.id ? { ...s, ...profileData } : s);
    setStudents(updatedStudents);
    setCurrentUser({ ...currentUser, ...profileData });

    if (isFirebaseReady && firebaseActive) {
      try {
        await setDoc(doc(db, 'students', currentUser.id), { ...currentUser, ...profileData });
      } catch (err) {
        console.error("Firebase updateProfile error:", err);
      }
    }
  };

  const registerUser = (userData) => {
    const newId = Date.now().toString();
    const newUser = { id: newId, ...userData };
    let newStudent = null;
    
    if (userData.role === 'student') {
      newStudent = {
        ...newUser,
        transport: { type: 'none', details: { address: '', emergencyContact: '', timePreference: '', notes: '' } }
      };
      setStudents([...students, newStudent]);
    } else if (userData.role === 'moderator') {
      setFacilitators([...facilitators, newUser]);
    }

    if (isFirebaseReady && firebaseActive) {
      const colName = userData.role === 'student' ? 'students' : 'facilitators';
      const docData = userData.role === 'student' ? newStudent : newUser;
      setDoc(doc(db, colName, newId), docData).catch(err => {
        console.error("Firebase registerUser error:", err);
      });
    }

    return userData.role === 'student' ? newStudent : newUser;
  };

  const addAssignment = async (assignment) => {
    const newAss = { ...assignment, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setAssignments([...assignments, newAss]);

    if (isFirebaseReady && firebaseActive) {
      try {
        await setDoc(doc(db, 'assignments', newAss.id), newAss);
      } catch (err) {
        console.error("Firebase addAssignment error:", err);
      }
    }
  };

  const submitAssignment = async (submission) => {
    const existingIdx = submissions.findIndex(
      s => s.assignmentId === submission.assignmentId && s.studentId === submission.studentId
    );

    let updatedSubmissions;
    let targetSub;

    if (existingIdx > -1) {
      const existing = submissions[existingIdx];
      targetSub = {
        ...existing,
        ...submission,
        status: 'submitted',
        comments: [...(existing.comments || []), ...(submission.comments || [])],
        history: [...(existing.history || []), { event: 'Submitted', timestamp: new Date().toISOString() }],
        submittedAt: new Date().toISOString()
      };
      updatedSubmissions = [...submissions];
      updatedSubmissions[existingIdx] = targetSub;
    } else {
      targetSub = {
        id: Date.now().toString(),
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        comments: submission.comments || [],
        history: [{ event: 'Submitted', timestamp: new Date().toISOString() }],
        ...submission
      };
      updatedSubmissions = [...submissions, targetSub];
    }

    setSubmissions(updatedSubmissions);

    if (isFirebaseReady && firebaseActive) {
      try {
        await setDoc(doc(db, 'submissions', targetSub.id), targetSub);
      } catch (err) {
        console.error("Firebase submitAssignment error:", err);
      }
    }
  };

  const saveHomeworkDraft = async (draft) => {
    const existingIdx = submissions.findIndex(
      s => s.assignmentId === draft.assignmentId && s.studentId === draft.studentId
    );

    let updatedSubmissions;
    let targetSub;

    if (existingIdx > -1) {
      const existing = submissions[existingIdx];
      targetSub = {
        ...existing,
        ...draft,
        status: 'in_progress',
        comments: [...(existing.comments || []), ...(draft.comments || [])],
        history: [...(existing.history || []), { event: 'Draft Updated', timestamp: new Date().toISOString() }]
      };
      updatedSubmissions = [...submissions];
      updatedSubmissions[existingIdx] = targetSub;
    } else {
      targetSub = {
        id: Date.now().toString(),
        status: 'in_progress',
        comments: draft.comments || [],
        history: [{ event: 'Draft Created', timestamp: new Date().toISOString() }],
        ...draft
      };
      updatedSubmissions = [...submissions, targetSub];
    }

    setSubmissions(updatedSubmissions);

    if (isFirebaseReady && firebaseActive) {
      try {
        await setDoc(doc(db, 'submissions', targetSub.id), targetSub);
      } catch (err) {
        console.error("Firebase saveHomeworkDraft error:", err);
      }
    }
  };

  const saveHomeworkComment = async (assignmentId, commentText, sender) => {
    const existingIdx = submissions.findIndex(
      s => s.assignmentId === assignmentId && s.studentId === currentUser.id
    );

    if (existingIdx > -1) {
      const existing = submissions[existingIdx];
      const newComment = {
        id: Date.now().toString(),
        sender,
        text: commentText,
        timestamp: new Date().toISOString()
      };
      const targetSub = {
        ...existing,
        comments: [...(existing.comments || []), newComment]
      };
      const updatedSubmissions = [...submissions];
      updatedSubmissions[existingIdx] = targetSub;
      setSubmissions(updatedSubmissions);

      if (isFirebaseReady && firebaseActive) {
        try {
          await setDoc(doc(db, 'submissions', targetSub.id), targetSub);
        } catch (err) {
          console.error("Firebase saveHomeworkComment error:", err);
        }
      }
    }
  };

  const submitClasswork = async (classworkId, answers, isSubmit = true) => {
    const existingIdx = classworkSubmissions.findIndex(
      s => s.classworkId === classworkId && s.studentId === currentUser.id
    );

    let updatedSubmissions;
    let targetSub;
    const status = isSubmit ? 'completed' : 'in_progress';

    if (existingIdx > -1) {
      const existing = classworkSubmissions[existingIdx];
      targetSub = {
        ...existing,
        answers,
        status,
        submittedAt: new Date().toISOString()
      };
      updatedSubmissions = [...classworkSubmissions];
      updatedSubmissions[existingIdx] = targetSub;
    } else {
      targetSub = {
        id: Date.now().toString(),
        classworkId,
        studentId: currentUser.id,
        answers,
        status,
        submittedAt: new Date().toISOString()
      };
      updatedSubmissions = [...classworkSubmissions, targetSub];
    }

    setClassworkSubmissions(updatedSubmissions);

    if (isFirebaseReady && firebaseActive) {
      try {
        await setDoc(doc(db, 'classworkSubmissions', targetSub.id), targetSub);
      } catch (err) {
        console.error("Firebase submitClasswork error:", err);
      }
    }
  };

  const gradeSubmission = async (submissionId, grade, feedback) => {
    setSubmissions(submissions.map(sub => sub.id === submissionId ? { ...sub, grade, feedback, status: 'graded' } : sub));

    if (isFirebaseReady && firebaseActive) {
      try {
        await updateDoc(doc(db, 'submissions', submissionId), { grade, feedback, status: 'graded' });
      } catch (err) {
        console.error("Firebase gradeSubmission error:", err);
      }
    }
  };

  const addTest = async (test) => {
    const newTest = { ...test, id: Date.now().toString() };
    setTests([...tests, newTest]);

    if (isFirebaseReady && firebaseActive) {
      try {
        await setDoc(doc(db, 'tests', newTest.id), newTest);
      } catch (err) {
        console.error("Firebase addTest error:", err);
      }
    }
  };

  const submitTest = async (submission) => {
    const existingIdx = testSubmissions.findIndex(
      s => s.testId === submission.testId && s.studentId === submission.studentId
    );

    let updatedSubmissions;
    let targetSub;

    if (existingIdx > -1) {
      const existing = testSubmissions[existingIdx];
      targetSub = {
        ...existing,
        ...submission,
        submittedAt: new Date().toISOString()
      };
      updatedSubmissions = [...testSubmissions];
      updatedSubmissions[existingIdx] = targetSub;
    } else {
      targetSub = {
        id: Date.now().toString(),
        status: 'pending',
        submittedAt: new Date().toISOString(),
        ...submission
      };
      updatedSubmissions = [...testSubmissions, targetSub];
    }

    setTestSubmissions(updatedSubmissions);

    if (isFirebaseReady && firebaseActive) {
      try {
        await setDoc(doc(db, 'testSubmissions', targetSub.id), targetSub);
      } catch (err) {
        console.error("Firebase submitTest error:", err);
      }
    }
  };

  const gradeTest = async (submissionId, grade, feedback) => {
    setTestSubmissions(testSubmissions.map(sub => sub.id === submissionId ? { ...sub, grade, feedback, status: 'graded' } : sub));

    if (isFirebaseReady && firebaseActive) {
      try {
        await updateDoc(doc(db, 'testSubmissions', submissionId), { grade, feedback, status: 'graded' });
      } catch (err) {
        console.error("Firebase gradeTest error:", err);
      }
    }
  };

  const addMaterial = async (material) => {
    const newMat = { ...material, id: Date.now().toString() };
    setMaterials([...materials, newMat]);

    if (isFirebaseReady && firebaseActive) {
      try {
        await setDoc(doc(db, 'materials', newMat.id), newMat);
      } catch (err) {
        console.error("Firebase addMaterial error:", err);
      }
    }
  };

  const saveAttendance = async (date, records) => {
    setAttendance([...attendance.filter(a => a.date !== date), { date, records }]);

    if (isFirebaseReady && firebaseActive) {
      try {
        await setDoc(doc(db, 'attendance', date), { date, records });
      } catch (err) {
        console.error("Firebase saveAttendance error:", err);
      }
    }
  };

  const addLessonPlan = async (lessonPlan) => {
    const newPlan = { ...lessonPlan, id: Date.now().toString(), date: new Date().toISOString().split('T')[0] };
    setLessonPlans([...lessonPlans, newPlan]);

    if (isFirebaseReady && firebaseActive) {
      try {
        await setDoc(doc(db, 'lessonPlans', newPlan.id), newPlan);
      } catch (err) {
        console.error("Firebase addLessonPlan error:", err);
      }
    }
  };

  const submitFeedback = async (feedback) => {
    const newFb = { ...feedback, id: Date.now().toString(), submittedAt: new Date().toISOString() };
    setFeedbacks([...feedbacks, newFb]);

    if (isFirebaseReady && firebaseActive) {
      try {
        await setDoc(doc(db, 'feedbacks', newFb.id), newFb);
      } catch (err) {
        console.error("Firebase submitFeedback error:", err);
      }
    }
  };

  // Centralized Audit Logging (Disabled)
  const logAction = (action, details) => {
    // Audit logging disabled
  };

  // Assignments management
  const updateAssignment = async (id, data) => {
    const updated = assignments.map(a => a.id === id ? { ...a, ...data } : a);
    setAssignments(updated);
    logAction('Update Assignment', `Updated assignment: ${data.title || id}`);
  };

  const deleteAssignment = async (id) => {
    const deleted = assignments.find(a => a.id === id);
    setAssignments(assignments.filter(a => a.id !== id));
    logAction('Delete Assignment', `Deleted assignment: ${deleted ? deleted.title : id}`);
  };

  // Classwork management
  const addClasswork = async (cw) => {
    const newCw = { ...cw, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setClasswork([...classwork, newCw]);
    logAction('Create Classwork', `Created classwork: ${newCw.title}`);
  };

  const updateClasswork = async (id, data) => {
    const updated = classwork.map(c => c.id === id ? { ...c, ...data } : c);
    setClasswork(updated);
    logAction('Update Classwork', `Updated classwork: ${data.title || id}`);
  };

  const deleteClasswork = async (id) => {
    const deleted = classwork.find(c => c.id === id);
    setClasswork(classwork.filter(c => c.id !== id));
    logAction('Delete Classwork', `Deleted classwork: ${deleted ? deleted.title : id}`);
  };

  // Test management
  const updateTest = async (id, data) => {
    const updated = tests.map(t => t.id === id ? { ...t, ...data } : t);
    setTests(updated);
    logAction('Update Test/Quiz', `Updated test/quiz: ${data.title || id}`);
  };

  const deleteTest = async (id) => {
    const deleted = tests.find(t => t.id === id);
    setTests(tests.filter(t => t.id !== id));
    logAction('Delete Test/Quiz', `Deleted test/quiz: ${deleted ? deleted.title : id}`);
  };



  // Announcements
  const addAnnouncement = async (ann) => {
    const newAnn = { ...ann, id: Date.now().toString(), date: new Date().toISOString().split('T')[0], status: 'Published' };
    setAnnouncements([newAnn, ...(announcements || [])]);
    logAction('Publish Announcement', `Published announcement: ${newAnn.title}`);
  };

  const updateAnnouncement = async (id, data) => {
    setAnnouncements(announcements.map(ann => ann.id === id ? { ...ann, ...data } : ann));
    logAction('Update Announcement', `Updated announcement: ${data.title || id}`);
  };

  const archiveAnnouncement = async (id) => {
    setAnnouncements(announcements.map(ann => ann.id === id ? { ...ann, status: 'Archived' } : ann));
    logAction('Archive Announcement', `Archived announcement with ID: ${id}`);
  };

  // Notifications
  const sendNotification = async (notif) => {
    const newNot = { ...notif, id: Date.now().toString(), dateSent: new Date().toISOString().split('T')[0], status: 'Sent', deliveryRate: '100%', engagementRate: '0%' };
    setNotifications([newNot, ...(notifications || [])]);
    logAction('Send Notification', `Sent notification: ${newNot.title}`);
  };

  const scheduleNotification = async (notif) => {
    const newNot = { ...notif, id: Date.now().toString(), dateSent: notif.dateSent || new Date().toISOString().split('T')[0], status: 'Scheduled', deliveryRate: '-', engagementRate: '-' };
    setNotifications([newNot, ...(notifications || [])]);
    logAction('Schedule Notification', `Scheduled notification: ${newNot.title}`);
  };

  // Shared Notes
  const addSharedNote = async (note) => {
    const newNote = { ...note, id: Date.now().toString(), timestamp: new Date().toISOString() };
    setSharedNotes([newNote, ...(sharedNotes || [])]);
    logAction('Add Shared Note', `Added note for student ID: ${note.studentId}`);
  };

  // Update Submission State (for grading/rubric drafts, return for revision)
  const updateSubmissionState = async (submissionId, updates) => {
    let found = false;

    // Check homework submissions
    const hwIdx = submissions.findIndex(s => s.id === submissionId);
    if (hwIdx > -1) {
      const existing = submissions[hwIdx];
      const updated = {
        ...existing,
        ...updates,
        history: [...(existing.history || []), { event: updates.status === 'graded' ? 'Graded' : updates.status === 'returned_for_revision' ? 'Returned for Revision' : 'Updated', timestamp: new Date().toISOString() }]
      };
      const newSubs = [...submissions];
      newSubs[hwIdx] = updated;
      setSubmissions(newSubs);
      found = true;
      logAction('Grade Homework', `Homework graded/updated for student: ${existing.studentName}. Score: ${updates.grade || '-'}`);
    }

    if (!found) {
      // Check test submissions
      const testIdx = testSubmissions.findIndex(s => s.id === submissionId);
      if (testIdx > -1) {
        const existing = testSubmissions[testIdx];
        const updated = {
          ...existing,
          ...updates,
          history: [...(existing.history || []), { event: updates.status === 'graded' ? 'Graded' : 'Updated', timestamp: new Date().toISOString() }]
        };
        const newSubs = [...testSubmissions];
        newSubs[testIdx] = updated;
        setTestSubmissions(newSubs);
        found = true;
        logAction('Grade Assessment', `Assessment graded/updated for student: ${existing.studentName}. Score: ${updates.grade || '-'}`);
      }
    }

    if (!found) {
      // Check classwork submissions
      const cwIdx = classworkSubmissions.findIndex(s => s.id === submissionId);
      if (cwIdx > -1) {
        const existing = classworkSubmissions[cwIdx];
        const updated = {
          ...existing,
          ...updates
        };
        const newSubs = [...classworkSubmissions];
        newSubs[cwIdx] = updated;
        setClassworkSubmissions(newSubs);
        found = true;
        logAction('Review Classwork', `Classwork reviewed for student ID: ${existing.studentId}`);
      }
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      students, facilitators,
      assignments, addAssignment, updateAssignment, deleteAssignment, submissions, submitAssignment, gradeSubmission, saveHomeworkDraft, saveHomeworkComment,
      classwork, setClasswork, addClasswork, updateClasswork, deleteClasswork, classworkSubmissions, submitClasswork,
      materials, addMaterial,
      attendance, saveAttendance,
      tests, addTest, updateTest, deleteTest, testSubmissions, submitTest, gradeTest,
      lessonPlans, addLessonPlan,
      feedbacks, submitFeedback,
      registerUser, updateProfile,

      // New extensions
      announcements, setAnnouncements, addAnnouncement, updateAnnouncement, archiveAnnouncement,
      notifications, setNotifications, sendNotification, scheduleNotification,
      logAction,
      sharedNotes, setSharedNotes, addSharedNote,
      updateSubmissionState
    }}>
      {children}
    </AppContext.Provider>
  );
};
