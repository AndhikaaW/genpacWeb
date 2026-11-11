import { MessageCircle } from 'lucide-react'
import { waLink } from '../lib/config'
import { useAppSettings } from '../hooks/AppSettingsContext'

export default function FloatingWA() {
  const settings = useAppSettings()
  return (
    <a
      href={waLink(`Halo Genza ${settings.branch}, saya ingin konsultasi tentang program bimbel.`, settings.whatsappNumber)}
      target="_blank"
      rel="noopener"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-500/30"
      aria-label="Chat WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  )
}
