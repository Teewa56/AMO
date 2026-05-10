import { Link } from 'react-router-dom'
import {
  Shield, Zap, CreditCard, BarChart3, Clock, Globe,
  ArrowRight, CheckCircle, Moon, Sun, Menu, X,
  Layout, Pointer,
} from 'lucide-react'
import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FeatureCard } from '@/components/ui/grid-feature-cards'
import { Gallery4 } from '@/components/blocks/gallery4'
import { Feature108 } from '@/components/blocks/feature108'
import { Features10 } from '@/components/blocks/features10'
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline'

interface LandingProps {
  darkMode: boolean
  toggleDark: () => void
}

/* ── Orbital timeline data ── */
const timelineData = [
  {
    id: 1, title: 'Sign Up', date: 'Step 01',
    content: 'Enter your name and email. AMO instantly provisions a real Wema Bank virtual account — no paperwork, no waiting.',
    category: 'Onboarding', icon: CheckCircle, relatedIds: [2],
    status: 'completed' as const, energy: 100,
  },
  {
    id: 2, title: 'Fund Wallet', date: 'Step 02',
    content: 'Start with ₦150,000 demo balance. In production, fund via bank transfer, USSD, or card — your account is always live.',
    category: 'Funding', icon: CreditCard, relatedIds: [1, 3],
    status: 'completed' as const, energy: 90,
  },
  {
    id: 3, title: 'Send Money', date: 'Step 03',
    content: 'Enter recipient account, bank, and amount. AMO initiates the transfer through Squad\'s NIP-compliant gateway.',
    category: 'Transfer', icon: ArrowRight, relatedIds: [2, 4],
    status: 'in-progress' as const, energy: 70,
  },
  {
    id: 4, title: 'AI Shield', date: 'Step 04',
    content: 'Our fraud engine runs 7 risk modules in parallel, scoring every transaction in 1.2 seconds. Scores ≥ 0.7 are blocked instantly.',
    category: 'Security', icon: Shield, relatedIds: [3, 5],
    status: 'in-progress' as const, energy: 50,
  },
  {
    id: 5, title: 'Track & Audit', date: 'Step 05',
    content: 'Full transaction ledger with risk scores, fraud decisions, and Squad references — complete audit trail at your fingertips.',
    category: 'Analytics', icon: BarChart3, relatedIds: [4],
    status: 'pending' as const, energy: 20,
  },
]

/* ── Gallery data ── */
const galleryItems = [
  {
    id: 'p2p',
    title: 'Peer-to-Peer Transfers',
    description: 'Send money to friends and family across any Nigerian bank account in seconds. No friction, just trust.',
    href: '#',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
  },
  {
    id: 'business',
    title: 'Business Payments',
    description: 'Pay suppliers, freelancers, and vendors with instant settlement and automated receipts.',
    href: '#',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
  },
  {
    id: 'fraud',
    title: 'AI Fraud Detection',
    description: 'Every transaction passes through our 7-module AI engine. Suspicious activity blocked in real time.',
    href: '#',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop',
  },
  {
    id: 'virtual',
    title: 'Virtual Accounts',
    description: 'Instantly provisioned Wema Bank virtual accounts — NUBAN-compliant, production-ready.',
    href: '#',
    image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800&h=600&fit=crop',
  },
  {
    id: 'analytics',
    title: 'Transaction Analytics',
    description: 'Deep transaction history with risk scores, fraud verdicts, and Squad references for full auditability.',
    href: '#',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
  },
]

