import React, { useState } from 'react';
import './App.css';
import StudentPortal from './components/StudentPortal';
import ModeratorPortal from './components/ModeratorPortal';
import { BookOpen, UserPlus } from 'lucide-react';
import { AppProvider, useAppContext } from './context/AppContext';

function MainApp() {
  const { currentUser, login, logout, students, facilitators, registerUser } = useAppContext();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [signUpRole, setSignUpRole] = useState('student'); // 'student' | 'moderator'
  const [signUpForm, setSignUpForm] = useState({
    name: '',
    surname: '',
    email: '',
    age: '',
    address: '',
    occupation: '',
    businessType: '',
    businessRegistrationStatus: 'Not Registered',
    isRemote: 'false',
    specialization: ''
  });
  const [signUpError, setSignUpError] = useState(null);

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    setSignUpError(null);

    if (!signUpForm.name.trim() || !signUpForm.email.trim()) {
      setSignUpError("First Name and Email are required.");
      return;
    }

    let userData = {
      role: signUpRole,
      name: signUpForm.name,
      email: signUpForm.email
    };

    if (signUpRole === 'student') {
      if (!signUpForm.surname.trim() || !signUpForm.address.trim()) {
        setSignUpError("Surname and Residential Address are required for students.");
        return;
      }
      userData = {
        ...userData,
        surname: signUpForm.surname,
        age: signUpForm.age,
        address: signUpForm.address,
        occupation: signUpForm.occupation,
        businessType: signUpForm.businessType,
        businessRegistrationStatus: signUpForm.businessRegistrationStatus,
        isRemote: signUpForm.isRemote === 'true',
        isSizananiAlumni: 'No'
      };
    } else {
      if (!signUpForm.specialization.trim()) {
        setSignUpError("Specialization is required for facilitators.");
        return;
      }
      userData = {
        ...userData,
        specialization: signUpForm.specialization
      };
    }

    try {
      const createdUser = registerUser(userData);
      // Automatically log in the newly created user
      login(signUpRole, createdUser.id);
      
      // Reset state
      setIsSignUpMode(false);
      setSignUpForm({
        name: '',
        surname: '',
        email: '',
        age: '',
        address: '',
        occupation: '',
        businessType: '',
        businessRegistrationStatus: 'Not Registered',
        isRemote: 'false',
        specialization: ''
      });
    } catch (err) {
      console.error(err);
      setSignUpError("Failed to register. Please check database permissions.");
    }
  };


  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <BookOpen size={28} color="white" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '1.2rem', lineHeight: 1 }}>SIZANANI</h1>
            <span className="nav-subtitle" style={{ fontSize: '0.65rem', letterSpacing: '1px', opacity: 0.8 }}>ENTREPRENEURSHIP TRAINING</span>
          </div>
        </div>
        <div className="nav-user">
          {currentUser && (
            <>
              <span className="nav-username" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge" style={{ 
                  background: currentUser.role === 'moderator' ? 'var(--set-green)' : 'var(--set-navy-light)',
                  border: '1px solid rgba(255,255,255,0.2)' 
                }}>
                  {currentUser.role === 'moderator' ? 'Facilitator' : 'Learner'}
                </span>
                <strong>{currentUser.name} {currentUser.surname || ''}</strong>
              </span>
              <button className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }} onClick={logout}>Sign Out</button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {!currentUser ? (
          isSignUpMode ? (
            /* --- SELF SIGN-UP SCREEN --- */
            <div className="role-selection glass-panel animate-fade-in" style={{ maxWidth: '680px', padding: '3rem 2.5rem', textAlign: 'left' }}>
              <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem', color: 'var(--set-green)' }}>
                  <UserPlus size={48} />
                </div>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--set-navy)', margin: 0 }}>Create Platform Account</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sign up to join Sizanani Entrepreneurship Training program.</p>
              </div>

              {signUpError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', borderLeft: '4px solid var(--danger-color)', padding: '0.75rem 1rem', borderRadius: '8px', color: 'var(--danger-color)', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                  ⚠️ {signUpError}
                </div>
              )}

              {/* SignUp Role Selection */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button 
                  type="button"
                  className={signUpRole === 'student' ? 'btn-secondary' : 'btn-outline'} 
                  onClick={() => { setSignUpRole('student'); setSignUpError(null); }}
                  style={{ flex: 1, color: signUpRole === 'student' ? 'white' : 'var(--set-navy)', border: '1px solid var(--set-navy)', padding: '0.5rem' }}
                >
                  Register as Student
                </button>
                <button 
                  type="button"
                  className={signUpRole === 'moderator' ? 'btn-secondary' : 'btn-outline'} 
                  onClick={() => { setSignUpRole('moderator'); setSignUpError(null); }}
                  style={{ flex: 1, color: signUpRole === 'moderator' ? 'white' : 'var(--set-navy)', border: '1px solid var(--set-navy)', padding: '0.5rem' }}
                >
                  Register as Facilitator
                </button>
              </div>

              <form onSubmit={handleSignUpSubmit} className="grid-form">
                <div className="form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={signUpForm.name} 
                    onChange={e => setSignUpForm({...signUpForm, name: e.target.value})} 
                  />
                </div>

                {signUpRole === 'student' ? (
                  <div className="form-group">
                    <label>Surname</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      value={signUpForm.surname} 
                      onChange={e => setSignUpForm({...signUpForm, surname: e.target.value})} 
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Specialization / Speciality</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      required 
                      placeholder="e.g. Financial Literacy, Marketing"
                      value={signUpForm.specialization} 
                      onChange={e => setSignUpForm({...signUpForm, specialization: e.target.value})} 
                    />
                  </div>
                )}

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    required 
                    value={signUpForm.email} 
                    onChange={e => setSignUpForm({...signUpForm, email: e.target.value})} 
                  />
                </div>

                {signUpRole === 'student' && (
                  <>
                    <div className="form-group">
                      <label>Age</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        required 
                        value={signUpForm.age} 
                        onChange={e => setSignUpForm({...signUpForm, age: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Remote / Overseas Student?</label>
                      <select 
                        className="form-control" 
                        value={signUpForm.isRemote}
                        onChange={e => setSignUpForm({...signUpForm, isRemote: e.target.value})}
                      >
                        <option value="false">No (Local Campus)</option>
                        <option value="true">Yes (Remote Access)</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Residential / Home Address</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        required 
                        value={signUpForm.address} 
                        onChange={e => setSignUpForm({...signUpForm, address: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Current Occupation</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={signUpForm.occupation} 
                        onChange={e => setSignUpForm({...signUpForm, occupation: e.target.value})} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Business Sector / Type</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={signUpForm.businessType} 
                        onChange={e => setSignUpForm({...signUpForm, businessType: e.target.value})} 
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>CIPC Registration</label>
                      <select 
                        className="form-control" 
                        value={signUpForm.businessRegistrationStatus} 
                        onChange={e => setSignUpForm({...signUpForm, businessRegistrationStatus: e.target.value})}
                      >
                        <option>Not Registered</option>
                        <option>Registered (CIPC)</option>
                        <option>In Progress</option>
                        <option>Informal Business</option>
                      </select>
                    </div>
                  </>
                )}

                <div style={{ gridColumn: 'span 2', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Register & Sign In
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <button 
                      type="button" 
                      style={{ border: 'none', background: 'none', color: 'var(--set-green)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                      onClick={() => { setIsSignUpMode(false); setSignUpError(null); }}
                    >
                      Sign In here
                    </button>
                  </p>
                </div>
              </form>
            </div>
          ) : (
            <div className="role-selection glass-panel animate-fade-in" style={{ maxWidth: '600px', width: '100%', padding: '4rem 3rem', textAlign: 'center', margin: '4rem auto' }}>
              <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--set-green)' }}>
                  <UsersGroupIcon />
                </div>
                <h2 style={{ fontSize: '2.5rem', letterSpacing: '2px', marginBottom: '0.25rem', color: 'var(--set-navy)' }}>SIZANANI</h2>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--set-green)', letterSpacing: '1px', borderTop: '1px solid var(--set-green)', borderBottom: '1px solid var(--set-orange)', padding: '0.25rem 0', margin: '0.5rem 0' }}>
                  ENTREPRENEURSHIP TRAINING
                </p>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '2px', color: 'var(--set-navy)' }}>
                  EMPOWER. EQUIP. ENTERPRISE.
                </p>
              </div>

              {students.length === 0 && facilitators.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>
                  No accounts yet.{' '}
                  <button
                    type="button"
                    style={{ border: 'none', background: 'none', color: 'var(--set-green)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                    onClick={() => setIsSignUpMode(true)}
                  >
                    Sign Up
                  </button>{' '}to create the first account.
                </p>
              ) : (
                <div style={{ marginTop: '2rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem', textAlign: 'left' }}>
                  <h4 style={{ color: 'var(--set-navy)', marginBottom: '0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Login as a Registered Account:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {students.map(s => (
                      <button
                        key={s.id}
                        className="btn-outline"
                        style={{ color: 'var(--set-navy)', border: '1px solid var(--panel-border)', background: 'white', padding: '0.5rem 1rem', fontSize: '0.85rem', justifyContent: 'space-between' }}
                        onClick={() => login('student', s.id)}
                      >
                        <span>Learner: {s.name} {s.surname || ''} {s.isRemote && '🌐'}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Sign In →</span>
                      </button>
                    ))}
                    {facilitators.map(f => (
                      <button
                        key={f.id}
                        className="btn-outline"
                        style={{ color: 'var(--set-navy)', border: '1px solid var(--panel-border)', background: 'white', padding: '0.5rem 1rem', fontSize: '0.85rem', justifyContent: 'space-between' }}
                        onClick={() => login('moderator', f.id)}
                      >
                        <span>Facilitator: {f.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Sign In →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p style={{ marginTop: '2.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="btn-outline"
                  style={{ display: 'inline', border: 'none', background: 'none', color: 'var(--set-green)', textDecoration: 'underline', padding: 0, cursor: 'pointer', fontWeight: 700 }}
                  onClick={() => setIsSignUpMode(true)}
                >
                  Sign Up here
                </button>
              </p>
            </div>
          )
        ) : (
          <div className="animate-fade-in">
            {currentUser.role === 'student' && <StudentPortal />}
            {currentUser.role === 'moderator' && <ModeratorPortal />}
          </div>
        )}
      </main>
    </div>
  );
}

// Custom SVG Icon to mimic the logo
function UsersGroupIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" stroke="var(--set-navy)" strokeWidth="4" strokeDasharray="180 100" strokeLinecap="round" />
      <path d="M20 70 C 40 85, 60 85, 80 70" stroke="var(--set-navy)" strokeWidth="8" strokeLinecap="round" />
      <circle cx="35" cy="35" r="6" fill="var(--set-green)" />
      <path d="M25 55 L 35 45 L 45 55" stroke="var(--set-green)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="65" cy="35" r="6" fill="var(--set-orange)" />
      <path d="M55 55 L 65 45 L 75 55" stroke="var(--set-orange)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="25" r="8" fill="var(--set-navy)" />
      <path d="M40 45 L 50 35 L 60 45" stroke="var(--set-navy)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M60 65 Q 75 60 80 40 L 85 45 M 80 40 L 75 35" stroke="var(--set-green)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;
