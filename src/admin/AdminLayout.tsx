import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { navigate, useLocation } from './AdminRouter'
import logoUrl from '../assets/G-logo.png'
import {
  Users,
  BookOpen,
  GraduationCap,
  Zap,
  UserRound,
  Image,
  PanelsTopLeft,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  UserCog,
  ClipboardList,
  KeyRound,
  CalendarDays,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { hasPermission } from './rbac'
import { TooltipProvider } from '../components/ui/tooltip'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../components/ui/sidebar'

const NAV_GROUPS = [
  {
    label: 'Operasional',
    items: [
      { label: 'Dashboard', to: '/admin/dashboard', icon: CalendarDays, permission: 'registrations.view' },
      { label: 'Agenda', to: '/admin/agenda', icon: CalendarDays, permission: 'agenda.view' },
      { label: 'Pendaftar', to: '/admin/pendaftar', icon: Users, permission: 'registrations.view' },
      { label: 'Absensi Tutor', to: '/admin/absensi-tutor', icon: ClipboardList, permission: 'tutor_attendance.view' },
    ],
  },
  {
    label: 'Master Data',
    items: [
      { label: 'Program', to: '/admin/program', icon: BookOpen, permission: 'content.view' },
      { label: 'Jenjang', to: '/admin/jenjang', icon: GraduationCap, permission: 'content.view' },
      { label: 'Fasilitas', to: '/admin/fasilitas', icon: Zap, permission: 'content.view' },
      { label: 'Tutor', to: '/admin/tutor', icon: UserRound, permission: 'content.view' },
      { label: 'Foto', to: '/admin/foto', icon: Image, permission: 'content.view' },
      { label: 'Banner Slider', to: '/admin/banner', icon: PanelsTopLeft, permission: 'content.view' },
      { label: 'Testimoni', to: '/admin/testimoni', icon: MessageSquare, permission: 'content.view' },
    ],
  },
  {
    label: 'Pengaturan & Akses',
    items: [
      { label: 'Pengaturan Aplikasi', to: '/admin/pengaturan', icon: Settings, permission: 'settings.edit' },
      { label: 'Akun Tutor', to: '/admin/akun-tutor', icon: KeyRound, permission: 'users.manage' },
      { label: 'Pengguna & Role', to: '/admin/pengguna', icon: UserCog, permission: 'users.manage' },
    ],
  },
]

const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items)

function pageTitle(path: string) {
  const detailRoute = path.startsWith('/admin/pendaftar/')
  if (detailRoute) return 'Detail Pendaftar'
  return NAV_ITEMS.find((item) => item.to === path)?.label ?? 'Pendaftar'
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { logout, role } = useAuth()
  const path = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <TooltipProvider>
    <SidebarProvider defaultOpen>
      <Sidebar
        collapsible="offcanvas"
        className="bg-white"
      >
        <SidebarHeader className="border-b border-slate-200 px-4 py-4">
          <a href="/" className="flex items-center gap-3 rounded-md focus-visible:outline-none">
            <img src={logoUrl} alt="Genza Education" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-slate-900">Genza Education</span>
              <span className="block text-xs text-slate-500">Admin Panel</span>
            </span>
          </a>
        </SidebarHeader>

        <SidebarContent className="bg-white px-2 py-3">
          {NAV_GROUPS.map((group) => {
            const items = group.items.filter((item) => hasPermission(role, item.permission))
            if (items.length === 0) return null
            return (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarMenu>
                  {items.map((item) => {
                    const Icon = item.icon
                    const active = path === item.to || (item.to === '/admin/pendaftar' && path.startsWith('/admin/pendaftar/')) || path.startsWith(`${item.to}/`)

                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton
                          render={<a href={`#${item.to}`} />}
                          isActive={active}
                          className={`h-10 text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${active ? 'bg-blue-50 font-semibold text-blue-700 ring-1 ring-blue-100' : ''}`}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroup>
            )
          })}
        </SidebarContent>

        <SidebarFooter className="gap-1 border-t border-slate-200 p-3">
          <a
            href="/"
            className="flex min-h-10 items-center gap-2 rounded-md px-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span>Lihat Landing Page</span>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Keluar</span>
          </button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0 bg-slate-50">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4">
          <SidebarTrigger aria-label="Buka atau tutup sidebar" />
          <div className="h-5 w-px bg-slate-200" />
          <h1 className="text-sm font-semibold text-slate-800">{pageTitle(path)}</h1>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-slate-600 md:hidden"
            onClick={handleLogout}
          >
            <LogOut aria-hidden="true" />
            Keluar
          </Button>
        </header>
        <div className="min-w-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  )
}
