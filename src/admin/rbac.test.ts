import { describe, expect, it } from 'vitest'
import { hasPermission, isAdminRole, permissionForPath } from './rbac'

describe('admin role permissions', () => {
  it('accepts only configured roles', () => {
    expect(isAdminRole('superadmin')).toBe(true)
    expect(isAdminRole('viewer')).toBe(true)
    expect(isAdminRole('owner')).toBe(false)
    expect(isAdminRole(null)).toBe(false)
  })

  it('keeps role capabilities separated', () => {
    expect(hasPermission('operator', 'registrations.edit')).toBe(true)
    expect(hasPermission('operator', 'registrations.view')).toBe(true)
    expect(hasPermission('editor', 'content.edit')).toBe(true)
    expect(hasPermission('editor', 'registrations.view')).toBe(false)
    expect(hasPermission('viewer', 'content.view')).toBe(true)
    expect(hasPermission('viewer', 'content.edit')).toBe(false)
    expect(hasPermission('viewer', 'registrations.edit')).toBe(false)
    expect(hasPermission('superadmin', 'users.manage')).toBe(true)
    expect(hasPermission('operator', 'tutor_attendance.view')).toBe(true)
    expect(hasPermission('editor', 'tutor_attendance.view')).toBe(false)
  })

  it('maps direct routes to their required permission', () => {
    expect(permissionForPath('/admin/pengguna')).toBe('users.manage')
    expect(permissionForPath('/admin/pendaftar/abc')).toBe('registrations.view')
    expect(permissionForPath('/admin/banner')).toBe('content.view')
    expect(permissionForPath('/admin/pengaturan')).toBe('settings.edit')
    expect(permissionForPath('/admin/absensi-tutor')).toBe('tutor_attendance.view')
    expect(permissionForPath('/admin/akun-tutor')).toBe('users.manage')
  })
})
