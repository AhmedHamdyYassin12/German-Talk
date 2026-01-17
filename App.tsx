
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import Lobby from './components/Lobby';
import Matching from './components/Matching';
import CallInterface from './components/CallInterface';
import { AppState, UserSession } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppState>('LOGIN');
  const [session, setSession] = useState<UserSession | null>(null);

  // Persistence check (session only)
  useEffect(() => {
    const saved = sessionStorage.getItem('dt_session');
    if (saved) {
      setSession(JSON.parse(saved));
      setView('LOBBY');
    }
  }, []);

  const handleLogin = (nickname: string) => {
    const newSession = { nickname, joinedAt: Date.now() };
    setSession(newSession);
    sessionStorage.setItem('dt_session', JSON.stringify(newSession));
    setView('LOBBY');
  };

  const handleLogout = () => {
    setSession(null);
    sessionStorage.removeItem('dt_session');
    setView('LOGIN');
  };

  const startMatch = () => setView('MATCHING');
  const cancelMatch = () => setView('LOBBY');
  const enterCall = () => setView('IN_CALL');
  const leaveCall = () => setView('LOBBY');

  return (
    <Layout>
      {view === 'LOGIN' && <Login onLogin={handleLogin} />}
      
      {view === 'LOBBY' && session && (
        <Lobby 
          nickname={session.nickname} 
          onStartMatch={startMatch} 
          onLogout={handleLogout} 
        />
      )}

      {view === 'MATCHING' && (
        <Matching onCancel={cancelMatch} onMatched={enterCall} />
      )}

      {view === 'IN_CALL' && session && (
        <CallInterface nickname={session.nickname} onEndCall={leaveCall} />
      )}
    </Layout>
  );
};

export default App;
