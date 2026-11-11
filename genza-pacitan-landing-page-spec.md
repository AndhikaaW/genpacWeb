# SPEC: Landing Page Semi Company Profile — Genza Education Cabang Pacitan

> Dokumen ini adalah brief lengkap untuk AI agent. Baca seluruhnya sebelum menulis kode. Ikuti bagian **Aturan Wajib** dan **Acceptance Checklist**.

---

## 0. Peran & Tujuan

**Peran:** Anda adalah senior front-end engineer + UI/UX designer.

**Tujuan:** Bangun landing page satu halaman (single page) berbahasa Indonesia untuk **Genza Education cabang Pacitan** (bimbingan belajar). Halaman berfungsi ganda:

1. **Company profile ringan** — membangun kepercayaan (profil, program, fasilitas, tutor, prestasi).
2. **Konversi** — mengarahkan pengunjung ke **WhatsApp admin** untuk daftar / konsultasi gratis.

**Audiens:** orang tua siswa (pengambil keputusan) dan siswa SD/SMP/SMA/alumni (pengguna). Mayoritas akses dari HP → **mobile-first**.

**Tone of voice:** santai tapi sopan, akrab untuk Gen Z, tetap kredibel bagi orang tua. Siswa disapa dengan "kamu".

---

## 1. Aturan Wajib (jangan dilanggar)

1. **Jangan mengarang data.** Harga, nama tutor, jumlah siswa, testimoni, nomor telepon, jam operasional, dan data prestasi cabang **harus berupa placeholder** yang jelas (lihat `SITE_CONFIG`), bukan angka rekaan.
2. Fakta yang BOLEH dipakai apa adanya ada di bagian **3. Fakta Brand Terverifikasi**.
3. Jangan memakai logo/gambar bermerek yang tidak disediakan. Gunakan placeholder (`/assets/logo-genza.svg`, `/assets/hero.webp`, dst.) dan komentar `TODO` agar mudah diganti.
4. Jangan menambahkan library berat (jQuery, Bootstrap, slider besar). Utamakan HTML semantik + CSS + sedikit JS vanilla.
5. Semua teks yang tampil ke pengguna dalam **Bahasa Indonesia**.
6. Semua nilai konfigurasi (nomor WA, alamat, harga, dsb.) dipusatkan di **satu objek `SITE_CONFIG`** di atas file, agar admin cabang mudah mengubah.
7. Warna **hanya** boleh memakai token di bagian 4. Jangan membuat warna baru.

---

## 2. Output yang Diminta

Pilih salah satu (default: opsi A):

- **Opsi A (default):** satu file `index.html` berisi HTML + CSS + JS inline, siap dibuka di browser.
- **Opsi B:** proyek Astro/Next.js bila diminta eksplisit.

Sertakan juga:
- `README.md` singkat: cara mengubah `SITE_CONFIG`, mengganti gambar, dan deploy (Vercel / Netlify / Cloudflare Pages).
- Folder `assets/` dengan placeholder (jelaskan file apa yang perlu diganti).

---

## 3. Fakta Brand Terverifikasi (boleh dipakai)

| Fakta | Nilai |
|---|---|
| Nama | Genza Education |
| Jenis | Lembaga pendidikan nonformal / bimbingan belajar |
| Pusat | Yogyakarta |
| Berdiri | 9 Maret 2023 |
| Jaringan | 150+ center (G-Center) di seluruh Indonesia |
| Jenjang | SD/MI, SMP/MTs, SMA/MA, Alumni |
| Visi/tagline | "Membangun Generasi Cerdas dan Berprestasi" |
| Hashtag/slogan | #bimbelyangkamubanget (badge di situs pusat: "Bimbel yang Aku Banget!") |
| Target | Generasi Z |
| Program persiapan | Ujian sekolah, UTBK-SNBT, ujian mandiri, TNI/Polri, Sekolah Kedinasan |
| Program online | **G-Advanced** (kelas online UTBK-SNBT dan SKD Sekdin/TNI/Polri) |
| Fasilitas "G-System" | G-Assessment, G-Consult, G-Clinic, G-Book, G-Exercise, G-Report, G-Evaluation, G-Simulation, Tes Diagnostik |
| Mapel | Matematika, IPA, IPS, B. Indonesia, B. Inggris, PPKn (bervariasi per jenjang) |
| Penghargaan 2024 | Top Innovation Choice Award 2024 (inovasi GLMS); Millennials Choice in Education Programme Award 2024 |
| Cabang Pacitan | Jl. D.I Panjaitan No.23, Baleharjo, Pacitan, Jawa Timur |
| Instagram cabang | @genzaeducationpacitan |
| Situs pusat | https://genzaeducation.com |

