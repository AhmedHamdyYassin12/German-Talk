
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (nickname: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [nickname, setNickname] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onLogin(nickname.trim());
    }
  };

  const generateRandomName = () => {
    const adj = ['Glückliche', 'Schnelle', 'Kluge', 'Mutige', 'Lustige'];
    const noun = ['Eule', 'Katze', 'Bär', 'Adler', 'Wolf'];
    const random = `${adj[Math.floor(Math.random() * adj.length)]}${noun[Math.floor(Math.random() * noun.length)]}${Math.floor(Math.random() * 99)}`;
    setNickname(random);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">DeutschTalk</h1>
        <p className="text-slate-500">Practice German with random learners anonymously.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Wähle einen Nicknamen
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="z.B. DeutschProfi123"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              maxLength={20}
              required
            />
            <button
              type="button"
              onClick={generateRandomName}
              className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
              title="Zufälligen Namen generieren"
            >
              🎲
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all transform active:scale-[0.98]"
        >
          Anfangen
        </button>
      </form>

      <div className="mt-8 flex items-center gap-4 text-xs text-slate-400">
        <div className="flex-1 h-px bg-slate-100" />
        <span>KEINE PERSÖNLICHEN DATEN GESPEICHERT</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
    </div>
  );
};

export default Login;
