import { useState } from 'react'
import { useTutors, type TutorItem } from '../hooks/useTutors'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Skeleton } from './ui/skeleton'

export default function Tutors() {
  const { items, loading, error } = useTutors()
  const [selectedTutor, setSelectedTutor] = useState<TutorItem | null>(null)

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" aria-busy="true">
        <div className="mb-12 space-y-3"><Skeleton className="h-10 w-56" /><Skeleton className="h-5 w-72" /></div>
        <div className="flex gap-6 overflow-hidden pb-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="w-64 flex-shrink-0 overflow-hidden rounded-[20px] border border-slate-100 bg-white"><Skeleton className="h-48 rounded-none" /><div className="space-y-2 p-4"><Skeleton className="h-5 w-36" /><Skeleton className="h-4 w-28" /></div></div>)}</div>
        <span className="sr-only">Memuat tutor...</span>
      </div>
    )
  }
  if (error) return <div className="container mx-auto px-4 text-center text-slate-700" role="status">Daftar tutor belum dapat dimuat. Silakan coba lagi nanti.</div>
  if (items.length === 0) return null

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#22539F]">Belajar bersama ahlinya</p>
          <h2 className="text-3xl font-bold text-slate-800 sm:text-4xl">Tim Tutor</h2>
          <p className="mt-3 max-w-lg text-lg text-slate-600">Terseleksi ketat, terlatih intensif, dan siap mendampingi perjalanan belajarmu.</p>
        </div>
        <p className="max-w-xs border-l-4 border-[#F6CC46] pl-4 text-sm leading-relaxed text-slate-600">Kenali tutor yang akan membantu kamu belajar lebih terarah.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((tutor) => (
          <article
            key={tutor.id}
            className="group relative min-w-0 overflow-hidden rounded-2xl border border-blue-100/80 bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_16px_36px_rgba(34,83,159,0.14)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[#E8EFFB]">
              {tutor.fotoBa64 ? (
                <button type="button" onClick={() => setSelectedTutor(tutor)} aria-label={`Perbesar foto tutor ${tutor.nama}`} className="absolute inset-0 h-full w-full overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#F6CC46]">
                  <img src={tutor.fotoBa64} alt={`Foto ${tutor.nama}`} width={480} height={360} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
                </button>
              ) : (
                <div className="flex h-full items-center justify-center bg-[#22539F] text-6xl font-bold text-white" aria-label={`Inisial ${tutor.nama.charAt(0)}`}>
                  {tutor.nama.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#163A70]/35 to-transparent" aria-hidden="true" />
              <span className="pointer-events-none absolute bottom-3 left-4 rounded-md bg-[#F6CC46] px-3 py-1 text-xs font-bold text-[#163A70]">Tutor Genza</span>
            </div>
            <div className="relative px-5 pb-5 pt-4">
              <span className="absolute -top-3 right-5 h-1 w-10 rounded-full bg-[#F6CC46]" aria-hidden="true" />
              <h3 className="text-lg font-bold leading-snug text-slate-800">{tutor.nama}</h3>
              <p className="mt-1 text-sm font-medium text-[#22539F]">{tutor.mapel}</p>
              <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-600">
                Pendamping belajar
              </div>
            </div>
          </article>
        ))}
      </div>
      <Dialog open={!!selectedTutor} onOpenChange={(open) => { if (!open) setSelectedTutor(null) }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedTutor?.nama}</DialogTitle>
            <DialogDescription>{selectedTutor?.mapel}</DialogDescription>
          </DialogHeader>
          {selectedTutor?.fotoBa64 && <img src={selectedTutor.fotoBa64} alt={`Foto ${selectedTutor.nama}`} width={1200} height={900} className="max-h-[70vh] w-full rounded-lg bg-slate-100 object-contain" />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
