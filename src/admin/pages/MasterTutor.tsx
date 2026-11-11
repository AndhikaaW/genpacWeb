import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import AdminFormDialog from '../components/AdminFormDialog'

interface TutorItem { id: string; nama: string; mapel: string; fotoBa64: string; aktif: boolean; urutan: number }

export default function MasterTutor() {
  const [items, setItems] = useState<TutorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nama: '', mapel: '' })
  const [editing, setEditing] = useState<TutorItem | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    return onSnapshot(query(collection(db, 'tutors'), orderBy('urutan')), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, nama: d.data().nama, mapel: d.data().mapel, fotoBa64: d.data().foto_base64 ?? '', aktif: d.data().aktif, urutan: d.data().urutan })))
      setLoading(false)
    })
  }, [])

  const openAdd = () => { setEditing(null); setForm({ nama: '', mapel: '' }); setShowForm(true) }
  const openEdit = (t: TutorItem) => { setEditing(t); setForm({ nama: t.nama, mapel: t.mapel }); setShowForm(true) }

  const save = async () => {
    if (!form.nama.trim() || !form.mapel.trim()) throw new Error('Nama dan mata pelajaran wajib diisi.')
    if (editing) {
      await updateDoc(doc(db, 'tutors', editing.id), { nama: form.nama, mapel: form.mapel, updated_at: serverTimestamp() })
    } else {
      const maxUrutan = items.length > 0 ? Math.max(...items.map((i) => i.urutan)) + 1 : 0
      await addDoc(collection(db, 'tutors'), { nama: form.nama, mapel: form.mapel, foto_base64: '', aktif: true, urutan: maxUrutan, created_at: serverTimestamp() })
    }
    setShowForm(false)
  }

  const toggle = (t: TutorItem) => updateDoc(doc(db, 'tutors', t.id), { aktif: !t.aktif })
  const del = async (t: TutorItem) => { if (confirm(`Hapus tutor "${t.nama}"?`)) await deleteDoc(doc(db, 'tutors', t.id)) }

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Master Tutor</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700">+ Tambah Tutor</button>
      </div>

      <AdminFormDialog open={showForm} onOpenChange={setShowForm} title={editing ? 'Edit Tutor' : 'Tambah Tutor'} description="Isi nama dan bidang pengajaran tutor." onSubmit={save}>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Nama tutor <span className="text-red-600">*</span>
          <input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Nama lengkap" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Mata pelajaran / spesialisasi <span className="text-red-600">*</span>
          <input required value={form.mapel} onChange={(e) => setForm({ ...form, mapel: e.target.value })} placeholder="Contoh: Matematika" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
      </AdminFormDialog>

      {loading ? <div className="text-center text-slate-400 py-12">Memuat...</div> : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">Belum ada tutor.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full text-sm">
            <thead><tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><th className="px-4 py-3">Tutor</th><th className="px-4 py-3">Mata Pelajaran</th><th className="px-4 py-3">Urutan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{items.map((t) => <tr key={t.id} className={!t.aktif ? 'text-slate-400' : ''}>
              <td className="px-4 py-3"><div className="flex items-center gap-3">{t.fotoBa64 ? <img src={t.fotoBa64} alt={t.nama} width={36} height={36} className="h-9 w-9 rounded-full object-cover" /> : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">{t.nama[0]}</span>}<span className="font-medium text-slate-800">{t.nama}</span></div></td>
              <td className="px-4 py-3 text-slate-600">{t.mapel}</td><td className="px-4 py-3 text-slate-500">{t.urutan}</td><td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${t.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{t.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
              <td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={() => toggle(t)} className="min-h-9 rounded-md border px-3 text-xs hover:bg-slate-50">{t.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button><button onClick={() => openEdit(t)} className="min-h-9 rounded-md border border-blue-200 px-3 text-xs text-blue-700 hover:bg-blue-50">Edit</button><button onClick={() => del(t)} className="min-h-9 rounded-md border border-red-200 px-3 text-xs text-red-700 hover:bg-red-50">Hapus</button></div></td>
            </tr>)}</tbody>
          </table></div>
          <div className="space-y-3 md:hidden">{items.map((t) => <article key={t.id} className={`rounded-xl border border-slate-200 bg-white p-4 ${!t.aktif ? 'opacity-70' : ''}`}>
            <div className="mb-3 flex items-center gap-3">{t.fotoBa64 ? <img src={t.fotoBa64} alt={t.nama} width={48} height={48} className="h-12 w-12 rounded-full object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">{t.nama[0]}</span>}<div className="min-w-0 flex-1"><h2 className="font-semibold text-slate-800">{t.nama}</h2><p className="text-sm text-slate-500">{t.mapel}</p></div><span className={`rounded-md px-2 py-1 text-xs font-semibold ${t.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{t.aktif ? 'Aktif' : 'Nonaktif'}</span></div>
            <div className="flex flex-wrap gap-2"><button onClick={() => toggle(t)} className="min-h-11 rounded-md border px-3 text-sm">{t.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button><button onClick={() => openEdit(t)} className="min-h-11 rounded-md border border-blue-200 px-3 text-sm text-blue-700">Edit</button><button onClick={() => del(t)} className="min-h-11 rounded-md border border-red-200 px-3 text-sm text-red-700">Hapus</button></div>
          </article>)}</div>
        </>
      )}
    </div>
  )
}
