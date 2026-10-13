import { useEffect, useRef, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AiDisclaimer, AppText, Banner, Button, ScreenContainer } from '../../components';
import { useAuthStore } from '../../store/authStore';
import { useCoachStore } from '../../store/coachStore';
import type { CoachMessage } from '../../types/coach';

const STARTERS = [
  'What did I eat today?',
  'How was my protein this week?',
  'What should I eat for dinner?',
];

export function CoachScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const photo = (location.state as { photo?: string } | null)?.photo;
  const userId = useAuthStore((state) => state.user?.id);
  const messages = useCoachStore((state) => state.messages);
  const sending = useCoachStore((state) => state.sending);
  const error = useCoachStore((state) => state.error);
  const send = useCoachStore((state) => state.send);
  const ingestPhoto = useCoachStore((state) => state.ingestPhoto);
  const reset = useCoachStore((state) => state.reset);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userId) reset();
  }, [reset, userId]);

  useEffect(() => {
    if (!photo) return;
    navigate('/coach', { replace: true, state: {} });
    void ingestPhoto(photo);
  }, [ingestPhoto, navigate, photo]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, sending]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const field = inputRef.current;
    const value = field?.value ?? '';
    if (!value.trim() || sending) return;
    if (field) field.value = '';
    void send(value);
  };

  const showStarters = messages.length <= 1 && !sending;
  const hasPhoto = messages.some((message) => Boolean(message.photo));

  return (
    <ScreenContainer
      eyebrow="Coach"
      title="In the huddle"
      subtitle="Your real log. Straight talk."
      footer={
        <>
          {hasPhoto ? (
            <AiDisclaimer message="Calorie and macro numbers from a photo are AI estimates and can be off. Double-check them." />
          ) : null}
          <form className="coach-compose" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className="coach-compose__input"
              type="text"
              name="message"
              placeholder="Ask about today, this week, dinner…"
              autoComplete="off"
              disabled={sending}
              maxLength={1200}
              aria-label="Message the coach"
            />
            <Button label="Send" type="submit" size="sm" fullWidth={false} loading={sending} />
          </form>
        </>
      }
    >
      <div className="coach">
        {error ? <Banner message={error} /> : null}

        <div className="coach__thread" role="log" aria-live="polite">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
          {sending ? (
            <div className="chat-bubble chat-bubble--assistant">
              <AppText variant="caption" color="muted">
                Reading your log…
              </AppText>
            </div>
          ) : null}
          <div ref={endRef} />
        </div>

        {showStarters ? (
          <div className="coach__starters">
            {STARTERS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="coach__chip"
                onClick={() => void send(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </ScreenContainer>
  );
}

function ChatBubble({ message }: { message: CoachMessage }) {
  const mine = message.role === 'user';
  return (
    <div className={mine ? 'chat-bubble chat-bubble--user' : 'chat-bubble chat-bubble--assistant'}>
      {message.photo ? <img className="chat-bubble__photo" src={message.photo} alt="Plate sent to coach" /> : null}
      <AppText as="p" variant="body" color={mine ? 'onPrimary' : 'primary'}>
        {message.text}
      </AppText>
    </div>
  );
}
