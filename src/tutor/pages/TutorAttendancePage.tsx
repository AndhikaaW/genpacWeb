import { useEffect, useRef, useState } from 'react'
import { addDoc, collection, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Skeleton } from '../../components/ui/skeleton'
import { useTutorAuth } from '../TutorAuthContext'

export interface AttendanceRecord {
  id: string
  tanggal?: string
  jam_mulai?: string
  jam_selesai?: string
  waktu_selesai?: Date | { toDate: () => Date } | null
  bab: string
  sub_bab: string
  rumusan_poin: string
  hal: string
  catatan_siswa: string
  tutor_nama: string
  signature_base64: string
}

type AttendanceView = 'entry' | 'history'

function localDateValue() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function attendanceDateKey(record: AttendanceRecord) {
  if (!record.waktu_selesai) return record.tanggal ?? ''
  const date = record.waktu_selesai instanceof Date ? record.waktu_selesai : record.waktu_selesai.toDate()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function attendanceDateLabel(record: AttendanceRecord) {
  if (!record.waktu_selesai) return record.tanggal ?? '-'
  const date = record.waktu_selesai instanceof Date ? record.waktu_selesai : record.waktu_selesai.toDate()
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

function attendanceTimeLabel(record: AttendanceRecord) {
  if (record.waktu_selesai) {
    const date = record.waktu_selesai instanceof Date ? record.waktu_selesai : record.waktu_selesai.toDate()
    return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date)
  }
  return record.jam_mulai && record.jam_selesai
    ? `${record.jam_mulai}–${record.jam_selesai}`
    : record.jam_selesai || '-'
}

export default function TutorAttendancePage({ view }: { view: AttendanceView }) {
  const { profile } = useTutorAuth()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [signature, setSignature] = useState('')
  const [typedSignature, setTypedSignature] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const signedRef = useRef(false)
  const [form, setForm] = useState({ bab: '', subBab: '', rumusan: '', hal: '', catatanSiswa: '' })

  useEffect(() => {
    if (!profile || view !== 'history') return
    const attendanceQuery = query(collection(db, 'tutor_attendance'), where('tutor_uid', '==', profile.uid))
    return onSnapshot(attendanceQuery, (snapshot) => {
      const nextRecords = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as AttendanceRecord)
      nextRecords.sort((a, b) => attendanceTimeLabel(b).localeCompare(attendanceTimeLabel(a)))
      setRecords(nextRecords)
      setListLoading(false)
      setListError(null)
    }, (error) => {
      console.error('Gagal memuat riwayat absensi tutor:', error)
      setListError('Riwayat absensi gagal dimuat. Periksa koneksi dan Firestore Rules.')
      setListLoading(false)
    })
  }, [profile, view])

  const drawStart = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || saving) return
    event.preventDefault()
    canvas.setPointerCapture(event.pointerId)
    const bounds = canvas.getBoundingClientRect()
    const context = canvas.getContext('2d')
    if (!context) return
    context.strokeStyle = '#172554'
    context.lineWidth = 3
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()
    context.moveTo((event.clientX - bounds.left) * canvas.width / bounds.width, (event.clientY - bounds.top) * canvas.height / bounds.height)
    drawingRef.current = true
  }

  const drawMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !drawingRef.current) return
    const bounds = canvas.getBoundingClientRect()
    const context = canvas.getContext('2d')
    if (!context) return
    context.lineTo((event.clientX - bounds.left) * canvas.width / bounds.width, (event.clientY - bounds.top) * canvas.height / bounds.height)
    context.stroke()
    signedRef.current = true
  }

  const drawEnd = () => {
    const canvas = canvasRef.current
    if (!canvas || !drawingRef.current) return
    drawingRef.current = false
    if (signedRef.current) setSignature(canvas.toDataURL('image/png'))
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height)
    drawingRef.current = false
    signedRef.current = false
    setSignature('')
  }

  const useTypedSignature = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const name = typedSignature.trim()
    if (!canvas || !context || !name) {
      setFormError('Masukkan nama paraf terlebih dahulu.')
      return
    }
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#172554'
    context.font = 'italic 48px cursive'
    context.textBaseline = 'middle'
    context.fillText(name, 40, canvas.height / 2, canvas.width - 80)
    signedRef.current = true
    setSignature(canvas.toDataURL('image/png'))
    setFormError(null)
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotice(null)
    setFormError(null)
    if (!profile) return
    if (!signature) {
      setFormError('Tanda tangan tutor wajib diisi.')
      return
    }
    if (signature.length > 150_000) {
      setFormError('Gambar tanda tangan terlalu besar. Hapus lalu tanda tangani ulang dengan goresan sederhana.')
      return
    }

    setSaving(true)
    try {
      await addDoc(collection(db, 'tutor_attendance'), {
        tutor_uid: profile.uid,
        tutor_nama: profile.nama,
        waktu_selesai: serverTimestamp(),
        bab: form.bab.trim(),
        sub_bab: form.subBab.trim(),
        rumusan_poin: form.rumusan.trim(),
        hal: form.hal.trim(),
        catatan_siswa: form.catatanSiswa.trim(),
        signature_base64: signature,
        created_at: serverTimestamp(),
      })
      setForm({ bab: '', subBab: '', rumusan: '', hal: '', catatanSiswa: '' })
      clearSignature()
      setNotice('Absensi dan jurnal sesi berhasil disimpan.')
    } catch (saveError) {
      console.error('Gagal menyimpan absensi tutor:', saveError)
      setFormError('Absensi belum berhasil disimpan. Periksa koneksi, lalu coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  if (view === 'history') {
    return (
      <main className="mx-auto max-w-5xl p-4 md:p-8">
        <header className="mb-6"><h1 className="text-2xl font-bold text-slate-900">Riwayat absensi</h1><p className="mt-1 text-sm text-slate-600">Catatan sesi mengajar yang pernah Anda kirim.</p></header>
        {listError && <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{listError}</p>}
        {listLoading ? <div aria-busy="true" className="space-y-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-32 w-full" />)}<span className="sr-only">Memuat riwayat absensi...</span></div> : records.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">Belum ada absensi. Catat sesi mengajar setelah kelas selesai.</p> : (
          <div className="space-y-4">{records.map((record) => <AttendanceCard key={record.id} record={record} />)}</div>
        )}
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <p className="text-sm font-semibold text-primary">{profile?.nama}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Catat sesi mengajar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Isi jurnal dan absensi untuk setiap sesi yang telah dilaksanakan.</p>
      </header>
      <Card className="ring-0 shadow-none">
        <CardContent className="pt-5 sm:pt-6">
          <form onSubmit={submit} className="space-y-7">
            <section className="space-y-4" aria-labelledby="session-heading">
              <div className="border-b pb-2"><h2 id="session-heading" className="text-base font-semibold text-foreground">Waktu absensi</h2><p className="mt-1 text-sm text-muted-foreground">Tanggal dan jam selesai dicatat otomatis saat absensi dikirim.</p></div>
              <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                Tanggal sesi: <span className="font-medium text-foreground">{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${localDateValue()}T12:00:00`))}</span>
                <span className="ml-2">Jam selesai diambil dari waktu server.</span>
              </div>
            </section>

            <section className="space-y-4" aria-labelledby="lesson-heading">
              <div className="border-b pb-2"><h2 id="lesson-heading" className="text-base font-semibold text-foreground">Materi pembelajaran</h2><p className="mt-1 text-sm text-muted-foreground">Catat materi dan hal penting yang dibahas selama sesi.</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2 text-sm font-medium text-foreground"><span className="block">Bab <span className="text-destructive">*</span></span><Input required value={form.bab} onChange={(event) => setForm((current) => ({ ...current, bab: event.target.value }))} className="h-11 px-3" /></label>
                <label className="block space-y-2 text-sm font-medium text-foreground"><span className="block">Subbab</span><Input value={form.subBab} onChange={(event) => setForm((current) => ({ ...current, subBab: event.target.value }))} className="h-11 px-3" /></label>
                <label className="block space-y-2 text-sm font-medium text-foreground sm:col-span-2"><span className="block">Rumusan / poin penting <span className="text-destructive">*</span></span><textarea required rows={4} value={form.rumusan} onChange={(event) => setForm((current) => ({ ...current, rumusan: event.target.value }))} className="flex min-h-28 w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" /></label>
                <label className="block space-y-2 text-sm font-medium text-foreground"><span className="block">Hal / halaman</span><Input value={form.hal} onChange={(event) => setForm((current) => ({ ...current, hal: event.target.value }))} className="h-11 px-3" /></label>
                <label className="block space-y-2 text-sm font-medium text-foreground sm:col-span-2"><span className="block">Catatan siswa</span><textarea rows={3} value={form.catatanSiswa} onChange={(event) => setForm((current) => ({ ...current, catatanSiswa: event.target.value }))} placeholder="Perkembangan, kesulitan, atau tindak lanjut untuk siswa" className="flex min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" /></label>
              </div>
            </section>

            <section className="space-y-3" aria-labelledby="signature-heading">
              <div className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-start sm:justify-between">
                <div><h2 id="signature-heading" className="text-base font-semibold text-foreground">Paraf / tanda tangan tutor <span className="text-destructive">*</span></h2><p className="mt-1 text-sm text-muted-foreground">Gambar dengan mouse atau jari. Jika tidak bisa menggambar, gunakan paraf teks di bawah.</p></div>
                <Button type="button" variant="outline" onClick={clearSignature} disabled={!signature || saving} className="min-h-10 shrink-0">Hapus tanda tangan</Button>
              </div>
              <canvas ref={canvasRef} width={900} height={240} aria-label="Area untuk menggambar tanda tangan" onPointerDown={drawStart} onPointerMove={drawMove} onPointerUp={drawEnd} onPointerCancel={drawEnd} className="h-36 w-full touch-none rounded-lg border border-input bg-background sm:h-40" />
              <div className="flex flex-col gap-2 sm:flex-row"><label htmlFor="typed-signature" className="sr-only">Nama paraf teks</label><Input id="typed-signature" value={typedSignature} onChange={(event) => setTypedSignature(event.target.value)} maxLength={80} placeholder="Nama untuk paraf teks" className="h-11 min-w-0 flex-1 px-3" /><Button type="button" variant="outline" onClick={useTypedSignature} disabled={saving || !typedSignature.trim()} className="min-h-11">Jadikan paraf teks sebagai gambar</Button></div>
            </section>

            {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
            {formError && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{formError}</p>}
            <div className="border-t pt-4"><Button type="submit" disabled={saving} className="min-h-11 w-full bg-blue-700 text-white hover:bg-blue-800 sm:w-auto">{saving ? 'Menyimpan...' : 'Simpan absensi'}</Button></div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

export function AttendanceCard({ record }: { record: AttendanceRecord }) {
  return (
    <article>
    <Card>
    <CardContent className="pt-4">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3"><div><h2 className="font-semibold text-slate-900">{record.bab}{record.sub_bab ? ` · ${record.sub_bab}` : ''}</h2><p className="mt-1 text-sm text-slate-600">{attendanceDateLabel(record)} · Selesai {attendanceTimeLabel(record)}</p></div><span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800">{record.tutor_nama}</span></div>
      <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div><dt className="font-medium text-slate-600">Rumusan / poin penting</dt><dd className="mt-1 whitespace-pre-wrap text-slate-900">{record.rumusan_poin || 'Belum diisi'}</dd></div>
        <div><dt className="font-medium text-slate-600">Hal / halaman</dt><dd className="mt-1 whitespace-pre-wrap text-slate-900">{record.hal || 'Belum diisi'}</dd></div>
        <div className="sm:col-span-2"><dt className="font-medium text-slate-600">Catatan siswa</dt><dd className="mt-1 whitespace-pre-wrap text-slate-900">{record.catatan_siswa || 'Belum diisi'}</dd></div>
    </dl>
      {record.signature_base64 && <div className="mt-4 border-t border-slate-100 pt-3"><p className="text-xs font-medium text-slate-600">Tanda tangan tutor</p><img src={record.signature_base64} alt={`Tanda tangan tutor ${record.tutor_nama}`} width={240} height={96} className="mt-2 h-20 w-48 object-contain object-left" /></div>}
    </CardContent>
    </Card>
    </article>
  )
}
