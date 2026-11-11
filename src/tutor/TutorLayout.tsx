import type { ReactNode } from 'react'
import { ClipboardList, ExternalLink, History, LogOut } from 'lucide-react'
import { useTutorAuth } from './TutorAuthContext'
import { navigate, useLocation } from '../admin/AdminRouter'
import logoUrl from '../assets/G-logo.png'
import { Button } from '../components/ui/button'
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

const LINKS = [
  { label: 'Catat sesi mengajar', path: '/tutor/absensi', icon: ClipboardList },
  { label: 'Riwayat absensi', path: '/tutor/riwayat', icon: History },
]

function pageTitle(path: string) {
  return LINKS.find((item) => item.path === path)?.label ?? 'Catat sesi mengajar'
}

export default function TutorLayout({ children }: { children: ReactNode }) {
  const { profile, logout } = useTutorAuth()
  const path = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/tutor/login')
  }

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="offcanvas" className="bg-white">
          <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
            <a href="#/tutor/absensi" className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <img src={logoUrl} alt="Genza Education" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-sidebar-foreground">Portal Tutor</span>
                <span className="block truncate text-xs text-muted-foreground">{profile?.nama}</span>
              </span>
            </a>
          </SidebarHeader>

          <SidebarContent className="bg-white px-2 py-3">
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase tracking-wide">Menu Tutor</SidebarGroupLabel>
              <SidebarMenu>
                {LINKS.map(({ label, path: target, icon: Icon }) => (
                  <SidebarMenuItem key={target}>
                    <SidebarMenuButton
                      render={<a href={`#${target}`} />}
                      isActive={path === target}
                      className="h-10 data-[active=true]:font-semibold"
                    >
                      <Icon aria-hidden="true" />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="gap-1 border-t border-sidebar-border p-3">
            <a href="/" className="flex min-h-10 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
              <span>Lihat Landing Page</span>
            </a>
            <Button type="button" variant="ghost" onClick={() => void handleLogout()} className="h-10 w-full justify-start px-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <LogOut aria-hidden="true" />
              Keluar
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="min-w-0 bg-muted/30">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background px-4">
            <SidebarTrigger aria-label="Buka atau tutup sidebar" />
            <div className="h-5 w-px bg-border" />
            <h1 className="text-sm font-semibold text-foreground">{pageTitle(path)}</h1>
            <Button type="button" variant="ghost" size="sm" className="ml-auto md:hidden" onClick={() => void handleLogout()}>
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
