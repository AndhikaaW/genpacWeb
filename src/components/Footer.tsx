import { waLink } from '../lib/config'
import { ExternalLink, ArrowRight } from 'lucide-react'
import { useAppSettings, useAppSettingsLoading } from '../hooks/AppSettingsContext'
import { Skeleton } from './ui/skeleton'

export default function Footer() {
  const settings = useAppSettings()
  const settingsLoading = useAppSettingsLoading()

  if (settingsLoading) {
    return (
      <footer aria-busy="true" className="bg-[#22539F] px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-3"><div className="space-y-3"><Skeleton className="h-8 w-40 bg-white/20" /><Skeleton className="h-4 w-56 bg-white/20" /></div>{Array.from({ length: 2 }).map((_, index) => <div key={index} className="space-y-3">{Array.from({ length: 4 }).map((__, line) => <Skeleton key={line} className="h-4 w-32 bg-white/20" />)}</div>)}</div>
          <span className="sr-only">Memuat informasi kontak...</span>
        </div>
      </footer>
    )
  }
  return (
    <footer className="relative overflow-hidden">
      {/* CTA closing section */}
      {/* <div className="bg-gradient-to-b from-[#22539F] to-[#22539F] py-20 px-4 text-center relative">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(#F6CC46 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          aria-hidden="true"
        />
        <h2 className="relative z-10 text-3xl sm:text-5xl font-bold text-white mb-6 leading-tight">
          Yuk, naik level bareng<br />
          <span className="text-yellow-400">Genza Pacitan!</span>
        </h2>
        <p className="relative z-10 text-blue-200 text-lg mb-8 max-w-md mx-auto">
          Mulai dengan Tes Diagnostik gratis. Tanpa komitmen dulu.
        </p>
        <a
          href={waLink(`Halo Genza ${settings.branch}, saya ingin mulai belajar bersama Genza!`, settings.whatsappNumber)}
          target="_blank"
          rel="noopener"
          className="relative z-10 inline-flex items-center gap-3 px-8 py-4 bg-yellow-400 text-[#22539F] font-bold rounded-full text-lg hover:bg-yellow-400/90 transition-all hover:shadow-[0_0_40px_rgba(246,204,70,0.4)] active:scale-95 cursor-pointer"
        >
          Daftar via WhatsApp
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </a>
      </div> */}

      {/* Footer nav */}
      <div className="bg-[#22539F] py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-10 justify-between mb-10">
            {/* Brand */}
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-[10px] flex items-center justify-center">
                  <span className="text-[#22539F] font-bold text-lg">G</span>
                </div>
                <span className="text-white font-bold text-lg">genza {settings.branch.toUpperCase()}</span>
              </div>
              <p className="text-blue-200 text-sm leading-relaxed mb-4">
                Bimbel yang Aku Banget di Pacitan. Membangun generasi cerdas dan berprestasi.
              </p>
              <a
                href={settings.hqWebsite}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 text-blue-300 hover:text-white text-sm transition-colors cursor-pointer"
              >
                genzaeducation.com
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-10">
              <div>
                <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Program</h3>
                <ul className="space-y-2.5">
                  {['SD/MI', 'SMP/MTs', 'SMA/MA', 'UTBK-SNBT', 'Sekdin & TNI/Polri', 'G-Advanced'].map((item) => (
                    <li key={item}>
                      <a href="#program" className="text-blue-200 hover:text-white text-sm transition-colors cursor-pointer">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Halaman</h3>
                <ul className="space-y-2.5">
                  <li><a href="#tentang" className="text-blue-200 hover:text-white text-sm transition-colors cursor-pointer">Tentang</a></li>
                  <li><a href="#fasilitas" className="text-blue-200 hover:text-white text-sm transition-colors cursor-pointer">Fasilitas</a></li>
                  <li><a href="#kenya-genza" className="text-blue-200 hover:text-white text-sm transition-colors cursor-pointer">Keunggulan</a></li>
                  <li><a href="#galeri" className="text-blue-200 hover:text-white text-sm transition-colors cursor-pointer">Galeri</a></li>
                  <li><a href="#faq" className="text-blue-200 hover:text-white text-sm transition-colors cursor-pointer">FAQ</a></li>
                  <li><a href="#lokasi" className="text-blue-200 hover:text-white text-sm transition-colors cursor-pointer">Lokasi</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Kontak</h3>
                <ul className="space-y-2.5">
                  <li><a href={waLink(undefined, settings.whatsappNumber)} target="_blank" rel="noopener" className="text-blue-200 hover:text-white text-sm transition-colors cursor-pointer">WhatsApp</a></li>
                  {settings.instagram && <li><a href={settings.instagram} target="_blank" rel="noopener" className="text-blue-200 hover:text-white text-sm transition-colors cursor-pointer">Instagram</a></li>}
                </ul>
                <p className="text-blue-300/60 text-xs mt-4 max-w-[180px] leading-relaxed">{settings.address}</p>
              </div>
            </div>
          </div>

          {/* Wordmark + copyright */}
          <div className="border-t border-blue-800/50 pt-8">
            <div className="text-center">
             
              <p className="text-blue-400 text-xs">
                © {new Date().getFullYear()} Genza Education Pacitan. Hak cipta dilindungi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
