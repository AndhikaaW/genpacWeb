import { MapPin, Clock, ExternalLink, Phone, Camera} from 'lucide-react'
import { waLink } from '../lib/config'
import { useAppSettings } from '../hooks/AppSettingsContext'
import { useAppSettingsLoading } from '../hooks/AppSettingsContext'
import { Skeleton } from './ui/skeleton'

export default function Location() {
  const settings = useAppSettings()
  const settingsLoading = useAppSettingsLoading()
  const mapsUrl = settings.mapsLink
    || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`

  if (settingsLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" aria-busy="true">
        <div className="mb-12 space-y-3"><Skeleton className="h-10 w-64" /><Skeleton className="h-5 w-80 max-w-full" /></div>
        <div className="grid gap-8 lg:grid-cols-2"><div className="space-y-4">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-24 w-full rounded-[20px]" />)}<Skeleton className="h-14 w-full rounded-full" /></div><Skeleton className="min-h-[400px] w-full rounded-[24px]" /></div>
        <span className="sr-only">Memuat informasi lokasi...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">
          Lokasi & Kontak
        </h2>
        <p className="text-lg text-slate-500">Kunjungi langsung atau chat dulu via WhatsApp.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Info cards */}
        <div className="space-y-4">
          {/* Alamat */}
          <div className="flex items-start gap-4 p-5 bg-white rounded-[20px] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-[#22539F]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">Alamat</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{settings.address}</p>
            </div>
          </div>

          {/* Jam operasional */}
          {settings.openingHours && settings.openingHours !== 'TODO: isi jam operasional' && (
            <div className="flex items-start gap-4 p-5 bg-white rounded-[20px] border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-[#22539F]" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-1">Jam Operasional</h3>
                <p className="text-slate-600 text-sm">{settings.openingHours}</p>
              </div>
            </div>
          )}

          {/* WhatsApp */}
          <div className="flex items-start gap-4 p-5 bg-white rounded-[20px] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-[#25D366]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-[#25D366]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">WhatsApp</h3>
              <a
                href={waLink(undefined, settings.whatsappNumber)}
                target="_blank"
                rel="noopener"
                className="text-[#25D366] hover:text-[#128C7E] font-medium flex items-center gap-2 text-sm cursor-pointer"
              >
                Chat via WhatsApp
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Instagram */}
          {settings.instagram && <div className="flex items-start gap-4 p-5 bg-white rounded-[20px] border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Camera className="w-6 h-6 text-pink-500" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">Instagram</h3>
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener"
                className="text-pink-500 hover:text-pink-600 font-medium flex items-center gap-2 text-sm cursor-pointer"
              >
                {settings.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '')}
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>}

          <a
            href={waLink(`Halo Genza ${settings.branch}, saya ingin konsultasi tentang program bimbel.`, settings.whatsappNumber)}
            target="_blank"
            rel="noopener"
            className="block w-full text-center px-6 py-4 bg-[#22539F] text-white font-bold rounded-full hover:bg-[#22539F] transition-all hover:shadow-card active:scale-95 cursor-pointer"
          >
            Konsultasi Gratis via WhatsApp
          </a>
        </div>

        {/* Map */}
        <div className="rounded-[24px] overflow-hidden shadow-[0_16px_48px_rgba(246,204,70,0.15)] border-2 border-yellow-400/30 bg-slate-100 min-h-[400px]">
          {settings.mapsEmbedUrl ? (
            <iframe
              src={settings.mapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ minHeight: '400px', border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Peta lokasi Genza Education Pacitan"
            />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#22539F] font-bold text-2xl">G</span>
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Genza Education Pacitan</h4>
                <p className="text-slate-600 text-sm mb-6 max-w-xs mx-auto">{settings.address}</p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22539F] text-white font-semibold rounded-full hover:bg-[#22539F] transition-all text-sm cursor-pointer"
                >
                  Buka di Google Maps
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
