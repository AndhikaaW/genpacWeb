import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, getDocs, runTransaction, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { AGAMA_OPTIONS, KELAS_DI_GENZA } from '../types'
import logoUrl from '../../assets/G-logo.png'
import { useAppSettings } from '../../hooks/AppSettingsContext'
import { waLink } from '../../lib/config'

// ── Kode generator: GNZ-{yyyyMMdd}-{0001} ──
function generateKode(date: Date, n: number) {
  const pad = (v: number, l: number) => String(v).padStart(l, '0')
  const tanggal = `${date.getFullYear()}${pad(date.getMonth() + 1, 2)}${pad(date.getDate(), 2)}`
  return `GNZ-${tanggal}-${pad(n, 4)}`
}

// ── Types ──
interface StudentData { namaSiswa: string; tempatLahir: string; tanggalLahir: string; agama: string; noWa: string; email: string; sekolahKelasJurusan: string }
interface ParentData { namaAyah: string; kontakAyah: string; pekerjaanAyah: string; namaIbu: string; kontakIbu: string; pekerjaanIbu: string }
interface GuidanceData { alamat: string; daftarUntukKelas: string; startDari: string; startSd: string; kelasDiGenza: string }
interface StatementData { namaPernyataan: string; jenjang: string; disetujui: boolean }

const STEP_LABELS = ['Data Siswa', 'Orang Tua', 'Bimbingan', 'Pernyataan']

const STATEMENT_POINTS = [
  'Dengan kesungguhan hati dan kesanggupan saya untuk tekun, konsisten berusaha sekeras-kerasnya mencapai cita-cita dan sukses tertinggi saya dengan menyiapkan diri saya untuk fokus dalam belajar di Genza Education.',
  'Mematuhi seluruh aturan dan tata tertib siswa yang berlaku di Genza Education.',
  'Bersedia mengikuti seluruh kegiatan belajar mengajar selama program dilaksanakan minimal 85% dari jumlah jam bimbingan yang tersedia.',
  'Bersedia mengikuti seluruh rangkaian G-Evaluation yang dilaksanakan oleh Genza Education untuk keperluan evaluasi belajar.',
  'Bersedia mengikuti remedial tes jika hasil yang dicapai dalam G-Evaluation di bawah kriteria minimal yang ditetapkan oleh Genza Education.',
  'Bersedia melakukan pembayaran bimbingan sampai dengan pelunasan sesuai jatuh tempo yang ditentukan, dengan rincian biaya sbb :',
]

// ── Shared input style ──
const inp = 'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all bg-white'
const lbl = 'block text-sm font-medium text-slate-600 mb-1'

