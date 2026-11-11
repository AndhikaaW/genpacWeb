import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import AdminFormDialog from '../components/AdminFormDialog'
import AdminImageUpload from '../components/AdminImageUpload'

interface BannerItem { id: string; judul: string; deskripsi: string; imageUrl: string; urutan: number; aktif: boolean }
interface BannerForm { judul: string; deskripsi: string; imageUrl: string }
const EMPTY_FORM: BannerForm = { judul: '', deskripsi: '', imageUrl: '' }

export default function MasterBanner() {
  const [items, setItems] = useState<BannerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<BannerForm>(EMPTY_FORM)
  const [editing, setEditing] = useState<BannerItem | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => onSnapshot(
    query(collection(db, 'landing_banners'), orderBy('urutan')),
    (snapshot) => {
      setItems(snapshot.docs.map((item) => {
        const data = item.data()
        return {
          id: item.id,
          judul: data.judul ?? '',
          deskripsi: data.deskripsi ?? '',
          imageUrl: data.image_url ?? '',
          urutan: data.urutan ?? 0,
          aktif: data.aktif === true,
        }
      }))
      setLoading(false)
    },
    (error) => { console.error('Gagal memuat banner:', error); setLoading(false) },
  ), [])

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true) }
  const openEdit = (item: BannerItem) => {
    setEditing(item)
    setForm({ judul: item.judul, deskripsi: item.deskripsi, imageUrl: item.imageUrl })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.judul.trim() || !form.imageUrl.trim()) throw new Error('Judul dan URL gambar wajib diisi.')
    const payload = { judul: form.judul.trim(), deskripsi: form.deskripsi.trim(), image_url: form.imageUrl.trim() }
    if (editing) {
      await updateDoc(doc(db, 'landing_banners', editing.id), { ...payload, updated_at: serverTimestamp() })
    } else {
      const nextOrder = items.length ? Math.max(...items.map((item) => item.urutan)) + 1 : 0
      await addDoc(collection(db, 'landing_banners'), { ...payload, urutan: nextOrder, aktif: true, created_at: serverTimestamp() })
    }
  }

  const toggle = (item: BannerItem) => updateDoc(doc(db, 'landing_banners', item.id), { aktif: !item.aktif })
  const remove = async (item: BannerItem) => {
    if (confirm(`Hapus banner “${item.judul}”?`)) await deleteDoc(doc(db, 'landing_banners', item.id))
  }

  return (
    <div className="mx-auto max-w-screen-xl p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-slate-800">Master Banner Slider</h1><p className="mt-1 text-sm text-slate-500">Banner aktif tampil bergantian pada layar pembuka landing page.</p></div>
        <button onClick={openAdd} className="min-h-10 flex-shrink-0 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">+ Tambah Banner</button>
      </div>

      <AdminFormDialog open={showForm} onOpenChange={setShowForm} title={editing ? 'Edit Banner' : 'Tambah Banner'} description="Pilih gambar landscape dari perangkat. Gambar dikompres sebelum disimpan." onSubmit={save}>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Judul <span className="text-red-600">*</span>
          <input required value={form.judul} onChange={(event) => setForm({ ...form, judul: event.target.value })} placeholder="Contoh: Kelas UTBK Online" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Deskripsi
          <textarea rows={3} value={form.deskripsi} onChange={(event) => setForm({ ...form, deskripsi: event.target.value })} placeholder="Keterangan singkat untuk banner" className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
        <AdminImageUpload value={form.imageUrl} onChange={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))} label="Gambar banner" />
      </AdminFormDialog>

      {loading ? <p className="py-12 text-center text-slate-500">Memuat...</p> : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">Belum ada banner. Hero standar tetap tampil sampai banner ditambahkan.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
            <table className="w-full text-sm"><thead><tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><th className="px-4 py-3">Pratinjau</th><th className="px-4 py-3">Judul / Deskripsi</th><th className="px-4 py-3">Urutan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{items.map((item) => <tr key={item.id} className={!item.aktif ? 'opacity-60' : ''}>
                <td className="w-52 px-4 py-3"><img src={item.imageUrl} alt={item.judul} width={180} height={88} className="h-[88px] w-[180px] rounded-md bg-slate-100 object-cover" onError={(event) => { event.currentTarget.style.visibility = 'hidden' }} /></td>
                <td className="max-w-xl px-4 py-3"><p className="font-semibold text-slate-800">{item.judul}</p><p className="mt-1 line-clamp-2 text-slate-500">{item.deskripsi}</p></td><td className="px-4 py-3 text-slate-500">{item.urutan + 1}</td>
                <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${item.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
                <td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={() => toggle(item)} className="min-h-9 rounded-md border px-3 text-xs">{item.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button><button onClick={() => openEdit(item)} className="min-h-9 rounded-md border border-blue-200 px-3 text-xs text-blue-700">Edit</button><button onClick={() => remove(item)} className="min-h-9 rounded-md border border-red-200 px-3 text-xs text-red-700">Hapus</button></div></td>
              </tr>)}</tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">{items.map((item) => <article key={item.id} className={`rounded-xl border border-slate-200 bg-white p-4 ${!item.aktif ? 'opacity-70' : ''}`}>
            <img src={item.imageUrl} alt={item.judul} width={640} height={280} className="mb-3 aspect-[16/7] w-full rounded-md bg-slate-100 object-cover" onError={(event) => { event.currentTarget.style.visibility = 'hidden' }} />
            <div className="mb-3 flex items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-800">{item.judul}</h2><p className="mt-1 text-sm text-slate-500">{item.deskripsi}</p><p className="mt-2 text-xs text-slate-400">Urutan {item.urutan + 1}</p></div><span className={`flex-shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${item.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.aktif ? 'Aktif' : 'Nonaktif'}</span></div>
            <div className="flex flex-wrap gap-2"><button onClick={() => toggle(item)} className="min-h-11 rounded-md border px-3 text-sm">{item.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button><button onClick={() => openEdit(item)} className="min-h-11 rounded-md border border-blue-200 px-3 text-sm text-blue-700">Edit</button><button onClick={() => remove(item)} className="min-h-11 rounded-md border border-red-200 px-3 text-sm text-red-700">Hapus</button></div>
          </article>)}</div>
        </>
      )}
    </div>
  )
}
