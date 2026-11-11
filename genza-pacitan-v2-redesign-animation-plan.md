# SPEC v2: Redesign "Ombak Prestasi" — Landing Page Genza Education Pacitan

> **Untuk AI agent.** Dokumen ini adalah revisi desain atas build v1 (`localhost:3000`).
> Baca seluruhnya. Yang **diganti**: layout, komponen, animasi, ritme visual.
> Yang **dipertahankan dari spec v1**: fakta brand terverifikasi, `SITE_CONFIG`, aturan "jangan mengarang data", helper `waLink()`, token warna dasar, SEO, aksesibilitas.
> **Prinsip utama: tidak ada informasi yang hilang.** Hanya cara penyajiannya yang berubah (lihat bagian 9).

---

## 1. Diagnosis Build v1 (apa yang harus diperbaiki)

| # | Masalah | Dampak | Perbaikan di v2 |
|---|---|---|---|
| 1 | Semua section memakai pola sama: judul tengah + grid kartu putih berikon | Terasa template, tidak ada ritme | Tiap section punya bentuk interaksi berbeda (bagian 6) |
| 2 | Hero putih pucat, tanpa gelombang & dot pattern | Identitas Genza (biru-kuning-gelombang) hilang | Hero biru tua + gelombang berlapis beranimasi |
| 3 | Kuning hampir tidak terlihat | Palet tidak sesuai brand pusat | Kuning dipakai sebagai highlight, garis gelombang, node aktif, CTA WA |
| 4 | Navbar 9 menu, "Kenapa Genza" terpotong 2 baris | Rapi di desktop pun tidak | Maks. 6 menu, `white-space: nowrap`, pill aktif bergeser |
| 5 | Placeholder pakai emoji (🎓, 👨‍🏫) | Terlihat murahan | Placeholder ilustratif bergaya (bagian 4.5) |
| 6 | Section tutor: 3 kartu kosong "Nama Tutor 1/2/3" | Buang ruang, tidak informatif | Bila kosong → satu strip ringkas "segera hadir" |
| 7 | Semua section terang | Tidak ada klimaks visual | Ritme terang–gelap (bagian 5.3) |
| 8 | Logo masih lingkaran "G" sementara | Kurang kredibel | Pakai file logo asli (`assets/logo-genza.svg`), fallback teks wordmark |
| 9 | **Deskripsi fasilitas dikarang** (mis. G-Clinic = "Perawatan kesehatan mental") | Berpotensi salah dan menyesatkan | Lihat bagian 10 (wajib diverifikasi) |

---

## 2. Konsep: "Ombak Prestasi"

**Ide besar:** gelombang biru-kuning adalah ciri khas visual Genza pusat. Di v2, gelombang bukan sekadar hiasan pembatas, tetapi **benang merah cerita halaman**: pengunjung "menunggangi ombak" dari mengenal Genza → memilih program → belajar dengan G-System → membuktikan prestasi → mulai belajar.

**Kenapa cocok untuk Pacitan:** Pacitan adalah kota pesisir. Metafora ombak ("ombak prestasi", "naik level") terasa lokal sekaligus selaras dengan brand pusat. Gunakan secukupnya di copy, jangan berlebihan, dan jangan menyebut nama pantai atau tempat wisata spesifik tanpa verifikasi.

**Narasi scroll (storytelling):**
1. **Kenali** — Hero + Tentang
2. **Pilih jalurmu** — Program Finder
3. **Belajar dengan sistem** — Siklus G-System
4. **Kenapa Genza** — Bento keunggulan
5. **Buktikan** — Tutor, penghargaan, testimoni, galeri
6. **Mulai** — Alur daftar, FAQ, lokasi, CTA

**Keyword gaya:** segar, bertenaga, ramah Gen Z, tetap tepercaya untuk orang tua. Bukan corporate kaku, bukan kartun berlebihan.

---

## 3. Prinsip Desain

