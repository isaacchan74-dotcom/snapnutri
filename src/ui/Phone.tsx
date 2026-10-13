import { useEffect, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../store/authStore';
import { Icon, type IconName } from './Icon';
import { ModalHost, ToastHost } from './Overlays';
import { PIKA_HAPPY } from './Pika';

const TABS: { to: string; label: IconName; match: string[] }[] = [
  { to: '/home', label: 'Home', match: ['/home', '/pet', '/coach'] },
  { to: '/journal', label: 'Journal', match: ['/journal', '/meal'] },
  { to: '/snap', label: 'Snap', match: ['/snap'] },
  { to: '/tracker', label: 'Tracker', match: ['/tracker'] },
  { to: '/profile', label: 'Profile', match: ['/profile'] },
];

/** Screens that take over the whole app, like the prototype's capture flow. */
const NO_NAV = [/^\/snap/, /^\/meal\/[^/]+\/(review|result)/];

type PhoneProps = { children: ReactNode; nav?: boolean };

/** The app frame: full screen on a phone, a centred phone-width window on desktop. */
export function Phone({ children, nav = false }: PhoneProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const showNav = nav && !NO_NAV.some((pattern) => pattern.test(pathname));
  const night = Boolean(profile?.night_mode);
  // Pika floats on the main tabs, but not where Pika is already the whole page.
  const showPika = showNav && !pathname.startsWith('/coach') && !pathname.startsWith('/pet');

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', night ? '#2E2925' : '#F7F2E9');
  }, [night]);

  return (
    <div className={`phone ${showNav ? '' : 'nonav'} ${night ? 'night' : ''} ${showPika ? 'has-pika' : ''}`} id="phone">
      <main className="screen" key={pathname}>
        {children}
      </main>
      {showNav ? (
        <nav className="nav" aria-label="Main navigation">
          {TABS.map((tab) => {
            const active = tab.match.some((prefix) => pathname.startsWith(prefix));
            const snap = tab.label === 'Snap';
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                aria-label={tab.label}
                aria-current={active ? 'page' : undefined}
                className={`${snap ? 'snapnav' : ''} ${active ? 'active' : ''}`}
              >
                {snap ? (
                  <span className="cam">
                    <Icon name="Snap" />
                  </span>
                ) : (
                  <Icon name={tab.label} />
                )}
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>
      ) : null}
      {showPika ? (
        <button className="float-pika" aria-label="Ask Pika" onClick={() => navigate('/coach')}>
          <span className="say">Ask Pika</span>
          <span className="buddy-face">
            <img src={PIKA_HAPPY} alt="" />
          </span>
        </button>
      ) : null}
      <ModalHost />
      <ToastHost />
    </div>
  );
}
