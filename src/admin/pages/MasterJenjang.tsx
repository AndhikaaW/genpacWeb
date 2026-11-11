import { Fragment, useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import AdminFormDialog from '../components/AdminFormDialog'

interface JenjangItem { id: string; title: string; description: string; subjects: string[]; facilities: string[]; ikonName: string; urutan: number; aktif: boolean }

export default function MasterJenjang() {
  const [items, setItems] = useState<JenjangItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<JenjangItem | null>(null)
  const [form, setForm] = useState({ title: '', description: '', subjects: '', facilities: '', ikonName: 'graduation-cap' })
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    return onSnapshot(query(collection(db, 'jenjang_program'), orderBy('urutan')), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, title: d.data().title, description: d.data().description, subjects: d.data().subjects ?? [], facilities: d.data().facilities ?? [], ikonName: d.data().ikon_name ?? 'graduation-cap', urutan: d.data().urutan, aktif: d.data().aktif })))
      setLoading(false)
    })
  }, [])

  const openAdd = () => { setEditing(null); setForm({ title: '', description: '', subjects: '', facilities: '', ikonName: 'graduation-cap' }); setShowForm(true) }
  const openEdit = (j: JenjangItem) => { setEditing(j); setForm({ title: j.title, description: j.description, subjects: j.subjects.join(', '), facilities: j.facilities.join(', '), ikonName: j.ikonName }); setShowForm(true) }

  const save = async () => {
    if (!form.title.trim()) throw new Error('Nama jenjang wajib diisi.')
    const payload = {
      title: form.title, description: form.description,
      subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean),
      facilities: form.facilities.split(',').map((s) => s.trim()).filter(Boolean),
      ikon_name: form.ikonName, aktif: true,
    }
    if (editing) {
      await updateDoc(doc(db, 'jenjang_program', editing.id), { ...payload, updated_at: serverTimestamp() })
    } else {
      const maxUrutan = items.length > 0 ? Math.max(...items.map((i) => i.urutan)) + 1 : 0
      await addDoc(collection(db, 'jenjang_program'), { ...payload, urutan: maxUrutan, created_at: serverTimestamp() })
    }
    setShowForm(false)
  }

  const toggle = (j: JenjangItem) => updateDoc(doc(db, 'jenjang_program', j.id), { aktif: !j.aktif })
  const del = async (j: JenjangItem) => { if (confirm(`Hapus jenjang "${j.title}"?`)) await deleteDoc(doc(db, 'jenjang_program', j.id)) }

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">Master Jenjang Program</h1>
        <button onClick={openAdd} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700">+ Tambah</button>
      </div>

      <AdminFormDialog open={showForm} onOpenChange={setShowForm} title={editing ? 'Edit Jenjang' : 'Tambah Jenjang'} description="Informasi ini digunakan pada bagian program di landing page." onSubmit={save}>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Nama jenjang <span className="text-red-600">*</span>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Contoh: SD / MI" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Deskripsi
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi singkat jenjang" rows={3} className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Mata pelajaran <span className="font-normal text-slate-500">(pisahkan dengan koma)</span>
          <input value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} placeholder="Matematika, IPA, Bahasa Indonesia" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Fasilitas G-System <span className="font-normal text-slate-500">(pisahkan dengan koma)</span>
          <input value={form.facilities} onChange={(e) => setForm({ ...form, facilities: e.target.value })} placeholder="G-Book, G-Exercise" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Nama ikon
          <input value={form.ikonName} onChange={(e) => setForm({ ...form, ikonName: e.target.value })} placeholder="Contoh: graduation-cap" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
      </AdminFormDialog>

      {loading ? <div className="text-center text-slate-400 py-12">Memuat...</div> : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">Belum ada jenjang.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><th className="px-4 py-3">Jenjang</th><th className="px-4 py-3">Deskripsi</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((j) => <Fragment key={j.id}>
                  <tr className={!j.aktif ? 'text-slate-400' : ''}>
                    <td className="px-4 py-3 font-semibold text-slate-800">{j.title}</td>
                    <td className="max-w-lg px-4 py-3 text-slate-500">{j.description || ' '}</td>
                    <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${j.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{j.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><button onClick={() => setExpanded(expanded === j.id ? null : j.id)} className="min-h-9 rounded-md border px-3 text-xs hover:bg-slate-50">{expanded === j.id ? 'Tutup' : 'Detail'}</button><button onClick={() => toggle(j)} className="min-h-9 rounded-md border px-3 text-xs hover:bg-slate-50">{j.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button><button onClick={() => openEdit(j)} className="min-h-9 rounded-md border border-blue-200 px-3 text-xs text-blue-700 hover:bg-blue-50">Edit</button><button onClick={() => del(j)} className="min-h-9 rounded-md border border-red-200 px-3 text-xs text-red-700 hover:bg-red-50">Hapus</button></div></td>
                  </tr>
                  {expanded === j.id && <tr key={`${j.id}-detail`}><td colSpan={4} className="bg-slate-50 px-4 py-3"><div className="grid gap-4 sm:grid-cols-2"><ChipRow label="Mata Pelajaran" items={j.subjects} color="bg-blue-50 text-blue-700" /><ChipRow label="Fasilitas G-System" items={j.facilities} color="bg-yellow-50 text-yellow-700" /></div></td></tr>}
                </Fragment>)}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {items.map((j) => <article key={j.id} className={`rounded-xl border border-slate-200 bg-white p-4 ${!j.aktif ? 'opacity-70' : ''}`}>
              <div className="mb-3 flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="font-semibold text-slate-800">{j.title}</h2><p className="mt-1 text-sm text-slate-500">{j.description}</p></div><span className={`rounded-md px-2 py-1 text-xs font-semibold ${j.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{j.aktif ? 'Aktif' : 'Nonaktif'}</span></div>
              {expanded === j.id && <div className="mb-3 space-y-3 border-t border-slate-100 pt-3"><ChipRow label="Mata Pelajaran" items={j.subjects} color="bg-blue-50 text-blue-700" /><ChipRow label="Fasilitas G-System" items={j.facilities} color="bg-yellow-50 text-yellow-700" /></div>}
              <div className="flex flex-wrap gap-2"><button onClick={() => setExpanded(expanded === j.id ? null : j.id)} className="min-h-11 rounded-md border px-3 text-sm">{expanded === j.id ? 'Tutup detail' : 'Lihat detail'}</button><button onClick={() => toggle(j)} className="min-h-11 rounded-md border px-3 text-sm">{j.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button><button onClick={() => openEdit(j)} className="min-h-11 rounded-md border border-blue-200 px-3 text-sm text-blue-700">Edit</button><button onClick={() => del(j)} className="min-h-11 rounded-md border border-red-200 px-3 text-sm text-red-700">Hapus</button></div>
            </article>)}
          </div>
        </>
      )}
    </div>
  )
}

function ChipRow({ label, items, color }: { label: string; items: string[]; color: string }) {
  if (!items.length) return null
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s) => <span key={s} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${color}`}>{s}</span>)}
      </div>
    </div>
  )
}
