import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import Landing from '@/pages/Landing'
import Dashboard from '@/pages/Dashboard'
import SendMoney from '@/pages/SendMoney'
import History from '@/pages/History'
import BuyAirtime from '@/pages/BuyAirtime'
import BuyData from '@/pages/BuyData'
import Receive from '@/pages/Receive'
import AccountDetails from '@/pages/AccountDetails'
import { useWallet } from '@/hooks/useWallet'
import { api } from '@/api/client'
import type { WalletState } from '@/hooks/useWallet'

const DEMO_WALLET: WalletState = {
  accountNumber: '0123456789',
  email:         'demo@gmail.com',
  firstName:     'Demo',
  lastName:      'User',
  balance:       150_000,
  bankName:      'GTBank',
}

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('amo_theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('amo_theme', dark ? 'dark' : 'light')
  }, [dark])

  return { dark, toggle: () => setDark(d => !d) }
}

export default function App() {
  const { dark, toggle } = useDarkMode()
  const { wallet, setWallet, refreshBalance } = useWallet()
  const [booting, setBooting] = useState(!wallet)

  /* ── Auto-init demo wallet on first load ── */
  useEffect(() => {
    if (wallet) { setBooting(false); return }
    api.createWallet('Demo User', 'demo@gmail.com')
      .then(data => {
        setWallet({
          accountNumber: data.account_number,
          email:         'demo@gmail.com',
          firstName:     'Demo',
          lastName:      'User',
          balance:       data.starting_balance,
          bankName:      data.bank_name,
        })
      })
      .catch(() => setWallet(DEMO_WALLET))   // backend offline → use mock
      .finally(() => setBooting(false))
  }, [])                                     // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Shared balance updater ── */
  function handleBalanceUpdate(newBalance: number) {
    if (wallet) setWallet({ ...wallet, balance: newBalance })
  }

  /* ── Boot splash ── */
  if (booting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/30 animate-pulse">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <p className="text-sm text-muted-foreground tracking-wide">Initialising your wallet…</p>
        </div>
      </div>
    )
  }

  /* Shared props every app page needs */
  const appProps = { darkMode: dark, toggleDark: toggle }

  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing landing */}
        <Route path="/" element={<Landing darkMode={dark} toggleDark={toggle} />} />

        {/* App shell — redirect /app to /dashboard */}
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <Dashboard
              wallet={wallet ?? DEMO_WALLET}
              refreshBalance={refreshBalance}
              {...appProps}
            />
          }
        />

        {/* Transfer */}
        <Route
          path="/send"
          element={
            <SendMoney
              wallet={wallet ?? DEMO_WALLET}
              onBalanceUpdate={handleBalanceUpdate}
              {...appProps}
            />
          }
        />

        {/* Buy Airtime */}
        <Route
          path="/airtime"
          element={
            <BuyAirtime
              wallet={wallet ?? DEMO_WALLET}
              onBalanceUpdate={handleBalanceUpdate}
              {...appProps}
            />
          }
        />

        {/* Buy Data */}
        <Route
          path="/data"
          element={
            <BuyData
              wallet={wallet ?? DEMO_WALLET}
              onBalanceUpdate={handleBalanceUpdate}
              {...appProps}
            />
          }
        />

        {/* Receive */}
        <Route
          path="/receive"
          element={
            <Receive
              wallet={wallet ?? DEMO_WALLET}
              {...appProps}
            />
          }
        />

        {/* Account Details */}
        <Route
          path="/account"
          element={
            <AccountDetails
              wallet={wallet ?? DEMO_WALLET}
              refreshBalance={refreshBalance}
              {...appProps}
            />
          }
        />

        {/* Transaction History */}
        <Route
          path="/history"
          element={
            <History
              wallet={wallet ?? DEMO_WALLET}
              {...appProps}
            />
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
