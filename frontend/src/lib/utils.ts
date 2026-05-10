import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getRiskLabel(score: number): { label: string; color: string } {
  if (score < 0.3) return { label: 'Low Risk', color: 'text-green-600 dark:text-green-400' }
  if (score < 0.6) return { label: 'Medium Risk', color: 'text-yellow-600 dark:text-yellow-400' }
  return { label: 'High Risk', color: 'text-red-600 dark:text-red-400' }
}

export function truncateAccount(account: string): string {
  return account.slice(0, 4) + '••••' + account.slice(-2)
}