> Catatan: mapel per jenjang dan penghargaan adalah data tingkat pusat. Tulis sebagai "Genza Education" (bukan klaim khusus cabang Pacitan).

---

## 4. Design Tokens (WAJIB)

Warna diambil dari tampilan situs resmi Genza pusat (biru, kuning, putih). Nilai hex hasil sampling screenshot; verifikasi dengan brand guideline HQ bila tersedia.

```css
:root {
  /* Identitas (30%) */
  --blue-500: #22539F;   /* Genza Blue: hero, tombol utama, judul penting */
  --blue-400: #3173B8;   /* Wave Blue: gelombang, hover, ikon */
  --navy-700: #163A70;   /* Navy: footer, teks di atas kuning */

  /* Aksen (10%) */
  --yellow-400: #F6CC46; /* Genza Yellow: badge, highlight angka, gelombang */

  /* Netral (60%) */
  --white: #FFFFFF;
  --mist-50: #F4F6FE;    /* latar section selang-seling */
  --slate-800: #2B2F3A;  /* teks isi */
  --slate-500: #5B6475;  /* teks sekunder */
  --line: #E3E8F4;       /* border tipis */

  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-pill: 999px;
  --shadow-card: 0 6px 24px rgba(34, 83, 159, 0.10);
  --container: 1120px;
}
```

**Aturan pemakaian warna**
- Kuning HANYA untuk aksen (badge, highlight, garis gelombang, ikon kecil). Jangan pernah menaruh teks putih di atas kuning. Teks di atas kuning = `--navy-700`.
- Teks putih hanya di atas `--blue-500` / `--navy-700` (kontras ≥ 7:1).
- Latar section selang-seling: `--white` dan `--mist-50`.

**Tipografi** (Google Fonts, `display=swap`, beri fallback `system-ui, sans-serif`)
- Heading: **Poppins** 600/700/800.
- Body: **Inter** 400/500/600.
- Skala: H1 `clamp(2rem, 5vw, 3.5rem)`, H2 `clamp(1.6rem, 3.5vw, 2.4rem)`, body 16–18px, line-height 1.6.

**Gaya visual khas Genza (tiru dari situs pusat)**
- Hero biru tua dengan **dot pattern halus** dan **gelombang organik** berlapis (biru medium + kuning) sebagai pembatas ke section putih (gunakan inline SVG, bukan gambar raster).
- Navbar putih bersih, tombol "Daftar" berbentuk pil biru.
- Kartu putih, radius 16–24px, bayangan tipis.
- Ikon garis konsisten (inline SVG ala Lucide/Phosphor).
- Foto asli siswa/tutor Pacitan (placeholder dulu) dengan bingkai membulat.

---

## 5. SITE_CONFIG (letakkan di bagian atas file)

```js
const SITE_CONFIG = {
  brandName: "Genza Education",
  branch: "Pacitan",
  tagline: "Bimbel yang Kamu Banget",
  whatsappNumber: "62XXXXXXXXXXX", // TODO: format internasional tanpa +, mis. 6281234567890
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
};
```

**Fungsi helper WhatsApp (wajib):**

