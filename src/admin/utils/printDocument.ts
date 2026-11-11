import type { RegistrationModel } from '../types'
import { formatCurrency } from '../types'

const STATEMENT_POINTS = [
  'Dengan kesungguhan hati dan kesanggupan saya untuk tekun, konsisten berusaha sekeras-kerasnya mencapai cita-cita dan sukses tertinggi saya dengan menyiapkan diri saya untuk fokus dalam belajar di Genza Education.',
  'Mematuhi seluruh aturan dan tata tertib siswa yang berlaku di Genza Education.',
  'Bersedia mengikuti seluruh kegiatan belajar mengajar selama program dilaksanakan minimal 85% dari jumlah jam bimbingan yang tersedia.',
  'Bersedia mengikuti seluruh rangkaian G-Evaluation yang dilaksanakan oleh Genza Education untuk keperluan evaluasi belajar.',
  'Bersedia mengikuti remedial tes jika hasil yang dicapai dalam G-Evaluation di bawah kriteria minimal yang ditetapkan oleh Genza Education.',
  'Bersedia melakukan pembayaran bimbingan sampai dengan pelunasan sesuai jatuh tempo yang ditentukan, dengan rincian biaya sbb :',
]

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)
}

function textOrDash(value: string | null | undefined) {
  return value?.trim() ? escapeHtml(value) : '-'
}

function formatLongDate(value: Date | null | undefined) {
  return value
    ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(value)
    : '-'
}

function infoRow(label: string, value: string) {
  return `<div class="info-row"><span class="info-label">${label}</span><span class="info-value">${value}</span></div>`
}

