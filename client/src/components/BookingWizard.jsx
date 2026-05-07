import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCustomer } from '../context/CustomerContext'
import { format, addDays, startOfToday, parseISO, isBefore, isToday } from 'date-fns'
import { he as heLocale, enUS } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { BookingStepper } from './BookingStepper'
import { TimeSlotGrid } from './TimeSlotGrid'
import { Button } from './ui/button'
import { Toaster } from './ui/toaster'
import { toast } from '../hooks/use-toast'
import { cn } from '../lib/utils'
import api from '../lib/api'

export function BookingWizard({ services }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const dateLocale = locale === 'he' ? heLocale : enUS
  const { customer } = useCustomer()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentId, setAppointmentId] = useState(null)
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [inactiveDays, setInactiveDays] = useState(new Set())
  const [daysStatus, setDaysStatus] = useState({})   // dateStr → boolean
  const [daysLoading, setDaysLoading] = useState(false)

  const stepLabels = [
    t('booking.steps.service'),
    t('booking.steps.date'),
    t('booking.steps.time'),
    t('booking.steps.confirm'),
    t('booking.steps.success'),
  ]
  const steps = stepLabels.map((label, i) => ({ label, index: i }))

  useEffect(() => {
    const init = async () => {
      const [hoursRes, settingsRes] = await Promise.all([
        api.get('/api/working-hours').catch(() => ({ data: {} })),
        api.get('/api/appointments/settings').catch(() => ({ data: {} })),
      ])
      const inactive = new Set(
        (hoursRes.data.hours ?? []).filter((h) => !h.isActive).map((h) => h.dayOfWeek)
      )
      setInactiveDays(inactive)

      if (customer?.phone) {
        const minDays = settingsRes.data.minDaysBetweenAppointments ?? 0
        if (minDays === 0) {
          // Only redirect when there's no gap restriction
          api.get(`/api/appointments/my?phone=${encodeURIComponent(customer.phone)}`).then(({ data }) => {
            const hasActive = (data.appointments ?? []).some(
              (a) => ['confirmed', 'pending_verification'].includes(a.status) && new Date(a.startTime) >= new Date()
            )
            if (hasActive) {
              toast({ variant: 'destructive', title: 'כבר קיים תור פעיל על שמך. בטל אותו לפני הזמנה חדשה.' })
              setTimeout(() => navigate('/my-appointments'), 1800)
            }
          }).catch(() => {})
        }
      }
    }
    init()
  }, [])

  const loadDaysAvailability = useCallback(async (serviceId) => {
    setDaysLoading(true)
    try {
      const from = format(startOfToday(), 'yyyy-MM-dd')
      const to = format(addDays(startOfToday(), 27), 'yyyy-MM-dd')
      const { data } = await api.get(
        `/api/appointments/days-availability?serviceId=${serviceId}&from=${from}&to=${to}`
      )
      setDaysStatus(data.availability ?? {})
    } catch {
      // fallback: all days appear available
    } finally {
      setDaysLoading(false)
    }
  }, [])

  useEffect(() => {
    if (step === 1 && selectedService) {
      loadDaysAvailability(selectedService._id)
    }
  }, [step, selectedService, loadDaysAvailability])

  const loadSlots = useCallback(async (date, serviceId) => {
    setSlotsLoading(true)
    try {
      const { data } = await api.get(`/api/appointments/available-slots?date=${date}&serviceId=${serviceId}`)
      setSlots(data.slots ?? [])
    } finally {
      setSlotsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (step === 2 && selectedDate && selectedService) {
      loadSlots(selectedDate, selectedService._id)
    }
  }, [step, selectedDate, selectedService, loadSlots])

  async function submitBooking() {
    if (!selectedService || !selectedDate || !selectedTime) return

    const slotDatetime = new Date(`${selectedDate}T${selectedTime}:00`)
    if (isBefore(slotDatetime, new Date())) {
      toast({ variant: 'destructive', title: 'לא ניתן להזמין לשעה שכבר עברה' })
      setSelectedTime('')
      loadSlots(selectedDate, selectedService._id)
      return
    }

    setSubmitting(true)
    try {
      const { data } = await api.post('/api/appointments', {
        serviceId: selectedService._id,
        date: selectedDate,
        startTime: selectedTime,
        customerName: customer?.fullName ?? '',
        customerPhone: customer?.phone ?? '',
      })
      setAppointmentId(data.appointmentId)
      setStep(4)
    } catch (err) {
      if (err.response?.data?.error === 'past_time') {
        toast({ variant: 'destructive', title: 'לא ניתן להזמין לשעה שכבר עברה' })
        setSelectedTime('')
        setStep(2)
        loadSlots(selectedDate, selectedService._id)
      } else if (err.response?.data?.error === 'slot_taken') {
        toast({ variant: 'destructive', title: t('booking.slotUnavailable') })
        setStep(2)
        loadSlots(selectedDate, selectedService._id)
      } else if (err.response?.data?.error === 'already_booked') {
        toast({ variant: 'destructive', title: 'כבר קיים תור פעיל על שמך. בטל אותו לפני הזמנה חדשה.' })
        setTimeout(() => navigate('/my-appointments'), 1500)
      } else {
        toast({ variant: 'destructive', title: err.response?.data?.error || t('common.error') })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const formattedDate = selectedDate
    ? format(parseISO(selectedDate), 'EEEE, d MMMM yyyy', { locale: dateLocale })
    : ''

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <Toaster />
      <h1 className="text-2xl font-bold text-charcoal text-center mb-6">{t('booking.title')}</h1>

      {step < 4 && (
        <div className="mb-8">
          <BookingStepper steps={steps.slice(0, 4)} currentStep={step} />
        </div>
      )}

      {/* Step 0: Select Service */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg text-ink">{t('booking.selectService')}</h2>
          <div className="space-y-3">
            {services.map((service) => (
              <button
                key={service._id}
                onClick={() => { setSelectedService(service); setStep(1) }}
                className={cn(
                  'w-full text-start rounded-xl border-2 transition-all p-4',
                  selectedService?._id === service._id ? 'border-gold bg-gold/5' : 'border-ink/10 hover:border-gold/50'
                )}
              >
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="font-semibold text-ink">{service.name[locale]}</p>
                    {service.description?.[locale] && (
                      <p className="text-ink/50 text-sm mt-0.5 line-clamp-1">{service.description[locale]}</p>
                    )}
                    <p className="text-ink/50 text-xs mt-1">{service.durationMinutes} דקות</p>
                  </div>
                  <span className="font-bold text-charcoal text-lg shrink-0">₪{service.priceIls}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Select Date */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg text-ink">{t('booking.selectDate')}</h2>
          {daysLoading && (
            <p className="text-center text-ink/40 text-sm py-2">{t('common.loading')}</p>
          )}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => {
              const date = addDays(startOfToday(), i)
              const dateStr = format(date, 'yyyy-MM-dd')

              if (inactiveDays.has(date.getDay())) return null

              const isFull = !daysLoading && daysStatus[dateStr] === false
              const todayEnded = isFull && isToday(date)

              // Hide today if it has no more available slots
              if (todayEnded) return null

              const isSelected = selectedDate === dateStr

              return (
                <button
                  key={dateStr}
                  disabled={isFull}
                  onClick={() => !isFull && setSelectedDate(dateStr)}
                  className={cn(
                    'flex flex-col items-center py-2 px-1 rounded-lg border text-sm transition-all',
                    isSelected
                      ? 'bg-gold border-gold text-charcoal font-bold shadow-md'
                      : isFull
                      ? 'border-ink/10 bg-ink/5 text-ink/30 cursor-not-allowed'
                      : 'border-ink/15 hover:border-gold/50 bg-white text-ink'
                  )}
                >
                  <span className="text-xs opacity-60">{format(date, 'EEE', { locale: dateLocale })}</span>
                  <span className="font-semibold">{format(date, 'd')}</span>
                  {isFull ? (
                    <span className="text-xs text-red-400 font-medium">מלא</span>
                  ) : (
                    <span className="text-xs opacity-50">{format(date, 'MMM', { locale: dateLocale })}</span>
                  )}
                </button>
              )
            })}
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
              <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 me-1" />{t('booking.back')}
            </Button>
            <Button variant="gold" disabled={!selectedDate} onClick={() => setStep(2)}>
              {t('booking.next')}<ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 ms-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Time */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg text-ink">
            {t('booking.selectTime')}
            {formattedDate && <span className="block text-sm font-normal text-ink/50 mt-1">{formattedDate}</span>}
          </h2>
          {slotsLoading ? (
            <p className="text-center text-ink/40 py-8">{t('common.loading')}</p>
          ) : slots.length === 0 ? (
            <p className="text-center text-ink/50 py-8">{t('booking.noSlotsAvailable')}</p>
          ) : (
            <TimeSlotGrid slots={slots.filter((s) => s.available)} selectedSlot={selectedTime} onSelect={setSelectedTime} />
          )}
          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 me-1" />{t('booking.back')}
            </Button>
            <Button variant="gold" disabled={!selectedTime} onClick={() => setStep(3)}>
              {t('booking.next')}<ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 ms-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && selectedService && (
        <div className="space-y-6">
          <h2 className="font-semibold text-lg text-ink text-center">{t('booking.confirmBooking')}</h2>
          <div className="bg-cream-warm rounded-xl p-5 space-y-3">
            <SummaryRow label={t('booking.steps.service')} value={selectedService.name[locale]} />
            <SummaryRow label={t('booking.steps.date')} value={formattedDate} />
            <SummaryRow label={t('booking.steps.time')} value={selectedTime} />
            <SummaryRow label={t('booking.name')} value={customer?.fullName ?? ''} />
            <div className="border-t border-ink/10 pt-3 mt-3 flex justify-between font-bold text-charcoal">
              <span>₪{selectedService.priceIls}</span>
              <span>{selectedService.durationMinutes} דקות</span>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>{t('booking.back')}</Button>
            <Button variant="gold" onClick={submitBooking} disabled={submitting} className="min-w-[140px]">
              {submitting ? t('common.loading') : t('booking.confirm')}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Success — only show confirmation, no extra actions */}
      {step === 4 && selectedService && (
        <div className="text-center space-y-6 py-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-charcoal mb-2">{t('booking.successTitle')}</h2>
            <p className="text-ink/60 text-base">
              {t('booking.successMessage', { service: selectedService.name[locale], date: formattedDate, time: selectedTime })}
            </p>
          </div>
          <Button variant="gold" onClick={() => navigate('/my-appointments')}>
            {t('booking.viewMyAppointments') || 'התורים שלי'}
          </Button>
        </div>
      )}
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4 text-sm">
      <span className="text-ink/50 shrink-0">{label}</span>
      <span className="font-medium text-ink text-end">{value}</span>
    </div>
  )
}
