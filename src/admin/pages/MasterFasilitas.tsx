import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import AdminFormDialog from '../components/AdminFormDialog'

const IKON_OPTIONS = ['zap','activity','message-square','book','dumbbell','heart','monitor-play','bar-chart-3','clipboard-list']

interface FasilitasItem { id: string; nama: string; deskripsi: string; ikonName: string; urutan: number; aktif: boolean }

export default function MasterFasilitas() {
  const [items, setItems] = useState<FasilitasItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<FasilitasItem | null>(null)
  const [form, setForm] = useState({ nama: '', deskripsi: '', ikonName: 'zap' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    return onSnapshot(query(collection(db, 'fasilitas_gsystem'), orderBy('urutan')), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, nama: d.data().nama, deskripsi: d.data().deskripsi, ikonName: d.data().ikon_name ?? 'zap', urutan: d.data().urutan, aktif: d.data().aktif })))
      setLoading(false)
    })
  }, [])

  const openAdd = () => { setEditing(null); setForm({ nama: '', deskripsi: '', ikonName: 'zap' }); setShowForm(true) }
  const openEdit = (f: FasilitasItem) => { setEditing(f); setForm({ nama: f.nama, deskripsi: f.deskripsi, ikonName: f.ikonName }); setShowForm(true) }

  const save = async () => {
    if (!form.nama.trim()) throw new Error('Nama fasilitas wajib diisi.')
    const payload = { nama: form.nama, deskripsi: form.deskripsi, ikon_name: form.ikonName, aktif: true }
    if (editing) {
      await updateDoc(doc(db, 'fasilitas_gsystem', editing.id), { ...payload, updated_at: serverTimestamp() })
    } else {
      const maxUrutan = items.length > 0 ? Math.max(...items.map((i) => i.urutan)) + 1 : 0
      await addDoc(collection(db, 'fasilitas_gsystem'), { ...payload, urutan: maxUrutan, created_at: serverTimestamp() })
    }
    setShowForm(false)
  }

  const toggle = (f: FasilitasItem) => updateDoc(doc(db, 'fasilitas_gsystem', f.id), { aktif: !f.aktif })
  const del = async (f: FasilitasItem) => { if (confirm(`Hapus "${f.nama}"?`)) await deleteDoc(doc(db, 'fasilitas_gsystem', f.id)) }

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Master Fasilitas G-System</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700">+ Tambah</button>
      </div>

      <AdminFormDialog open={showForm} onOpenChange={setShowForm} title={editing ? 'Edit Fasilitas' : 'Tambah Fasilitas'} description="Kelola nama, keterangan, dan ikon fasilitas." onSubmit={save}>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Nama fasilitas <span className="text-red-600">*</span>
          <input required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: G-Assessment" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Deskripsi
          <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} placeholder="Keterangan fasilitas" rows={3} className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Ikon
          <select value={form.ikonName} onChange={(e) => setForm({ ...form, ikonName: e.target.value })} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            {IKON_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      </AdminFormDialog>

      {loading ? <div className="text-center text-slate-400 py-12">Memuat...</div> : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">Belum ada fasilitas.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Fasilitas</th>
                <th className="px-4 py-3">Deskripsi</th>
                <th className="px-4 py-3">Ikon</th><th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{items.map((f) => <tr key={f.id} className={!f.aktif ? 'text-slate-400' : ''}>
                <td className="px-4 py-3 font-medium text-slate-800">{f.nama}</td>
                <td className="px-4 py-3 w text-slate-500">{f.deskripsi}</td>
                <td className="px-4 py-3  font-mono text-xs text-slate-500">{f.ikonName}</td>
                <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${f.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{f.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
                <td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={() => toggle(f)} className="min-h-9 rounded-md border px-3 text-xs hover:bg-slate-50">{f.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button><button onClick={() => openEdit(f)} className="min-h-9 rounded-md border border-blue-200 px-3 text-xs text-blue-700 hover:bg-blue-50">Edit</button><button onClick={() => del(f)} className="min-h-9 rounded-md border border-red-200 px-3 text-xs text-red-700 hover:bg-red-50">Hapus</button></div></td>
              </tr>)}</tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">{items.map((f) => <article key={f.id} className={`rounded-xl border border-slate-200 bg-white p-4 ${!f.aktif ? 'opacity-70' : ''}`}>
            <div className="mb-3 flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="font-semibold text-slate-800">{f.nama}</h2><p className="mt-1 text-sm text-slate-500">{f.deskripsi}</p><p className="mt-1 font-mono text-xs text-slate-400">Ikon: {f.ikonName}</p></div><span className={`rounded-md px-2 py-1 text-xs font-semibold ${f.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{f.aktif ? 'Aktif' : 'Nonaktif'}</span></div>
            <div className="flex flex-wrap gap-2"><button onClick={() => toggle(f)} className="min-h-11 rounded-md border px-3 text-sm">{f.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button><button onClick={() => openEdit(f)} className="min-h-11 rounded-md border border-blue-200 px-3 text-sm text-blue-700">Edit</button><button onClick={() => del(f)} className="min-h-11 rounded-md border border-red-200 px-3 text-sm text-red-700">Hapus</button></div>
          </article>)}</div>
        </>
      )}
    </div>
  )
}