```js
function waLink(message) {
  const text = encodeURIComponent(message || SITE_CONFIG.whatsappDefaultMessage);
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${text}`;
}
```

Setiap tombol CTA WA harus memakai `waLink()` dengan pesan kontekstual (contoh: tombol kartu program SMA → "Halo Genza Pacitan, saya ingin tanya program SMA."). Tambahkan `target="_blank" rel="noopener"`.

Jika `stats.*`, `tutors`, `testimonials`, atau `gallery` kosong/null → **sembunyikan elemen terkait** atau tampilkan blok placeholder bertanda jelas "Segera hadir", jangan isi dengan data palsu.

---

## 6. Struktur Halaman (urutan section)

Gunakan elemen semantik (`header`, `nav`, `main`, `section`, `footer`) dan `id` anchor untuk tiap section. Aktifkan `scroll-behavior: smooth`.

### 6.1 Navbar (sticky)
- Latar putih, bayangan tipis saat scroll.
- Kiri: logo "genza EDUCATION" (placeholder `assets/logo-genza.svg`).
- Menu: Tentang · Program · Fasilitas · Tutor · Lokasi.
- Kanan: tombol pil biru **"Daftar"** → `waLink()`.
- Mobile: hamburger menu dengan panel geser, tombol minimal 44px.

### 6.2 Hero
- Latar `--blue-500` + dot pattern + gelombang SVG (biru medium & kuning) di bagian bawah.
- Badge kecil kuning: "Genza Education Pacitan".
- **H1:** "Bimbel yang Kamu Banget, kini di Pacitan."
- **Subjudul:** "Belajar jadi lebih terarah dengan tutor terseleksi, materi terstruktur, dan pendampingan personal untuk SD, SMP, SMA, hingga persiapan UTBK dan kedinasan."
- 2 CTA: **[Daftar Sekarang]** (kuning, teks navy) dan **[Konsultasi Gratis via WhatsApp]** (outline putih).
- Chip jenjang: SD/MI · SMP/MTs · SMA/MA · Alumni.
- Kanan: foto siswa/tutor (placeholder) dalam bingkai membulat dengan aksen kuning.
- Baris trust kecil: "✓ Tutor terseleksi ✓ Tryout berkala ✓ Laporan perkembangan".

### 6.3 Trust Bar
- Kartu horizontal: **150+ center di Indonesia** · **Sejak 2023** · **Penghargaan Inovasi 2024**.
- Tambahkan angka cabang hanya jika `SITE_CONFIG.stats` terisi.

### 6.4 Tentang Genza Pacitan (inti company profile)
- Judul: "Mengenal Genza Education Pacitan".
- Paragraf: Genza Education adalah lembaga bimbingan belajar nonformal berpusat di Yogyakarta dengan lebih dari 150 center di Indonesia. Cabang Pacitan hadir untuk menemani siswa Pacitan dan sekitarnya meraih prestasi dengan pendekatan personal.
- Kartu **Visi:** "Membangun generasi cerdas dan berprestasi melalui pendidikan berkualitas."
- Kartu **Pendekatan:** belajar yang dekat dengan cara Gen Z (teknologi, interaktif, personal).
- Ilustrasi/foto di sisi kanan.

### 6.5 Program
Grid kartu (1 kolom mobile, 2–3 kolom desktop). Tiap kartu: ikon, nama, deskripsi singkat, mapel, tombol "Tanya program ini" (pesan WA kontekstual).

| Kartu | Deskripsi |
|---|---|
| Genza SD/MI | Penguatan dasar dan kebiasaan belajar. Mapel inti SD. |
| Genza SMP/MTs | Pendalaman Matematika, IPA, IPS, B. Indonesia, B. Inggris. |
| Genza SMA/MA | Pendampingan mapel sekolah dan persiapan ujian. |
| Persiapan UTBK-SNBT | Latihan soal, tryout, dan strategi masuk PTN. |
| Sekdin & TNI/Polri | Fokus SKD dan persiapan seleksi. |
| G-Advanced (online) | Kelas online UTBK-SNBT dan SKD Sekdin/TNI/Polri dari tim Headquarter. |

> Jika program tertentu belum dibuka di cabang Pacitan, beri flag `available: true/false` di data program dan tampilkan label "Tanya ketersediaan".

### 6.6 Fasilitas G-System
Grid 9 kartu ikon (3×3 desktop, 2 kolom mobile): G-Assessment, G-Consult, G-Clinic, G-Book, G-Exercise, G-Report, G-Evaluation, G-Simulation, Tes Diagnostik. Tiap kartu: ikon biru + nama + satu kalimat netral yang menjelaskan fungsi (tanpa klaim angka). Hover: naik 4px + garis bawah kuning.

### 6.7 Kenapa Genza
4–6 poin keunggulan dengan ikon:
- G-Tutor melalui seleksi dan pelatihan standar nasional.
- Materi dan fasilitas terstruktur (G-System).
- Tes diagnostik untuk memetakan kemampuan awal.
- Tryout dan simulasi berkala.
- Laporan perkembangan belajar.
- Jaringan nasional 150+ center.

### 6.8 Tutor
Render dari `SITE_CONFIG.tutors`. Jika kosong → tampilkan 3 kartu placeholder "Foto tutor segera hadir".

### 6.9 Prestasi & Testimoni
Render dari `SITE_CONFIG.testimonials` (bintang kuning, kutipan, nama, jenjang). Jika kosong → tampilkan blok "Kisah sukses siswa Genza Pacitan segera hadir" dan, sebagai bukti sosial yang valid, penghargaan tingkat pusat (Top Innovation Choice Award 2024, Millennials Choice in Education Programme Award 2024).

### 6.10 Galeri
Grid foto dari `SITE_CONFIG.gallery`, lazy load, lightbox sederhana. Kosong → placeholder.

### 6.11 Alur Pendaftaran
Stepper 3 langkah:
1. **Tes Diagnostik** — petakan kemampuan awal.
2. **Konsultasi** — pilih program dan jadwal bersama admin.
3. **Mulai Belajar** — bergabung di kelas dan pantau perkembangan.

### 6.12 Biaya / Promo
Jika `pricing` null → kartu: "Info biaya & promo terbaru? Hubungi admin kami." + tombol WA. Jika terisi → tabel paket.

### 6.13 FAQ
Accordion aksesibel (`<details>/<summary>` atau button dengan `aria-expanded`). Pertanyaan:
- Jenjang apa saja yang dilayani?
- Apakah ada tes awal untuk menentukan level?
- Bagaimana jadwal dan sistem belajarnya? *(jawab: "Hubungi admin untuk jadwal terbaru.")*
- Apakah ada kelas online? *(G-Advanced untuk UTBK-SNBT dan SKD)*
- Bagaimana cara mendaftar?
- Berapa biaya belajarnya? *(arahkan ke admin)*

### 6.14 Lokasi & Kontak
- Alamat dari `SITE_CONFIG.address`, jam operasional, tombol WA, tautan Instagram.
- Peta Google Maps embed (`loading="lazy"`) bila `mapsEmbedUrl` terisi; jika kosong tampilkan tombol "Buka di Google Maps".

### 6.15 CTA Penutup + Footer
- Banner biru tua dengan gelombang kuning: "Yuk, mulai belajar bareng Genza Pacitan!" + tombol WA kuning.
- Footer `--navy-700`: logo, tautan anchor, alamat, Instagram, tautan ke genzaeducation.com, copyright.

### 6.16 Floating WhatsApp Button
Tombol bulat melayang di kanan bawah (mobile & desktop), tidak menutupi konten penting, `aria-label="Chat WhatsApp"`.

---

## 7. Perilaku & UX

- **Mobile-first**, breakpoint utama: 640px, 1024px.
- Animasi halus (fade-up saat masuk viewport via `IntersectionObserver`), **hormati** `prefers-reduced-motion`.
- Tombol & target sentuh ≥ 44×44px.
- Gelombang pembatas section menggunakan SVG inline; pastikan tidak ada scroll horizontal.
- Navbar menandai section aktif (scroll spy sederhana).

---

## 8. SEO & Teknis

- `<title>`: "Bimbel Pacitan Terbaik – Genza Education Cabang Pacitan"
- `<meta name="description">`: "Genza Education Pacitan: bimbel SD, SMP, SMA, persiapan UTBK-SNBT, Sekdin, TNI/Polri. Tutor terseleksi, tryout berkala. Konsultasi gratis via WhatsApp."
- Kata kunci alami di teks: bimbel Pacitan, bimbel UTBK Pacitan, les SMA Pacitan, bimbel SMP Pacitan.
- Open Graph + Twitter Card (gambar placeholder `assets/og-image.jpg`).
- `lang="id"`, favicon placeholder, `theme-color` = `#22539F`.
- JSON-LD `LocalBusiness` / `EducationalOrganization` dengan nama, alamat (dari fakta terverifikasi), URL, dan `sameAs` Instagram. Kosongkan field yang belum ada (telepon, jam) — jangan diisi tebakan.
- Satu `<h1>` saja, hierarki heading berurutan.
- Gambar: WebP, atribut `width/height`, `loading="lazy"` (kecuali hero), `alt` deskriptif.
- Analytics: sediakan slot komentar untuk GA4 dan Meta Pixel; pasang event `click_whatsapp` pada semua CTA WA.
- Target Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.

