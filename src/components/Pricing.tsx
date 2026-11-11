import { ArrowRight, MessageCircle } from 'lucide-react'
import { SITE_CONFIG, waLink } from '../lib/config'
import { useAppSettings } from '../hooks/AppSettingsContext'

export default function Pricing() {
  const settings = useAppSettings()
  if (SITE_CONFIG.pricing === null) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto relative bg-yellow-50 border border-yellow-200 rounded-[24px] p-10 text-center overflow-hidden">
          {/* Wave ornament */}
          <svg className="absolute bottom-0 left-0 right-0 w-full opacity-20" viewBox="0 0 400 60" aria-hidden="true">
            <path d="M0 60 C100 20, 200 60, 300 20 C350 0, 380 20, 400 10 L400 60Z" fill="#F6CC46" />
          </svg>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-[#22539F]" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Info biaya & promo terbaru?</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Biaya disesuaikan dengan program dan jenjang pilihanmu. Hubungi admin kami untuk mendapatkan info biaya dan promo yang berlaku.
            </p>
            <a
              href={waLink(`Halo Genza ${settings.branch}, saya ingin tanya info biaya program bimbel.`, settings.whatsappNumber)}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-[#22539F] font-bold rounded-full hover:bg-yellow-400/90 transition-all hover:shadow-card active:scale-95 cursor-pointer"
            >
              Tanya biaya via WhatsApp
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    )
  }

  const packages = SITE_CONFIG.pricing as Array<{name: string, duration: string, price: string, featured?: boolean, features: string[]}>

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">Biaya & Promo</h2>
        <p className="text-lg text-slate-500">Pilih paket yang sesuai kebutuhanmu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg, index) => (
          <div
            key={index}
            className={`rounded-[20px] p-6 border transition-all duration-300 hover:shadow-card ${
              pkg.featured
                ? 'bg-[#22539F] border-[#22539F] text-white'
                : 'bg-white border-slate-100'
            }`}
          >
            {pkg.featured && (
              <div className="inline-flex items-center px-3 py-1 bg-yellow-400 text-[#22539F] rounded-full text-xs font-bold mb-4">
                Terpopuler
              </div>
            )}
            <h3 className={`text-xl font-bold mb-1 ${pkg.featured ? 'text-white' : 'text-slate-800'}`}>
              {pkg.name}
            </h3>
            <p className={`text-sm mb-6 ${pkg.featured ? 'text-blue-200' : 'text-slate-500'}`}>{pkg.duration}</p>
            <div className="mb-6">
              <span className={`text-4xl font-bold ${pkg.featured ? 'text-yellow-400' : 'text-[#22539F]'}`}>
                Rp{pkg.price}
              </span>
              <span className={`text-sm ml-1 ${pkg.featured ? 'text-blue-200' : 'text-slate-500'}`}>/bulan</span>
            </div>
            <ul className="space-y-2.5 mb-8">
              {pkg.features.map((feature, i) => (
                <li key={i} className={`flex items-start gap-2 text-sm ${pkg.featured ? 'text-blue-100' : 'text-slate-600'}`}>
                  <span className="text-yellow-400 mt-0.5 flex-shrink-0" aria-hidden="true">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <a
                  href={waLink(`Halo Genza ${settings.branch}, saya ingin tanya paket ${pkg.name}.`, settings.whatsappNumber)}
              target="_blank"
              rel="noopener"
              className={`block w-full text-center px-5 py-3 font-bold rounded-full transition-all active:scale-95 cursor-pointer ${
                pkg.featured
                  ? 'bg-yellow-400 text-[#22539F] hover:bg-yellow-400/90'
                  : 'bg-[#22539F] text-white hover:bg-[#22539F]'
              }`}
            >
              Pilih Paket
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
