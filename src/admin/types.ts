// Types shared between landing and admin
export interface RegistrationModel {
  id: string
  kodePendaftaran: string
  status: 'baru' | 'diverifikasi' | 'aktif' | 'nonaktif'
  petugasCabang: string
  createdAt: Date
  updatedAt: Date
  studentData: StudentData
  parentData: ParentData
  guidanceData: GuidanceData
  programBimbingan: string[]
  statementData: StatementData
  paymentData: PaymentData
  pdfDocument: string
}

export interface StudentData {
  namaSiswa: string
  tempatLahir: string
  tanggalLahir: Date | null
  agama: string
  noWa: string
  email: string
  sekolahKelasJurusan: string
}

export interface ParentData {
  namaAyah: string
  kontakAyah: string
  pekerjaanAyah: string
  namaIbu: string
  kontakIbu: string
  pekerjaanIbu: string
}

export interface GuidanceData {
  alamat: string
  daftarUntukKelas: string
  minatKelas: string
  startBimbinganDari: Date | null
  startBimbinganSd: Date | null
  kelasDiGenza: string
}

export interface StatementData {
  namaPernyataan: string
  jenjang: string
  disetujui: boolean
  waktuDisetujui: Date | null
}

export interface Installment {
  label: string
  persentase: number
  nominal: number
  tanggalJatuhTempo: Date | null
  sudahBayar: boolean
  tanggalBayar: Date | null
}

export interface PaymentData {
  biayaBimbingan: number
  asfPendaftaran: number
  installments: Installment[]
}

export const STATUS_LABELS: Record<string, string> = {
  baru: 'Baru',
  diverifikasi: 'Diverifikasi',
  aktif: 'Aktif',
  nonaktif: 'Nonaktif',
}

export const STATUS_COLORS: Record<string, string> = {
  baru: 'bg-blue-100 text-blue-700',
  diverifikasi: 'bg-yellow-100 text-yellow-700',
  aktif: 'bg-green-100 text-green-700',
  nonaktif: 'bg-slate-100 text-slate-500',
}

export const KELAS_DI_GENZA = ['Reguler', 'Akselerasi', 'Olimpiade']
export const AGAMA_OPTIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya']
export const PROGRAM_OPTIONS = [
  'Reguler 2025/26', 'Reguler 2026/27', 'Reguler 3 Semester',
  'Intensif UTBK/SNBT', 'Intensif TKA', 'Reguler SIAP TKA', 'UTBK/SNBT',
]

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export function formatDate(d: Date | null | undefined): string {
  if (!d) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
}

export function formatDateTime(d: Date | null | undefined): string {
  if (!d) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d)
}

export function toWaLink(phone: string): string {
  let clean = phone.replace(/[\s\-+]/g, '')
  if (clean.startsWith('0')) clean = '62' + clean.slice(1)
  else if (!clean.startsWith('62')) clean = '62' + clean
  return `https://api.whatsapp.com/send?phone=${clean}`
}

// Convert Firestore doc data → RegistrationModel
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registrationFromDoc(id: string, data: any): RegistrationModel {
  const ts = (v: unknown) => v && typeof (v as { toDate?: () => Date }).toDate === 'function' ? (v as { toDate: () => Date }).toDate() : v instanceof Date ? v : null
  const installments: Installment[] = (data.payment_data?.installments ?? []).map((i: Record<string, unknown>) => ({
    label: i.label as string ?? '',
    persentase: (i.persentase as number) ?? 0,
    nominal: (i.nominal as number) ?? 0,
    tanggalJatuhTempo: ts(i.tanggal_jatuh_tempo),
    sudahBayar: (i.sudah_bayar as boolean) ?? false,
    tanggalBayar: ts(i.tanggal_bayar),
  }))
  return {
    id,
    kodePendaftaran: data.kode_pendaftaran ?? '',
    status: data.status ?? 'baru',
    petugasCabang: data.petugas_cabang ?? '',
    createdAt: ts(data.created_at) ?? new Date(),
    updatedAt: ts(data.updated_at) ?? new Date(),
    studentData: {
      namaSiswa: data.student_data?.nama_siswa ?? '',
      tempatLahir: data.student_data?.tempat_lahir ?? '',
      tanggalLahir: ts(data.student_data?.tanggal_lahir),
      agama: data.student_data?.agama ?? '',
      noWa: data.student_data?.no_wa ?? '',
      email: data.student_data?.email ?? '',
      sekolahKelasJurusan: data.student_data?.sekolah_kelas_jurusan ?? '',
    },
    parentData: {
      namaAyah: data.parent_data?.nama_ayah ?? '',
      kontakAyah: data.parent_data?.kontak_ayah ?? '',
      pekerjaanAyah: data.parent_data?.pekerjaan_ayah ?? '',
      namaIbu: data.parent_data?.nama_ibu ?? '',
      kontakIbu: data.parent_data?.kontak_ibu ?? '',
      pekerjaanIbu: data.parent_data?.pekerjaan_ibu ?? '',
    },
    guidanceData: {
      alamat: data.guidance_data?.alamat ?? '',
      daftarUntukKelas: data.guidance_data?.daftar_untuk_kelas ?? '',
      minatKelas: data.guidance_data?.minat_kelas ?? '',
      startBimbinganDari: ts(data.guidance_data?.start_bimbingan_dari),
      startBimbinganSd: ts(data.guidance_data?.start_bimbingan_sd),
      kelasDiGenza: data.guidance_data?.kelas_di_genza ?? '',
    },
    statementData: {
      namaPernyataan: data.statement_data?.nama_pernyataan ?? '',
      jenjang: data.statement_data?.jenjang ?? '',
      disetujui: data.statement_data?.disetujui ?? false,
      waktuDisetujui: ts(data.statement_data?.waktu_disetujui),
    },
    programBimbingan: Array.isArray(data.program_bimbingan) ? data.program_bimbingan : [],
    paymentData: {
      biayaBimbingan: data.payment_data?.biaya_bimbingan ?? 0,
      asfPendaftaran: data.payment_data?.asf_pendaftaran ?? 0,
      installments,
    },
    pdfDocument: data.pdf_document ?? '',
  }
}
