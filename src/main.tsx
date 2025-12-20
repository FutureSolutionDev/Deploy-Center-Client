/**
 * Application Entry Point
 * Initializes React app with all providers
 */

import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n/i18n';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(<App />);
