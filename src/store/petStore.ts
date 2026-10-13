import { create } from 'zustand';

import { loadPet, savePet, type PetPatch, type PetProgress } from '../api/pet';
import { REWARDED_LOGS_PER_DAY } from '../lib/journal';

export const XP_PER_LEVEL = 100;
export const ACCESSORIES = [
  { name: 'Tiny scarf', glyph: '≈', level: 1 },
  { name: 'Leaf hat', glyph: '❧', level: 1 },
  { name: 'Small backpack', glyph: '▢', level: 4 },
  { name: 'Cozy blanket', glyph: '▱', level: 4 },
] as const;

export function levelOf(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return { level, toNext: XP_PER_LEVEL - into, share: (into / XP_PER_LEVEL) * 100 };
}

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

type PetState = {
  userId: string | null;
  pet: PetProgress | null;
  error: string | null;
  load: (userId: string) => Promise<void>;
  reset: () => void;
  /** +10 points, +5 XP, +2 happiness — for the first few logs of a day. */
  rewardLog: (logsThatDayBefore: number) => Promise<void>;
  /** One-time bonus the first time a day becomes balanced. Returns true if it paid out. */
  rewardBalancedDay: (day: string) => Promise<boolean>;
  feed: () => Promise<boolean>;
  spendTime: () => Promise<void>;
  equip: (accessory: string | null) => Promise<void>;
};

export const usePetStore = create<PetState>((set, get) => {
  const apply = async (patch: (pet: PetProgress) => PetPatch) => {
    const { pet, userId } = get();
    if (!pet || !userId) return;
    const next = patch(pet);
    set({ pet: { ...pet, ...next } });
    try {
      set({ pet: await savePet(userId, next), error: null });
    } catch (error) {
      set({ pet, error: error instanceof Error ? error.message : 'Could not save Pika.' });
    }
  };

  return {
    userId: null,
    pet: null,
    error: null,

    load: async (userId) => {
      set({ userId });
      try {
        set({ pet: await loadPet(userId), error: null });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Could not load Pika.' });
      }
    },

    reset: () => set({ userId: null, pet: null, error: null }),

    rewardLog: async (logsThatDayBefore) => {
      if (logsThatDayBefore >= REWARDED_LOGS_PER_DAY) return;
      await apply((pet) => ({
        points: pet.points + 10,
        xp: pet.xp + 5,
        happiness: clamp(pet.happiness + 2),
      }));
    },

    rewardBalancedDay: async (day) => {
      const pet = get().pet;
      if (!pet || pet.bonus_days.includes(day)) return false;
      await apply((current) => ({
        points: current.points + 80,
        xp: current.xp + 35,
        happiness: clamp(current.happiness + 4),
        health: clamp(current.health + 6),
        bonus_days: [...current.bonus_days, day].slice(-60),
      }));
      return true;
    },

    feed: async () => {
      const pet = get().pet;
      if (!pet || pet.points < 10) return false;
      await apply((current) => ({ points: current.points - 10, happiness: clamp(current.happiness + 3) }));
      return true;
    },

    spendTime: async () => {
      await apply((pet) => ({ happiness: clamp(pet.happiness + 2) }));
    },

    equip: async (accessory) => {
      await apply(() => ({ accessory }));
    },
  };
});
