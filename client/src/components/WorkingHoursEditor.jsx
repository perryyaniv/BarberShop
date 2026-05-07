import { useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from '../hooks/use-toast'
import { Toaster } from './ui/toaster'
import api from '../lib/api'

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

const DEFAULT_HOURS = DAY_NAMES.map((_, i) => ({
  dayOfWeek: i, startTime: '09:00', endTime: '19:00', isActive: i !== 6,
}))

const INTERVAL_OPTIONS = [
  { value: 10, label: '10 דקות' },
  { value: 15, label: '15 דקות' },
  { value: 20, label: '20 דקות' },
  { value: 30, label: '30 דקות' },
  { value: 45, label: '45 דקות' },
  { value: 60, label: 'שעה' },
]

const MIN_DAYS_OPTIONS = [
  { value: 0,  label: 'ללא הגבלה' },
  { value: 1,  label: 'יום אחד' },
  { value: 2,  label: 'יומיים' },
  { value: 3,  label: '3 ימים' },
  { value: 7,  label: 'שבוע' },
  { value: 14, label: 'שבועיים' },
  { value: 30, label: 'חודש' },
]

export function WorkingHoursEditor() {
  const [hours, setHours] = useState(DEFAULT_HOURS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [slotInterval, setSlotInterval] = useState(30)
  const [savingInterval, setSavingInterval] = useState(false)
  const [minDays, setMinDays] = useState(0)
  const [savingMinDays, setSavingMinDays] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [hoursRes, settingsRes] = await Promise.all([
        api.get('/api/admin/working-hours'),
        api.get('/api/admin/shop-settings'),
      ])
      if (hoursRes.data.hours?.length > 0) setHours(hoursRes.data.hours)
      setSlotInterval(settingsRes.data.slotIntervalMinutes ?? 30)
      setMinDays(settingsRes.data.minDaysBetweenAppointments ?? 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function updateDay(dayOfWeek, changes) {
    setHours((prev) => prev.map((h) => h.dayOfWeek === dayOfWeek ? { ...h, ...changes } : h))
  }

  async function saveDay(day) {
    setSaving(day.dayOfWeek)
    try {
      const res = await api.put('/api/admin/working-hours', day)
      if (res.status === 200) {
        toast({ variant: 'success', title: `יום ${DAY_NAMES[day.dayOfWeek]} נשמר` })
      } else {
        toast({ variant: 'destructive', title: 'שגיאה בשמירה' })
      }
    } catch {
      toast({ variant: 'destructive', title: 'שגיאה בשמירה' })
    } finally {
      setSaving(null)
    }
  }

  async function saveInterval() {
    setSavingInterval(true)
    try {
      await api.put('/api/admin/shop-settings', { slotIntervalMinutes: slotInterval })
      toast({ variant: 'success', title: 'הפרש הזמנים עודכן' })
    } catch {
      toast({ variant: 'destructive', title: 'שגיאה בשמירה' })
    } finally {
      setSavingInterval(false)
    }
  }

  async function saveMinDays() {
    setSavingMinDays(true)
    try {
      await api.put('/api/admin/shop-settings', { minDaysBetweenAppointments: minDays })
      toast({ variant: 'success', title: 'הגבלת ימים עודכנה' })
    } catch {
      toast({ variant: 'destructive', title: 'שגיאה בשמירה' })
    } finally {
      setSavingMinDays(false)
    }
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <h1 className="text-2xl font-bold text-charcoal">שעות פעילות</h1>

      {/* Slot interval setting */}
      <Card>
        <CardContent className="py-4 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="font-semibold text-ink">הפרש בין תורים</p>
              <p className="text-sm text-ink/50 mt-0.5">זמן המינימום בין תחילת תור לתחילת התור הבא</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={slotInterval}
                onChange={(e) => setSlotInterval(Number(e.target.value))}
                className="h-10 rounded-md border border-ink/20 bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              >
                {INTERVAL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <Button size="sm" variant="gold" onClick={saveInterval} disabled={savingInterval}>
                {savingInterval ? 'שומר...' : 'שמור'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Min days between appointments */}
      <Card>
        <CardContent className="py-4 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="font-semibold text-ink">מינימום ימים בין תורים ללקוח</p>
              <p className="text-sm text-ink/50 mt-0.5">כמה ימים מינימום בין תור לתור עבור אותו לקוח</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={minDays}
                onChange={(e) => setMinDays(Number(e.target.value))}
                className="h-10 rounded-md border border-ink/20 bg-white px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              >
                {MIN_DAYS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <Button size="sm" variant="gold" onClick={saveMinDays} disabled={savingMinDays}>
                {savingMinDays ? 'שומר...' : 'שמור'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-center text-ink/40 py-10">טוען...</p>
      ) : (
        <div className="space-y-3">
          {hours.map((h) => (
            <Card key={h.dayOfWeek}>
              <CardContent className="py-4 px-5">
                <div className="flex items-center justify-between gap-2 mb-3 sm:mb-0 sm:hidden">
                  <span className="font-semibold text-ink">{DAY_NAMES[h.dayOfWeek]}</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={h.isActive} onChange={(e) => updateDay(h.dayOfWeek, { isActive: e.target.checked })} className="w-4 h-4 accent-gold" />
                    <span className="text-sm text-ink/60">פתוח</span>
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="hidden sm:flex items-center gap-4 shrink-0">
                    <div className="w-20 font-medium text-ink">{DAY_NAMES[h.dayOfWeek]}</div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={h.isActive} onChange={(e) => updateDay(h.dayOfWeek, { isActive: e.target.checked })} className="w-4 h-4 accent-gold" />
                      <span className="text-sm text-ink/60">פתוח</span>
                    </label>
                  </div>
                  {h.isActive ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input type="time" value={h.startTime} onChange={(e) => updateDay(h.dayOfWeek, { startTime: e.target.value })} className="flex-1 sm:w-28 sm:flex-none" />
                      <span className="text-ink/40 shrink-0">–</span>
                      <Input type="time" value={h.endTime} onChange={(e) => updateDay(h.dayOfWeek, { endTime: e.target.value })} className="flex-1 sm:w-28 sm:flex-none" />
                    </div>
                  ) : (
                    <span className="text-sm text-ink/30 flex-1">סגור</span>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => saveDay(h)} disabled={saving === h.dayOfWeek} className="w-full sm:w-auto">
                    {saving === h.dayOfWeek ? 'שומר...' : 'שמור'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
