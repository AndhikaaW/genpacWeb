import { useEffect, useState } from 'react'
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy,
  query, serverTimestamp, updateDoc,
} from 'firebase/firestore'
import { db } from '../../firebase'
import AdminFormDialog from '../components/AdminFormDialog'
import AdminImageUpload from '../components/AdminImageUpload'
import { useAuth } from '../AuthContext'
import { hasPermission } from '../rbac'

const DEFAULT_GESIT_URL = 'https://gesit.genzaeducation.com/login-siswa'

interface TryOutItem {
  id: string
  judul: string
  ringkasan: string
  deskripsi: string
  jadwal: string
  poster: string
  tombolLabel: string
  linkUrl: string
  aktif: boolean
  urutan: number
}

interface TryOutForm {
  judul: string
  ringkasan: string
  deskripsi: string
  jadwal: string
  poster: string
  tombolLabel: string
  linkUrl: string
}

const EMPTY_FORM: TryOutForm = {
  judul: '', ringkasan: '', deskripsi: '', jadwal: '', poster: '',
  tombolLabel: 'Masuk ke G-Try Out', linkUrl: DEFAULT_GESIT_URL,
}

function validHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export default function MasterGTryOut() {
  const { role } = useAuth()
  const canEdit = hasPermission(role, 'content.edit')
  const [items, setItems] = useState<TryOutItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [form, setForm] = useState<TryOutForm>(EMPTY_FORM)
  const [editing, setEditing] = useState<TryOutItem | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => onSnapshot(
    query(collection(db, 'g_tryouts'), orderBy('urutan')),
    (snapshot) => {
      setItems(snapshot.docs.map((document) => {
        const data = document.data()
        return {
          id: document.id,
          judul: typeof data.judul === 'string' ? data.judul : '',
          ringkasan: typeof data.ringkasan === 'string' ? data.ringkasan : '',
          deskripsi: typeof data.deskripsi === 'string' ? data.deskripsi : '',
          jadwal: typeof data.jadwal === 'string' ? data.jadwal : '',
          poster: typeof data.poster_base64 === 'string' ? data.poster_base64 : '',
          tombolLabel: typeof data.tombol_label === 'string' ? data.tombol_label : 'Masuk ke G-Try Out',
          linkUrl: typeof data.link_url === 'string' ? data.link_url : DEFAULT_GESIT_URL,
          aktif: data.aktif === true,
          urutan: typeof data.urutan === 'number' ? data.urutan : 0,
        }
      }))
      setLoading(false)
      setError(false)
    },
    (loadError) => {
      console.error('Gagal memuat master G-Try Out:', loadError)
      setLoading(false)
      setError(true)
    },
  ), [])

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true) }
  const openEdit = (item: TryOutItem) => {
    setEditing(item)
    setForm({
      judul: item.judul,
      ringkasan: item.ringkasan,
      deskripsi: item.deskripsi,
      jadwal: item.jadwal,
      poster: item.poster,
      tombolLabel: item.tombolLabel,
      linkUrl: item.linkUrl,
    })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.judul.trim()) throw new Error('Judul try out wajib diisi.')
    if (!form.deskripsi.trim() && !form.ringkasan.trim()) throw new Error('Isi ringkasan atau deskripsi informasi try out.')
    if (!form.linkUrl.trim() || !validHttpsUrl(form.linkUrl.trim())) throw new Error('Masukkan URL HTTPS yang valid untuk tombol akses.')
    if (!form.tombolLabel.trim()) throw new Error('Label tombol wajib diisi.')

    const payload = {
      judul: form.judul.trim(),
      ringkasan: form.ringkasan.trim(),
      deskripsi: form.deskripsi.trim(),
      jadwal: form.jadwal.trim(),
      poster_base64: form.poster,
      tombol_label: form.tombolLabel.trim(),
      link_url: form.linkUrl.trim(),
    }
    if (editing) {
      await updateDoc(doc(db, 'g_tryouts', editing.id), { ...payload, updated_at: serverTimestamp() })
    } else {
      const urutan = items.length ? Math.max(...items.map((item) => item.urutan)) + 1 : 0
      await addDoc(collection(db, 'g_tryouts'), { ...payload, aktif: true, urutan, created_at: serverTimestamp() })
    }
  }

  const toggle = (item: TryOutItem) => updateDoc(doc(db, 'g_tryouts', item.id), {
    aktif: !item.aktif,
    updated_at: serverTimestamp(),
  })

  const remove = async (item: TryOutItem) => {
    if (confirm(`Hapus informasi "${item.judul}"?`)) await deleteDoc(doc(db, 'g_tryouts', item.id))
  }

  const updateField = <K extends keyof TryOutForm>(key: K, value: TryOutForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  return (
    <div className="w-full p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">Master G-Try Out</h1>
          <p className="mt-1 text-sm text-slate-600">Kelola beberapa informasi try out yang tampil di halaman publik.</p>
        </div>
        {canEdit && <button type="button" onClick={openAdd} className="min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800">
          + Tambah Try Out
        </button>}
      </div>

      {canEdit && <AdminFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        title={editing ? 'Edit Informasi Try Out' : 'Tambah Informasi Try Out'}
        description="Isi informasi dan tautan akses untuk satu kegiatan try out. Informasi aktif akan tampil di halaman publik."
        onSubmit={save}
      >
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Judul <span className="text-red-700">*</span>
          <input required maxLength={120} value={form.judul} onChange={(event) => updateField('judul', event.target.value)} placeholder="Contoh: G-Try Out UTBK" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Ringkasan
          <textarea rows={2} maxLength={300} value={form.ringkasan} onChange={(event) => updateField('ringkasan', event.target.value)} placeholder="Kalimat pengantar singkat (opsional)" className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Deskripsi
          <textarea rows={5} maxLength={3000} value={form.deskripsi} onChange={(event) => updateField('deskripsi', event.target.value)} placeholder="Jelaskan informasi try out, ketentuan, atau cara mengikuti." className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" />
          <span className="block text-xs font-normal text-slate-500">Ringkasan atau deskripsi harus diisi.</span>
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          Jadwal / periode
          <input maxLength={120} value={form.jadwal} onChange={(event) => updateField('jadwal', event.target.value)} placeholder="Contoh: 20–25 Juli 2026 (opsional)" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" />
        </label>
        <AdminImageUpload label="Poster / gambar (opsional)" value={form.poster} onChange={(poster) => updateField('poster', poster)} />

        <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold text-slate-800">Tombol akses platform</h2>
          <label className="block space-y-1.5 text-sm font-medium text-slate-700">
            URL tujuan <span className="text-red-700">*</span>
            <input type="url" required value={form.linkUrl} onChange={(event) => updateField('linkUrl', event.target.value)} placeholder={DEFAULT_GESIT_URL} className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" />
            <span className="block text-xs font-normal text-slate-500">Harus menggunakan HTTPS. Nilai awal diarahkan ke halaman login siswa Gesit.</span>
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-slate-700">
            Teks tombol <span className="text-red-700">*</span>
            <input required maxLength={60} value={form.tombolLabel} onChange={(event) => updateField('tombolLabel', event.target.value)} placeholder="Masuk ke G-Try Out" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" />
          </label>
        </div>
      </AdminFormDialog>}

      {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">Gagal memuat master G-Try Out. Periksa koneksi dan Firestore Rules.</p>}
      {loading ? <p className="py-12 text-center text-slate-600">Memuat data G-Try Out...</p> : error ? null : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-sm text-slate-600">Belum ada data G-Try Out. Tambahkan informasi agar dapat ditampilkan di halaman publik.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <article key={item.id} className={`flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center ${!item.aktif ? 'opacity-70' : ''}`}>
              {item.poster ? (
                <img src={item.poster} alt={`Poster ${item.judul}`} width={112} height={80} className="h-20 w-28 rounded-md bg-slate-50 object-contain" />
              ) : (
                <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-500">Tanpa poster</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-slate-900">{item.judul}</h2>
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${item.aktif ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>{item.aktif ? 'Tampil publik' : 'Disembunyikan'}</span>
                </div>
                {item.jadwal && <p className="mt-1 text-sm font-medium text-blue-800">{item.jadwal}</p>}
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.ringkasan || item.deskripsi}</p>
                <p className="mt-1 break-all text-xs text-slate-500">{item.linkUrl}</p>
              </div>
              {canEdit && <div className="flex flex-wrap gap-2 sm:justify-end">
                <button type="button" onClick={() => toggle(item)} className="min-h-11 rounded-md border border-slate-300 px-3 text-sm hover:bg-slate-50">{item.aktif ? 'Sembunyikan' : 'Tampilkan'}</button>
                <button type="button" onClick={() => openEdit(item)} className="min-h-11 rounded-md border border-blue-200 px-3 text-sm text-blue-800 hover:bg-blue-50">Edit</button>
                <button type="button" onClick={() => remove(item)} className="min-h-11 rounded-md border border-red-200 px-3 text-sm text-red-800 hover:bg-red-50">Hapus</button>
              </div>}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
