import { useState, useEffect } from 'react'
import { Menu, X, Star } from 'lucide-react'
import { waLink } from '../lib/config'
import { cn } from '../lib/utils'
import logoUrl from '../assets/G-logo.png'
import { useAppSettings } from '../hooks/AppSettingsContext'

export default function Navbar({
  isScrolled,
  mobileMenuOpen,
  onMobileMenuToggle,
}: {
  isScrolled: boolean
  mobileMenuOpen: boolean
  onMobileMenuToggle: () => void
}) {
  const settings = useAppSettings()
  const [activeSection, setActiveSection] = useState('tentang')

  const navLinks = [
    { name: 'Tentang', href: '#tentang' },
    { name: 'Program', href: '#program' },
    { name: 'Fasilitas', href: '#fasilitas' },
    { name: 'Tutor', href: '#tutor' },
    { name: 'Lokasi', href: '#lokasi' },
  ]

  useEffect(() => {
    let scheduled = false
    const updateActiveSection = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        const current = [...navLinks].reverse().find(({ href }) => {
          const section = document.getElementById(href.slice(1))
          return section && section.getBoundingClientRect().top <= 120
        })
        setActiveSection(current?.href.slice(1) ?? 'tentang')
      })
    }
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)
    updateActiveSection()
    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 shadow-sm'
          : 'bg-white/80 backdrop-blur-sm'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - more distinctive */}
          <a href="#hero" className="flex items-center gap-2 group">
            <img src={logoUrl} alt="Genza" width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
            <div className="hidden sm:block">
              <span className="text-lg font-heading font-bold text-slate-800 group-hover:text-blue-500 transition-colors">
                genza
              </span>
              <span className="text-lg font-heading font-semibold text-blue-500 ml-1">
                EDUCATION
              </span>
            </div>
          </a>

          {/* Desktop Navigation - more spacing */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setActiveSection(link.href.slice(1))}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  activeSection === link.href.slice(1)
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                )}
              >
                {link.name}
              </a>
            ))}
            <a
              href={waLink(`Halo Genza ${settings.branch}, saya ingin tanya program bimbingan belajar.`, settings.whatsappNumber)}
              target="_blank"
              rel="noopener"
              className="ml-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all hover:shadow-md active:scale-95 flex items-center gap-2"
            >
              <Star className="w-4 h-4 fill-white" />
              Daftar
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className={cn(
              'md:hidden p-2 rounded-lg transition-colors',
              mobileMenuOpen ? 'text-blue-600' : 'text-slate-600 hover:bg-slate-100'
            )}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => { setActiveSection(link.href.slice(1)); onMobileMenuToggle() }}
                className={cn(
                  'block px-4 py-3 rounded-lg text-base font-medium transition-colors',
                  activeSection === link.href.slice(1)
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/50'
                )}
              >
                {link.name}
              </a>
            ))}
            <a
              href={waLink(`Halo Genza ${settings.branch}, saya ingin tanya program bimbingan belajar.`, settings.whatsappNumber)}
              target="_blank"
              rel="noopener"
              className="block w-full mt-4 px-5 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-base font-semibold rounded-lg text-center hover:from-blue-600 hover:to-blue-700 transition-all hover:shadow-md"
            >
              Daftar Sekarang
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
