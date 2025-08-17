import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import logoPngUrl from './assets/logo_png.png'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

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

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
