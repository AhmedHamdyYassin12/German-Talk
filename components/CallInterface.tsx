
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../services/audioUtils';

interface CallInterfaceProps {
  nickname: string;
  onEndCall: () => void;
}

const CallInterface: React.FC<CallInterfaceProps> = ({ nickname, onEndCall }) => {
  const [seconds, setSeconds] = useState(600); // 10 minutes
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [transcriptions, setTranscriptions] = useState<{role: string, text: string}[]>([]);
  
  // Audio context and nodes
  const audioContextsRef = useRef<{
    input: AudioContext;
    output: AudioContext;
    inputNode: GainNode;
    outputNode: GainNode;
    sources: Set<AudioBufferSourceNode>;
  } | null>(null);
  
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const waveformRef = useRef<number[]>(new Array(16).fill(2));

  // Timer logic
  useEffect(() => {
    if (seconds <= 0) {
      onEndCall();
      return;
    }
    const timer = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds, onEndCall]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const cleanupAudio = useCallback(() => {
    if (audioContextsRef.current) {
      audioContextsRef.current.sources.forEach(s => s.stop());
      audioContextsRef.current.input.close();
      audioContextsRef.current.output.close();
    }
    if (sessionRef.current) {
      // session.close() is handled by the live object
    }
  }, []);

  const initializeCall = useCallback(async () => {
    try {
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inputNode = inputAudioContext.createGain();
      const outputNode = outputAudioContext.createGain();
      outputNode.connect(outputAudioContext.destination);
      const sources = new Set<AudioBufferSourceNode>();

      audioContextsRef.current = {
        input: inputAudioContext,
        output: outputAudioContext,
        inputNode,
        outputNode,
        sources
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              // Simple visualization update
              const level = Math.max(...inputData.map(Math.abs)) * 100;
              waveformRef.current = waveformRef.current.map(() => Math.max(4, Math.min(60, level * (0.5 + Math.random()))));

              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscriptions(prev => [...prev.slice(-4), { role: 'Partner', text: message.serverContent!.outputTranscription!.text }]);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => sources.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sources.add(source);
            }

            if (message.serverContent?.interrupted) {
              sources.forEach(s => { try { s.stop(); } catch(e) {} });
              sources.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error('Live API Error:', e),
          onclose: () => onEndCall()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: `Du bist Klaus, ein freundlicher deutscher Muttersprachler. 
          Du sprichst mit ${nickname}, einem Deutschlerner. 
          Halte die Unterhaltung natürlich, motivierend und korrigiere Fehler sanft, falls nötig. 
          Das Gespräch sollte maximal 10 Minuten dauern. 
          Sprich in einem moderaten Tempo, damit Lernende dich verstehen können.`
        }
      });

      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error('Failed to initialize call:', error);
      onEndCall();
    }
  }, [nickname, onEndCall, isMuted]);

  useEffect(() => {
    initializeCall();
    return () => cleanupAudio();
  }, [initializeCall, cleanupAudio]);

  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="bg-slate-900 min-h-[600px] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
      {/* Top Bar */}
      <div className="p-6 flex justify-between items-center bg-slate-800/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white font-bold tracking-tight">LIVE: GERMAN PRACTICE</span>
        </div>
        <div className={`px-4 py-1 rounded-full font-mono text-sm ${seconds < 60 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-slate-300'}`}>
          {formatTime(seconds)}
        </div>
      </div>

      {/* Main Call Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-700 shadow-xl overflow-hidden">
               <span className="text-5xl">🇩🇪</span>
            </div>
            {!isConnecting && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-slate-900 flex items-center justify-center text-xs">
                ✅
              </div>
            )}
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">Klaus</h3>
          <p className="text-slate-400 text-sm">Muttersprachler • Berlin</p>
        </div>

        {/* Visualizer */}
        <div className="flex items-end justify-center gap-1 h-20 w-full px-12">
          {waveformRef.current.map((height, i) => (
            <div 
              key={i} 
              className={`w-1.5 rounded-full transition-all duration-75 ${isConnecting ? 'bg-slate-700 h-2' : 'bg-red-500'}`}
              style={{ height: `${height}px` }}
            />
          ))}
        </div>

        {/* Live Transcription Preview (Mini) */}
        <div className="w-full max-w-xs bg-slate-800/30 rounded-2xl p-4 min-h-[80px]">
          {isConnecting ? (
            <p className="text-slate-500 text-xs text-center italic">Verbindung wird hergestellt...</p>
          ) : (
            <div className="space-y-2">
              {transcriptions.map((t, i) => (
                <p key={i} className="text-[10px] leading-tight">
                  <span className="text-red-400 font-bold mr-1">{t.role}:</span>
                  <span className="text-slate-300">{t.text}</span>
                </p>
              ))}
              {transcriptions.length === 0 && (
                <p className="text-slate-500 text-xs text-center italic">Sag etwas wie "Hallo Klaus!"</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-8 bg-slate-800/80 backdrop-blur-xl flex justify-center items-center gap-8">
        <button 
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-500 border-2 border-red-500' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
        >
          {isMuted ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          )}
        </button>

        <button 
          onClick={onEndCall}
          className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-900/40 hover:bg-red-500 hover:scale-110 active:scale-95 transition-all"
        >
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" transform="rotate(135 12 12)" />
          </svg>
        </button>

        <button className="w-14 h-14 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-600 transition-all opacity-50 cursor-not-allowed">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </button>
      </div>
    </div>
  );
};

export default CallInterface;
