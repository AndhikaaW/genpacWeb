import { useState } from 'react'
import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import { ChevronRight, Download, Search } from 'lucide-react'
import { db } from '../firebase'
import { downloadTryOutPdf, type PdfResult } from '../lib/tryoutPdf'

interface Result { agenda: string; nisg: string; nama_siswa: string; jenjang: string; sekolah: string; mapel: string; benar: number; salah: number; kosong: number; nilai: number }

export default function TryOutResultsPage() {
  const [nisg, setNisg] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [state, setState] = useState<'idle' | 'loading' | 'empty' | 'error' | 'done'>('idle')
  const [exporting, setExporting] = useState<string | null>(null)
  const search = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!nisg.trim()) return
    setState('loading')
    try {
      const snapshot = await getDocs(query(collection(db, 'tryout_results'), where('nisg', '==', nisg.trim()), limit(200)))
      const data = snapshot.docs.map((item) => item.data() as Result)
      setResults(data); setState(data.length ? 'done' : 'empty')
    } catch (error) { console.error(error); setState('error') }
  }
  const exportPdf = async (agenda: string, studentRows: Result[]) => {
    setExporting(agenda)
    try {
      const snapshot = await getDocs(query(collection(db, 'tryout_results'), where('agenda', '==', agenda)))
      downloadTryOutPdf(agenda, studentRows as PdfResult[], snapshot.docs.map((item) => item.data() as PdfResult))
    } catch (error) { console.error(error) }
    finally { setExporting(null) }
  }
  const agendas = [...new Set(results.map((item) => item.agenda || 'Hasil Try Out'))]
  return <section id="hasil-try-out" className="bg-white px-4 py-16 sm:py-20">
    <div className="mx-auto max-w-5xl">
      <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Hasil G-Try Out</p><h2 className="mt-2 font-heading text-3xl font-bold text-slate-900">Cari seluruh nilai berdasarkan NISG</h2><p className="mt-3 text-slate-600">Masukkan NISG untuk melihat semua mata pelajaran yang tersedia.</p></div>
      <form onSubmit={search} className="mt-7 flex max-w-xl flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="nisg-result">NISG</label><input id="nisg-result" value={nisg} onChange={(event) => setNisg(event.target.value)} placeholder="Masukkan NISG" className="min-h-11 flex-1 rounded-lg border border-slate-300 px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700" /><button disabled={state === 'loading'} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#22539F] px-5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"><Search className="h-4 w-4" aria-hidden="true" />{state === 'loading' ? 'Mencari...' : 'Lihat Nilai'}</button></form>
      {state === 'empty' && <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Hasil dengan NISG tersebut belum ditemukan.</p>}
      {state === 'error' && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-800">Hasil belum dapat dimuat. Silakan coba lagi.</p>}
      {state === 'done' && <div className="mt-8 space-y-4">{agendas.map((agenda, index) => { const agendaRows = results.filter((item) => (item.agenda || 'Hasil Try Out') === agenda); const student = agendaRows[0]; return <details key={agenda} open={index === 0} className="group overflow-hidden rounded-xl border border-slate-200"><summary className="flex cursor-pointer list-none items-start gap-3 bg-slate-50 p-4 hover:bg-slate-100"><ChevronRight className="mt-1 h-5 w-5 shrink-0 text-blue-700 transition-transform duration-200 group-open:rotate-90" aria-hidden="true" /><div className="flex-1"><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Agenda {index === 0 ? 'terbaru' : ''}</p><h3 className="mt-1 text-lg font-bold text-slate-900">{agenda}</h3><p className="mt-1 text-sm text-slate-600">{agendaRows.length} mata pelajaran tersedia</p></div></summary><div className="border-t"><div className="flex flex-col gap-4 bg-white p-4 sm:flex-row sm:items-start sm:justify-between"><div className="grid flex-1 gap-1 text-sm text-slate-600 sm:grid-cols-2"><p>Nama: <strong className="text-slate-900">{student.nama_siswa}</strong></p><p>NISG: {nisg}</p><p>Jenjang: {student.jenjang}</p><p>Sekolah: {student.sekolah}</p></div><button type="button" onClick={() => exportPdf(agenda, agendaRows)} disabled={exporting === agenda} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#22539F] px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"><Download className="h-4 w-4" aria-hidden="true" />{exporting === agenda ? 'Membuat PDF...' : 'Unduh PDF'}</button></div><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-white text-slate-600"><tr>{['Mata Pelajaran', 'Benar', 'Salah', 'Kosong', 'Nilai'].map((title) => <th key={title} className="px-4 py-3 font-semibold">{title}</th>)}</tr></thead><tbody>{agendaRows.map((item, rowIndex) => <tr key={`${item.mapel}-${rowIndex}`} className="border-t"><td className="px-4 py-3 font-medium text-slate-900">{item.mapel}</td><td className="px-4 py-3">{item.benar}</td><td className="px-4 py-3">{item.salah}</td><td className="px-4 py-3">{item.kosong}</td><td className="px-4 py-3 font-semibold text-blue-800">{item.nilai}</td></tr>)}</tbody></table></div></div></details> })}</div>}
    </div>
  </section>
}
