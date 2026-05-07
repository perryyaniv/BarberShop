import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, isPast } from 'date-fns'
import { he as heLocale } from 'date-fns/locale'
import { CalendarX, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Toaster } from '../components/ui/toaster'
import { toast } from '../hooks/use-toast'
import { useCustomer } from '../context/CustomerContext'
import api from '../lib/api'

const STATUS_COLORS = {
  confirmed: 'success',
  completed: 'outline',
  cancelled: 'destructive',
  no_show: 'destructive',
  pending_verification: 'warning',
}

const STATUS_LABELS = {
  confirmed: 'מאושר',
  completed: 'הושלם',
  cancelled: 'בוטל',
  no_show: 'לא הגעת',
  pending_verification: 'ממתין לאימות',
}

export function MyAppointmentsPage() {
  const { customer } = useCustomer()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    if (!customer) { navigate('/login?next=/my-appointments', { replace: true }); return }
    load()
  }, [customer])

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/appointments/my?phone=${encodeURIComponent(customer.phone)}`)
      setAppointments(data.appointments ?? [])
    } finally {
      setLoading(false)
    }
  }

  async function cancel(id) {
    if (!confirm('לבטל את התור?')) return
    setCancelling(id)
    try {
      await api.post(`/api/appointments/${id}/cancel`)
      toast({ variant: 'success', title: 'התור בוטל בהצלחה' })
      load()
    } catch {
      toast({ variant: 'destructive', title: 'שגיאה בביטול התור' })
    } finally {
      setCancelling(null)
    }
  }

  const upcoming = appointments.filter((a) => !isPast(new Date(a.startTime)) && a.status !== 'cancelled')
  const past = appointments.filter((a) => isPast(new Date(a.startTime)) || a.status === 'cancelled')

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <Toaster />
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-charcoal">התורים שלי</h1>
          {customer && (
            <p className="text-ink/50 text-sm mt-1">{customer.fullName} · {customer.phone}</p>
          )}
        </div>

        {loading ? (
          <p className="text-center text-ink/40 py-16">טוען...</p>
        ) : (
          <div className="space-y-8">
            {/* Upcoming */}
            <div>
              <h2 className="font-semibold text-charcoal mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold" /> תורים קרובים
              </h2>
              {upcoming.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center space-y-4">
                    <CalendarX className="w-10 h-10 text-ink/20 mx-auto" />
                    <p className="text-ink/40">אין תורים קרובים</p>
                    <Button variant="gold" onClick={() => navigate('/book')}>הזמן תור</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((a) => (
                    <Card key={a._id} className="border-gold/20">
                      <CardContent className="py-4 px-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-charcoal">{a.serviceId?.name?.he ?? 'שירות'}</p>
                            <p className="text-sm text-ink/60 mt-0.5" dir="ltr">
                              {format(new Date(a.startTime), 'EEEE, d MMMM yyyy · HH:mm', { locale: heLocale })}
                            </p>
                            <p className="text-xs text-ink/40 mt-0.5">
                              {a.serviceId?.durationMinutes} דק׳ · ₪{a.serviceId?.priceIls}
                            </p>
                          </div>
                          <Badge variant={STATUS_COLORS[a.status]}>{STATUS_LABELS[a.status] ?? a.status}</Badge>
                        </div>
                        {a.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-3 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            onClick={() => cancel(a._id)}
                            disabled={cancelling === a._id}
                          >
                            <XCircle className="w-3.5 h-3.5 me-1.5" />
                            {cancelling === a._id ? 'מבטל...' : 'בטל תור'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h2 className="font-semibold text-charcoal mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-ink/40" /> היסטוריה
                </h2>
                <div className="space-y-2">
                  {past.map((a) => (
                    <Card key={a._id} className="opacity-60">
                      <CardContent className="py-3 px-5 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-ink text-sm">{a.serviceId?.name?.he ?? 'שירות'}</p>
                          <p className="text-xs text-ink/50" dir="ltr">
                            {format(new Date(a.startTime), 'd/M/yyyy · HH:mm')}
                          </p>
                        </div>
                        <Badge variant={STATUS_COLORS[a.status]}>{STATUS_LABELS[a.status] ?? a.status}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
