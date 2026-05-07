import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export function GallerySection({ shop }) {
  const { t } = useTranslation()
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const images = shop?.galleryUrls ?? []

  if (images.length === 0) return null

  function prev() {
    setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null))
  }
  function next() {
    setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null))
  }

  return (
    <section id="gallery" className="py-20 bg-charcoal">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{t('gallery.title')}</h2>
          <p className="text-white/60 text-base">{t('gallery.subtitle')}</p>
          <div className="w-16 h-1 bg-gold mx-auto rounded-full mt-4" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="relative aspect-square overflow-hidden rounded-lg group focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <img src={url} alt={`תמונה ${i + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/30 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2" onClick={() => setLightboxIndex(null)}>
            <X className="w-8 h-8" />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2" onClick={(e) => { e.stopPropagation(); prev() }}>
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div className="relative max-w-3xl max-h-[80vh] w-full mx-16" onClick={(e) => e.stopPropagation()}>
            <img src={images[lightboxIndex]} alt={`Gallery image ${lightboxIndex + 1}`} className="object-contain w-full max-h-[80vh] rounded-lg" />
          </div>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2" onClick={(e) => { e.stopPropagation(); next() }}>
            <ChevronRight className="w-8 h-8" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </section>
  )
}
