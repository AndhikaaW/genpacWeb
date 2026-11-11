import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import AdminFormDialog from '../components/AdminFormDialog'

interface ProgramItem { id: string; nama: string; aktif: boolean; urutan: number }

export default function MasterProgram() {
  const [items, setItems] = useState<ProgramItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [editing, setEditing] = useState<{ id: string; nama: string } | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    return onSnapshot(query(collection(db, 'program_bimbingan'), orderBy('urutan'), orderBy('nama')), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, nama: d.data().nama, aktif: d.data().aktif, urutan: d.data().urutan })))
      setLoading(false)
    })
  }, [])

  const openAdd = () => { setEditing(null); setNewName(''); setShowForm(true) }
  const openEdit = (p: ProgramItem) => { setEditing({ id: p.id, nama: p.nama }); setNewName(p.nama); setShowForm(true) }

  const save = async () => {
    if (!newName.trim()) throw new Error('Nama program wajib diisi.')
    if (editing) {
      await updateDoc(doc(db, 'program_bimbingan', editing.id), { nama: newName.trim() })
    } else {
      const maxUrutan = items.length > 0 ? Math.max(...items.map((i) => i.urutan)) + 1 : 0
      await addDoc(collection(db, 'program_bimbingan'), { nama: newName.trim(), aktif: true, urutan: maxUrutan, created_at: serverTimestamp() })
    }
  }

  const toggle = (p: ProgramItem) => updateDoc(doc(db, 'program_bimbingan', p.id), { aktif: !p.aktif })
  const del = async (p: ProgramItem) => { if (confirm(`Hapus program "${p.nama}"?`)) await deleteDoc(doc(db, 'program_bimbingan', p.id)) }

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-800">Master Program Bimbingan</h1>
        <button onClick={openAdd} className="min-h-10 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">+ Tambah Program</button>
      </div>

      <AdminFormDialog open={showForm} onOpenChange={setShowForm} title={editing ? 'Edit Program' : 'Tambah Program'} description="Nama program ini akan tersedia pada formulir pendaftaran." onSubmit={save}>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Nama program <span className="text-red-600">*</span>
          <input required autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nama program" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
      </AdminFormDialog>

      {loading ? <div className="text-center text-slate-400 py-12">Memuat...</div> : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">Belum ada program bimbingan.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><th className="px-4 py-3">Program</th><th className="px-4 py-3">Urutan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((p) => <tr key={p.id} className={!p.aktif ? 'text-slate-400' : ''}>
                  <td className="px-4 py-3 font-medium text-slate-800">{p.nama}</td>
                  <td className="px-4 py-3 text-slate-500">{p.urutan}</td>
                  <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${p.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{p.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-2">
                    <button onClick={() => toggle(p)} className="min-h-9 rounded-md border px-3 text-xs hover:bg-slate-50">{p.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button><button onClick={() => openEdit(p)} className="min-h-9 rounded-md border border-blue-200 px-3 text-xs text-blue-700 hover:bg-blue-50">Edit</button>
                    <button onClick={() => del(p)} className="min-h-9 rounded-md border border-red-200 px-3 text-xs text-red-700 hover:bg-red-50">Hapus</button>
                  </div></td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {items.map((p) => <article key={p.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-start justify-between gap-3"><div className="min-w-0 flex-1"><h2 className="font-semibold text-slate-800">{p.nama}</h2><p className="mt-1 text-xs text-slate-500">Urutan {p.urutan}</p></div><span className={`rounded-md px-2 py-1 text-xs font-semibold ${p.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{p.aktif ? 'Aktif' : 'Nonaktif'}</span></div>
              <div className="flex flex-wrap gap-2"><button onClick={() => toggle(p)} className="min-h-11 rounded-md border px-3 text-sm">{p.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button><button onClick={() => openEdit(p)} className="min-h-11 rounded-md border border-blue-200 px-3 text-sm text-blue-700">Edit</button><button onClick={() => del(p)} className="min-h-11 rounded-md border border-red-200 px-3 text-sm text-red-700">Hapus</button></div>
            </article>)}
          </div>
        </>
      )}
    </div>
  )
}
