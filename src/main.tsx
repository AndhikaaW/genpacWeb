import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './admin/AuthContext'
import AdminApp from './admin/AdminApp'
import RegistrationFormPage from './admin/pages/RegistrationFormPage'
import { TutorAuthProvider } from './tutor/TutorAuthContext'
import TutorApp from './tutor/TutorApp'
import App from './App.tsx'
import AnnouncementPage from './components/AnnouncementPage'
import GTryOutPage from './components/GTryOutPage'
import TryOutResultsPage from './components/TryOutResultsPage'
import { AppSettingsProvider } from './hooks/AppSettingsContext'
import './index.css'

function usePathSegment() {
  const [path, setPath] = React.useState(window.location.pathname)
  React.useEffect(() => {
    const handler = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])
  if (path.startsWith('/admin')) return 'admin' as const
  if (path.startsWith('/tutor')) return 'tutor' as const
  if (path === '/daftar') return 'daftar' as const
  if (path === '/info') return 'info' as const
  if (path === '/try-out') return 'try-out' as const
  if (path === '/hasil-try-out') return 'hasil-try-out' as const
  return 'landing' as const
}

// Masing-masing zona punya provider sendiri yang hanya mount saat dibutuhkan.
// Tapi sekali mount (masuk /admin), provider tidak di-destroy saat navigasi
// antar sub-path /admin/x → /admin/y karena segmen 'admin' tidak berubah.
function AdminZone() {
  return (
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  )
}

function TutorZone() {
  return (
    <TutorAuthProvider>
      <TutorApp />
    </TutorAuthProvider>
  )
}

function Root() {
  const segment = usePathSegment()

  if (segment === 'admin') return <AdminZone />
  if (segment === 'tutor') return <TutorZone />
  if (segment === 'daftar') return <AppSettingsProvider><RegistrationFormPage /></AppSettingsProvider>
  if (segment === 'info') return <AnnouncementPage />
  if (segment === 'try-out') return <GTryOutPage />
  if (segment === 'hasil-try-out') return <TryOutResultsPage />
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
