import { Award } from 'lucide-react'
import { SITE_CONFIG } from '../lib/config'
import { cn } from '../lib/utils'

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
  const hasTestimonials = (SITE_CONFIG.testimonials as Array<{name: string, role: string, quote: string}>).length > 0

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

      {/* Testimonials as WhatsApp-style bubbles */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-white mb-6 text-center">Kata Siswa</h3>

        {hasTestimonials ? (
          <div className="space-y-4">
            {(SITE_CONFIG.testimonials as Array<{name: string, role: string, quote: string}>).map((t, index) => (
              <div
                key={index}
                className={cn(
                  'flex',
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                )}
              >
                <div className={cn(
                  'max-w-xs rounded-2xl px-5 py-4',
                  index % 2 === 0
                    ? 'bg-white rounded-tl-sm'
                    : 'bg-yellow-400 rounded-tr-sm'
                )}>
                  <p className={cn('text-sm leading-relaxed mb-2', index % 2 === 0 ? 'text-slate-700' : 'text-[#22539F]')}>
                    {t.quote}
                  </p>
                  <p className={cn('text-xs font-semibold', index % 2 === 0 ? 'text-slate-500' : 'text-[#22539F]/70')}>
                    {t.name} · {t.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-tl-sm px-5 py-4 max-w-xs">
              <p className="text-sm text-slate-500 italic">Kisah sukses siswa Genza Pacitan segera hadir.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
