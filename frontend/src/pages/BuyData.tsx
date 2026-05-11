import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Zap, ArrowLeft, Wifi, CheckCircle2, AlertTriangle, Moon, Sun,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { WalletState } from '@/hooks/useWallet'
import { formatNaira } from '@/lib/utils'

interface BuyDataProps {
  wallet: WalletState
  onBalanceUpdate: (n: number) => void
  darkMode: boolean
  toggleDark: () => void
}

const NETWORKS = [
  { id: 'mtn',     name: 'MTN',     color: 'bg-yellow-400', text: 'text-black'  },
  { id: 'airtel',  name: 'Airtel',  color: 'bg-red-600',    text: 'text-white'  },
  { id: 'glo',     name: 'Glo',     color: 'bg-green-600',  text: 'text-white'  },
  { id: 'mobile9', name: '9mobile', color: 'bg-emerald-500',text: 'text-white'  },
]

interface DataBundle {
  id: string
  label: string     // "500MB", "1GB", etc.
  price: number
  validity: string
}

const BUNDLES: Record<string, DataBundle[]> = {
  mtn: [
    { id: 'mtn-50mb',   label: '50MB',  price:   100, validity: '1 day'    },
    { id: 'mtn-200mb',  label: '200MB', price:   200, validity: '3 days'   },
    { id: 'mtn-500mb',  label: '500MB', price:   350, validity: '7 days'   },
    { id: 'mtn-1gb',    label: '1GB',   price:   500, validity: '30 days'  },
    { id: 'mtn-2gb',    label: '2GB',   price: 1_000, validity: '30 days'  },
    { id: 'mtn-5gb',    label: '5GB',   price: 2_000, validity: '30 days'  },
    { id: 'mtn-10gb',   label: '10GB',  price: 3_000, validity: '30 days'  },
    { id: 'mtn-20gb',   label: '20GB',  price: 5_000, validity: '30 days'  },
  ],
  airtel: [
    { id: 'airt-100mb', label: '100MB', price:   100, validity: '1 day'    },
    { id: 'airt-500mb', label: '500MB', price:   300, validity: '7 days'   },
    { id: 'airt-1gb',   label: '1GB',   price:   500, validity: '30 days'  },
    { id: 'airt-2gb',   label: '2GB',   price: 1_000, validity: '30 days'  },
    { id: 'airt-5gb',   label: '5GB',   price: 1_500, validity: '30 days'  },
    { id: 'airt-10gb',  label: '10GB',  price: 2_500, validity: '30 days'  },
  ],
  glo: [
    { id: 'glo-200mb',  label: '200MB', price:   100, validity: '3 days'   },
    { id: 'glo-1gb',    label: '1GB',   price:   500, validity: '30 days'  },
    { id: 'glo-2gb',    label: '2GB',   price:   800, validity: '30 days'  },
    { id: 'glo-5gb',    label: '5GB',   price: 1_500, validity: '30 days'  },
    { id: 'glo-10gb',   label: '10GB',  price: 2_500, validity: '30 days'  },
  ],
  mobile9: [
    { id: '9mo-100mb',  label: '100MB', price:   100, validity: '1 day'    },
    { id: '9mo-1gb',    label: '1GB',   price:   500, validity: '30 days'  },
    { id: '9mo-2gb',    label: '2GB',   price: 1_000, validity: '30 days'  },
    { id: '9mo-5gb',    label: '5GB',   price: 2_000, validity: '30 days'  },
  ],
}

type Phase = 'form' | 'processing' | 'success'

function generateRef() {
  return `AMO-DATA-${Date.now().toString(36).toUpperCase()}`
}

