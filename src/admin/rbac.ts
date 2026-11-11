export const ADMIN_ROLES = ['superadmin', 'operator', 'editor', 'viewer'] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]

export const ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: 'Superadmin',
  operator: 'Admin Operasional',
  editor: 'Editor Konten',
  viewer: 'Viewer',
}

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  superadmin: 'Akses penuh, termasuk pengelolaan pengguna dan role.',
  operator: 'Mengelola pendaftar dan melihat catatan absensi tutor.',
  editor: 'Melihat dan mengelola konten landing page.',
  viewer: 'Hanya dapat melihat data admin.',
}

const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  superadmin: ['registrations.view', 'registrations.edit', 'content.view', 'content.edit', 'settings.edit', 'users.manage', 'tutor_attendance.view', 'agenda.view'],
  operator: ['registrations.view', 'registrations.edit', 'tutor_attendance.view', 'agenda.view'],
  editor: ['content.view', 'content.edit', 'settings.edit'],
  viewer: ['registrations.view', 'content.view'],
}

export function isAdminRole(role: unknown): role is AdminRole {
  return typeof role === 'string' && ADMIN_ROLES.includes(role as AdminRole)
}

export function hasPermission(role: AdminRole | null, permission: string) {
  return role !== null && ROLE_PERMISSIONS[role].includes(permission)
}

export function permissionForPath(path: string) {
  if (path === '/admin/pengguna') return 'users.manage'
  if (path === '/admin/akun-tutor') return 'users.manage'
  if (path === '/admin/absensi-tutor') return 'tutor_attendance.view'
  if (path === '/admin/agenda') return 'agenda.view'
  if (path === '/admin/pengaturan') return 'settings.edit'
  if (path === '/admin/dashboard' || path === '/admin/pendaftar' || path.startsWith('/admin/pendaftar/')) return 'registrations.view'
  if (['/admin/program', '/admin/jenjang', '/admin/fasilitas', '/admin/tutor', '/admin/foto', '/admin/banner', '/admin/testimoni'].includes(path)) return 'content.view'
  return 'registrations.view'
}
