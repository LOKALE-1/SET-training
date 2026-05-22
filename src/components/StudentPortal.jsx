import React, { useState } from 'react';
import { BookOpen, Upload, CheckCircle, FileText, User, Bell, Edit3 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function StudentPortal() {
  const { currentUser, assignments, submissions, submitAssignment, materials, tests, testSubmissions, submitTest, updateProfile } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || '',
    surname: currentUser.surname || '',
    address: currentUser.address || '',
    occupation: currentUser.occupation || '',
    businessType: currentUser.businessType || '',
    email: currentUser.email || '',
    businessRegistrationStatus: currentUser.businessRegistrationStatus || 'Not Registered',
    age: currentUser.age || '',
    isSizananiAlumni: currentUser.isSizananiAlumni || 'No'
  });

  const [saveStatus, setSaveStatus] = useState(null);
  
  // Test Taking State
  const [takingTest, setTakingTest] = useState(null);
  const [testAnswers, setTestAnswers] = useState({});

  const mySubmissions = submissions.filter(s => s.studentId === currentUser.id);
  const pendingAssignments = assignments.filter(a => !mySubmissions.find(s => s.assignmentId === a.id));
  
  const myTestSubmissions = testSubmissions.filter(s => s.studentId === currentUser.id);
  const pendingTests = tests.filter(t => !myTestSubmissions.find(s => s.testId === t.id));

  const handleUploadClick = (assignmentId) => {
    submitAssignment({ assignmentId, studentId: currentUser.id, studentName: currentUser.name, imageBase64: 'mock_image_data_base64', submittedAt: new Date().toISOString() });
  };

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
    setActiveTab('tests');
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <aside className="sidebar">
        <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <User size={20} /> Dashboard
        </div>
        <div className={`nav-item ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>
          <FileText size={20} /> Assignments
          {pendingAssignments.length > 0 && <span className="badge" style={{marginLeft: 'auto'}}>{pendingAssignments.length}</span>}
        </div>
        <div className={`nav-item ${activeTab === 'tests' ? 'active' : ''}`} onClick={() => {setActiveTab('tests'); setTakingTest(null);}}>
          <Edit3 size={20} /> Tests
          {pendingTests.length > 0 && <span className="badge" style={{marginLeft: 'auto', background: 'var(--set-orange)'}}>{pendingTests.length}</span>}
        </div>
        <div className={`nav-item ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>
          <BookOpen size={20} /> Learning Hub
        </div>
        <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={20} /> My Profile
        </div>
      </aside>

      <main className="dashboard-content">
        {activeTab === 'dashboard' && (
          <div>
            <div className="page-header">
              <h2>Welcome back, {currentUser.name}</h2>
              <button className="btn-outline"><Bell size={18} /> Notifications</button>
            </div>
            
            <div className="grid-cards">
              <div className="stat-card glass-panel">
                <div className="stat-icon orange"><FileText size={28} /></div>
                <div className="stat-info">
                  <h3>Pending Tasks</h3>
                  <p>{pendingAssignments.length + pendingTests.length}</p>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon green"><CheckCircle size={28} /></div>
                <div className="stat-info">
                  <h3>Completed</h3>
                  <p>{mySubmissions.length + myTestSubmissions.length}</p>
                </div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-icon navy"><Edit3 size={28} /></div>
                <div className="stat-info">
                  <h3>Avg Test Score</h3>
                  <p>
                    {myTestSubmissions.filter(s => s.status === 'graded').length > 0 
                      ? Math.round(myTestSubmissions.filter(s => s.status === 'graded').reduce((a, b) => a + Number(b.grade), 0) / myTestSubmissions.filter(s => s.status === 'graded').length) + '%'
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--set-navy)' }}>Recent Feedback</h3>
              {[...mySubmissions, ...myTestSubmissions].filter(s => s.status === 'graded').length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No graded items yet.</p>
              ) : (
                [...mySubmissions, ...myTestSubmissions].filter(s => s.status === 'graded').map(sub => {
                  const isTest = !!sub.testId;
                  const parent = isTest ? tests.find(t => t.id === sub.testId) : assignments.find(a => a.id === sub.assignmentId);
                  return (
                    <div key={sub.id} style={{ background: 'rgba(75, 142, 61, 0.05)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--set-green)', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h4>{parent?.title}</h4>
                        <span className="badge" style={{ background: isTest ? 'var(--set-orange)' : 'var(--set-navy)'}}>{isTest ? 'Test' : 'Assignment'}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>"{sub.feedback}"</p>
                      <div style={{ marginTop: '1rem', fontWeight: 'bold', color: 'var(--set-green)' }}>Grade: {sub.grade}/100</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ... Assignments tab ... */}
        {activeTab === 'assignments' && (
          <div>
            <div className="page-header"><h2>Assignments & Submissions</h2></div>
            {assignments.length === 0 && <p>No assignments posted yet.</p>}
            {assignments.map(assignment => {
              const submission = mySubmissions.find(s => s.assignmentId === assignment.id);
              return (
                <div key={assignment.id} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ marginBottom: '0.5rem' }}>{assignment.title}</h3>
                      <p style={{ color: 'var(--text-secondary)' }}>Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                    </div>
                    {submission && (
                      <span className={`status-badge ${submission.status === 'graded' ? 'status-completed' : 'status-pending'}`}>
                        {submission.status === 'graded' ? `Graded: ${submission.grade}/100` : 'Submitted (Pending Grade)'}
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}>{assignment.description}</p>
                  {!submission ? (
                    <div className="upload-area" onClick={() => handleUploadClick(assignment.id)}>
                      <Upload size={48} className="upload-icon" />
                      <h3>Click to Simulate Image Upload</h3>
                    </div>
                  ) : (
                     <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(75, 142, 61, 0.05)', borderRadius: '12px', border: '1px solid var(--set-green)' }}>
                       <CheckCircle size={32} color="var(--set-green)" style={{ margin: '0 auto 0.5rem' }} />
                       <h4 style={{ color: 'var(--set-green)' }}>Practical Work Uploaded</h4>
                     </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'tests' && (
          <div>
            <div className="page-header">
              <h2>Tests & Quizzes</h2>
            </div>
            
            {takingTest ? (
              <div className="glass-panel animate-fade-in" style={{ padding: '3rem' }}>
                <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem' }}>
                  <h2>{takingTest.title}</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Please answer all questions before submitting. Your work is not saved until you hit submit.</p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
                  {takingTest.questions.map((q, idx) => (
                    <div key={idx}>
                      <h4 style={{ marginBottom: '1rem', color: 'var(--set-navy)' }}>Question {idx + 1}: {q.text}</h4>
                      <textarea 
                        className="form-control" 
                        rows="4" 
                        placeholder="Type your answer here..."
                        value={testAnswers[idx] || ''}
                        onChange={e => setTestAnswers({...testAnswers, [idx]: e.target.value})}
                      ></textarea>
                    </div>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn-primary" onClick={handleTestSubmit}>Submit Test</button>
                  <button className="btn-outline" onClick={() => {setTakingTest(null); setTestAnswers({});}}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                {tests.length === 0 && <p>No tests posted yet.</p>}
                {tests.map(test => {
                  const submission = myTestSubmissions.find(s => s.testId === test.id);
                  return (
                    <div key={test.id} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ marginBottom: '0.5rem' }}>{test.title}</h3>
                          <p style={{ color: 'var(--text-secondary)' }}>{test.questions.length} Questions | Due: {new Date(test.dueDate).toLocaleDateString()}</p>
                        </div>
                        {submission && (
                          <span className={`status-badge ${submission.status === 'graded' ? 'status-completed' : 'status-pending'}`}>
                            {submission.status === 'graded' ? `Graded: ${submission.grade}/100` : 'Submitted (Pending Grade)'}
                          </span>
                        )}
                      </div>

                      {!submission ? (
                        <button className="btn-primary" onClick={() => setTakingTest(test)}>
                          Start Test
                        </button>
                      ) : (
                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem' }}>
                          <h4 style={{ marginBottom: '1rem', color: 'var(--set-navy)' }}>Your Submitted Answers:</h4>
                          {test.questions.map((q, idx) => (
                            <div key={idx} style={{ marginBottom: '1rem', background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px' }}>
                              <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Q: {q.text}</p>
                              <p style={{ color: 'var(--text-secondary)' }}>A: {submission.answers[idx] || <i>No answer provided</i>}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3>Learning Hub</h3>
            <p style={{marginTop: '1rem', color: 'var(--text-secondary)'}}>Content repository goes here.</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2.5rem' }}>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
              <h2>Learner Profile</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Keep your information up to date to help us support your business journey.</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              updateProfile(profileForm);
              setSaveStatus('Profile updated successfully!');
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
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
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
              
              <div style={{ gridColumn: 'span 2', marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
