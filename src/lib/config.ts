export const SITE_CONFIG = {
  brandName: "Genza Education",
  branch: "Pacitan",
  tagline: "Bimbel yang Aku Banget",
  whatsappNumber: "6281234567890", // TODO: format internasional tanpa +, mis. 6281234567890
  whatsappDefaultMessage: "Halo Genza Pacitan, saya ingin tanya program bimbingan belajar.",
  address: "Jl. D.I Panjaitan No.23, Baleharjo, Pacitan, Jawa Timur",
  mapsEmbedUrl: "", // TODO: URL embed Google Maps
  mapsLink: "",     // TODO: link Google Maps
  openingHours: "TODO: isi jam operasional",
  instagram: "https://www.instagram.com/genzaeducationpacitan/",
  hqWebsite: "https://genzaeducation.com",
  stats: {
    siswaAktif: null,      // TODO: angka asli atau null untuk menyembunyikan
    tutor: null,           // TODO
    lolosPTN: null         // TODO
  },
  pricing: null,           // TODO: null = tampilkan "Hubungi admin untuk info biaya"
  tutors: [],              // TODO: [{ name, subject, photo }]
  testimonials: [],        // TODO: [{ name, role, quote }] (butuh izin)
  gallery: []              // TODO: [{ src, alt }]
}

export function waLink(message?: string, whatsappNumber = SITE_CONFIG.whatsappNumber) {
  const text = encodeURIComponent(message || SITE_CONFIG.whatsappDefaultMessage)
  return `https://wa.me/${whatsappNumber}?text=${text}`
}