export default function RegistrationFormPage() {
  const settings = useAppSettings()
  const [step, setStep] = useState(0)
  const [programs, setPrograms] = useState<string[]>([])
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<string | null>(null) // kode pendaftaran
  const [error, setError] = useState<string | null>(null)
  const [stepError, setStepError] = useState<string | null>(null)

  const [student, setStudent] = useState<StudentData>({ namaSiswa: '', tempatLahir: '', tanggalLahir: '', agama: '', noWa: '', email: '', sekolahKelasJurusan: '' })
  const [parent, setParent] = useState<ParentData>({ namaAyah: '', kontakAyah: '', pekerjaanAyah: '', namaIbu: '', kontakIbu: '', pekerjaanIbu: '' })
  const [guidance, setGuidance] = useState<GuidanceData>({ alamat: '', daftarUntukKelas: '', startDari: '', startSd: '', kelasDiGenza: '' })
  const [statement, setStatement] = useState<StatementData>({ namaPernyataan: '', jenjang: '', disetujui: false })

  // Load active programs from Firestore; fallback to static list
  useEffect(() => {
    getDocs(query(collection(db, 'program_bimbingan'), where('aktif', '==', true), orderBy('urutan'), orderBy('nama')))
      .then((snap) => {
        if (snap.empty) return setPrograms([])
        setPrograms(snap.docs.map((d) => d.data().nama as string))
      })
      .catch(() => setPrograms([]))
  }, [])

  const validate = (): boolean => {
    setStepError(null)
    if (step === 0) {
      if (!student.namaSiswa.trim()) return err('Nama siswa wajib diisi')
      if (!student.tempatLahir.trim()) return err('Tempat lahir wajib diisi')
      if (!student.tanggalLahir) return err('Tanggal lahir wajib diisi')
      if (!student.agama) return err('Agama wajib dipilih')
      if (!student.noWa.trim()) return err('No. WhatsApp wajib diisi')
      if (!student.sekolahKelasJurusan.trim()) return err('Sekolah/Kelas/Jurusan wajib diisi')
    }
    if (step === 1) {
      if (!parent.namaAyah.trim()) return err('Nama ayah wajib diisi')
      if (!parent.kontakAyah.trim()) return err('Kontak ayah wajib diisi')
      if (!parent.namaIbu.trim()) return err('Nama ibu wajib diisi')
      if (!parent.kontakIbu.trim()) return err('Kontak ibu wajib diisi')
    }
    if (step === 2) {
      if (!guidance.alamat.trim()) return err('Alamat wajib diisi')
      if (!guidance.daftarUntukKelas.trim()) return err('Daftar untuk kelas wajib diisi')
      if (!guidance.kelasDiGenza) return err('Pilih kelas di Genza')
      if (selectedPrograms.length === 0) return err('Pilih minimal 1 program bimbingan')
    }
    if (step === 3) {
      if (!statement.namaPernyataan.trim()) return err('Nama pernyataan wajib diisi')
      if (!statement.jenjang.trim()) return err('Jenjang wajib diisi')
      if (!statement.disetujui) return err('Harap setujui surat pernyataan')
    }
    return true
  }

  const err = (msg: string): false => { setStepError(msg); return false }

  const next = () => { if (validate()) setStep((s) => s + 1) }
  const prev = () => { setStepError(null); setStep((s) => s - 1) }

  const submit = async () => {
    if (!validate()) return
    setSubmitting(true)
    setError(null)
    try {
      const now = new Date()
      const tanggal = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
      const counterRef = doc(db, 'counters', 'registration_counter')
      const docRef = doc(collection(db, 'registrations'))
      let kode = ''

      await runTransaction(db, async (tx) => {
        const counterSnap = await tx.get(counterRef)
        let lastNumber = 0
        if (counterSnap.exists()) {
          const d = counterSnap.data()
          if (d.tanggal === tanggal) lastNumber = (d.last_number as number) ?? 0
        }
        lastNumber += 1
        kode = generateKode(now, lastNumber)
        tx.set(counterRef, { tanggal, last_number: lastNumber })
        tx.set(docRef, {
          kode_pendaftaran: kode,
          status: 'baru',
          petugas_cabang: '',
          pdf_document: '',
          student_data: {
            nama_siswa: student.namaSiswa.trim(),
            tempat_lahir: student.tempatLahir.trim(),
            tanggal_lahir: student.tanggalLahir ? new Date(student.tanggalLahir) : null,
            agama: student.agama,
            no_wa: student.noWa.trim(),
            email: student.email.trim(),
            sekolah_kelas_jurusan: student.sekolahKelasJurusan.trim(),
          },
          parent_data: {
            nama_ayah: parent.namaAyah.trim(),
            kontak_ayah: parent.kontakAyah.trim(),
            pekerjaan_ayah: parent.pekerjaanAyah.trim(),
            nama_ibu: parent.namaIbu.trim(),
            kontak_ibu: parent.kontakIbu.trim(),
            pekerjaan_ibu: parent.pekerjaanIbu.trim(),
          },
          guidance_data: {
            alamat: guidance.alamat.trim(),
            daftar_untuk_kelas: guidance.daftarUntukKelas.trim(),
            minat_kelas: '',
            start_bimbingan_dari: guidance.startDari ? new Date(guidance.startDari) : null,
            start_bimbingan_sd: guidance.startSd ? new Date(guidance.startSd) : null,
            kelas_di_genza: guidance.kelasDiGenza,
          },
          program_bimbingan: selectedPrograms,
          statement_data: {
            nama_pernyataan: statement.namaPernyataan.trim() || student.namaSiswa.trim(),
            jenjang: statement.jenjang.trim(),
            disetujui: true,
            waktu_disetujui: now,
          },
          payment_data: { biaya_bimbingan: 0, asf_pendaftaran: 0, installments: [] },
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        })
      })

      setSubmitted(kode)
    } catch (e) {
      console.error('Gagal mengirim pendaftaran:', e)
      setError('Gagal mengirim pendaftaran. Periksa koneksi lalu coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success screen ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Pendaftaran Berhasil!</h1>
          <p className="text-slate-500 mb-4">Simpan kode pendaftaran Anda:</p>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 mb-6">
            <p className="font-mono text-2xl font-bold text-blue-700 tracking-wider">{submitted}</p>
          </div>
           <p className="text-sm text-slate-500 mb-4">Pendaftaran tersimpan. Hubungi admin melalui WhatsApp untuk konfirmasi dengan menyertakan kode pendaftaran.</p>
           <a href={waLink(`Halo Genza, saya sudah mendaftar dengan kode ${submitted}. Mohon konfirmasi pendaftaran saya.`, settings.whatsappNumber)} target="_blank" rel="noopener" className="mb-3 inline-block w-full rounded-xl bg-emerald-600 py-3 font-bold text-white transition-colors hover:bg-emerald-700">Konfirmasi via WhatsApp</a>
          <a href="/" className="inline-block w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">Kembali ke Beranda</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#22539F] to-[#22539F] px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <img src={logoUrl} alt="Genza" className="w-10 h-10 rounded-xl object-cover" />
          <div>
            <p className="text-white font-bold text-sm">Genza Education</p>
            <p className="text-blue-200 text-xs">Formulir Pendaftaran Siswa Baru</p>
          </div>
          <a href="/" className="ml-auto text-blue-200 hover:text-white text-xs transition-colors">Beranda ↗</a>
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-1">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`flex items-center gap-1.5 ${i <= step ? 'text-blue-600' : 'text-slate-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i < step ? 'bg-blue-600 text-white' : i === step ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300' : 'bg-slate-100 text-slate-400'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:block whitespace-nowrap">{label}</span>
                </div>
                {i < STEP_LABELS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-blue-300' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {step === 0 && <Step0 data={student} onChange={setStudent} />}
          {step === 1 && <Step1 data={parent} onChange={setParent} />}
          {step === 2 && <Step2 data={guidance} programs={programs} selected={selectedPrograms} onChange={setGuidance} onProgramsChange={setSelectedPrograms} />}
          {step === 3 && <Step3 namaSiswa={student.namaSiswa} data={statement} onChange={setStatement} />}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] sticky bottom-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-2">
          {(stepError || error) && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-2 flex items-center gap-2 text-sm text-red-600">
              <span>⚠</span>
              <span>{stepError || error}</span>
            </div>
          )}
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={prev} className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                ← Sebelumnya
              </button>
            )}
            {step < 3 ? (
              <button onClick={next} className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-md shadow-blue-200">
                Selanjutnya →
              </button>
            ) : (
              <button onClick={submit} disabled={submitting || !statement.disetujui} aria-describedby={!statement.disetujui ? 'agreement-submit-hint' : undefined} className="flex-[2] py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transition-all text-sm shadow-md shadow-blue-200">
                {submitting ? 'Mengirim...' : '🎓 Kirim Pendaftaran'}
              </button>
            )}
          </div>
          {step === 3 && !statement.disetujui && <p id="agreement-submit-hint" className="text-center text-xs text-slate-600">Centang persetujuan di atas untuk mengaktifkan tombol kirim.</p>}
        </div>
      </div>
    </div>
  )
}

