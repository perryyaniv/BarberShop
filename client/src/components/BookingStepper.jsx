import { Check } from 'lucide-react'
import { cn } from '../lib/utils'

export function BookingStepper({ steps, currentStep }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, i) => (
        <div key={step.index} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center shrink-0">
            <div className={cn(
              'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold border-2 transition-all',
              currentStep > step.index ? 'bg-gold border-gold text-charcoal'
                : currentStep === step.index ? 'bg-charcoal border-charcoal text-white'
                : 'bg-white border-ink/20 text-ink/40'
            )}>
              {currentStep > step.index ? <Check className="w-4 h-4" /> : step.index + 1}
            </div>
            <span className={cn(
              'text-xs mt-1 hidden sm:block whitespace-nowrap',
              currentStep === step.index ? 'text-charcoal font-medium'
                : currentStep > step.index ? 'text-gold'
                : 'text-ink/40'
            )}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn('h-0.5 flex-1 min-w-[8px] mx-1 transition-all', currentStep > step.index ? 'bg-gold' : 'bg-ink/15')} />
          )}
        </div>
      ))}
    </div>
  )
}
