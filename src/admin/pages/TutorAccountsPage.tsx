import { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, deleteUser, getAuth, inMemoryPersistence, setPersistence, signOut } from 'firebase/auth'
import { collection, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { deleteApp, initializeApp } from 'firebase/app'
import { db, firebaseConfig } from '../../firebase'
import { Skeleton } from '../../components/ui/skeleton'
import { useAuth } from '../AuthContext'
import AdminFormDialog from '../components/AdminFormDialog'

interface TutorAccount { uid: string; nama: string; email: string; aktif: boolean }

export default function TutorAccountsPage() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<TutorAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nama: '', email: '', password: '' })

  useEffect(() => onSnapshot(collection(db, 'tutor_accounts'), (snapshot) => {
    const nextAccounts = snapshot.docs.flatMap((entry) => {
      const data = entry.data()
      if (data.role !== 'tutor') return []
      return [{ uid: entry.id, nama: data.nama ?? '', email: data.email ?? '', aktif: data.aktif === true }]
    })
    nextAccounts.sort((a, b) => a.nama.localeCompare(b.nama))
    setAccounts(nextAccounts)
    setLoading(false)
    setError(null)
  }, (loadError) => {
    console.error('Gagal memuat akun tutor:', loadError)
    setError('Akun tutor gagal dimuat. Periksa Firestore Rules.')
    setLoading(false)
  }), [])

  const createTutor = async () => {
    const nama = form.nama.trim()
    const email = form.email.trim().toLowerCase()
    if (!nama) throw new Error('Nama tutor wajib diisi.')
    if (form.password.length < 8) throw new Error('Kata sandi sementara minimal 8 karakter.')

    const secondaryApp = initializeApp(firebaseConfig, `tutor-provision-${Date.now()}`)
    const secondaryAuth = getAuth(secondaryApp)
    let uid: string | null = null
    let profileCreated = false
    try {
      await setPersistence(secondaryAuth, inMemoryPersistence)
      const credential = await createUserWithEmailAndPassword(secondaryAuth, email, form.password)
      uid = credential.user.uid
      await setDoc(doc(db, 'tutor_accounts', uid), {
        uid,
        nama,
        email,
        role: 'tutor',
        aktif: true,
        created_at: serverTimestamp(),
        created_by: user?.uid ?? null,
      })
      profileCreated = true
      await signOut(secondaryAuth)
      setForm({ nama: '', email: '', password: '' })
    } catch (createError) {
      if (uid && secondaryAuth.currentUser) {
        try { await deleteUser(secondaryAuth.currentUser) } catch (cleanupError) { console.error('Cleanup akun tutor gagal:', cleanupError) }
      }
      if (profileCreated && uid) {
        try { await updateDoc(doc(db, 'tutor_accounts', uid), { aktif: false, updated_at: serverTimestamp() }) } catch (cleanupError) { console.error('Cleanup profil tutor gagal:', cleanupError) }
      }
      throw createError
    } finally {
      await deleteApp(secondaryApp)
    }
  }

  const toggleActive = async (account: TutorAccount) => {
    setError(null)
    try {
      await updateDoc(doc(db, 'tutor_accounts', account.uid), { aktif: !account.aktif, updated_at: serverTimestamp() })
    } catch (updateError) {
      console.error('Gagal memperbarui status tutor:', updateError)
      setError('Status akun tutor tidak dapat diperbarui.')
    }
  }

  return (
    <main className="mx-auto max-w-screen-xl p-4 md:p-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">Akun Tutor</h2><p className="mt-1 text-sm text-slate-600">Buat login portal tutor dan kelola status aksesnya.</p></div><button type="button" onClick={() => setShowForm(true)} className="min-h-11 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">Tambah Akun Tutor</button></header>
      {error && <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {loading ? <div aria-busy="true" className="space-y-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)}<span className="sr-only">Memuat akun tutor...</span></div> : accounts.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">Belum ada akun tutor. Buat akun untuk memberikan akses ke portal absensi.</p> : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600"><tr><th className="px-4 py-3">Tutor</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{accounts.map((account) => <tr key={account.uid}><td className="px-4 py-3"><p className="font-medium text-slate-900">{account.nama}</p><p className="mt-0.5 text-slate-600">{account.email}</p></td><td className="px-4 py-3"><span className={`inline-flex min-h-7 items-center rounded-md px-2 text-xs font-semibold ${account.aktif ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{account.aktif ? 'Aktif' : 'Nonaktif'}</span></td><td className="px-4 py-3 text-right"><button type="button" onClick={() => void toggleActive(account)} className="min-h-10 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">{account.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button></td></tr>)}</tbody></table></div></div>
      )}
      <AdminFormDialog open={showForm} onOpenChange={setShowForm} title="Tambah akun tutor" description="Akun menggunakan email dan kata sandi sementara. Tutor dapat memakai fitur lupa kata sandi di halaman masuk." submitLabel="Buat akun tutor" onSubmit={createTutor}>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Nama tutor<input required autoComplete="name" value={form.nama} onChange={(event) => setForm((current) => ({ ...current, nama: event.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700" /></label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Email tutor<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700" /></label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Kata sandi sementara<input required type="password" minLength={8} autoComplete="new-password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700" /><span className="block text-xs font-normal text-slate-600">Berikan kata sandi melalui kanal aman. Tutor dapat meresetnya dari halaman login.</span></label>
      </AdminFormDialog>
    </main>
  )
}
