import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCustomer } from '../context/CustomerContext'
import { format, addDays, startOfToday, parseISO } from 'date-fns'
import { he as heLocale, enUS } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Check, Download, X } from 'lucide-react'
import { BookingStepper } from './BookingStepper'
import { TimeSlotGrid } from './TimeSlotGrid'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
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
  const [customerName, setCustomerName] = useState(customer?.fullName ?? '')
  const [notes, setNotes] = useState('')
  const [appointmentId, setAppointmentId] = useState(null)
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [inactiveDays, setInactiveDays] = useState(new Set())

  // steps: 0=service, 1=date, 2=time, 3=details, 4=confirm, 5=success
  const stepLabels = [
    t('booking.steps.service'),
    t('booking.steps.date'),
    t('booking.steps.time'),
    t('booking.steps.details'),
    t('booking.steps.confirm'),
    t('booking.steps.success'),
  ]
  const steps = stepLabels.map((label, i) => ({ label, index: i }))

  useEffect(() => {
    api.get('/api/working-hours').then(({ data }) => {
      const inactive = new Set(
        (data.hours ?? []).filter((h) => !h.isActive).map((h) => h.dayOfWeek)
      )
      setInactiveDays(inactive)
    }).catch(() => {})
  }, [])

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
        customerName,
        customerPhone: customer?.phone ?? '',
        notes,
      })
      setAppointmentId(data.appointmentId)
      setStep(5)
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

  function downloadIcs() {
    if (!selectedService || !selectedDate || !selectedTime) return
    const [h, m] = selectedTime.split(':').map(Number)
    const start = parseISO(selectedDate)
    start.setHours(h, m, 0)
    const end = new Date(start.getTime() + selectedService.durationMinutes * 60000)
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
      `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
      `SUMMARY:${selectedService.name[locale]}`,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'appointment.ics'; a.click()
    URL.revokeObjectURL(url)
  }

  const formattedDate = selectedDate
    ? format(parseISO(selectedDate), 'EEEE, d MMMM yyyy', { locale: dateLocale })
    : ''

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <Toaster />
      <h1 className="text-2xl font-bold text-charcoal text-center mb-6">{t('booking.title')}</h1>

      {step < 5 && (
        <div className="mb-8">
          <BookingStepper steps={steps.slice(0, 5)} currentStep={step} />
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
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {Array.from({ length: 28 }).map((_, i) => {
              const date = addDays(startOfToday(), i)
              const dateStr = format(date, 'yyyy-MM-dd')
              if (inactiveDays.has(date.getDay())) return null
              const isSelected = selectedDate === dateStr
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    'flex flex-col items-center py-2 px-1 rounded-lg border text-sm transition-all',
                    isSelected ? 'bg-gold border-gold text-charcoal font-bold shadow-md' : 'border-ink/15 hover:border-gold/50 bg-white text-ink'
                  )}
                >
                  <span className="text-xs opacity-60">{format(date, 'EEE', { locale: dateLocale })}</span>
                  <span className="font-semibold">{format(date, 'd')}</span>
                  <span className="text-xs opacity-50">{format(date, 'MMM', { locale: dateLocale })}</span>
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

      {/* Step 3: Your Details */}
      {step === 3 && (
        <div className="space-y-5">
          <h2 className="font-semibold text-lg text-ink">{t('booking.yourDetails')}</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">{t('booking.name')}</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="ישראל ישראלי"
                autoComplete="name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">{t('booking.notes')}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('booking.notesPlaceholder')}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
              <ChevronRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 me-1" />{t('booking.back')}
            </Button>
            <Button variant="gold" disabled={!customerName.trim()} onClick={() => setStep(4)}>
              {t('booking.next')}<ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 ms-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && selectedService && (
        <div className="space-y-6">
          <h2 className="font-semibold text-lg text-ink text-center">{t('booking.confirmBooking')}</h2>
          <div className="bg-cream-warm rounded-xl p-5 space-y-3">
            <SummaryRow label={t('booking.steps.service')} value={selectedService.name[locale]} />
            <SummaryRow label={t('booking.steps.date')} value={formattedDate} />
            <SummaryRow label={t('booking.steps.time')} value={selectedTime} />
            <SummaryRow label={t('booking.name')} value={customerName} />
            {notes && <SummaryRow label={t('booking.notes')} value={notes} />}
            <div className="border-t border-ink/10 pt-3 mt-3 flex justify-between font-bold text-charcoal">
              <span>₪{selectedService.priceIls}</span>
              <span>{selectedService.durationMinutes} דקות</span>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={() => setStep(3)}>{t('booking.back')}</Button>
            <Button variant="gold" onClick={submitBooking} disabled={submitting} className="min-w-[140px]">
              {submitting ? t('common.loading') : t('booking.confirm')}
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {step === 5 && selectedService && (
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
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="gold" onClick={downloadIcs}>
              <Download className="w-4 h-4 me-2" />{t('booking.addToCalendar')}
            </Button>
            {appointmentId && (
              <Button variant="outline" onClick={async () => {
                if (!confirm('לבטל את התור?')) return
                await api.post(`/api/appointments/${appointmentId}/cancel`)
                toast({ title: 'התור בוטל' })
              }}>
                <X className="w-4 h-4 me-2" />{t('booking.cancelBooking')}
              </Button>
            )}
          </div>
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
