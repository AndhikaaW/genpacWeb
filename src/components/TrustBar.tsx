import { Award, Users, Star, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'

export default function TrustBar() {
  const stats = [
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      label: '170+ Center di Indonesia',
      value: '170+',
    },
    {
      icon: <Award className="w-8 h-8 text-yellow-400" />,
      label: 'Berdiri Sejak 2023',
      value: '2023',
    },
    {
      icon: <Star className="w-8 h-8 text-blue-500" />,
      label: 'Penghargaan Inovasi 2024',
      value: 'Top Innovation',
    },
  ]

  const marqueeItems = ['SD/MI · SMP/MTs · SMA/MA · UTBK · Kedinasan · Sekolah Din']

  return (
    <section className="bg-white py-12 border-b border-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-4 p-6 rounded-2xl transition-all duration-300 hover:shadow-card',
                index === 1 ? 'bg-yellow-50' : 'bg-slate-50'
              )}
            >
              <div className="flex-shrink-0">
                {stat.icon}
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-[#22539F] mb-1 font-sans">
                  {stat.value}
                </div>
                <p className="text-slate-600 font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Marquee */}
        <div className="relative overflow-hidden py-4">
          <div className="flex gap-8 animate-marquee whitespace-nowrap">
            {marqueeItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-slate-500 text-sm font-medium"
              >
                {item}
                <ChevronRight className="w-4 h-4" />
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {marqueeItems.map((item, index) => (
              <div
                key={`dup-${index}`}
                className="flex items-center gap-2 text-slate-500 text-sm font-medium"
              >
                {item}
                <ChevronRight className="w-4 h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}