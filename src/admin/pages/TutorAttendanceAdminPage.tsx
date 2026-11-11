import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import QRCode from 'qrcode'
import { db } from '../../firebase'
import { Skeleton } from '../../components/ui/skeleton'
import { Button } from '../../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { AttendanceCard, attendanceDateKey, type AttendanceRecord } from '../../tutor/pages/TutorAttendancePage'

function attendanceTimestamp(record: AttendanceRecord) {
  if (!record.waktu_selesai) return Date.parse(`${record.tanggal ?? ''}T${record.jam_selesai ?? '00:00'}:00`) || 0
  return record.waktu_selesai instanceof Date ? record.waktu_selesai.getTime() : record.waktu_selesai.toDate().getTime()
}

export default function TutorAttendanceAdminPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState('')
  const [qrOpen, setQrOpen] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrError, setQrError] = useState<string | null>(null)

  useEffect(() => {
    const attendanceUrl = new URL(window.location.href)
    attendanceUrl.search = ''
    attendanceUrl.hash = '/tutor/absensi'
    QRCode.toDataURL(attendanceUrl.toString(), { width: 320, margin: 2, errorCorrectionLevel: 'M' })
      .then(setQrDataUrl)
      .catch((qrGenerationError: unknown) => {
        console.error('Gagal membuat QR absensi tutor:', qrGenerationError)
        setQrError('QR absensi belum dapat dibuat. Coba muat ulang halaman.')
      })
  }, [])

  useEffect(() => onSnapshot(collection(db, 'tutor_attendance'), (snapshot) => {
    const nextRecords = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as AttendanceRecord)
    nextRecords.sort((a, b) => attendanceTimestamp(b) - attendanceTimestamp(a))
    setRecords(nextRecords)
    setLoading(false)
    setError(null)
  }, (loadError) => {
    console.error('Gagal memuat absensi tutor:', loadError)
    setError('Absensi tutor tidak dapat dimuat. Periksa izin dan Firestore Rules.')
    setLoading(false)
  }), [])

  const visibleRecords = dateFilter ? records.filter((record) => attendanceDateKey(record) === dateFilter) : records

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900">Absensi Tutor</h2><p className="mt-1 text-sm text-slate-600">Jurnal sesi, tanda tangan, dan catatan tutor.</p></div><div className="flex flex-wrap items-end gap-3"><label className="space-y-1 text-sm font-medium text-slate-800">Filter tanggal<input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="block min-h-11 rounded-md border border-slate-300 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700" /></label><Button type="button" variant="outline" onClick={() => setQrOpen(true)} className="min-h-11">Tampilkan QR Absensi</Button></div></header>
      {error && <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {loading ? <div aria-busy="true" className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 w-full" />)}<span className="sr-only">Memuat absensi tutor...</span></div> : visibleRecords.length === 0 ? <p className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600">{records.length ? 'Tidak ada absensi pada tanggal tersebut.' : 'Belum ada catatan absensi tutor.'}</p> : <div className="space-y-4">{visibleRecords.map((record) => <AttendanceCard key={record.id} record={record} />)}</div>}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Absensi Tutor</DialogTitle>
            <DialogDescription>QR permanen ini membuka form absensi tutor. Tutor tetap harus masuk ke akun masing-masing.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            {qrDataUrl ? <img src={qrDataUrl} alt="QR untuk membuka portal absensi tutor" width={320} height={320} className="h-64 w-64 rounded-md border bg-white p-2" /> : <p role={qrError ? 'alert' : 'status'} className="text-sm text-muted-foreground">{qrError ?? 'Membuat QR absensi...'}</p>}
            <p className="break-all text-center text-xs text-muted-foreground">{window.location.origin}{window.location.pathname}#/tutor/absensi</p>
            {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && <p className="text-center text-xs text-amber-800">QR ini memakai alamat localhost untuk pengujian. Setelah aplikasi di-deploy, unduh QR dari alamat produksi agar bisa dipindai dari perangkat lain.</p>}
            {qrDataUrl && <a href={qrDataUrl} download="qr-absensi-tutor.png" className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Unduh QR</a>}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
