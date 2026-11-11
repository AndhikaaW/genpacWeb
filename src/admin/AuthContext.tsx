import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { isAdminRole, type AdminRole } from './rbac'

interface AuthCtx {
  user: User | null
  role: AdminRole | null
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
  refreshProfile: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export async function getAdminProfile(uid: string) {
  const snapshot = await getDoc(doc(db, 'admins', uid))
  if (!snapshot.exists()) return null
  const data = snapshot.data()
  if (data.aktif !== true || !isAdminRole(data.role)) return null
  return { role: data.role, nama: typeof data.nama === 'string' ? data.nama : '', email: typeof data.email === 'string' ? data.email : '' }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<AdminRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const authEventId = useRef(0)

  const refreshProfile = async () => {
    if (!auth.currentUser) {
      setRole(null)
      return
    }
    const profile = await getAdminProfile(auth.currentUser.uid)
    setRole(profile?.role ?? null)
  }

  useEffect(() => onAuthStateChanged(auth, async (nextUser) => {
    const eventId = ++authEventId.current
    setLoading(true)
    setUser(nextUser)
    setRole(null)
    if (!nextUser) setError(null)
    try {
      if (nextUser) {
        const profile = await getAdminProfile(nextUser.uid)
        if (eventId !== authEventId.current) return
        if (profile) {
          setRole(profile.role)
          setError(null)
        }
        else await signOut(auth)
      }
    } catch (profileError) {
      console.error('Gagal memuat profil admin:', profileError)
      if (eventId === authEventId.current) setError('Tidak dapat memeriksa profil admin. Periksa koneksi dan izin baca Firestore.')
    } finally {
      if (eventId === authEventId.current) setLoading(false)
    }
  }), [])

  const login = async (email: string, password: string) => {
    setError(null)
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
      const profile = await getAdminProfile(credential.user.uid)
      if (!profile) {
        await signOut(auth)
        throw new Error('Akun belum memiliki role aktif. Hubungi superadmin.')
      }
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : 'Gagal masuk'
      setError(message.includes('auth/') ? 'Email atau kata sandi salah' : message)
      throw loginError
    }
  }

  return <Ctx.Provider value={{ user, role, isAdmin: role !== null, loading, login, logout: () => signOut(auth), error, refreshProfile }}>{children}</Ctx.Provider>
}

export function useAuth() {
  const context = useContext(Ctx)
  if (!context) throw new Error('useAuth must be inside AuthProvider')
  return context
}
