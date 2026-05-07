import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Button } from './ui/button'
import { Menu, X, Scissors, CalendarDays, User } from 'lucide-react'
import { useCustomer } from '../context/CustomerContext'

export function Navbar() {
  const { t } = useTranslation()
  const { customer } = useCustomer()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { href: '/#about', label: t('nav.about') },
    { href: '/#services', label: t('nav.services') },
    { href: '/#gallery', label: t('nav.gallery') },
    { href: '/#contact', label: t('nav.contact') },
  ]

  return (
    <header className="sticky top-0 z-50 bg-charcoal/95 backdrop-blur-sm text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-4 max-w-6xl">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Scissors className="w-5 h-5 text-gold" />
          <span>HairStyles </span>
          <span className="text-gold">RP</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-white/80 hover:text-gold transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {customer ? (
            <>
              <Link to="/my-appointments" className="hidden md:flex items-center gap-1.5 text-sm text-white/70 hover:text-gold transition-colors">
                <CalendarDays className="w-4 h-4" />
                <span>התורים שלי</span>
              </Link>
              <Link to="/book">
                <Button variant="gold" size="sm" className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>{customer.firstName}</span>
                </Button>
              </Link>
            </>
          ) : (
            <Link to="/login">
              <Button variant="gold" size="sm">{t('nav.book')}</Button>
            </Link>
          )}
          <button className="md:hidden p-2" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-charcoal-dark border-t border-white/10 px-4 pb-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-white/80 hover:text-gold transition-colors border-b border-white/10 last:border-0"
            >
              {link.label}
            </a>
          ))}
          {customer && (
            <Link to="/my-appointments" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-3 text-white/80 hover:text-gold transition-colors border-b border-white/10">
              <CalendarDays className="w-4 h-4" /> התורים שלי
            </Link>
          )}
          <Link to={customer ? '/book' : '/login'} onClick={() => setMenuOpen(false)}>
            <Button variant="gold" size="sm" className="mt-4 w-full">{t('nav.book')}</Button>
          </Link>
        </div>
      )}
    </header>
  )
}
