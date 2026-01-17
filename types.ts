
export type AppState = 'LOGIN' | 'LOBBY' | 'MATCHING' | 'IN_CALL';

export interface UserSession {
  nickname: string;
  joinedAt: number;
}

export interface CallStats {
  durationRemaining: number;
  partnerName: string;
  isMuted: boolean;
}

export interface TranscriptionEntry {
  speaker: 'user' | 'model';
  text: string;
  timestamp: number;
}
