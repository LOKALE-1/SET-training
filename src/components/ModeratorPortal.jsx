import React, { useState } from 'react';
import { 
  Users, FileText, CheckCircle, Calendar, Shield, Edit3, PlusCircle, 
  PenTool, User, BookOpen, Trash2, MapPin, Globe, Bus, Search, Filter,
  TrendingUp, Award, Clock, ArrowRight, Book, Briefcase, Plus, Send,
  AlertCircle, ChevronRight, Volume2, Download, Paperclip, Check, X, Settings, ShieldAlert,
  Info
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function ModeratorPortal() {
  const { 
    currentUser, students, assignments, addAssignment, updateAssignment, deleteAssignment,
    submissions, gradeSubmission, attendance, saveAttendance, tests, addTest, updateTest, deleteTest,
    testSubmissions, gradeTest, lessonPlans, addLessonPlan, classwork, setClasswork, addClasswork,
    updateClasswork, deleteClasswork, classworkSubmissions, submitClasswork,
    
    // New context imports
    announcements, addAnnouncement, updateAnnouncement, archiveAnnouncement,
    notifications, sendNotification, scheduleNotification,
    sharedNotes, addSharedNote,
    updateSubmissionState
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Search & Global Filter states
  const [globalSearch, setGlobalSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All'); // 'All' | 'Business Strategy' | 'Financial Literacy' | 'Marketing'
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPerformance, setFilterPerformance] = useState('All'); // 'All' | 'High' | 'Average' | 'Needs Attention'
  
  // Grading / Submission Detail States
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingMethod, setGradingMethod] = useState('percentage'); // 'percentage' | 'rubric' | 'pass-fail' | 'points'
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [rubricGrades, setRubricGrades] = useState({ 'Content Accuracy': 100, 'Presentation & Layout': 100, 'Critical Analysis': 100 });
  const [audioRecording, setAudioRecording] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState(null);

  // Homework creation state
  const [hwTitle, setHwTitle] = useState('');
  const [hwSubject, setHwSubject] = useState('Business Strategy');
  const [hwDue, setHwDue] = useState('');
  const [hwDesc, setHwDesc] = useState('');
  const [hwResourceFile, setHwResourceFile] = useState('assignment_guide.pdf');
  const [hwResourceSize, setHwResourceSize] = useState('1.1 MB');
  const [editingHomeworkId, setEditingHomeworkId] = useState(null);

  // Classwork creation state
  const [cwTitle, setCwTitle] = useState('');
  const [cwCategory, setCwCategory] = useState('Worksheet'); // Worksheets, Exercises, Projects, Practical activities, Reading tasks
  const [cwSubject, setCwSubject] = useState('Business Strategy');
  const [cwDue, setCwDue] = useState('');
  const [cwDesc, setCwDesc] = useState('');
  const [cwResourceFile, setCwResourceFile] = useState('classwork_sheet.pdf');
  const [cwQuestions, setCwQuestions] = useState([{ id: 'q1', text: '', type: 'text', placeholder: '' }]);
  const [editingClassworkId, setEditingClassworkId] = useState(null);

  // Test / Assessment state
  const [testTitle, setTestTitle] = useState('');
  const [testType, setTestType] = useState('Quiz'); // Quizzes, Tests, Exams, Projects, Assignments
  const [testSubject, setTestSubject] = useState('Business Strategy');
  const [testDue, setTestDue] = useState('');
  const [testInstructions, setTestInstructions] = useState('');
  const [testQuestions, setTestQuestions] = useState([{ type: 'long-answer', text: '', options: ['', '', '', ''], correctOption: 0 }]);
  const [editingTestId, setEditingTestId] = useState(null);

  // Announcements state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annAudience, setAnnAudience] = useState('All students');
  const [annFile, setAnnFile] = useState('');

  // Notifications state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifType, setNotifType] = useState('Homework Alert');
  const [notifAudience, setNotifAudience] = useState('All students');
  const [notifSchedule, setNotifSchedule] = useState('');

  // Shared note state
  const [studentNoteInput, setStudentNoteInput] = useState('');

  // Student list selected profile state
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Attendance Dates
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // Helper stats & calculations
  const pendingAssignments = submissions.filter(s => s.status === 'pending' || s.status === 'submitted');
  const pendingTests = testSubmissions.filter(s => s.status === 'pending' || s.status === 'submitted');
  const pendingClasswork = classworkSubmissions.filter(s => s.status === 'pending' || s.status === 'completed');
  const totalPending = pendingAssignments.length + pendingTests.length + pendingClasswork.length;

  const getStudentAttendance = (studentId) => {
    const studentAttendance = attendance.flatMap(day => (day.records || []).filter(r => r.studentId === studentId));
    if (studentAttendance.length === 0) return 100;
    return Math.round((studentAttendance.filter(a => a.status === 'Present').length / studentAttendance.length) * 100);
  };

  const getStudentAvgGrade = (studentId) => {
    const studentGrades = [...submissions, ...testSubmissions].filter(s => s.studentId === studentId && s.status === 'graded');
    if (studentGrades.length === 0) return 0;
    return Math.round(studentGrades.reduce((sum, item) => sum + Number(item.grade || 0), 0) / studentGrades.length);
  };

  // Automated action logger helper
  const handleActionClick = (actionName, details) => {
    logAction(actionName, details);
  };

  // Homework creation/editing handlers
  const handleSaveHomework = (e) => {
    e.preventDefault();
    if (editingHomeworkId) {
      updateAssignment(editingHomeworkId, { title: hwTitle, subject: hwSubject, dueDate: hwDue, description: hwDesc, resourceFile: hwResourceFile, resourceSize: hwResourceSize });
      alert('Homework updated successfully!');
    } else {
      addAssignment({ title: hwTitle, subject: hwSubject, dueDate: hwDue, description: hwDesc, resourceFile: hwResourceFile, resourceSize: hwResourceSize });
      alert('Homework published successfully!');
    }
    setHwTitle('');
    setHwDue('');
    setHwDesc('');
    setEditingHomeworkId(null);
  };

  const handleEditHomework = (h) => {
    setHwTitle(h.title);
    setHwSubject(h.subject || 'Business Strategy');
    setHwDue(h.dueDate);
    setHwDesc(h.description || '');
    setHwResourceFile(h.resourceFile || 'assignment_guide.pdf');
    setHwResourceSize(h.resourceSize || '1.1 MB');
    setEditingHomeworkId(h.id);
  };

  // Classwork creation/editing handlers
  const handleSaveClasswork = (e) => {
    e.preventDefault();
    if (editingClassworkId) {
      updateClasswork(editingClassworkId, { title: cwTitle, category: cwCategory, subject: cwSubject, dueDate: cwDue, description: cwDesc, resourceFile: cwResourceFile, questions: cwQuestions });
      alert('Classwork exercise updated!');
    } else {
      addClasswork({ title: cwTitle, category: cwCategory, subject: cwSubject, dueDate: cwDue, description: cwDesc, resourceFile: cwResourceFile, questions: cwQuestions });
      alert('Classwork exercise assigned!');
    }
    setCwTitle('');
    setCwDue('');
    setCwDesc('');
    setCwQuestions([{ id: 'q1', text: '', type: 'text', placeholder: '' }]);
    setEditingClassworkId(null);
  };

  const handleAddCwQuestion = () => {
    const newId = `q${cwQuestions.length + 1}`;
    setCwQuestions([...cwQuestions, { id: newId, text: '', type: 'text', placeholder: '' }]);
  };

  const handleCwQuestionChange = (index, field, val) => {
    const updated = [...cwQuestions];
    updated[index][field] = val;
    setCwQuestions(updated);
  };

  // Test / Assessment creation/editing handlers
  const handleAddTestQuestion = () => {
    setTestQuestions([...testQuestions, { type: 'long-answer', text: '', options: ['', '', '', ''], correctOption: 0 }]);
  };

  const handleTestQuestionChange = (index, field, val) => {
    const updated = [...testQuestions];
    updated[index][field] = val;
    setTestQuestions(updated);
  };

  const handleTestMcqOptionChange = (qIdx, oIdx, val) => {
    const updated = [...testQuestions];
    updated[qIdx].options[oIdx] = val;
    setTestQuestions(updated);
  };

  const handleSaveTest = (e) => {
    e.preventDefault();
    const testData = { title: testTitle, type: testType, subject: testSubject, dueDate: testDue, instructions: testInstructions, questions: testQuestions };
    if (editingTestId) {
      updateTest(editingTestId, testData);
      alert('Assessment updated!');
    } else {
      addTest(testData);
      alert('Assessment quiz published successfully!');
    }
    setTestTitle('');
    setTestDue('');
    setTestInstructions('');
    setTestQuestions([{ type: 'long-answer', text: '', options: ['', '', '', ''], correctOption: 0 }]);
    setEditingTestId(null);
  };

  // Grading submission handlers
  const handleOpenGradeModal = (sub, type) => {
    setSelectedSubmission({ ...sub, submissionType: type });
    setGradeInput(sub.grade || '');
    setFeedbackInput(sub.feedback || '');
    if (sub.rubricGrades) setRubricGrades(sub.rubricGrades);
    setAudioFeedback(sub.audioFeedback || null);
  };

  const handleSubmissionGradingSubmit = (isDraft = false) => {
    let finalGrade = Number(gradeInput);
    if (gradingMethod === 'rubric') {
      const criteriaList = Object.values(rubricGrades);
      finalGrade = Math.round(criteriaList.reduce((a, b) => a + b, 0) / criteriaList.length);
    } else if (gradingMethod === 'pass-fail') {
      finalGrade = gradeInput === 'Pass' ? 100 : 0;
    }

    const updates = {
      grade: finalGrade,
      feedback: feedbackInput,
      status: isDraft ? 'draft_grading' : 'graded',
      rubricGrades: gradingMethod === 'rubric' ? rubricGrades : null,
      audioFeedback
    };

    updateSubmissionState(selectedSubmission.id, updates);
    alert(isDraft ? 'Grading draft saved!' : 'Grade published successfully!');
    setSelectedSubmission(null);
  };

  const handleReturnForRevision = () => {
    updateSubmissionState(selectedSubmission.id, {
      status: 'returned_for_revision',
      feedback: feedbackInput || 'Please revise your submission with correct formatting.'
    });
    alert('Submission returned to student for corrections.');
    setSelectedSubmission(null);
  };

  // Audio feedback simulation
  const toggleAudioRecording = () => {
    if (audioRecording) {
      setAudioRecording(false);
      setAudioFeedback({
        filename: 'feedback_audio_' + Date.now() + '.mp3',
        duration: '14 seconds',
        transcription: 'Overall a very comprehensive marketing layout. I liked your branding color selections.'
      });
    } else {
      setAudioRecording(true);
      setAudioFeedback(null);
    }
  };



  // Announcement creator
  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    addAnnouncement({
      title: annTitle,
      content: annContent,
      targetAudience: annAudience,
      fileAttachment: annFile || null
    });
    alert('Announcement published to dashboard!');
    setAnnTitle('');
    setAnnContent('');
    setAnnFile('');
  };

  // Notification sender
  const handleSendNotification = (e, schedule = false) => {
    e.preventDefault();
    const notData = {
      title: notifTitle,
      type: notifType,
      targetAudience: notifAudience
    };
    if (schedule) {
      scheduleNotification({ ...notData, dateSent: notifSchedule });
      alert('Notification scheduled successfully!');
    } else {
      sendNotification(notData);
      alert('Notification broadcasted instantly!');
    }
    setNotifTitle('');
    setNotifSchedule('');
  };

  // Attendance saver
  const handleSaveAttendanceReg = () => {
    const recordsArray = students.map(student => {
      const existingRecordDay = attendance.find(a => a.date === attendanceDate);
      const existingStatus = existingRecordDay?.records?.find(r => r.studentId === student.id)?.status;
      return {
        studentId: student.id,
        status: attendanceRecords[student.id] || existingStatus || 'Present' 
      };
    });
    saveAttendance(attendanceDate, recordsArray);
    alert('Attendance register updated successfully!');
  };

  // Shared notes poster
  const handlePostSharedNote = (e) => {
    e.preventDefault();
    if (!studentNoteInput.trim()) return;
    addSharedNote({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name + ' ' + (selectedStudent.surname || ''),
      authorRole: 'facilitator',
      authorName: currentUser.name,
      content: studentNoteInput
    });
    setStudentNoteInput('');
  };

  // Global search filtering logic
  const getFilteredStudents = () => {
    return students.filter(s => {
      const matchSearch = (s.name + ' ' + (s.surname || '') + ' ' + (s.email || '') + ' ' + (s.businessType || '')).toLowerCase().includes(globalSearch.toLowerCase());
      
      const attendancePct = getStudentAttendance(s.id);
      let matchPerformance = true;
      if (filterPerformance === 'High') matchPerformance = getStudentAvgGrade(s.id) >= 80;
      else if (filterPerformance === 'Average') matchPerformance = getStudentAvgGrade(s.id) >= 50 && getStudentAvgGrade(s.id) < 80;
      else if (filterPerformance === 'Needs Attention') matchPerformance = getStudentAvgGrade(s.id) < 50;

      const matchClass = filterClass === 'All' || s.businessType?.toLowerCase().includes(filterClass.toLowerCase()) || s.occupation?.toLowerCase().includes(filterClass.toLowerCase());
      const matchType = filterStatus === 'All' || (filterStatus === 'Remote' ? s.isRemote : !s.isRemote);

      return matchSearch && matchPerformance && matchClass && matchType;
    });
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--panel-border)', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--set-green)', letterSpacing: '1px', textTransform: 'uppercase' }}>Moderator Workspace</span>
        </div>
        
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <Shield size={18} /> Dashboard Overview
        </div>
        <div className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => { setActiveTab('students'); setSelectedStudent(null); }}>
          <Users size={18} /> Student Roster
        </div>
        <div className={`nav-item ${activeTab === 'homework' ? 'active' : ''}`} onClick={() => setActiveTab('homework')}>
          <FileText size={18} /> Homework Board
        </div>
        <div className={`nav-item ${activeTab === 'classwork' ? 'active' : ''}`} onClick={() => setActiveTab('classwork')}>
          <BookOpen size={18} /> Classwork Catalogs
        </div>
        <div className={`nav-item ${activeTab === 'assessments' ? 'active' : ''}`} onClick={() => setActiveTab('assessments')}>
          <Edit3 size={18} /> Assessment Center
        </div>
        <div className={`nav-item ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => setActiveTab('announcements')}>
          <Send size={18} /> Announcements
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        
        {/* --- 1. DASHBOARD OVERVIEW --- */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="page-header">
              <h2>Facilitator Workspace</h2>
              <span className="badge" style={{ background: 'var(--set-navy)' }}>Overview</span>
            </div>

            {/* Comprehensive Widgets grid */}
            <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div className="stat-card glass-panel">
                <div className="stat-icon navy"><Users size={24} /></div>
                <div className="stat-info">
                  <h3>Total Students</h3>
                  <p>{students.length}</p>
                </div>
              </div>
              <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--set-green)' }}>
                <div className="stat-icon green"><Award size={24} /></div>
                <div className="stat-info">
                  <h3>Pending Grades</h3>
                  <p>{totalPending}</p>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon orange"><PenTool size={24} /></div>
                <div className="stat-info">
                  <h3>Homework Pending</h3>
                  <p>{pendingAssignments.length}</p>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon navy"><BookOpen size={24} /></div>
                <div className="stat-info">
                  <h3>Classwork Pending</h3>
                  <p>{pendingClasswork.length}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--set-navy)', marginBottom: '1rem' }}>Quick Actions Panel</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={() => setActiveTab('homework')} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                  <PenTool size={16} /> Grade Submissions
                </button>
                <button className="btn-secondary" onClick={() => setActiveTab('homework')} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                  <Plus size={16} /> Create Homework
                </button>
                <button className="btn-secondary" onClick={() => setActiveTab('assessments')} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                  <Plus size={16} /> Create Assessment
                </button>
                <button className="btn-outline" style={{ color: 'var(--set-navy)', borderColor: 'var(--panel-border)', fontSize: '0.85rem', padding: '0.5rem 1rem' }} onClick={() => setActiveTab('announcements')}>
                  <Send size={16} /> Broadcast Announcement
                </button>
                <button className="btn-outline" style={{ color: 'var(--set-navy)', borderColor: 'var(--panel-border)', fontSize: '0.85rem', padding: '0.5rem 1rem' }} onClick={() => setActiveTab('students')}>
                  <Users size={16} /> Student Roster
                </button>
              </div>
            </div>

            {/* Centered Layout: Subject Engagement */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              
              {/* Subject Analytics Bar Chart */}
              <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '600px' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Subject Grade Averages</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                  
                  {/* SVG Bar Chart */}
                  <svg viewBox="0 0 300 180" style={{ width: '100%' }}>
                    {/* Grid lines */}
                    <line x1="50" y1="20" x2="280" y2="20" stroke="rgba(0,0,0,0.05)" />
                    <line x1="50" y1="70" x2="280" y2="70" stroke="rgba(0,0,0,0.05)" />
                    <line x1="50" y1="120" x2="280" y2="120" stroke="rgba(0,0,0,0.05)" />
                    
                    {/* Bar 1: Business Strategy */}
                    <text x="45" y="45" fontSize="10" textAnchor="end" fill="var(--text-secondary)" fontWeight="600">Strategy</text>
                    <rect x="50" y="32" width="180" height="18" rx="4" fill="var(--set-navy)" />
                    <text x="240" y="45" fontSize="11" fill="var(--set-navy)" fontWeight="700">82%</text>

                    {/* Bar 2: Financial Literacy */}
                    <text x="45" y="95" fontSize="10" textAnchor="end" fill="var(--text-secondary)" fontWeight="600">Finance</text>
                    <rect x="50" y="82" width="165" height="18" rx="4" fill="var(--set-green)" />
                    <text x="225" y="95" fontSize="11" fill="var(--set-green)" fontWeight="700">75%</text>

                    {/* Bar 3: Marketing */}
                    <text x="45" y="145" fontSize="10" textAnchor="end" fill="var(--text-secondary)" fontWeight="600">Marketing</text>
                    <rect x="50" y="132" width="190" height="18" rx="4" fill="var(--set-orange)" />
                    <text x="250" y="145" fontSize="11" fill="var(--set-orange)" fontWeight="700">88%</text>
                    
                    {/* X axis */}
                    <line x1="50" y1="160" x2="280" y2="160" stroke="var(--set-navy)" strokeWidth="2" />
                    <text x="50" y="175" fontSize="9" textAnchor="middle" fill="var(--text-secondary)">0%</text>
                    <text x="165" y="175" fontSize="9" textAnchor="middle" fill="var(--text-secondary)">50%</text>
                    <text x="280" y="175" fontSize="9" textAnchor="middle" fill="var(--text-secondary)">100%</text>
                  </svg>

                  <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <Info size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle', color: 'var(--set-green)' }} />
                    Marketing remains the highest performing category overall, followed closely by Business Strategy canvas reviews.
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- 2. STUDENT ROSTER & DETAILS --- */}
        {activeTab === 'students' && (
          <div>
            {!selectedStudent ? (
              <div>
                <div className="page-header">
                  <h2>Student Administration</h2>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: 'white', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '0.4rem 0.8rem', alignItems: 'center', width: '250px' }}>
                      <Search size={16} color="var(--text-secondary)" />
                      <input 
                        type="text" 
                        placeholder="Search student details..." 
                        style={{ border: 'none', outline: 'none', marginLeft: '0.5rem', width: '100%', fontSize: '0.9rem' }} 
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={16} color="var(--set-navy)" />
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Filters:</span>
                  </div>
                  <div>
                    <select className="form-control" style={{ width: 'auto', padding: '0.4rem' }} value={filterPerformance} onChange={(e) => setFilterPerformance(e.target.value)}>
                      <option value="All">All Grades</option>
                      <option value="High">Excellent (&gt;=80%)</option>
                      <option value="Average">Average (50%-80%)</option>
                      <option value="Needs Attention">Needs Work (&lt;50%)</option>
                    </select>
                  </div>
                  <div>
                    <select className="form-control" style={{ width: 'auto', padding: '0.4rem' }} value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                      <option value="All">All Industries / Sectors</option>
                      <option value="Bakery">Bakery</option>
                      <option value="Laundry">Laundry</option>
                      <option value="Crafts">Crafts</option>
                    </select>
                  </div>
                  <div>
                    <select className="form-control" style={{ width: 'auto', padding: '0.4rem' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                      <option value="All">All Delivery Types</option>
                      <option value="Local">On-Campus Local</option>
                      <option value="Remote">Remote Virtual</option>
                    </select>
                  </div>
                  {(globalSearch || filterPerformance !== 'All' || filterClass !== 'All' || filterStatus !== 'All') && (
                    <button className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', color: 'var(--danger-color)', border: 'none' }} onClick={() => { setGlobalSearch(''); setFilterPerformance('All'); setFilterClass('All'); setFilterStatus('All'); }}>
                      Clear Filters
                    </button>
                  )}
                </div>

                {/* Students Roster table */}
                <div className="glass-panel table-container" style={{ padding: '2rem' }}>
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Learner Name</th>
                        <th>Type</th>
                        <th>Sector / Occupation</th>
                        <th>Attendance</th>
                        <th>Avg Grade</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredStudents().map(student => (
                        <tr key={student.id}>
                          <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '50%' }}>
                              <User size={18} color="var(--set-navy)" />
                            </div>
                            <span style={{ fontWeight: 600, color: 'var(--set-navy)' }}>{student.name} {student.surname || ''}</span>
                          </td>
                          <td>
                            <span className="badge" style={{ background: student.isRemote ? 'var(--set-orange)' : 'var(--set-navy)', fontSize: '0.65rem' }}>
                              {student.isRemote ? 'Remote' : 'Local'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem' }}>{student.businessType || student.occupation || 'Not Specified'}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{getStudentAttendance(student.id)}%</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 700, color: 'var(--set-navy)' }}>{getStudentAvgGrade(student.id)}%</span>
                              <div style={{ width: '50px', background: 'rgba(0,0,0,0.06)', height: '6px', borderRadius: '3px' }}>
                                <div style={{ width: `${getStudentAvgGrade(student.id)}%`, background: getStudentAvgGrade(student.id) >= 75 ? 'var(--set-green)' : 'var(--set-orange)', height: '6px', borderRadius: '3px' }}></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <button className="btn-outline" style={{ padding: '0.25rem 0.75rem', color: 'var(--set-navy)', border: '1px solid var(--set-navy)', fontSize: '0.8rem' }} onClick={() => setSelectedStudent(student)}>
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                      {getFilteredStudents().length === 0 && (
                        <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No matching students found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* --- DETAILED STUDENT PROFILE OVERLAY --- */
              <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(6, 28, 57, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                      <User size={32} color="var(--set-navy)" />
                    </div>
                    <div>
                      <h2 style={{ marginBottom: '0.25rem' }}>{selectedStudent.name} {selectedStudent.surname || ''}</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Attendance: <strong>{getStudentAttendance(selectedStudent.id)}%</strong> | Avg Grade: <strong>{getStudentAvgGrade(selectedStudent.id)}%</strong> | Status: <strong>{selectedStudent.isRemote ? 'Remote Student' : 'Local Student'}</strong>
                      </p>
                    </div>
                  </div>
                  <button className="btn-outline" style={{ color: 'var(--set-navy)', border: '1px solid var(--set-navy)' }} onClick={() => setSelectedStudent(null)}>Back to Roster</button>
                </div>

                {/* Profile Modules grid */}
                <div className="portal-split-layout-student">
                  
                  {/* Left Column: Personal info, Linked business, assigned mentor */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Personal Card */}
                    <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px' }}>
                      <h3 style={{ marginBottom: '1rem', color: 'var(--set-navy)', fontSize: '1.1rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '0.5rem' }}>Learner Profile Details</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
                        <p><strong>Email:</strong> {selectedStudent.email}</p>
                        <p><strong>Age:</strong> {selectedStudent.age || 'N/A'}</p>
                        <p><strong>Occupation:</strong> {selectedStudent.occupation || 'N/A'}</p>
                        <p><strong>Business Sector:</strong> {selectedStudent.businessType || 'N/A'}</p>
                        <p><strong>CIPC Registration:</strong> {selectedStudent.businessRegistrationStatus || 'N/A'}</p>
                        <p><strong>Sizanani Alumni:</strong> {selectedStudent.isSizananiAlumni || 'No'}</p>
                        
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.8rem', marginTop: '0.5rem' }}>
                          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--set-navy)' }}>Logistics Preferences</h4>
                          {selectedStudent.isRemote ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--set-orange)', fontWeight: 600 }}>
                              <Globe size={16} /> Inclusive Virtual Access (Remote)
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              <p style={{ textTransform: 'capitalize' }}><strong>Preference:</strong> {selectedStudent.transport?.type || 'Not Configured'}</p>
                              {selectedStudent.transport?.type === 'pickup' && (
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '0.5rem', borderLeft: '2px solid var(--set-green)' }}>
                                  <p><strong>Pickup Address:</strong> {selectedStudent.transport.details.address}</p>
                                  <p><strong>Contact:</strong> {selectedStudent.transport.details.emergencyContact}</p>
                                  <p><strong>Time Slot:</strong> {selectedStudent.transport.details.timePreference}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>



                  </div>

                  {/* Right Column: Academic charts, submission logs, and Shared notes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* SVG Progress & Grade trend Chart */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                      <h3 style={{ fontSize: '1rem', color: 'var(--set-navy)', marginBottom: '1rem' }}>Academic Growth Trend</h3>
                      
                      {/* SVG Line Graph */}
                      <svg viewBox="0 0 450 150" style={{ width: '100%' }}>
                        {/* Grid lines */}
                        <line x1="40" y1="20" x2="420" y2="20" stroke="rgba(0,0,0,0.05)" />
                        <line x1="40" y1="65" x2="420" y2="65" stroke="rgba(0,0,0,0.05)" />
                        <line x1="40" y1="110" x2="420" y2="110" stroke="rgba(0,0,0,0.05)" />
                        
                        {/* Axes */}
                        <line x1="40" y1="120" x2="420" y2="120" stroke="var(--set-navy)" strokeWidth="1.5" />
                        <line x1="40" y1="10" x2="40" y2="120" stroke="var(--set-navy)" strokeWidth="1.5" />

                        {/* Y axis labels */}
                        <text x="32" y="24" fontSize="8" textAnchor="end" fill="var(--text-secondary)">100%</text>
                        <text x="32" y="69" fontSize="8" textAnchor="end" fill="var(--text-secondary)">50%</text>
                        <text x="32" y="114" fontSize="8" textAnchor="end" fill="var(--text-secondary)">0%</text>

                        {/* Line Trend points (Simulated for this profile) */}
                        <path d="M 60 115 L 140 70 L 220 80 L 300 45 L 380 32" fill="none" stroke="var(--set-green)" strokeWidth="3" />
                        
                        {/* Dots */}
                        <circle cx="60" cy="115" r="4" fill="var(--set-navy)" />
                        <circle cx="140" cy="70" r="4" fill="var(--set-navy)" />
                        <circle cx="220" cy="80" r="4" fill="var(--set-navy)" />
                        <circle cx="300" cy="45" r="4" fill="var(--set-navy)" />
                        <circle cx="380" cy="32" r="4" fill="var(--set-navy)" />
                        
                        {/* Dot labels */}
                        <text x="60" y="105" fontSize="8" textAnchor="middle" fill="var(--text-secondary)">60%</text>
                        <text x="140" y="60" fontSize="8" textAnchor="middle" fill="var(--text-secondary)">78%</text>
                        <text x="220" y="70" fontSize="8" textAnchor="middle" fill="var(--text-secondary)">72%</text>
                        <text x="300" y="35" fontSize="8" textAnchor="middle" fill="var(--text-secondary)">92%</text>
                        <text x="380" y="22" fontSize="8" textAnchor="middle" fill="var(--text-secondary)">96%</text>

                        {/* X Labels */}
                        <text x="60" y="132" fontSize="8" textAnchor="middle" fill="var(--text-secondary)">Exam 1</text>
                        <text x="140" y="132" fontSize="8" textAnchor="middle" fill="var(--text-secondary)">Ass. 1</text>
                        <text x="220" y="132" fontSize="8" textAnchor="middle" fill="var(--text-secondary)">Ass. 2</text>
                        <text x="300" y="132" fontSize="8" textAnchor="middle" fill="var(--text-secondary)">Budgeting</text>
                        <text x="380" y="132" fontSize="8" textAnchor="middle" fill="var(--text-secondary)">Branding</text>
                      </svg>
                    </div>

                    {/* Academic Records Oversight */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                      <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Academic Records Oversight</h3>
                      <div className="table-container">
                        <table>
                          <thead>
                            <tr>
                              <th>Academic Item</th>
                              <th>Category</th>
                              <th>Status</th>
                              <th>Published Grade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...submissions, ...testSubmissions].filter(s => s.studentId === selectedStudent.id).map(sub => {
                              const isTest = !!sub.testId;
                              const parent = isTest ? tests.find(t => t.id === sub.testId) : assignments.find(a => a.id === sub.assignmentId);
                              return (
                                <tr key={sub.id}>
                                  <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{parent?.title || 'Unknown Item'}</td>
                                  <td><span className="badge" style={{ background: isTest ? 'var(--set-orange)' : 'var(--set-navy)', fontSize: '0.6rem' }}>{isTest ? 'Test' : 'Homework'}</span></td>
                                  <td>
                                    <span className={`status-badge ${sub.status === 'graded' ? 'status-completed' : 'status-pending'}`} style={{ fontSize: '0.7rem' }}>
                                      {sub.status === 'graded' ? `${sub.grade}%` : 'Pending Review'}
                                    </span>
                                  </td>
                                  <td style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{sub.status === 'graded' ? `${sub.grade}%` : '-'}</td>
                                </tr>
                              );
                            })}
                            {classworkSubmissions.filter(s => s.studentId === selectedStudent.id).map(sub => {
                              const parent = classwork.find(cw => cw.id === sub.classworkId);
                              return (
                                <tr key={sub.id}>
                                  <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>{parent?.title || 'Classwork'}</td>
                                  <td><span className="badge" style={{ background: 'var(--set-green)', fontSize: '0.6rem' }}>Classwork</span></td>
                                  <td>
                                    <span className="status-badge status-completed" style={{ fontSize: '0.7rem' }}>
                                      Completed
                                    </span>
                                  </td>
                                  <td style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Pass</td>
                                </tr>
                              );
                            })}
                            {[...submissions, ...testSubmissions, ...classworkSubmissions].filter(s => s.studentId === selectedStudent.id).length === 0 && (
                              <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No submissions on record.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Shared Notes feed */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                      <h3 style={{ fontSize: '1rem', color: 'var(--set-navy)', marginBottom: '1rem' }}>Student Feedback & Progress Notes</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem', padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: '8px' }}>
                        {(sharedNotes || []).filter(n => n.studentId === selectedStudent.id).map(note => (
                          <div key={note.id} style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                              <strong>{note.authorName} ({note.authorRole})</strong>
                              <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{note.content}</p>
                          </div>
                        ))}
                        {(sharedNotes || []).filter(n => n.studentId === selectedStudent.id).length === 0 && (
                          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '1rem' }}>No progress notes on record yet.</p>
                        )}
                      </div>

                      <form onSubmit={handlePostSharedNote} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Type student feedback or progress notes..." 
                          value={studentNoteInput}
                          onChange={(e) => setStudentNoteInput(e.target.value)}
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Post Note</button>
                      </form>
                    </div>

                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* --- 3. HOMEWORK BOARD --- */}
        {activeTab === 'homework' && (
          <div>
            <div className="page-header">
              <h2>Homework Management</h2>
              <span className="badge" style={{ background: 'var(--set-navy)' }}>Homework & Submissions</span>
            </div>

            <div className="portal-split-layout">
              
              {/* Left Column: Create Homework form & list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PlusCircle size={20} color="var(--set-green)" /> {editingHomeworkId ? 'Edit Practical Homework' : 'Publish Practical Homework'}
                  </h3>
                  <form onSubmit={handleSaveHomework}>
                    <div className="form-group">
                      <label>Homework Title</label>
                      <input type="text" className="form-control" required value={hwTitle} onChange={(e) => setHwTitle(e.target.value)} placeholder="e.g. Value Proposition Canvas Draft" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Subject Stream</label>
                        <select className="form-control" value={hwSubject} onChange={(e) => setHwSubject(e.target.value)}>
                          <option>Business Strategy</option>
                          <option>Financial Literacy</option>
                          <option>Marketing</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Due Date</label>
                        <input type="date" className="form-control" required value={hwDue} onChange={(e) => setHwDue(e.target.value)} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Instructions & Objectives</label>
                      <textarea className="form-control" rows="3" required value={hwDesc} onChange={(e) => setHwDesc(e.target.value)} placeholder="State the assignment goals clearly..."></textarea>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Mock Resource Attachment</label>
                        <input type="text" className="form-control" value={hwResourceFile} onChange={(e) => setHwResourceFile(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>File Size</label>
                        <input type="text" className="form-control" value={hwResourceSize} onChange={(e) => setHwResourceSize(e.target.value)} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="submit" className="btn-primary">{editingHomeworkId ? 'Update Assignment' : 'Post Assignment'}</button>
                      {editingHomeworkId && (
                        <button type="button" className="btn-outline" style={{ color: 'var(--set-navy)', borderColor: 'var(--panel-border)' }} onClick={() => { setEditingHomeworkId(null); setHwTitle(''); setHwDue(''); setHwDesc(''); }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ marginBottom: '1.5rem' }}>Active Homework Papers</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {assignments.map(a => (
                      <div key={a.id} style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: '0.9rem', margin: 0 }}>{a.title}</h4>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Due: {a.dueDate} | {a.subject || 'Strategy'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-outline" style={{ padding: '0.3rem', border: 'none', color: 'var(--set-navy)' }} onClick={() => handleEditHomework(a)}>
                            <Edit3 size={16} />
                          </button>
                          <button className="btn-outline" style={{ padding: '0.3rem', border: 'none', color: 'var(--danger-color)' }} onClick={() => { if(confirm('Delete assignment?')) deleteAssignment(a.id); }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Submissions Board & Grading Modal wrapper */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Submission reviews panel */}
                {!selectedSubmission ? (
                  <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Learner Submissions Awaiting Grading</h3>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Homework Title</th>
                            <th>Status</th>
                            <th>Submitted Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissions.map(sub => {
                            const ass = assignments.find(a => a.id === sub.assignmentId);
                            return (
                              <tr key={sub.id}>
                                <td style={{ fontWeight: 600 }}>{sub.studentName}</td>
                                <td style={{ fontSize: '0.85rem' }}>{ass?.title || 'Unknown Homework'}</td>
                                <td>
                                  <span className={`status-badge ${sub.status === 'graded' ? 'status-completed' : sub.status === 'returned_for_revision' ? 'status-pending' : 'status-pending'}`} style={{ fontSize: '0.7rem' }}>
                                    {sub.status === 'graded' ? `Graded (${sub.grade}%)` : sub.status === 'returned_for_revision' ? 'Returned' : 'Submitted'}
                                  </span>
                                </td>
                                <td style={{ fontSize: '0.8rem' }}>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                                <td>
                                  <button className="btn-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => handleOpenGradeModal(sub, 'homework')}>
                                    {sub.status === 'graded' ? 'Re-grade' : 'Grade'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                          {submissions.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>All submissions evaluated!</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* --- SUBMISSION GRADING VIEW --- */
                  <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem' }}>
                      <div>
                        <h3 style={{ margin: 0 }}>Marking Board: {selectedSubmission.studentName}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Homework: {assignments.find(a => a.id === selectedSubmission.assignmentId)?.title}
                        </p>
                      </div>
                      <button className="btn-outline" style={{ color: 'var(--set-navy)', border: '1px solid var(--panel-border)' }} onClick={() => setSelectedSubmission(null)}>
                        <X size={16} /> Close
                      </button>
                    </div>

                    {/* Responses & Files */}
                    <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--set-navy)' }}>Submitted Assets</h4>
                      {selectedSubmission.files && selectedSubmission.files.map((f, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                          <span style={{ fontWeight: 600 }}>📎 {f.name} ({f.size})</span>
                          <button className="btn-outline" style={{ color: 'var(--set-green)', border: 'none', padding: '0.2rem', fontSize: '0.75rem' }} onClick={() => alert(`Simulating file download: ${f.name}`)}>
                            <Download size={14} /> Download File
                          </button>
                        </div>
                      ))}
                      {selectedSubmission.comments && (
                        <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.5rem' }}>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Student Comments:</p>
                          {selectedSubmission.comments.map(c => (
                            <p key={c.id} style={{ fontSize: '0.85rem', background: 'white', padding: '0.5rem', borderRadius: '4px', marginTop: '0.25rem' }}>
                              <strong>{c.sender === 'student' ? 'Student' : 'Facilitator'}:</strong> {c.text}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Grading Selection */}
                    <div className="form-group">
                      <label>Grading Method</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" className={`btn-outline ${gradingMethod === 'percentage' ? 'active-selection' : ''}`} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', color: 'var(--set-navy)', borderColor: 'var(--panel-border)' }} onClick={() => setGradingMethod('percentage')}>Percentage</button>
                        <button type="button" className={`btn-outline ${gradingMethod === 'rubric' ? 'active-selection' : ''}`} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', color: 'var(--set-navy)', borderColor: 'var(--panel-border)' }} onClick={() => setGradingMethod('rubric')}>Rubric</button>
                        <button type="button" className={`btn-outline ${gradingMethod === 'pass-fail' ? 'active-selection' : ''}`} style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', color: 'var(--set-navy)', borderColor: 'var(--panel-border)' }} onClick={() => setGradingMethod('pass-fail')}>Pass/Fail</button>
                      </div>
                    </div>

                    {/* Grade Input fields depending on method */}
                    {gradingMethod === 'percentage' && (
                      <div className="form-group">
                        <label>Enter Grade Score (0-100%)</label>
                        <input type="number" min="0" max="100" className="form-control" value={gradeInput} onChange={(e) => setGradeInput(e.target.value)} />
                      </div>
                    )}

                    {gradingMethod === 'pass-fail' && (
                      <div className="form-group">
                        <label>Evaluation Decision</label>
                        <select className="form-control" value={gradeInput} onChange={(e) => setGradeInput(e.target.value)}>
                          <option value="">Select status...</option>
                          <option value="Pass">Pass (100%)</option>
                          <option value="Fail">Fail (0%)</option>
                        </select>
                      </div>
                    )}

                    {gradingMethod === 'rubric' && (
                      <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--set-navy)' }}>Rubric Assessment Criteria</h4>
                        {Object.keys(rubricGrades).map(criteria => (
                          <div key={criteria} style={{ marginBottom: '0.8rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                              <span>{criteria}</span>
                              <span>{rubricGrades[criteria]} / 100</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              style={{ width: '100%', accentColor: 'var(--set-green)' }}
                              value={rubricGrades[criteria]} 
                              onChange={(e) => setRubricGrades({ ...rubricGrades, [criteria]: Number(e.target.value) })}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Feedback Options */}
                    <div className="form-group">
                      <label>Written Feedback Notes</label>
                      <textarea className="form-control" rows="3" value={feedbackInput} onChange={(e) => setFeedbackInput(e.target.value)} placeholder="Provide written explanation..."></textarea>
                    </div>

                    {/* Audio Feedback Simulation */}
                    <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--set-navy)', margin: 0 }}>Simulated Audio Feedback</h4>
                        {audioFeedback ? (
                          <p style={{ fontSize: '0.75rem', color: 'var(--set-green)', margin: '0.2rem 0 0 0' }}>
                            🎤 Recorded: {audioFeedback.filename} ({audioFeedback.duration})
                          </p>
                        ) : (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Record verbal notes</p>
                        )}
                      </div>
                      <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: audioRecording ? 'var(--danger-color)' : 'var(--set-navy)' }} onClick={toggleAudioRecording}>
                        {audioRecording ? '⏹️ Stop Recording' : '🎙️ Record Feedback'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleSubmissionGradingSubmit(false)}>Publish Grade</button>
                      <button className="btn-outline" style={{ color: 'var(--set-navy)', borderColor: 'var(--panel-border)', flex: 1, justifyContent: 'center' }} onClick={() => handleSubmissionGradingSubmit(true)}>Save Draft</button>
                      <button className="btn-outline" style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)', flex: 1, justifyContent: 'center' }} onClick={handleReturnForRevision}>Return for Revision</button>
                    </div>

                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* --- 4. CLASSWORK MANAGEMENT --- */}
        {activeTab === 'classwork' && (
          <div>
            <div className="page-header">
              <h2>Classwork Management</h2>
              <span className="badge" style={{ background: 'var(--set-green)' }}>Exercises & Reading</span>
            </div>

            <div className="portal-split-layout">
              
              {/* Classwork Creator Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PlusCircle size={20} color="var(--set-green)" /> {editingClassworkId ? 'Edit Classwork Item' : 'Create Classwork Item'}
                  </h3>
                  <form onSubmit={handleSaveClasswork}>
                    <div className="form-group">
                      <label>Classwork Title</label>
                      <input type="text" className="form-control" required value={cwTitle} onChange={(e) => setCwTitle(e.target.value)} placeholder="e.g. Value Proposition Statement Mapping" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Category</label>
                        <select className="form-control" value={cwCategory} onChange={(e) => setCwCategory(e.target.value)}>
                          <option>Worksheet</option>
                          <option>Exercise</option>
                          <option>Project</option>
                          <option>Practical Activity</option>
                          <option>Reading Task</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Subject Stream</label>
                        <select className="form-control" value={cwSubject} onChange={(e) => setCwSubject(e.target.value)}>
                          <option>Business Strategy</option>
                          <option>Financial Literacy</option>
                          <option>Marketing</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Due Date</label>
                      <input type="date" className="form-control" required value={cwDue} onChange={(e) => setCwDue(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Description & Study Outline</label>
                      <textarea className="form-control" rows="3" required value={cwDesc} onChange={(e) => setCwDesc(e.target.value)} placeholder="Detail the class objectives..."></textarea>
                    </div>

                    <h4 style={{ fontSize: '0.9rem', color: 'var(--set-navy)', marginBottom: '0.5rem' }}>Interactive Response Questions Builder</h4>
                    {cwQuestions.map((q, idx) => (
                      <div key={q.id} style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem', position: 'relative' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Q{idx + 1}</span>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="e.g. Enter question text..." 
                            value={q.text} 
                            onChange={(e) => handleCwQuestionChange(idx, 'text', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn-outline" style={{ color: 'var(--set-navy)', border: '1px solid var(--panel-border)', fontSize: '0.8rem', padding: '0.4rem 0.8rem', marginBottom: '1.5rem', width: '100%', justifyContent: 'center' }} onClick={handleAddCwQuestion}>
                      + Add Question Item
                    </button>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="submit" className="btn-primary">{editingClassworkId ? 'Update Classwork' : 'Publish Classwork'}</button>
                      {editingClassworkId && (
                        <button type="button" className="btn-outline" style={{ color: 'var(--set-navy)', borderColor: 'var(--panel-border)' }} onClick={() => { setEditingClassworkId(null); setCwTitle(''); setCwDue(''); setCwDesc(''); }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Classwork Catalog Table */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Classwork Catalog</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {classwork.map(cw => (
                    <div key={cw.id} style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span className="badge" style={{ background: 'var(--set-navy)', fontSize: '0.55rem' }}>{cw.category}</span>
                          <h4 style={{ fontSize: '0.95rem', margin: '0.3rem 0 0 0' }}>{cw.title}</h4>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-outline" style={{ padding: '0.3rem', border: 'none', color: 'var(--set-navy)' }} onClick={() => { setCwTitle(cw.title); setCwCategory(cw.category); setCwSubject(cw.subject || 'Business Strategy'); setCwDue(cw.dueDate); setCwDesc(cw.description); setCwQuestions(cw.questions || []); setEditingClassworkId(cw.id); }}>
                            <Edit3 size={16} />
                          </button>
                          <button className="btn-outline" style={{ padding: '0.3rem', border: 'none', color: 'var(--danger-color)' }} onClick={() => { if(confirm('Delete classwork?')) deleteClasswork(cw.id); }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{cw.description}</p>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--set-green)', marginTop: '0.5rem' }}>Due: {cw.dueDate}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- 5. ASSESSMENT CENTER --- */}
        {activeTab === 'assessments' && (
          <div>
            <div className="page-header">
              <h2>Assessment Center</h2>
              <span className="badge" style={{ background: 'var(--set-orange)' }}>Quizzes, Tests & Exams</span>
            </div>

            <div className="portal-split-layout-test">
              
              {/* Create/Edit Assessment form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PlusCircle size={20} color="var(--set-orange)" /> {editingTestId ? 'Edit Quiz / Test paper' : 'Create Quiz / Test paper'}
                  </h3>
                  <form onSubmit={handleSaveTest}>
                    <div className="form-group">
                      <label>Assessment Title</label>
                      <input type="text" className="form-control" required value={testTitle} onChange={(e) => setTestTitle(e.target.value)} placeholder="e.g. Term 1 Accounting Fundamentals" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Assessment Type</label>
                        <select className="form-control" value={testType} onChange={(e) => setTestType(e.target.value)}>
                          <option>Quiz</option>
                          <option>Test</option>
                          <option>Exam</option>
                          <option>Project</option>
                          <option>Assignment</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Subject Stream</label>
                        <select className="form-control" value={testSubject} onChange={(e) => setTestSubject(e.target.value)}>
                          <option>Business Strategy</option>
                          <option>Financial Literacy</option>
                          <option>Marketing</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Due Date / Close Date</label>
                      <input type="date" className="form-control" required value={testDue} onChange={(e) => setTestDue(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Instructions for Candidates</label>
                      <textarea className="form-control" rows="2" value={testInstructions} onChange={(e) => setTestInstructions(e.target.value)} placeholder="Outline quiz constraints..."></textarea>
                    </div>

                    <h4 style={{ fontSize: '0.9rem', color: 'var(--set-navy)', marginBottom: '0.8rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1rem' }}>Questions Builder</h4>
                    {testQuestions.map((q, idx) => (
                      <div key={idx} style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', position: 'relative' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Q{idx + 1}</span>
                          <select className="form-control" style={{ width: 'auto', padding: '0.2rem' }} value={q.type} onChange={(e) => handleTestQuestionChange(idx, 'type', e.target.value)}>
                            <option value="long-answer">Long Answer (Text)</option>
                            <option value="short-answer">Short Answer</option>
                            <option value="multiple-choice">Multiple Choice (MCQ)</option>
                          </select>
                        </div>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Enter question text..." 
                          value={q.text} 
                          onChange={(e) => handleTestQuestionChange(idx, 'text', e.target.value)}
                          required
                        />

                        {q.type === 'multiple-choice' && (
                          <div style={{ marginTop: '0.5rem', background: 'white', padding: '0.5rem', borderRadius: '6px' }}>
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.3rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{String.fromCharCode(65 + oIdx)}.</span>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  style={{ padding: '0.2rem', fontSize: '0.85rem' }} 
                                  value={opt} 
                                  onChange={(e) => handleTestMcqOptionChange(idx, oIdx, e.target.value)}
                                  required
                                />
                                <input 
                                  type="radio" 
                                  name={`correct-${idx}`} 
                                  checked={q.correctOption === oIdx} 
                                  onChange={() => handleTestQuestionChange(idx, 'correctOption', oIdx)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <button type="button" className="btn-outline" style={{ color: 'var(--set-navy)', border: '1px solid var(--panel-border)', fontSize: '0.8rem', padding: '0.4rem 0.8rem', width: '100%', justifyContent: 'center', marginBottom: '1.5rem' }} onClick={handleAddTestQuestion}>
                      + Add Question
                    </button>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="submit" className="btn-primary">Publish assessment paper</button>
                      {editingTestId && (
                        <button type="button" className="btn-outline" style={{ color: 'var(--set-navy)', borderColor: 'var(--panel-border)' }} onClick={() => { setEditingTestId(null); setTestTitle(''); setTestDue(''); setTestInstructions(''); }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Assessment list */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Active Assessments Directory</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {tests.map(t => (
                    <div key={t.id} style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span className="badge" style={{ background: 'var(--set-orange)', fontSize: '0.55rem' }}>{t.type}</span>
                          <h4 style={{ fontSize: '0.95rem', margin: '0.3rem 0 0 0' }}>{t.title}</h4>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-outline" style={{ padding: '0.3rem', border: 'none', color: 'var(--set-navy)' }} onClick={() => { setTestTitle(t.title); setTestType(t.type); setTestSubject(t.subject || 'Business Strategy'); setTestDue(t.dueDate); setTestInstructions(t.instructions || ''); setTestQuestions(t.questions || []); setEditingTestId(t.id); }}>
                            <Edit3 size={16} />
                          </button>
                          <button className="btn-outline" style={{ padding: '0.3rem', border: 'none', color: 'var(--danger-color)' }} onClick={() => { if(confirm('Delete assessment?')) deleteTest(t.id); }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Questions count: {t.questions?.length || 0}</p>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--set-green)', marginTop: '0.5rem' }}>Due Date: {t.dueDate}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}





        {/* --- 8. ANNOUNCEMENTS & NOTIFICATIONS --- */}
        {activeTab === 'announcements' && (
          <div>
            <div className="page-header">
              <h2>Communications Board</h2>
              <span className="badge" style={{ background: 'var(--set-navy)' }}>Broadcast Announcements & Alerts</span>
            </div>

            <div className="portal-split-layout-equal">
              
              {/* Announcement publisher */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Send size={18} color="var(--set-navy)" /> Broadcast Announcement
                  </h3>
                  <form onSubmit={handleCreateAnnouncement}>
                    <div className="form-group">
                      <label>Announcement Subject Title</label>
                      <input type="text" className="form-control" required value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="e.g. Important changes to graduation schedules..." />
                    </div>
                    <div className="form-group">
                      <label>Target Audience</label>
                      <select className="form-control" value={annAudience} onChange={(e) => setAnnAudience(e.target.value)}>
                        <option>All students</option>
                        <option>Business Strategy Class</option>
                        <option>Financial Literacy Class</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Announcement Body Text</label>
                      <textarea className="form-control" rows="4" required value={annContent} onChange={(e) => setAnnContent(e.target.value)} placeholder="Provide information body..."></textarea>
                    </div>
                    <div className="form-group">
                      <label>Mock Resource Attachment</label>
                      <input type="text" className="form-control" placeholder="e.g. graduation_guidelines.pdf" value={annFile} onChange={(e) => setAnnFile(e.target.value)} />
                    </div>
                    <button type="submit" className="btn-primary">Send Announcement Board</button>
                  </form>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ marginBottom: '1.5rem' }}>Recent Broadcast logs</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {announcements.map(ann => (
                      <div key={ann.id} style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                          <span className="badge" style={{ background: 'var(--set-orange)', fontSize: '0.55rem' }}>{ann.targetAudience}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{ann.date}</span>
                        </div>
                        <h4 style={{ fontSize: '0.9rem', margin: 0, color: 'var(--set-navy)' }}>{ann.title}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>{ann.content}</p>
                        {ann.fileAttachment && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--set-green)', fontWeight: 600, marginTop: '0.5rem' }}>📎 {ann.fileAttachment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notifications tracker */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={18} color="var(--set-orange)" /> Direct Alerts Dispatcher
                  </h3>
                  <form>
                    <div className="form-group">
                      <label>Notification Headline Alert</label>
                      <input type="text" className="form-control" required value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} placeholder="e.g. Homework 2 reminder: Due in 2 hours." />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Notification Type</label>
                        <select className="form-control" value={notifType} onChange={(e) => setNotifType(e.target.value)}>
                          <option>Homework Alert</option>
                          <option>Assessment Reminder</option>
                          <option>Grade Releases</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Target Group</label>
                        <select className="form-control" value={notifAudience} onChange={(e) => setNotifAudience(e.target.value)}>
                          <option>All students</option>
                          <option>Specific classes</option>
                        </select>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Schedule Release Date</label>
                        <input type="date" className="form-control" value={notifSchedule} onChange={(e) => setNotifSchedule(e.target.value)} />
                      </div>
                      <button type="button" className="btn-secondary" style={{ alignSelf: 'flex-end', justifyContent: 'center' }} onClick={(e) => handleSendNotification(e, true)}>Schedule Alert</button>
                    </div>

                    <button type="button" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={(e) => handleSendNotification(e, false)}>Broadcast Alert Instantly</button>
                  </form>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ marginBottom: '1.5rem' }}>Direct Notifications delivery metrics</h3>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Message</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Delivery</th>
                          <th>Engagement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notifications.map(not => (
                          <tr key={not.id}>
                            <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{not.title}</td>
                            <td style={{ fontSize: '0.75rem' }}>{not.type}</td>
                            <td>
                              <span className={`status-badge ${not.status === 'Sent' ? 'status-completed' : 'status-pending'}`} style={{ fontSize: '0.65rem' }}>
                                {not.status}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.75rem' }}>{not.deliveryRate}</td>
                            <td style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{not.engagementRate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}



      </main>
    </div>
  );
}
