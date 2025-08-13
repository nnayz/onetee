import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import logoPngUrl from './assets/logo_png.png'

function setFavicon(iconUrl: string) {
  const existingLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']")
  if (existingLink) {
    existingLink.href = iconUrl
    existingLink.type = 'image/png'
  } else {
    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/png'
    link.href = iconUrl
    document.head.appendChild(link)
  }
}

setFavicon(logoPngUrl)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
