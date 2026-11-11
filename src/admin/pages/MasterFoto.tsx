import { useState, useEffect } from 'react'
import {
  collection, query, orderBy, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../firebase'
import AdminFormDialog from '../components/AdminFormDialog'
import AdminImageUpload from '../components/AdminImageUpload'

interface FotoItem { id: string; judul: string; deskripsi: string; imageUrl: string; urutan: number; aktif: boolean }

export default function MasterFoto() {
  const [items, setItems] = useState<FotoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ judul: '', deskripsi: '', imageUrl: '' })
  const [editing, setEditing] = useState<FotoItem | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    return onSnapshot(query(collection(db, 'galeri_foto'), orderBy('urutan')), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, judul: d.data().judul, deskripsi: d.data().deskripsi, imageUrl: d.data().image_url, urutan: d.data().urutan, aktif: d.data().aktif })))
      setLoading(false)
    })
  }, [])

  const openAdd = () => { setEditing(null); setForm({ judul: '', deskripsi: '', imageUrl: '' }); setShowForm(true) }
  const openEdit = (item: FotoItem) => { setEditing(item); setForm({ judul: item.judul, deskripsi: item.deskripsi, imageUrl: item.imageUrl }); setShowForm(true) }

  const save = async () => {
    if (!form.judul.trim() || !form.imageUrl.trim()) throw new Error('Judul dan URL gambar wajib diisi.')
    if (editing) {
      await updateDoc(doc(db, 'galeri_foto', editing.id), { judul: form.judul, deskripsi: form.deskripsi, image_url: form.imageUrl, updated_at: serverTimestamp() })
    } else {
      const maxUrutan = items.length > 0 ? Math.max(...items.map((i) => i.urutan)) + 1 : 0
      await addDoc(collection(db, 'galeri_foto'), { judul: form.judul, deskripsi: form.deskripsi, image_url: form.imageUrl, urutan: maxUrutan, aktif: true, created_at: serverTimestamp() })
    }
    setShowForm(false)
  }

  const toggle = (item: FotoItem) => updateDoc(doc(db, 'galeri_foto', item.id), { aktif: !item.aktif })
  const del = async (item: FotoItem) => { if (confirm(`Hapus "${item.judul}"?`)) await deleteDoc(doc(db, 'galeri_foto', item.id)) }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Master Foto Galeri</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors">+ Tambah Foto</button>
      </div>

      <AdminFormDialog open={showForm} onOpenChange={setShowForm} title={editing ? 'Edit Foto' : 'Tambah Foto'} description="Pilih foto dari perangkat. Gambar akan dikompres sebelum disimpan ke Firestore." onSubmit={save}>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Judul <span className="text-red-600">*</span>
          <input required value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} placeholder="Judul foto" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
        <AdminImageUpload value={form.imageUrl} onChange={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))} label="Foto galeri" />
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Deskripsi (opsional)
          <input value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} placeholder="Deskripsi foto" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
      </AdminFormDialog>

      {loading ? <div className="text-center text-slate-400 py-12">Memuat...</div> : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">Belum ada foto galeri.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full text-sm">
            <thead><tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><th className="px-4 py-3">Foto</th><th className="px-4 py-3">Judul</th><th className="px-4 py-3">Deskripsi</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{items.map((item) => <tr key={item.id} className={!item.aktif ? 'text-slate-400' : ''}>
              <td className="w-28 px-4 py-2"><img src={item.imageUrl} alt={item.judul} width={88} height={60} className="h-[60px] w-[88px] rounded-md bg-slate-100 object-cover" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} /></td>
              <td className="px-4 py-3 font-medium text-slate-800">{item.judul}</td><td className="max-w-lg px-4 py-3 text-slate-500">{item.deskripsi}</td><td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${item.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
              <td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={() => toggle(item)} className="min-h-9 rounded-md border px-3 text-xs hover:bg-slate-50">{item.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button><button onClick={() => openEdit(item)} className="min-h-9 rounded-md border border-blue-200 px-3 text-xs text-blue-700 hover:bg-blue-50">Edit</button><button onClick={() => del(item)} className="min-h-9 rounded-md border border-red-200 px-3 text-xs text-red-700 hover:bg-red-50">Hapus</button></div></td>
            </tr>)}</tbody>
          </table></div>
          <div className="space-y-3 md:hidden">{items.map((item) => <article key={item.id} className={`rounded-xl border border-slate-200 bg-white p-4 ${!item.aktif ? 'opacity-70' : ''}`}>
            <div className="mb-3 flex gap-3"><img src={item.imageUrl} alt={item.judul} width={88} height={72} className="h-[72px] w-[88px] flex-shrink-0 rounded-md bg-slate-100 object-cover" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} /><div className="min-w-0 flex-1"><h2 className="font-semibold text-slate-800">{item.judul}</h2><p className="mt-1 text-sm text-slate-500">{item.deskripsi}</p><span className={`mt-2 inline-block rounded-md px-2 py-1 text-xs font-semibold ${item.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.aktif ? 'Aktif' : 'Nonaktif'}</span></div></div>
            <div className="flex flex-wrap gap-2"><button onClick={() => toggle(item)} className="min-h-11 rounded-md border px-3 text-sm">{item.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button><button onClick={() => openEdit(item)} className="min-h-11 rounded-md border border-blue-200 px-3 text-sm text-blue-700">Edit</button><button onClick={() => del(item)} className="min-h-11 rounded-md border border-red-200 px-3 text-sm text-red-700">Hapus</button></div>
          </article>)}</div>
        </>
      )}
    </div>
  )
}
