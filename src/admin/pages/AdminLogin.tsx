import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { useAuth } from '../AuthContext'
import { auth } from '../../firebase'
import logoUrl from '../../assets/G-logo.png'
import { Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const { login, error } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [resetSending, setResetSending] = useState(false)
  const [resetNotice, setResetNotice] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try { await login(email, password) } catch { /* shown via context */ }
    finally { setLoading(false) }
  }

  const handlePasswordReset = async () => {
    const normalizedEmail = email.trim()
    setResetNotice(null)
    setResetError(null)
    if (!normalizedEmail) {
      setResetError('Masukkan email akun admin terlebih dahulu.')
      document.getElementById('email')?.focus()
      return
    }

    setResetSending(true)
    try {
      await sendPasswordResetEmail(auth, normalizedEmail)
      setResetNotice('Jika email tersebut terdaftar, tautan untuk mengatur ulang kata sandi akan dikirim. Periksa juga folder spam.')
    } catch (resetRequestError) {
      console.error('Permintaan reset kata sandi gagal:', resetRequestError)
      setResetError('Email reset belum dapat dikirim. Periksa alamat email dan pengaturan Firebase Authentication.')
    } finally {
      setResetSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {/* Brand */}
          <div className="text-center mb-8">
            <img src={logoUrl} alt="Genza" className="w-14 h-14 rounded-xl mx-auto mb-3 object-cover" />
            <h1 className="text-lg font-bold text-slate-800">Genza Education</h1>
            <p className="text-sm text-slate-500 mt-0.5">Masuk ke Panel Admin</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                placeholder="admin@genza.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  placeholder="Kata sandi"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPw ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="-mt-1 flex justify-end">
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={resetSending || loading}
                className="min-h-11 rounded-md px-2 text-sm font-medium text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resetSending ? 'Mengirim tautan...' : 'Lupa kata sandi?'}
              </button>
            </div>

            {resetNotice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">{resetNotice}</p>}
            {resetError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">{resetError}</p>}

            {error && (
              <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          <a href="/" className="hover:text-blue-600 transition-colors">Kembali ke Landing Page</a>
        </p>
      </div>
    </div>
  )
}
