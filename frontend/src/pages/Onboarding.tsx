import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Zap, ArrowRight, Shield, CreditCard,
  Eye, EyeOff, Moon, Sun, Copy, CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/api/client'
import type { WalletState } from '@/hooks/useWallet'

/* ── Demo credentials ── */
const DEMO_EMAIL    = 'demo@gmail.com'
const DEMO_PASSWORD = 'demo1@$'
const DEMO_NAME     = 'Demo User'

/** Fallback wallet used when the backend is offline */
const MOCK_WALLET: WalletState = {
  accountNumber : '0123456789',
  email         : DEMO_EMAIL,
  firstName     : 'Demo',
  lastName      : 'User',
  balance       : 150000,
  bankName      : 'Wema Bank',
}

interface OnboardingProps {
  onWalletCreated : (w: WalletState) => void
  darkMode        : boolean
  toggleDark      : () => void
}

export default function Onboarding({ onWalletCreated, darkMode, toggleDark }: OnboardingProps) {
  const navigate = useNavigate()

  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPass,     setShowPass]     = useState(false)
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [demoLoading,  setDemoLoading]  = useState(false)
  const [copied,       setCopied]       = useState<'email' | 'pass' | null>(null)

  /* ── helpers ── */
  function copy(text: string, key: 'email' | 'pass') {
    navigator.clipboard.writeText(text).catch(() => {/* noop */})
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  /** Tries the real API first; falls back to mock wallet if backend is down */
  async function loginWithDemo(): Promise<WalletState> {
    try {
      const data = await api.createWallet(DEMO_NAME, DEMO_EMAIL)
      return {
        accountNumber : data.account_number,
        email         : DEMO_EMAIL,
        firstName     : 'Demo',
        lastName      : 'User',
        balance       : data.starting_balance,
        bankName      : data.bank_name,
      }
    } catch {
      // Backend offline — use mock wallet so demo always works
      return MOCK_WALLET
    }
  }

  /* ── Sign In (form submit) ── */
  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }
    if (trimmedEmail !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError('Incorrect credentials. Use the demo account shown on the left.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const wallet = await loginWithDemo()
      onWalletCreated(wallet)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  /* ── Use Demo Account (one-click login) ── */
  async function handleDemoLogin() {
    setError('')
    setDemoLoading(true)
    // Fill the visible fields so the user sees what's happening
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    try {
      const wallet = await loginWithDemo()
      onWalletCreated(wallet)
      navigate('/dashboard')
    } finally {
      setDemoLoading(false)
    }
  }

  const busy = loading || demoLoading

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Navbar ── */}
      <header className="border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">AMO<span className="text-orange-500">.</span></span>
          </Link>
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">

          {/* ── Left: value prop + credentials card ── */}
          <div className="space-y-6">
            <Badge variant="outline" className="border-orange-500/50 text-orange-600 dark:text-orange-400">
              AI-Native Banking Demo
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Welcome back<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
                to AMO.
              </span>
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed">
              Sign in to access your Wema Bank virtual account with real-time
              AI fraud protection and Squad-powered transfers.
            </p>

            {/* Feature pills */}
            <div className="space-y-3">
              {[
                { icon: CreditCard, text: 'Real Wema Bank virtual account' },
                { icon: Shield,     text: 'AI Fraud Shield on every transfer' },
                { icon: Zap,        text: 'Squad-powered sub-3s payments' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>

            {/* Demo credentials hint */}
            <div className="rounded-xl border border-orange-500/25 bg-orange-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                  Demo Credentials
                </p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={busy}
                  className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline disabled:opacity-50"
                >
                  {demoLoading ? 'Signing in…' : 'One-click login →'}
                </button>
              </div>

              {/* Email row */}
              <div className="flex items-center justify-between bg-background rounded-lg px-3 py-2 border border-border">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Email</p>
                  <p className="text-sm font-mono font-medium select-all">{DEMO_EMAIL}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copy(DEMO_EMAIL, 'email')}
                  className="p-1.5 rounded hover:bg-muted transition-colors"
                  aria-label="Copy email"
                >
                  {copied === 'email'
                    ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>

              {/* Password row */}
              <div className="flex items-center justify-between bg-background rounded-lg px-3 py-2 border border-border">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Password</p>
                  <p className="text-sm font-mono font-medium select-all">{DEMO_PASSWORD}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copy(DEMO_PASSWORD, 'pass')}
                  className="p-1.5 rounded hover:bg-muted transition-colors"
                  aria-label="Copy password"
                >
                  {copied === 'pass'
                    ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>
            </div>
          </div>

          {/* ── Right: login card ── */}
          <Card className="border-orange-500/20 shadow-2xl shadow-orange-500/5">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Sign in</CardTitle>
              <CardDescription>Use the demo credentials to explore AMO.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4" noValidate>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="login-email">
                    Email address
                  </label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="demo@gmail.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError('') }}
                    className="focus-visible:ring-orange-500"
                    disabled={busy}
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="login-password">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError('') }}
                      className="focus-visible:ring-orange-500 pr-10"
                      disabled={busy}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2.5">
                    {error}
                  </div>
                )}

                {/* Sign In button */}
                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-base font-semibold shadow-lg shadow-orange-500/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign In <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                {/* Use Demo Account — one-click direct login */}
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={handleDemoLogin}
                  className="w-full border-orange-500/40 hover:border-orange-500 hover:bg-orange-500/5 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
                >
                  {demoLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-500 rounded-full animate-spin" />
                      Logging in…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      Use Demo Account
                    </span>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center pt-1">
                  Hackathon demo ·{' '}
                  <Link to="/" className="text-orange-500 hover:underline">
                    Back to landing page
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
