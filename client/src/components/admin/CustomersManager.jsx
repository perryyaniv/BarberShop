import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Search } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import api from '../../lib/api'

export function CustomersManager() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function load(q = '') {
    setLoading(true)
    try {
      const { data } = await api.get(`/api/admin/customers?search=${encodeURIComponent(q)}`)
      setCustomers(data.customers ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => load(search), 300)
    return () => clearTimeout(t)
  }, [search])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">Customers</h1>
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
        <Input className="ps-9" placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {loading ? (
        <p className="text-center text-ink/40 py-10">Loading...</p>
      ) : customers.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-ink/40">No customers found</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {customers.map((c) => (
            <Card key={c._id}>
              <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink">{c.name}</p>
                  <p className="text-sm text-ink/50" dir="ltr">{c.phone}</p>
                </div>
                <div className="text-end space-y-0.5">
                  <p className="text-sm font-medium text-charcoal">{c.visitCount} visits</p>
                  {c.lastVisit && <p className="text-xs text-ink/40">Last: {format(new Date(c.lastVisit), 'd/M/yyyy')}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