1. **Satu bentuk interaksi per section.** Jangan ulang pola grid kartu yang sama berturut-turut.
2. **Gerak punya tujuan:** mengarahkan perhatian, menjelaskan urutan, memberi umpan balik. Tidak ada animasi dekoratif yang menghambat membaca.
3. **Konten tampil dulu, animasi menyusul.** Hero harus terbaca penuh ≤ 1 detik; animasi tidak boleh menunda LCP.
4. **Progressive enhancement:** tanpa JS atau dengan `prefers-reduced-motion`, semua konten tetap terlihat dan terbaca.
5. **Mobile-first.** Setiap interaksi punya versi sentuh. Animasi berat dikurangi di perangkat lemah.
6. **Data jujur.** Section tanpa data nyata diringkas atau disembunyikan, bukan diisi data palsu.

---

## 4. Design System v2

### 4.1 Warna (token dari v1 + tambahan)

```css
:root {
  /* dari v1, jangan ubah */
  --blue-500: #22539F;
  --blue-400: #3173B8;
  --navy-700: #163A70;
  --yellow-400: #F6CC46;
  --white: #FFFFFF;
  --mist-50: #F4F6FE;
  --slate-800: #2B2F3A;
  --slate-500: #5B6475;
  --line: #E3E8F4;

  /* tambahan v2 */
  --blue-900: #0F2A55;                 /* section gelap (Fasilitas, Footer) */
  --blue-300: #8FB4E3;                 /* garis/dot di atas latar biru */
  --yellow-glow: rgba(246, 204, 70, .35);
  --grad-hero: linear-gradient(160deg, #22539F 0%, #1B4588 55%, #163A70 100%);
  --grad-dark: radial-gradient(1200px 600px at 70% 0%, #1B4588 0%, #0F2A55 60%);
}
```

Aturan warna tetap: kuning hanya aksen; **tidak ada teks putih di atas kuning** (pakai `--navy-700`); teks putih hanya di atas `--blue-500` ke bawah. Tidak boleh ada warna baru selain token di atas (hijau WhatsApp `#25D366` hanya untuk ikon/tombol WA).

### 4.2 Tipografi

- **Display (judul):** *Bricolage Grotesque* 700/800 (karakter lebih ekspresif daripada Poppins). Fallback: `Poppins, system-ui, sans-serif`.
- **Body:** *Plus Jakarta Sans* 400/500/600 (fallback `Inter, system-ui`).
- Maksimal 2 family, subset Latin, `font-display: swap`, preload font display.
- Skala fluid: H1 `clamp(2.4rem, 6vw, 4.5rem)`, H2 `clamp(1.8rem, 4vw, 3rem)`, body 16–18px, line-height 1.6, judul 1.05–1.15.
- Judul besar boleh memakai **highlight kuning** (garis/blok di belakang kata kunci), contoh: "kini di <mark>Pacitan</mark>".

### 4.3 Bentuk & elevasi

- Radius: 20px (kartu), 32px (panel besar), pill untuk tombol/chip.
- Bayangan berwarna biru lembut: `0 10px 40px rgba(34,83,159,.12)`; hover `0 16px 48px rgba(34,83,159,.20)`.
- Pola pendukung: **dot grid** halus (SVG pattern) pada section biru; **blob organik** untuk bingkai foto.

### 4.4 Motion tokens

```css
:root {
  --ease-out: cubic-bezier(.22, 1, .36, 1);   /* reveal */
  --ease-inout: cubic-bezier(.65, 0, .35, 1); /* transisi panel */
  --dur-micro: 200ms;    /* hover, tombol */
  --dur-reveal: 700ms;   /* muncul saat scroll */
  --dur-panel: 450ms;    /* ganti panel/tab */
  --stagger: 70ms;       /* jeda antar elemen */
}
```

Ambient loop (gelombang, floating) 6–34 detik. Hanya animasikan `transform` dan `opacity`.

### 4.5 Placeholder gambar (ganti emoji)

Pakai komponen `<ImagePlaceholder>`: blob/persegi membulat dengan gradasi biru → kuning lembut, pola garis diagonal halus, ikon SVG garis di tengah, dan label kecil **"FOTO ASLI DIPERLUKAN: gedung / siswa / tutor"**. Tidak boleh emoji. Saat `SITE_CONFIG.gallery` dkk. terisi, komponen otomatis diganti `<img>`.

---

## 5. Elemen Global

