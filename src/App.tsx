import { BrowserRouter } from 'react-router-dom';

import { AppRoutes } from './app/AppRoutes';
import { AuthBootstrap } from './app/AuthBootstrap';
import { ThemeProvider } from './theme';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthBootstrap>
          <AppRoutes />
        </AuthBootstrap>
      </BrowserRouter>
    </ThemeProvider>
  );
}
