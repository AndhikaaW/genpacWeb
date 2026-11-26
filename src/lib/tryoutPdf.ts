import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import bannerUrl from '../assets/banner-g-center.png'

export interface PdfResult { nisg: string; nama_siswa: string; jenjang: string; sekolah: string; mapel: string; benar: number; salah: number; kosong: number; nilai: number; jumlah_soal?: number }

const percentile = (values: number[], p: number) => {
  if (!values.length) return null
  const index = (values.length - 1) * p
  const lower = Math.floor(index); const upper = Math.ceil(index)
  return values[lower] + (values[upper] - values[lower]) * (index - lower)
}
const format = (value: number | null) => value == null ? '-' : Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, '')
const key = (value: unknown) => String(value ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase()

export function downloadTryOutPdf(agenda: string, studentRows: PdfResult[], allRows: PdfResult[]) {
  const student = studentRows[0]
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 14
  const pageWidth = 210
  const bannerHeight = 42.3
  pdf.addImage(bannerUrl, 'PNG', 0, 0, pageWidth, bannerHeight)
  pdf.setTextColor(34, 83, 159); pdf.setFontSize(14); pdf.setFont('helvetica', 'bold'); pdf.text('LAPORAN HASIL NILAI G-TRY OUT', margin, 57)
  pdf.setTextColor(30, 30, 30); pdf.setFontSize(10); pdf.setFont('helvetica', 'normal'); pdf.text(`Agenda: ${agenda}`, margin, 65)
  autoTable(pdf, { startY: 72, theme: 'plain', styles: { fontSize: 10, cellPadding: 1.5 }, columnStyles: { 0: { fontStyle: 'bold', cellWidth: 28 }, 2: { fontStyle: 'bold', cellWidth: 30 } }, body: [['Nama', student.nama_siswa, 'NISG', student.nisg], ['Jenjang', student.jenjang, 'Sekolah', student.sekolah]] })
  const firstTableY = (pdf as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 58
  pdf.setFont('helvetica', 'bold'); pdf.text('Nilai Siswa', margin, firstTableY + 10)
  autoTable(pdf, { startY: firstTableY + 14, head: [['No', 'Mapel', 'JML SOAL', 'BNR', 'SLH', 'KSG', 'Nilai']], body: studentRows.map((row, index) => [index + 1, row.mapel, row.jumlah_soal ?? row.benar + row.salah + row.kosong, row.benar, row.salah, row.kosong, format(row.nilai)]), headStyles: { fillColor: [34, 83, 159] }, styles: { fontSize: 9 } })
  const secondY = (pdf as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 100
  pdf.setFont('helvetica', 'bold'); pdf.text('Sebaran Nilai Seluruh Siswa', margin, secondY + 10)
  const stats = studentRows.map((studentRow) => { const scores = allRows.filter((row) => row.mapel === studentRow.mapel).map((row) => row.nilai).filter(Number.isFinite).sort((a, b) => a - b); return [studentRow.mapel, scores.length ? format(scores[0]) : '-', format(percentile(scores, .25)), format(percentile(scores, .5)), format(percentile(scores, .75)), scores.length ? format(scores[scores.length - 1]) : '-', scores.length ? format(scores.reduce((sum, value) => sum + value, 0) / scores.length) : '-'] })
  autoTable(pdf, { startY: secondY + 14, head: [['No', 'Mapel', 'Min', 'Q1', 'Q2', 'Q3', 'Max', 'Rerata']], body: stats.map((row, index) => [index + 1, ...row]), headStyles: { fillColor: [34, 83, 159] }, styles: { fontSize: 8 } })
  const validStudentRows = studentRows.filter((row) => Number.isFinite(row.nilai))
  const total = validStudentRows.reduce((sum, row) => sum + row.nilai, 0); const average = validStudentRows.length ? total / validStudentRows.length : 0
  const studentKey = key(student.nisg)
  const eligible = allRows.filter((row) => key(row.jenjang) === key(student.jenjang) && Number.isFinite(row.nilai))
  const totalsByStudent = new Map<string, number>()
  for (const row of eligible) totalsByStudent.set(key(row.nisg), (totalsByStudent.get(key(row.nisg)) ?? 0) + row.nilai)
  const orderedTotals = [...totalsByStudent.values()].sort((a, b) => b - a)
  const studentTotal = totalsByStudent.get(studentKey) ?? total
  const rank = totalsByStudent.has(studentKey) ? orderedTotals.findIndex((value) => value === studentTotal) + 1 : 0
  const lastY = (pdf as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 170
  const conclusionY = lastY + 10
  const boxWidth = 182
  const boxHeight = 48
  pdf.setFillColor(245, 248, 253); pdf.setDrawColor(215, 225, 240); pdf.roundedRect(margin, conclusionY, boxWidth, boxHeight, 3, 3, 'FD')
  pdf.setFillColor(34, 83, 159); pdf.roundedRect(margin, conclusionY, boxWidth, 10, 3, 3, 'F'); pdf.rect(margin, conclusionY + 7, boxWidth, 3, 'F')
  pdf.setTextColor(255, 255, 255); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.text('KESIMPULAN HASIL EVALUASI', margin + 6, conclusionY + 6.5)
  pdf.setTextColor(45, 55, 72); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.text(`Ringkasan sementara untuk ${student.nama_siswa}`, margin + 6, conclusionY + 17)
  const metricY = conclusionY + 23; const metricWidth = (boxWidth - 24) / 3
  const metrics = [['TOTAL NILAI', format(total)], ['RATA-RATA', format(average)], ['PERINGKAT', rank > 0 ? String(rank) : '-']]
  metrics.forEach(([label, value], index) => { const x = margin + 6 + index * (metricWidth + 6); pdf.setFillColor(index === 2 ? 255 : 255, index === 2 ? 243 : 255, index === 2 ? 204 : 255); pdf.setDrawColor(index === 2 ? 234 : 225, index === 2 ? 179 : 230, index === 2 ? 8 : 240); pdf.roundedRect(x, metricY, metricWidth, 18, 2, 2, 'FD'); pdf.setTextColor(90, 100, 115); pdf.setFontSize(7); pdf.setFont('helvetica', 'bold'); pdf.text(label, x + metricWidth / 2, metricY + 5.5, { align: 'center' }); pdf.setTextColor(index === 2 ? 150 : 34, index === 2 ? 90 : 83, index === 2 ? 0 : 159); pdf.setFontSize(13); pdf.text(value, x + metricWidth / 2, metricY + 14, { align: 'center' }) })
  pdf.save(`hasil-${agenda}-${student.nisg}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.pdf')
}