/* ── Feature tabs ── */
const featureTabs = [
  {
    value: 'tab-1',
    icon: <Shield className="h-auto w-4 shrink-0" />,
    label: 'AI Security',
    content: {
      badge: 'Fraud Engine',
      title: 'Zero-tolerance fraud protection built in.',
      description: 'Our AI engine scores 7 risk signals — velocity, amount anomalies, blacklist checks, pattern matching, and more — every single transaction, every single time. Scores ≥ 0.7 are hard-blocked.',
      buttonText: 'See Security Docs',
      imageSrc: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&h=500&fit=crop',
      imageAlt: 'Security visualization',
    },
  },
  {
    value: 'tab-2',
    icon: <Pointer className="h-auto w-4 shrink-0" />,
    label: 'Instant Transfers',
    content: {
      badge: 'Squad Gateway',
      title: 'Money moves in seconds, not hours.',
      description: 'AMO integrates Squad\'s production-grade NIP payout API for sub-3-second bank transfers across all 25+ Nigerian banks. Full NUBAN compliance, real-time status, and reference tracking.',
      buttonText: 'See Transfer Docs',
      imageSrc: 'https://images.unsplash.com/photo-1634733988138-bf2c3a2a13fa?w=700&h=500&fit=crop',
      imageAlt: 'Transfer speed',
    },
  },
  {
    value: 'tab-3',
    icon: <Layout className="h-auto w-4 shrink-0" />,
    label: 'Full Visibility',
    content: {
      badge: 'Audit Trail',
      title: 'Complete transparency on every naira.',
      description: 'Every transaction carries a fraud risk score, AI decision, Squad reference, and timestamp. Your dashboard shows the last 20 transactions with full audit metadata — no black boxes.',
      buttonText: 'See Dashboard',
      imageSrc: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&h=500&fit=crop',
      imageAlt: 'Analytics dashboard',
    },
  },
]

/* ── Features grid data ── */
const features = [
  { title: 'AI Fraud Shield', icon: Shield as React.FC<React.SVGProps<SVGSVGElement>>, description: '7-module ML engine scores every transaction in 1.2s. Risk ≥ 0.7 blocked automatically.' },
  { title: 'Instant Transfers', icon: Zap as React.FC<React.SVGProps<SVGSVGElement>>, description: 'Squad-powered NIP payouts to all 25+ Nigerian banks. Settles in under 3 seconds.' },
  { title: 'Virtual Accounts', icon: CreditCard as React.FC<React.SVGProps<SVGSVGElement>>, description: 'Dedicated Wema Bank NUBAN accounts provisioned in milliseconds via Squad API.' },
  { title: 'Live Balance', icon: BarChart3 as React.FC<React.SVGProps<SVGSVGElement>>, description: 'Real-time balance sync after every transaction. Always accurate, always current.' },
  { title: 'Smart History', icon: Clock as React.FC<React.SVGProps<SVGSVGElement>>, description: 'Last 20 transactions with risk scores, AI decisions, and full Squad references.' },
  { title: 'Built for Nigeria', icon: Globe as React.FC<React.SVGProps<SVGSVGElement>>, description: 'NGN-native, NIP-compliant. Squad sandbox + production. Zero infrastructure overhead.' },
]

/* ── Animated container ── */
type AnimProps = { delay?: number; className?: string; children: React.ReactNode }
function Anim({ className, delay = 0.1, children }: AnimProps) {
  const reduce = useReducedMotion()
  if (reduce) return <>{children}</>
  return (
    <motion.div initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }} whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay, duration: 0.8 }} className={className}>
      {children}
    </motion.div>
  )
}

