import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/snap', label: 'Snap', icon: CameraIcon },
  { to: '/journal', label: 'Journal', icon: BookIcon },
  { to: '/dashboard', label: 'Stats', icon: ChartIcon },
  { to: '/profile', label: 'Profile', icon: PersonIcon },
] as const;

export function TabBar() {
  return (
    <nav className="tab-bar" aria-label="Main">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
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
      })}
    </nav>
  );
}

function CameraIcon({ active }: { active: boolean }) {
  return (
    <svg className="tab-bar__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2l1.2-1.6A1.5 1.5 0 0 1 10.9 4h2.2c.46 0 .9.21 1.2.56L15.5 6H17.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} />
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

function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg className="tab-bar__icon" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 19V5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" />
      <path d="M5 19h14" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" />
      <path d="M8 15v-3" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" />
      <path d="M12 15V8" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" />
      <path d="M16 15v-6" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" />
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
