
import React, { useEffect, useState } from 'react';

interface MatchingProps {
  onCancel: () => void;
  onMatched: () => void;
}

const Matching: React.FC<MatchingProps> = ({ onCancel, onMatched }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    // Simulate finding a match in 3 seconds
    const matchTimer = setTimeout(() => {
      onMatched();
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(matchTimer);
    };
  }, [onMatched]);

  return (
    <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 text-center">
      <div className="relative mb-10">
        <div className="w-32 h-32 border-4 border-red-100 rounded-full mx-auto" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 border-t-4 border-red-600 rounded-full animate-spin" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">
          🔍
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mb-2">Suche nach Partner{dots}</h2>
      <p className="text-slate-500 mb-10 px-4">Wir suchen jemanden, der gerade auch Deutsch üben möchte.</p>

      <button
        onClick={onCancel}
        className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium hover:bg-slate-200 transition-colors"
      >
        Abbrechen
      </button>

      <div className="mt-8 p-4 bg-yellow-50 rounded-2xl text-left flex items-start gap-3">
        <div className="text-xl">💡</div>
        <div>
          <p className="text-xs font-bold text-yellow-800 uppercase mb-1">Tipp des Tages</p>
          <p className="text-xs text-yellow-700">Versuche, einfache Sätze zu verwenden und frage deinen Partner: "Wie geht es dir?"</p>
        </div>
      </div>
    </div>
  );
};

export default Matching;
