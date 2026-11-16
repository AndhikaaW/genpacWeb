import { useState, useEffect } from 'react'

// Components
import Navbar from './components/Navbar'
import OpeningSlider from './components/OpeningSlider'
import TrustBar from './components/TrustBar'
import About from './components/About'
import Programs from './components/Programs'
import Facilities from './components/Facilities'
import WhyGenza from './components/WhyGenza'
import Tutors from './components/Tutors'
import Achievements from './components/Achievements'
import Gallery from './components/Gallery'
import Testimonials from './components/Testimonials'
import RegistrationFlow from './components/RegistrationFlow'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'
import Location from './components/Location'
import Footer from './components/Footer'
import FloatingWA from './components/FloatingWA'
import { AppSettingsProvider } from './hooks/AppSettingsContext'

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-reveal]'))
    if (!('IntersectionObserver' in window)) {
      sections.forEach((section) => section.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <AppSettingsProvider>
    <main className="min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-yellow-400 focus:text-[#22539F] focus:font-bold focus:rounded-lg">
        Lewati ke konten
      </a>

      <Navbar
        isScrolled={isScrolled}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      <div id="main-content">
        <OpeningSlider />

        <TrustBar />

        <section id="tentang" data-scroll-reveal className="scroll-reveal bg-white py-20">
          <About />
        </section>

        <section id="program" data-scroll-reveal className="scroll-reveal bg-[#F4F6FE] py-20">
          <Programs />
        </section>

        <section id="fasilitas" data-scroll-reveal className="scroll-reveal bg-[#22539F] py-20">
          <Facilities />
        </section>

        <section id="kenya-genza" data-scroll-reveal className="scroll-reveal bg-white py-20">
          <WhyGenza />
        </section>

        <section id="tutor" data-scroll-reveal className="scroll-reveal bg-[#F4F6FE] py-20">
          <Tutors />
        </section>

        <section id="prestasi" data-scroll-reveal className="scroll-reveal bg-[#22539F] py-20">
          <Achievements />
        </section>

        {/* Gallery selalu render — component sendiri yang handle kosong/isi */}
        <section id="galeri" data-scroll-reveal className="scroll-reveal bg-white py-20">
          <Gallery />
        </section>

        {/* Testimoni: tampil form submit + daftar yang disetujui */}
        <Testimonials />

        <section id="alur" data-scroll-reveal className="scroll-reveal bg-[#F4F6FE] py-20">
          <RegistrationFlow />
        </section>

        <section id="biaya" data-scroll-reveal className="scroll-reveal bg-white py-20">
          <Pricing />
        </section>

        <section id="faq" data-scroll-reveal className="scroll-reveal bg-white py-20">
          <FAQ />
        </section>

        <section id="lokasi" data-scroll-reveal className="scroll-reveal bg-[#F4F6FE] py-20">
          <Location />
        </section>
      </div>

      <Footer />

      <FloatingWA />
    </main>
    </AppSettingsProvider>
  )
}
