import { useEffect, useState } from 'react'
import {
  addDoc, collection, deleteDoc, doc,
  onSnapshot, orderBy, query, serverTimestamp, updateDoc,
} from 'firebase/firestore'
import { db } from '../../firebase'
import AdminFormDialog from '../components/AdminFormDialog'
import AdminImageUpload from '../components/AdminImageUpload'

interface PengumumanItem {
  id: string
  judul: string
  konten: string
  coverBase64: string
  lampiranUrl: string
  lampiranLabel: string
  aktif: boolean
  urutan: number
  createdAt: Date | null
}

interface PengumumanForm {
  judul: string
  konten: string
  coverBase64: string
  lampiranUrl: string
  lampiranLabel: string
}

const EMPTY_FORM: PengumumanForm = {
  judul: '',
  konten: '',
  coverBase64: '',
  lampiranUrl: '',
  lampiranLabel: '',
}

function formatTanggal(date: Date | null) {
  if (!date) return '-'
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function MasterPengumuman() {
  const [items, setItems] = useState<PengumumanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [form, setForm] = useState<PengumumanForm>(EMPTY_FORM)
  const [editing, setEditing] = useState<PengumumanItem | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => onSnapshot(
    query(collection(db, 'pengumuman'), orderBy('urutan')),
    (snapshot) => {
      setItems(snapshot.docs.map((document) => {
        const data = document.data()
        return {
          id: document.id,
          judul: data.judul ?? '',
          konten: data.konten ?? '',
          coverBase64: data.cover_base64 ?? '',
          lampiranUrl: data.lampiran_url ?? '',
          lampiranLabel: data.lampiran_label ?? '',
          aktif: data.aktif === true,
          urutan: data.urutan ?? 0,
          createdAt: data.created_at?.toDate?.() ?? null,
        }
      }))
      setLoading(false)
      setError(false)
    },
    (loadError) => {
      console.error('Gagal memuat pengumuman:', loadError)
      setLoading(false)
      setError(true)
    },
  ), [])

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true) }
  const openEdit = (item: PengumumanItem) => {
    setEditing(item)
    setForm({
      judul: item.judul,
      konten: item.konten,
      coverBase64: item.coverBase64,
      lampiranUrl: item.lampiranUrl,
      lampiranLabel: item.lampiranLabel,
    })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.judul.trim()) throw new Error('Judul wajib diisi.')
    if (!form.konten.trim()) throw new Error('Isi pengumuman wajib diisi.')
    const payload = {
      judul: form.judul.trim(),
      konten: form.konten.trim(),
      cover_base64: form.coverBase64,
      lampiran_url: form.lampiranUrl.trim(),
      lampiran_label: form.lampiranLabel.trim() || 'Lihat Lampiran',
    }
    if (editing) {
      await updateDoc(doc(db, 'pengumuman', editing.id), { ...payload, updated_at: serverTimestamp() })
    } else {
      const urutan = items.length ? Math.max(...items.map((item) => item.urutan)) + 1 : 0
      await addDoc(collection(db, 'pengumuman'), { ...payload, aktif: true, urutan, created_at: serverTimestamp() })
    }
  }

  const toggle = (item: PengumumanItem) =>
    updateDoc(doc(db, 'pengumuman', item.id), { aktif: !item.aktif, updated_at: serverTimestamp() })

  const remove = async (item: PengumumanItem) => {
    if (confirm(`Hapus pengumuman "${item.judul}"?`)) await deleteDoc(doc(db, 'pengumuman', item.id))
  }

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">Pengumuman</h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola pengumuman yang ditampilkan di halaman pengumuman publik.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          + Tambah Pengumuman
        </button>
      </div>

      <AdminFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        title={editing ? 'Edit Pengumuman' : 'Tambah Pengumuman'}
        description="Pengumuman akan ditampilkan di halaman publik /info setelah diaktifkan."
        onSubmit={save}
      >
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Judul <span className="text-red-600">*</span>
          <input
            required
            value={form.judul}
            onChange={(e) => setForm({ ...form, judul: e.target.value })}
            placeholder="Judul pengumuman"
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </label>

        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Isi Pengumuman <span className="text-red-600">*</span>
          <textarea
            required
            rows={5}
            value={form.konten}
            onChange={(e) => setForm({ ...form, konten: e.target.value })}
            placeholder="Tulis isi pengumuman di sini..."
            className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </label>

        <AdminImageUpload
          label="Gambar Cover (opsional)"
          value={form.coverBase64}
          onChange={(coverBase64) => setForm((current) => ({ ...current, coverBase64 }))}
        />

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
          <p className="text-sm font-medium text-slate-700">Lampiran (opsional)</p>
          <p className="text-xs text-slate-500">
            Upload file ke Google Drive, jadikan "Siapa saja yang memiliki link" dapat mengakses, lalu tempel link-nya di bawah.
          </p>
          <label className="block space-y-1.5 text-sm font-medium text-slate-700">
            URL Lampiran
            <input
              type="url"
              value={form.lampiranUrl}
              onChange={(e) => setForm({ ...form, lampiranUrl: e.target.value })}
              placeholder="https://drive.google.com/file/d/..."
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            />
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-slate-700">
            Label Tombol Lampiran
            <input
              value={form.lampiranLabel}
              onChange={(e) => setForm({ ...form, lampiranLabel: e.target.value })}
              placeholder="Contoh: Download Jadwal, Lihat PDF"
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            />
          </label>
        </div>
      </AdminFormDialog>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gagal memuat pengumuman. Periksa koneksi dan Firestore Rules.
        </p>
      )}

      {loading ? (
        <p className="py-12 text-center text-slate-600">Memuat pengumuman...</p>
      ) : error ? null : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-600">
          Belum ada pengumuman. Klik tombol di atas untuk menambahkan.
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
                  <th className="w-24 px-4 py-3">Cover</th>
                  <th className="px-4 py-3">Judul</th>
                  <th className="px-4 py-3">Isi</th>
                  <th className="px-4 py-3">Lampiran</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className={!item.aktif ? 'opacity-60' : ''}>
                    <td className="px-4 py-2">
                      {item.coverBase64 ? (
                        <img
                          src={item.coverBase64}
                          alt={`Cover ${item.judul}`}
                          width={80}
                          height={56}
                          className="h-14 w-20 rounded-md bg-slate-100 object-cover"
                        />
                      ) : (
                        <div className="h-14 w-20 rounded-md bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 max-w-[200px]">
                      <span className="line-clamp-2">{item.judul}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs">
                      <span className="line-clamp-2 text-xs">{item.konten}</span>
                    </td>
                    <td className="px-4 py-3">
                      {item.lampiranUrl ? (
                        <a
                          href={item.lampiranUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-700 underline hover:text-blue-900"
                        >
                          {item.lampiranLabel || 'Lihat'}
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {formatTanggal(item.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${item.aktif ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                        {item.aktif ? 'Tampil' : 'Disembunyikan'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toggle(item)}
                          className="min-h-9 rounded-md border px-3 text-xs hover:bg-slate-50 cursor-pointer"
                        >
                          {item.aktif ? 'Sembunyikan' : 'Tampilkan'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="min-h-9 rounded-md border border-blue-200 px-3 text-xs text-blue-800 hover:bg-blue-50 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(item)}
                          className="min-h-9 rounded-md border border-red-200 px-3 text-xs text-red-800 hover:bg-red-50 cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {items.map((item) => (
              <article
                key={item.id}
                className={`rounded-xl border border-slate-200 bg-white p-4 ${!item.aktif ? 'opacity-70' : ''}`}
              >
                <div className="mb-3 flex gap-3">
                  {item.coverBase64 ? (
                    <img
                      src={item.coverBase64}
                      alt={`Cover ${item.judul}`}
                      width={80}
                      height={64}
                      className="h-16 w-20 flex-shrink-0 rounded-md bg-slate-100 object-cover"
                    />
                  ) : (
                    <div className="h-16 w-20 flex-shrink-0 rounded-md bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                      No img
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-slate-900 line-clamp-2">{item.judul}</h2>
                    <p className="mt-1 text-xs text-slate-500">{formatTanggal(item.createdAt)}</p>
                    <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${item.aktif ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                      {item.aktif ? 'Tampil' : 'Disembunyikan'}
                    </span>
                  </div>
                </div>
                <p className="mb-3 text-sm text-slate-600 line-clamp-3">{item.konten}</p>
                {item.lampiranUrl && (
                  <a
                    href={item.lampiranUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-3 block text-sm text-blue-700 underline"
                  >
                    {item.lampiranLabel || 'Lihat Lampiran'}
                  </a>
                )}
                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => toggle(item)}
                    className="min-h-11 rounded-md border px-3 text-sm cursor-pointer"
                  >
                    {item.aktif ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="min-h-11 rounded-md border border-blue-200 px-3 text-sm text-blue-800 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    className="min-h-11 rounded-md border border-red-200 px-3 text-sm text-red-800 cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