### 5.1 Navbar
- Maksimal **6 menu**: Tentang · Program · Fasilitas · Tutor · Prestasi · Lokasi, ditambah tombol **Daftar**. Menu lain (Keunggulan, Galeri, FAQ) tetap ada di halaman dan di footer.
- Semua item `white-space: nowrap`; tidak boleh turun baris di lebar ≥ 1024px.
- Di atas hero: transparan, teks putih. Setelah scroll > 80px: berubah menjadi **pill melayang** putih (blur kaca, bayangan tipis, tinggi mengecil).
- **Indikator aktif:** pill biru muda yang meluncur (animasi `transform`) ke menu aktif (scroll spy).
- Mobile: tombol hamburger → panel layar penuh biru tua, link muncul staggered, tombol WA besar di bawah.
- Logo: pakai `assets/logo-genza.svg`; bila belum ada, wordmark teks "genza EDUCATION" (tanpa lingkaran "G" sementara).

### 5.2 Elemen melayang
- Tombol WhatsApp melayang kanan bawah: pulsa halus tiap 6 detik (ring), tooltip "Chat admin" saat hover. Muncul setelah scroll melewati hero.
- **Progress gelombang:** garis tipis 3px kuning di atas viewport yang terisi saat scroll (opsional bentuk bergelombang kecil).

### 5.3 Ritme section (terang–gelap)

| Section | Latar |
|---|---|
| Hero | Biru tua (`--grad-hero`) + gelombang |
| Trust bar | Putih |
| Tentang | Putih |
| Program Finder | `--mist-50` |
| Fasilitas G-System | **Gelap** `--grad-dark` |
| Kenapa Genza | Putih |
| Tutor | `--mist-50` |
| Prestasi & Testimoni | Biru (`--blue-500`) |
| Galeri | Putih |
| Alur Daftar | `--mist-50` |
| FAQ | Putih |
| Lokasi | `--mist-50` |
| CTA penutup + Footer | Biru → Navy |

Pembatas antar-section memakai **gelombang SVG** dengan amplitudo berbeda tiap pergantian (jangan satu bentuk yang sama diulang).

### 5.4 Kursor & mikro-interaksi (desktop, `pointer: fine`)
- Tombol utama **magnetic** (bergeser ≤ 8px mengikuti kursor dalam radius 80px).
- Kartu: tilt 3D ringan (≤ 4°) + kilau (shine) mengikuti kursor.
- Tidak ada kursor custom penuh (menjaga aksesibilitas).

---

## 6. Spesifikasi Per Section

> Semua teks dan data dari v1 tetap dipakai. Hanya bentuk penyajian & gerak yang berubah. `[ANIMASI]` = ringkasan gerak; detail koreografi di bagian 7.

### 6.1 Hero — "Naik ombak"
**Layout:** 2 kolom (desktop), teks kiri, visual kanan. Latar `--grad-hero` + dot grid. Gelombang 3 lapis di bagian bawah (biru medium, biru tua transparan, **kuning** paling depan sebagai garis tebal) menyatu ke section putih berikutnya.

**Konten (tetap):**
- Badge "Pacitan - Genza Education".
- H1: "Bimbel yang Kamu Banget, kini di Pacitan." (kata "Pacitan" ber-highlight kuning).
- Subjudul tetap dari v1.
- CTA: **Daftar Sekarang** (kuning, teks navy, magnetic) + **Konsultasi Gratis** (outline putih).
- Chip jenjang SD/MI · SMP/MTs · SMA/MA · Alumni.
- Trust mini: Tutor terseleksi · Materi terstruktur · Laporan perkembangan.

**Visual kanan:** foto siswa/tutor dalam **bingkai blob organik** dengan outline kuning offset. Di sekelilingnya 3–4 **chip melayang** (mengambang): "Tes Diagnostik", "Tryout Berkala", "G-Report", "G-Tutor". Placeholder: `<ImagePlaceholder>`.

**Tambahan unik:** baris **word-cycler** di bawah H1: "Untuk kamu yang di **SD / SMP / SMA / UTBK / Kedinasan**" (kata berganti tiap 2,2 detik dengan slide vertikal).

**[ANIMASI]** Judul muncul per kata (stagger), gelombang bergeser pelan terus-menerus, chip mengambang sinus ±8px, blob foto bernapas (scale 1→1.03). Parallax ringan saat scroll (konten naik 10%, gelombang 20%).

