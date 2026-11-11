import { useEffect } from 'react'
import { useLocation, navigate } from '../admin/AdminRouter'
import { useTutorAuth } from './TutorAuthContext'
import TutorLogin from './pages/TutorLogin'
import TutorLayout from './TutorLayout'
import TutorAttendancePage from './pages/TutorAttendancePage'

export default function TutorApp() {
  const { user, profile, loading } = useTutorAuth()
  const path = useLocation()

  useEffect(() => {
    if (loading) return
    if (!user || !profile) {
      if (path !== '/tutor/login') navigate('/tutor/login')
    } else if (path === '/tutor/login' || path === '/tutor') {
      navigate('/tutor/absensi')
    }
  }, [user, profile, loading, path])

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" aria-label="Memuat akun tutor" /></div>
  if (!user || !profile) return <TutorLogin />

  const page = path === '/tutor/riwayat'
    ? <TutorAttendancePage view="history" />
    : <TutorAttendancePage view="entry" />

  return <TutorLayout>{page}</TutorLayout>
}
