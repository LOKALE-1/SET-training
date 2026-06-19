import { useState, useRef } from 'react';
import { 
  BookOpen, Upload, CheckCircle, FileText, User, Bell, Star, Bus, 
  Download, Clock, MessageSquare, MapPin, 
  Award, BarChart2, CheckSquare, X, Paperclip
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function StudentPortal() {
  const { 
    currentUser, 
    assignments, submissions, submitAssignment, saveHomeworkDraft, saveHomeworkComment,
    classwork, classworkSubmissions, submitClasswork,
    tests, testSubmissions, submitTest, 
    updateProfile, lessonPlans, feedbacks, submitFeedback 
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || '',
    surname: currentUser.surname || '',
    address: currentUser.address || '',
    occupation: currentUser.occupation || '',
    businessType: currentUser.businessType || '',
    email: currentUser.email || '',
    businessRegistrationStatus: currentUser.businessRegistrationStatus || 'Not Registered',
    age: currentUser.age || '',
    isSizananiAlumni: currentUser.isSizananiAlumni || 'No',
    isRemote: currentUser.isRemote !== undefined ? String(currentUser.isRemote) : 'false'
  });

  const [saveStatus, setSaveStatus] = useState(null);
  
  // Test Taking State
  const [takingTest, setTakingTest] = useState(null);
  const [testAnswers, setTestAnswers] = useState({});

  // Feedback Form State
  const [feedbackCategory, setFeedbackCategory] = useState('Course Content');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [hoverRating, setHoverRating] = useState(null);

  // Transport Arrangement Form State
  const [transportType, setTransportType] = useState(currentUser.transport?.type || 'none');
  const [transportDetails, setTransportDetails] = useState({
    address: currentUser.transport?.details?.address || currentUser.address || '',
    emergencyContact: currentUser.transport?.details?.emergencyContact || '',
    timePreference: currentUser.transport?.details?.timePreference || '08:00 AM',
    notes: currentUser.transport?.details?.notes || ''
  });
  const [transportSaved, setTransportSaved] = useState(false);

  // Lesson Plans Search & Filter State
  const [lessonFilter, setLessonFilter] = useState('all'); // 'all' | 'current' | 'past'
  const [lessonSearch, setLessonSearch] = useState('');
  const [downloadingPlanId, setDownloadingPlanId] = useState(null);



  // --- NEW STATES FOR CORE MODULES ---
  // Homework state
  const [activeHomeworkId, setActiveHomeworkId] = useState(null);
  const [hwFilter, setHwFilter] = useState('all'); // 'all' | 'pending' | 'submitted' | 'graded'
  const [hwCommentText, setHwCommentText] = useState('');
  const [hwUploadProgress, setHwUploadProgress] = useState(null); // null or 0-100
  const [hwUploadedFiles, setHwUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Classwork state
  const [activeClassworkId, setActiveClassworkId] = useState(null);
  const [cwFilter, setCwFilter] = useState('all'); // 'all' | worksheets etc.
  const [cwAnswers, setCwAnswers] = useState({});

  // Assessments state
  const [assessmentFilter, setAssessmentFilter] = useState('all');
  const [activeAssessmentId, setActiveAssessmentId] = useState(null);
  const [asmUploadedFiles, setAsmUploadedFiles] = useState([]);
  const [asmProgress, setAsmProgress] = useState(null);
  const [asmCommentText, setAsmCommentText] = useState('');
  const asmFileInputRef = useRef(null);

  // Grades state
  const [selectedGradeItem, setSelectedGradeItem] = useState(null); // For Rubric Detail modal

  // ----------------------------------------
  // Helper calculations
  // ----------------------------------------
  const mySubmissions = submissions.filter(s => s.studentId === currentUser.id);
  const myClassworkSubmissions = classworkSubmissions.filter(s => s.studentId === currentUser.id);
  const myTestSubmissions = testSubmissions.filter(s => s.studentId === currentUser.id);

  // Dynamic Badges count for navigation
  const pendingAssignmentsCount = assignments.filter(a => {
    const sub = mySubmissions.find(s => s.assignmentId === a.id);
    return !sub || sub.status === 'returned_for_revision' || sub.status === 'in_progress';
  }).length;

  const pendingClassworkCount = classwork.filter(c => {
    const sub = myClassworkSubmissions.find(s => s.classworkId === c.id);
    return !sub || sub.status === 'in_progress';
  }).length;

  const pendingTestsCount = tests.filter(t => {
    const sub = myTestSubmissions.find(s => s.testId === t.id);
    return !sub;
  }).length;



  const handleTestSubmit = () => {
    submitTest({
      testId: takingTest.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      answers: testAnswers,
      submittedAt: new Date().toISOString()
    });
    setTakingTest(null);
    setTestAnswers({});
    setActiveTab('assessments');
  };

  const handleSaveTransport = (e) => {
    e.preventDefault();
    const updatedProfile = {
      ...currentUser,
      transport: {
        type: transportType,
        details: transportType === 'pickup' ? transportDetails : { address: '', emergencyContact: '', timePreference: '', notes: transportDetails.notes }
      }
    };
    updateProfile(updatedProfile);
    setTransportSaved(true);
    setTimeout(() => setTransportSaved(false), 3000);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackContent.trim()) return;
    submitFeedback({
      studentId: currentUser.id,
      studentName: currentUser.name,
      category: feedbackCategory,
      rating: feedbackRating,
      content: feedbackContent
    });
    setFeedbackContent('');
    setFeedbackRating(5);
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 3000);
  };

  const simulateDownload = (fileName) => {
    setDownloadingPlanId(fileName);
    setTimeout(() => {
      setDownloadingPlanId(null);
      alert(`Download of ${fileName} is complete!`);
    }, 1200);
  };

  // ----------------------------------------
  // Homework Action Handlers
  // ----------------------------------------
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFilesSelected(e.target.files);
    }
  };

  const handleFilesSelected = (filesList) => {
    setHwUploadProgress(0);
    const interval = setInterval(() => {
      setHwUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          const newFiles = Array.from(filesList).map(file => ({
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            type: file.type
          }));
          setHwUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);
          return null;
        }
        return prev + 25;
      });
    }, 300);
  };

  const removeUploadedFile = (idx) => {
    setHwUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const submitHomeworkCommentHandler = (assignmentId) => {
    if (!hwCommentText.trim()) return;
    saveHomeworkComment(assignmentId, hwCommentText, 'student');
    setHwCommentText('');
  };

  const saveHomeworkAsDraft = (assignmentId) => {
    saveHomeworkDraft({
      assignmentId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      files: hwUploadedFiles
    });
    alert("Draft saved successfully!");
  };

  const submitHomeworkFinal = (assignmentId) => {
    if (hwUploadedFiles.length === 0) {
      alert("Please upload at least one file before submitting.");
      return;
    }
    submitAssignment({
      assignmentId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      files: hwUploadedFiles,
      comments: hwCommentText.trim() ? [{ sender: 'student', text: hwCommentText, timestamp: new Date().toISOString() }] : []
    });
    setHwCommentText('');
    alert("Homework submitted successfully!");
    setActiveHomeworkId(null);
  };

  // ----------------------------------------
  // Classwork Action Handlers
  // ----------------------------------------
  const openClassworkDrawer = (cw) => {
    setActiveClassworkId(cw.id);
    const sub = myClassworkSubmissions.find(s => s.classworkId === cw.id);
    setCwAnswers(sub ? sub.answers : {});
  };

  const saveClassworkDraftHandler = (cwId) => {
    submitClasswork(cwId, cwAnswers, false);
    alert("Classwork draft saved locally!");
  };

  const submitClassworkFinalHandler = (cwId) => {
    submitClasswork(cwId, cwAnswers, true);
    alert("Classwork completed and submitted successfully!");
    setActiveClassworkId(null);
  };

  // ----------------------------------------
  // Assessments Project Upload Handlers
  // ----------------------------------------
  const handleAsmFileSelected = (filesList) => {
    setAsmProgress(0);
    const interval = setInterval(() => {
      setAsmProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          const newFiles = Array.from(filesList).map(file => ({
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            type: file.type
          }));
          setAsmUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);
          return null;
        }
        return prev + 25;
      });
    }, 300);
  };

  const submitAssessmentProject = (testId) => {
    if (asmUploadedFiles.length === 0) {
      alert("Please upload your project submission files.");
      return;
    }
    submitTest({
      testId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      files: asmUploadedFiles,
      comments: asmCommentText.trim() ? [{ sender: 'student', text: asmCommentText, timestamp: new Date().toISOString() }] : [],
      status: 'pending'
    });
    setAsmCommentText('');
    setAsmUploadedFiles([]);
    alert("Project submitted successfully!");
    setActiveAssessmentId(null);
  };

  // ----------------------------------------
  // Grades & GPA Formulas
  // ----------------------------------------
  const gradedHomeworks = mySubmissions.filter(s => s.status === 'graded');
  const gradedClassworks = myClassworkSubmissions.filter(s => s.status === 'reviewed' && s.feedback); // simulated reviews
  const gradedAssessments = myTestSubmissions.filter(s => s.status === 'graded');

  const overallAverage = (() => {
    let totalScore = 0;
    let totalItems = 0;

    gradedHomeworks.forEach(h => { totalScore += h.grade; totalItems++; });
    gradedAssessments.forEach(a => { totalScore += a.grade; totalItems++; });
    
    // Classwork is reviewed but doesn't always have scores. We can assume completed classworks give 100, reviewed give average 90
    myClassworkSubmissions.forEach(c => {
      if (c.status === 'reviewed') { totalScore += 95; totalItems++; }
      else if (c.status === 'completed') { totalScore += 85; totalItems++; }
    });

    return totalItems > 0 ? totalScore / totalItems : 85; // default simulated average
  })();

  const getLetterGrade = (score) => {
    if (score >= 90) return { letter: 'A+', color: 'var(--set-green)' };
    if (score >= 80) return { letter: 'A', color: 'var(--set-green)' };
    if (score >= 70) return { letter: 'B', color: 'var(--set-navy)' };
    if (score >= 60) return { letter: 'C', color: 'var(--set-orange)' };
    if (score >= 50) return { letter: 'D', color: 'var(--set-orange)' };
    return { letter: 'F', color: 'var(--danger-color)' };
  };

  const filteredLessonPlans = lessonPlans.filter(plan => {
    const matchesFilter = lessonFilter === 'all' || plan.status === lessonFilter;
    const matchesSearch = plan.title.toLowerCase().includes(lessonSearch.toLowerCase()) || 
                          plan.description.toLowerCase().includes(lessonSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="dashboard-layout animate-fade-in">
      <aside className="sidebar">
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <User size={20} /> Dashboard
        </div>
        <div className={`nav-item ${activeTab === 'lesson-plans' ? 'active' : ''}`} onClick={() => setActiveTab('lesson-plans')}>
          <BookOpen size={20} /> Lesson Plans
        </div>
        <div className={`nav-item ${activeTab === 'homework' ? 'active' : ''}`} onClick={() => { setActiveTab('homework'); setActiveHomeworkId(null); }}>
          <FileText size={20} /> Homework
          {pendingAssignmentsCount > 0 && <span className="badge" style={{marginLeft: 'auto'}}>{pendingAssignmentsCount}</span>}
        </div>
        <div className={`nav-item ${activeTab === 'classwork' ? 'active' : ''}`} onClick={() => { setActiveTab('classwork'); setActiveClassworkId(null); }}>
          <CheckSquare size={20} /> Classwork
          {pendingClassworkCount > 0 && <span className="badge" style={{marginLeft: 'auto', background: 'var(--set-green)'}}>{pendingClassworkCount}</span>}
        </div>
        <div className={`nav-item ${activeTab === 'assessments' ? 'active' : ''}`} onClick={() => { setActiveTab('assessments'); setTakingTest(null); setActiveAssessmentId(null); }}>
          <Award size={20} /> Assessments
          {pendingTestsCount > 0 && <span className="badge" style={{marginLeft: 'auto', background: 'var(--set-orange)'}}>{pendingTestsCount}</span>}
        </div>
        <div className={`nav-item ${activeTab === 'grades' ? 'active' : ''}`} onClick={() => { setActiveTab('grades'); setSelectedGradeItem(null); }}>
          <BarChart2 size={20} /> Grades & Results
        </div>
        <div className={`nav-item ${activeTab === 'transport' ? 'active' : ''}`} onClick={() => setActiveTab('transport')}>
          <Bus size={20} /> Transport
        </div>

        <div className={`nav-item ${activeTab === 'feedback' ? 'active' : ''}`} onClick={() => setActiveTab('feedback')}>
          <MessageSquare size={20} /> Give Feedback
        </div>
        <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={20} /> My Profile
        </div>
      </aside>

      <main className="dashboard-content">
        {/* ========================================================================= */}
        {/* DASHBOARD TAB */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="page-header">
              <h2>Welcome back, {currentUser.name}</h2>
              <button className="btn-outline" style={{ background: 'var(--set-navy)' }}><Bell size={18} /> Notifications</button>
            </div>
            


            <div className="grid-cards">
              <div className="stat-card glass-panel">
                <div className="stat-icon orange"><FileText size={28} /></div>
                <div className="stat-info">
                  <h3>Pending Tasks</h3>
                  <p>{pendingAssignmentsCount + pendingClassworkCount + pendingTestsCount}</p>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon green"><CheckCircle size={28} /></div>
                <div className="stat-info">
                  <h3>Completed Work</h3>
                  <p>{mySubmissions.filter(s => s.status !== 'in_progress').length + myClassworkSubmissions.filter(s => s.status === 'completed' || s.status === 'reviewed').length + myTestSubmissions.length}</p>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon navy"><Award size={28} /></div>
                <div className="stat-info">
                  <h3>Academic Score</h3>
                  <p>{overallAverage.toFixed(0)}%</p>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--set-navy)' }}>Recent Grades & Instructor Feedback</h3>
                {[...mySubmissions, ...myTestSubmissions].filter(s => s.status === 'graded').length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No graded items yet.</p>
                ) : (
                  [...mySubmissions, ...myTestSubmissions].filter(s => s.status === 'graded').slice(0, 3).map(sub => {
                    const isTest = !!sub.testId;
                    const parent = isTest ? tests.find(t => t.id === sub.testId) : assignments.find(a => a.id === sub.assignmentId);
                    return (
                      <div key={sub.id} style={{ background: 'rgba(75, 142, 61, 0.03)', padding: '1.2rem', borderRadius: '12px', borderLeft: '4px solid var(--set-green)', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <h4 style={{ fontSize: '0.95rem', margin: 0 }}>{parent?.title}</h4>
                          <span className="badge" style={{ background: isTest ? 'var(--set-orange)' : 'var(--set-navy)', fontSize: '0.65rem' }}>{isTest ? (parent?.type || 'Test') : 'Homework'}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.85rem' }}>"{sub.feedback}"</p>
                        <div style={{ marginTop: '0.8rem', fontWeight: 'bold', color: 'var(--set-green)', fontSize: '0.9rem' }}>Grade: {sub.grade}% ({getLetterGrade(sub.grade).letter})</div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--set-navy)' }}>Current Lesson Plans</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {lessonPlans.filter(p => p.status === 'current').slice(0, 3).map(plan => (
                    <div key={plan.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', margin: 0 }}>{plan.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{plan.term} • {plan.week}</span>
                      </div>
                      <button className="btn-outline" style={{ border: '1px solid var(--set-navy)', color: 'var(--set-navy)', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => simulateDownload(plan.fileUrl)}>
                        Download
                      </button>
                    </div>
                  ))}
                  <button className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.9rem' }} onClick={() => setActiveTab('lesson-plans')}>
                    View All Academic Materials
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LESSON PLANS TAB */}
        {/* ========================================================================= */}
        {activeTab === 'lesson-plans' && (
          <div>
            <div className="page-header">
              <div>
                <h2>Academic Lesson Plans</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Access past and current lesson materials to support your business coursework.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={lessonFilter === 'all' ? 'btn-secondary' : 'btn-outline'} 
                  onClick={() => setLessonFilter('all')}
                  style={{ color: lessonFilter === 'all' ? 'white' : 'var(--set-navy)', border: '1px solid var(--set-navy)', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  All Materials
                </button>
                <button 
                  className={lessonFilter === 'current' ? 'btn-secondary' : 'btn-outline'} 
                  onClick={() => setLessonFilter('current')}
                  style={{ color: lessonFilter === 'current' ? 'white' : 'var(--set-navy)', border: '1px solid var(--set-navy)', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Current Term
                </button>
                <button 
                  className={lessonFilter === 'past' ? 'btn-secondary' : 'btn-outline'} 
                  onClick={() => setLessonFilter('past')}
                  style={{ color: lessonFilter === 'past' ? 'white' : 'var(--set-navy)', border: '1px solid var(--set-navy)', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Past Archives
                </button>
              </div>

              <input 
                type="text" 
                className="form-control" 
                placeholder="Search plans by title or keywords..." 
                style={{ maxWidth: '300px' }}
                value={lessonSearch}
                onChange={e => setLessonSearch(e.target.value)}
              />
            </div>

            {filteredLessonPlans.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No lesson plans found matching your filters.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredLessonPlans.map(plan => (
                  <div key={plan.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                        <span className="badge" style={{ background: plan.status === 'current' ? 'var(--set-green)' : 'var(--text-secondary)', fontSize: '0.65rem' }}>
                          {plan.status === 'current' ? 'Current Module' : 'Archived'}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--set-navy)' }}>{plan.term} • {plan.week}</span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--set-navy)' }}>{plan.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {plan.description}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <p>Uploaded: {plan.date}</p>
                        <p>Instructor: {plan.uploadedBy}</p>
                      </div>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        onClick={() => simulateDownload(plan.fileUrl)}
                        disabled={downloadingPlanId === plan.id}
                      >
                        <Download size={14} /> {plan.fileSize}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* HOMEWORK TAB */}
        {/* ========================================================================= */}
        {activeTab === 'homework' && (
          <div>
            {activeHomeworkId ? (
              // ----------------------------------------
              // Detailed View of Specific Homework
              // ----------------------------------------
              (() => {
                const hw = assignments.find(a => a.id === activeHomeworkId);
                const sub = mySubmissions.find(s => s.assignmentId === activeHomeworkId);
                const status = sub ? sub.status : 'not_started';
                
                const statusLabels = {
                  'not_started': { text: 'Not Started', class: 'status-not-started', bg: '#64748b' },
                  'in_progress': { text: 'In Progress', class: 'status-in-progress', bg: 'var(--set-orange)' },
                  'submitted': { text: 'Submitted (Review Pending)', class: 'status-submitted', bg: 'var(--set-navy)' },
                  'under_review': { text: 'Under Review', class: 'status-under-review', bg: 'var(--set-navy-light)' },
                  'graded': { text: 'Graded', class: 'status-graded', bg: 'var(--set-green)' },
                  'returned_for_revision': { text: 'Returned for Revision', class: 'status-revision', bg: 'var(--danger-color)' }
                };

                const currentStatus = statusLabels[status] || { text: 'Not Started', bg: '#64748b' };

                return (
                  <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                      <div>
                        <button className="btn-outline" onClick={() => setActiveHomeworkId(null)} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: 'var(--set-navy)', border: '1px solid var(--set-navy)', marginBottom: '1rem' }}>
                          ← Back to list
                        </button>
                        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{hw.title}</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Course Subject: <strong>{hw.subject}</strong></span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <span className="badge" style={{ background: currentStatus.bg, padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                          Status: {currentStatus.text}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--danger-color)', fontWeight: 600 }}>Due Date: {new Date(hw.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
                      {/* Left Column: Details, Resources, Comments */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Homework Description</h3>
                          <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{hw.description}</p>
                        </div>

                        {hw.resourceFile && (
                          <div style={{ background: 'var(--bg-primary)', padding: '1rem 1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <FileText size={24} color="var(--set-navy)" />
                              <div>
                                <h5 style={{ margin: 0, fontSize: '0.9rem' }}>{hw.resourceFile}</h5>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Size: {hw.resourceSize}</span>
                              </div>
                            </div>
                            <button className="btn-outline" style={{ borderColor: 'var(--set-navy)', color: 'var(--set-navy)', padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => simulateDownload(hw.resourceFile)}>
                              <Download size={14} /> Download Template
                            </button>
                          </div>
                        )}

                        {/* Submission Comments Thread */}
                        <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem' }}>
                          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageSquare size={18} /> Discussion & Comments
                          </h3>
                          
                          <div style={{ background: 'rgba(0,0,0,0.01)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '1rem', maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                            {(!sub || !sub.comments || sub.comments.length === 0) ? (
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', margin: '1rem 0' }}>No comments posted yet.</p>
                            ) : (
                              sub.comments.map(c => (
                                <div key={c.id || c.timestamp} style={{ alignSelf: c.sender === 'student' ? 'flex-end' : 'flex-start', background: c.sender === 'student' ? 'rgba(75, 142, 61, 0.08)' : 'rgba(6, 28, 57, 0.05)', border: c.sender === 'student' ? '1px solid rgba(75, 142, 61, 0.2)' : '1px solid rgba(6, 28, 57, 0.1)', padding: '0.75rem 1rem', borderRadius: '12px', maxWidth: '85%' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.2rem', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    <span>{c.sender === 'student' ? 'You (Student)' : 'Instructor'}</span>
                                    <span>{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p style={{ margin: 0, fontSize: '0.85rem' }}>{c.text}</p>
                                </div>
                              ))
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="Type a comment or question for your instructor..."
                              value={hwCommentText}
                              onChange={e => setHwCommentText(e.target.value)}
                            />
                            <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => submitHomeworkCommentHandler(hw.id)} disabled={status === 'graded'}>
                              Send
                            </button>
                          </div>
                        </div>

                        {/* Submission History Log */}
                        {sub && sub.history && (
                          <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                              <Clock size={16} /> Submission History Log
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {sub.history.map((log, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--set-green)' }}></div>
                                  <strong>{log.event}</strong>
                                  <span>at {new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column: File Dropzone, Uploads list, Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Upload Submission Files</h3>
                          
                          {/* File Dropzone */}
                          <div 
                            className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => status !== 'graded' && fileInputRef.current.click()}
                            style={{ 
                              border: dragActive ? '2px dashed var(--set-green)' : '2px dashed rgba(6, 28, 57, 0.15)',
                              background: dragActive ? 'rgba(75, 142, 61, 0.03)' : 'transparent',
                              borderRadius: '16px',
                              padding: '2.5rem 1.5rem',
                              textAlign: 'center',
                              cursor: status === 'graded' ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s',
                              opacity: status === 'graded' ? 0.6 : 1
                            }}
                          >
                            <input 
                              type="file" 
                              multiple 
                              ref={fileInputRef} 
                              style={{ display: 'none' }} 
                              onChange={handleFileChange}
                              disabled={status === 'graded'}
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
                            />
                            <Upload size={36} color="var(--set-navy)" style={{ margin: '0 auto 0.75rem', opacity: 0.7 }} />
                            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>Drag & Drop Files Here</h4>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>or click to browse local storage</span>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Supported: PDF, Word, Excel, PPT, Images (Max 10MB)</p>
                          </div>

                          {/* Upload Progress Simulation */}
                          {hwUploadProgress !== null && (
                            <div style={{ marginTop: '1rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                                <span>Uploading file...</span>
                                <span>{hwUploadProgress}%</span>
                              </div>
                              <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                                <div style={{ width: `${hwUploadProgress}%`, height: '100%', background: 'var(--set-green)', borderRadius: '999px', transition: 'width 0.2s' }}></div>
                              </div>
                            </div>
                          )}

                          {/* Uploaded Files List */}
                          <div style={{ marginTop: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--set-navy)' }}>Uploaded Files ({hwUploadedFiles.length})</h4>
                            {hwUploadedFiles.length === 0 ? (
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No files uploaded yet.</p>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {hwUploadedFiles.map((file, idx) => (
                                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', border: '1px solid var(--panel-border)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                                      <Paperclip size={14} style={{ flexShrink: 0 }} />
                                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={file.name}>{file.name}</span>
                                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', flexShrink: 0 }}>({file.size})</span>
                                    </div>
                                    {status !== 'graded' && (
                                      <button style={{ border: 'none', background: 'transparent', color: 'var(--danger-color)', cursor: 'pointer' }} onClick={() => removeUploadedFile(idx)}>
                                        <X size={14} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Instructor Grading block */}
                        {status === 'graded' && (
                          <div style={{ background: 'rgba(75, 142, 61, 0.05)', border: '1px solid rgba(75, 142, 61, 0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                            <h4 style={{ color: 'var(--set-green)', margin: '0 0 0.5rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Award size={18} /> Graded Evaluation
                            </h4>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--set-green)' }}>
                              {sub.grade}% <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>({getLetterGrade(sub.grade).letter})</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                              Instructor Feedback: "{sub.feedback}"
                            </p>
                          </div>
                        )}

                        {/* Action buttons bar */}
                        <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem', display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                          {status !== 'graded' && (
                            <>
                              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => saveHomeworkAsDraft(hw.id)}>
                                Save Draft
                              </button>
                              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => submitHomeworkFinal(hw.id)}>
                                Submit Homework
                              </button>
                            </>
                          )}
                          <button className="btn-outline" style={{ borderColor: 'var(--set-navy)', color: 'var(--set-navy)', justifyContent: 'center', width: status === 'graded' ? '100%' : 'auto' }} onClick={() => setActiveHomeworkId(null)}>
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              // ----------------------------------------
              // Main Homework List Tab view
              // ----------------------------------------
              <div>
                <div className="page-header">
                  <div>
                    <h2>Academic Homework & Submissions</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Track assigned business homework, upload digital documents, and review facilitator grades.</p>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                  {['all', 'pending', 'submitted', 'graded'].map(f => (
                    <button 
                      key={f}
                      className={hwFilter === f ? 'btn-secondary' : 'btn-outline'}
                      onClick={() => setHwFilter(f)}
                      style={{ 
                        color: hwFilter === f ? 'white' : 'var(--set-navy)', 
                        border: '1px solid var(--set-navy)', 
                        padding: '0.4rem 1rem', 
                        fontSize: '0.85rem',
                        textTransform: 'capitalize' 
                      }}
                    >
                      {f === 'pending' ? 'To Do / Action Required' : f}
                    </button>
                  ))}
                </div>

                {/* Homework Cards Grid */}
                {(() => {
                  const filteredHw = assignments.filter(hw => {
                    const sub = mySubmissions.find(s => s.assignmentId === hw.id);
                    if (hwFilter === 'all') return true;
                    if (hwFilter === 'pending') return !sub || sub.status === 'in_progress' || sub.status === 'returned_for_revision';
                    if (hwFilter === 'submitted') return sub && (sub.status === 'submitted' || sub.status === 'under_review');
                    if (hwFilter === 'graded') return sub && sub.status === 'graded';
                    return true;
                  });

                  if (filteredHw.length === 0) {
                    return (
                      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No homework found matching this filter.</p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                      {filteredHw.map(hw => {
                        const sub = mySubmissions.find(s => s.assignmentId === hw.id);
                        const status = sub ? sub.status : 'not_started';
                        
                        const badgeColors = {
                          'not_started': { text: 'Not Started', color: '#64748b', bg: '#f1f5f9' },
                          'in_progress': { text: 'Draft Saved', color: 'var(--set-orange)', bg: 'rgba(228,134,34,0.08)' },
                          'submitted': { text: 'Submitted', color: 'var(--set-navy)', bg: 'rgba(6,28,57,0.08)' },
                          'under_review': { text: 'Under Review', color: 'var(--set-navy-light)', bg: 'rgba(17,42,75,0.08)' },
                          'graded': { text: `Graded: ${sub?.grade}%`, color: 'var(--set-green)', bg: 'rgba(75,142,61,0.08)' },
                          'returned_for_revision': { text: 'Revision Requested', color: 'var(--danger-color)', bg: 'rgba(239,68,68,0.08)' }
                        };

                        const badge = badgeColors[status] || { text: 'Not Started', color: '#64748b', bg: '#f1f5f9' };

                        return (
                          <div key={hw.id} className="glass-panel animate-fade-in" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: status === 'returned_for_revision' ? '1.5px solid var(--danger-color)' : '1px solid var(--panel-border)' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{hw.subject}</span>
                                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, color: badge.color, background: badge.bg }}>
                                  {badge.text}
                                </span>
                              </div>
                              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--set-navy)' }}>{hw.title}</h3>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {hw.description}
                              </p>
                            </div>

                            <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                <p style={{ color: status === 'returned_for_revision' ? 'var(--danger-color)' : 'var(--text-secondary)', fontWeight: 600 }}>Due: {new Date(hw.dueDate).toLocaleDateString()}</p>
                                {sub && sub.files && <p>{sub.files.length} attachment(s) uploaded</p>}
                              </div>
                              <button 
                                className="btn-primary" 
                                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                                onClick={() => {
                                  setActiveHomeworkId(hw.id);
                                  setHwUploadedFiles(sub ? sub.files || [] : []);
                                }}
                              >
                                {status === 'graded' ? 'View Grade' : status === 'returned_for_revision' ? 'Edit & Resubmit' : 'Open Details'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* CLASSWORK TAB */}
        {/* ========================================================================= */}
        {activeTab === 'classwork' && (
          <div>
            {activeClassworkId ? (
              // ----------------------------------------
              // Classwork Interactive Form / Drawer View
              // ----------------------------------------
              (() => {
                const cw = classwork.find(c => c.id === activeClassworkId);
                const sub = myClassworkSubmissions.find(s => s.classworkId === activeClassworkId);
                const status = sub ? sub.status : 'not_started';

                return (
                  <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1.2rem', marginBottom: '2rem' }}>
                      <div>
                        <button className="btn-outline" onClick={() => setActiveClassworkId(null)} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: 'var(--set-navy)', border: '1px solid var(--set-navy)', marginBottom: '1rem' }}>
                          ← Back to activities
                        </button>
                        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{cw.title}</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Category: <strong>{cw.category}</strong> | Subject: <strong>{cw.subject}</strong></span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                        <span className="badge" style={{ 
                          background: status === 'reviewed' ? 'var(--set-navy)' : status === 'completed' ? 'var(--set-green)' : status === 'in_progress' ? 'var(--set-orange)' : '#64748b' 
                        }}>
                          {status === 'reviewed' ? 'Reviewed' : status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In Progress' : 'Not Started'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Due: {new Date(cw.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
                      {/* Left: Interactive Form */}
                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>Complete Class Activity Answers</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                          {cw.questions.map((q) => (
                            <div key={q.id} className="form-group" style={{ background: 'var(--bg-primary)', padding: '1.2rem', borderRadius: '12px' }}>
                              <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--set-navy)', marginBottom: '0.5rem', display: 'block' }}>{q.text}</label>
                              {q.type === 'long-text' ? (
                                <textarea 
                                  className="form-control"
                                  rows="4"
                                  placeholder={q.placeholder}
                                  value={cwAnswers[q.id] || ''}
                                  onChange={e => setCwAnswers({...cwAnswers, [q.id]: e.target.value})}
                                  disabled={status === 'completed' || status === 'reviewed'}
                                ></textarea>
                              ) : (
                                <input 
                                  type={q.type}
                                  className="form-control"
                                  placeholder={q.placeholder}
                                  value={cwAnswers[q.id] || ''}
                                  onChange={e => setCwAnswers({...cwAnswers, [q.id]: e.target.value})}
                                  disabled={status === 'completed' || status === 'reviewed'}
                                />
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Bottom Form Actions */}
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem' }}>
                          {(status !== 'completed' && status !== 'reviewed') ? (
                            <>
                              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => saveClassworkDraftHandler(cw.id)}>
                                Save Draft
                              </button>
                              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => submitClassworkFinalHandler(cw.id)}>
                                Submit Answers
                              </button>
                            </>
                          ) : (
                            <div style={{ textAlign: 'center', width: '100%', padding: '1rem', background: 'rgba(75,142,61,0.03)', borderRadius: '8px', border: '1px solid rgba(75,142,61,0.2)', color: 'var(--set-green)', fontWeight: 600 }}>
                              ✓ Activity submitted successfully
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Resources & Instructor review comments */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {cw.resourceFile && (
                          <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Learning Resources & Worksheets</h4>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                                <FileText size={20} style={{ flexShrink: 0 }} />
                                <span style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cw.resourceFile}</span>
                              </div>
                              <button className="btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: 'var(--set-navy)', borderColor: 'var(--set-navy)' }} onClick={() => simulateDownload(cw.resourceFile)}>
                                Download
                              </button>
                            </div>
                          </div>
                        )}

                        {status === 'reviewed' && sub.feedback && (
                          <div style={{ background: 'rgba(6, 28, 57, 0.04)', borderLeft: '4px solid var(--set-navy)', padding: '1.5rem', borderRadius: '0 12px 12px 0' }}>
                            <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem 0', color: 'var(--set-navy)' }}>Facilitator Review</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                              "{sub.feedback}"
                            </p>
                          </div>
                        )}

                        {/* Completed Preview in sidebar */}
                        {(status === 'completed' || status === 'reviewed') && (
                          <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Submitted Answers Review</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              {cw.questions.map(q => (
                                <div key={q.id} style={{ fontSize: '0.8rem' }}>
                                  <p style={{ fontWeight: 600, color: 'var(--set-navy)' }}>{q.text}</p>
                                  <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.25rem' }}>"{cwAnswers[q.id] || 'No answer provided'}"</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              // ----------------------------------------
              // Main Classwork List View
              // ----------------------------------------
              <div>
                <div className="page-header">
                  <div>
                    <h2>Academic Classwork & Exercises</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Access and submit classroom worksheets, worksheets activities, and learning resources.</p>
                  </div>
                </div>

                {/* Filter categories */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                  {['all', 'Worksheet', 'Exercise', 'Practical Activity', 'Reading Material', 'Classroom Task'].map(cat => (
                    <button 
                      key={cat}
                      className={cwFilter === cat ? 'btn-secondary' : 'btn-outline'}
                      onClick={() => setCwFilter(cat)}
                      style={{ 
                        color: cwFilter === cat ? 'white' : 'var(--set-navy)', 
                        border: '1px solid var(--set-navy)', 
                        padding: '0.4rem 0.8rem', 
                        fontSize: '0.8rem',
                        textTransform: 'capitalize' 
                      }}
                    >
                      {cat === 'all' ? 'All Categories' : cat + 's'}
                    </button>
                  ))}
                </div>

                {/* Classwork list */}
                {(() => {
                  const filteredCw = classwork.filter(c => cwFilter === 'all' || c.category === cwFilter);
                  
                  if (filteredCw.length === 0) {
                    return (
                      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No classwork items in this category.</p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                      {filteredCw.map(c => {
                        const sub = myClassworkSubmissions.find(s => s.classworkId === c.id);
                        const status = sub ? sub.status : 'not_started';

                        const statusConfig = {
                          'not_started': { text: 'Not Started', color: '#64748b', bg: '#f1f5f9' },
                          'in_progress': { text: 'Draft Saved', color: 'var(--set-orange)', bg: 'rgba(228,134,34,0.08)' },
                          'completed': { text: 'Completed', color: 'var(--set-green)', bg: 'rgba(75,142,61,0.08)' },
                          'reviewed': { text: 'Reviewed', color: 'var(--set-navy)', bg: 'rgba(6,28,57,0.08)' }
                        };

                        const indicator = statusConfig[status] || { text: 'Not Started', color: '#64748b', bg: '#f1f5f9' };

                        return (
                          <div key={c.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                <span className="badge" style={{ background: 'var(--set-navy)', fontSize: '0.65rem' }}>{c.category}</span>
                                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, color: indicator.color, background: indicator.bg }}>
                                  {indicator.text}
                                </span>
                              </div>
                              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--set-navy)' }}>{c.title}</h3>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {c.description}
                              </p>
                            </div>

                            <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Due: {new Date(c.dueDate).toLocaleDateString()}</span>
                              <button className="btn-primary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }} onClick={() => openClassworkDrawer(c)}>
                                {status === 'reviewed' ? 'View Review' : status === 'completed' ? 'View Answers' : 'Open Exercise'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ASSESSMENTS TAB */}
        {/* ========================================================================= */}
        {activeTab === 'assessments' && (
          <div>
            {takingTest ? (
              // ----------------------------------------
              // Interactive Quiz/Test Taking Form (MCQ/Short/Long)
              // ----------------------------------------
              <div className="glass-panel animate-fade-in" style={{ padding: '3rem' }}>
                <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem' }}>
                  <h2>{takingTest.title}</h2>
                  <span className="badge" style={{ background: 'var(--set-orange)', marginBottom: '0.5rem' }}>{takingTest.type} Assessment</span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{takingTest.instructions}</p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
                  {takingTest.questions.map((q, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.01)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ padding: '0.3rem 0.6rem', background: 'var(--set-navy)', color: 'white', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>Q{idx + 1}</span>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-secondary)' }}>({q.type?.replace('-', ' ') || 'Question'})</span>
                      </div>
                      <h4 style={{ marginBottom: '1rem', color: 'var(--set-navy)', fontSize: '1.1rem' }}>{q.text}</h4>
                      
                      {q.type === 'multiple-choice' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {q.options?.map((option, optIdx) => (
                            <label key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'white', border: '1px solid var(--panel-border)', borderRadius: '8px', cursor: 'pointer', transition: 'border 0.2s' }}>
                              <input 
                                type="radio" 
                                name={`q-${idx}`} 
                                value={optIdx}
                                checked={testAnswers[idx] === String(optIdx)}
                                onChange={e => setTestAnswers({...testAnswers, [idx]: e.target.value})}
                              />
                              <span style={{ fontSize: '0.95rem' }}>{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {q.type === 'short-answer' && (
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder={q.placeholder || "Type your short answer..."}
                          value={testAnswers[idx] || ''}
                          onChange={e => setTestAnswers({...testAnswers, [idx]: e.target.value})}
                        />
                      )}

                      {q.type === 'long-answer' && (
                        <textarea 
                          className="form-control" 
                          rows="4" 
                          placeholder="Type your long, detailed response here..."
                          value={testAnswers[idx] || ''}
                          onChange={e => setTestAnswers({...testAnswers, [idx]: e.target.value})}
                        ></textarea>
                      )}
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn-primary" onClick={handleTestSubmit}>Submit Assessment Paper</button>
                  <button className="btn-outline" style={{ color: 'var(--set-navy)', border: '1px solid var(--set-navy)' }} onClick={() => {setTakingTest(null); setTestAnswers({});}}>Cancel</button>
                </div>
              </div>
            ) : activeAssessmentId ? (
              // ----------------------------------------
              // Assessment Document Project Upload Screen
              // ----------------------------------------
              (() => {
                const asm = tests.find(t => t.id === activeAssessmentId);
                const sub = myTestSubmissions.find(s => s.testId === activeAssessmentId);
                
                return (
                  <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1.2rem', marginBottom: '2rem' }}>
                      <div>
                        <button className="btn-outline" onClick={() => setActiveAssessmentId(null)} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: 'var(--set-navy)', border: '1px solid var(--set-navy)', marginBottom: '1rem' }}>
                          ← Back to assessments
                        </button>
                        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{asm.title}</h2>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Type: <strong>{asm.type}</strong> | Subject: <strong>{asm.subject}</strong></span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                        <span className="badge" style={{ background: sub ? 'var(--set-navy)' : 'var(--set-orange)' }}>
                          {sub ? (sub.status === 'graded' ? `Graded: ${sub.grade}%` : 'Submitted (Under Review)') : 'Pending Submission'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--danger-color)', fontWeight: 600 }}>Due: {new Date(asm.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }}>
                      {/* Description & guidelines */}
                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Assessment Guidelines</h3>
                        <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '2rem' }}>{asm.instructions}</p>

                        {asm.resourceFile && (
                          <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FileText size={20} />
                              <span style={{ fontSize: '0.85rem' }}>{asm.resourceFile} ({asm.resourceSize})</span>
                            </div>
                            <button className="btn-outline" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: 'var(--set-navy)', borderColor: 'var(--set-navy)' }} onClick={() => simulateDownload(asm.resourceFile)}>
                              Download Guidelines
                            </button>
                          </div>
                        )}

                        {/* Submission Comment Box */}
                        <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem' }}>
                          <h4 style={{ marginBottom: '0.5rem' }}>Submission Remarks / Comments</h4>
                          <textarea 
                            className="form-control"
                            rows="3"
                            placeholder="Add any remarks or links to your slides for the assessor..."
                            value={asmCommentText}
                            onChange={e => setAsmCommentText(e.target.value)}
                            disabled={!!sub}
                          />
                        </div>
                      </div>

                      {/* File Uploader */}
                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Upload Project Files</h3>
                        
                        {!sub ? (
                          <>
                            <div 
                              className="upload-area" 
                              onClick={() => asmFileInputRef.current.click()}
                              style={{ border: '2px dashed rgba(6,28,57,0.15)', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
                            >
                              <input 
                                type="file" 
                                ref={asmFileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={e => handleAsmFileSelected(e.target.files)} 
                                multiple
                              />
                              <Upload size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.7 }} />
                              <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>Click to browse and upload project reports</p>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>PDF, PPTX, DOCX, ZIP files up to 20MB</span>
                            </div>

                            {asmProgress !== null && (
                              <div style={{ marginTop: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                  <span>Simulating upload...</span>
                                  <span>{asmProgress}%</span>
                                </div>
                                <div style={{ width: '100%', height: '5px', background: 'rgba(0,0,0,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                                  <div style={{ width: `${asmProgress}%`, height: '100%', background: 'var(--set-orange)' }}></div>
                                </div>
                              </div>
                            )}

                            {asmUploadedFiles.length > 0 && (
                              <div style={{ marginTop: '1.5rem' }}>
                                <h5 style={{ marginBottom: '0.5rem' }}>Selected Files ({asmUploadedFiles.length})</h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  {asmUploadedFiles.map((file, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--panel-border)', fontSize: '0.8rem' }}>
                                      <span>{file.name} ({file.size})</span>
                                      <button style={{ border: 'none', background: 'transparent', color: 'var(--danger-color)', cursor: 'pointer' }} onClick={() => setAsmUploadedFiles(prev => prev.filter((_, i) => i !== idx))}>
                                        Remove
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }} onClick={() => submitAssessmentProject(asm.id)}>
                              Submit Project
                            </button>
                          </>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ background: 'rgba(75,142,61,0.03)', border: '1px solid rgba(75,142,61,0.2)', padding: '1rem 1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                              <CheckCircle size={32} color="var(--set-green)" style={{ margin: '0 auto 0.5rem' }} />
                              <h4 style={{ color: 'var(--set-green)', margin: 0 }}>Project Successfully Uploaded</h4>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2' }}>Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                            </div>

                            <div className="glass-panel" style={{ padding: '1rem' }}>
                              <h5 style={{ marginBottom: '0.5rem' }}>Submitted Files</h5>
                              {sub.files && sub.files.map((f, i) => (
                                <p key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>📄 {f.name} ({f.size})</p>
                              ))}
                            </div>

                            {sub.status === 'graded' && (
                              <div style={{ background: 'rgba(75,142,61,0.05)', border: '1px solid rgba(75,142,61,0.2)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
                                <h4 style={{ color: 'var(--set-green)', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>Graded: {sub.grade}% ({getLetterGrade(sub.grade).letter})</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{sub.feedback}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              // ----------------------------------------
              // Main Assessments Filterable List View
              // ----------------------------------------
              <div>
                <div className="page-header">
                  <div>
                    <h2>Academic Assessments & Examinations</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Complete online theoretical quizzes, structured tests, and submit practical project blueprints.</p>
                  </div>
                </div>

                {/* Filter types */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                  {['all', 'Quiz', 'Test', 'Exam', 'Project', 'Assignment'].map(type => (
                    <button 
                      key={type}
                      className={assessmentFilter === type ? 'btn-secondary' : 'btn-outline'}
                      onClick={() => setAssessmentFilter(type)}
                      style={{ 
                        color: assessmentFilter === type ? 'white' : 'var(--set-navy)', 
                        border: '1px solid var(--set-navy)', 
                        padding: '0.4rem 0.8rem', 
                        fontSize: '0.8rem',
                        textTransform: 'capitalize' 
                      }}
                    >
                      {type === 'all' ? 'All Assessments' : type + 's'}
                    </button>
                  ))}
                </div>

                {/* Assessment list cards */}
                {(() => {
                  const filteredAssessments = tests.filter(t => assessmentFilter === 'all' || t.type === assessmentFilter);

                  if (filteredAssessments.length === 0) {
                    return (
                      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No assessments found in this category.</p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                      {filteredAssessments.map(test => {
                        const submission = myTestSubmissions.find(s => s.testId === test.id);
                        const status = submission ? submission.status : 'not_started';

                        return (
                          <div key={test.id} className="glass-panel animate-fade-in" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span className="badge" style={{ background: 'var(--set-orange)', fontSize: '0.65rem' }}>{test.type}</span>
                                <span style={{ 
                                  fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700,
                                  color: status === 'graded' ? 'var(--set-green)' : status === 'pending' ? 'var(--set-navy)' : '#64748b',
                                  background: status === 'graded' ? 'rgba(75,142,61,0.08)' : status === 'pending' ? 'rgba(6,28,57,0.08)' : '#f1f5f9'
                                }}>
                                  {status === 'graded' ? `Graded: ${submission?.grade}%` : status === 'pending' ? 'Submitted' : 'Not Attempted'}
                                </span>
                              </div>
                              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: 'var(--set-navy)' }}>{test.title}</h3>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
                                Subject: <strong>{test.subject}</strong>
                              </p>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                {test.isFileUpload ? '📄 File document upload submission required.' : `📝 Online exam form (${test.questions?.length || 0} questions).`}
                              </p>
                            </div>

                            <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Due: {new Date(test.dueDate).toLocaleDateString()}</span>
                              
                              {test.isFileUpload ? (
                                <button className="btn-primary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }} onClick={() => setActiveAssessmentId(test.id)}>
                                  {status === 'graded' ? 'View Feedback' : status === 'pending' ? 'Review Submission' : 'Submit Files'}
                                </button>
                              ) : (
                                <>
                                  {!submission ? (
                                    <button className="btn-primary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }} onClick={() => setTakingTest(test)}>
                                      Start Quiz Form
                                    </button>
                                  ) : (
                                    <button className="btn-outline" style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', borderColor: 'var(--set-navy)', color: 'var(--set-navy)' }} onClick={() => setActiveTab('grades')}>
                                      View Answers
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* GRADES TAB */}
        {/* ========================================================================= */}
        {activeTab === 'grades' && (
          <div>
            <div className="page-header">
              <div>
                <h2>Academic Performance & Grades Center</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Detailed breakdown of overall average grades, course subjects progress, and rubric evaluations.</p>
              </div>
            </div>

            {/* GPA Overview Dashboard Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
              
              {/* Left Column: Overall GPA circular gauge + performance statistics */}
              <div className="glass-panel" style={{ padding: '2rem', display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                    <circle cx="60" cy="60" r="50" fill="transparent" stroke="rgba(6, 28, 57, 0.05)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="transparent" stroke="var(--set-green)" strokeWidth="10" 
                            strokeDasharray="314" strokeDashoffset={314 - (314 * overallAverage) / 100} 
                            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                  </svg>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--set-navy)' }}>{overallAverage.toFixed(0)}%</span>
                    <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', margin: 0 }}>GPA</p>
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Academic Status: <span style={{ color: 'var(--set-green)' }}>Pass with Distinction</span></h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Your cumulative average reflects excellent participation, worksheet completion, and high assessment outcomes.</p>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Homework Average</span>
                      <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1rem' }}>
                        {gradedHomeworks.length > 0 ? `${(gradedHomeworks.reduce((a,b)=>a+b.grade,0)/gradedHomeworks.length).toFixed(0)}%` : 'N/A'}
                      </h4>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Classwork Completion</span>
                      <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1rem' }}>
                        {classwork.length > 0 ? `${((myClassworkSubmissions.filter(s=>s.status==='completed'||s.status==='reviewed').length / classwork.length)*100).toFixed(0)}%` : '0%'}
                      </h4>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Assessments Average</span>
                      <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1rem' }}>
                        {gradedAssessments.length > 0 ? `${(gradedAssessments.reduce((a,b)=>a+b.grade,0)/gradedAssessments.length).toFixed(0)}%` : 'N/A'}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Course Subjects performance breakdown */}
              <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.2rem' }}>Subject Performance</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Subject 1 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span>Business Strategy</span>
                      <strong>89%</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(6,28,57,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: '89%', height: '100%', background: 'var(--set-navy)', borderRadius: '99px' }}></div>
                    </div>
                  </div>

                  {/* Subject 2 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span>Financial Literacy</span>
                      <strong>92%</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(6,28,57,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: '92%', height: '100%', background: 'var(--set-green)', borderRadius: '99px' }}></div>
                    </div>
                  </div>

                  {/* Subject 3 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span>Marketing & Branding</span>
                      <strong>85%</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(6,28,57,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: '85%', height: '100%', background: 'var(--set-orange)', borderRadius: '99px' }}></div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Graded Items History Table */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Graded Modules Summary</h3>
              
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Module Title / Subject</th>
                      <th>Module Type</th>
                      <th>Submission Date</th>
                      <th>Achieved Grade</th>
                      <th>Teacher Feedback Notes</th>
                      <th style={{ textAlign: 'right' }}>Rubrics Breakdown</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Render Homeworks */}
                    {gradedHomeworks.map(sub => {
                      const hw = assignments.find(a => a.id === sub.assignmentId);
                      return (
                        <tr key={sub.id}>
                          <td>
                            <strong>{hw?.title}</strong>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Subject: {hw?.subject}</p>
                          </td>
                          <td><span className="badge" style={{ background: 'var(--set-navy-light)', fontSize: '0.6rem' }}>Homework</span></td>
                          <td>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                          <td>
                            <strong style={{ color: 'var(--set-green)' }}>{sub.grade}%</strong> ({getLetterGrade(sub.grade).letter})
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sub.feedback}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem', color: 'var(--set-navy)', borderColor: 'var(--set-navy)' }} onClick={() => setSelectedGradeItem({...sub, type: 'Homework', title: hw?.title})}>
                              Open Rubric
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Render Assessments */}
                    {gradedAssessments.map(sub => {
                      const test = tests.find(t => t.id === sub.testId);
                      return (
                        <tr key={sub.id}>
                          <td>
                            <strong>{test?.title}</strong>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Subject: {test?.subject}</p>
                          </td>
                          <td><span className="badge" style={{ background: 'var(--set-orange)', fontSize: '0.6rem' }}>{test?.type || 'Assessment'}</span></td>
                          <td>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                          <td>
                            <strong style={{ color: 'var(--set-green)' }}>{sub.grade}%</strong> ({getLetterGrade(sub.grade).letter})
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sub.feedback}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="btn-outline" style={{ padding: '0.25rem 0.6rem', fontSize: '0.7rem', color: 'var(--set-navy)', borderColor: 'var(--set-navy)' }} onClick={() => setSelectedGradeItem({...sub, type: test?.type || 'Assessment', title: test?.title})}>
                              Open Rubric
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Render Classworks */}
                    {gradedClassworks.map(sub => {
                      const cw = classwork.find(c => c.id === sub.classworkId);
                      return (
                        <tr key={sub.id}>
                          <td>
                            <strong>{cw?.title}</strong>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Subject: {cw?.subject}</p>
                          </td>
                          <td><span className="badge" style={{ background: 'var(--set-green)', fontSize: '0.6rem' }}>Classwork ({cw?.category})</span></td>
                          <td>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                          <td>
                            <strong style={{ color: 'var(--set-navy)' }}>Reviewed</strong>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sub.feedback}>
                            {sub.feedback}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No Score Rubric</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rubrics breakdown modal dialog */}
            {selectedGradeItem && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(6,28,57,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                <div className="glass-panel animate-fade-in" style={{ background: 'white', maxWidth: '580px', width: '90%', padding: '2.5rem', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedGradeItem.title}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Evaluation Type: <strong>{selectedGradeItem.type}</strong></span>
                    </div>
                    <button style={{ border: 'none', background: 'transparent', color: 'var(--set-navy)', cursor: 'pointer' }} onClick={() => setSelectedGradeItem(null)}>
                      <X size={24} />
                    </button>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Overall Evaluated Score</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--set-green)' }}>{selectedGradeItem.grade}%</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--set-navy)' }}>({getLetterGrade(selectedGradeItem.grade).letter})</span>
                    </div>
                  </div>

                  {/* Rubric evaluation criteria board */}
                  {selectedGradeItem.rubricGrades && (
                    <div style={{ marginBottom: '2rem' }}>
                      <h5 style={{ fontSize: '0.9rem', marginBottom: '0.8rem', color: 'var(--set-navy)' }}>Criteria Scorecard Breakdown</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {Object.entries(selectedGradeItem.rubricGrades).map(([criteria, val]) => (
                          <div key={criteria} style={{ background: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{criteria}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ width: '80px', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                                <div style={{ width: `${val}%`, height: '100%', background: 'var(--set-green)' }}></div>
                              </div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--set-green)' }}>{val}/100</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instructor comments summary */}
                  <div style={{ background: 'rgba(6,28,57,0.03)', padding: '1rem 1.2rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                    <h5 style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', color: 'var(--set-navy)' }}>Assessor Final Remarks</h5>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      "{selectedGradeItem.feedback}"
                    </p>
                  </div>

                  <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSelectedGradeItem(null)}>
                    Dismiss Scorecard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TRANSPORT ARRANGER TAB */}
        {/* ========================================================================= */}
        {activeTab === 'transport' && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem' }}>
              <h2>Classroom Session Transport Arranger</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Indicate how you will attend weekly physical workshop classes to help organizers coordinate routes and parking spaces.</p>
            </div>

            <form onSubmit={handleSaveTransport}>
              <h3 style={{ marginBottom: '1.2rem', color: 'var(--set-navy)' }}>Choose Travel Preference:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                
                {/* Option 1: Pickup */}
                <div 
                  className={`glass-panel ${transportType === 'pickup' ? 'active-selection' : ''}`}
                  onClick={() => setTransportType('pickup')}
                  style={{ padding: '1.5rem', cursor: 'pointer', border: transportType === 'pickup' ? '2px solid var(--set-green)' : '1px solid var(--panel-border)', background: transportType === 'pickup' ? 'rgba(75, 142, 61, 0.05)' : 'white', borderRadius: '12px', transition: 'all 0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.4rem', background: 'rgba(75, 142, 61, 0.1)', color: 'var(--set-green)', borderRadius: '8px' }}><MapPin size={24} /></div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem' }}>Shuttle Pickup</h4>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Request transport to pick you up from a designated address to the workshop site.</p>
                </div>

                {/* Option 2: Independent */}
                <div 
                  className={`glass-panel ${transportType === 'independent' ? 'active-selection' : ''}`}
                  onClick={() => setTransportType('independent')}
                  style={{ padding: '1.5rem', cursor: 'pointer', border: transportType === 'independent' ? '2px solid var(--set-navy)' : '1px solid var(--panel-border)', background: transportType === 'independent' ? 'rgba(6, 28, 57, 0.05)' : 'white', borderRadius: '12px', transition: 'all 0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.4rem', background: 'rgba(6, 28, 57, 0.1)', color: 'var(--set-navy)', borderRadius: '8px' }}><Bus size={24} /></div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem' }}>Travel Independently</h4>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Commuting via your own arrangements (e.g. taxi, public train, or walking).</p>
                </div>

                {/* Option 3: Driving */}
                <div 
                  className={`glass-panel ${transportType === 'driving' ? 'active-selection' : ''}`}
                  onClick={() => setTransportType('driving')}
                  style={{ padding: '1.5rem', cursor: 'pointer', border: transportType === 'driving' ? '2px solid var(--set-orange)' : '1px solid var(--panel-border)', background: transportType === 'driving' ? 'rgba(228, 134, 34, 0.05)' : 'white', borderRadius: '12px', transition: 'all 0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ padding: '0.4rem', background: 'rgba(228, 134, 34, 0.1)', color: 'var(--set-orange)', borderRadius: '8px' }}><User size={24} /></div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem' }}>Driving Self</h4>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You will drive yourself and require secure vehicle parking spaces on site.</p>
                </div>

              </div>

              {transportType === 'pickup' && (
                <div className="grid-form animate-fade-in" style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
                  <h4 style={{ gridColumn: 'span 2', color: 'var(--set-navy)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Shuttle Coordinator Form</h4>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Pickup Location Address</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      value={transportDetails.address} 
                      onChange={e => setTransportDetails({...transportDetails, address: e.target.value})}
                      placeholder="Street address, Suburb, City"
                    />
                  </div>
                  <div className="form-group">
                    <label>Emergency Contact Phone</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      value={transportDetails.emergencyContact} 
                      onChange={e => setTransportDetails({...transportDetails, emergencyContact: e.target.value})}
                      placeholder="+27 72 123 4567"
                    />
                  </div>
                  <div className="form-group">
                    <label>Preferred Pickup Time Slot</label>
                    <select 
                      className="form-control" 
                      value={transportDetails.timePreference} 
                      onChange={e => setTransportDetails({...transportDetails, timePreference: e.target.value})}
                    >
                      <option value="07:30 AM">07:30 AM (Early Shuttle)</option>
                      <option value="08:00 AM">08:00 AM (Recommended)</option>
                      <option value="08:30 AM">08:30 AM (Late Shuttle)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Special Instructions (e.g. wheelchair support, landmark descriptions)</label>
                    <textarea 
                      className="form-control" 
                      rows="3" 
                      value={transportDetails.notes} 
                      onChange={e => setTransportDetails({...transportDetails, notes: e.target.value})}
                      placeholder="Any additional details for the shuttle driver..."
                    ></textarea>
                  </div>
                </div>
              )}

              {(transportType === 'independent' || transportType === 'driving') && (
                <div className="form-group animate-fade-in" style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
                  <label>Additional Notes (Optional)</label>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    value={transportDetails.notes} 
                    onChange={e => setTransportDetails({...transportDetails, notes: e.target.value})}
                    placeholder="e.g. taxi routes details, vehicle license plate for parking logs..."
                  ></textarea>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button type="submit" className="btn-primary">Save Transport Arrangements</button>
                {transportSaved && (
                  <span style={{ color: 'var(--set-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={18} /> Settings successfully saved!
                  </span>
                )}
              </div>
            </form>
          </div>
        )}



        {/* ========================================================================= */}
        {/* GIVE FEEDBACK TAB */}
        {/* ========================================================================= */}
        {activeTab === 'feedback' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem' }}>
                <h2>Share Program Experience</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Help improve future cycles of Sizanani. Submit suggestions directly to the Executive Directors.</p>
              </div>

              <form onSubmit={handleFeedbackSubmit}>
                <div className="form-group">
                  <label>Feedback Category</label>
                  <select 
                    className="form-control" 
                    value={feedbackCategory} 
                    onChange={e => setFeedbackCategory(e.target.value)}
                  >
                    <option value="Course Content">Course Content & Materials</option>
                    <option value="Facilitation">Facilitation & Instructors</option>
                    <option value="Platform">Platform & Technology</option>
                    <option value="General">General Inquiries & Logistics</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Rating (1-5 Stars)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <Star 
                        key={rating}
                        size={28}
                        style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                        fill={rating <= (hoverRating || feedbackRating) ? 'var(--set-orange)' : 'none'}
                        color={rating <= (hoverRating || feedbackRating) ? 'var(--set-orange)' : '#cbd5e1'}
                        onClick={() => setFeedbackRating(rating)}
                        onMouseEnter={() => setHoverRating(rating)}
                        onMouseLeave={() => setHoverRating(null)}
                      />
                    ))}
                    <span style={{ fontWeight: 'bold', marginLeft: '0.5rem', color: 'var(--set-navy)', fontSize: '1.1rem' }}>{feedbackRating} / 5</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Your Suggestions / Review</label>
                  <textarea 
                    className="form-control" 
                    rows="5" 
                    placeholder="Type your recommendations, positive feedback, or areas of improvement..."
                    required
                    value={feedbackContent}
                    onChange={e => setFeedbackContent(e.target.value)}
                  ></textarea>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <button type="submit" className="btn-primary">Submit Feedback Card</button>
                  {feedbackSuccess && (
                    <span style={{ color: 'var(--set-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle size={18} /> Submitted. Thank you!
                    </span>
                  )}
                </div>
              </form>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Your Past Feedback Cards</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {feedbacks.filter(f => f.studentId === currentUser.id).length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>You haven't submitted any feedback forms yet.</p>
                ) : (
                  feedbacks.filter(f => f.studentId === currentUser.id).map(fb => (
                    <div key={fb.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', borderLeft: '3px solid var(--set-orange)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--set-navy)' }}>{fb.category}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} fill={i < fb.rating ? 'var(--set-orange)' : 'none'} color={i < fb.rating ? 'var(--set-orange)' : '#cbd5e1'} />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{fb.content}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PROFILE TAB */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
              <h2>Learner Profile Settings</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Keep your information up to date to help organizers support your business journey.</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const isRemoteBool = profileForm.isRemote === 'true';
              const updatedFields = {
                ...profileForm,
                isRemote: isRemoteBool
              };
              updateProfile(updatedFields);
              setSaveStatus('Profile settings updated successfully!');
              setTimeout(() => setSaveStatus(null), 3000);
            }} className="grid-form">
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={profileForm.name} 
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Surname</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={profileForm.surname} 
                  onChange={e => setProfileForm({...profileForm, surname: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group form-group-full">
                <label>Residential Address</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={profileForm.address} 
                  onChange={e => setProfileForm({...profileForm, address: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={profileForm.email} 
                  onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={profileForm.age} 
                  onChange={e => setProfileForm({...profileForm, age: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Are you a Remote/Overseas Learner?</label>
                <select 
                  className="form-control" 
                  value={profileForm.isRemote}
                  onChange={e => setProfileForm({...profileForm, isRemote: e.target.value})}
                >
                  <option value="false">No (Attending Local Classes)</option>
                  <option value="true">Yes (Remote/Overseas Access)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Current Occupation</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={profileForm.occupation} 
                  onChange={e => setProfileForm({...profileForm, occupation: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Business Type / Sector</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={profileForm.businessType} 
                  onChange={e => setProfileForm({...profileForm, businessType: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Business Registration Status</label>
                <select 
                  className="form-control" 
                  value={profileForm.businessRegistrationStatus} 
                  onChange={e => setProfileForm({...profileForm, businessRegistrationStatus: e.target.value})}
                >
                  <option>Not Registered</option>
                  <option>Registered (CIPC)</option>
                  <option>In Progress</option>
                  <option>Informal Business</option>
                </select>
              </div>
              <div className="form-group">
                <label>Are you a Sizanani Alumni?</label>
                <select 
                  className="form-control" 
                  value={profileForm.isSizananiAlumni} 
                  onChange={e => setProfileForm({...profileForm, isSizananiAlumni: e.target.value})}
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
              
              <div className="form-group-full" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <button type="submit" className="btn-primary">Save Profile Changes</button>
                {saveStatus && <span style={{ color: 'var(--set-green)', fontWeight: 600 }}>{saveStatus}</span>}
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
