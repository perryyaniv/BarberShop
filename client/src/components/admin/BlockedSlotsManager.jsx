import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { he as heLocale } from 'date-fns/locale'
import { Plus, Trash2, CalendarOff, Clock } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Toaster } from '../ui/toaster'
import { toast } from '../../hooks/use-toast'
import { cn } from '../../lib/utils'
import api from '../../lib/api'

const MODES = [
  { key: 'fullDay', label: 'יום שלם', icon: CalendarOff },
  { key: 'hours',   label: 'שעות ספציפיות', icon: Clock },
]

const emptyForm = { date: '', endDate: '', startTime: '', endTime: '', reason: '' }

export function BlockedSlotsManager() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState('fullDay')
  const [form, setForm] = useState(emptyForm)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/api/admin/blocked-slots')
      setSlots(data.slots ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function create() {
    let startDatetime, endDatetime

    if (mode === 'fullDay') {
      startDatetime = new Date(`${form.date}T00:00:00`).toISOString()
      endDatetime   = new Date(`${form.endDate || form.date}T23:59:59`).toISOString()
    } else {
      startDatetime = new Date(`${form.date}T${form.startTime}:00`).toISOString()
      endDatetime   = new Date(`${form.date}T${form.endTime}:00`).toISOString()
    }

    try {
      const res = await api.post('/api/admin/blocked-slots', { startDatetime, endDatetime, reason: form.reason })
      if (res.status === 201) {
        toast({ variant: 'success', title: 'חסימה נוספה' })
        setShowForm(false)
        setForm(emptyForm)
        load()
      } else {
        toast({ variant: 'destructive', title: 'שגיאה בהוספה' })
      }
    } catch {
      toast({ variant: 'destructive', title: 'שגיאה בהוספה' })
    }
  }

  async function remove(id) {
    if (!confirm('למחוק חסימה זו?')) return
    await api.delete(`/api/admin/blocked-slots/${id}`)
    toast({ title: 'חסימה הוסרה' })
    load()
  }

  function isFullDay(s) {
    const start = new Date(s.startDatetime)
    const end   = new Date(s.endDatetime)
    return start.getHours() === 0 && start.getMinutes() === 0 && end.getHours() === 23 && end.getMinutes() === 59
  }

  function formatSlot(s) {
    const start = new Date(s.startDatetime)
    const end   = new Date(s.endDatetime)
    const startDate = format(start, 'd MMMM yyyy', { locale: heLocale })
    const endDate   = format(end,   'd MMMM yyyy', { locale: heLocale })

    if (isFullDay(s)) {
      return startDate === endDate ? startDate : `${startDate} – ${endDate}`
    }
    const sameDay = startDate === endDate
    return sameDay
      ? `${startDate}  ${format(start, 'HH:mm')}–${format(end, 'HH:mm')}`
      : `${startDate} ${format(start, 'HH:mm')} – ${endDate} ${format(end, 'HH:mm')}`
  }

  const isFormValid = mode === 'fullDay'
    ? !!form.date
    : !!(form.date && form.startTime && form.endTime && form.startTime < form.endTime)

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal">חסימת זמנים</h1>
        <Button variant="gold" size="sm" onClick={() => { setShowForm(true); setForm(emptyForm) }}>
          <Plus className="w-4 h-4 me-1" /> הוסף חסימה
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="py-6 px-5 space-y-5">
            {/* Mode selector */}
            <div className="flex gap-2">
              {MODES.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setMode(key); setForm(emptyForm) }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                    mode === key
                      ? 'bg-gold border-gold text-charcoal'
                      : 'border-ink/15 text-ink/60 hover:border-gold/50'
                  )}
                >
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>

            {mode === 'fullDay' ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>מתאריך</Label>
                  <Input type="date" value={form.date} onChange={set('date')} />
                </div>
                <div className="space-y-1.5">
                  <Label>עד תאריך (ריק = יום אחד)</Label>
                  <Input type="date" value={form.endDate} min={form.date} onChange={set('endDate')} />
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>תאריך</Label>
                  <Input type="date" value={form.date} onChange={set('date')} />
                </div>
                <div className="space-y-1.5">
                  <Label>משעה</Label>
                  <Input type="time" value={form.startTime} onChange={set('startTime')} />
                </div>
                <div className="space-y-1.5">
                  <Label>עד שעה</Label>
                  <Input type="time" value={form.endTime} min={form.startTime} onChange={set('endTime')} />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>סיבה (אופציונלי)</Label>
              <Input value={form.reason} onChange={set('reason')} placeholder="חופשה, הפסקה, ישיבה..." />
            </div>

            <div className="flex gap-3">
              <Button variant="gold" onClick={create} disabled={!isFormValid}>שמור</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>בטל</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-center text-ink/40 py-10">טוען...</p>
      ) : slots.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-ink/40">אין חסימות פעילות</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {slots.map((s) => (
            <Card key={s._id}>
              <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    'p-2 rounded-lg shrink-0',
                    isFullDay(s) ? 'bg-gold/10 text-gold' : 'bg-blue-50 text-blue-500'
                  )}>
                    {isFullDay(s) ? <CalendarOff className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-ink text-sm" dir="ltr">{formatSlot(s)}</p>
                    {s.reason && <p className="text-xs text-ink/50 mt-0.5">{s.reason}</p>}
                  </div>
                </div>
                <button onClick={() => remove(s._id)} className="p-2 text-ink/40 hover:text-red-600 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
