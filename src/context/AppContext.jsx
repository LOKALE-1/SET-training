import React, { createContext, useState, useEffect, useContext } from 'react';

export const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

// Initial Mock Data
const initialStudents = [
  { id: 's1', name: 'Jane Doe' },
  { id: 's2', name: 'John Smith' },
  { id: 's3', name: 'Alice Johnson' }
];

const initialAssignments = [
  { id: 'a1', title: 'Business Model Canvas', description: 'Draw your canvas and upload a photo.', dueDate: '2024-11-01', createdAt: new Date().toISOString() }
];

const initialTests = [
  { 
    id: 't1', 
    title: 'Entrepreneurship Basics Quiz', 
    dueDate: '2024-11-15',
    questions: [
      { text: 'Define what a Value Proposition is.' },
      { text: 'List three ways to fund a startup.' }
    ]
  }
];

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); 

  // Persistent State Handlers
  const usePersistentState = (key, initialValue) => {
    const [state, setState] = useState(() => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    });

    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
  };

  const [students, setStudents] = usePersistentState('set_students', initialStudents);
  const [assignments, setAssignments] = usePersistentState('set_assignments', initialAssignments);
  const [submissions, setSubmissions] = usePersistentState('set_submissions', []); 
  const [materials, setMaterials] = usePersistentState('set_materials', []);
  const [attendance, setAttendance] = usePersistentState('set_attendance', []); 
  
  // New States for Tests
  const [tests, setTests] = usePersistentState('set_tests', initialTests);
  const [testSubmissions, setTestSubmissions] = usePersistentState('set_test_submissions', []);

  // Actions
  const login = (role, name = "Test User") => {
    const id = role === 'student' ? 's1' : 'm1'; 
    const studentData = role === 'student' ? students.find(s => s.id === id) : null;
    setCurrentUser({ id, role, name: studentData?.name || name, ...studentData });
  };

  const logout = () => setCurrentUser(null);

  const updateProfile = (profileData) => {
    const updatedStudents = students.map(s => s.id === currentUser.id ? { ...s, ...profileData } : s);
    setStudents(updatedStudents);
    setCurrentUser({ ...currentUser, ...profileData });
  };

  // Assignment Actions
  const addAssignment = (assignment) => setAssignments([...assignments, { ...assignment, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
  const submitAssignment = (submission) => setSubmissions([...submissions, { ...submission, id: Date.now().toString(), status: 'pending' }]);
  const gradeSubmission = (submissionId, grade, feedback) => {
    setSubmissions(submissions.map(sub => sub.id === submissionId ? { ...sub, grade, feedback, status: 'graded' } : sub));
  };

  // Test Actions
  const addTest = (test) => setTests([...tests, { ...test, id: Date.now().toString() }]);
  const submitTest = (submission) => setTestSubmissions([...testSubmissions, { ...submission, id: Date.now().toString(), status: 'pending' }]);
  const gradeTest = (submissionId, grade, feedback) => {
    setTestSubmissions(testSubmissions.map(sub => sub.id === submissionId ? { ...sub, grade, feedback, status: 'graded' } : sub));
  };

  const addMaterial = (material) => setMaterials([...materials, { ...material, id: Date.now().toString() }]);
  const saveAttendance = (date, records) => setAttendance([...attendance.filter(a => a.date !== date), { date, records }]);

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      students,
      assignments, addAssignment, submissions, submitAssignment, gradeSubmission,
      materials, addMaterial,
      attendance, saveAttendance,
      tests, addTest, testSubmissions, submitTest, gradeTest,
      updateProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};
