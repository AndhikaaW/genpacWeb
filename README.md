# Genza Education Landing Page

Landing page modern untuk Genza Education Cabang Pacitan dengan desain premium dan responsif.

## Fitur

- ✨ Desain modern dengan Tailwind CSS
- 📱 Fully responsive (mobile, tablet, desktop)
- 🎨 Warna brand sesuai Genza (biru, kuning, putih)
- 🔗 WhatsApp integration untuk konversi
- 🎯 SEO friendly
- ♿ Aksesibilitas WCAG AA

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons

## Setup

1. Install dependencies:
```bash
npm install
```

2. Jalankan development server:
```bash
npm run dev
```

3. Buka browser di http://localhost:3000

## Build

```bash
npm run build
```

Build output akan ada di folder `dist/`.

## Configuration

Edit `src/lib/config.ts` untuk mengubah:
- Nomor WhatsApp
- Alamat
- Jam operasional
- Data program
- Data tutor
- Data testimoni
- Data galeri
- Data harga

## TODO untuk pemilik cabang

1. Ganti logo (tambahkan `public/logo-genza.svg`)
2. Ganti foto hero (tambahkan `public/hero.webp`)
3. Ganti foto gedung (tambahkan `public/building.webp`)
4. Siapkan data tutor lengkap
5. Siapkan data testimoni (dengan izin)
6. Siapkan galeri foto
7. Isi data harga
8. Isi jam operasional
9. Siapkan link Google Maps embed
10. Ganti nomor WhatsApp

## Deployment

### Vercel

1. Push ke GitHub
2. Import project ke Vercel
3. Vercel akan otomatis build dan deploy

### Netlify

1. Build folder: `dist`
2. Settings > Build command: `npm run build`
3. Settings > Publish directory: `dist`

### Cloudflare Pages

1. Connect ke GitHub
2. Build command: `npm run build`
3. Output directory: `dist`
