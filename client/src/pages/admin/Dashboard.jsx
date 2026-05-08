import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Calendar, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import api from '../../lib/api'
import { formatPhone } from '../../lib/utils'

const STATUS_COLOR = {
  confirmed: 'success',
  pending_verification: 'warning',
  completed: 'outline',
  cancelled: 'destructive',
  no_show: 'destructive',
}

const STATUS_LABEL = {
  confirmed: 'מאושר',
  pending_verification: 'ממתין לאימות',
  completed: 'הושלם',
  cancelled: 'בוטל',
  no_show: 'לא הגיע',
}

export function Dashboard() {
  const [stats, setStats] = useState(null)
  const [todayAppts, setTodayAppts] = useState([])

  useEffect(() => {
    api.get('/api/admin/dashboard').then(({ data }) => {
      setStats(data)
    })
    const now = new Date()
    const from = new Date(now); from.setHours(0, 0, 0, 0)
    const to = new Date(now); to.setHours(23, 59, 59, 999)
    api.get(`/api/admin/appointments?from=${from.toISOString()}&to=${to.toISOString()}`).then(({ data }) => {
      setTodayAppts(data.appointments ?? [])
    })
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">לוח בקרה</h1>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={<Calendar className="w-5 h-5 text-gold" />} label="היום" value={stats.todayCount} />
          <StatCard icon={<TrendingUp className="w-5 h-5 text-gold" />} label="השבוע" value={stats.weekCount} />
          <StatCard icon={<Users className="w-5 h-5 text-gold" />} label="לקוחות" value={stats.totalCustomers} />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-charcoal mb-4">
          תורים היום ({format(new Date(), 'd/M/yyyy')})
        </h2>
        {todayAppts.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-ink/40">אין תורים היום</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {todayAppts.map((a) => (
              <Card key={a._id}>
                <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{a.customerId?.name ?? 'Unknown'}</p>
                    <p className="text-sm text-ink/50">
                      {a.serviceId?.name?.he ?? 'שירות'} • <span dir="ltr">{formatPhone(a.customerId?.phone)}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-charcoal font-bold text-base" dir="ltr">
                      {format(new Date(a.startTime), 'HH:mm')}
                    </span>
                    <Badge variant={STATUS_COLOR[a.status] ?? 'outline'}>{STATUS_LABEL[a.status] ?? a.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <Card>
      <CardContent className="py-5 px-5 flex items-center gap-4">
        <div className="p-2.5 rounded-lg bg-gold/10">{icon}</div>
        <div>
          <p className="text-ink/50 text-sm">{label}</p>
          <p className="text-2xl font-bold text-charcoal">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
