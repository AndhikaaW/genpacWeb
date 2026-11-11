import { useEffect, useMemo, useState } from 'react'
import { Link } from '../AdminRouter'
import { useRegistrations } from '../useAdmin'
import { STATUS_LABELS, STATUS_COLORS, formatDateTime } from '../types'
import { Search, Users, Clock, CheckCircle2, TrendingUp } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { seedMasterData, type SeedResult } from '../utils/seedMasterData'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '../../firebase'
import type { Agenda } from './AgendaPage'

const ALL_STATUSES = ['', 'baru', 'diverifikasi', 'aktif', 'nonaktif']

export default function AdminDashboard() {
  const { items, loading } = useRegistrations()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [seeding, setSeeding] = useState(false)
  const [seedMessage, setSeedMessage] = useState<string | null>(null)
  const [agenda, setAgenda] = useState<Agenda[]>([])
  useEffect(() => onSnapshot(query(collection(db, 'agenda')), snapshot => setAgenda(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Agenda)).sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))), error => { console.error('Gagal memuat agenda:', error); setAgenda([]) }), [])
  const todayJakarta = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
  const upcomingAgenda = agenda.filter(a => a.date >= todayJakarta && a.status !== 'cancelled').slice(0, 5)

  const filtered = useMemo(() => items.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return r.studentData.namaSiswa.toLowerCase().includes(q) || r.kodePendaftaran.toLowerCase().includes(q)
    }
    return true
  }), [items, search, statusFilter])

  const stats = useMemo(() => ({
    total: items.length,
    baru: items.filter(r => r.status === 'baru').length,
    diverifikasi: items.filter(r => r.status === 'diverifikasi').length,
    aktif: items.filter(r => r.status === 'aktif').length,
  }), [items])

  const handleSeed = async () => {
    setSeeding(true)
    setSeedMessage(null)
    try {
      const result: SeedResult = await seedMasterData()
      const seeded = [
        result.jenjang ? `${result.jenjang} jenjang` : '',
        result.fasilitas ? `${result.fasilitas} fasilitas` : '',
        result.programs ? `${result.programs} program` : '',
      ].filter(Boolean)
      setSeedMessage(seeded.length ? `Data awal dibuat: ${seeded.join(', ')}.` : 'Data master sudah berisi. Tidak ada data yang ditimpa.')
    } catch (e) {
      setSeedMessage(`Seeder gagal: ${e instanceof Error ? e.message : 'Kesalahan tidak diketahui'}`)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Data Pendaftar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kelola semua pendaftaran siswa baru</p>
        </div>
      </div>
      {seedMessage && <p role="status" className="text-sm text-slate-600 mb-4">{seedMessage}</p>}
      <Card className="mb-6 rounded-xl shadow-none"><CardContent className="p-4"><div className="mb-3 flex items-center justify-between"><div><h2 className="font-semibold text-slate-800">Agenda Mendatang</h2><p className="text-xs text-slate-500">Zona waktu Asia/Jakarta</p></div><Link to="/admin/agenda" className="text-sm font-semibold text-blue-600 hover:underline">Kelola Agenda</Link></div>{upcomingAgenda.length ? <div className="grid gap-2 md:grid-cols-2">{upcomingAgenda.map(a => <Link key={a.id} to="/admin/agenda" className="rounded-lg border p-3 hover:bg-slate-50"><p className="font-medium text-slate-800">{a.title}</p><p className="mt-1 text-xs text-slate-500">{a.date} · {a.startTime} - {a.endTime}{a.location ? ` · ${a.location}` : ''}</p></Link>)}</div> : <p className="py-4 text-sm text-slate-500">Belum ada agenda mendatang.</p>}</CardContent></Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Pendaftar', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pendaftaran Baru', value: stats.baru, icon: Clock, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: 'Diverifikasi', value: stats.diverifikasi, icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Siswa Aktif', value: stats.aktif, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="rounded-xl shadow-none">
              <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${s.color}`} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-slate-500 leading-tight">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau kode pendaftaran..."
            className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white"
            aria-label="Cari pendaftar"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white"
          aria-label="Filter status"
        >
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{s ? STATUS_LABELS[s] : 'Semua Status'}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" aria-label="Memuat data" />
            <p className="text-sm text-slate-400">Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" aria-hidden="true" />
            <p className="text-slate-400 text-sm">Tidak ada data pendaftar</p>
          </div>
        ) : (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kode</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nama Siswa</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Kelas</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Daftar</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 font-medium">{r.kodePendaftaran}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{r.studentData.namaSiswa}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{r.guidanceData.kelasDiGenza || '-'}</td>
                    <td className="px-4 py-3">
              <Badge variant="secondary" className={`h-auto rounded-md px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[r.status]}`}>
                {STATUS_LABELS[r.status]}
              </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{formatDateTime(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/pendaftar/${r.id}`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3 p-3 md:hidden">
            {filtered.map((r) => (
              <article key={r.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-blue-700">{r.kodePendaftaran}</p>
                    <h2 className="mt-1 font-semibold text-slate-800">{r.studentData.namaSiswa}</h2>
                  </div>
                  <span className={`inline-flex flex-shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${STATUS_COLORS[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-2 border-t border-slate-100 py-3 text-xs">
                  <div><dt className="text-slate-500">Kelas</dt><dd className="mt-0.5 font-medium text-slate-800">{r.guidanceData.kelasDiGenza || '-'}</dd></div>
                  <div><dt className="text-slate-500">Tanggal daftar</dt><dd className="mt-0.5 font-medium text-slate-800">{formatDateTime(r.createdAt)}</dd></div>
                </dl>
                <Link to={`/admin/pendaftar/${r.id}`} className="flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">
                  Lihat detail
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-slate-400 mt-2 px-1">Menampilkan {filtered.length} dari {items.length} pendaftar</p>
      )}
    </div>
  )
}