### 6.2 Trust Bar
Strip horizontal: **150+ center** · **Sejak 2023** · **2 Penghargaan Inovasi 2024** (+ angka cabang bila `SITE_CONFIG.stats` terisi).
**[ANIMASI]** Angka **count-up** saat masuk viewport (sekali). Di bawahnya marquee tipis berisi nama jenjang & program (loop lambat, pause saat hover).

### 6.3 Tentang — "Pernyataan besar"
Ganti 2 kartu v1 dengan **tipografi pernyataan**:
> "Membangun generasi **cerdas** dan **berprestasi** melalui pendidikan berkualitas, dengan pendekatan yang dekat dengan cara **Gen Z**."

Paragraf profil v1 (lembaga nonformal, Yogyakarta, 150+ center, cabang Pacitan) tetap, ditaruh di bawah/samping dalam kolom lebih kecil. Kartu "Visi Kami" dan "Pendekatan Gen Z" menjadi **dua keterangan kecil bergaya sticker/tab** di tepi pernyataan. Foto gedung di sisi kanan dalam bingkai blob + ornamen gelombang kuning.
**[ANIMASI]** Pernyataan tersorot **kata demi kata mengikuti scroll** (abu → gelap), kata kunci mendapat sapuan highlight kuning. Foto bergerak parallax berlawanan arah.

### 6.4 Program — **Program Finder** ("Kamu kelas berapa?")
Ganti grid kartu dengan **selektor interaktif**.

- Kiri (desktop) / atas (mobile, scroll horizontal): daftar pilihan besar: **SD/MI · SMP/MTs · SMA/MA · UTBK-SNBT · Sekdin & TNI/Polri · G-Advanced (Online)**. Indikator aktif meluncur.
- Kanan: **panel detail** yang berganti saat pilihan dipilih: nama program, deskripsi, daftar mapel, fasilitas terkait (chip G-System), label ketersediaan, dan tombol **"Tanya program ini"** → `waLink()` dengan pesan kontekstual.
- Data program dalam array `PROGRAMS` di config: `{ id, title, description, subjects[], facilities[], available }`.
- Mapel yang boleh ditulis hanya yang ada di fakta terverifikasi (Matematika, IPA, IPS, B. Indonesia, B. Inggris, PPKn, bervariasi per jenjang). Bila ragu → "Info mapel hubungi admin".

**[ANIMASI]** Pergantian panel: crossfade + geser 16px (`--dur-panel`), tinggi panel beranimasi halus. Chip fasilitas muncul stagger. Auto-play pelan antar-pilihan hanya sampai pengguna berinteraksi.

### 6.5 Fasilitas G-System — **Siklus Belajar (orbit)**
Section **gelap** (`--grad-dark`) dengan dot grid dan glow kuning.

**Desktop:** lingkaran pusat bertuliskan "G-System". Sembilan node mengorbit pada ring: Tes Diagnostik, G-Assessment, G-Consult, G-Book, G-Exercise, G-Clinic, G-Simulation, G-Evaluation, G-Report. Ring berputar sangat pelan (60 detik/putaran), **pause saat hover/fokus**. Klik/hover node → node membesar & menyala kuning, **kartu detail di tengah** berganti (nama + deskripsi).
**Mobile:** berubah menjadi **stepper vertikal** (garis penghubung tergambar saat scroll, tiap langkah bisa di-tap untuk membuka deskripsi).

> Urutan di atas adalah ilustrasi alur belajar. Bila HQ keberatan dengan urutan, tampilkan tanpa nomor urut. Deskripsi tiap fasilitas **wajib mengikuti bagian 10**.

**[ANIMASI]** Node masuk satu per satu mengikuti ring (stagger 70ms), garis ring tergambar (`stroke-dashoffset`), pulsa halus pada node aktif. Navigasi keyboard: panah kiri/kanan berpindah node.

### 6.6 Kenapa Genza — **Bento tak seragam**
Ganti 6 kartu sama besar dengan **bento grid 12 kolom**:

| Tile | Ukuran | Isi |
|---|---|---|
| Jaringan Nasional | Besar (6×2) | "150+ center di seluruh Indonesia" + **jaringan titik** abstrak dengan satu titik kuning berdenyut = Pacitan |
| G-Tutor Terseleksi | Sedang (3×1) | Seleksi standar nasional & pelatihan intensif |
| Materi Terstruktur | Sedang (3×1) | Sistem G-System terencana & terukur |
| Tes Diagnostik | Sedang (4×1) | Memetakan kemampuan awal untuk pendekatan personal |
| Tryout Berkala | Sedang (4×1) | Simulasi ujian nyata |
| Laporan Perkembangan | Sedang (4×1) | Monitoring kemajuan belajar berkala |

**[ANIMASI]** Tile masuk berurutan (scale .96→1 + fade). Hover: tile terangkat, ikon bergerak mikro, garis kuning memanjang di tepi bawah. Titik Pacitan berdenyut tiap 2 detik; garis jaringan menyala berurutan.

### 6.7 Tutor
- **Bila `tutors` kosong:** satu strip lebar ringkas: ikon + "Tim G-Tutor Pacitan segera diperkenalkan" + tombol "Tanya jadwal & tutor via WA". **Jangan** render 3 kartu kosong.
- **Bila terisi:** carousel horizontal (drag/scroll-snap), kartu foto portrait dengan nama + mapel di overlay gradien biru; hover: foto zoom 1.05 + kartu tilt.

### 6.8 Prestasi & Testimoni
Section biru (`--blue-500`) dengan dot grid.
- **Penghargaan** (Top Innovation Choice Award 2024; Millennials Choice in Education Programme Award 2024): tampil sebagai **dua plakat/piala** dengan efek kilau (shine sweep) saat masuk dan saat hover. Teks deskripsi tetap, **tapi verifikasi frasa asal penghargaan** (bagian 10).
- **Testimoni:** bila `testimonials` terisi, tampilkan sebagai **gelembung chat gaya WhatsApp** (avatar, nama, jenjang, bubble berisi kutipan, centang dua) yang muncul bergantian seperti percakapan. Bila kosong: satu bubble placeholder "Kisah sukses siswa Genza Pacitan segera hadir", bukan blok kosong besar.

**[ANIMASI]** Bubble masuk berurutan dari kiri/kanan bergantian, ada indikator "mengetik…" singkat (≤ 600ms) sebelum bubble pertama muncul.

### 6.9 Galeri
Bila `gallery` terisi: **polaroid** miring acak (±3°) dalam masonry; hover meluruskan & mengangkat; klik membuka lightbox. Dua baris marquee berlawanan arah pada desktop. Bila kosong: **sembunyikan section** (atau satu strip "Galeri segera hadir").

### 6.10 Alur Pendaftaran — **Jalur gelombang**
Tiga langkah di sepanjang **satu garis gelombang SVG** yang tergambar saat scroll, dengan penanda "G" kuning yang berjalan di sepanjang garis:
1. Tes Diagnostik — petakan kemampuan awal
2. Konsultasi — pilih program & jadwal bersama admin
3. Mulai Belajar — bergabung & pantau perkembangan

Tombol "Mulai dari langkah 1" → `waLink()` dengan pesan kontekstual.
**[ANIMASI]** `stroke-dashoffset` terikat scroll (scrub); tiap langkah mekar (scale + fade) saat penanda tiba. Mobile: garis vertikal bergelombang.

### 6.11 Biaya / Promo
Tetap: bila `pricing` null → kartu "Info biaya & promo terbaru? Hubungi admin kami" + tombol WA. Gaya: kartu kuning-lembut dengan ornamen gelombang. Bila terisi: tabel paket dengan highlight paket populer.

### 6.12 FAQ
Akordeon tunggal (satu terbuka sekali). Ikon "+" berputar menjadi "×", tinggi konten beranimasi halus (`grid-template-rows: 0fr → 1fr`). Pertanyaan tetap dari v1. Opsional: tampilkan jawaban pertama sudah terbuka.

### 6.13 Lokasi & Kontak
Split: kiri tiga kartu info (alamat, jam operasional, kontak/Instagram), kanan peta dalam bingkai membulat dengan bayangan kuning offset. Pin kustom "G" kuning jatuh dengan bounce saat peta masuk viewport. Tombol "Buka rute di Google Maps". Bila `mapsEmbedUrl` kosong → ilustrasi peta stylized + tombol.

