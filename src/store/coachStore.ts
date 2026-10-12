import { create } from 'zustand';

import { askCoach } from '../api/coach';
import type { CoachMessage } from '../types/coach';

const WELCOME: CoachMessage = {
  id: 'welcome',
  role: 'assistant',
  text: "I'm on your log. Ask about today, this week, or what to eat next — or send a plate from Snap.",
};

type CoachState = {
  messages: CoachMessage[];
  sending: boolean;
  error: string | null;
  handledPhoto: string | null;
  send: (text: string, photo?: string | null) => Promise<void>;
  ingestPhoto: (photo: string) => Promise<void>;
  reset: () => void;
};

export const useCoachStore = create<CoachState>((set, get) => ({
  messages: [WELCOME],
  sending: false,
  error: null,
  handledPhoto: null,

  send: async (text, photo) => {
    const message = text.trim() || (photo ? "What's on this plate, and how does it fit my day?" : '');
    if (!message || get().sending) return;

    const userMessage: CoachMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: message,
      photo: photo ?? undefined,
    };

    const history = get()
      .messages.filter((item) => item.id !== 'welcome')
      .map((item) => ({ role: item.role, content: item.text }));

    set({
      messages: [...get().messages, userMessage],
      sending: true,
      error: null,
    });

    try {
      const reply = await askCoach({
        message,
        history,
        photo: photo ?? null,
      });
      set({
        messages: [
          ...get().messages,
          { id: crypto.randomUUID(), role: 'assistant', text: reply },
        ],
        sending: false,
      });
    } catch (error) {
      set({
        sending: false,
        error: error instanceof Error ? error.message : 'Could not reach the coach.',
      });
    }
  },

  ingestPhoto: async (photo) => {
    if (!photo || get().handledPhoto === photo || get().sending) return;
    set({ handledPhoto: photo });
    await get().send("What's on this plate, and how does it fit my day?", photo);
  },

  reset: () => {
    set({
      messages: [WELCOME],
      sending: false,
      error: null,
      handledPhoto: null,
    });
  },
}));
