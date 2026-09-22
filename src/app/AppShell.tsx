import type { ReactNode } from 'react';

import { TabBar } from '../components';

type AppShellProps = {
  children: ReactNode;
  showTabs?: boolean;
};

export function AppShell({ children, showTabs = false }: AppShellProps) {
  return (
    <div className="shell">
      <div className="frame">
        {children}
        {showTabs ? <TabBar /> : null}
      </div>
    </div>
  );
}
