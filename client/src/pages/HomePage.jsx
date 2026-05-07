import { useEffect, useState } from 'react'
import { Navbar } from '../components/Navbar'
import { HeroSection } from '../components/sections/HeroSection'
import { AboutSection } from '../components/sections/AboutSection'
import { ServicesSection } from '../components/sections/ServicesSection'
import { GallerySection } from '../components/sections/GallerySection'
import { Footer } from '../components/Footer'
import { Toaster } from '../components/ui/toaster'
import api from '../lib/api'

export function HomePage() {
  const [shop, setShop] = useState(null)
  const [services, setServices] = useState([])
  const [workingHours, setWorkingHours] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/api/shop'),
      api.get('/api/services'),
      api.get('/api/working-hours'),
    ]).then(([shopRes, servicesRes, hoursRes]) => {
      setShop(shopRes.data.shop)
      setServices(servicesRes.data.services)
      setWorkingHours(hoursRes.data.hours)
    })
  }, [])

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      <Navbar />
      <main>
        <HeroSection shop={shop} />
        <AboutSection shop={shop} workingHours={workingHours} />
        <ServicesSection services={services} />
        <GallerySection shop={shop} />
      </main>
      <Footer shop={shop} />
      <Toaster />
    </div>
  )
}
