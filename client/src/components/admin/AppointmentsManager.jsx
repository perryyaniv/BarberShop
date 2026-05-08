import { useEffect, useState, useMemo } from 'react'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday, isTomorrow, isPast } from 'date-fns'
import { RefreshCw, Search, Calendar, List } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Toaster } from '../ui/toaster'
import { toast } from '../../hooks/use-toast'
import { cn } from '../../lib/utils'
import api from '../../lib/api'
import { formatPhone } from '../../lib/utils'

const STATUS_COLORS = {
  confirmed: 'success',
  pending_verification: 'warning',
  completed: 'outline',
  cancelled: 'destructive',
  no_show: 'destructive',
}

const STATUS_LABELS = {
  confirmed: 'מאושר',
  pending_verification: 'ממתין לאימות',
  completed: 'הושלם',
  cancelled: 'בוטל',
  no_show: 'לא הגיע',
}

const NEXT_STATUSES = {
  confirmed: 'completed',
  pending_verification: 'confirmed',
  completed: null,
  cancelled: null,
  no_show: null,
}

const NEXT_LABELS = {
  completed: 'סמן כהושלם',
  confirmed: 'אשר',
}

const PRESETS = [
  { label: 'היום', key: 'today' },
  { label: 'השבוע', key: 'week' },
  { label: 'החודש', key: 'month' },
  { label: 'הכל', key: 'all' },
]

const STATUSES = [
  { label: 'כל הסטטוסים', value: 'all' },
  { label: 'מאושר', value: 'confirmed' },
  { label: 'הושלם', value: 'completed' },
  { label: 'בוטל', value: 'cancelled' },
  { label: 'לא הגיע', value: 'no_show' },
]

function getPresetRange(key) {
  const now = new Date()
  if (key === 'today') return { from: startOfDay(now).toISOString(), to: endOfDay(now).toISOString() }
  if (key === 'week') return { from: startOfWeek(now).toISOString(), to: endOfWeek(now).toISOString() }
  if (key === 'month') return { from: startOfMonth(now).toISOString(), to: endOfMonth(now).toISOString() }
  return { from: '', to: '' }
}

function dayLabel(dateStr) {
  const d = new Date(dateStr)
  if (isToday(d)) return 'היום'
  if (isTomorrow(d)) return 'מחר'
  return format(d, 'EEEE, d/M/yyyy')
}

