import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../firebase'

// Initial catalog based on the existing Genza Flutter seed data. Each
// collection is only seeded when empty, so later admin edits are preserved.
const JENJANG = [
  { title: 'SD / MI', description: 'Penguatan dasar dan kebiasaan belajar yang baik sejak dini.', subjects: ['Matematika', 'IPA', 'B. Indonesia', 'B. Inggris', 'PPKn'], facilities: ['Tes Diagnostik', 'G-Book', 'G-Exercise', 'G-Report'], ikon_name: 'book-open' },
  { title: 'SMP / MTs', description: 'Pendalaman mapel inti, pendampingan personal, dan persiapan ujian sekolah.', subjects: ['Matematika', 'IPA', 'IPS', 'B. Indonesia', 'B. Inggris', 'PPKn'], facilities: ['Tes Diagnostik', 'G-Assessment', 'G-Exercise', 'G-Report'], ikon_name: 'graduation-cap' },
  { title: 'SMA / MA', description: 'Pendampingan mapel sekolah, persiapan ujian, dan bimbingan masuk PTN.', subjects: ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'B. Indonesia', 'B. Inggris'], facilities: ['Tes Diagnostik', 'G-Simulation', 'G-Consult', 'G-Report'], ikon_name: 'book-heart' },
  { title: 'UTBK-SNBT', description: 'Latihan soal intensif, tryout, dan strategi masuk PTN pilihan.', subjects: ['Matematika Dasar', 'Matematika Lanjut', 'B. Indonesia', 'B. Inggris', 'IPA', 'IPS'], facilities: ['Tes Diagnostik', 'G-Simulation', 'G-Evaluation', 'G-Consult'], ikon_name: 'user-check' },
  { title: 'Sekdin & TNI/Polri', description: 'Fokus SKD dan persiapan seleksi sekolah kedinasan.', subjects: ['Logika', 'Kemampuan Dasar', 'Pengetahuan Umum'], facilities: ['Tes Diagnostik', 'G-Simulation', 'G-Exercise', 'G-Consult'], ikon_name: 'laptop' },
  { title: 'G-Advanced (Online)', description: 'Kelas online UTBK-SNBT dan SKD Sekdin/TNI/Polri dari tim HQ Genza.', subjects: ['Matematika', 'B. Indonesia', 'B. Inggris', 'IPA', 'IPS', 'Logika'], facilities: ['G-Simulation', 'G-Assessment', 'G-Evaluation', 'G-Report'], ikon_name: 'monitor' },
]

const FASILITAS = [
  ['Tes Diagnostik', '', 'zap'],
  ['G-Assessment', '', 'activity'],
  ['G-Consult', '', 'message-square'],
  ['G-Book', '', 'book'],
  ['G-Exercise', '', 'dumbbell'],
  ['G-Clinic', '', 'heart'],
  ['G-Simulation', '', 'monitor-play'],
  ['G-Evaluation', '', 'bar-chart-3'],
  ['G-Report', '', 'clipboard-list'],
]

const PROGRAMS = [
  'Reguler 2025/26',
  'Reguler SIAP TKA',
  'Reguler 2026/27',
  'Intensif TKA',
  'Reguler 3 Semester',
  'UTBK/SNBT',
  'Intensif UTBK/SNBT',
]

export interface SeedResult {
  jenjang: number
  fasilitas: number
  programs: number
}

export async function seedMasterData(): Promise<SeedResult> {
  const definitions = [
    { name: 'jenjang_program', rows: JENJANG.map((row, urutan) => ({ ...row, urutan, aktif: true })) },
    { name: 'fasilitas_gsystem', rows: FASILITAS.map(([nama, deskripsi, ikon_name], urutan) => ({ nama, deskripsi, ikon_name, urutan, aktif: true })) },
    { name: 'program_bimbingan', rows: PROGRAMS.map((nama, urutan) => ({ nama, urutan, aktif: true })) },
  ] as const

  const result: SeedResult = { jenjang: 0, fasilitas: 0, programs: 0 }
  for (const definition of definitions) {
    const existing = await getDocs(collection(db, definition.name))
    if (!existing.empty) continue

    const batch = writeBatch(db)
    for (const row of definition.rows) {
      batch.set(doc(collection(db, definition.name)), {
        ...row,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
    }
    await batch.commit()
    if (definition.name === 'jenjang_program') result.jenjang = definition.rows.length
    if (definition.name === 'fasilitas_gsystem') result.fasilitas = definition.rows.length
    if (definition.name === 'program_bimbingan') result.programs = definition.rows.length
  }
  return result
}
