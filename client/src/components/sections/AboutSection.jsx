import { useTranslation } from 'react-i18next'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export function AboutSection({ shop, workingHours }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  const description = shop?.description?.[locale]
    ?? (locale === 'he'
      ? 'ברוכים הבאים למרחב שבו יצירתיות פוגשת דיוק. רון פז, מעצב שיער בעל ניסיון עשיר, מזמין אתכם לחוויית טיפוח אישית המשלבת את הטרנדים הבינלאומיים המובילים עם התאמה מושלמת למבנה הפנים ולאורח החיים שלכם. כאן, כל תספורת היא אמנות וכל לקוח הוא במרכז.'
      : "Professional men's barbershop — haircuts, beard styling, and more.")

  return (
    <section id="about" className="py-20 bg-cream-warm">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-3">{t('about.title')}</h2>
          <div className="w-16 h-1 bg-gold mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="text-xl font-semibold text-charcoal mb-4">{t('about.ourStory')}</h3>
            <p className="text-ink/70 leading-relaxed text-base">{description}</p>
            <div className="mt-8 space-y-4">
              {shop?.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                  <span className="text-ink/80">{shop.address}</span>
                </div>
              )}
              {shop?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gold shrink-0" />
                  <a href={`tel:${shop.phone}`} className="text-ink/80 hover:text-gold transition-colors" dir="ltr">{shop.phone}</a>
                </div>
              )}
              {shop?.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gold shrink-0" />
                  <a href={`mailto:${shop.email}`} className="text-ink/80 hover:text-gold transition-colors">{shop.email}</a>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-charcoal mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold" />{t('about.openingHours')}
            </h3>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-ink/5 space-y-3">
              {workingHours.map((h) => (
                <div key={h.dayOfWeek} className="flex justify-between items-center py-1 border-b border-ink/5 last:border-0">
                  <span className="font-medium text-ink">{t(`about.days.${h.dayOfWeek}`)}</span>
                  {h.isActive
                    ? <span className="text-ink/70 text-sm" dir="ltr">{h.startTime} – {h.endTime}</span>
                    : <span className="text-red-500 text-sm font-medium">{t('about.closed')}</span>
                  }
                </div>
              ))}
            </div>
            {shop?.address && (
              <div className="mt-6 rounded-xl overflow-hidden border border-ink/10 shadow-sm h-48">
                <iframe
                  title="Map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(shop.address)}&output=embed`}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
