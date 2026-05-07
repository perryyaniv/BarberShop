import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { BookingWizard } from '../components/BookingWizard'
import { Toaster } from '../components/ui/toaster'
import { useCustomer } from '../context/CustomerContext'
import api from '../lib/api'

export function BookPage() {
  const [services, setServices] = useState([])
  const { customer } = useCustomer()
  const navigate = useNavigate()

  useEffect(() => {
    if (!customer) { navigate('/login?next=/book', { replace: true }); return }
    api.get('/api/services').then(({ data }) => setServices(data.services ?? []))
  }, [customer])

  if (!customer) return null

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <BookingWizard services={services} />
      </main>
      <Toaster />
    </div>
  )
}
