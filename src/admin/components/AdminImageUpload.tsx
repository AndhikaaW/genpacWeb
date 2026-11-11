import { useState, type ChangeEvent } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { compressImageToDataUrl, MAX_IMAGE_UPLOAD_BYTES } from '../../lib/compressImage'

interface AdminImageUploadProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export default function AdminImageUpload({ value, onChange, label = 'Gambar' }: AdminImageUploadProps) {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setError(null)
    setProcessing(true)
    try {
      const compressedImage = await compressImageToDataUrl(file)
      onChange(compressedImage)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Gagal memproses gambar.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700" htmlFor="admin-image-upload">{label} <span className="text-red-600">*</span></label>
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
        {value ? (
          <div className="relative">
            <img src={value} alt="Pratinjau gambar terpilih" width={720} height={360} className="max-h-56 w-full rounded-md bg-white object-contain" />
            <button type="button" aria-label="Hapus gambar terpilih" onClick={() => { onChange(''); setError(null) }} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label htmlFor="admin-image-upload" className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-md px-3 text-center text-sm text-slate-600 hover:bg-white">
            <ImagePlus className="h-6 w-6 text-[#22539F]" aria-hidden="true" />
            <span className="font-semibold text-[#22539F]">Pilih file gambar</span>
            <span className="text-xs text-slate-500">Maksimal 5 MB, gambar akan dikompres otomatis</span>
          </label>
        )}
        <input id="admin-image-upload" type="file" accept="image/*" onChange={handleFileChange} disabled={processing} className={value ? 'mt-3 block w-full text-sm text-slate-600 file:mr-3 file:min-h-10 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:font-semibold file:text-[#22539F] hover:file:bg-blue-100' : 'sr-only'} />
      </div>
      <p id="admin-image-help" className="text-xs text-slate-500">Format gambar yang didukung browser. Batas file {MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024)} MB.</p>
      {processing && <p role="status" className="text-sm font-medium text-[#22539F]">Mengompres gambar...</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  )
}
