import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuthProvider from './context/auth/authProvider.tsx'
import { ThemeProvider } from './context/theme/themeProvider.tsx'
import { BrowserRouter } from 'react-router'
import { AxiosInterceptor } from './interceptors'
import { Toaster } from 'sonner'

AxiosInterceptor()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="mintur-theme">
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
