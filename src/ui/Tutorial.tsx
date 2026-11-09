import { useEffect, useLayoutEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { updateProfilePrefs } from '../api/profiles';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { isProfileComplete } from '../types/profile';

const STEPS = [
  {
    id: 'snap',
    title: 'Snap a meal',
    body: 'Tap the camera to log what’s on your plate. Pika estimates the food — you keep the final say.',
  },
  {
    id: 'journal',
    title: 'Your journal',
    body: 'Every meal lands here: a calendar of plates, plus a quiet look at your calories and macros.',
  },
  {
    id: 'buddy',
    title: 'Meet Pika',
    body: 'Home is where your buddy lives. Log meals and Pika gets happier and healthier with you.',
  },
  {
    id: 'profile',
    title: 'Profile & settings',
    body: 'Goals, reminders, and late-night mood live here. Replay this tour anytime from Settings.',
  },
] as const;

type Hole = { top: number; left: number; width: number; height: number; radius: number };
type Bubble = { left: number; bottom?: number; top?: number; placement: 'above' | 'below' };

export function TutorialHost() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const setProfile = useAuthStore((state) => state.setProfile);
  const tourReplay = useUiStore((state) => state.tourReplay);
  const endTour = useUiStore((state) => state.endTour);
  const [step, setStep] = useState(0);
  const [hole, setHole] = useState<Hole | null>(null);
  const [bubble, setBubble] = useState<Bubble | null>(null);

  const shouldAuto = isProfileComplete(profile) && profile?.tutorial_completed === false;
  const active = Boolean(tourReplay || shouldAuto);
  const current = STEPS[step] ?? STEPS[0];

  useEffect(() => {
    if (!active) {
      setStep(0);
      setHole(null);
      setBubble(null);
      return;
    }
    if (location.pathname !== '/home') navigate('/home', { replace: true });
  }, [active, location.pathname, navigate]);

  useLayoutEffect(() => {
    if (!active) return;
    let timer: number | undefined;

    const measure = () => {
      const phone = document.getElementById('phone');
      const target = document.querySelector<HTMLElement>(`[data-tour="${current.id}"]`);
      if (!phone || !target) {
        timer = window.setTimeout(measure, 60);
        return;
      }
      document.querySelector('.screen')?.scrollTo({ top: 0 });
      const phoneBox = phone.getBoundingClientRect();
      const box = target.getBoundingClientRect();
      const pad = current.id === 'snap' ? 10 : 8;
      const nextHole: Hole = {
        top: box.top - phoneBox.top - pad,
        left: box.left - phoneBox.left - pad,
        width: box.width + pad * 2,
        height: box.height + pad * 2,
        radius: current.id === 'snap' ? 22 : 16,
      };
      setHole(nextHole);

      const bubbleWidth = Math.min(280, phoneBox.width - 40);
      const left = Math.min(
        Math.max(16, nextHole.left + nextHole.width / 2 - bubbleWidth / 2),
        phoneBox.width - bubbleWidth - 16,
      );
      setBubble({
        bottom: phoneBox.height - nextHole.top + 12,
        left,
        placement: 'above',
      });
    };

    const frame = window.requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener('resize', measure);
    };
  }, [active, current.id, location.pathname]);

  const finish = async () => {
    endTour();
    if (!user) return;
    try {
      setProfile(await updateProfilePrefs(user.id, { tutorial_completed: true }));
    } catch {
      // Preview storage still marks it locally when the column is missing.
    }
  };

  if (!active) return null;

  const last = step === STEPS.length - 1;

  return (
    <div className={`tour ${hole ? '' : 'tour--waiting'}`} role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {hole ? (
        <div
          className="tour-hole"
          style={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
            borderRadius: hole.radius,
          }}
        />
      ) : null}
      {bubble ? (
        <div
          className={`tour-bubble tour-bubble--${bubble.placement}`}
          style={{ top: bubble.top, bottom: bubble.bottom, left: bubble.left }}
        >
          <p className="tour-step">
            {step + 1} of {STEPS.length}
          </p>
          <h2 id="tour-title">{current.title}</h2>
          <p>{current.body}</p>
          <div className="tour-actions">
            <button className="tour-skip" type="button" onClick={() => void finish()}>
              Skip
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => {
                if (last) void finish();
                else setStep((index) => index + 1);
              }}
            >
              {last ? 'Got it' : 'Next'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
