import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Clock } from 'lucide-react'

export function ServiceCard({ service }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-ink text-base leading-tight">{service.name[locale]}</h3>
            {service.description?.[locale] && (
              <p className="text-ink/60 text-sm mt-1 line-clamp-2">{service.description[locale]}</p>
            )}
            <div className="flex items-center gap-1 mt-2 text-ink/50 text-xs">
              <Clock className="w-3 h-3" />
              <span>{service.durationMinutes} {t('services.duration')}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 shrink-0">
            <span className="font-bold text-charcoal text-lg">₪{service.priceIls}</span>
            <Link to={`/book?service=${service._id}`}>
              <Button variant="gold" size="sm">{t('services.bookService')}</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
