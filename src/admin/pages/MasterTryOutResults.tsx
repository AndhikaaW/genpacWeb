import { useEffect, useRef, useState } from 'react'
import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, startAfter, where, writeBatch, type QueryDocumentSnapshot, type DocumentData } from 'firebase/firestore'
import { ArrowLeft, Upload } from 'lucide-react'
import { db } from '../../firebase'
import { parseTryOutWorkbook, type TryOutImportRow } from '../../lib/tryoutExcel'
import { useAuth } from '../AuthContext'
import { hasPermission } from '../rbac'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/ui/dialog'

type SavedRow = TryOutImportRow & { agenda: string }

export default function MasterTryOutResults() {
  const { role, user } = useAuth()
  const canEdit = hasPermission(role, 'content.edit')
  const input = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [agenda, setAgenda] = useState('')
  const [mapel, setMapel] = useState('')
  const [rows, setRows] = useState<TryOutImportRow[]>([])
  const [savedRows, setSavedRows] = useState<SavedRow[]>([])
  const [activeAgenda, setActiveAgenda] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [loadingSaved, setLoadingSaved] = useState(true)
  const [savedError, setSavedError] = useState(false)
  const [filter, setFilter] = useState('')
  const [lastSavedDoc, setLastSavedDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [hasMoreSaved, setHasMoreSaved] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [agendaView, setAgendaView] = useState<'hasil' | 'ringkasan'>('hasil')

  const loadSaved = async (append = false) => {
    const snapshot = await getDocs(append && lastSavedDoc ? query(collection(db, 'tryout_results'), startAfter(lastSavedDoc), limit(200)) : query(collection(db, 'tryout_results'), limit(200)))
    setSavedRows((current) => append ? [...current, ...snapshot.docs.map((item) => item.data() as SavedRow)] : snapshot.docs.map((item) => item.data() as SavedRow))
    setLastSavedDoc(snapshot.docs.at(-1) ?? null); setHasMoreSaved(snapshot.size === 200)
  }
  useEffect(() => { loadSaved().then(() => { setLoadingSaved(false); setSavedError(false) }).catch(() => { setLoadingSaved(false); setSavedError(true) }) }, [])
  const loadMoreSaved = async () => { setLoadingMore(true); try { await loadSaved(true) } catch { setSavedError(true) } finally { setLoadingMore(false) } }

  const deleteAgenda = async (agendaName: string) => {
    if (!window.confirm(`Hapus seluruh data agenda "${agendaName}"? Tindakan ini tidak dapat dibatalkan.`)) return
    setBusy(true)
    try {
      const snapshot = await getDocs(query(collection(db, 'tryout_results'), where('agenda', '==', agendaName)))
      for (let offset = 0; offset < snapshot.docs.length; offset += 450) {
        const batch = writeBatch(db)
        snapshot.docs.slice(offset, offset + 450).forEach((item) => batch.delete(item.ref))
        await batch.commit()
      }
      setSavedRows((current) => current.filter((row) => row.agenda !== agendaName))
      setActiveAgenda(null)
      setMessage(`${snapshot.size} data agenda berhasil dihapus.`)
    } catch (error) { console.error(error); setMessage('Data agenda gagal dihapus. Periksa koneksi dan Firestore Rules.') }
    finally { setBusy(false) }
  }

  const close = () => { if (!busy) { setOpen(false); setRows([]); setMessage('') } }
  const load = async (file: File) => {
    setMessage(''); setFileName(file.name)
    try { setRows(await parseTryOutWorkbook(file, mapel)) }
    catch (error) { setRows([]); setMessage(error instanceof Error ? error.message : 'File tidak dapat dibaca.') }
  }
  const save = async () => {
    if (!rows.length || !agenda.trim() || !user) return
    setBusy(true)
    try {
      const agendaName = agenda.trim().replace(/\s+/g, ' ')
      const ids = rows.map((row) => resultId(agendaName, row.nisg, row.mapel))
      const existing = await Promise.all(ids.map((id) => getDoc(doc(db, 'tryout_results', id))))
      const fresh = rows.filter((_, index) => !existing[index].exists())
      for (let offset = 0; offset < fresh.length; offset += 450) {
        const batch = writeBatch(db)
        fresh.slice(offset, offset + 450).forEach((row) => batch.set(doc(db, 'tryout_results', resultId(agendaName, row.nisg, row.mapel)), { ...row, agenda: agendaName, source_file: fileName, imported_by: user.uid, imported_at: serverTimestamp() }))
        await batch.commit()
      }
      setSavedRows((current) => [...current, ...fresh.map((row) => ({ ...row, agenda: agendaName }))])
      setMessage(`${fresh.length} baris berhasil diimport. ${rows.length - fresh.length} duplikat dilewati.`)
      setRows([])
      setAgenda('')
      setMapel('')
      setFileName('')
      if (input.current) input.current.value = ''
      setOpen(false)
    } catch (error) { console.error(error); setMessage('Import gagal. Periksa koneksi dan Firestore Rules.') }
    finally { setBusy(false) }
  }
  if (!canEdit) return <div className="p-6 text-slate-700">Anda tidak memiliki izin mengelola hasil TO.</div>
  const matchingRows = savedRows.filter((row) => `${row.agenda} ${row.nisg} ${row.nama_siswa} ${row.mapel} ${row.jenjang} ${row.sekolah}`.toLowerCase().includes(filter.toLowerCase().trim()))
  const agendas = [...new Set(matchingRows.map((row) => row.agenda || 'Tanpa agenda'))]
  const visibleRows = activeAgenda ? matchingRows.filter((row) => (row.agenda || 'Tanpa agenda') === activeAgenda) : []
  const studentSummaries = [...new Map(visibleRows.map((row) => [row.nisg, visibleRows.filter((item) => item.nisg === row.nisg)])).entries()].map(([nisg, studentRows]) => { const valid = studentRows.filter((row) => Number.isFinite(row.nilai)); const total = valid.reduce((sum, row) => sum + row.nilai, 0); return { nisg, nama: studentRows[0]?.nama_siswa || '-', jenjang: studentRows[0]?.jenjang || '-', sekolah: studentRows[0]?.sekolah || '-', mapel: valid.length, total, rata: valid.length ? total / valid.length : 0 } }).sort((a, b) => b.total - a.total).map((student, index, all) => ({ ...student, rank: index === 0 || student.total !== all[index - 1].total ? index + 1 : all[index - 1].rank }))
  const uniqueStudents = new Set(savedRows.map((row) => row.nisg)).size
  return <div className="w-full p-4 md:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-xl font-bold text-slate-800">Hasil G-Try Out</h1><p className="mt-1 text-sm text-slate-600">Kelola hasil import berdasarkan agenda dan mata pelajaran.</p></div><button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"><Upload className="h-4 w-4" aria-hidden="true" />Import Excel</button></div>
    {message && <p role="status" className="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-900">{message}</p>}
    <Dialog open={open} onOpenChange={(value) => !busy && setOpen(value)}><DialogContent className="max-h-[90vh] !max-w-[min(96vw,1100px)] overflow-y-auto"><DialogTitle>Import hasil G-Try Out</DialogTitle><DialogDescription>Isi agenda, pilih file Excel, lalu periksa preview sebelum menyimpan.</DialogDescription><div className="space-y-4"><label className="block space-y-1.5 text-sm font-medium text-slate-700">Judul agenda <span className="text-red-700">*</span><input required value={agenda} onChange={(event) => setAgenda(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal" placeholder="Contoh: Try Out Minggu Ke-2 November 2026" /></label><label className="block space-y-1.5 text-sm font-medium text-slate-700">Mapel default <span className="font-normal text-slate-500">(dipakai jika Excel belum memiliki kolom mapel)</span><input value={mapel} onChange={(event) => setMapel(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal" placeholder="Contoh: Matematika" /></label><input ref={input} type="file" accept=".xlsx,.xls" onChange={(event) => event.target.files?.[0] && load(event.target.files[0])} className="block w-full text-sm text-slate-600" />{fileName && <p className="text-sm text-slate-600">File: {fileName}</p>}{message && <p role="alert" className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}{rows.length > 0 && <><p className="text-sm font-semibold text-slate-800">Preview: {rows.length} baris valid</p><div className="max-h-72 overflow-auto rounded-md border"><ResultTable rows={rows.slice(0, 20)} /></div><button type="button" onClick={save} disabled={busy || !agenda.trim()} className="min-h-11 rounded-lg bg-blue-700 px-5 font-semibold text-white hover:bg-blue-800 disabled:opacity-60">{busy ? 'Mengimport...' : 'Konfirmasi Import'}</button></>}</div></DialogContent></Dialog>
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-lg font-bold text-slate-900">Data hasil tersimpan</h2><p className="mt-1 text-sm text-slate-600">{savedRows.length} hasil dari {uniqueStudents} siswa unik</p></div><label className="text-sm font-medium text-slate-700">Cari<input value={filter} onChange={(event) => { setFilter(event.target.value); setActiveAgenda(null) }} placeholder="Agenda, NISG, nama, sekolah" className="mt-1.5 min-h-10 ms-2 w-full rounded-md border border-slate-300 px-3 font-normal sm:w-72" /></label></div>{savedError && <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">Data tersimpan belum dapat dimuat.</p>}{loadingSaved ? <p className="py-10 text-center text-sm text-slate-600">Memuat data tersimpan...</p> : !savedRows.length ? <p className="py-10 text-center text-sm text-slate-600">Belum ada hasil yang diimport.</p> : !agendas.length ? <p className="py-10 text-center text-sm text-slate-600">Data tidak ditemukan.</p> : activeAgenda ? <div><button type="button" onClick={() => { setActiveAgenda(null); setAgendaView('hasil') }} className="mb-4 min-h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50"><ArrowLeft className="mr-2 inline h-4 w-4" aria-hidden="true" />Kembali ke daftar agenda</button><div className="mb-5 rounded-xl bg-blue-50 p-5"><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Agenda aktif</p><h3 className="mt-1 text-2xl font-bold text-slate-900">{activeAgenda}</h3><p className="mt-1 text-sm text-slate-600">{visibleRows.length} hasil <span aria-hidden="true">|</span> {studentSummaries.length} siswa</p></div><div className="mb-4 flex gap-2 border-b border-slate-200"><button type="button" onClick={() => setAgendaView('hasil')} className={`rounded-t-lg px-4 py-3 text-sm font-semibold ${agendaView === 'hasil' ? 'border-b-2 border-blue-700 text-blue-700' : 'text-slate-600'}`}>Data hasil</button><button type="button" onClick={() => setAgendaView('ringkasan')} className={`rounded-t-lg px-4 py-3 text-sm font-semibold ${agendaView === 'ringkasan' ? 'border-b-2 border-blue-700 text-blue-700' : 'text-slate-600'}`}>Rata-rata & ranking</button></div>{agendaView === 'hasil' ? <div className="max-h-[520px] overflow-auto rounded-md border"><ResultTable rows={visibleRows} /></div> : <div className="overflow-x-auto rounded-md border"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-100"><tr>{['Peringkat', 'NISG', 'Nama', 'Jenjang', 'Sekolah', 'Jumlah Mapel', 'Total Nilai', 'Rata-rata'].map((title) => <th key={title} className="px-4 py-3 font-semibold">{title}</th>)}</tr></thead><tbody>{studentSummaries.map((student) => <tr key={student.nisg} className="border-t"><td className="px-4 py-3 font-bold text-blue-700">{student.rank}</td><td className="px-4 py-3">{student.nisg}</td><td className="px-4 py-3 font-medium">{student.nama}</td><td className="px-4 py-3">{student.jenjang}</td><td className="px-4 py-3">{student.sekolah}</td><td className="px-4 py-3">{student.mapel}</td><td className="px-4 py-3 font-semibold">{student.total}</td><td className="px-4 py-3 font-semibold text-blue-700">{student.rata.toFixed(2)}</td></tr>)}</tbody></table></div>}</div> : <div className="mt-4 space-y-2">{agendas.map((agenda) => { const count = matchingRows.filter((row) => (row.agenda || 'Tanpa agenda') === agenda).length; return <div key={agenda} className="flex min-h-16 w-full items-center justify-between rounded-lg border border-slate-200 px-6 py-3 hover:border-blue-300 hover:bg-blue-50"><button type="button" onClick={() => setActiveAgenda(agenda)} className="flex-1 text-left"><span className="block font-semibold text-slate-900">{agenda}</span><span className="text-sm text-slate-600">{count} hasil</span></button><button type="button" onClick={() => deleteAgenda(agenda)} disabled={busy} className="ml-4 min-h-10 rounded-full border border-red-200 px-5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60">Hapus</button></div> })}</div>}</section>
  </div>
}

function resultId(agenda: string, nisg: string, mapel: string) {
  return `${agenda}|${nisg}|${mapel}`.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 140)
}

function ResultTable({ rows, showAgenda = false }: { rows: (TryOutImportRow & { agenda?: string })[]; showAgenda?: boolean }) { const headings = [...(showAgenda ? ['Agenda'] : []), 'NISG', 'Nama', 'Jenjang', 'Sekolah', 'Mapel', 'Benar', 'Salah', 'Kosong', 'Nilai']; return <table className="w-full min-w-[900px] text-left text-sm"><thead className="sticky top-0 bg-slate-100"><tr>{headings.map((title) => <th key={title} className="px-3 py-2">{title}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.nisg}-${row.mapel}-${index}`} className="border-t">{showAgenda && <td className="px-3 py-2">{row.agenda}</td>}<td className="px-3 py-2">{row.nisg}</td><td className="px-3 py-2">{row.nama_siswa}</td><td className="px-3 py-2">{row.jenjang}</td><td className="px-3 py-2">{row.sekolah}</td><td className="px-3 py-2">{row.mapel}</td><td className="px-3 py-2">{row.benar}</td><td className="px-3 py-2">{row.salah}</td><td className="px-3 py-2">{row.kosong}</td><td className="px-3 py-2 font-semibold text-blue-800">{row.nilai}</td></tr>)}</tbody></table> }











