import { useState } from 'react'
import { updatePayment } from '../useAdmin'
import { formatCurrency, formatDate } from '../types'
import type { RegistrationModel, Installment } from '../types'

const numberFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })

function parseAmount(value: string): number {
  const digits = value.replace(/\D/g, '')
  return digits ? Number(digits) : 0
}

function formatAmountInput(value: number): string {
  return value ? numberFormatter.format(value) : ''
}

function calcInstallments(biaya: number, asf: number, existing: Installment[], baseDate: Date): Installment[] {
  const total = biaya + asf
  const percents = [40, 15, 15, 15, 15]
  const labels = ['DP (40%)', 'Angsuran 2 (15%)', 'Angsuran 3 (15%)', 'Angsuran 4 (15%)', 'Angsuran 5 (15%)']
  return percents.map((pct, i) => {
    const dueDate = new Date(baseDate)
    dueDate.setMonth(dueDate.getMonth() + i)
    const ex = existing[i]
    return {
      label: labels[i],
      persentase: pct,
      nominal: Math.round(total * pct / 100),
      tanggalJatuhTempo: ex?.tanggalJatuhTempo ?? dueDate,
      sudahBayar: ex?.sudahBayar ?? false,
      tanggalBayar: ex?.tanggalBayar ?? null,
    }
  })
}

export default function PaymentPanel({ registration: r, onBack }: { registration: RegistrationModel; onBack: () => void }) {
  const [biaya, setBiaya] = useState(r.paymentData.biayaBimbingan)
  const [asf, setAsf] = useState(r.paymentData.asfPendaftaran)
  const [installments, setInstallments] = useState<Installment[]>(
    r.paymentData.installments.length === 5
      ? r.paymentData.installments
      : calcInstallments(r.paymentData.biayaBimbingan, r.paymentData.asfPendaftaran, [], r.createdAt)
  )
  const [saving, setSaving] = useState(false)

  const recalc = (b: number, a: number) => {
    setInstallments(calcInstallments(b, a, installments, r.createdAt))
  }

  const updateInstallment = (i: number, patch: Partial<Installment>) => {
    setInstallments((prev) => prev.map((item, idx) => idx === i ? { ...item, ...patch } : item))
  }

  const save = async () => {
    setSaving(true)
    try {
      await updatePayment(r.id, { biayaBimbingan: biaya, asfPendaftaran: asf, installments })
      alert('Pembayaran disimpan')
      onBack()
    } catch {
      alert('Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <button onClick={onBack} className="text-sm text-blue-600 hover:underline mb-4 inline-block">← Kembali ke Detail</button>
      <h2 className="text-xl font-bold text-slate-800 mb-1">Kelola Pembayaran</h2>
      <p className="text-sm text-slate-500 mb-6">{r.studentData.namaSiswa} · {r.kodePendaftaran}</p>

      {/* Biaya */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 mb-4 space-y-4">
        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Biaya</h3>
        <div>
          <label className="text-sm text-slate-500 mb-1 block">Biaya Bimbingan</label>
          <input
            type="text"
            inputMode="numeric"
            value={formatAmountInput(biaya)}
            onChange={(e) => { const v = parseAmount(e.target.value); setBiaya(v); recalc(v, asf) }}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-sm text-slate-500 mb-1 block">ASF/Pendaftaran</label>
          <input
            type="text"
            inputMode="numeric"
            value={formatAmountInput(asf)}
            onChange={(e) => { const v = parseAmount(e.target.value); setAsf(v); recalc(biaya, v) }}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="0"
          />
        </div>
        <p className="text-sm text-slate-400">Total: <strong className="text-slate-700">{formatCurrency(biaya + asf)}</strong></p>
      </div>

      {/* Angsuran */}
      <div className="space-y-3 mb-6">
        {installments.map((inst, i) => (
          <div
            key={i}
            className={`bg-white border rounded-2xl p-4 ${inst.sudahBayar ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-slate-700">{inst.label}</span>
              <span className="text-xs text-slate-400">{inst.persentase}%</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nominal</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatAmountInput(inst.nominal)}
                  onChange={(e) => updateInstallment(i, { nominal: parseAmount(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Jatuh Tempo</label>
                <input
                  type="date"
                  value={inst.tanggalJatuhTempo ? inst.tanggalJatuhTempo.toISOString().slice(0, 10) : ''}
                  onChange={(e) => updateInstallment(i, { tanggalJatuhTempo: e.target.value ? new Date(e.target.value) : null })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-200"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inst.sudahBayar}
                onChange={(e) => updateInstallment(i, { sudahBayar: e.target.checked, tanggalBayar: e.target.checked ? new Date() : null })}
                className="rounded"
              />
              <span className="text-sm font-medium text-slate-700">
                {inst.sudahBayar ? `Lunas${inst.tanggalBayar ? ' — ' + formatDate(inst.tanggalBayar) : ''}` : 'Belum bayar'}
              </span>
            </label>
            {inst.sudahBayar && (
              <div className="mt-2">
                <label className="text-xs text-slate-400 block mb-1">Tanggal Bayar</label>
                <input
                  type="date"
                  value={inst.tanggalBayar ? inst.tanggalBayar.toISOString().slice(0, 10) : ''}
                  onChange={(e) => updateInstallment(i, { tanggalBayar: e.target.value ? new Date(e.target.value) : null })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-200"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 transition-all shadow-md shadow-blue-200"
      >
        {saving ? 'Menyimpan...' : 'Simpan Pembayaran'}
      </button>
    </div>
  )
}
