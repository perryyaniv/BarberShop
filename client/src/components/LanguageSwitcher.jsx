import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const locale = i18n.language

  function switchLocale() {
    const next = locale === 'he' ? 'en' : 'he'
    i18n.changeLanguage(next)
    localStorage.setItem('locale', next)
    document.documentElement.lang = next
    document.documentElement.dir = next === 'he' ? 'rtl' : 'ltr'
  }

  return (
    <Button variant="ghost" size="sm" onClick={switchLocale} aria-label="Switch language">
      {locale === 'he' ? 'EN' : 'עב'}
    </Button>
  )
}
