import { useAuth } from './AuthContext'
import { useLocation, navigate } from './AdminRouter'
import { useEffect } from 'react'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import DashboardPage from './pages/DashboardPage'
import RegistrationDetail from './pages/RegistrationDetail'
import MasterFoto from './pages/MasterFoto'
import MasterBanner from './pages/MasterBanner'
import MasterTutor from './pages/MasterTutor'
import MasterJenjang from './pages/MasterJenjang'
import MasterFasilitas from './pages/MasterFasilitas'
import MasterTestimoni from './pages/MasterTestimoni'
import MasterProgram from './pages/MasterProgram'
import AppSettingsPage from './pages/AppSettingsPage'
import UserManagementPage from './pages/UserManagementPage'
import TutorAttendanceAdminPage from './pages/TutorAttendanceAdminPage'
import TutorAccountsPage from './pages/TutorAccountsPage'
import AgendaPage from './pages/AgendaPage'
import AdminLayout from './AdminLayout'
import logoUrl from '../assets/G-logo.png'
import { hasPermission, permissionForPath } from './rbac'

export default function AdminApp() {
  const { user, role, isAdmin, loading } = useAuth()
  const path = useLocation()

  useEffect(() => {
    if (loading) return
    if (!user || !isAdmin) {
      if (path !== '/admin/login') navigate('/admin/login')
    } else {
      if (path === '/admin/login' || path === '/admin') navigate('/admin/dashboard')
    }
  }, [user, isAdmin, loading, path])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
      </div>
    )
  }

  if (!user || !isAdmin) return <AdminLogin />

  const requiredPermission = permissionForPath(path)
  if (!hasPermission(role, requiredPermission)) {
    const fallback = hasPermission(role, 'registrations.view') ? '/admin/dashboard' : '/admin/program'
    if (path !== fallback) navigate(fallback)
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center text-slate-600">Anda tidak memiliki izin untuk membuka halaman ini.</div>
  }

  // Route matching
  const detailMatch = path.match(/^\/admin\/pendaftar\/([^/]+)$/)

  const page = (() => {
    if (detailMatch) return <RegistrationDetail id={detailMatch[1]} />
    if (path === '/admin/dashboard') return <DashboardPage />
    if (path === '/admin/pendaftar') return <AdminDashboard />
    if (path === '/admin/foto') return <MasterFoto />
    if (path === '/admin/banner') return <MasterBanner />
    if (path === '/admin/pengaturan') return <AppSettingsPage />
    if (path === '/admin/pengguna') return <UserManagementPage />
    if (path === '/admin/absensi-tutor') return <TutorAttendanceAdminPage />
    if (path === '/admin/agenda') return <AgendaPage />
    if (path === '/admin/akun-tutor') return <TutorAccountsPage />
    if (path === '/admin/tutor') return <MasterTutor />
    if (path === '/admin/jenjang') return <MasterJenjang />
    if (path === '/admin/fasilitas') return <MasterFasilitas />
    if (path === '/admin/testimoni') return <MasterTestimoni />
    if (path === '/admin/program') return <MasterProgram />
    return <AdminDashboard />
  })()

  return <AdminLayout>{page}</AdminLayout>
}