### 6.14 CTA Penutup + Footer
- Section biru penuh: **gelombang naik dari bawah** mengisi layar (scrub), headline besar "Yuk, naik level bareng Genza Pacitan!", tombol WA kuning magnetic.
- Footer `--blue-900`: tautan lengkap (termasuk Keunggulan, Galeri, FAQ), alamat, Instagram, tautan genzaeducation.com, dan **wordmark "genza" raksasa** (outline/semi-transparan) memenuhi lebar di dasar footer.

---

## 7. Sistem Animasi

### 7.1 Library & implementasi
- **GSAP + ScrollTrigger** (gratis), pin versi eksak, dimuat `defer`. Total JS animasi ≤ ~100KB gzip.
- Alternatif ringan untuk reveal sederhana: `IntersectionObserver` + CSS transition.
- Bila stack proyek React/Next: gunakan `gsap.context()` di `useEffect`/`useLayoutEffect` dan lakukan `ctx.revert()` saat unmount; registrasi plugin sekali.
- Jangan pakai scroll-jacking. Pin (`pin: true`) maksimal 1 section dan tidak lebih dari ±1,5 tinggi viewport.

### 7.2 Koreografi

| Elemen | Pemicu | Efek | Durasi | Easing |
|---|---|---|---|---|
| H1 hero | Load | Naik 24px + fade per kata | .7s, stagger .06 | out |
| Gelombang hero | Load, loop | translateX bolak-balik 3 kecepatan | 18/26/34s | linear |
| Chip melayang | Loop | Sinus ±8px, fase berbeda | 5–7s | inout |
| Word-cycler | Interval | Slide vertikal | 2.2s/siklus | inout |
| Count-up | Masuk viewport (sekali) | 0 → nilai | 1.4s | out |
| Pernyataan Tentang | Scroll (scrub) | Opacity kata abu → gelap + highlight | mengikuti scroll | — |
| Panel Program | Klik | Crossfade + geser 16px | .45s | inout |
| Orbit fasilitas | Masuk viewport | Node stagger + ring terlukis | 1.2s | out |
| Bento tile | Masuk viewport | Scale .96→1 + fade, stagger | .7s | out |
| Plakat penghargaan | Masuk/hover | Kilau menyapu | .9s | inout |
| Bubble testimoni | Masuk viewport | Slide + "mengetik…" | .5s | out |
| Jalur alur daftar | Scroll (scrub) | Garis tergambar + marker | mengikuti scroll | — |
| Gelombang CTA | Scroll (scrub) | Naik dari bawah | mengikuti scroll | — |
| Tombol utama | Hover (desktop) | Magnetic ≤ 8px | .2s | out |

### 7.3 Pola kode kunci

**Reveal aman (konten tetap terlihat tanpa JS):**
```css
/* hanya sembunyikan saat JS aktif DAN pengguna tidak minta reduced motion */
.js .reveal { opacity: 0; transform: translateY(24px); }
@media (prefers-reduced-motion: reduce) {
  .js .reveal { opacity: 1; transform: none; }
}
```
```js
document.documentElement.classList.add('js');
```

**Gelombang berloop tanpa putus (SVG selebar 200%, geser -50%):**
```css
.wave-layer { width: 200%; animation: drift 26s linear infinite; }
@keyframes drift { to { transform: translateX(-50%); } }
```

**Garis jalur tergambar saat scroll:**
```js
const path = document.querySelector('#journey-path');
const len = path.getTotalLength();
path.style.strokeDasharray = len;
path.style.strokeDashoffset = len;
gsap.to(path, {
  strokeDashoffset: 0, ease: 'none',
  scrollTrigger: { trigger: '#alur', start: 'top 70%', end: 'bottom 60%', scrub: true }
});
```

### 7.4 Aturan wajib animasi
1. Hanya animasikan `transform` & `opacity` (hindari `top/left/width/height/box-shadow` beranimasi).
2. `will-change` hanya pada elemen yang benar-benar beranimasi dan dilepas setelah selesai.
3. **`prefers-reduced-motion: reduce`:** matikan loop, parallax, scrub, dan count-up (langsung tampil nilai akhir); ganti dengan fade sederhana ≤ 200ms atau tanpa animasi.
4. Animasi ambient berhenti saat tab tidak aktif / elemen di luar viewport (`IntersectionObserver`).
5. Mobile / perangkat lemah (`navigator.hardwareConcurrency <= 4` atau `connection.saveData`): kurangi lapisan gelombang ke 2, matikan tilt & magnetic, orbit diganti stepper.
6. Tidak boleh ada layout shift akibat animasi (CLS < 0.05). Beri ukuran tetap pada elemen beranimasi.
7. Konten penting (H1, CTA, alamat) tidak boleh bergantung pada animasi untuk bisa terbaca.

