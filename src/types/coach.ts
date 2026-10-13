export type CoachRole = 'user' | 'assistant';

export type CoachMessage = {
  id: string;
  role: CoachRole;
  text: string;
  photo?: string;
};

export type CoachHistoryItem = {
  role: CoachRole;
  content: string;
};

export type CoachAskInput = {
  message: string;
  history: CoachHistoryItem[];
  photo?: string | null;
};
