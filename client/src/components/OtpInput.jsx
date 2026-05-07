import { useRef } from 'react'
import { cn } from '../lib/utils'

export function OtpInput({ value, onChange, length = 6, disabled = false }) {
  const inputs = useRef([])
  const digits = value.padEnd(length, '').slice(0, length).split('')

  function handleChange(index, char) {
    const filtered = char.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = filtered
    onChange(next.join('').slice(0, length))
    if (filtered && index < length - 1) inputs.current[index + 1]?.focus()
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) inputs.current[index - 1]?.focus()
    if (e.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < length - 1) inputs.current[index + 1]?.focus()
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted) {
      onChange(pasted)
      inputs.current[Math.min(pasted.length, length - 1)]?.focus()
    }
    e.preventDefault()
  }

  return (
    <div className="flex gap-2 justify-center" dir="ltr">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'w-11 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all focus:outline-none focus:border-gold',
            digits[i] ? 'border-gold bg-gold/5' : 'border-ink/20 bg-white',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      ))}
    </div>
  )
}
