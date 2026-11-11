import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../firebase'
import { useTutorAuth } from '../TutorAuthContext'
import logoUrl from '../../assets/G-logo.png'

export default function TutorLogin() {
  const { login, error } = useTutorAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try { await login(email, password) } catch { /* feedback is provided by auth context */ }
    finally { setLoading(false) }
  }

  const resetPassword = async () => {
    setResetMessage(null)
    setResetError(null)
    if (!email.trim()) {
      setResetError('Masukkan email akun tutor terlebih dahulu.')
      document.getElementById('tutor-email')?.focus()
      return
    }
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setResetMessage('Jika email terdaftar, tautan reset akan dikirim. Periksa juga folder spam.')
    } catch (resetRequestError) {
      console.error('Permintaan reset kata sandi tutor gagal:', resetRequestError)
      setResetError('Email reset belum dapat dikirim. Periksa alamat email dan pengaturan Firebase Authentication.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <header className="mb-8 text-center">
          <img src={logoUrl} alt="Genza Education" width={56} height={56} className="mx-auto mb-4 h-14 w-14 rounded-xl object-cover" />
          <h1 className="text-2xl font-bold text-slate-900">Portal Tutor</h1>
          <p className="mt-1 text-sm text-slate-600">Masuk untuk mencatat sesi mengajar.</p>
        </header>
        <form onSubmit={submit} className="space-y-4">
          <label htmlFor="tutor-email" className="block space-y-1.5 text-sm font-medium text-slate-800">Email
            <input id="tutor-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="min-h-11 w-full rounded-md border border-slate-300 px-3 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700" />
          </label>
          <label htmlFor="tutor-password" className="block space-y-1.5 text-sm font-medium text-slate-800">Kata sandi
            <input id="tutor-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-11 w-full rounded-md border border-slate-300 px-3 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700" />
          </label>
          <div className="flex justify-end">
            <button type="button" disabled={loading} onClick={() => void resetPassword()} className="min-h-11 rounded-md px-2 text-sm font-medium text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Lupa kata sandi?</button>
          </div>
          {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          {resetError && <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{resetError}</p>}
          {resetMessage && <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{resetMessage}</p>}
          <button type="submit" disabled={loading} className="min-h-11 w-full rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Memproses...' : 'Masuk sebagai tutor'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600"><a className="min-h-11 inline-flex items-center px-2 text-blue-700 underline-offset-4 hover:underline" href="#/admin/login">Masuk sebagai admin</a></p>
      </div>
    </main>
  )
}
