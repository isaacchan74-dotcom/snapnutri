import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Icon, type IconName } from '../../ui/Icon';
import { PIKA_HAPPY, PIKA_RESTING } from '../../ui/Pika';

const SLIDES: { eyebrow: string; title: string; text: string; art: string; icon: IconName }[] = [
  {
    eyebrow: 'Meet Pika',
    title: 'A little care, every day.',
    text: 'A meal, a memory, a little companion. Your everyday food journal.',
    art: PIKA_HAPPY,
    icon: 'Leaf',
  },
  {
    eyebrow: 'Snap, don’t search',
    title: 'One photo is all it takes.',
    text: 'Pika looks at your plate and estimates what’s on it. You always get the final say.',
    art: PIKA_RESTING,
    icon: 'Snap',
  },
  {
    eyebrow: 'Grow together',
    title: 'Your month, one sticker at a time.',
    text: 'Every meal fills your calendar, and Pika grows happier with each little check-in.',
    art: PIKA_HAPPY,
    icon: 'Journal',
  },
];

/** The walk-in: what a brand-new visitor sees before signing up. */
export function WelcomePage() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;

  return (
    <div className="walk-in">
      <div className="brand center">
        SnapNutri<span style={{ color: 'var(--accent)' }}>.</span>
      </div>
      <section className="walk-slide center" key={index}>
        <img className="pika" src={slide.art} alt="Pika, your fluffy gray and cream companion" />
        <div className="eyebrow walk-eyebrow">
          <Icon name={slide.icon} />
          {slide.eyebrow}
        </div>
        <h1>{slide.title}</h1>
        <p className="muted">{slide.text}</p>
      </section>
      <div className="walk-dots" aria-hidden="true">
        {SLIDES.map((item, i) => (
          <span key={item.eyebrow} className={i === index ? 'on' : ''} />
        ))}
      </div>
      <div className="sticky-actions">
        <button className="btn" onClick={() => (last ? navigate('/signup') : setIndex(index + 1))}>
          {last ? 'Start my journal' : 'Next'}
        </button>
        {last ? (
          <Link className="btn secondary" to="/login">
            I already have an account
          </Link>
        ) : (
          <button className="btn quiet" onClick={() => setIndex(SLIDES.length - 1)}>
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
