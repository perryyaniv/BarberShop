import { useEffect, useState, useMemo } from 'react'
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday, isTomorrow, isPast } from 'date-fns'
import { he } from 'date-fns/locale'
import { RefreshCw, Search, Calendar, List, Plus, X } from 'lucide-react'
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
  if (key === 'week') {
    const sun = startOfWeek(now, { weekStartsOn: 0 })
    const fri = new Date(sun)
    fri.setDate(fri.getDate() + 5)
    return { from: sun.toISOString(), to: endOfDay(fri).toISOString() }
  }
  if (key === 'month') return { from: startOfMonth(now).toISOString(), to: endOfMonth(now).toISOString() }
  return { from: '', to: '' }
}

function dayLabel(dateStr) {
  const d = new Date(dateStr)
  if (isToday(d)) return 'היום'
  if (isTomorrow(d)) return 'מחר'
  return format(d, 'EEEE, d/M/yyyy', { locale: he })
}

function AddAppointmentModal({ services, onClose, onCreated }) {
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ serviceId: '', date: '', time: '', name: '', phone: '', notes: '' })

  useEffect(() => {
    if (!form.serviceId || !form.date) { setSlots([]); return }
    let cancelled = false
    setLoadingSlots(true)
    const base = import.meta.env.VITE_API_URL || ''
    fetch(`${base}/api/appointments/available-slots?date=${form.date}&serviceId=${form.serviceId}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setSlots(data.slots ?? []) })
      .catch(() => { if (!cancelled) setSlots([]) })
      .finally(() => { if (!cancelled) setLoadingSlots(false) })
    return () => { cancelled = true }
  }, [form.serviceId, form.date])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value, ...(field === 'serviceId' || field === 'date' ? { time: '' } : {}) }))
  }

  async function submit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/admin/appointments', {
        serviceId: form.serviceId,
        date: form.date,
        startTime: form.time,
        customerName: form.name,
        customerPhone: form.phone,
        notes: form.notes || undefined,
      })
      onCreated()
      onClose()
    } catch (err) {
      toast({ variant: 'destructive', title: err.response?.data?.error || 'שגיאה ביצירת תור' })
    } finally {
      setSubmitting(false)
    }
  }

  const today = format(new Date(), 'yyyy-MM-dd')
  const valid = form.serviceId && form.date && form.time && form.name.length >= 2 && form.phone.length >= 9

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-ink/10">
          <h2 className="font-bold text-charcoal text-lg">הוספת תור ידנית</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-cream-warm transition-colors"><X className="w-5 h-5 text-ink/50" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">שירות</label>
            <select required className="w-full h-10 rounded-md border border-ink/20 bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold" value={form.serviceId} onChange={(e) => set('serviceId', e.target.value)}>
              <option value="">בחר שירות...</option>
              {services.map((s) => <option key={s._id} value={s._id}>{s.name?.he} — {s.durationMinutes} דק׳ / ₪{s.priceIls}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-ink">תאריך</label>
              <Input type="date" min={today} value={form.date} onChange={(e) => set('date', e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-ink">שעה</label>
              <select required className="w-full h-10 rounded-md border border-ink/20 bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold disabled:opacity-50" value={form.time} onChange={(e) => set('time', e.target.value)} disabled={!form.serviceId || !form.date}>
                <option value="">{loadingSlots ? 'טוען...' : 'בחר שעה...'}</option>
                {slots.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-ink">שם לקוח</label>
              <Input placeholder="ישראל ישראלי" value={form.name} onChange={(e) => set('name', e.target.value)} required minLength={2} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-ink">טלפון</label>
              <Input placeholder="05XXXXXXXX" value={form.phone} onChange={(e) => set('phone', e.target.value)} required minLength={9} dir="ltr" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-ink">הערות <span className="text-ink/40 font-normal">(אופציונלי)</span></label>
            <Input placeholder="..." value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>ביטול</Button>
            <Button type="submit" className="flex-1" disabled={!valid || submitting}>{submitting ? 'שומר...' : 'צור תור'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function AppointmentsManager() {
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [preset, setPreset] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('schedule')
  const [showAdd, setShowAdd] = useState(false)

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

  useEffect(() => {
    load()
    api.get('/api/admin/services').then(({ data }) => setServices(data.services ?? [])).catch(() => {})
  }, [])

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
      {showAdd && <AddAppointmentModal services={services} onClose={() => setShowAdd(false)} onCreated={() => load()} />}

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
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 me-1" />
            הוסף תור
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

const TERMINAL_STATUSES = ['completed', 'cancelled', 'no_show']

function StatusSelect({ status, onSelect }) {
  const options = TERMINAL_STATUSES.filter((s) => s !== status)
  return (
    <select
      autoFocus
      className="text-xs rounded border border-ink/20 bg-white px-1.5 py-0.5 text-ink focus:outline-none focus:ring-1 focus:ring-gold min-w-[5rem]"
      defaultValue=""
      onChange={(e) => { if (e.target.value) onSelect(e.target.value) }}
      onBlur={(e) => { if (!e.target.value) onSelect(null) }}
    >
      <option value="" disabled>שנה סטטוס</option>
      {options.map((s) => (
        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
      ))}
    </select>
  )
}

function AppointmentCard({ appt: a, onUpdateStatus, showDate = false }) {
  const [editing, setEditing] = useState(false)
  const past = isPast(new Date(a.startTime))
  const terminal = TERMINAL_STATUSES.includes(a.status)
  const canEdit = past && terminal

  const handleStatusSelect = (newStatus) => {
    setEditing(false)
    if (newStatus) onUpdateStatus(a._id, newStatus)
  }

  const showConfirm = !past && a.status === 'pending_verification'
  const showComplete = past && a.status === 'confirmed'
  const showNoShow = past && a.status !== 'no_show' && !terminal
  const showCancel = !terminal
  const hasActions = showConfirm || showComplete || showNoShow || showCancel

  return (
    <Card className={cn(terminal ? 'opacity-60' : '')}>
      <CardContent className="py-3 px-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="text-center shrink-0 w-12">
            <p className="font-mono font-bold text-charcoal text-base" dir="ltr">
              {format(new Date(a.startTime), 'HH:mm')}
            </p>
            {showDate && <p className="text-xs text-ink/40 mt-0.5">{format(new Date(a.startTime), 'd/M')}</p>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-ink">{a.customerId?.name ?? 'לא ידוע'}</p>
                  {a.customerId?.phone && (
                    <a href={`tel:${a.customerId.phone}`} className="text-xs text-ink/50 hover:text-gold transition-colors font-mono" dir="ltr">
                      {formatPhone(a.customerId.phone)}
                    </a>
                  )}
                </div>
                <p className="text-sm text-ink/60 truncate mt-0.5">
                  {a.serviceId?.name?.he ?? 'שירות'}
                  <span className="text-ink/40"> · ₪{a.serviceId?.priceIls} · {a.serviceId?.durationMinutes} דק׳</span>
                </p>
                {a.notes && <p className="text-xs text-ink/40 italic mt-0.5 truncate">{a.notes}</p>}
              </div>
              {editing ? (
                <StatusSelect status={a.status} onSelect={handleStatusSelect} />
              ) : (
                <Badge
                  variant={STATUS_COLORS[a.status]}
                  onClick={canEdit ? () => setEditing(true) : undefined}
                  className={cn(
                    'shrink-0 mt-0.5 min-w-[5rem] justify-center',
                    a.status === 'completed' && 'border border-green-500 text-green-600 bg-transparent',
                    a.status === 'no_show' && 'border border-red-500 text-red-500 bg-transparent',
                    canEdit && 'cursor-pointer hover:opacity-70 transition-opacity',
                  )}
                >
                  {STATUS_LABELS[a.status] ?? a.status}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {hasActions && (
          <div className="flex items-center gap-2 flex-wrap mt-3 pt-2.5 border-t border-ink/10 ms-12">
            {showConfirm && (
              <Button size="sm" variant="outline" onClick={() => onUpdateStatus(a._id, 'confirmed')}>
                אשר
              </Button>
            )}
            {showComplete && (
              <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => onUpdateStatus(a._id, 'completed')}>
                סמן כהושלם
              </Button>
            )}
            {showNoShow && (
              <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => onUpdateStatus(a._id, 'no_show')}>
                לא הגיע
              </Button>
            )}
            {showCancel && (
              <Button size="sm" variant="destructive" onClick={() => onUpdateStatus(a._id, 'cancelled')}>
                בטל
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
