import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n/index.js'
import './index.css'
import App from './App.jsx'

const savedLocale = localStorage.getItem('locale') || 'he'
document.documentElement.lang = savedLocale
document.documentElement.dir = savedLocale === 'he' ? 'rtl' : 'ltr'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
