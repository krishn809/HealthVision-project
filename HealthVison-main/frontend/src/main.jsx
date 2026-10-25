import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Polyfills for simple-peer in Vite
import { Buffer } from 'buffer';
window.global = window;
window.process = { env: { NODE_DEBUG: false } };
window.Buffer = Buffer;

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
