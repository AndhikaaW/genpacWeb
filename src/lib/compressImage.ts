export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024
const MAX_STORED_IMAGE_BYTES = 700 * 1024
const MAX_IMAGE_DIMENSION = 1920

function imageFromFile(file: File): Promise<{ image: HTMLImageElement; objectUrl: string }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => resolve({ image, objectUrl })
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Format gambar tidak didukung browser ini. Coba file JPG, PNG, atau WebP.'))
    }
    image.src = objectUrl
  })
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Gambar gagal dikompres. Silakan coba file lain.'))
    }, 'image/jpeg', quality)
  })
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result)
      : reject(new Error('Gambar gagal dikonversi.'))
    reader.onerror = () => reject(new Error('Gambar gagal dikonversi.'))
    reader.readAsDataURL(blob)
  })
}

/** Decode, resize, and JPEG-compress an uploaded image before storing as Base64. */
export async function compressImageToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Pilih file gambar.')
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) throw new Error('Ukuran file maksimal 5 MB.')

  const { image, objectUrl } = await imageFromFile(file)
  try {
    const sourceWidth = image.naturalWidth
    const sourceHeight = image.naturalHeight
    if (!sourceWidth || !sourceHeight) throw new Error('File gambar tidak dapat dibaca.')

    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(sourceWidth, sourceHeight))
    let width = Math.max(1, Math.round(sourceWidth * scale))
    let height = Math.max(1, Math.round(sourceHeight * scale))
    let quality = 0.86
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Browser tidak mendukung kompresi gambar.')

    for (let attempt = 0; attempt < 8; attempt += 1) {
      canvas.width = width
      canvas.height = height
      context.fillStyle = '#fff'
      context.fillRect(0, 0, width, height)
      context.drawImage(image, 0, 0, width, height)
      const compressed = await canvasToJpeg(canvas, quality)
      if (compressed.size <= MAX_STORED_IMAGE_BYTES) return await blobToDataUrl(compressed)

      if (quality > 0.62) quality -= 0.08
      else {
        width = Math.max(1, Math.round(width * 0.82))
        height = Math.max(1, Math.round(height * 0.82))
      }
    }
    throw new Error('Gambar tetap terlalu besar setelah dikompres. Pilih gambar dengan resolusi lebih kecil.')
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
