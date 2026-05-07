import { useEffect, useState, useMemo } from 'react'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday, isTomorrow } from 'date-fns'
import { he as heLocale } from 'date-fns/locale'
import { RefreshCw, Search, Calendar, List } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Toaster } from '../ui/toaster'
import { toast } from '../../hooks/use-toast'
import { cn } from '../../lib/utils'
import api from '../../lib/api'

const STATUS_COLORS = {
  confirmed: 'success',
  pending_verification: 'warning',
  completed: 'outline',
  cancelled: 'destructive',
  no_show: 'destructive',
}

const NEXT_STATUSES = {
  confirmed: 'completed',
  pending_verification: 'confirmed',
  completed: null,
  cancelled: null,
  no_show: null,
}

const PRESETS = [
  { label: 'Today', key: 'today' },
  { label: 'This Week', key: 'week' },
  { label: 'This Month', key: 'month' },
  { label: 'All', key: 'all' },
]

const STATUSES = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'No Show', value: 'no_show' },
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
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'EEEE, d MMM yyyy')
}

export function AppointmentsManager() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [preset, setPreset] = useState('today')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('schedule') // 'schedule' | 'list'

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id, status) {
    try {
      await api.put(`/api/admin/appointments/${id}`, { status })
      setAppointments((prev) => prev.map((a) => a._id === id ? { ...a, status } : a))
      toast({ variant: 'success', title: 'Status updated' })
    } catch {
      toast({ variant: 'destructive', title: 'Failed to update' })
    }
  }

  function handlePreset(key) {
    setPreset(key)
    load(key, statusFilter)
  }

  function handleStatus(s) {
    setStatusFilter(s)
    load(preset, s)
  }

  // Client-side name search
  const filtered = useMemo(() => {
    if (!search.trim()) return appointments
    const q = search.toLowerCase()
    return appointments.filter((a) =>
      a.customerId?.name?.toLowerCase().includes(q) ||
      a.serviceId?.name?.he?.toLowerCase().includes(q) ||
      a.serviceId?.name?.en?.toLowerCase().includes(q)
    )
  }, [appointments, search])

  // Group by date for schedule view
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

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-charcoal">Appointments</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('schedule')}
            className={cn('p-2 rounded-lg transition-colors', view === 'schedule' ? 'bg-gold text-charcoal' : 'bg-cream-warm text-ink hover:bg-cream')}
            title="Schedule view"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn('p-2 rounded-lg transition-colors', view === 'list' ? 'bg-gold text-charcoal' : 'bg-cream-warm text-ink hover:bg-cream')}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <Button variant="ghost" size="sm" onClick={() => load()} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Preset tabs */}
        <div className="flex gap-1 bg-cream-warm rounded-lg p-1 w-full sm:w-fit overflow-x-auto">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => handlePreset(p.key)}
              className={cn(
                'flex-1 sm:flex-none px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap',
                preset === p.key ? 'bg-white shadow-sm text-charcoal font-semibold' : 'text-ink/60 hover:text-ink'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
            <Input
              className="ps-9 w-full"
              placeholder="Search by name or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-md border border-ink/20 bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold w-full sm:w-auto"
            value={statusFilter}
            onChange={(e) => handleStatus(e.target.value)}
          >
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <p className="text-xs text-ink/40">{filtered.length} appointment{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-ink/40 text-center py-16">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-ink/40">No appointments found</CardContent></Card>
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
            <span className="text-xs text-ink/40 font-medium">{appts.length} appt{appts.length !== 1 ? 's' : ''}</span>
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

  return (
    <Card className={cn(a.status === 'cancelled' || a.status === 'no_show' ? 'opacity-60' : '')}>
      <CardContent className="py-3 px-4">
        <div className="flex items-start gap-3 min-w-0 mb-2">
          <div className="text-center shrink-0 w-12">
            <p className="font-mono font-bold text-charcoal text-base" dir="ltr">
              {format(new Date(a.startTime), 'HH:mm')}
            </p>
            {showDate && (
              <p className="text-xs text-ink/40 mt-0.5">{format(new Date(a.startTime), 'd/M')}</p>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink truncate">{a.customerId?.name ?? 'Unknown'}</p>
            <p className="text-sm text-ink/60 truncate">
              {a.serviceId?.name?.he ?? 'Service'}
              <span className="text-ink/40"> · ₪{a.serviceId?.priceIls} · {a.serviceId?.durationMinutes}min</span>
            </p>
            {a.notes && <p className="text-xs text-ink/40 italic mt-0.5 truncate">{a.notes}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap ms-12">
          <Badge variant={STATUS_COLORS[a.status]}>{a.status.replace('_', ' ')}</Badge>
          {next && (
            <Button size="sm" variant="secondary" onClick={() => onUpdateStatus(a._id, next)}>
              → {next}
            </Button>
          )}
          {a.status !== 'cancelled' && a.status !== 'completed' && (
            <Button size="sm" variant="destructive" onClick={() => onUpdateStatus(a._id, 'cancelled')}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
