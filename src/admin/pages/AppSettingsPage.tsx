import { useEffect, useState } from 'react'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { SITE_CONFIG } from '../../lib/config'
import AdminFormDialog from '../components/AdminFormDialog'
import AdminImageUpload from '../components/AdminImageUpload'

interface SettingsForm {
  branch: string
  whatsappNumber: string
  address: string
  openingHours: string
  instagram: string
  mapsLink: string
  mapsEmbedUrl: string
  hqWebsite: string
  buildingImage: string
}

const DEFAULT_FORM: SettingsForm = {
  branch: SITE_CONFIG.branch,
  whatsappNumber: SITE_CONFIG.whatsappNumber,
  address: SITE_CONFIG.address,
  openingHours: '',
  instagram: SITE_CONFIG.instagram,
  mapsLink: SITE_CONFIG.mapsLink,
  mapsEmbedUrl: SITE_CONFIG.mapsEmbedUrl,
  hqWebsite: SITE_CONFIG.hqWebsite,
  buildingImage: '',
}

export default function AppSettingsPage() {
  const [settings, setSettings] = useState<SettingsForm>(DEFAULT_FORM)
  const [form, setForm] = useState<SettingsForm>(DEFAULT_FORM)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => onSnapshot(doc(db, 'app_settings', 'public'), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data()
      const current: SettingsForm = {
        branch: data.branch ?? DEFAULT_FORM.branch,
        whatsappNumber: data.whatsapp_number ?? DEFAULT_FORM.whatsappNumber,
        address: data.address ?? DEFAULT_FORM.address,
        openingHours: data.opening_hours ?? DEFAULT_FORM.openingHours,
        instagram: data.instagram_url ?? DEFAULT_FORM.instagram,
        mapsLink: data.maps_link ?? DEFAULT_FORM.mapsLink,
        mapsEmbedUrl: data.maps_embed_url ?? DEFAULT_FORM.mapsEmbedUrl,
        hqWebsite: data.hq_website ?? DEFAULT_FORM.hqWebsite,
        buildingImage: data.building_image ?? '',
      }
      setSettings(current)
      setForm(current)
    }
    setLoading(false)
    setError(null)
  }, (readError) => {
    console.error('Gagal membaca pengaturan aplikasi:', readError)
    setError('Pengaturan gagal dimuat. Periksa koneksi dan izin Firestore.')
    setLoading(false)
  }), [])

  const save = async () => {
    const whatsappNumber = form.whatsappNumber.replace(/\D/g, '')
    if (!form.branch.trim() || !form.address.trim()) throw new Error('Nama cabang dan alamat wajib diisi.')
    if (whatsappNumber.length < 8 || whatsappNumber.length > 15) throw new Error('Nomor WhatsApp harus berisi 8 sampai 15 digit, termasuk kode negara.')

    const payload = {
      branch: form.branch.trim(),
      whatsapp_number: whatsappNumber,
      address: form.address.trim(),
      opening_hours: form.openingHours.trim(),
      instagram_url: form.instagram.trim(),
      maps_link: form.mapsLink.trim(),
      maps_embed_url: form.mapsEmbedUrl.trim(),
      hq_website: form.hqWebsite.trim(),
      building_image: form.buildingImage,
      updated_at: serverTimestamp(),
    }
    await setDoc(doc(db, 'app_settings', 'public'), payload, { merge: true })
    setSettings({ ...form, whatsappNumber })
    setForm((current) => ({ ...current, whatsappNumber }))
  }

  const updateField = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => setForm((current) => ({ ...current, [key]: value }))

  return (
    <div className="mx-auto max-w-screen-xl p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-slate-800">Pengaturan Aplikasi</h1><p className="mt-1 text-sm text-slate-500">Informasi cabang yang dipakai di landing page dan tautan kontak.</p></div>
        <button onClick={() => { setForm(settings); setShowForm(true) }} disabled={loading} className="min-h-10 flex-shrink-0 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Ubah Pengaturan</button>
      </div>

      <AdminFormDialog open={showForm} onOpenChange={setShowForm} title="Pengaturan Aplikasi" description="Perubahan akan diterapkan pada landing page setelah disimpan." onSubmit={save}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 text-sm font-medium text-slate-700">Nama cabang <span className="text-red-600">*</span>
            <input required value={form.branch} onChange={(event) => updateField('branch', event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-slate-700">Nomor WhatsApp <span className="text-red-600">*</span>
            <input required inputMode="tel" value={form.whatsappNumber} onChange={(event) => updateField('whatsappNumber', event.target.value)} placeholder="6281234567890" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
            <span className="block text-xs font-normal text-slate-500">Gunakan kode negara, tanpa tanda +. Contoh: 62812...</span>
          </label>
        </div>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Alamat <span className="text-red-600">*</span>
          <textarea required rows={2} value={form.address} onChange={(event) => updateField('address', event.target.value)} className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Jam operasional
          <input value={form.openingHours} onChange={(event) => updateField('openingHours', event.target.value)} placeholder="Senin–Sabtu, 08.00–17.00" className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5 text-sm font-medium text-slate-700">URL Instagram
            <input type="url" value={form.instagram} onChange={(event) => updateField('instagram', event.target.value)} placeholder="https://instagram.com/..." className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-slate-700">Link Google Maps
            <input type="url" value={form.mapsLink} onChange={(event) => updateField('mapsLink', event.target.value)} placeholder="https://maps.google.com/..." className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
          </label>
        </div>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">URL embed Google Maps
          <input type="url" value={form.mapsEmbedUrl} onChange={(event) => updateField('mapsEmbedUrl', event.target.value)} placeholder="https://www.google.com/maps/embed?..." className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium text-slate-700">Website Genza HQ
          <input type="url" value={form.hqWebsite} onChange={(event) => updateField('hqWebsite', event.target.value)} placeholder="https://..." className="w-full rounded-md border border-slate-300 px-3 py-2.5 font-normal outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
        </label>
        <AdminImageUpload value={form.buildingImage} onChange={(image) => updateField('buildingImage', image)} label="Foto gedung cabang" />
      </AdminFormDialog>

      {loading ? <p className="py-12 text-center text-slate-500">Memuat pengaturan...</p> : error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ['Cabang', settings.branch], ['WhatsApp', settings.whatsappNumber], ['Alamat', settings.address],
              ['Jam operasional', settings.openingHours || 'Belum diatur'], ['Instagram', settings.instagram || 'Belum diatur'],
              ['Link Google Maps', settings.mapsLink || 'Belum diatur'],
            ].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-4"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-2 break-words text-sm text-slate-800">{value}</dd></div>)}
          </dl>
          <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Foto gedung</p>{settings.buildingImage ? <img src={settings.buildingImage} alt={`Gedung Genza ${settings.branch}`} width={640} height={480} className="aspect-[4/3] w-full rounded-lg object-cover" /> : <p className="flex aspect-[4/3] items-center justify-center rounded-lg bg-slate-50 px-4 text-center text-sm text-slate-500">Foto gedung belum diatur.</p>}</div>
        </div>
      )}
    </div>
  )
}