export function printRegistration(r: RegistrationModel, programs: string[]) {
  const selectedPrograms = new Set(r.programBimbingan)
  const programItems = programs.map((program) =>
    `<div class="program-item"><span class="check ${selectedPrograms.has(program) ? 'selected' : ''}"></span>${escapeHtml(program)}</div>`
  ).join('')

  const selectedInterest = r.guidanceData.kelasDiGenza.trim().toLocaleLowerCase('id-ID')
  const interestOptions = ['Reguler', 'Akselerasi', 'Olimpiade'].map((option) => {
    const isSelected = selectedInterest === option.toLocaleLowerCase('id-ID')
    return `<span class="interest-option"><span class="check ${isSelected ? 'selected' : ''}"></span>${option}</span>`
  }).join('')

  const paymentRows = [
    `<tr><td>ASF / PENDAFTARAN</td><td>Rp ${formatCurrency(r.paymentData.asfPendaftaran)}</td><td></td></tr>`,
    `<tr><td>BIMBINGAN</td><td>Rp ${formatCurrency(r.paymentData.biayaBimbingan)}</td><td></td></tr>`,
    ...r.paymentData.installments.map((installment, index) => {
      const label = installment.label.toLowerCase().includes('dp')
        ? `ANGSURAN ${index + 1} ${installment.persentase}% (ASF)`
        : `ANGSURAN ${index + 1} ${installment.persentase}%`
      const row = `<tr><td>${label}</td><td>Rp ${formatCurrency(installment.nominal)}</td><td>Tgl ${formatLongDate(installment.tanggalJatuhTempo)}</td></tr>`
      const downPaymentRow = index === 0
        ? `<tr><td>(UM)</td><td>Rp -</td><td>Tgl ${formatLongDate(installment.tanggalJatuhTempo)}</td></tr>`
        : ''
      return row + downPaymentRow
    }),
  ].join('')

  const studentName = escapeHtml(r.studentData.namaSiswa)
  const statementName = escapeHtml(r.statementData.namaPernyataan || r.studentData.namaSiswa)
  const fullName = escapeHtml(r.parentData.namaAyah || r.parentData.namaIbu)
  const today = formatLongDate(r.statementData.waktuDisetujui || r.createdAt)
  const periodStart = formatLongDate(r.guidanceData.startBimbinganDari)
  const periodEnd = formatLongDate(r.guidanceData.startBimbinganSd)

  const html = `<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Formulir Pendaftaran GNZ - ${studentName}</title>
  <style>
    @page { size: A4 portrait; margin: 8mm 10mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111; background: #fff; font-family: Arial, sans-serif; font-size: 9pt; line-height: 1.17; }
    .page { width: 100%; max-width: 190mm; margin: 0 auto; }
    h1 { margin: 0 0 5px; padding: 7px 8px; border-radius: 5px; background: #203f91; color: #fff; text-align: center; font-size: 14pt; font-weight: 700; }
    h2 { margin: 0 0 3px; padding: 4px 8px; background: #dfe7f0; color: #111; font-size: 9pt; font-weight: 700; letter-spacing: 3px; }
    .program-box { margin: 0 0 7px; border: 1px solid #222; padding: 5px 9px 6px; }
    .program-title { margin: 0 0 4px; text-align: center; font-size: 10pt; font-weight: 700; }
    .programs { display: grid; grid-auto-flow: column; grid-template-rows: repeat(4, auto); grid-template-columns: 1fr 1fr; column-gap: 20px; width: 90%; margin: 0 auto; }
    .program-item { display: flex; align-items: center; gap: 5px; min-height: 12px; }
    .check { display: inline-block; width: 10px; height: 10px; flex: 0 0 10px; border: 1px solid #111; }
    .check.selected { background: #111; }
    .data-section { margin: 0 0 5px; }
    .info-row { display: grid; grid-template-columns: 215px minmax(0, 1fr); min-height: 15px; align-items: end; }
    .info-label { font-weight: 700; white-space: nowrap; }
    .info-value { min-height: 15px; border-bottom: 1px solid #333; overflow-wrap: anywhere; }
    .interest-row { display: grid; grid-template-columns: 215px 1fr; min-height: 15px; align-items: end; }
    .interest-options { display: flex; align-items: center; gap: 15px; min-height: 15px; border-bottom: 1px solid #333; }
    .interest-option { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
    .statement-section h2 { margin-bottom: 2px; }
    .statement-notice { margin: 0 0 5px; color: #e11d48; text-align: right; font-size: 8pt; font-weight: 700; }
    .statement-intro { margin: 0 0 3px; }
    .points { margin: 0; padding: 0; list-style: none; counter-reset: statement; }
    .points li { position: relative; margin: 0 0 2px; padding-left: 18px; counter-increment: statement; }
    .points li::before { position: absolute; left: 0; content: counter(statement) '.'; }
    .payment-frame { margin-top: 5px; border: 1px solid #222; padding: 5px 8px; }
    .payment-table { width: 100%; border-collapse: collapse; }
    .payment-table td { padding: 2px 3px; vertical-align: top; }
    .payment-table td:first-child { width: 65%; }
    .payment-table td:nth-child(2) { width: 20%; text-align: right; white-space: nowrap; }
    .payment-table td:last-child { width: 15%; white-space: nowrap; }
    .date-line { margin: 12px 0 0; text-align: right; text-decoration: underline; text-underline-offset: 2px; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 9px; text-align: center; }
    .signature-label { min-height: 78px; }
    .signature-label span { display: block; }
    .signature-name { min-height: 17px; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } .page { break-inside: avoid; } }
    @media screen { body { padding: 12px; } .page { min-height: 277mm; padding: 0; } }
  </style>
</head>
<body>
  <main class="page">
    <h1>FORMULIR PENDAFTARAN SISWA BARU</h1>
    <section class="program-box">
      <div class="program-title">PILIHAN PROGRAM BIMBINGAN</div>
      <div class="programs">${programItems}</div>
    </section>

    <section class="data-section">
      <h2>DATA SISWA</h2>
      ${infoRow('Nama siswa', studentName)}
      ${infoRow('Tempat, tanggal lahir', `${textOrDash(r.studentData.tempatLahir)}, ${formatLongDate(r.studentData.tanggalLahir)}`)}
      ${infoRow('Agama', textOrDash(r.studentData.agama))}
      ${infoRow('No. WA', textOrDash(r.studentData.noWa))}
      ${infoRow('E-mail', textOrDash(r.studentData.email))}
      ${infoRow('Sekolah/Kelas/Jurusan', textOrDash(r.studentData.sekolahKelasJurusan))}
    </section>

    <section class="data-section">
      <h2>DATA ORANG TUA / WALI</h2>
      ${infoRow('Nama ayah', textOrDash(r.parentData.namaAyah))}
      ${infoRow('HP / e-mail / WA (ayah)', textOrDash(r.parentData.kontakAyah))}
      ${infoRow('Pekerjaan (ayah)', textOrDash(r.parentData.pekerjaanAyah))}
      ${infoRow('Nama ibu', textOrDash(r.parentData.namaIbu))}
      ${infoRow('HP / e-mail / WA (ibu)', textOrDash(r.parentData.kontakIbu))}
      ${infoRow('Pekerjaan (ibu)', textOrDash(r.parentData.pekerjaanIbu))}
      ${infoRow('Alamat', textOrDash(r.guidanceData.alamat))}
    </section>

    <section class="data-section">
      <h2>DATA BIMBINGAN</h2>
      ${infoRow('Daftar untuk kelas', textOrDash(r.guidanceData.daftarUntukKelas))}
      <div class="interest-row"><span class="info-label">Minat Kelas</span><span class="interest-options">${interestOptions}</span></div>
      ${infoRow('Start Bimbingan', `${periodStart} s.d ${periodEnd}`)}
      ${infoRow('Kelas di Genza', textOrDash(r.guidanceData.kelasDiGenza))}
    </section>

    <section class="statement-section">
      <h2>SURAT PERNYATAAN SISWA</h2>
      <p class="statement-notice">WAJIB DIISI LENGKAP OLEH PENDAFTAR</p>
      <p class="statement-intro">Dengan ini saya ${statementName} siswa Genza Education, jenjang ${textOrDash(r.statementData.jenjang)} menyatakan;</p>
      <ol class="points">${STATEMENT_POINTS.map((point) => `<li>${point}</li>`).join('')}</ol>
    </section>

    <div class="payment-frame"><table class="payment-table"><tbody>${paymentRows}</tbody></table></div>
    <p class="date-line">Pacitan, ${today}</p>
    <section class="signatures">
      <div>
        <div class="signature-label"><span>Mengetahui,</span><span>Orang Tua / Wali</span></div>
        <div class="signature-name">${fullName || '&nbsp;'}</div>
      </div>
      <div>
        <div class="signature-label"><span>&nbsp;</span><span>Siswa</span></div>
        <div class="signature-name">${studentName}</div>
      </div>
      <div>
        <div class="signature-label"><span>&nbsp;</span><span>Petugas Cabang</span></div>
        <div class="signature-name">${textOrDash(r.petugasCabang)}</div>
      </div>
    </section>
  </main>
  <script>window.onload = function () { window.print() }</script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=1100,height=800')
  if (!win) {
    alert('Popup diblokir. Izinkan popup untuk mencetak dokumen.')
    return
  }
  win.document.write(html)
  win.document.close()
}
