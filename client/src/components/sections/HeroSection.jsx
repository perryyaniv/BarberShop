import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import { Scissors, ChevronDown } from 'lucide-react'

export function HeroSection({ shop }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const shopName = shop?.name?.[locale] ?? (locale === 'he' ? 'רון פז' : 'Ron Paz')

  return (
    <section id="home" className="relative min-h-[92vh] flex items-center justify-center bg-charcoal overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal-dark to-black opacity-90" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* Text column */}
          <div className="flex flex-col items-center md:items-start text-center md:text-start order-2 md:order-1">
            <div className="flex justify-center md:justify-start mb-6">
              <div className="p-3 rounded-full border border-gold/30 bg-gold/10">
                <Scissors className="w-7 h-7 text-gold" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">{shopName}</h1>
            <p className="text-xl md:text-2xl text-gold font-medium mb-3">{t('hero.tagline')}</p>
            <p className="text-white/70 text-base md:text-lg mb-10 max-w-md">{t('hero.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
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

          {/* Photo column */}
          <div className="flex justify-center md:justify-end order-1 md:order-2">
            <div className="relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-gold/60 via-gold/20 to-transparent blur-sm" />
              <img
                src="/ron-paz.jpg"
                alt={shopName}
                className="relative w-64 h-80 md:w-80 md:h-[420px] object-cover object-top rounded-3xl border-2 border-gold/40 shadow-2xl"
              />
            </div>
          </div>

        </div>
      </div>

      <a href="#about" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-gold transition-colors animate-bounce">
        <ChevronDown className="w-8 h-8" />
      </a>
    </section>
  )
}
