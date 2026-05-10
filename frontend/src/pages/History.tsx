import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, ArrowLeft, ArrowUpRight, AlertTriangle, Shield, Download, Moon, Sun, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api, type Transaction } from '@/api/client'
import type { WalletState } from '@/hooks/useWallet'
import { formatNaira, formatDate, getRiskLabel } from '@/lib/utils'

interface HistoryProps {
  wallet: WalletState
  darkMode: boolean
  toggleDark: () => void
}

export default function History({ wallet, darkMode, toggleDark }: HistoryProps) {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.getHistory(wallet.accountNumber)
      .then((data) => setTransactions(data.transactions))
      .catch(() => {/* silent */})
      .finally(() => setLoading(false))
  }, [wallet.accountNumber])

  const filtered = transactions.filter((tx) =>
    tx.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
    tx.recipient_account.includes(search) ||
    tx.reference.toLowerCase().includes(search.toLowerCase()) ||
    tx.remark.toLowerCase().includes(search.toLowerCase())
  )

  const totalSent = transactions.reduce((s, t) => s + t.amount, 0)
  const approved = transactions.filter(t => t.decision === 'APPROVED').length
  const blocked = transactions.filter(t => t.decision !== 'APPROVED').length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">AMO<span className="text-orange-500">.</span></span>
          </Link>
          <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-muted transition-colors">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" className="gap-2 text-muted-foreground mb-4" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground mt-1">Full audit trail with AI risk scores · Last {transactions.length} transactions</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-5 text-center">
              <p className="text-2xl font-bold text-orange-500">{formatNaira(totalSent)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{approved}</p>
              <p className="text-xs text-muted-foreground mt-1">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 text-center">
              <p className="text-2xl font-bold text-red-500">{blocked}</p>
              <p className="text-xs text-muted-foreground mt-1">Blocked by AI</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, account, or reference…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 focus-visible:ring-orange-500"
          />
        </div>

        {/* Transactions list */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>{filtered.length} of {transactions.length} transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2 border-orange-500/30 hover:border-orange-500" onClick={() => alert('Export coming soon!')}>
              <Download className="w-4 h-4" /> Export
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{search ? 'No results match your search.' : 'No transactions yet.'}</p>
                {!search && (
                  <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white" size="sm" onClick={() => navigate('/send')}>
                    Send Your First Payment
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((tx) => {
                  const risk = getRiskLabel(tx.risk_score)
                  const isBlocked = tx.decision !== 'APPROVED' && tx.status !== 'success'
                  return (
                    <div key={tx.id} className="rounded-xl border p-5 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isBlocked ? 'bg-red-100 dark:bg-red-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                            {isBlocked ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <ArrowUpRight className="w-5 h-5 text-orange-500" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold">{tx.recipient_name}</p>
                              <Badge variant={isBlocked ? 'destructive' : 'success'} className="text-xs">
                                {isBlocked ? 'BLOCKED' : 'APPROVED'}
                              </Badge>
                            </div>
                            <p className="text-sm font-mono text-muted-foreground">{tx.recipient_account}</p>
                            <p className="text-xs text-muted-foreground mt-1">{formatDate(tx.created_at)}</p>
                            {tx.remark && <p className="text-xs text-muted-foreground italic mt-0.5">"{tx.remark}"</p>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-xl font-bold ${isBlocked ? 'text-red-500' : 'text-foreground'}`}>
                            -{formatNaira(tx.amount)}
                          </p>
                          <p className={`text-xs font-medium ${risk.color}`}>{risk.label}</p>
                        </div>
                      </div>

                      {/* AI metrics bar */}
                      <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Risk Score
                          </p>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${tx.risk_score >= 0.7 ? 'bg-red-500' : tx.risk_score >= 0.4 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${tx.risk_score * 100}%` }}
                            />
                          </div>
                          <p className={`text-xs font-mono mt-0.5 ${risk.color}`}>{(tx.risk_score * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Decision</p>
                          <p className={`text-xs font-semibold ${isBlocked ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                            {tx.decision}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-xs text-muted-foreground mb-1">Reference</p>
                          <p className="text-xs font-mono truncate">{tx.reference || '—'}</p>
                        </div>
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
