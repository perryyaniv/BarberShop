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
    if (!customer) { navigate('/login', { replace: true }); return }
    api.get('/api/services').then(({ data }) => setServices(data.services ?? []))
  }, [customer])

  if (!customer) return null

  return (
    <div className="flex flex-col bg-cream" style={{ height: '100dvh' }} dir="rtl">
      <Navbar />
      <main className="flex-1 min-h-0 overflow-hidden px-4 py-4 max-w-2xl mx-auto w-full">
        <BookingWizard services={services} />
      </main>
      <Toaster />
    </div>
  )
}
