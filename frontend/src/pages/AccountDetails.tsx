import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Zap, ArrowLeft, User, Copy, Check,
  Moon, Sun, RefreshCw, CreditCard, Shield, Mail,
  Building2, Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/api/client'
import type { WalletState } from '@/hooks/useWallet'
import { formatNaira } from '@/lib/utils'

interface AccountDetailsProps {
  wallet: WalletState
  refreshBalance: () => Promise<void>
  darkMode: boolean
  toggleDark: () => void
}

type CopiedKey = string | null

export default function AccountDetails({ wallet, refreshBalance, darkMode, toggleDark }: AccountDetailsProps) {
  const navigate     = useNavigate()
  const [copied,     setCopied]     = useState<CopiedKey>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [liveBalance, setLiveBalance] = useState<number | null>(null)
  const [error,      setError]      = useState('')

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2_000)
  }

  async function handleRefresh() {
    setRefreshing(true)
    setError('')
    try {
      const data = await api.getBalance(wallet.accountNumber)
      setLiveBalance(data.balance)
      await refreshBalance()
    } catch {
      setError('Could not refresh balance. Backend may be offline.')
    } finally {
      setRefreshing(false)
    }
  }

  const displayBalance = liveBalance ?? wallet.balance

  const details = [
    { icon: User,      label: 'Account Name',   value: `${wallet.firstName} ${wallet.lastName}`, key: 'name'  },
    { icon: CreditCard,label: 'Account Number', value: wallet.accountNumber,                     key: 'acct'  },
    { icon: Building2, label: 'Bank',           value: wallet.bankName,                          key: 'bank'  },
    { icon: Mail,      label: 'Email Address',  value: wallet.email,                             key: 'email' },
    { icon: Wallet,    label: 'Account Type',   value: 'Virtual NGN Account',                   key: 'type'  },
    { icon: Shield,    label: 'AI Protection',  value: 'AMO Fraud Shield — Active',              key: 'ai'    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">AMO<span className="text-orange-500">.</span></span>
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing} aria-label="Refresh balance">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Toggle theme">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <Button variant="ghost" className="gap-2 text-muted-foreground mb-4" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <User className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Account Details</h1>
            <p className="text-xs text-muted-foreground">Your AMO wallet profile</p>
          </div>
        </div>

        {/* Balance hero */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white shadow-xl shadow-orange-500/25 mb-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <CardContent className="p-6 relative z-10">
            <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Available Balance</p>
            <p className="text-4xl font-bold tracking-tight mb-4">{formatNaira(displayBalance)}</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/80">
                {liveBalance !== null ? 'Just refreshed from server' : 'Tap ↻ to sync with server'}
              </span>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-4 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Details list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" /> Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            {details.map(({ icon: Icon, label, value, key }) => (
              <div key={key} className="flex items-center justify-between py-4 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                    <p className={`font-semibold text-sm truncate ${key === 'ai' ? 'text-green-600 dark:text-green-400' : ''}`}>
                      {key === 'acct'
                        ? <span className="font-mono tracking-widest">{value}</span>
                        : value}
                    </p>
                  </div>
                </div>
                {(key === 'acct' || key === 'name' || key === 'email') && (
                  <button
                    onClick={() => copy(value, key)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
                    aria-label={`Copy ${label}`}
                  >
                    {copied === key
                      ? <Check className="w-3.5 h-3.5 text-green-500" />
                      : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className="border-green-500/30 text-green-600 dark:text-green-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
            Account Active
          </Badge>
          <Badge variant="outline" className="border-orange-500/30 text-orange-600 dark:text-orange-400">
            <Shield className="w-3 h-3 mr-1" /> AI Shield On
          </Badge>
          <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400">
            Squad-Verified
          </Badge>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => navigate('/receive')} className="border-green-500/30 hover:border-green-500 hover:bg-green-500/5">
            Receive Money
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/send')}>
            Send Money
          </Button>
        </div>
      </main>
    </div>
  )
}
