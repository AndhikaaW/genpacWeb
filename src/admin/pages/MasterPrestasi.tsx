import { useEffect, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import AdminFormDialog from '../components/AdminFormDialog'
import AdminImageUpload from '../components/AdminImageUpload'

interface PrestasiItem { id: string; nama: string; prestasi: string; keterangan: string; sekolah: string; fotoBase64: string; aktif: boolean; urutan: number }
interface PrestasiForm { nama: string; prestasi: string; keterangan: string; sekolah: string; fotoBase64: string }
const EMPTY_FORM: PrestasiForm = { nama: '', prestasi: '', keterangan: '', sekolah: '', fotoBase64: '' }

export default function MasterPrestasi() {
  const [items, setItems] = useState<PrestasiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [form, setForm] = useState<PrestasiForm>(EMPTY_FORM)
  const [editing, setEditing] = useState<PrestasiItem | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => onSnapshot(
    query(collection(db, 'prestasi_siswa'), orderBy('urutan')),
    (snapshot) => {
      setItems(snapshot.docs.map((document) => {
        const data = document.data()
        return { id: document.id, nama: data.nama ?? '', prestasi: data.prestasi ?? '', keterangan: data.keterangan ?? '', sekolah: data.sekolah ?? '', fotoBase64: data.foto_base64 ?? '', aktif: data.aktif === true, urutan: data.urutan ?? 0 }
      }))
      setLoading(false)
      setError(false)
    },
    (loadError) => { console.error('Gagal memuat prestasi siswa:', loadError); setLoading(false); setError(true) },
  ), [])

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true) }
  const openEdit = (item: PrestasiItem) => {
    setEditing(item)
    setForm({ nama: item.nama, prestasi: item.prestasi, keterangan: item.keterangan, sekolah: item.sekolah, fotoBase64: item.fotoBase64 })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.nama.trim() || !form.prestasi.trim() || !form.fotoBase64) throw new Error('Nama siswa, prestasi, dan foto wajib diisi.')
    const payload = { nama: form.nama.trim(), prestasi: form.prestasi.trim(), keterangan: form.keterangan.trim(), sekolah: form.sekolah.trim(), foto_base64: form.fotoBase64 }
    if (editing) {
      await updateDoc(doc(db, 'prestasi_siswa', editing.id), { ...payload, updated_at: serverTimestamp() })
    } else {
      const urutan = items.length ? Math.max(...items.map((item) => item.urutan)) + 1 : 0
      await addDoc(collection(db, 'prestasi_siswa'), { ...payload, aktif: true, urutan, created_at: serverTimestamp() })
    }
  }

  const toggle = (item: PrestasiItem) => updateDoc(doc(db, 'prestasi_siswa', item.id), { aktif: !item.aktif, updated_at: serverTimestamp() })
  const remove = async (item: PrestasiItem) => {
    if (confirm(`Hapus prestasi ${item.nama}?`)) await deleteDoc(doc(db, 'prestasi_siswa', item.id))
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1"><h1 className="text-xl font-bold text-slate-800">Prestasi Siswa</h1><p className="mt-1 text-sm text-slate-600">Kelola siswa Genza Pacitan yang prestasinya ditampilkan di landing page.</p></div>
        <button type="button" onClick={openAdd} className="min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800">+ Tambah Prestasi</button>
      </div>

      <AdminFormDialog open={showForm} onOpenChange={setShowForm} title={editing ? 'Edit Prestasi Siswa' : 'Tambah Prestasi Siswa'} description="Gunakan data prestasi yang sudah dikonfirmasi dan pastikan izin publikasi foto serta data siswa telah diperoleh. Foto maksimal 5 MB dan akan dikompres sebelum disimpan." onSubmit={save}>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Nama siswa <span className="text-red-600">*</span>
          <input required value={form.nama} onChange={(event) => setForm({ ...form, nama: event.target.value })} placeholder="Nama siswa" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal focus-visible:ring-2 focus-visible:ring-blue-600" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Prestasi <span className="text-red-600">*</span>
          <input required value={form.prestasi} onChange={(event) => setForm({ ...form, prestasi: event.target.value })} placeholder="Contoh: Juara 1 Olimpiade Matematika" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal focus-visible:ring-2 focus-visible:ring-blue-600" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Asal sekolah
          <input value={form.sekolah} onChange={(event) => setForm({ ...form, sekolah: event.target.value })} placeholder="Nama sekolah (opsional)" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal focus-visible:ring-2 focus-visible:ring-blue-600" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Keterangan
          <textarea rows={3} value={form.keterangan} onChange={(event) => setForm({ ...form, keterangan: event.target.value })} placeholder="Keterangan tambahan (opsional)" className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 font-normal focus-visible:ring-2 focus-visible:ring-blue-600" />
        </label>
        <AdminImageUpload label="Foto siswa" value={form.fotoBase64} onChange={(fotoBase64) => setForm((current) => ({ ...current, fotoBase64 }))} />
      </AdminFormDialog>

      {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Prestasi siswa gagal dimuat. Periksa koneksi dan Firestore Rules.</p>}
      {loading ? <p className="py-12 text-center text-slate-600">Memuat prestasi siswa...</p> : error ? null : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-600">Belum ada prestasi siswa. Tambahkan data yang sudah dikonfirmasi.</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600"><th className="w-28 px-4 py-3">Foto</th><th className="px-4 py-3">Siswa</th><th className="px-4 py-3">Prestasi</th><th className="px-4 py-3">Sekolah / Keterangan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{items.map((item) => <tr key={item.id} className={!item.aktif ? 'text-slate-500' : ''}>
                <td className="px-4 py-2"><img src={item.fotoBase64} alt={`Foto ${item.nama}`} width={88} height={64} className="h-16 w-[88px] rounded-md bg-slate-100 object-cover" /></td>
                <td className="px-4 py-3 font-semibold text-slate-900">{item.nama}</td>
                <td className="px-4 py-3 font-medium text-blue-800">{item.prestasi}</td>
                <td className="px-4 py-3 text-slate-600">{item.sekolah || '-'}{item.keterangan && <p className="mt-1 text-xs text-slate-500">{item.keterangan}</p>}</td>
                <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${item.aktif ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>{item.aktif ? 'Tampil' : 'Disembunyikan'}</span></td>
                <td className="px-4 py-3"><div className="flex justify-end gap-2"><button type="button" onClick={() => toggle(item)} className="min-h-9 rounded-md border px-3 text-xs hover:bg-slate-50">{item.aktif ? 'Sembunyikan' : 'Tampilkan'}</button><button type="button" onClick={() => openEdit(item)} className="min-h-9 rounded-md border border-blue-200 px-3 text-xs text-blue-800 hover:bg-blue-50">Edit</button><button type="button" onClick={() => remove(item)} className="min-h-9 rounded-md border border-red-200 px-3 text-xs text-red-800 hover:bg-red-50">Hapus</button></div></td>
              </tr>)}</tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">{items.map((item) => <article key={item.id} className={`rounded-xl border border-slate-200 bg-white p-4 ${!item.aktif ? 'opacity-70' : ''}`}>
            <div className="mb-3 flex gap-3"><img src={item.fotoBase64} alt={`Foto ${item.nama}`} width={96} height={80} className="h-20 w-24 flex-shrink-0 rounded-md bg-slate-100 object-cover" /><div className="min-w-0 flex-1"><h2 className="font-semibold text-slate-900">{item.nama}</h2><p className="mt-1 text-sm font-medium text-blue-800">{item.prestasi}</p>{item.sekolah && <p className="mt-1 text-xs text-slate-600">{item.sekolah}</p>}</div><span className={`h-fit flex-shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${item.aktif ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>{item.aktif ? 'Tampil' : 'Disembunyikan'}</span></div>
            {item.keterangan && <p className="mb-3 text-sm text-slate-600">{item.keterangan}</p>}
            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3"><button type="button" onClick={() => toggle(item)} className="min-h-11 rounded-md border px-3 text-sm">{item.aktif ? 'Sembunyikan' : 'Tampilkan'}</button><button type="button" onClick={() => openEdit(item)} className="min-h-11 rounded-md border border-blue-200 px-3 text-sm text-blue-800">Edit</button><button type="button" onClick={() => remove(item)} className="min-h-11 rounded-md border border-red-200 px-3 text-sm text-red-800">Hapus</button></div>
          </article>)}</div>
        </>
      )}
    </div>
  )
}
