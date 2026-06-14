import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"  // 👈 ADD THIS
import './index.css'
import './ui/layout.css'
import './ui/editorial-home.css'
import './ui/candice-clone.css'
import './ui/reference-home.css'
import './ui/press-kit.css'
import App from './App.tsx'

const routerBasename = (() => {
  const b = import.meta.env.BASE_URL;
  if (!b || b === "/") return undefined;
  return b.endsWith("/") ? b.slice(0, -1) : b;
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={routerBasename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)