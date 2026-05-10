import { useState, useCallback } from 'react'
import { api } from '@/api/client'

export interface WalletState {
  accountNumber: string
  email: string
  firstName: string
  lastName: string
  balance: number
  bankName: string
}

const STORAGE_KEY = 'amo_wallet'

function loadWallet(): WalletState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as WalletState) : null
  } catch {
    return null
  }
}

function saveWallet(w: WalletState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(w))
}

export function useWallet() {
  const [wallet, setWalletState] = useState<WalletState | null>(loadWallet)

  const setWallet = useCallback((w: WalletState) => {
    saveWallet(w)
    setWalletState(w)
  }, [])

  const clearWallet = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setWalletState(null)
  }, [])

  const refreshBalance = useCallback(async () => {
    if (!wallet) return
    try {
      const data = await api.getBalance(wallet.accountNumber)
      const updated = { ...wallet, balance: data.balance }
      saveWallet(updated)
      setWalletState(updated)
    } catch { /* silent */ }
  }, [wallet])

  return { wallet, setWallet, clearWallet, refreshBalance }
}
