import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import AuthProvider from './modules/auth/context/authProvider.tsx'
import { ThemeProvider } from './context/theme/themeProvider.tsx'
import { BrowserRouter } from 'react-router'
import { registerAxiosInterceptors } from '@/lib/axios.interceptor.ts'

registerAxiosInterceptors()

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