export default function BuyData({ wallet, onBalanceUpdate, darkMode, toggleDark }: BuyDataProps) {
  const navigate = useNavigate()
  const [network,  setNetwork]  = useState('')
  const [phone,    setPhone]    = useState('')
  const [bundleId, setBundleId] = useState('')
  const [error,    setError]    = useState('')
  const [phase,    setPhase]    = useState<Phase>('form')
  const [ref,      setRef]      = useState('')
  const [newBal,   setNewBal]   = useState(wallet.balance)

  const bundles  = network ? (BUNDLES[network] ?? []) : []
  const selected = bundles.find(b => b.id === bundleId)

  function validate(): string {
    if (!network)                          return 'Please select a network.'
    if (!/^\d{11}$/.test(phone.trim()))    return 'Enter a valid 11-digit phone number.'
    if (!bundleId || !selected)            return 'Please select a data bundle.'
    if (selected.price > wallet.balance)   return `Insufficient balance. You have ${formatNaira(wallet.balance)}.`
    return ''
  }

  async function handleBuy(e: React.FormEvent) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    setError('')
    setPhase('processing')
    await new Promise(r => setTimeout(r, 1_500))

    const updated = wallet.balance - selected!.price
    setNewBal(updated)
    setRef(generateRef())
    onBalanceUpdate(updated)
    setPhase('success')
  }

  function reset() {
    setNetwork(''); setPhone(''); setBundleId(''); setError(''); setPhase('form')
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
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Wifi className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Buy Data</h1>
            <p className="text-xs text-muted-foreground">Data bundles for all networks</p>
          </div>
        </div>

        <Badge variant="outline" className="border-orange-500/30 text-orange-600 dark:text-orange-400 mb-6">
          Balance: {formatNaira(wallet.balance)}
        </Badge>

        {/* ── Form ── */}
        {phase === 'form' && (
          <Card className="border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-lg">Data Bundle</CardTitle>
              <CardDescription>Choose your network, phone & bundle.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBuy} className="space-y-5">

                {/* Network */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Network</label>
                  <div className="grid grid-cols-4 gap-2">
                    {NETWORKS.map(n => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => { setNetwork(n.id); setBundleId(''); setError('') }}
                        className={`h-14 rounded-xl font-bold text-sm transition-all duration-150 border-2 ${
                          network === n.id
                            ? `${n.color} ${n.text} border-transparent shadow-lg scale-105`
                            : 'border-border bg-muted/40 hover:border-purple-400'
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
                    className="focus-visible:ring-purple-500 font-mono tracking-wide"
                  />
                </div>

                {/* Bundles */}
                {network && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Bundle</label>
                    <div className="grid grid-cols-2 gap-2">
                      {bundles.map(b => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => { setBundleId(b.id); setError('') }}
                          className={`p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                            bundleId === b.id
                              ? 'border-purple-500 bg-purple-500/10 shadow'
                              : 'border-border hover:border-purple-400 bg-muted/20'
                          }`}
                        >
                          <p className="font-bold text-sm">{b.label}</p>
                          <p className="text-[11px] text-muted-foreground">{b.validity}</p>
                          <p className={`text-sm font-semibold mt-1 ${bundleId === b.id ? 'text-purple-600 dark:text-purple-400' : 'text-orange-500'}`}>
                            {formatNaira(b.price)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />{error}
                  </div>
                )}

                {/* Summary */}
                {selected && (
                  <div className="rounded-xl bg-purple-500/5 border border-purple-500/20 p-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bundle</span>
                      <span className="font-semibold">{selected.label} · {selected.validity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost</span>
                      <span className="font-bold text-orange-500">{formatNaira(selected.price)}</span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!selected}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white h-12 text-base font-semibold disabled:opacity-50"
                >
                  Buy {selected ? `${selected.label} for ${formatNaira(selected.price)}` : 'Data'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ── Processing ── */}
        {phase === 'processing' && (
          <Card>
            <CardContent className="py-16 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Wifi className="w-8 h-8 text-purple-500 animate-pulse" />
              </div>
              <p className="font-semibold text-lg">Activating Bundle…</p>
              <p className="text-sm text-muted-foreground">Sending {selected?.label} to {phone}</p>
              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mt-2" />
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
                <h2 className="text-2xl font-bold mb-1">Data Activated!</h2>
                <p className="text-sm text-muted-foreground">Your bundle is live on {phone}.</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-5 space-y-3 text-sm">
                {[
                  ['Network',    NETWORKS.find(n => n.id === network)?.name ?? network],
                  ['Phone',      phone],
                  ['Bundle',     `${selected?.label} · ${selected?.validity}`],
                  ['Amount',     formatNaira(selected?.price ?? 0)],
                  ['Reference',  ref],
                  ['New Balance',formatNaira(newBal)],
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
