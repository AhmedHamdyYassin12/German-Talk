
import React from 'react';

interface LobbyProps {
  nickname: string;
  onStartMatch: () => void;
  onLogout: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ nickname, onStartMatch, onLogout }) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
            {nickname.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-slate-800">Hallo, {nickname}!</span>
        </div>
        <button 
          onClick={onLogout}
          className="text-slate-400 hover:text-red-500 text-sm font-medium transition-colors"
        >
          Abmelden
        </button>
      </div>

      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          🇩🇪
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Bereit zum Sprechen?</h2>
        <p className="text-slate-500">Du wirst mit einem anderen Deutschlerner verbunden.</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={onStartMatch}
          className="w-full bg-red-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Partner finden
        </button>
        
        <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-slate-600">32 Leute online</span>
          </div>
          <span className="text-sm text-slate-400">Durschn. Wartezeit: 10s</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-50 rounded-xl text-center">
          <span className="block text-xl font-bold text-slate-800">10 Min.</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Zeitlimit</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl text-center">
          <span className="block text-xl font-bold text-slate-800">Verschlüsselt</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Privatsphäre</span>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