---

## 9. Aksesibilitas

- Kontras minimal WCAG AA (ikuti aturan warna di bagian 4).
- Navigasi keyboard penuh, indikator `:focus-visible` jelas (outline kuning/biru).
- `aria-label` pada ikon-tombol, `aria-expanded` pada accordion/menu.
- Link "Lewati ke konten" di awal halaman.

---

## 10. Acceptance Checklist

Sebelum menyerahkan hasil, pastikan semua ini terpenuhi:

- [ ] Semua warna berasal dari token di bagian 4; tidak ada warna merah/hijau/ungu baru.
- [ ] Kuning tidak dipakai sebagai latar teks putih.
- [ ] Hero memiliki gelombang SVG biru + kuning dan dot pattern.
- [ ] Seluruh data variabel ada di `SITE_CONFIG`; tidak ada harga, nama tutor, testimoni, atau angka siswa rekaan.
- [ ] Semua CTA WhatsApp memakai `waLink()` dengan pesan kontekstual.
- [ ] 14+ section sesuai bagian 6 hadir dan urut; section kosong menampilkan placeholder yang jelas.
- [ ] Tampilan rapi di lebar 360px, 768px, 1280px; tidak ada scroll horizontal.
- [ ] Heading hanya satu `<h1>`; meta SEO, OG, dan JSON-LD terpasang.
- [ ] `prefers-reduced-motion` dihormati; navigasi keyboard berfungsi.
- [ ] `README.md` menjelaskan cara mengganti config, gambar, dan deploy.
- [ ] Daftar TODO di akhir jawaban: apa saja yang harus dilengkapi pemilik cabang (logo vektor, foto, nomor WA, harga, tutor, testimoni, jam, link Maps).

---

## 11. Catatan untuk Pemilik Cabang (bahan yang harus disiapkan)

1. Logo Genza versi vektor + brand guideline resmi dari HQ (verifikasi hex warna dan tagline resmi: "Bimbel yang Aku Banget!" vs "Bimbel yang Kamu Banget").
2. Foto asli: gedung, ruang kelas, siswa, tutor, kegiatan.
3. Nama & bidang tutor; program yang dibuka di Pacitan.
4. Kebijakan harga (tampilkan paket atau "hubungi admin").
5. Data prestasi & testimoni (dengan izin).
6. Nomor WhatsApp admin, jam operasional, tautan Google Maps.
