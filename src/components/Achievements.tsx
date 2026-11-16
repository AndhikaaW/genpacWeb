import { useState } from 'react'
import { Award } from 'lucide-react'
import { cn } from '../lib/utils'
import { usePrestasi, type PrestasiItem } from '../hooks/usePrestasi'
import ResponsiveCarousel from './ResponsiveCarousel'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'

const awards = [
  {
    title: 'Top Innovation Choice Award 2024',
    description: 'Penghargaan untuk inovasi GLMS (Genza Learning Management System) — 2024.',
  },
  {
    title: 'Millennials Choice in Education Programme Award 2024',
    description: 'Penghargaan untuk program pendidikan Genza Education — 2024.',
  },
]

export default function Achievements() {
  const { items: students, loading, error } = usePrestasi()
  const [selectedStudent, setSelectedStudent] = useState<PrestasiItem | null>(null)

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
          Prestasi Genza Education
        </h2>
        <p className="text-blue-200 max-w-xl mx-auto">Diakui secara nasional. Dipercaya oleh ribuan siswa.</p>
      </div>

      {/* Award plaques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {awards.map((award, index) => (
          <div
            key={index}
            className={cn(
              'relative overflow-hidden rounded-[20px] p-8 group hover:scale-[1.02] transition-all duration-300',
              index === 0 ? 'bg-yellow-400' : 'bg-[#3173B8] border border-blue-400/30'
            )}
          >
            {/* Shine sweep on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" aria-hidden="true" />
            </div>

            <div className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center mb-6',
              index === 0 ? 'bg-[#22539F]' : 'bg-yellow-400'
            )}>
              <Award className={cn('w-7 h-7', index === 0 ? 'text-yellow-400' : 'text-[#22539F]')} aria-hidden="true" />
            </div>
            <h3 className={cn('text-xl font-bold mb-3', index === 0 ? 'text-[#22539F]' : 'text-white')}>
              {award.title}
            </h3>
            <p className={cn('text-sm leading-relaxed', index === 0 ? 'text-[#22539F]/70' : 'text-blue-200')}>
              {award.description}
            </p>
          </div>
        ))}
      </div>

      {!loading && !error && students.length > 0 && (
        <div className="mt-16">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div><h3 className="text-2xl font-bold text-white sm:text-3xl">Prestasi Siswa Pacitan</h3><p className="mt-2 text-sm text-blue-100">Pencapaian siswa Genza yang telah dikonfirmasi.</p></div>
          </div>
          <ResponsiveCarousel count={students.length} label="Prestasi siswa" gridClassName="md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <article key={student.id} className="w-[82vw] max-w-[340px] flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-white/20 bg-white text-slate-800 md:w-auto md:max-w-none md:flex-shrink">
                <button type="button" onClick={() => setSelectedStudent(student)} aria-label={`Perbesar foto prestasi ${student.nama}`} className="block w-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-yellow-400">
                  <img src={student.fotoBase64} alt={`Foto ${student.nama}`} width={480} height={360} loading="lazy" className="aspect-[4/3] w-full bg-blue-900/20 object-cover transition-transform duration-300 hover:scale-[1.03]" />
                </button>
                <div className="p-5"><p className="text-xs font-bold uppercase tracking-wide text-amber-700">{student.prestasi}</p><h4 className="mt-2 text-lg font-bold text-slate-900">{student.nama}</h4>{student.sekolah && <p className="mt-1 text-sm text-slate-600">{student.sekolah}</p>}{student.keterangan && <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-700">{student.keterangan}</p>}</div>
              </article>
            ))}
          </ResponsiveCarousel>
        </div>
      )}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => { if (!open) setSelectedStudent(null) }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedStudent?.nama}</DialogTitle>
            <DialogDescription>{selectedStudent?.prestasi}{selectedStudent?.sekolah ? ` · ${selectedStudent.sekolah}` : ''}</DialogDescription>
          </DialogHeader>
          {selectedStudent && <img src={selectedStudent.fotoBase64} alt={`Foto prestasi ${selectedStudent.nama}`} width={1600} height={1200} className="max-h-[72vh] w-full rounded-lg bg-slate-100 object-contain" />}
          {selectedStudent?.keterangan && <p className="text-sm leading-relaxed text-slate-600">{selectedStudent.keterangan}</p>}
        </DialogContent>
      </Dialog>
    </div>
  )
}