export function AppointmentsManager() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [preset, setPreset] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('schedule')

  async function load(p = preset, s = statusFilter) {
    setLoading(true)
    try {
      const range = getPresetRange(p)
      const params = new URLSearchParams()
      if (range.from) params.set('from', range.from)
      if (range.to) params.set('to', range.to)
      if (s !== 'all') params.set('status', s)
      const { data } = await api.get(`/api/admin/appointments?${params}`)
      setAppointments(data.appointments ?? [])
    } catch (err) {
      toast({ variant: 'destructive', title: `שגיאה בטעינת תורים: ${err.response?.data?.error || err.message}` })
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id, status) {
    try {
      await api.put(`/api/admin/appointments/${id}`, { status })
      setAppointments((prev) => prev.map((a) => a._id === id ? { ...a, status } : a))
      toast({ variant: 'success', title: 'סטטוס עודכן' })
    } catch {
      toast({ variant: 'destructive', title: 'שגיאה בעדכון' })
    }
  }

  function handlePreset(key) { setPreset(key); load(key, statusFilter) }
  function handleStatus(s) { setStatusFilter(s); load(preset, s) }

  const filtered = useMemo(() => {
    if (!search.trim()) return appointments
    const q = search.toLowerCase()
    return appointments.filter((a) =>
      a.customerId?.name?.toLowerCase().includes(q) ||
      a.customerId?.phone?.includes(q) ||
      a.serviceId?.name?.he?.toLowerCase().includes(q) ||
      a.serviceId?.name?.en?.toLowerCase().includes(q)
    )
  }, [appointments, search])

  const grouped = useMemo(() => {
    const map = {}
    for (const a of filtered) {
      const day = format(new Date(a.startTime), 'yyyy-MM-dd')
      if (!map[day]) map[day] = []
      map[day].push(a)
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  return (
    <div className="space-y-5">
      <Toaster />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-charcoal">ניהול תורים</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('schedule')} className={cn('p-2 rounded-lg transition-colors', view === 'schedule' ? 'bg-gold text-charcoal' : 'bg-cream-warm text-ink hover:bg-cream')} title="תצוגת לו״ז">
            <Calendar className="w-4 h-4" />
          </button>
          <button onClick={() => setView('list')} className={cn('p-2 rounded-lg transition-colors', view === 'list' ? 'bg-gold text-charcoal' : 'bg-cream-warm text-ink hover:bg-cream')} title="תצוגת רשימה">
            <List className="w-4 h-4" />
          </button>
          <Button variant="ghost" size="sm" onClick={() => load()} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-1 bg-cream-warm rounded-lg p-1 w-full sm:w-fit overflow-x-auto">
          {PRESETS.map((p) => (
            <button key={p.key} onClick={() => handlePreset(p.key)} className={cn('flex-1 sm:flex-none px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap', preset === p.key ? 'bg-white shadow-sm text-charcoal font-semibold' : 'text-ink/60 hover:text-ink')}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
            <Input className="ps-9 w-full" placeholder="חפש לפי שם או שירות..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="h-10 rounded-md border border-ink/20 bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold w-full sm:w-auto" value={statusFilter} onChange={(e) => handleStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <p className="text-xs text-ink/40">{filtered.length} תורים</p>
      </div>

      {loading ? (
        <p className="text-ink/40 text-center py-16">טוען...</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-ink/40">לא נמצאו תורים</CardContent></Card>
      ) : view === 'schedule' ? (
        <ScheduleView groups={grouped} onUpdateStatus={updateStatus} />
      ) : (
        <ListView appointments={filtered} onUpdateStatus={updateStatus} />
      )}
    </div>
  )
}

function ScheduleView({ groups, onUpdateStatus }) {
  return (
    <div className="space-y-8">
      {groups.map(([day, appts]) => (
        <div key={day}>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-semibold text-charcoal">{dayLabel(day)}</h2>
            <div className="flex-1 h-px bg-ink/10" />
            <span className="text-xs text-ink/40 font-medium">{appts.length} תורים</span>
          </div>
          <div className="space-y-2">
            {appts.map((a) => <AppointmentCard key={a._id} appt={a} onUpdateStatus={onUpdateStatus} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function ListView({ appointments, onUpdateStatus }) {
  return (
    <div className="space-y-2">
      {appointments.map((a) => <AppointmentCard key={a._id} appt={a} onUpdateStatus={onUpdateStatus} showDate />)}
    </div>
  )
}

function AppointmentCard({ appt: a, onUpdateStatus, showDate = false }) {
  const next = NEXT_STATUSES[a.status]
  const past = isPast(new Date(a.startTime))

  return (
    <Card className={cn(a.status === 'cancelled' || a.status === 'no_show' ? 'opacity-60' : '')}>
      <CardContent className="py-3 px-4">
        <div className="flex items-start gap-3 min-w-0 mb-2">
          <div className="text-center shrink-0 w-12">
            <p className="font-mono font-bold text-charcoal text-base" dir="ltr">
              {format(new Date(a.startTime), 'HH:mm')}
            </p>
            {showDate && <p className="text-xs text-ink/40 mt-0.5">{format(new Date(a.startTime), 'd/M')}</p>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-ink">{a.customerId?.name ?? 'לא ידוע'}</p>
              {a.customerId?.phone && (
                <a href={`tel:${a.customerId.phone}`} className="text-xs text-ink/50 hover:text-gold transition-colors font-mono" dir="ltr">
                  {formatPhone(a.customerId.phone)}
                </a>
              )}
            </div>
            <p className="text-sm text-ink/60 truncate">
              {a.serviceId?.name?.he ?? 'שירות'}
              <span className="text-ink/40"> · ₪{a.serviceId?.priceIls} · {a.serviceId?.durationMinutes} דק׳</span>
            </p>
            {a.notes && <p className="text-xs text-ink/40 italic mt-0.5 truncate">{a.notes}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap ms-12">
          <Badge variant={STATUS_COLORS[a.status]}>{STATUS_LABELS[a.status] ?? a.status}</Badge>
          {next && (next !== 'completed' || past) && (
            <Button size="sm" variant="secondary" onClick={() => onUpdateStatus(a._id, next)}>
              {NEXT_LABELS[next] ?? next}
            </Button>
          )}
          {a.status !== 'cancelled' && a.status !== 'completed' && a.status !== 'no_show' && past && (
            <Button size="sm" variant="outline" onClick={() => onUpdateStatus(a._id, 'no_show')}>
              לא הגיע
            </Button>
          )}
          {a.status !== 'cancelled' && a.status !== 'completed' && a.status !== 'no_show' && (
            <Button size="sm" variant="destructive" onClick={() => onUpdateStatus(a._id, 'cancelled')}>
              בטל
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
