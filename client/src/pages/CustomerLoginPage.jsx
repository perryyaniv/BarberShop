import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Scissors } from 'lucide-react'
import { useCustomer } from '../context/CustomerContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import api from '../lib/api'

// Accepts: 05XXXXXXXXX (10 digits, no hyphen)
const PHONE_REGEX = /^05[0-9]\d{7}$/

export function CustomerLoginPage() {
  const { customer, login, logout } = useCustomer()
  const navigate = useNavigate()
  const location = useLocation()
  const next = new URLSearchParams(location.search).get('next') || '/'

  const [form, setForm] = useState({
    firstName: customer?.firstName ?? '',
    lastName: customer?.lastName ?? '',
    phone: customer?.phone ?? '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const { firstName, lastName, phone } = form
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setError('יש למלא את כל השדות')
      return
    }

    if (!PHONE_REGEX.test(phone.trim())) {
      setError('מספר טלפון לא תקין. הכנס 10 ספרות המתחילות ב-05')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.get('/api/appointments/customer-lookup', {
        params: { phone: phone.trim() },
      })

      const resolvedName = data.found
        ? { firstName: data.name.split(' ')[0], lastName: data.name.split(' ').slice(1).join(' ') || lastName.trim() }
        : { firstName: firstName.trim(), lastName: lastName.trim() }

      login({
        firstName: resolvedName.firstName,
        lastName: resolvedName.lastName,
        phone: phone.trim(),
        fullName: `${resolvedName.firstName} ${resolvedName.lastName}`,
      })
      navigate(next, { replace: true })
    } catch {
      // On API error fall back to entered details
      login({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
      })
      navigate(next, { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal-dark to-black opacity-90" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold/50 shadow-xl">
              <img src="/ron-paz.jpg" alt="HairStyles RP" className="w-full h-full object-cover object-top" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">
            HairStyles <span className="text-gold">RP</span>
          </h1>
          <p className="text-white/50 text-sm mt-1">ברוך הבא! הכנס את הפרטים שלך</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
          {customer && (
            <div className="bg-gold/10 border border-gold/30 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal">שלום, {customer.firstName} 👋</p>
                <p className="text-xs text-ink/50">{customer.phone}</p>
              </div>
              <button onClick={logout} className="text-xs text-ink/40 hover:text-red-500 transition-colors">
                החלף פרטים
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>שם פרטי</Label>
                <Input
                  value={form.firstName}
                  onChange={set('firstName')}
                  placeholder=""
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>שם משפחה</Label>
                <Input
                  value={form.lastName}
                  onChange={set('lastName')}
                  placeholder=""
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>מספר טלפון</Label>
              <Input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="0501234567"
                required
                dir="ltr"
                autoComplete="tel"
              />
              <p className="text-xs text-ink/40">פורמט: 05XXXXXXXXX (10 ספרות)</p>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              variant="gold"
              className="w-full"
              disabled={loading || !form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()}
            >
              <Scissors className="w-4 h-4 me-2" />
              {loading ? 'מאמת...' : customer ? 'עדכן ועבור להזמנה' : 'כניסה והזמנת תור'}
            </Button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          הפרטים נשמרים על המכשיר שלך בלבד
        </p>
      </div>
    </div>
  )
}