// ── Step 0: Data Siswa ──
function Step0({ data, onChange }: { data: StudentData; onChange: (d: StudentData) => void }) {
  const s = (patch: Partial<StudentData>) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-4">
      <SectionHeader icon="👤" title="Data Siswa" sub="Isi data calon siswa" />
      <Field label="Nama Lengkap Siswa *" value={data.namaSiswa} onChange={(v) => s({ namaSiswa: v })} placeholder="Nama sesuai KTP/Kartu Pelajar" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tempat Lahir *" value={data.tempatLahir} onChange={(v) => s({ tempatLahir: v })} placeholder="Kota" />
        <div>
          <label className={lbl}>Tanggal Lahir *</label>
          <input type="date" value={data.tanggalLahir} onChange={(e) => s({ tanggalLahir: e.target.value })} className={inp} max={new Date().toISOString().slice(0, 10)} />
        </div>
      </div>
      <div>
        <label className={lbl}>Agama *</label>
        <select value={data.agama} onChange={(e) => s({ agama: e.target.value })} className={inp}>
          <option value="">Pilih agama</option>
          {AGAMA_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <Field label="No. WhatsApp *" value={data.noWa} onChange={(v) => s({ noWa: v })} placeholder="08xx-xxxx-xxxx" type="tel" />
      <Field label="Email (opsional)" value={data.email} onChange={(v) => s({ email: v })} placeholder="nama@email.com" type="email" />
      <Field label="Sekolah / Kelas / Jurusan *" value={data.sekolahKelasJurusan} onChange={(v) => s({ sekolahKelasJurusan: v })} placeholder="SMA N 1 Pacitan / XII / IPA" />
    </div>
  )
}

