import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from '@/pages/Landing'
import Onboarding from '@/pages/Onboarding'
import Dashboard from '@/pages/Dashboard'
import SendMoney from '@/pages/SendMoney'
import History from '@/pages/History'
import { useWallet } from '@/hooks/useWallet'

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('amo_theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('amo_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('amo_theme', 'light')
    }
  }, [dark])

  return { dark, toggle: () => setDark(d => !d) }
}

export default function App() {
  const { dark, toggle } = useDarkMode()
  const { wallet, setWallet, clearWallet, refreshBalance } = useWallet()

  /* /app route: go to dashboard if wallet exists, else onboarding */
  function AppEntry() {
    if (wallet) return <Navigate to="/dashboard" replace />
    return (
      <Onboarding
        onWalletCreated={setWallet}
        darkMode={dark}
        toggleDark={toggle}
      />
    )
  }

  /* Guard for authenticated routes */
  function RequireWallet({ children }: { children: React.ReactNode }) {
    if (!wallet) return <Navigate to="/app" replace />
    return <>{children}</>
  }

  function handleBalanceUpdate(newBalance: number) {
    if (wallet) setWallet({ ...wallet, balance: newBalance })
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing darkMode={dark} toggleDark={toggle} />} />
        <Route path="/app" element={<AppEntry />} />
        <Route
          path="/dashboard"
          element={
            <RequireWallet>
              <Dashboard
                wallet={wallet!}
                onLogout={clearWallet}
                refreshBalance={refreshBalance}
                darkMode={dark}
                toggleDark={toggle}
              />
            </RequireWallet>
          }
        />
        <Route
          path="/send"
          element={
            <RequireWallet>
              <SendMoney
                wallet={wallet!}
                onBalanceUpdate={handleBalanceUpdate}
                darkMode={dark}
                toggleDark={toggle}
              />
            </RequireWallet>
          }
        />
        <Route
          path="/history"
          element={
            <RequireWallet>
              <History
                wallet={wallet!}
                darkMode={dark}
                toggleDark={toggle}
              />
            </RequireWallet>
          }
        />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
