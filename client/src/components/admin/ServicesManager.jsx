import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Toaster } from '../ui/toaster'
import { toast } from '../../hooks/use-toast'
import api from '../../lib/api'

const CATEGORIES = ['haircut', 'beard', 'combo', 'other']

const emptyForm = {
  name: { he: '', en: '' }, description: { he: '', en: '' },
  durationMinutes: 30, priceIls: 80, category: 'haircut', sortOrder: 0, isActive: true,
}

export function ServicesManager() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const { data } = await api.get('/api/admin/services')
      setServices(data.services ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openCreate() { setEditing(null); setForm(emptyForm); setShowForm(true) }
  function openEdit(s) {
    setEditing(s)
    setForm({ name: s.name, description: s.description, durationMinutes: s.durationMinutes, priceIls: s.priceIls, category: s.category, sortOrder: s.sortOrder, isActive: s.isActive })
    setShowForm(true)
  }

  async function save() {
    const url = editing ? `/api/admin/services/${editing._id}` : '/api/admin/services'
    const method = editing ? 'put' : 'post'
    const res = await api[method](url, form)
    if (res.status === 200 || res.status === 201) {
      toast({ variant: 'success', title: editing ? 'Service updated' : 'Service created' })
      setShowForm(false); load()
    } else {
      toast({ variant: 'destructive', title: 'Save failed' })
    }
  }

  async function toggleActive(s) {
    await api.put(`/api/admin/services/${s._id}`, { isActive: !s.isActive })
    load()
  }

  async function deleteService(id) {
    if (!confirm('Delete this service?')) return
    await api.delete(`/api/admin/services/${id}`)
    toast({ title: 'Deleted' }); load()
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-charcoal">Services</h1>
        <Button variant="gold" size="sm" onClick={openCreate}><Plus className="w-4 h-4 me-1" /> Add Service</Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="py-6 px-5 space-y-4">
            <h2 className="font-semibold text-charcoal">{editing ? 'Edit Service' : 'New Service'}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name (Hebrew)</Label>
                <Input value={form.name.he} onChange={(e) => setForm((f) => ({ ...f, name: { ...f.name, he: e.target.value } }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Name (English)</Label>
                <Input value={form.name.en} onChange={(e) => setForm((f) => ({ ...f, name: { ...f.name, en: e.target.value } }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Duration (min)</Label>
                <Input type="number" value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: +e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Price (₪)</Label>
                <Input type="number" value={form.priceIls} onChange={(e) => setForm((f) => ({ ...f, priceIls: +e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <select className="flex h-10 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: +e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="gold" onClick={save}>Save</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-center text-ink/40 py-10">Loading...</p>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <Card key={s._id}>
              <CardContent className="py-4 px-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-ink">{s.name.he}</p>
                  <p className="text-sm text-ink/50">{s.name.en}</p>
                  <div className="flex gap-3 mt-1 text-xs text-ink/60">
                    <span>{s.durationMinutes} min</span>
                    <span>₪{s.priceIls}</span>
                    <Badge variant="outline">{s.category}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(s)} className="text-ink/40 hover:text-gold transition-colors">
                    {s.isActive ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button onClick={() => openEdit(s)} className="p-1.5 text-ink/40 hover:text-charcoal transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => deleteService(s._id)} className="p-1.5 text-ink/40 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
