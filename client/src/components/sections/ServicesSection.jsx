import { useTranslation } from 'react-i18next'
import { ServiceCard } from '../ServiceCard'

const CATEGORY_ORDER = ['haircut', 'beard', 'combo', 'other']

export function ServicesSection({ services }) {
  const { t } = useTranslation()

  const byCategory = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = services.filter((s) => s.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  return (
    <section id="services" className="py-20 bg-cream">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-3">{t('services.title')}</h2>
          <p className="text-ink/60 text-base">{t('services.subtitle')}</p>
          <div className="w-16 h-1 bg-gold mx-auto rounded-full mt-4" />
        </div>
        <div className="space-y-10">
          {Object.entries(byCategory).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-lg font-bold text-charcoal mb-4 pb-2 border-b border-gold/30">
                {t(`services.categories.${category}`)}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((service) => <ServiceCard key={service._id} service={service} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
