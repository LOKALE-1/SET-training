import React, { useState } from 'react';
import { Users, FileText, CheckCircle, Calendar, Shield, Edit3, PlusCircle, PenTool, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function ModeratorPortal() {
  const { students, assignments, addAssignment, submissions, gradeSubmission, attendance, saveAttendance, tests, addTest, testSubmissions, gradeTest } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // States
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradingType, setGradingType] = useState('assignment'); 
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // Test Creation State
  const [newTestTitle, setNewTestTitle] = useState('');
  const [newTestDue, setNewTestDue] = useState('');
  const [testQuestions, setTestQuestions] = useState([{ text: '' }]);

  // Student View State
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Stats
  const pendingAssignments = submissions.filter(s => s.status === 'pending');
  const pendingTests = testSubmissions.filter(s => s.status === 'pending');
  const totalPending = pendingAssignments.length + pendingTests.length;

  const handleGradeSubmit = () => {
    if (gradingType === 'assignment') {
      gradeSubmission(gradingSubmission.id, gradeInput, feedbackInput);
    } else {
      gradeTest(gradingSubmission.id, gradeInput, feedbackInput);
    }
    setGradingSubmission(null);
    setGradeInput('');
    setFeedbackInput('');
    setActiveTab('dashboard');
  };

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    addAssignment({ title: e.target.title.value, description: e.target.desc.value, dueDate: e.target.dueDate.value });
    alert('Assignment Created!');
    e.target.reset();
  };

  const handleAddQuestion = () => setTestQuestions([...testQuestions, { text: '' }]);
  const handleQuestionChange = (index, val) => {
    const updated = [...testQuestions];
    updated[index].text = val;
    setTestQuestions(updated);
  };
  const handleCreateTest = (e) => {
    e.preventDefault();
    if (testQuestions.some(q => !q.text.trim())) return alert("All questions must have text");
    addTest({ title: newTestTitle, dueDate: newTestDue, questions: testQuestions });
    alert('Test Created Successfully!');
    setNewTestTitle('');
    setNewTestDue('');
    setTestQuestions([{ text: '' }]);
  };

  const handleSaveAttendance = () => {
    const recordsArray = students.map(student => {
      const existingRecordDay = attendance.find(a => a.date === attendanceDate);
      const existingStatus = existingRecordDay?.records?.find(r => r.studentId === student.id)?.status;
      return {
        studentId: student.id,
        status: attendanceRecords[student.id] || existingStatus || 'Present' 
      };
    });
    saveAttendance(attendanceDate, recordsArray);
    alert('Attendance Saved Successfully!');
  };

  // Helper functions for student stats
  const getStudentAttendance = (studentId) => {
    const myAttendance = attendance.flatMap(day => day.records.filter(r => r.studentId === studentId));
    if (myAttendance.length === 0) return '100%';
    return Math.round((myAttendance.filter(a => a.status === 'Present').length / myAttendance.length) * 100) + '%';
  };

  const getStudentAvgGrade = (studentId) => {
    const myGrades = [...submissions, ...testSubmissions].filter(s => s.studentId === studentId && s.status === 'graded');
    if (myGrades.length === 0) return 'N/A';
    return Math.round(myGrades.reduce((a, b) => a + Number(b.grade), 0) / myGrades.length);
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <aside className="sidebar">
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <Shield size={20} /> Dashboard
        </div>
        <div className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => {setActiveTab('students'); setSelectedStudent(null);}}>
          <Users size={20} /> My Students
        </div>
        <div className={`nav-item ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>
          <FileText size={20} /> Assignments
        </div>
        <div className={`nav-item ${activeTab === 'tests' ? 'active' : ''}`} onClick={() => setActiveTab('tests')}>
          <Edit3 size={20} /> Tests & Quizzes
        </div>
        <div className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
          <Calendar size={20} /> Attendance
        </div>
      </aside>

      <main className="dashboard-content">
        {activeTab === 'dashboard' && (
          <div>
            <div className="page-header"><h2>Moderator Overview</h2></div>
            
            <div className="grid-cards">
              <div className="stat-card glass-panel">
                <div className="stat-icon orange"><PenTool size={28} /></div>
                <div className="stat-info">
                  <h3>To Grade</h3>
                  <p>{totalPending}</p>
                </div>
              </div>
              <div className="stat-card glass-panel" onClick={() => setActiveTab('students')} style={{cursor: 'pointer'}}>
                <div className="stat-icon navy"><Users size={28} /></div>
                <div className="stat-info">
                  <h3>Active Students</h3>
                  <p>{students.length}</p>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon green"><Edit3 size={28} /></div>
                <div className="stat-info">
                  <h3>Active Tests</h3>
                  <p>{tests.length}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Items Needing Grading</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Item Title</th>
                      <th>Type</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAssignments.map(sub => {
                      const assignment = assignments.find(a => a.id === sub.assignmentId);
                      return (
                        <tr key={`a-${sub.id}`}>
                          <td>{sub.studentName}</td>
                          <td>{assignment?.title}</td>
                          <td><span className="badge" style={{background: 'var(--set-navy)'}}>Assignment</span></td>
                          <td>
                            <button className="btn-outline" style={{ padding: '0.25rem 0.75rem' }} onClick={() => { setGradingType('assignment'); setGradingSubmission(sub); setActiveTab('grading'); }}>Grade</button>
                          </td>
                        </tr>
                      )
                    })}
                    {pendingTests.map(sub => {
                      const test = tests.find(t => t.id === sub.testId);
                      return (
                        <tr key={`t-${sub.id}`}>
                          <td>{sub.studentName}</td>
                          <td>{test?.title}</td>
                          <td><span className="badge" style={{background: 'var(--set-orange)'}}>Test</span></td>
                          <td>
                            <button className="btn-outline" style={{ padding: '0.25rem 0.75rem' }} onClick={() => { setGradingType('test'); setGradingSubmission(sub); setActiveTab('grading'); }}>Grade</button>
                          </td>
                        </tr>
                      )
                    })}
                    {totalPending === 0 && <tr><td colSpan="4" style={{textAlign: 'center'}}>All caught up!</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- STUDENTS TAB --- */}
        {activeTab === 'students' && (
          <div>
            <div className="page-header">
              <h2>My Learners</h2>
            </div>
            
            {!selectedStudent ? (
              <div className="glass-panel table-container" style={{ padding: '2rem' }}>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Learner Name</th>
                      <th>Overall Attendance</th>
                      <th>Average Grade</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '50%' }}>
                            <User size={20} color="var(--set-navy)" />
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--set-navy)' }}>{student.name}</span>
                        </td>
                        <td>{getStudentAttendance(student.id)}</td>
                        <td>{getStudentAvgGrade(student.id)}</td>
                        <td>
                          <button className="btn-outline" style={{ padding: '0.25rem 0.75rem' }} onClick={() => setSelectedStudent(student)}>
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(6, 28, 57, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                      <User size={32} color="var(--set-navy)" />
                    </div>
                    <div>
                      <h2 style={{ marginBottom: '0.25rem' }}>{selectedStudent.name}</h2>
                      <p style={{ color: 'var(--text-secondary)' }}>Overall Attendance: <strong>{getStudentAttendance(selectedStudent.id)}</strong> | Avg Grade: <strong>{getStudentAvgGrade(selectedStudent.id)}</strong></p>
                    </div>
                  </div>
                  <button className="btn-outline" onClick={() => setSelectedStudent(null)}>Back to Roster</button>
                </div>
                
                <h3 style={{ marginBottom: '1rem' }}>Academic Record</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...submissions, ...testSubmissions].filter(s => s.studentId === selectedStudent.id).map(sub => {
                        const isTest = !!sub.testId;
                        const parent = isTest ? tests.find(t => t.id === sub.testId) : assignments.find(a => a.id === sub.assignmentId);
                        return (
                          <tr key={sub.id}>
                            <td>{parent?.title}</td>
                            <td><span className="badge" style={{background: isTest ? 'var(--set-orange)' : 'var(--set-navy)'}}>{isTest ? 'Test' : 'Assignment'}</span></td>
                            <td><span className={`status-badge ${sub.status === 'graded' ? 'status-completed' : 'status-pending'}`}>{sub.status === 'graded' ? 'Graded' : 'Pending'}</span></td>
                            <td style={{ fontWeight: 'bold' }}>{sub.status === 'graded' ? sub.grade : '-'}</td>
                          </tr>
                        );
                      })}
                      {[...submissions, ...testSubmissions].filter(s => s.studentId === selectedStudent.id).length === 0 && (
                        <tr><td colSpan="4" style={{textAlign: 'center'}}>No submissions on record.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ... Other tabs ... */}
        {activeTab === 'assignments' && (
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', flex: 1 }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={20} color="var(--set-green)"/> Create Assignment
              </h3>
              <form onSubmit={handleCreateAssignment}>
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" name="title" className="form-control" required />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" name="dueDate" className="form-control" required />
                </div>
                <div className="form-group">
                  <label>Instructions</label>
                  <textarea name="desc" className="form-control" rows="4" required></textarea>
                </div>
                <button type="submit" className="btn-primary">Post Assignment</button>
              </form>
            </div>
            <div className="glass-panel" style={{ padding: '2rem', flex: 1 }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Assignments</h3>
              {assignments.map(a => (
                <div key={a.id} style={{ padding: '1rem', borderBottom: '1px solid var(--panel-border)' }}>
                  <h4>{a.title}</h4>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', flex: 1.5 }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={20} color="var(--set-green)"/> Create New Test
              </h3>
              <form onSubmit={handleCreateTest}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                    <label>Test Title</label>
                    <input type="text" className="form-control" required value={newTestTitle} onChange={e => setNewTestTitle(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Due Date</label>
                    <input type="date" className="form-control" required value={newTestDue} onChange={e => setNewTestDue(e.target.value)} />
                  </div>
                </div>
                
                <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Questions</h4>
                {testQuestions.map((q, idx) => (
                  <div key={idx} className="form-group" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '8px', fontWeight: 600 }}>{idx + 1}</div>
                    <textarea 
                      className="form-control" 
                      rows="2" 
                      placeholder="Enter question text..."
                      value={q.text} 
                      onChange={e => handleQuestionChange(idx, e.target.value)}
                      required
                    ></textarea>
                  </div>
                ))}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                  <button type="button" className="btn-outline" onClick={handleAddQuestion}>+ Add Another Question</button>
                  <button type="submit" className="btn-primary">Publish Test</button>
                </div>
              </form>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem', flex: 1 }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Active Tests</h3>
              {tests.map(t => (
                <div key={t.id} style={{ padding: '1rem', borderBottom: '1px solid var(--panel-border)' }}>
                  <h4>{t.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.questions.length} Questions | Due: {new Date(t.dueDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'grading' && gradingSubmission && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem' }}>
              <div>
                <h2>Grading: {gradingSubmission.studentName}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {gradingType === 'assignment' 
                    ? `Assignment: ${assignments.find(a => a.id === gradingSubmission.assignmentId)?.title}`
                    : `Test: ${tests.find(t => t.id === gradingSubmission.testId)?.title}`}
                </p>
              </div>
              <span className="badge" style={{ background: gradingType === 'test' ? 'var(--set-orange)' : 'var(--set-navy)'}}>
                {gradingType.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '3rem' }}>
              <div style={{ flex: 1.5 }}>
                <h3 style={{ marginBottom: '1rem' }}>Student Submission</h3>
                
                {gradingType === 'assignment' ? (
                  <div style={{ width: '100%', height: '300px', background: 'var(--bg-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--panel-border)' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>[ Simulated Hand-drawn Image Upload ]</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {tests.find(t => t.id === gradingSubmission.testId)?.questions.map((q, idx) => (
                      <div key={idx} style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                        <p style={{ fontWeight: 600, color: 'var(--set-navy)', marginBottom: '0.5rem' }}>Q{idx + 1}: {q.text}</p>
                        <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', borderLeft: '3px solid var(--set-orange)' }}>
                          {gradingSubmission.answers[idx] || <i>No answer provided</i>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
                <div style={{ background: 'rgba(75,142,61,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--set-green)' }}>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--set-green)' }}>Assessment Form</h3>
                  <div className="form-group">
                    <label>Grade (0-100)</label>
                    <input type="number" className="form-control" value={gradeInput} onChange={e => setGradeInput(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Moderator Feedback</label>
                    <textarea className="form-control" rows="5" value={feedbackInput} onChange={e => setFeedbackInput(e.target.value)}></textarea>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" onClick={handleGradeSubmit}>Save Grade</button>
                    <button className="btn-outline" onClick={() => setActiveTab('dashboard')}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <div className="page-header">
              <h2>Daily Attendance Tracker</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ fontWeight: 600, color: 'var(--set-navy)' }}>Date:</label>
                <input 
                  type="date" 
                  className="form-control" 
                  style={{ width: 'auto' }}
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div className="table-container" style={{ marginBottom: '2rem' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const existingRecordDay = attendance.find(a => a.date === attendanceDate);
                      const existingStatus = existingRecordDay?.records?.find(r => r.studentId === student.id)?.status;
                      const currentVal = attendanceRecords[student.id] || existingStatus || 'Present';

                      return (
                        <tr key={student.id}>
                          <td>{student.name}</td>
                          <td>
                            <select 
                              className="form-control" 
                              style={{ width: 'auto' }}
                              value={currentVal}
                              onChange={(e) => setAttendanceRecords({ ...attendanceRecords, [student.id]: e.target.value })}
                            >
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="Late">Late</option>
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <button className="btn-primary" onClick={handleSaveAttendance}>
                Save Attendance Register
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
