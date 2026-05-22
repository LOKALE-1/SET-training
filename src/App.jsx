import React from 'react';
import './App.css';
import StudentPortal from './components/StudentPortal';
import ModeratorPortal from './components/ModeratorPortal';
import { BookOpen, UserCircle, ShieldCheck } from 'lucide-react';
import { AppProvider, useAppContext } from './context/AppContext';

function MainApp() {
  const { currentUser, login, logout } = useAppContext();

  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-brand">
          <BookOpen size={28} color="white" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '1.2rem', lineHeight: 1 }}>SIZANANI</h1>
            <span style={{ fontSize: '0.65rem', letterSpacing: '1px', opacity: 0.8 }}>ENTREPRENEURSHIP TRAINING</span>
          </div>
          <span className="badge">Beta</span>
        </div>
        <div className="nav-user">
          {currentUser && (
            <>
              <span>{currentUser.name} ({currentUser.role})</span>
              <button className="btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }} onClick={logout}>Sign Out</button>
            </>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {!currentUser ? (
          <div className="role-selection glass-panel animate-fade-in">
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

            <p style={{ marginTop: '2rem' }}>Simulated Authentication: Select a role to log in instantly.</p>
            
            <div className="role-buttons">
              <button 
                className="btn-primary" 
                onClick={() => login('student', 'Jane Doe')}
                style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
              >
                <UserCircle size={24} />
                Login as Student
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => login('moderator', 'Moderator Admin')}
                style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
              >
                <ShieldCheck size={24} />
                Login as Moderator
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {currentUser.role === 'student' ? <StudentPortal /> : <ModeratorPortal />}
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
