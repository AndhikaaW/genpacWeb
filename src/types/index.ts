export interface Branch {
  id: string
  nama: string
  alamat: string
  whatsapp: string
  email: string
  logo: string
  jamOperasional: string
  rekening: Rekening[]
  lat?: number
  lng?: number
}

export interface Rekening {
  bank: string
  atasNama: string
  noRek: string
}

export interface Program {
  id: string
  nama: string
  jenis: 'reguler' | 'akselerasi' | 'olimpiade' | 'intensif'
  biaya: Biaya
  aktif: boolean
}

export interface Biaya {
  asf: number
  uangMuka: number
  angsuran: Angsuran[]
}

export interface Angsuran {
  label: string
  persen: number
}

export interface LandingContent {
  id: string
  tipe: 'hero' | 'testimoni' | 'galeri' | 'artikel' | 'faq'
  konten: Record<string, unknown>
  urutanTampil: number
}

export interface HeroContent {
  title: string
  deskripsi: string
  gambar: string
  ctaText: string
}

export interface TestimoniContent {
  nama: string
  asalSekolah: string
  program: string
  quote: string
  foto: string
  nilai?: string
}

export interface GaleriContent {
  judul: string
  gambar: string
  deskripsi: string
}

export interface FAQContent {
  pertanyaan: string
  jawaban: string
}


