import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Zap, ArrowUpRight, ArrowDownLeft, Clock, RefreshCw,
  Moon, Sun, Shield, TrendingUp, CreditCard, CheckCircle2,
  AlertTriangle, Phone, Wifi, User, Copy, Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api, type Transaction } from '@/api/client'
import type { WalletState } from '@/hooks/useWallet'
import { formatNaira, formatDate, getRiskLabel } from '@/lib/utils'

interface DashboardProps {
  wallet: WalletState
  refreshBalance: () => Promise<void>
  darkMode: boolean
  toggleDark: () => void
}

const QUICK_ACTIONS = [
  { icon: ArrowUpRight,  label: 'Transfer',        sub: 'Send to any bank',    path: '/send',    accent: 'orange' },
  { icon: Phone,         label: 'Buy Airtime',      sub: 'Top up instantly',    path: '/airtime', accent: 'blue' },
  { icon: Wifi,          label: 'Buy Data',         sub: 'All networks',        path: '/data',    accent: 'purple' },
  { icon: ArrowDownLeft, label: 'Receive',          sub: 'Share your details',  path: '/receive', accent: 'green' },
  { icon: User,          label: 'Account Details',  sub: 'View your profile',   path: '/account', accent: 'amber' },
  { icon: Clock,         label: 'Transactions',     sub: 'Full history',        path: '/history', accent: 'rose' },
] as const

const ACCENT_CLASSES = {
  orange: { bg: 'bg-orange-500/10',  hover: 'group-hover:bg-orange-500',  icon: 'text-orange-500',  hoverIcon: 'group-hover:text-white' },
  blue:   { bg: 'bg-blue-500/10',    hover: 'group-hover:bg-blue-500',    icon: 'text-blue-500',    hoverIcon: 'group-hover:text-white' },
  purple: { bg: 'bg-purple-500/10',  hover: 'group-hover:bg-purple-500',  icon: 'text-purple-500',  hoverIcon: 'group-hover:text-white' },
  green:  { bg: 'bg-green-500/10',   hover: 'group-hover:bg-green-500',   icon: 'text-green-500',   hoverIcon: 'group-hover:text-white' },
  amber:  { bg: 'bg-amber-500/10',   hover: 'group-hover:bg-amber-500',   icon: 'text-amber-500',   hoverIcon: 'group-hover:text-white' },
  rose:   { bg: 'bg-rose-500/10',    hover: 'group-hover:bg-rose-500',    icon: 'text-rose-500',    hoverIcon: 'group-hover:text-white' },
}

