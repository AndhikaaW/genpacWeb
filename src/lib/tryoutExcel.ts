import * as XLSX from 'xlsx'

export interface TryOutImportRow {
  nisg: string
  nama_siswa: string
  jenjang: string
  sekolah: string
  mapel: string
  benar: number
  salah: number
  kosong: number
  nilai: number
  jumlah_soal: number
}

const aliases: Record<string, string[]> = {
  nisg: ['nisg'], nama_siswa: ['nama siswa', 'nama_siswa'], jenjang: ['jenjang', 'kelas'], sekolah: ['sekolah', 'nama sekolah'], mapel: ['mapel', 'mata pelajaran'],
  benar: ['benar'], salah: ['salah'], kosong: ['kosong'], nilai: ['total skor', 'nilai', 'score'],
}

const normalize = (value: unknown) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
const numberValue = (value: unknown) => {
  const number = Number(String(value ?? '').replace(',', '.'))
  return Number.isFinite(number) ? number : NaN
}

export function parseTryOutWorkbook(file: File, fallbackMapel = ''): Promise<TryOutImportRow[]> {
  return file.arrayBuffer().then((buffer) => {
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: false })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' })
    const headerIndex = rows.findIndex((row) => row.some((cell) => normalize(cell) === 'nisg'))
    if (headerIndex < 0) throw new Error('Header NISG tidak ditemukan.')
    const headers = rows[headerIndex].map(normalize)
    const column = (key: string) => headers.findIndex((header) => aliases[key].includes(header))
    const columns = Object.fromEntries(Object.keys(aliases).map((key) => [key, column(key)])) as Record<string, number>
    for (const key of ['nisg', 'nama_siswa', 'jenjang', 'sekolah', 'benar', 'salah', 'kosong', 'nilai']) {
      if (columns[key] < 0) throw new Error(`Kolom ${key} tidak ditemukan.`)
    }
    return rows.slice(headerIndex + 1).flatMap((row) => {
      const nisg = String(row[columns.nisg] ?? '').trim()
      if (!nisg || normalize(row[0]) === 'kunci') return []
      const result = { nisg, nama_siswa: String(row[columns.nama_siswa] ?? '').trim(), jenjang: String(row[columns.jenjang] ?? '').trim(), sekolah: String(row[columns.sekolah] ?? '').trim(), mapel: columns.mapel >= 0 ? String(row[columns.mapel] ?? '').trim() : fallbackMapel.trim(), benar: numberValue(row[columns.benar]), salah: numberValue(row[columns.salah]), kosong: numberValue(row[columns.kosong]), nilai: numberValue(row[columns.nilai]), jumlah_soal: 0 }
      result.jumlah_soal = result.benar + result.salah + result.kosong
      if (!result.nama_siswa || !result.mapel || Object.values(result).some((value) => typeof value === 'number' && !Number.isFinite(value))) return []
      return [result]
    })
  })
}
