import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap, ArrowLeft, Shield, CheckCircle2, AlertTriangle, Moon, Sun, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/api/client'
import type { WalletState } from '@/hooks/useWallet'
import { formatNaira } from '@/lib/utils'

const NIGERIAN_BANKS = [
  { nip: '044', name: 'Access Bank' },
  { nip: '063', name: 'Access Bank (Diamond)' },
  { nip: '050', name: 'Ecobank Nigeria' },
  { nip: '011', name: 'First Bank of Nigeria' },
  { nip: '214', name: 'First City Monument Bank' },
  { nip: '070', name: 'Fidelity Bank' },
  { nip: '058', name: 'Guaranty Trust Bank' },
  { nip: '030', name: 'Heritage Bank' },
  { nip: '301', name: 'Jaiz Bank' },
  { nip: '082', name: 'Keystone Bank' },
  { nip: '076', name: 'Polaris Bank' },
  { nip: '221', name: 'Stanbic IBTC Bank' },
  { nip: '068', name: 'Standard Chartered' },
  { nip: '232', name: 'Sterling Bank' },
  { nip: '032', name: 'Union Bank of Nigeria' },
  { nip: '033', name: 'United Bank for Africa' },
  { nip: '215', name: 'Unity Bank' },
  { nip: '035', name: 'Wema Bank' },
  { nip: '737', name: 'GTBank (737)' },
  { nip: '057', name: 'Zenith Bank' },
  { nip: '999992', name: 'OPay' },
  { nip: '999991', name: 'Palmpay' },
  { nip: '090405', name: 'Moniepoint' },
]

type ScanPhase = 'idle' | 'scanning' | 'approved' | 'blocked'

interface SendMoneyProps {
  wallet: WalletState
  onBalanceUpdate: (newBalance: number) => void
  darkMode: boolean
  toggleDark: () => void
}

