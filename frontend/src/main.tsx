import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import AuthProvider from './modules/auth/context/authProvider.tsx'
import { ThemeProvider } from './context/theme/themeProvider.tsx'
import { BrowserRouter } from 'react-router'
import { registerAxiosInterceptors } from '@/lib/axios.interceptor.ts'
import { queryClient } from '@/lib/query-client.ts'

registerAxiosInterceptors()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="mintur-theme">
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster position="bottom-right" richColors closeButton />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
