import { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, deleteUser, getAuth, signOut } from 'firebase/auth'
import { collection, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { deleteApp, initializeApp } from 'firebase/app'
import { db, firebaseConfig } from '../../firebase'
import { useAuth } from '../AuthContext'
import { ADMIN_ROLES, ROLE_DESCRIPTIONS, ROLE_LABELS, type AdminRole } from '../rbac'
import AdminFormDialog from '../components/AdminFormDialog'
import { Skeleton } from '../../components/ui/skeleton'

interface ManagedAdmin { uid: string; nama: string; email: string; role: AdminRole; aktif: boolean }

export default function UserManagementPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<ManagedAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ nama: '', email: '', password: '', role: 'viewer' as AdminRole })

  useEffect(() => onSnapshot(collection(db, 'admins'), (snapshot) => {
    const records = snapshot.docs.flatMap((entry) => {
      const data = entry.data()
      if (!ADMIN_ROLES.includes(data.role)) return []
      return [{ uid: entry.id, nama: data.nama ?? '', email: data.email ?? '', role: data.role as AdminRole, aktif: data.aktif !== false }]
    })
    setUsers(records.sort((a, b) => a.nama.localeCompare(b.nama)))
    setLoading(false)
    setError(null)
  }, (loadError) => {
    console.error('Gagal memuat pengguna admin:', loadError)
    setError('Daftar pengguna gagal dimuat. Periksa koneksi dan Firestore Rules.')
    setLoading(false)
  }), [])

  const createUser = async () => {
    const name = form.nama.trim()
    const email = form.email.trim().toLowerCase()
    if (!name) throw new Error('Nama wajib diisi.')
    if (form.password.length < 8) throw new Error('Kata sandi awal minimal 8 karakter.')

    const secondaryApp = initializeApp(firebaseConfig, `admin-provision-${Date.now()}`)
    const secondaryAuth = getAuth(secondaryApp)
    let uid: string | null = null
    try {
      const credential = await createUserWithEmailAndPassword(secondaryAuth, email, form.password)
      uid = credential.user.uid
      await setDoc(doc(db, 'admins', uid), {
        uid,
        nama: name,
        email,
        role: form.role,
        aktif: true,
        created_at: serverTimestamp(),
        created_by: user?.uid ?? null,
      })
      await signOut(secondaryAuth)
      setForm({ nama: '', email: '', password: '', role: 'viewer' })
    } catch (createError) {
      if (uid && secondaryAuth.currentUser) {
        try { await deleteUser(secondaryAuth.currentUser) } catch (cleanupError) { console.error('Pembersihan akun Auth gagal:', cleanupError) }
      }
      throw createError
    } finally {
      await deleteApp(secondaryApp)
    }
  }

  const changeRole = async (target: ManagedAdmin, nextRole: AdminRole) => {
    setError(null)
    try {
      await updateDoc(doc(db, 'admins', target.uid), { role: nextRole, updated_at: serverTimestamp() })
    } catch (updateError) {
      console.error('Gagal mengubah role:', updateError)
      setError('Role tidak dapat diperbarui. Pastikan Firestore Rules sudah mendukung RBAC.')
    }
  }

  const toggleActive = async (target: ManagedAdmin) => {
    if (target.uid === user?.uid) {
      setError('Anda tidak dapat menonaktifkan akun yang sedang digunakan.')
      return
    }
    setError(null)
    try {
      await updateDoc(doc(db, 'admins', target.uid), { aktif: !target.aktif, updated_at: serverTimestamp() })
    } catch (updateError) {
      console.error('Gagal mengubah status pengguna:', updateError)
      setError('Status pengguna tidak dapat diperbarui. Periksa Firestore Rules.')
    }
  }

  return (
    <main className="mx-auto max-w-screen-xl p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="text-xl font-bold text-slate-900">Pengelolaan Pengguna</h2><p className="mt-1 max-w-2xl text-sm text-slate-600">Buat akun admin dan batasi akses sesuai tanggung jawabnya.</p></div>
        <button type="button" onClick={() => setShowCreate(true)} className="min-h-11 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">Tambah Pengguna</button>
      </div>

      <section aria-label="Role dan izin" className="mb-6 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
        {ADMIN_ROLES.map((role) => <article key={role} className="bg-white p-4"><h3 className="text-sm font-semibold text-slate-900">{ROLE_LABELS[role]}</h3><p className="mt-1 text-sm leading-5 text-slate-600">{ROLE_DESCRIPTIONS[role]}</p></article>)}
      </section>

      {error && <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {loading ? <div className="space-y-3" aria-busy="true">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-16 w-full" />)}<span className="sr-only">Memuat pengguna admin...</span></div> : users.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">Belum ada profil admin ber-role. Tetapkan role awal untuk akun admin dari Firebase Console sebelum memakai halaman ini.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600"><tr><th className="px-4 py-3">Pengguna</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{users.map((entry) => <tr key={entry.uid}>
              <td className="px-4 py-3"><p className="font-medium text-slate-900">{entry.nama || 'Tanpa nama'}{entry.uid === user?.uid && <span className="ml-2 text-xs text-slate-500">(Anda)</span>}</p><p className="mt-0.5 text-slate-600">{entry.email}</p></td>
              <td className="px-4 py-3"><select aria-label={`Role ${entry.nama || entry.email}`} value={entry.role} disabled={entry.uid === user?.uid} onChange={(event) => void changeRole(entry, event.target.value as AdminRole)} className="min-h-10 rounded-md border border-slate-300 bg-white px-2 text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100">{ADMIN_ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}</select></td>
              <td className="px-4 py-3"><span className={`inline-flex min-h-7 items-center rounded-md px-2 text-xs font-semibold ${entry.aktif ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{entry.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
              <td className="px-4 py-3 text-right"><button type="button" disabled={entry.uid === user?.uid} onClick={() => void toggleActive(entry)} className="min-h-10 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50">{entry.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button></td>
            </tr>)}</tbody>
          </table></div>
        </div>
      )}

      <AdminFormDialog open={showCreate} onOpenChange={setShowCreate} title="Tambah pengguna admin" description="Akun akan dibuat di Firebase Authentication dan langsung memperoleh role yang dipilih." submitLabel="Buat akun" onSubmit={createUser}>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Nama lengkap<input required autoComplete="name" value={form.nama} onChange={(event) => setForm((current) => ({ ...current, nama: event.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" /></label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Email<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" /></label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Kata sandi awal<input required type="password" minLength={8} autoComplete="new-password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" /><span className="block text-xs font-normal text-slate-600">Sampaikan kata sandi sementara secara aman dan minta pengguna menggantinya.</span></label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Role<select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as AdminRole }))} className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">{ADMIN_ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}</select><span className="block text-xs font-normal text-slate-600">{ROLE_DESCRIPTIONS[form.role]}</span></label>
      </AdminFormDialog>
    </main>
  )
}
