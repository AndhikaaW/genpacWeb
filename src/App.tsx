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

        <section id="tentang" className="bg-white py-20">
          <About />
        </section>

        <section id="program" className="bg-[#F4F6FE] py-20">
          <Programs />
        </section>

        <section id="fasilitas" className="bg-[#22539F] py-20">
          <Facilities />
        </section>

        <section id="kenya-genza" className="bg-white py-20">
          <WhyGenza />
        </section>

        <section id="tutor" className="bg-[#F4F6FE] py-20">
          <Tutors />
        </section>

        <section id="prestasi" className="bg-[#22539F] py-20">
          <Achievements />
        </section>

        {/* Gallery selalu render — component sendiri yang handle kosong/isi */}
        <section id="galeri" className="bg-white py-20">
          <Gallery />
        </section>

        {/* Testimoni: tampil form submit + daftar yang disetujui */}
        <Testimonials />

        <section id="alur" className="bg-[#F4F6FE] py-20">
          <RegistrationFlow />
        </section>

        <section id="biaya" className="bg-white py-20">
          <Pricing />
        </section>

        <section id="faq" className="bg-white py-20">
          <FAQ />
        </section>

        <section id="lokasi" className="bg-[#F4F6FE] py-20">
          <Location />
        </section>
      </div>

      <Footer />

      <FloatingWA />
    </main>
    </AppSettingsProvider>
  )
}
