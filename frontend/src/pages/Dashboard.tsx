import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Zap, ArrowUpRight, Clock, RefreshCw, LogOut, Moon, Sun,
  Shield, TrendingUp, CreditCard, AlertTriangle, CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api, type Transaction } from '@/api/client'
import type { WalletState } from '@/hooks/useWallet'
import { formatNaira, formatDate, getRiskLabel } from '@/lib/utils'

interface DashboardProps {
  wallet: WalletState
  onLogout: () => void
  refreshBalance: () => Promise<void>
  darkMode: boolean
  toggleDark: () => void
}

export default function Dashboard({ wallet, onLogout, refreshBalance, darkMode, toggleDark }: DashboardProps) {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTx, setLoadingTx] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [wallet.accountNumber])

  async function loadTransactions() {
    try {
      setLoadingTx(true)
      const data = await api.getHistory(wallet.accountNumber)
      setTransactions(data.transactions)
    } catch { /* silent */ } finally {
      setLoadingTx(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    await refreshBalance()
    await loadTransactions()
    setRefreshing(false)
  }

  const totalSent = transactions.reduce((s, t) => s + t.amount, 0)
  const approved = transactions.filter(t => t.decision === 'APPROVED' || t.status === 'success').length
  const avgRisk = transactions.length ? transactions.reduce((s, t) => s + t.risk_score, 0) / transactions.length : 0

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

          <div className="flex items-center gap-2">
            <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-muted transition-colors">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-6xl space-y-8">
        {/* Welcome + Balance hero */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main balance card */}
          <Card className="md:col-span-2 relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white shadow-2xl shadow-orange-500/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <CardContent className="p-8 relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-white/70 text-sm font-medium mb-1">Total Balance</p>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{formatNaira(wallet.balance)}</h2>
                </div>
                <div className="flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-medium">Live</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-white/60 text-xs mb-1">Account Number</p>
                  <p className="font-mono font-semibold text-lg tracking-widest">{wallet.accountNumber}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Bank</p>
                  <p className="font-semibold">{wallet.bankName}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Account Holder</p>
                  <p className="font-semibold">{wallet.firstName} {wallet.lastName}</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Account Type</p>
                  <p className="font-semibold">Virtual NGN</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <div className="space-y-4">
            <Card className="hover:border-orange-500/50 transition-colors cursor-pointer group" onClick={() => navigate('/send')}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                  <ArrowUpRight className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-semibold">Send Money</p>
                  <p className="text-xs text-muted-foreground">Transfer to any bank</p>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:border-orange-500/50 transition-colors cursor-pointer group" onClick={() => navigate('/history')}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                  <Clock className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-semibold">History</p>
                  <p className="text-xs text-muted-foreground">View all transactions</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-6 flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-green-700 dark:text-green-400">AI Shield Active</p>
                  <p className="text-xs text-muted-foreground">Every transfer scanned in 1.2s</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Sent', value: formatNaira(totalSent), icon: TrendingUp, color: 'text-orange-500' },
            { label: 'Transactions', value: String(transactions.length), icon: CreditCard, color: 'text-blue-500' },
            { label: 'Approved', value: String(approved), icon: CheckCircle2, color: 'text-green-500' },
            { label: 'Avg Risk Score', value: `${(avgRisk * 100).toFixed(0)}%`, icon: Shield, color: 'text-purple-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-2xl font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your last {Math.min(5, transactions.length)} transfers with AI risk analysis</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-orange-500" onClick={() => navigate('/history')}>
              View All <ArrowUpRight className="ml-1 w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {loadingTx ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No transactions yet. Send your first payment!</p>
                <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white" size="sm" onClick={() => navigate('/send')}>
                  Send Money
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx) => {
                  const risk = getRiskLabel(tx.risk_score)
                  const isBlocked = tx.decision !== 'APPROVED' && tx.status !== 'success'
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isBlocked ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                          {isBlocked ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <ArrowUpRight className="w-5 h-5 text-orange-500" />}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{tx.recipient_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{tx.recipient_account}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className={`font-bold ${isBlocked ? 'text-red-500' : 'text-foreground'}`}>
                          -{formatNaira(tx.amount)}
                        </p>
                        <Badge variant={isBlocked ? 'destructive' : 'success'} className="text-xs">
                          {isBlocked ? 'BLOCKED' : 'APPROVED'}
                        </Badge>
                        <p className={`text-xs ${risk.color}`}>{risk.label} ({(tx.risk_score * 100).toFixed(0)}%)</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
