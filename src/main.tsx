import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { applyThemeToDocument } from './theme/applyTheme';
import { themes } from './theme/theme';
import './styles.css';

applyThemeToDocument(themes.light);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