// ── Step 1: Data Orang Tua ──
function Step1({ data, onChange }: { data: ParentData; onChange: (d: ParentData) => void }) {
  const s = (patch: Partial<ParentData>) => onChange({ ...data, ...patch })
  return (
    <div className="space-y-5">
      <SectionHeader icon="👨‍👩‍👧" title="Data Orang Tua / Wali" sub="Data orang tua / wali calon siswa" />
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-sm">
        <p className="font-semibold text-slate-700 text-sm">👨 Data Ayah</p>
        <Field label="Nama Ayah *" value={data.namaAyah} onChange={(v) => s({ namaAyah: v })} placeholder="Nama lengkap ayah" />
        <Field label="HP / WA / Email Ayah *" value={data.kontakAyah} onChange={(v) => s({ kontakAyah: v })} placeholder="08xx-xxxx-xxxx" type="tel" />
        <Field label="Pekerjaan Ayah (opsional)" value={data.pekerjaanAyah} onChange={(v) => s({ pekerjaanAyah: v })} placeholder="Pegawai Negeri / Swasta / dll" />
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-sm">
        <p className="font-semibold text-slate-700 text-sm">👩 Data Ibu</p>
        <Field label="Nama Ibu *" value={data.namaIbu} onChange={(v) => s({ namaIbu: v })} placeholder="Nama lengkap ibu" />
        <Field label="HP / WA / Email Ibu *" value={data.kontakIbu} onChange={(v) => s({ kontakIbu: v })} placeholder="08xx-xxxx-xxxx" type="tel" />
        <Field label="Pekerjaan Ibu (opsional)" value={data.pekerjaanIbu} onChange={(v) => s({ pekerjaanIbu: v })} placeholder="Ibu Rumah Tangga / dll" />
      </div>
    </div>
  )
}

