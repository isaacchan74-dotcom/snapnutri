import { BrowserRouter } from 'react-router-dom';

import { AppRoutes } from './app/AppRoutes';
import { AuthBootstrap } from './app/AuthBootstrap';

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <AppRoutes />
      </AuthBootstrap>
    </BrowserRouter>
  );
}
