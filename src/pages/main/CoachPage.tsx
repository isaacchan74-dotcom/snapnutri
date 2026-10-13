import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';

import { useCoachStore } from '../../store/coachStore';
import { BackHead } from '../../ui/BackHead';
import { useJournalData } from '../../ui/hooks';
import { PIKA_HAPPY } from '../../ui/Pika';

const STARTERS = [
  'What should I eat for dinner?',
  'How did today go so far?',
  'How does my week look?',
  'A quick high-protein snack idea?',
];

export function CoachPage() {
  useJournalData();
  const location = useLocation();
  const ask = (location.state as { ask?: string } | null)?.ask ?? '';
  const messages = useCoachStore((state) => state.messages);
  const sending = useCoachStore((state) => state.sending);
  const error = useCoachStore((state) => state.error);
  const send = useCoachStore((state) => state.send);
  const [text, setText] = useState(ask);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, sending]);

  const submit = (event?: FormEvent, value = text) => {
    event?.preventDefault();
    if (!value.trim() || sending) return;
    setText('');
    void send(value);
  };

  return (
    <>
      <BackHead title="Ask Pika" sub="Gentle ideas from your own journal." to="/home" />
      <div className="thread">
        {messages.map((message) =>
          message.role === 'assistant' ? (
            <div key={message.id} className="coach-head">
              <img className="mini" src={PIKA_HAPPY} alt="" />
              <div className="bubble buddy">{message.text}</div>
            </div>
          ) : (
            <div key={message.id} className="bubble me">
              {message.photo ? <img src={message.photo} alt="Your plate" /> : null}
              {message.text}
            </div>
          ),
        )}
        {sending ? <p className="typing">Pika is thinking…</p> : null}
        {error ? <div className="banner">{error}</div> : null}
        <div ref={endRef} />
      </div>
      {messages.length <= 1 ? (
        <div className="starters">
          {STARTERS.map((starter) => (
            <button key={starter} onClick={() => submit(undefined, starter)}>
              {starter}
            </button>
          ))}
        </div>
      ) : null}
      <form className="compose" onSubmit={submit}>
        <input className="field" placeholder="Ask about your meals…" maxLength={1200} value={text} onChange={(event) => setText(event.target.value)} />
        <button className="btn" disabled={sending || !text.trim()}>
          Send
        </button>
      </form>
      <p className="notice center" style={{ marginTop: 10 }}>
        Friendly guidance, not medical advice.
      </p>
    </>
  );
}
