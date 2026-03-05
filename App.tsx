
import React, { useState, useEffect } from 'react';
import ScenarioSelector from './components/ScenarioSelector';
import SetupScreen from './components/SetupScreen';
import ChatInterface from './components/ChatInterface';
import AdminPanel from './components/AdminPanel';
import LoginScreen from './components/Auth/LoginScreen';
import MuseumView from './components/MuseumView';
import SecurityShield from './components/SecurityShield';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ActiveSession, TeacherProfile, StudentProfile, Message, SessionLog, UserAccount } from './types';
import { buildDynamicPrompt, ScenarioCategory } from './services/chaosEngine';
import { getSessionBackup } from './services/storageService';
import { authService } from './services/authService';

type ViewState = 'landing' | 'setup' | 'chat' | 'admin' | 'auth' | 'museum';

const App: React.FC = () => {
  const [user, setUser] = useState<UserAccount | null>(authService.getCurrentUser());
  const [view, setView] = useState<ViewState>(user ? 'landing' : 'auth');
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [restoredMessages, setRestoredMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (user) Object.freeze(user);
  }, [user]);

  // Fix: The login process is handled inside the LoginScreen component, which updates localStorage.
  // This handler simply updates the root application state to reflect the authenticated session.
  const handleLogin = (email: string, role: any = 'USER') => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setView('landing');
  };

  const startSession = (teacher: TeacherProfile, student: StudentProfile, category?: ScenarioCategory) => {
    const isPremium = user?.role === 'ADMIN' || user?.role === 'PREMIUM';
    const sessionData = buildDynamicPrompt(teacher, student, isPremium, category);
    setActiveSession(sessionData);
    setRestoredMessages([]); 
    setView('chat');
  };

  const resumeSession = () => {
      const backup = getSessionBackup();
      if (backup) {
          setActiveSession(backup.session);
          setRestoredMessages(backup.messages);
          setView('chat');
      }
  };

  const handleRestoreSession = (log: SessionLog) => {
      if (log.sessionSnapshot) {
          setActiveSession(log.sessionSnapshot);
          setRestoredMessages(log.messages);
          setView('chat');
      }
  };

  const renderContent = () => {
    if (view === 'auth') return <LoginScreen onLogin={handleLogin} onEnterMuseum={() => setView('museum')} />;
    if (view === 'museum') return <MuseumView onBack={() => setView('auth')} />;
    
    return (
      <ErrorBoundary>
        {view === 'landing' && (
          <ScenarioSelector 
              onStart={() => setView('setup')} 
              onResume={resumeSession} 
          />
        )}

        {view === 'setup' && (
           <SetupScreen 
              onStart={startSession} 
              onOpenAdmin={() => setView('admin')} 
              onBack={() => setView('landing')}
           />
        )}
        
        {view === 'chat' && activeSession && (
          <ChatInterface 
            session={activeSession} 
            isAdmin={user?.role === 'ADMIN'}
            onExit={() => setView('landing')} 
            initialMessages={restoredMessages}
          />
        )}

        {view === 'admin' && (
          <AdminPanel 
            onBack={() => setView('setup')}
            onRestoreSession={handleRestoreSession}
          />
        )}
      </ErrorBoundary>
    );
  };

  return (
    <SecurityShield>
      {renderContent()}
    </SecurityShield>
  );
};

export default App;