---

## 8. Performa & Aksesibilitas

**Budget**
- LCP < 2.5 detik (4G), CLS < 0.05, INP < 200ms; Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.
- JS total ≤ ~120KB gzip, CSS ≤ ~35KB gzip, hanya 2 font family (subset, preload font display).
- Gambar WebP/AVIF, `width/height`, lazy load kecuali hero. Gelombang & ornamen = SVG inline.

**Aksesibilitas**
- Kontras minimal AA (aturan warna bagian 4.1).
- Orbit & Program Finder bisa dioperasikan keyboard (`role="tablist"`/`tab`/`tabpanel`, `aria-selected`, panah kiri/kanan).
- Ring orbit yang berputar: sediakan tombol pause/play yang terlihat (WCAG 2.2.2).
- Fokus terlihat jelas (`:focus-visible` outline kuning + biru), target sentuh ≥ 44px.
- Teks alternatif untuk semua gambar bermakna; ornamen `aria-hidden="true"`.
- Link "Lewati ke konten".

---

## 9. Matriks Pelestarian Informasi (tidak boleh ada yang hilang)

| Informasi di v1 | Tampil di v2 sebagai |
|---|---|
| Profil Genza (nonformal, Yogyakarta, 150+ center) | Paragraf Tentang + Trust Bar + tile Jaringan Nasional |
| Visi "Membangun generasi cerdas dan berprestasi" | Pernyataan besar section Tentang |
| Pendekatan Gen Z | Sticker keterangan di Tentang + copy hero |
| Program SD/SMP/SMA/UTBK/Sekdin/G-Advanced | Program Finder (satu panel per program) |
| 9 fasilitas G-System | Orbit/stepper G-System (9 node) |
| 6 keunggulan | Bento grid (6 tile) |
| Tutor | Strip ringkas / carousel |
| 2 penghargaan 2024 | Plakat penghargaan |
| Testimoni | Bubble chat WhatsApp |
| Galeri | Polaroid masonry (atau disembunyikan bila kosong) |
| 3 langkah daftar | Jalur gelombang |
| Info biaya/promo | Kartu biaya |
| FAQ | Akordeon animasi |
| Alamat, jam, peta, WA, Instagram | Section Lokasi + footer + tombol WA melayang |

---

## 10. Koreksi & Verifikasi Konten (WAJIB)

Build v1 memuat deskripsi yang **tidak berasal dari riset terverifikasi**. Perbaiki sebagai berikut:

1. **Jangan menulis klaim fungsi fasilitas yang tidak pasti.** Contoh salah di v1: *G-Clinic = "Perawatan kesehatan mental"*. Ini tidak terverifikasi dan kemungkinan keliru.
2. Untuk setiap fasilitas, simpan di config:
   ```js
   { name: "G-Clinic", description: "TODO: isi sesuai penjelasan resmi HQ", descriptionVerified: false }
   ```
   Selama `descriptionVerified: false`, tampilkan hanya **nama fasilitas + deskripsi netral generik** (mis. "Bagian dari ekosistem belajar G-System"), **bukan** klaim spesifik.
3. Deskripsi penghargaan: v1 menulis asal penghargaan "dari Tim Indonesia" dan "dari Generasi Z". **Verifikasi ke HQ** sebelum tayang; bila belum pasti, cukup tulis nama penghargaan + tahun + (untuk GLMS) "inovasi GLMS".
4. Tagline resmi ("Bimbel yang Aku Banget!" vs "Bimbel yang Kamu Banget") belum dipastikan; simpan sebagai `SITE_CONFIG.tagline` agar mudah diganti.
5. Semua angka (siswa, tutor, kelulusan) tetap **tidak boleh dikarang**; sembunyikan bila null.
6. Urutan siklus G-System bersifat ilustratif (lihat 6.5).

