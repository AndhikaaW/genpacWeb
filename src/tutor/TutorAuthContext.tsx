import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

export interface TutorProfile {
  uid: string
  nama: string
  email: string
}

interface TutorAuthValue {
  user: User | null
  profile: TutorProfile | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const TutorAuthContext = createContext<TutorAuthValue | null>(null)

async function loadTutorProfile(uid: string): Promise<TutorProfile | null> {
  const snapshot = await getDoc(doc(db, 'tutor_accounts', uid))
  if (!snapshot.exists()) return null
  const data = snapshot.data()
  if (data.role !== 'tutor' || data.aktif !== true) return null
  return {
    uid,
    nama: typeof data.nama === 'string' ? data.nama : '',
    email: typeof data.email === 'string' ? data.email : '',
  }
}

export function TutorAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<TutorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => onAuthStateChanged(auth, async (nextUser) => {
    setUser(nextUser)
    setProfile(null)
    try {
      if (nextUser) {
        const nextProfile = await loadTutorProfile(nextUser.uid)
        if (nextProfile) setProfile(nextProfile)
        else await signOut(auth)
      }
    } catch (profileError) {
      console.error('Gagal memuat profil tutor:', profileError)
      setError('Profil tutor tidak dapat dimuat. Periksa koneksi dan Firestore Rules.')
    } finally {
      setLoading(false)
    }
  }), [])

  const login = async (email: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
      const nextProfile = await loadTutorProfile(credential.user.uid)
      if (!nextProfile) {
        await signOut(auth)
        throw new Error('Akun ini belum terdaftar sebagai tutor aktif. Hubungi admin.')
      }
      setUser(credential.user)
      setProfile(nextProfile)
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : 'Gagal masuk.'
      setError(message.includes('auth/') ? 'Email atau kata sandi salah.' : message)
      throw loginError
    } finally {
      setLoading(false)
    }
  }

  return <TutorAuthContext.Provider value={{ user, profile, loading, error, login, logout: () => signOut(auth) }}>{children}</TutorAuthContext.Provider>
}

export function useTutorAuth() {
  const context = useContext(TutorAuthContext)
  if (!context) throw new Error('useTutorAuth must be inside TutorAuthProvider')
  return context
}
