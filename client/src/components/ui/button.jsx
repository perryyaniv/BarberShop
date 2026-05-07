import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-charcoal text-white hover:bg-charcoal-dark focus-visible:ring-charcoal',
        gold: 'bg-gold text-charcoal font-semibold hover:bg-gold-dark focus-visible:ring-gold',
        outline: 'border border-charcoal bg-transparent text-charcoal hover:bg-charcoal hover:text-white',
        ghost: 'bg-transparent hover:bg-cream-warm text-ink',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
        secondary: 'bg-cream-warm text-ink hover:bg-cream border border-ink/10',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-md px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = 'Button'

export { Button, buttonVariants }
