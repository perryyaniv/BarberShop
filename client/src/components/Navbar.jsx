import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'
import { Menu, X, Scissors, CalendarDays, User, LogOut } from 'lucide-react'
import { useCustomer } from '../context/CustomerContext'

export function Navbar() {
  const { t } = useTranslation()
  const { customer, logout } = useCustomer()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const navLinks = [
    { href: '/#about', label: t('nav.about') },
    { href: '/#services', label: t('nav.services') },
    { href: '/#gallery', label: t('nav.gallery') },
    { href: '/#contact', label: t('nav.contact') },
  ]

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    logout()
    setMenuOpen(false)
    setProfileOpen(false)
    navigate('/')
  }

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
          {customer ? (
            <div className="relative" ref={profileRef}>
              <Button
                variant="gold"
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => setProfileOpen((v) => !v)}
              >
                <User className="w-3.5 h-3.5" />
                <span>{customer.firstName}</span>
              </Button>

              {profileOpen && (
                <div className="absolute left-0 top-full mt-2 w-44 bg-white rounded-xl shadow-lg border border-ink/10 overflow-hidden z-50">
                  <Link
                    to="/my-appointments"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-ink hover:bg-gold/10 hover:text-charcoal transition-colors"
                  >
                    <CalendarDays className="w-4 h-4 text-gold" />
                    התורים שלי
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors w-full border-t border-ink/5"
                  >
                    <LogOut className="w-4 h-4" />
                    התנתקות
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <Button variant="gold" size="sm">כניסה</Button>
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
          {customer ? (
            <>
              <Link to="/my-appointments" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-3 text-white/80 hover:text-gold transition-colors border-b border-white/10">
                <CalendarDays className="w-4 h-4" /> התורים שלי
              </Link>
              <Link to="/book" onClick={() => setMenuOpen(false)}>
                <Button variant="gold" size="sm" className="mt-4 w-full">{t('nav.book')}</Button>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 mt-3 w-full py-2 text-sm text-white/50 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" /> התנתקות
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              <Button variant="gold" size="sm" className="mt-4 w-full">כניסה</Button>
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
