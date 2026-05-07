import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import { Scissors, ChevronDown } from 'lucide-react'

export function HeroSection({ shop }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const shopName = shop?.name?.[locale] ?? (locale === 'he' ? 'ספרות מקצועית' : 'Pro BarberShop')

  return (
    <section id="home" className="relative min-h-[92vh] flex items-center justify-center bg-charcoal overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal-dark to-black opacity-90" />

      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full border border-gold/30 bg-gold/10">
            <Scissors className="w-10 h-10 text-gold" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">{shopName}</h1>
        <p className="text-xl md:text-2xl text-gold font-medium mb-4">{t('hero.tagline')}</p>
        <p className="text-white/70 text-base md:text-lg mb-10 max-w-xl mx-auto">{t('hero.subtitle')}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/book">
            <Button variant="gold" size="lg" className="w-full sm:w-auto min-w-[180px]">{t('hero.bookNow')}</Button>
          </Link>
          <a href="#services">
            <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[180px] border-white/30 text-white hover:bg-white/10 hover:text-white">
              {t('hero.viewServices')}
            </Button>
          </a>
        </div>
      </div>

      <a href="#about" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-gold transition-colors animate-bounce">
        <ChevronDown className="w-8 h-8" />
      </a>
    </section>
  )
}
