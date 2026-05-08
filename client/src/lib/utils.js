import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Converts +972XXXXXXXXX → 0XXXXXXXXX
export function formatPhone(phone) {
  if (!phone) return ''
  if (phone.startsWith('+972')) return '0' + phone.slice(4)
  if (phone.startsWith('972')) return '0' + phone.slice(3)
  return phone
}
