import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react'
import type { Branch } from '../types'

interface ContactProps {
  branch: Branch | null
}

export default function Contact({ branch }: ContactProps) {
  return (
    <section id="contact" className="section">
      <div className="section-inner">
        <div className="section-header">
          <h2>Hubungi Kami</h2>
          <p>Kunjungi atau hubungi cabang terdekat</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info">
            <h3>{branch?.nama || 'Genza Education'}</h3>

            {branch?.alamat && (
              <div className="contact-item">
                <MapPin size={20} />
                <div>
                  <p className="contact-label">Alamat</p>
                  <p>{branch.alamat}</p>
                </div>
              </div>
            )}

            {branch?.whatsapp ? (() => {
              const waNumber = branch.whatsapp.replace(/[^0-9]/g, '')
              return (
                <div className="contact-item">
                  <Phone size={20} />
                  <div>
                    <p className="contact-label">WhatsApp</p>
                    <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer">
                      {branch.whatsapp}
                    </a>
                  </div>
                </div>
              )
            })() : null}

            {branch?.email && (
              <div className="contact-item">
                <Mail size={20} />
                <div>
                  <p className="contact-label">Email</p>
                  <a href={`mailto:${branch.email}`}>{branch.email}</a>
                </div>
              </div>
            )}

            {branch?.jamOperasional && (
              <div className="contact-item">
                <Clock size={20} />
                <div>
                  <p className="contact-label">Jam Operasional</p>
                  <p>{branch.jamOperasional}</p>
                </div>
              </div>
            )}

            {branch?.rekening && branch.rekening.length > 0 && (
              <div className="contact-rekening">
                <p className="contact-label">Pembayaran via:</p>
                {branch.rekening.map((r, i) => (
                  <div key={i} className="rekening-item">
                    <p className="rekening-bank">{r.bank}</p>
                    <p className="rekening-name">{r.atasNama}</p>
                    <p className="rekening-number">{r.noRek}</p>
                  </div>
                ))}
              </div>
            )}

            {branch?.whatsapp ? (() => {
              const waNumber = branch.whatsapp.replace(/[^0-9]/g, '')
              return (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success btn-lg"
                  style={{ marginTop: '1.5rem' }}
                >
                  <MessageCircle size={20} /> Chat WhatsApp
                </a>
              )
            })() : null}
          </div>

          <div className="contact-map">
            {branch?.lat && branch?.lng ? (
              <iframe
                title="Lokasi Cabang"
                src={`https://maps.google.com/maps?q=${branch.lat},${branch.lng}&z=15&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <div className="map-placeholder">
                <MapPin size={48} />
                <p>Lokasi {branch?.nama || 'Genza Education'}</p>
                <p className="map-sub">{branch?.alamat || 'Pacitan'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