---

## 11. Struktur Komponen yang Disarankan

Ikuti stack yang sudah ada di proyek. Pemetaan komponen:

```
Navbar            → pill melayang, scroll spy, mobile overlay
Hero              → WaveLayers, BlobFrame, FloatingChips, WordCycler
TrustBar          → CountUp, Marquee
AboutStatement    → ScrollHighlightText, StickerNote
ProgramFinder     → ProgramTabs, ProgramPanel
GSystemOrbit      → OrbitDesktop, StepperMobile, FacilityDetail
WhyBento          → BentoTile, NetworkDots
Tutors            → TutorStrip | TutorCarousel
Achievements      → AwardPlaque, ChatTestimonials
Gallery           → PolaroidMasonry (hidden if empty)
JourneySteps      → WavePath, StepMarker
PricingCard · Faq · Location · ClosingCta · Footer
Shared            → ImagePlaceholder, MagneticButton, TiltCard, WaButton, SectionDivider(wave variants)
```

`SITE_CONFIG`, `PROGRAMS`, `FACILITIES`, `WHY_ITEMS`, `FAQS` dipusatkan di satu file data agar admin cabang mudah mengubah teks tanpa menyentuh komponen.

---

## 12. Urutan Pengerjaan (iteratif)

**Fase 1: Fondasi & identitas (wajib dulu)**
1. Token v2, font, ritme warna terang–gelap, pembatas gelombang SVG.
2. Navbar baru (6 menu, pill melayang).
3. Hero biru + gelombang + blob + chip + word-cycler (animasi dasar).
4. Ganti semua placeholder emoji dengan `<ImagePlaceholder>`; pakai logo asli/wordmark.

**Fase 2: Section inti**
5. Tentang (pernyataan besar), Trust Bar (count-up).
6. Program Finder, lalu Siklus G-System (+ versi mobile).
7. Bento Kenapa Genza; tutor/galeri kondisional.
8. Prestasi (plakat + bubble WA), Alur daftar, FAQ, Lokasi, CTA + Footer.

**Fase 3: Polesan gerak**
9. Scroll-scrub (pernyataan, jalur, gelombang CTA), magnetic, tilt, shine.
10. Mode hemat (mobile/saveData), `prefers-reduced-motion`, audit performa & aksesibilitas.

Di akhir tiap fase, jalankan Lighthouse mobile dan uji di lebar 360 / 768 / 1280.

---

## 13. Acceptance Checklist

- [ ] Hero biru tua dengan gelombang berlapis (termasuk kuning) dan dot grid; kuning terlihat jelas di halaman.
- [ ] Tidak ada dua section berurutan yang memakai pola grid kartu yang sama; tiap section punya bentuk interaksi berbeda sesuai bagian 6.
- [ ] Ritme terang–gelap sesuai bagian 5.3.
- [ ] Navbar maks. 6 menu, tidak ada teks turun baris di ≥ 1024px, pill aktif meluncur.
- [ ] Tidak ada emoji sebagai placeholder; section tutor/galeri/testimoni kosong diringkas atau disembunyikan.
- [ ] Program Finder dan Orbit G-System bisa dipakai dengan keyboard dan sentuh; versi mobile orbit = stepper.
- [ ] Semua informasi pada matriks bagian 9 masih tampil.
- [ ] Deskripsi fasilitas tidak memuat klaim tak terverifikasi (G-Clinic dikoreksi); flag `descriptionVerified` diterapkan.
- [ ] Animasi hanya memakai `transform`/`opacity`; `prefers-reduced-motion` mematikan loop/scrub/parallax dan semua konten tetap terbaca; tersedia tombol pause pada orbit.
- [ ] Tanpa JS, seluruh konten tetap terlihat.
- [ ] Skor Lighthouse mobile sesuai budget (Perf ≥ 90, A11y ≥ 95, SEO ≥ 95), CLS < 0.05.
- [ ] Semua CTA WA tetap memakai `waLink()` dengan pesan kontekstual; event `click_whatsapp` terpasang.
- [ ] Akhiri jawaban dengan daftar TODO untuk pemilik cabang (logo vektor, foto asli, deskripsi fasilitas resmi, nomor WA, harga, tutor, testimoni, jam, link Maps).