export default function Dashboard({ wallet, refreshBalance, darkMode, toggleDark }: DashboardProps) {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTx, setLoadingTx]       = useState(true)
  const [refreshing, setRefreshing]     = useState(false)
  const [copied, setCopied]             = useState(false)

  useEffect(() => { loadTransactions() }, [wallet.accountNumber])

  async function loadTransactions() {
    try {
      setLoadingTx(true)
      const data = await api.getHistory(wallet.accountNumber)
      setTransactions(data.transactions)
    } catch { /* silent — backend may be offline */ }
    finally { setLoadingTx(false) }
  }

  async function handleRefresh() {
    setRefreshing(true)
    await refreshBalance()
    await loadTransactions()
    setRefreshing(false)
  }

  function copyAccount() {
    navigator.clipboard.writeText(wallet.accountNumber).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const totalSent  = transactions.reduce((s, t) => s + t.amount, 0)
  const approved   = transactions.filter(t => t.decision === 'APPROVED' || t.status === 'success').length
  const avgRisk    = transactions.length
    ? transactions.reduce((s, t) => s + t.risk_score, 0) / transactions.length
    : 0

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">AMO<span className="text-orange-500">.</span></span>
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing} aria-label="Refresh">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Toggle theme">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">

        {/* ── Balance card ── */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white shadow-2xl shadow-orange-500/25">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <CardContent className="p-7 relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/70 text-xs font-medium mb-0.5 uppercase tracking-wide">Available Balance</p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{formatNaira(wallet.balance)}</h2>
              </div>
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium">Live</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-wide mb-0.5">Account Number</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono font-semibold tracking-widest">{wallet.accountNumber}</p>
                  <button onClick={copyAccount} className="p-1 rounded hover:bg-white/10 transition-colors" aria-label="Copy account number">
                    {copied
                      ? <Check className="w-3.5 h-3.5 text-green-400" />
                      : <Copy className="w-3.5 h-3.5 text-white/60 hover:text-white" />}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-wide mb-0.5">Bank</p>
                <p className="font-semibold text-sm">{wallet.bankName}</p>
              </div>
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-wide mb-0.5">Account Name</p>
                <p className="font-semibold text-sm">{wallet.firstName} {wallet.lastName}</p>
              </div>
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-wide mb-0.5">Account Type</p>
                <p className="font-semibold text-sm">Virtual NGN</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Quick actions ── */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map(({ icon: Icon, label, sub, path, accent }) => {
              const cls = ACCENT_CLASSES[accent]
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="group flex flex-col items-center gap-2 p-4 rounded-2xl border border-border hover:border-transparent hover:shadow-lg transition-all duration-200 bg-card hover:bg-card text-center"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 ${cls.bg} ${cls.hover}`}>
                    <Icon className={`w-5 h-5 transition-colors duration-200 ${cls.icon} ${cls.hoverIcon}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-tight">{label}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight hidden sm:block">{sub}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Sent',    value: formatNaira(totalSent),                      Icon: TrendingUp,  color: 'text-orange-500' },
            { label: 'Transactions',  value: String(transactions.length),                 Icon: CreditCard,  color: 'text-blue-500'   },
            { label: 'Approved',      value: String(approved),                            Icon: CheckCircle2,color: 'text-green-500'  },
            { label: 'Avg Risk',      value: `${(avgRisk * 100).toFixed(0)}%`,            Icon: Shield,      color: 'text-purple-500' },
          ].map(({ label, value, Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
                <Icon className={`w-5 h-5 ${color} opacity-70`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Recent transactions ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recent Transactions</CardTitle>
              <CardDescription className="text-xs">
                {transactions.length > 0
                  ? `Last ${Math.min(5, transactions.length)} transfers with AI risk analysis`
                  : 'Your transfers will appear here'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-orange-500 text-xs" onClick={() => navigate('/history')}>
              View All <ArrowUpRight className="ml-1 w-3 h-3" />
            </Button>
          </CardHeader>

          <CardContent>
            {loadingTx ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-25" />
                <p className="text-sm font-medium mb-1">No transactions yet</p>
                <p className="text-xs mb-4">Make your first transfer to see it here.</p>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/send')}>
                  Send Money
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 5).map((tx) => {
                  const risk      = getRiskLabel(tx.risk_score)
                  const isBlocked = tx.decision === 'BLOCKED'
                  return (
                    <div key={tx.id} className="flex items-center gap-4 p-3.5 rounded-xl border hover:bg-muted/40 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isBlocked ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                        {isBlocked
                          ? <AlertTriangle className="w-5 h-5 text-red-500" />
                          : <ArrowUpRight className="w-5 h-5 text-orange-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{tx.recipient_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{tx.recipient_account}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-bold text-sm ${isBlocked ? 'text-red-500' : ''}`}>-{formatNaira(tx.amount)}</p>
                        <Badge variant={isBlocked ? 'destructive' : 'success'} className="text-[10px] mt-0.5">
                          {tx.decision}
                        </Badge>
                        <p className={`text-[10px] mt-0.5 ${risk.color}`}>{risk.label}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Powered-by strip */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-3 border rounded-2xl bg-card px-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            <span>AI Fraud Shield active on every transaction</span>
          </div>
          <span className="hidden sm:inline text-border">·</span>
          {/* Squad logo badge */}
          <a
            href="https://squadco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 group"
            aria-label="Powered by Squad"
          >
            <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">Powered by</span>
            <span className="inline-flex items-center gap-1 bg-[#0B0B0B] dark:bg-white text-white dark:text-[#0B0B0B] px-2.5 py-1 rounded-md text-xs font-black tracking-tight group-hover:opacity-80 transition-opacity">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="shrink-0">
                <rect width="10" height="10" rx="2"/>
              </svg>
              squad
            </span>
          </a>
          <span className="hidden sm:inline text-border">·</span>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Guaranty_Trust_Bank_logo.svg/200px-Guaranty_Trust_Bank_logo.svg.png"
              alt="GTBank"
              className="h-4 w-auto object-contain opacity-70"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span>GTBank virtual accounts</span>
          </div>
        </div>

      </main>
    </div>
  )
}