export default function SendMoney({ wallet, onBalanceUpdate, darkMode, toggleDark }: SendMoneyProps) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ amount: '', accountNumber: '', bankNip: '', accountName: '', remark: '' })
  const [error, setError] = useState('')
  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle')
  const [result, setResult] = useState<{ balance: number; reference: string; riskScore: number; decision: string; explanation: string } | null>(null)
  const [step, setStep] = useState<'form' | 'result'>('form')

  function updateForm(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
  }

  function validate(): string {
    const amount = parseFloat(form.amount)
    if (!form.amount || isNaN(amount) || amount <= 0) return 'Enter a valid amount.'
    if (amount > wallet.balance) return `Insufficient balance. Your balance is ${formatNaira(wallet.balance)}.`
    if (!/^\d{10}$/.test(form.accountNumber)) return 'Account number must be exactly 10 digits.'
    if (!form.bankNip) return 'Please select a bank.'
    if (!form.accountName.trim() || form.accountName.trim().length < 2) return 'Enter the recipient\'s name.'
    return ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setScanPhase('scanning')
    setError('')

    try {
      const data = await api.sendMoney({
        amount: parseFloat(form.amount),
        sender_account: wallet.accountNumber,
        nip_code: form.bankNip,
        account_number: form.accountNumber,
        account_name: form.accountName.trim(),
        remark: form.remark.trim() || 'AMO Secure Transaction',
      })

      const metrics = data.metrics
      const isApproved = data.status === 'success' || metrics.decision === 'APPROVED'
      setScanPhase(isApproved ? 'approved' : 'blocked')
      setResult({
        balance: data.new_balance,
        reference: data.reference,
        riskScore: metrics.risk_score,
        decision: metrics.decision,
        explanation: metrics.explanation,
      })
      if (isApproved) {
        onBalanceUpdate(data.new_balance)
      }
      setStep('result')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transfer failed. Please try again.'
      if (msg.toLowerCase().includes('fraud') || msg.toLowerCase().includes('block')) {
        setScanPhase('blocked')
        setResult({ balance: wallet.balance, reference: '', riskScore: 0.95, decision: 'BLOCKED', explanation: msg })
        setStep('result')
      } else {
        setScanPhase('idle')
        setError(msg)
      }
    }
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
          <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-muted transition-colors">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" className="gap-2 text-muted-foreground mb-4" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Send Money</h1>
          <p className="text-muted-foreground mt-1">Transfer to any Nigerian bank account — AI-screened, Squad-powered.</p>
        </div>

        {/* Balance pill */}
        <div className="flex items-center gap-2 mb-6">
          <Badge variant="outline" className="border-orange-500/30 text-orange-600 dark:text-orange-400 px-3 py-1.5">
            Available: {formatNaira(wallet.balance)}
          </Badge>
          <Badge variant="outline" className="border-green-500/30 text-green-600 dark:text-green-400 px-3 py-1.5">
            <Shield className="w-3 h-3 mr-1 inline" /> AI Shield Active
          </Badge>
        </div>

        {step === 'form' ? (
          <Card className="border-orange-500/20">
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
              <CardDescription>Every transfer is scanned by our AI fraud engine before processing.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (₦)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₦</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => updateForm('amount', e.target.value)}
                      className="pl-8 focus-visible:ring-orange-500 text-lg font-semibold"
                    />
                  </div>
                  {form.amount && parseFloat(form.amount) > 0 && (
                    <p className="text-xs text-muted-foreground">= {formatNaira(parseFloat(form.amount))}</p>
                  )}
                </div>

                {/* Bank */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipient Bank</label>
                  <Select value={form.bankNip} onChange={(e) => updateForm('bankNip', e.target.value)} className="focus-visible:ring-orange-500">
                    <option value="">Select bank…</option>
                    {NIGERIAN_BANKS.map((b) => (
                      <option key={b.nip} value={b.nip}>{b.name}</option>
                    ))}
                  </Select>
                </div>

                {/* Account number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Number</label>
                  <Input
                    type="text"
                    placeholder="0000000000"
                    maxLength={10}
                    value={form.accountNumber}
                    onChange={(e) => updateForm('accountNumber', e.target.value.replace(/\D/g, ''))}
                    className="focus-visible:ring-orange-500 font-mono tracking-widest"
                  />
                </div>

                {/* Account name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Name</label>
                  <Input
                    placeholder="e.g. Chukwuemeka Eze"
                    value={form.accountName}
                    onChange={(e) => updateForm('accountName', e.target.value)}
                    className="focus-visible:ring-orange-500"
                  />
                </div>

                {/* Remark */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Remark <span className="text-muted-foreground">(optional)</span></label>
                  <Input
                    placeholder="Payment for services"
                    value={form.remark}
                    onChange={(e) => updateForm('remark', e.target.value)}
                    className="focus-visible:ring-orange-500"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{error}
                  </div>
                )}

                {/* AI scan status */}
                {scanPhase === 'scanning' && (
                  <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-orange-500 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">AI Fraud Shield Scanning…</p>
                        <p className="text-xs text-muted-foreground">Analyzing 7 risk modules in parallel</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {['Velocity check', 'Amount anomaly', 'Blacklist scan', 'Pattern matching'].map((m, i) => (
                        <div key={m} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-3 h-3 rounded-full border border-orange-500/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                          {m}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-base"
                  disabled={scanPhase === 'scanning'}
                >
                  {scanPhase === 'scanning' ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing Transfer…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send {form.amount ? formatNaira(parseFloat(form.amount) || 0) : 'Money'}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* ── Result card ── */
          <Card className={`border-2 ${result?.decision === 'BLOCKED' ? 'border-red-500/30' : 'border-green-500/30'}`}>
            <CardContent className="p-8 space-y-6">
              {/* Status icon */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${result?.decision === 'BLOCKED' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                {result?.decision === 'BLOCKED'
                  ? <AlertTriangle className="w-10 h-10 text-red-500" />
                  : <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                }
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  {result?.decision === 'BLOCKED' ? 'Transfer Blocked' : 'Transfer Approved'}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {result?.decision === 'BLOCKED'
                    ? 'Our AI Fraud Shield detected suspicious activity and blocked this transaction for your protection.'
                    : 'Your transfer was approved and is being processed via Squad.'}
                </p>
              </div>

              {/* Metrics */}
              <div className="rounded-xl bg-muted/50 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-bold">{formatNaira(parseFloat(form.amount))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Recipient</span>
                  <span className="font-semibold">{form.accountName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">AI Risk Score</span>
                  <span className={`font-bold ${result && result.riskScore >= 0.7 ? 'text-red-500' : result && result.riskScore >= 0.4 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {result ? `${(result.riskScore * 100).toFixed(1)}%` : '—'}
                  </span>
                </div>
                {result?.reference && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reference</span>
                    <span className="font-mono text-xs">{result.reference}</span>
                  </div>
                )}
                {result?.decision !== 'BLOCKED' && (
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-sm text-muted-foreground">New Balance</span>
                    <span className="font-bold text-lg text-orange-500">{result ? formatNaira(result.balance) : '—'}</span>
                  </div>
                )}
              </div>

              {/* AI explanation */}
              {result?.explanation && (
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">AI Shield Report</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{result.explanation}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { setStep('form'); setScanPhase('idle'); setForm({ amount: '', accountNumber: '', bankNip: '', accountName: '', remark: '' }); setResult(null) }}>
                  New Transfer
                </Button>
                <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
