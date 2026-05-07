import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Scissors, Instagram, MessageCircle, Phone, MapPin } from 'lucide-react'

export function Footer({ shop }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const shopName = shop?.name?.[locale] ?? 'BarberShop'
  const year = new Date().getFullYear()

  return (
    <footer id="contact" className="bg-charcoal-dark text-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scissors className="w-5 h-5 text-gold" />
              <span className="font-bold text-lg text-gold">{shopName}</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              {locale === 'he' ? 'ספרות מקצועית לגברים' : "Professional men's barbershop"}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gold mb-4">{t('footer.contact', 'Contact')}</h4>
            <div className="space-y-3">
              {shop?.address && (
                <div className="flex items-start gap-2 text-sm text-white/70">
                  <MapPin className="w-4 h-4 text-gold/70 mt-0.5 shrink-0" />
                  <span>{shop.address}</span>
                </div>
              )}
              {shop?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gold/70 shrink-0" />
                  <a href={`tel:${shop.phone}`} className="text-white/70 hover:text-gold transition-colors" dir="ltr">{shop.phone}</a>
                </div>
              )}
            </div>
          </div>

          <div>
            {(shop?.socialLinks?.instagram || shop?.socialLinks?.whatsapp) && (
              <>
                <h4 className="font-semibold text-gold mb-4">{t('footer.followUs')}</h4>
                <div className="flex gap-4">
                  {shop.socialLinks.instagram && (
                    <a href={shop.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-gold transition-colors">
                      <Instagram className="w-6 h-6" />
                    </a>
                  )}
                  {shop.socialLinks.whatsapp && (
                    <a href={shop.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-gold transition-colors">
                      <MessageCircle className="w-6 h-6" />
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">© {year} {shopName}. {t('footer.rights')}.</p>
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  )
}
