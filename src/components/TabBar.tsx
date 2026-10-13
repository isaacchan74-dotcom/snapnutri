import { NavLink } from 'react-router-dom';

const SIDE_TABS = [
  { to: '/coach', label: 'Coach', icon: SparkIcon },
  { to: '/journal', label: 'Journal', icon: BookIcon },
  { to: '/character', label: 'Buddy', icon: BuddyIcon },
  { to: '/profile', label: 'Profile', icon: PersonIcon },
] as const;

export function TabBar() {
  return (
    <nav className="tab-bar" aria-label="Main">
      <SideTab tab={SIDE_TABS[0]} />
      <SideTab tab={SIDE_TABS[1]} />
      <NavLink
        to="/snap"
        aria-label="Snap"
        className={({ isActive }) =>
          isActive ? 'tab-bar__snap tab-bar__snap--active' : 'tab-bar__snap'
        }
      >
        {({ isActive }) => <CameraIcon active={isActive} />}
      </NavLink>
      <SideTab tab={SIDE_TABS[2]} />
      <SideTab tab={SIDE_TABS[3]} />
    </nav>
  );
}

function SideTab({
  tab,
}: {
  tab: (typeof SIDE_TABS)[number];
}) {
  const Icon = tab.icon;
  return (
    <NavLink
      to={tab.to}
      className={({ isActive }) => (isActive ? 'tab-bar__item tab-bar__item--active' : 'tab-bar__item')}
    >
      {({ isActive }) => (
        <>
          <Icon active={isActive} />
          <span>{tab.label}</span>
        </>
      )}
    </NavLink>
  );
}

function SparkIcon({ active }: { active: boolean }) {
  return (
    <svg className="tab-bar__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5 13.2 8.2 18 9.5 13.2 10.8 12 15.5 10.8 10.8 6 9.5 10.8 8.2 12 3.5Z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
        strokeLinejoin="round"
      />
      <path d="M18.5 14.5 19.2 16.6 21.5 17.2 19.2 17.8 18.5 20 17.8 17.8 15.5 17.2 17.8 16.6 18.5 14.5Z" fill="currentColor" />
    </svg>
  );
}

function CameraIcon({ active }: { active: boolean }) {
  return (
    <svg className="tab-bar__icon tab-bar__icon--snap" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2l1.2-1.6A1.5 1.5 0 0 1 10.9 4h2.2c.46 0 .9.21 1.2.56L15.5 6H17.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
        stroke="currentColor"
        strokeWidth={active ? 2.4 : 2}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth={active ? 2.4 : 2} />
    </svg>
  );
}

function BookIcon({ active }: { active: boolean }) {
  return (
    <svg className="tab-bar__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5V5.5Z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
        strokeLinejoin="round"
      />
      <path d="M5 19h12" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" />
    </svg>
  );
}

function BuddyIcon({ active }: { active: boolean }) {
  return (
    <svg className="tab-bar__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="13" r="6" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} />
      <circle cx="10" cy="12" r="1" fill="currentColor" />
      <circle cx="14" cy="12" r="1" fill="currentColor" />
      <path d="M10 15c1.2 1 2.8 1 4 0" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" />
      <path d="M12 4v3" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" />
    </svg>
  );
}

function PersonIcon({ active }: { active: boolean }) {
  return (
    <svg className="tab-bar__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} />
      <path
        d="M5.5 19c.7-3.2 3.2-5 6.5-5s5.8 1.8 6.5 5"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
        strokeLinecap="round"
      />
    </svg>
  );
}
