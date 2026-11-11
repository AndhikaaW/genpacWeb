import { useTutors } from '../hooks/useTutors'
import { Skeleton } from './ui/skeleton'

export default function Tutors() {
  const { items, loading } = useTutors()

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" aria-busy="true">
        <div className="mb-12 space-y-3"><Skeleton className="h-10 w-56" /><Skeleton className="h-5 w-72" /></div>
        <div className="flex gap-6 overflow-hidden pb-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="w-64 flex-shrink-0 overflow-hidden rounded-[20px] border border-slate-100 bg-white"><Skeleton className="h-48 rounded-none" /><div className="space-y-2 p-4"><Skeleton className="h-5 w-36" /><Skeleton className="h-4 w-28" /></div></div>)}</div>
        <span className="sr-only">Memuat tutor...</span>
      </div>
    )
  }
  if (items.length === 0) return null

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Tim Tutor</h2>
        <p className="text-lg text-slate-500">Terseleksi ketat, terlatih intensif.</p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
        {items.map((tutor) => (
          <div
            key={tutor.id}
            className="snap-start flex-shrink-0 w-64 bg-white rounded-[20px] overflow-hidden border border-slate-100 shadow-card hover:shadow-cardHover transition-all duration-300 group"
          >
            <div className="h-48 bg-gradient-to-br from-[#F4F6FE] to-blue-100 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                {tutor.fotoBa64 ? (
                  <img
                    src={tutor.fotoBa64}
                    alt={tutor.nama}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-[#22539F] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {tutor.nama.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#22539F] to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <p className="text-white font-bold text-sm">{tutor.nama}</p>
                <p className="text-blue-200 text-xs">{tutor.mapel}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
