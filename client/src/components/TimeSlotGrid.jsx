import { cn } from '../lib/utils'

export function TimeSlotGrid({ slots, selectedSlot, onSelect }) {
  if (slots.length === 0) return null

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.startTime}
            onClick={() => slot.available && onSelect(slot.startTime)}
            disabled={!slot.available}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
              slot.available
                ? selectedSlot === slot.startTime
                  ? 'bg-gold border-gold text-charcoal shadow-md scale-105'
                  : 'bg-white border-ink/15 text-ink hover:border-gold hover:bg-gold/5'
                : 'bg-ink/5 border-ink/10 text-ink/30 cursor-not-allowed line-through'
            )}
          >
            {slot.startTime}
          </button>
        ))}
      </div>
    </div>
  )
}
