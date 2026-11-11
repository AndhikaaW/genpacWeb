import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp, where } from 'firebase/firestore'
import { db } from '../../firebase'

type Status = 'pending' | 'disetujui' | 'ditolak'
interface TestimoniItem { id: string; nama: string; asalSekolah: string; program: string; quote: string; nilai: string; status: Status; createdAt: Date | null }

const STATUS_STYLE: Record<Status, string> = {
  pending: 'bg-amber-100 text-amber-700',
  disetujui: 'bg-emerald-100 text-emerald-700',
  ditolak: 'bg-red-100 text-red-700',
}
const STATUS_LABEL: Record<Status, string> = { pending: 'Menunggu', disetujui: 'Disetujui', ditolak: 'Ditolak' }

export default function MasterTestimoni() {
  const [items, setItems] = useState<TestimoniItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status | ''>('')

  useEffect(() => {
    const col = collection(db, 'testimoni')
    const q = filter
      ? query(col, where('status', '==', filter), orderBy('created_at', 'desc'))
      : query(col, orderBy('created_at', 'desc'))
    return onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({
        id: d.id, nama: d.data().nama, asalSekolah: d.data().asal_sekolah, program: d.data().program,
        quote: d.data().quote, nilai: d.data().nilai ?? '', status: d.data().status,
        createdAt: d.data().created_at?.toDate?.() ?? null,
      })))
      setLoading(false)
    })
  }, [filter])

  const setStatus = (id: string, status: Status) => updateDoc(doc(db, 'testimoni', id), { status, updated_at: serverTimestamp() })
  const del = async (t: TestimoniItem) => { if (confirm(`Hapus testimoni dari "${t.nama}"?`)) await deleteDoc(doc(db, 'testimoni', t.id)) }

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-slate-800 flex-1">Moderasi Testimoni</h1>
        <div className="flex flex-wrap gap-2">
          {(['', 'pending', 'disetujui', 'ditolak'] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s === '' ? 'Semua' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-center text-slate-400 py-12">Memuat...</div> : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">Tidak ada testimoni pada filter ini.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full text-sm">
            <thead><tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><th className="px-4 py-3">Pengirim</th><th className="px-4 py-3">Testimoni</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3 text-right">Moderasi</th></tr></thead>
            <tbody className="divide-y divide-slate-100">{items.map((t) => <tr key={t.id}>
              <td className="min-w-40 px-4 py-3 align-top"><p className="font-semibold text-slate-800">{t.nama}</p><p className="mt-1 text-xs text-slate-500">{t.asalSekolah}{t.program ? ` · ${t.program}` : ''}</p>{t.nilai && <p className="mt-1 text-xs text-slate-500">Nilai: {t.nilai}</p>}</td>
              <td className="max-w-xl px-4 py-3 align-top text-slate-700">{t.quote}</td>
              <td className="px-4 py-3 align-top"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${STATUS_STYLE[t.status]}`}>{STATUS_LABEL[t.status]}</span></td>
              <td className="whitespace-nowrap px-4 py-3 align-top text-xs text-slate-500">{t.createdAt?.toLocaleDateString('id-ID') ?? '-'}</td>
              <td className="px-4 py-3 align-top"><div className="flex justify-end gap-2">{t.status !== 'disetujui' && <button onClick={() => setStatus(t.id, 'disetujui')} className="min-h-9 rounded-md border border-emerald-200 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Setujui</button>}{t.status !== 'ditolak' && <button onClick={() => setStatus(t.id, 'ditolak')} className="min-h-9 rounded-md border border-red-200 px-3 text-xs font-semibold text-red-700 hover:bg-red-50">Tolak</button>}{t.status !== 'pending' && <button onClick={() => setStatus(t.id, 'pending')} className="min-h-9 rounded-md border px-3 text-xs hover:bg-slate-50">Reset</button>}<button onClick={() => del(t)} className="min-h-9 rounded-md border border-red-200 px-3 text-xs text-red-700 hover:bg-red-50">Hapus</button></div></td>
            </tr>)}</tbody>
          </table></div>
          <div className="space-y-3 md:hidden">{items.map((t) => <article key={t.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="font-semibold text-slate-800">{t.nama}</h2><p className="mt-1 text-xs text-slate-500">{t.asalSekolah}{t.program ? ` · ${t.program}` : ''}</p></div><span className={`flex-shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${STATUS_STYLE[t.status]}`}>{STATUS_LABEL[t.status]}</span></div>
            <p className="text-sm leading-relaxed text-slate-700">“{t.quote}”</p>{t.nilai && <p className="mt-2 text-xs text-slate-500">Nilai: {t.nilai}</p>}<p className="mt-2 text-xs text-slate-400">{t.createdAt?.toLocaleDateString('id-ID') ?? '-'}</p>
            <div className="mt-3 flex flex-wrap gap-2">{t.status !== 'disetujui' && <button onClick={() => setStatus(t.id, 'disetujui')} className="min-h-11 rounded-md border border-emerald-200 px-3 text-sm font-semibold text-emerald-700">Setujui</button>}{t.status !== 'ditolak' && <button onClick={() => setStatus(t.id, 'ditolak')} className="min-h-11 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700">Tolak</button>}{t.status !== 'pending' && <button onClick={() => setStatus(t.id, 'pending')} className="min-h-11 rounded-md border px-3 text-sm">Reset</button>}<button onClick={() => del(t)} className="min-h-11 rounded-md border border-red-200 px-3 text-sm text-red-700">Hapus</button></div>
          </article>)}</div>
        </>
      )}
    </div>
  )
}
