import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Zap, ArrowLeft, Phone, CheckCircle2, AlertTriangle, Moon, Sun,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { WalletState } from '@/hooks/useWallet'
import { formatNaira } from '@/lib/utils'

interface BuyAirtimeProps {
  wallet: WalletState
  onBalanceUpdate: (n: number) => void
  darkMode: boolean
  toggleDark: () => void
}

const NETWORKS = [
  { id: 'mtn',     name: 'MTN',      color: 'bg-yellow-400',   text: 'text-black'  },
  { id: 'airtel',  name: 'Airtel',   color: 'bg-red-600',      text: 'text-white'  },
  { id: 'glo',     name: 'Glo',      color: 'bg-green-600',    text: 'text-white'  },
  { id: 'mobile9', name: '9mobile',  color: 'bg-emerald-500',  text: 'text-white'  },
]

const PRESET_AMOUNTS = [100, 200, 500, 1_000, 2_000, 5_000]

type Phase = 'form' | 'processing' | 'success' | 'error'

function generateRef() {
  return `AMO-AIR-${Date.now().toString(36).toUpperCase()}`
}

export default function BuyAirtime({ wallet, onBalanceUpdate, darkMode, toggleDark }: BuyAirtimeProps) {
  const navigate = useNavigate()
  const [network,  setNetwork]  = useState('')
  const [phone,    setPhone]    = useState('')
  const [amount,   setAmount]   = useState('')
  const [error,    setError]    = useState('')
  const [phase,    setPhase]    = useState<Phase>('form')
  const [ref,      setRef]      = useState('')
  const [newBal,   setNewBal]   = useState(wallet.balance)

  function validate(): string {
    if (!network)                               return 'Please select a network.'
    if (!/^\d{11}$/.test(phone.trim()))         return 'Enter a valid 11-digit phone number.'
    const amt = parseFloat(amount)
    if (!amount || isNaN(amt) || amt < 50)      return 'Minimum airtime amount is ₦50.'
    if (amt > wallet.balance)                   return `Insufficient balance. You have ${formatNaira(wallet.balance)}.`
    return ''
  }

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    setError('')
    setPhase('processing')

    /* Simulate airtime vending (1.5 s) — real integration would call a VTU API */
    await new Promise(r => setTimeout(r, 1_500))

    const amt     = parseFloat(amount)
    const updated = wallet.balance - amt
    setNewBal(updated)
    setRef(generateRef())
    onBalanceUpdate(updated)
    setPhase('success')
  }

  function reset() {
    setNetwork(''); setPhone(''); setAmount(''); setError(''); setPhase('form')
  }

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
          <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Toggle theme">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <Button variant="ghost" className="gap-2 text-muted-foreground mb-4" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Phone className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Buy Airtime</h1>
            <p className="text-xs text-muted-foreground">Instant recharge for any network</p>
          </div>
        </div>

        <Badge variant="outline" className="border-orange-500/30 text-orange-600 dark:text-orange-400 mb-6">
          Balance: {formatNaira(wallet.balance)}
        </Badge>

        {/* ── Form ── */}
        {phase === 'form' && (
          <Card className="border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-lg">Recharge Details</CardTitle>
              <CardDescription>Select network, enter phone & amount.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBuy} className="space-y-5">

                {/* Network */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Network Provider</label>
                  <div className="grid grid-cols-4 gap-2">
                    {NETWORKS.map(n => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => { setNetwork(n.id); setError('') }}
                        className={`h-14 rounded-xl font-bold text-sm transition-all duration-150 border-2 ${
                          network === n.id
                            ? `${n.color} ${n.text} border-transparent shadow-lg scale-105`
                            : 'border-border bg-muted/40 hover:border-blue-400'
                        }`}
                      >
                        {n.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="08012345678"
                    maxLength={11}
                    value={phone}
                    onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError('') }}
                    className="focus-visible:ring-blue-500 font-mono tracking-wide"
                  />
                </div>

                {/* Preset amounts */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (₦)</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {PRESET_AMOUNTS.map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => { setAmount(String(a)); setError('') }}
                        className={`py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                          amount === String(a)
                            ? 'bg-blue-500 text-white border-blue-500 shadow'
                            : 'border-border hover:border-blue-400 bg-muted/30'
                        }`}
                      >
                        {formatNaira(a)}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₦</span>
                    <Input
                      type="number"
                      placeholder="Custom amount"
                      min={50}
                      value={amount}
                      onChange={e => { setAmount(e.target.value); setError('') }}
                      className="pl-8 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />{error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white h-12 text-base font-semibold"
                >
                  Buy Airtime {amount ? `— ${formatNaira(parseFloat(amount) || 0)}` : ''}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ── Processing ── */}
        {phase === 'processing' && (
          <Card>
            <CardContent className="py-16 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Phone className="w-8 h-8 text-blue-500 animate-pulse" />
              </div>
              <p className="font-semibold text-lg">Processing Recharge…</p>
              <p className="text-sm text-muted-foreground">Sending {formatNaira(parseFloat(amount))} to {phone}</p>
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mt-2" />
            </CardContent>
          </Card>
        )}

        {/* ── Success ── */}
        {phase === 'success' && (
          <Card className="border-green-500/30">
            <CardContent className="p-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-1">Recharge Successful!</h2>
                <p className="text-sm text-muted-foreground">Airtime has been sent to your phone.</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-5 space-y-3 text-sm">
                {[
                  ['Network',      NETWORKS.find(n => n.id === network)?.name ?? network],
                  ['Phone',        phone],
                  ['Amount',       formatNaira(parseFloat(amount))],
                  ['Reference',    ref],
                  ['New Balance',  formatNaira(newBal)],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{k}</span>
                    <span className={`font-semibold ${k === 'New Balance' ? 'text-orange-500 text-base' : ''}`}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={reset}>Buy Again</Button>
                <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/dashboard')}>Dashboard</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
