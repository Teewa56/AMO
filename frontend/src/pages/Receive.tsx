import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Zap, ArrowLeft, ArrowDownLeft, Copy, Check,
  Moon, Sun, Share2, Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { WalletState } from '@/hooks/useWallet'
import { formatNaira } from '@/lib/utils'

interface ReceiveProps {
  wallet: WalletState
  darkMode: boolean
  toggleDark: () => void
}

type CopiedKey = 'account' | 'name' | 'all' | null

export default function Receive({ wallet, darkMode, toggleDark }: ReceiveProps) {
  const navigate  = useNavigate()
  const [copied, setCopied] = useState<CopiedKey>(null)

  function copy(text: string, key: CopiedKey) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2_000)
  }

  const fullDetails =
    `Account Name: ${wallet.firstName} ${wallet.lastName}\n` +
    `Account Number: ${wallet.accountNumber}\n` +
    `Bank: ${wallet.bankName}`

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

      <main className="container mx-auto px-4 py-8 max-w-sm">
        <Button variant="ghost" className="gap-2 text-muted-foreground mb-4" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Receive Money</h1>
            <p className="text-xs text-muted-foreground">Share your account to receive funds</p>
          </div>
        </div>

        {/* ── Account card — looks like a bank card ── */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white shadow-2xl shadow-orange-500/30 mb-6">
          <div className="absolute top-0 right-0 w-52 h-52 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <CardContent className="p-6 relative z-10 space-y-6">
            {/* Icon + bank */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">AMO<span className="text-white/70">.</span></span>
              </div>
              <Badge className="bg-white/20 text-white border-0 text-[10px]">Virtual NGN</Badge>
            </div>

            {/* Account number — big and scannable */}
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">Account Number</p>
              <p className="font-mono text-3xl font-bold tracking-[0.2em]">{wallet.accountNumber}</p>
            </div>

            {/* Name + bank */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-widest mb-0.5">Account Name</p>
                <p className="font-semibold text-base">{wallet.firstName} {wallet.lastName}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-[10px] uppercase tracking-widest mb-0.5">Bank</p>
                <p className="font-semibold text-sm">{wallet.bankName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Copy details ── */}
        <div className="space-y-3 mb-6">
          {/* Account number row */}
          <div className="flex items-center justify-between bg-card border rounded-xl px-4 py-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Account Number</p>
              <p className="font-mono font-bold text-lg tracking-widest">{wallet.accountNumber}</p>
            </div>
            <button
              onClick={() => copy(wallet.accountNumber, 'account')}
              className="p-2.5 rounded-lg hover:bg-muted transition-colors"
              aria-label="Copy account number"
            >
              {copied === 'account'
                ? <Check className="w-4 h-4 text-green-500" />
                : <Copy className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>

          {/* Bank */}
          <div className="flex items-center justify-between bg-card border rounded-xl px-4 py-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Bank</p>
              <p className="font-semibold">{wallet.bankName}</p>
            </div>
          </div>

          {/* Account name row */}
          <div className="flex items-center justify-between bg-card border rounded-xl px-4 py-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Account Name</p>
              <p className="font-semibold">{wallet.firstName} {wallet.lastName}</p>
            </div>
            <button
              onClick={() => copy(`${wallet.firstName} ${wallet.lastName}`, 'name')}
              className="p-2.5 rounded-lg hover:bg-muted transition-colors"
              aria-label="Copy account name"
            >
              {copied === 'name'
                ? <Check className="w-4 h-4 text-green-500" />
                : <Copy className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        {/* ── CTA buttons ── */}
        <div className="space-y-3">
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 font-semibold"
            onClick={() => copy(fullDetails, 'all')}
          >
            {copied === 'all'
              ? <><Check className="w-4 h-4 mr-2" /> Copied!</>
              : <><Copy className="w-4 h-4 mr-2" /> Copy All Details</>}
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 border-green-500/40 hover:border-green-500 hover:bg-green-500/5"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'My AMO Account Details',
                  text:  fullDetails,
                }).catch(() => {})
              } else {
                copy(fullDetails, 'all')
              }
            }}
          >
            <Share2 className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
            Share Account Details
          </Button>

          <Button variant="ghost" className="w-full" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Balance hint */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5 text-orange-500" />
          Current balance: <span className="font-semibold text-foreground">{formatNaira(wallet.balance)}</span>
        </div>
      </main>
    </div>
  )
}
