import { useEffect, useState } from 'react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { CalendarDays, Users } from 'lucide-react'
import { db } from '../../firebase'
import { Link } from '../AdminRouter'
import { Card, CardContent } from '../../components/ui/card'
import type { Agenda } from './AgendaPage'
import { useRegistrations } from '../useAdmin'

export default function DashboardPage() {
  const { items } = useRegistrations()
  const [agenda, setAgenda] = useState<Agenda[]>([])
  useEffect(() => onSnapshot(query(collection(db, 'agenda')), snapshot => setAgenda(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Agenda)).sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))), () => setAgenda([])), [])
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
  const upcoming = agenda.filter(a => a.date >= today && a.status !== 'cancelled').slice(0, 5)
  return <div className="mx-auto max-w-screen-xl p-4 md:p-6"><div className="mb-6"><h1 className="text-xl font-bold text-slate-800">Dashboard</h1><p className="text-sm text-slate-500">Ringkasan operasional Genza Education.</p></div><div className="mb-6 grid gap-3 sm:grid-cols-2"><Card className="rounded-xl shadow-none"><CardContent className="flex items-center gap-3 p-4"><Users className="h-6 w-6 text-blue-600" /><div><p className="text-xs text-slate-500">Total Pendaftar</p><p className="text-2xl font-bold text-slate-800">{items.length}</p></div></CardContent></Card><Card className="rounded-xl shadow-none"><CardContent className="flex items-center gap-3 p-4"><CalendarDays className="h-6 w-6 text-blue-600" /><div><p className="text-xs text-slate-500">Agenda Mendatang</p><p className="text-2xl font-bold text-slate-800">{upcoming.length}</p></div></CardContent></Card></div><Card className="rounded-xl shadow-none"><CardContent className="p-4"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-slate-800">Agenda Mendatang</h2><p className="text-xs text-slate-500">Zona waktu Asia/Jakarta</p></div><Link to="/admin/agenda" className="text-sm font-semibold text-blue-600 hover:underline">Kelola Agenda</Link></div>{upcoming.length ? <div className="grid gap-2 md:grid-cols-2">{upcoming.map(a => <Link key={a.id} to="/admin/agenda" className="rounded-lg border p-3 hover:bg-slate-50"><p className="font-medium text-slate-800">{a.title}</p><p className="mt-1 text-xs text-slate-500">{a.date} · {a.startTime} - {a.endTime}{a.location ? ` · ${a.location}` : ''}</p></Link>)}</div> : <p className="py-6 text-sm text-slate-500">Belum ada agenda mendatang.</p>}</CardContent></Card></div>
}
