import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'
import {
  LayoutDashboard, Calendar, Scissors, Clock, Ban, Users, LogOut, Menu, X,
} from 'lucide-react'

export function AdminNav() {
  const { t } = useTranslation()
  const location = useLocation()
  const { logout } = useAuth()
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/admin', label: t('admin.dashboard.title'), icon: LayoutDashboard },
    { href: '/admin/appointments', label: t('admin.appointments.title'), icon: Calendar },
    { href: '/admin/services', label: t('admin.services.title'), icon: Scissors },
    { href: '/admin/hours', label: t('admin.hours.title'), icon: Clock },
    { href: '/admin/blocked', label: t('admin.blocked.title'), icon: Ban },
    { href: '/admin/customers', label: t('admin.customers.title'), icon: Users },
  ]

  const NavContent = () => (
    <>
      <div className="px-4 py-5 border-b border-white/10">
        <p className="font-bold text-lg"><span className="text-white">HairStyles </span><span className="text-gold">RP</span></p>
        <p className="text-white/40 text-xs">פאנל ניהול</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = location.pathname === href || (href !== '/admin' && location.pathname.startsWith(href))
          return (
            <Link
              key={href}
              to={href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                isActive ? 'bg-gold text-charcoal font-semibold' : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />{label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-white/60 hover:bg-white/10 hover:text-white text-sm transition-all"
        >
          <LogOut className="w-4 h-4" />יציאה
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Hamburger — explicit right-4 for RTL */}
      <button className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-charcoal rounded-lg text-white" onClick={() => setOpen(true)}>
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar — appears on right in RTL flex container */}
      <aside className="hidden lg:flex w-56 flex-col bg-charcoal min-h-screen shrink-0">
        <NavContent />
      </aside>

      {/* Mobile drawer — justify-end pushes it to the right side */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-64 flex flex-col bg-charcoal h-full">
            <button className="absolute top-4 left-4 text-white/60 hover:text-white" onClick={() => setOpen(false)}>
              <X className="w-5 h-5" />
            </button>
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}
