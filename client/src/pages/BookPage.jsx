import { useEffect, useState } from 'react'
import { Navbar } from '../components/Navbar'
import { BookingWizard } from '../components/BookingWizard'
import { Toaster } from '../components/ui/toaster'
import api from '../lib/api'

export function BookPage() {
  const [services, setServices] = useState([])

  useEffect(() => {
    api.get('/api/services').then(({ data }) => setServices(data.services ?? []))
  }, [])

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
