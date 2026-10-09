import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import 'lenis/dist/lenis.css';
import './styles.css';
import App from './App';

document.documentElement.classList.add('has-js');
const root = document.getElementById('root')!;
const app = <StrictMode><App /></StrictMode>;
if (root.querySelector('main')) hydrateRoot(root, app);
else createRoot(root).render(app);
