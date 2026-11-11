import { useState } from 'react'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { useRegistration, updateStatus, updatePetugas, deleteRegistration } from '../useAdmin'
import { STATUS_LABELS, STATUS_COLORS, formatDate, formatDateTime, formatCurrency, toWaLink } from '../types'
import PaymentPanel from '../components/PaymentPanel'
import { Link, navigate } from '../AdminRouter'
import { printRegistration } from '../utils/printDocument'
import { ChevronLeft, Printer, MessageCircle, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '../../components/ui/dialog'
import AdminFormDialog from '../components/AdminFormDialog'
import { db } from '../../firebase'

export default function RegistrationDetail({ id }: { id: string }) {
  const { item: r, loading } = useRegistration(id)
  const [showPayment, setShowPayment] = useState(false)
  const [showPetugasDialog, setShowPetugasDialog] = useState(false)
  const [petugas, setPetugas] = useState('')
  const [deleting, setDeleting] = useState(false)

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Memuat data...</p>
      </div>
    )
  }
  if (!r) return <div className="p-12 text-center text-slate-400">Data tidak ditemukan.</div>

  if (showPayment) {
    return (
      <Dialog open onOpenChange={(open) => { if (!open) setShowPayment(false) }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogTitle className="sr-only">Kelola Pembayaran</DialogTitle>
          <PaymentPanel registration={r} onBack={() => setShowPayment(false)} />
        </DialogContent>
      </Dialog>
    )
  }

  const handleStatusChange = async (s: string) => {
    try { await updateStatus(r.id, s) } catch { alert('Gagal mengubah status') }
  }

  const handlePetugas = async () => {
    if (!petugas.trim()) throw new Error('Nama petugas wajib diisi.')
    await updatePetugas(r.id, petugas.trim())
  }

  const handleDelete = async () => {
    if (!confirm(`Hapus data "${r.studentData.namaSiswa}" (${r.kodePendaftaran}) secara permanen?`)) return
    setDeleting(true)
    try { await deleteRegistration(r.id); navigate('/admin/dashboard') }
    catch { alert('Gagal menghapus'); setDeleting(false) }
  }

  const handlePrint = async () => {
    try {
      const snapshot = await getDocs(query(
        collection(db, 'program_bimbingan'),
        where('aktif', '==', true),
        orderBy('urutan'),
        orderBy('nama'),
      ))
      printRegistration(r, snapshot.docs.map((doc) => doc.data().nama as string))
    } catch {
      alert('Program bimbingan gagal dimuat. PDF tidak dibuat.')
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {/* Back + actions */}
      <div className="flex items-center gap-2 mb-5">
        <Link to="/admin/dashboard" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Kembali
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            Cetak / PDF
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            {deleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs text-blue-600 font-medium mb-1">{r.kodePendaftaran}</p>
          <p className="font-bold text-slate-800 text-lg leading-tight">{r.studentData.namaSiswa}</p>
          <p className="text-xs text-slate-400 mt-1">Daftar: {formatDateTime(r.createdAt)}</p>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="status-select" className="text-xs text-slate-500 font-medium">Status</label>
          <select
            id="status-select"
            value={r.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`border rounded-lg px-3 py-1.5 text-sm font-semibold outline-none cursor-pointer ${STATUS_COLORS[r.status]}`}
          >
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Petugas */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
        <label htmlFor="petugas-input" className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Petugas Cabang</label>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-800">{r.petugasCabang || 'Belum ditentukan'}</p>
          <button
            onClick={() => { setPetugas(r.petugasCabang || ''); setShowPetugasDialog(true) }}
            className="min-h-10 rounded-md border border-blue-200 px-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            {r.petugasCabang ? 'Ubah Petugas' : 'Tetapkan Petugas'}
          </button>
        </div>
      </div>
      <AdminFormDialog open={showPetugasDialog} onOpenChange={setShowPetugasDialog} title="Petugas Cabang" description="Tetapkan petugas yang menangani pendaftaran ini." onSubmit={handlePetugas}>
        <label htmlFor="petugas-input" className="block space-y-1.5 text-sm font-medium text-slate-700">Nama petugas <span className="text-red-600">*</span>
          <input id="petugas-input" required autoFocus value={petugas} onChange={(e) => setPetugas(e.target.value)} placeholder="Nama petugas cabang" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
      </AdminFormDialog>

      {/* Data sections */}
      <Section title="Data Siswa">
        <Row label="Nama" value={r.studentData.namaSiswa} />
        <Row label="Tempat, Tgl Lahir" value={`${r.studentData.tempatLahir}, ${formatDate(r.studentData.tanggalLahir)}`} />
        <Row label="Agama" value={r.studentData.agama} />
        <Row label="No. WhatsApp" value={r.studentData.noWa} href={toWaLink(r.studentData.noWa)} icon={<MessageCircle className="w-3.5 h-3.5" />} />
        <Row label="Email" value={r.studentData.email || '-'} />
        <Row label="Sekolah/Kelas/Jur." value={r.studentData.sekolahKelasJurusan} />
      </Section>

      <Section title="Data Orang Tua / Wali">
        <div className="grid sm:grid-cols-2 gap-x-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Ayah</p>
            <Row label="Nama" value={r.parentData.namaAyah} />
            <Row label="Kontak" value={r.parentData.kontakAyah} href={toWaLink(r.parentData.kontakAyah)} icon={<MessageCircle className="w-3.5 h-3.5" />} />
            <Row label="Pekerjaan" value={r.parentData.pekerjaanAyah || '-'} />
          </div>
          <div className="mt-4 sm:mt-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Ibu</p>
            <Row label="Nama" value={r.parentData.namaIbu} />
            <Row label="Kontak" value={r.parentData.kontakIbu} href={toWaLink(r.parentData.kontakIbu)} icon={<MessageCircle className="w-3.5 h-3.5" />} />
            <Row label="Pekerjaan" value={r.parentData.pekerjaanIbu || '-'} />
          </div>
        </div>
      </Section>

      <Section title="Data Bimbingan">
        <Row label="Alamat" value={r.guidanceData.alamat} />
        <Row label="Daftar Kelas" value={r.guidanceData.daftarUntukKelas} />
        <Row label="Minat Kelas" value={r.guidanceData.minatKelas || '-'} />
        <Row label="Periode" value={`${formatDate(r.guidanceData.startBimbinganDari)} s/d ${formatDate(r.guidanceData.startBimbinganSd)}`} />
        <Row label="Kelas di Genza" value={r.guidanceData.kelasDiGenza} />
      </Section>

      <Section title="Program Bimbingan">
        <div className="flex flex-wrap gap-1.5 mt-1">
          {r.programBimbingan.length > 0
            ? r.programBimbingan.map(p => (
                <span key={p} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md">{p}</span>
              ))
            : <span className="text-sm text-slate-400">-</span>
          }
        </div>
      </Section>

      <Section title="Surat Pernyataan">
        <Row label="Yang Menyatakan" value={r.statementData.namaPernyataan} />
        <Row label="Jenjang" value={r.statementData.jenjang} />
        <Row label="Persetujuan" value={r.statementData.disetujui ? `Disetujui pada ${formatDate(r.statementData.waktuDisetujui)}` : 'Belum disetujui'} />
      </Section>

      <Section title="Pembayaran">
        <Row label="Biaya Bimbingan" value={formatCurrency(r.paymentData.biayaBimbingan)} />
        <Row label="ASF/Pendaftaran" value={formatCurrency(r.paymentData.asfPendaftaran)} />
        {r.paymentData.installments.map(inst => (
          <Row
            key={inst.label}
            label={inst.label}
            value={`${formatCurrency(inst.nominal)} · ${inst.sudahBayar ? `Lunas ${formatDate(inst.tanggalBayar)}` : `Belum · Jatuh tempo ${formatDate(inst.tanggalJatuhTempo)}`}`}
          />
        ))}
      </Section>

      {/* Kelola Pembayaran */}
      <button
        onClick={() => setShowPayment(true)}
        className="w-full py-3 border-2 border-blue-200 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors text-sm mt-2"
      >
        Kelola Pembayaran
      </button>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-3">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, value, href, icon }: { label: string; value: string; href?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-1.5 border-b border-slate-50 last:border-0 text-sm">
      <span className="text-slate-400 w-32 flex-shrink-0 text-xs leading-5">{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline flex items-center gap-1">
          {icon}{value}
        </a>
      ) : (
        <span className="font-medium text-slate-800">{value}</span>
      )}
    </div>
  )
}
