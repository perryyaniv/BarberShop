import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Scissors } from 'lucide-react'
import { useCustomer } from '../context/CustomerContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export function CustomerLoginPage() {
  const { customer, login, logout } = useCustomer()
  const navigate = useNavigate()
  const location = useLocation()
  const next = new URLSearchParams(location.search).get('next') || '/book'

  const [form, setForm] = useState({
    firstName: customer?.firstName ?? '',
    lastName: customer?.lastName ?? '',
    phone: customer?.phone ?? '',
  })
  const [error, setError] = useState('')

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const phone = form.phone.trim().replace(/[-\s]/g, '')
    if (!/^0[5][0-9]{8}$/.test(phone) && !/^05[0-9]-?\d{7}$/.test(form.phone.trim())) {
      if (!/^05\d{8}$/.test(phone)) {
        setError('מספר טלפון לא תקין. הכנס מספר בפורמט 05X-XXXXXXX')
        return
      }
    }

    login({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      fullName: `${form.firstName.trim()} ${form.lastName.trim()}`,
    })
    navigate(next, { replace: true })
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
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
                  placeholder="רון"
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>שם משפחה</Label>
                <Input
                  value={form.lastName}
                  onChange={set('lastName')}
                  placeholder="כהן"
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
                placeholder="050-1234567"
                required
                dir="ltr"
                autoComplete="tel"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              variant="gold"
              className="w-full"
              disabled={!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()}
            >
              <Scissors className="w-4 h-4 me-2" />
              {customer ? 'עדכן ועבור להזמנה' : 'כניסה והזמנת תור'}
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
