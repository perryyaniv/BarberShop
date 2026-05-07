import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import { ChevronDown } from 'lucide-react'

export function HeroSection({ shop }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const shopName = shop?.name?.[locale] ?? (locale === 'he' ? 'רון פז' : 'Ron Paz')

  return (
    <section id="home" className="relative min-h-[92vh] flex items-center justify-center bg-charcoal overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal-dark to-black opacity-90" />

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto -mt-12 sm:mt-0">
        <div className="flex justify-center mb-5">
          <div className="relative">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-gold/70 to-gold/20 blur-sm" />
            <img
              src="/ron-paz.jpg"
              alt={shopName}
              className="relative w-24 h-24 rounded-full object-cover object-top border-2 border-gold/50 shadow-xl"
            />
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