export default function Landing({ darkMode, toggleDark }: LandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">AMO<span className="text-orange-500">.</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#how-it-works" className="text-muted-foreground hover:text-orange-500 transition-colors">How it works</a>
            <a href="#features" className="text-muted-foreground hover:text-orange-500 transition-colors">Features</a>
            <a href="#security" className="text-muted-foreground hover:text-orange-500 transition-colors">Security</a>
            <a href="#use-cases" className="text-muted-foreground hover:text-orange-500 transition-colors">Use Cases</a>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Toggle theme">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/app" className="hidden md:block">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" size="sm">
                Launch App <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-6 flex flex-col gap-4">
            <a href="#how-it-works" className="text-muted-foreground hover:text-orange-500">How it works</a>
            <a href="#features" className="text-muted-foreground hover:text-orange-500">Features</a>
            <a href="#security" className="text-muted-foreground hover:text-orange-500">Security</a>
            <a href="#use-cases" className="text-muted-foreground hover:text-orange-500">Use Cases</a>
            <Link to="/app"><Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Launch App</Button></Link>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-32 px-6">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-400/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-6xl text-center">
          <Anim delay={0}>
            <Badge variant="outline" className="mb-6 border-orange-500/50 text-orange-600 dark:text-orange-400 px-4 py-1.5 text-sm">
              Hackathon 2024 · Built on Squad · AI-Native
            </Badge>
          </Anim>

          <Anim delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
              Banking Powered<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
                by Intelligence
              </span>
            </h1>
          </Anim>

          <Anim delay={0.2}>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              AMO is a next-generation Nigerian payment infrastructure with real-time AI fraud detection, Squad-powered virtual accounts, and sub-3-second bank transfers — all in one API.
            </p>
          </Anim>

          <Anim delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/app">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/30 px-8 h-12 text-base">
                  Open Your Account <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="border-orange-500/30 hover:border-orange-500 hover:text-orange-500 px-8 h-12 text-base">
                  See How It Works
                </Button>
              </a>
            </div>
          </Anim>

          {/* Stats row */}
          <Anim delay={0.5}>
            <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              {[
                { label: 'Fraud Shield', value: '1.2s' },
                { label: 'Transfer Speed', value: '<3s' },
                { label: 'Nigerian Banks', value: '25+' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-orange-500">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </Anim>
        </div>
      </section>

      {/* ── How it works (Orbital Timeline) ── */}
      <section id="how-it-works" className="relative">
        <div className="text-center pt-20 px-6">
          <Anim>
            <Badge variant="outline" className="border-orange-500/50 text-orange-600 dark:text-orange-400 mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Five steps to financial freedom</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Click any node to explore how AMO processes your money with intelligence and speed.</p>
          </Anim>
        </div>
        <RadialOrbitalTimeline timelineData={timelineData} />
      </section>

      {/* ── Features grid ── */}
      <section id="features" className="py-16 md:py-32">
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4">
          <Anim className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="border-orange-500/50 text-orange-600 dark:text-orange-400 mb-4">Features</Badge>
            <h2 className="text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl">
              Power. Speed. Control.
            </h2>
            <p className="text-muted-foreground mt-4 text-sm tracking-wide text-balance md:text-base">
              Everything you need to send, receive, and protect money in Nigeria.
            </p>
          </Anim>
          <Anim delay={0.4} className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed sm:grid-cols-2 md:grid-cols-3">
            {features.map((feature, i) => (
              <FeatureCard key={i} feature={feature} />
            ))}
          </Anim>
        </div>
      </section>

      {/* ── Feature 108 tabs ── */}
      <div id="security">
        <Feature108 tabs={featureTabs} />
      </div>

      {/* ── Features 10 (detailed cards) ── */}
      <Features10 />

      {/* ── Gallery (use cases) ── */}
      <div id="use-cases">
        <Gallery4
          title="Built for Real Nigerians"
          description="From peer transfers to business payments — AMO handles every use case with AI precision and Squad reliability."
          items={galleryItems}
        />
      </div>

      {/* ── CTA ── */}
      <section className="py-32 px-6 bg-gradient-to-br from-orange-500 to-amber-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <Anim>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to send money<br />the smart way?</h2>
            <p className="text-xl text-white/80 mb-10 max-w-lg mx-auto">
              Create your account in 10 seconds. No KYC needed for the demo. Start with ₦150,000.
            </p>
            <Link to="/app">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90 shadow-2xl px-10 h-14 text-lg font-semibold">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </Anim>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">AMO<span className="text-orange-500">.</span></span>
              </div>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                AI-native Nigerian payment infrastructure. Powered by Squad. Protected by intelligence.
              </p>
              <div className="mt-4 flex gap-2">
                <Badge variant="outline" className="text-xs">Hackathon 2024</Badge>
                <Badge variant="outline" className="text-xs">Squad API</Badge>
                <Badge variant="outline" className="text-xs">FastAPI</Badge>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-orange-500 transition-colors">Features</a></li>
                <li><a href="#security" className="hover:text-orange-500 transition-colors">Security</a></li>
                <li><a href="#use-cases" className="hover:text-orange-500 transition-colors">Use Cases</a></li>
                <li><Link to="/app" className="hover:text-orange-500 transition-colors">Launch App</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Stack</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>React + TypeScript</li>
                <li>FastAPI + SQLite</li>
                <li>Squad Payment API</li>
                <li>AI Fraud Engine</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 AMO SecurePay. Built for SQUADCO 3.0 Hackathon.</p>
            <p>Powered by <span className="text-orange-500 font-medium">Squad</span> · Protected by <span className="text-orange-500 font-medium">AI</span></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
