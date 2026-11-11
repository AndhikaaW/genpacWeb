import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './admin/AuthContext'
import AdminApp from './admin/AdminApp'
import RegistrationFormPage from './admin/pages/RegistrationFormPage'
import { TutorAuthProvider } from './tutor/TutorAuthContext'
import TutorApp from './tutor/TutorApp'
import App from './App.tsx'
import './index.css'

// Hash-based routing: #/admin/... → Admin panel, #/daftar → Form, else → Landing
function Root() {
  const [path, setPath] = React.useState(window.location.hash)
  React.useEffect(() => {
    const handler = () => setPath(window.location.hash)
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  if (path.startsWith('#/admin')) {
    return (
      <AuthProvider>
        <AdminApp />
      </AuthProvider>
    )
  }

  if (path.startsWith('#/tutor')) {
    return (
      <TutorAuthProvider>
        <TutorApp />
      </TutorAuthProvider>
    )
  }

  if (path === '#/daftar') {
    return <RegistrationFormPage />
  }

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
