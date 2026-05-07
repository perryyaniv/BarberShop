import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Plus, Trash2 } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Toaster } from '../ui/toaster'
import { toast } from '../../hooks/use-toast'
import api from '../../lib/api'

export function BlockedSlotsManager() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ startDatetime: '', endDatetime: '', reason: '' })

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

  async function create() {
    const res = await api.post('/api/admin/blocked-slots', {
      startDatetime: new Date(form.startDatetime).toISOString(),
      endDatetime: new Date(form.endDatetime).toISOString(),
      reason: form.reason,
    })
    if (res.status === 201) {
      toast({ variant: 'success', title: 'Block added' })
      setShowForm(false); setForm({ startDatetime: '', endDatetime: '', reason: '' }); load()
    } else {
      toast({ variant: 'destructive', title: 'Failed to add' })
    }
  }

  async function remove(id) {
    if (!confirm('Remove this block?')) return
    await api.delete(`/api/admin/blocked-slots/${id}`)
    toast({ title: 'Block removed' }); load()
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal">Blocked Times</h1>
        <Button variant="gold" size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4 me-1" /> Add Block</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="py-6 px-5 space-y-4">
            <h2 className="font-semibold text-charcoal">Block Time Range</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>From</Label>
                <Input type="datetime-local" value={form.startDatetime} onChange={(e) => setForm((f) => ({ ...f, startDatetime: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>To</Label>
                <Input type="datetime-local" value={form.endDatetime} onChange={(e) => setForm((f) => ({ ...f, endDatetime: e.target.value }))} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Reason (optional)</Label>
                <Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Vacation, break..." />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="gold" onClick={create} disabled={!form.startDatetime || !form.endDatetime}>Save</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-center text-ink/40 py-10">Loading...</p>
      ) : slots.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-ink/40">No blocked times</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {slots.map((s) => (
            <Card key={s._id}>
              <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-ink" dir="ltr">
                    {format(new Date(s.startDatetime), 'd/M/yyyy HH:mm')} → {format(new Date(s.endDatetime), 'd/M/yyyy HH:mm')}
                  </p>
                  {s.reason && <p className="text-sm text-ink/50">{s.reason}</p>}
                </div>
                <button onClick={() => remove(s._id)} className="p-1.5 text-ink/40 hover:text-red-600 transition-colors">
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
