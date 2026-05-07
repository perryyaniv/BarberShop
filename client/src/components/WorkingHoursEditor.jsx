import { useEffect, useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from '../hooks/use-toast'
import { Toaster } from './ui/toaster'
import api from '../lib/api'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const DEFAULT_HOURS = DAY_NAMES.map((_, i) => ({
  dayOfWeek: i, startTime: '09:00', endTime: '19:00', isActive: i !== 6,
}))

export function WorkingHoursEditor() {
  const [hours, setHours] = useState(DEFAULT_HOURS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/api/admin/working-hours')
      if (data.hours?.length > 0) setHours(data.hours)
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
        toast({ variant: 'success', title: `${DAY_NAMES[day.dayOfWeek]} saved` })
      } else {
        toast({ variant: 'destructive', title: 'Save failed' })
      }
    } catch {
      toast({ variant: 'destructive', title: 'Save failed' })
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <h1 className="text-2xl font-bold text-charcoal">Working Hours</h1>
      {loading ? (
        <p className="text-center text-ink/40 py-10">Loading...</p>
      ) : (
        <div className="space-y-3">
          {hours.map((h) => (
            <Card key={h.dayOfWeek}>
              <CardContent className="py-4 px-5">
                <div className="flex items-center justify-between gap-2 mb-3 sm:mb-0 sm:hidden">
                  <span className="font-semibold text-ink">{DAY_NAMES[h.dayOfWeek]}</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={h.isActive} onChange={(e) => updateDay(h.dayOfWeek, { isActive: e.target.checked })} className="w-4 h-4 accent-gold" />
                    <span className="text-sm text-ink/60">Open</span>
                  </label>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="hidden sm:flex items-center gap-4 shrink-0">
                    <div className="w-24 font-medium text-ink">{DAY_NAMES[h.dayOfWeek]}</div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={h.isActive} onChange={(e) => updateDay(h.dayOfWeek, { isActive: e.target.checked })} className="w-4 h-4 accent-gold" />
                      <span className="text-sm text-ink/60">Open</span>
                    </label>
                  </div>
                  {h.isActive ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input type="time" value={h.startTime} onChange={(e) => updateDay(h.dayOfWeek, { startTime: e.target.value })} className="flex-1 sm:w-28 sm:flex-none" />
                      <span className="text-ink/40 shrink-0">–</span>
                      <Input type="time" value={h.endTime} onChange={(e) => updateDay(h.dayOfWeek, { endTime: e.target.value })} className="flex-1 sm:w-28 sm:flex-none" />
                    </div>
                  ) : (
                    <span className="text-sm text-ink/30 flex-1">Closed</span>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => saveDay(h)} disabled={saving === h.dayOfWeek} className="w-full sm:w-auto">
                    {saving === h.dayOfWeek ? 'Saving...' : 'Save'}
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
