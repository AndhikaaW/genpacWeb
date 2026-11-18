import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './admin/AuthContext'
import AdminApp from './admin/AdminApp'
import RegistrationFormPage from './admin/pages/RegistrationFormPage'
import { TutorAuthProvider } from './tutor/TutorAuthContext'
import TutorApp from './tutor/TutorApp'
import App from './App.tsx'
import AnnouncementPage from './components/AnnouncementPage'
import './index.css'

// Path-based routing: /admin/... → Admin panel, /tutor/... → Tutor, /daftar → Form, /info → Pengumuman, / → Landing
function Root() {
  const [path, setPath] = React.useState(window.location.pathname)
  React.useEffect(() => {
    const handler = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  if (path.startsWith('/admin')) {
    return (
      <AuthProvider>
        <AdminApp />
      </AuthProvider>
    )
  }

  if (path.startsWith('/tutor')) {
    return (
      <TutorAuthProvider>
        <TutorApp />
      </TutorAuthProvider>
    )
  }

  if (path === '/daftar') {
    return <RegistrationFormPage />
  }

  if (path === '/info') {
    return <AnnouncementPage />
  }

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