// ── Step 2: Data Bimbingan ──
function Step2({ data, programs, selected, onChange, onProgramsChange }: {
  data: GuidanceData; programs: string[]; selected: string[]
  onChange: (d: GuidanceData) => void; onProgramsChange: (p: string[]) => void
}) {
  const s = (patch: Partial<GuidanceData>) => onChange({ ...data, ...patch })
  const toggleProgram = (p: string) => {
    onProgramsChange(selected.includes(p) ? selected.filter((x) => x !== p) : [...selected, p])
  }
  return (
    <div className="space-y-5">
      <SectionHeader icon="🎓" title="Data Bimbingan" sub="Data bimbingan & pilihan program" />
      <div>
        <label className={lbl}>Alamat Lengkap *</label>
        <textarea value={data.alamat} onChange={(e) => s({ alamat: e.target.value })} rows={2} className={inp} placeholder="Jl. ... Kec. ... Kab. ..." />
      </div>
      <Field label="Daftar untuk Kelas *" value={data.daftarUntukKelas} onChange={(v) => s({ daftarUntukKelas: v })} placeholder="Mis: Kelas 10 / XI / XII" />
      {/* Period */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">📅 Periode Bimbingan (opsional)</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Tanggal Mulai</label>
            <input type="date" value={data.startDari} onChange={(e) => s({ startDari: e.target.value })} className={inp} />
          </div>
          <div>
            <label className={lbl}>Tanggal Selesai</label>
            <input type="date" value={data.startSd} onChange={(e) => s({ startSd: e.target.value })} min={data.startDari} className={inp} />
          </div>
        </div>
      </div>

      {/* Kelas di Genza */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">🏫 Kelas di Genza *</p>
        <div className="flex flex-wrap gap-2">
          {KELAS_DI_GENZA.map((k) => (
            <button key={k} type="button" onClick={() => s({ kelasDiGenza: k })}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${data.kelasDiGenza === k ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}>
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Program bimbingan */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">📚 Program Bimbingan * (pilih min. 1)</p>
        <div className="space-y-2">
          {programs.map((p) => (
            <label key={p} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={selected.includes(p)} onChange={() => toggleProgram(p)}
                className="w-4 h-4 rounded accent-blue-600 flex-shrink-0" />
              <span className={`text-sm ${selected.includes(p) ? 'text-blue-700 font-semibold' : 'text-slate-700'}`}>{p}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Step 3: Surat Pernyataan ──
function Step3({ namaSiswa, data, onChange }: { namaSiswa: string; data: StatementData; onChange: (d: StatementData) => void }) {
  const s = (patch: Partial<StatementData>) => onChange({ ...data, ...patch })
  const displayName = data.namaPernyataan || namaSiswa || '{nama}'
  const displayJenjang = data.jenjang || '{jenjang}'
  return (
    <div className="space-y-5">
      <SectionHeader icon="📋" title="Surat Pernyataan" sub="Baca & setujui pernyataan siswa" />

      {/* Statement text */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-slate-700 space-y-3 leading-relaxed">
        <p>
          Dengan ini saya <strong className="text-blue-800">{displayName}</strong> siswa Genza Education, jenjang <strong className="text-blue-800">{displayJenjang}</strong> menyatakan;
        </p>
        <ol className="space-y-2">
          {STATEMENT_POINTS.map((point, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <span>{point}</span>
            </li>
          ))}
        </ol>
      </div>

      <Field label="Nama yang menyatakan *" value={data.namaPernyataan} onChange={(v) => s({ namaPernyataan: v })} placeholder={namaSiswa || 'Nama lengkap'} />
      <Field label="Jenjang *" value={data.jenjang} onChange={(v) => s({ jenjang: v })} placeholder="Mis: SMA / SMK / D3 / S1" />

      {/* Agreement checkbox */}
      <label className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${data.disetujui ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white hover:border-blue-200'}`}>
        <input type="checkbox" checked={data.disetujui} onChange={(e) => s({ disetujui: e.target.checked })}
          className="w-5 h-5 mt-0.5 accent-emerald-600 flex-shrink-0" />
        <span className={`text-sm font-semibold ${data.disetujui ? 'text-emerald-700' : 'text-slate-700'}`}>
          Saya menyetujui pernyataan di atas
        </span>
      </label>
    </div>
  )
}

// ── Shared components ──
function SectionHeader({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><span>{icon}</span>{title}</h2>
      <p className="text-sm text-slate-500">{sub}</p>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inp} />
    </div>
  )
}
