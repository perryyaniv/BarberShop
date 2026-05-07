import { Check } from 'lucide-react'
import { cn } from '../lib/utils'

export function BookingStepper({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 overflow-x-auto pb-2">
      {steps.map((step, i) => (
        <div key={step.index} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all',
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
            <div className={cn('h-0.5 w-8 sm:w-12 mx-1 transition-all', currentStep > step.index ? 'bg-gold' : 'bg-ink/15')} />
          )}
        </div>
      ))}
    </div>
  )
}
