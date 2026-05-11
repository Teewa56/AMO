import { Link } from 'react-router-dom'
import {
  Shield, Zap, CreditCard, BarChart3, Clock, Globe,
  ArrowRight, CheckCircle, Moon, Sun, Menu, X,
  Layout, Pointer, Brain, Network, Eye, Cpu, Fingerprint,
  AlertTriangle, TrendingDown, Users, Building2,
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

/* ─────────────────────────────────────────────
   Orbital timeline — 5-step flow (from slide 7)
───────────────────────────────────────────── */
const timelineData = [
  {
    id: 1, title: 'Create Account', date: 'Step 01',
    content: 'Enter name and email. AOM instantly provisions a real GTBank virtual account via Squad API — no paperwork, no waiting, balance initialised.',
    category: 'Onboarding', icon: CreditCard, relatedIds: [2],
    status: 'completed' as const, energy: 100,
  },
  {
    id: 2, title: 'Initiate Transfer', date: 'Step 02',
    content: 'User fills recipient account, bank, amount, and remark. Frontend sends the payload to our FastAPI backend — transaction logged as PENDING.',
    category: 'Transfer', icon: ArrowRight, relatedIds: [1, 3],
    status: 'completed' as const, energy: 85,
  },
  {
    id: 3, title: 'AI Engine Fires', date: 'Step 03',
    content: '5 models run in parallel on the payload. Behavioral, graph, payload, SIM-swap, and KYC signals all scored simultaneously in ~150–190ms.',
    category: 'AI Analysis', icon: Brain, relatedIds: [2, 4],
    status: 'in-progress' as const, energy: 65,
  },
  {
    id: 4, title: 'Decision Rendered', date: 'Step 04',
    content: 'Ensemble scorer combines all 5 sub-scores. APPROVED → Squad transfer proceeds. BLOCKED → Squad dispute API freezes funds instantly.',
    category: 'Decision', icon: Shield, relatedIds: [3, 5],
    status: 'in-progress' as const, energy: 40,
  },
  {
    id: 5, title: 'Live Update', date: 'Step 05',
    content: 'Frontend receives real-time streamed updates. Every module result rendered as it completes. Watch fraud detection happen live — sub-200ms.',
    category: 'Streaming', icon: BarChart3, relatedIds: [4],
    status: 'pending' as const, energy: 20,
  },
]

/* ─────────────────────────────────────────────
   Gallery — real Nigerian fraud types (slide 2)
───────────────────────────────────────────── */
const galleryItems = [
  {
    id: 'sim-swap',
    title: 'SIM Swap Attacks',
    description: 'Criminals hijack phone numbers to bypass 2FA and drain accounts before victims notice. Our Temporal Graph model catches the session anomaly before the transfer leaves.',
    href: '#',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&h=600&fit=crop',
  },
  {
    id: 'synthetic-kyc',
    title: 'Synthetic KYC Fraud',
    description: 'AI-generated and forged documents pass standard checks. Our GAN-Autoencoder is trained specifically to detect deepfake and forged Nigerian identity documents.',
    href: '#',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop',
  },
  {
    id: 'mule-networks',
    title: 'Mule Account Networks',
    description: 'Stolen funds routed through chains of accounts. Our GraphSAGE model maps circular transaction rings and linked fraud networks in real time.',
    href: '#',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
  },
  {
    id: 'vendor-scam',
    title: 'Fake Vendor Scams',
    description: '"I\'ll send the money and they claim the item is suddenly out of stock but refuse to refund." — Trader, 25–34. Our remark analyser flags these narratives instantly.',
    href: '#',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop',
  },
  {
    id: 'social-engineering',
    title: 'Social Engineering',
    description: '"Falling victim to sophisticated social engineering scams and unauthorized account takeovers." — Student, 18–24. Velocity and behavioral models catch these patterns.',
    href: '#',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
  },
]

/* ─────────────────────────────────────────────
   Feature 108 tabs — Squad API integration (slide 6)
───────────────────────────────────────────── */
const featureTabs = [
  {
    value: 'tab-1',
    icon: <Shield className="h-auto w-4 shrink-0" />,
    label: 'AI Security',
    content: {
      badge: '5 Deep Learning Models',
      title: 'Goes beyond documents. Learns every day.',
      description: 'AOM scores every transaction across 5 parallel AI models — behavioural rhythms, graph networks, payload tampering, SIM-swap sequences, and deepfake KYC. Nigerian-specific. Trained on Aza fraud, BVN phishing, Instagram vendor scams, and SIM-swap sequences. Sub-200ms ONNX inference with Redis caching.',
      buttonText: 'See AI Architecture',
      imageSrc: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=700&h=500&fit=crop',
      imageAlt: 'AI fraud detection',
    },
  },
  {
    value: 'tab-2',
    icon: <Pointer className="h-auto w-4 shrink-0" />,
    label: 'Squad Core',
    content: {
      badge: 'Squad Is The Infrastructure',
      title: 'Remove Squad and the entire system stops.',
      description: 'Every user gets a Squad GTBank virtual account. Transfers only execute after the AI engine returns APPROVED. Squad webhooks feed every transaction back into all 5 models as new training signal. BLOCKED decisions hit Squad\'s dispute endpoint to freeze funds before settlement.',
      buttonText: 'See API Integration',
      imageSrc: 'https://images.unsplash.com/photo-1634733988138-bf2c3a2a13fa?w=700&h=500&fit=crop',
      imageAlt: 'Squad API integration',
    },
  },
  {
    value: 'tab-3',
    icon: <Layout className="h-auto w-4 shrink-0" />,
    label: 'Full Audit',
    content: {
      badge: 'SHAP Explainability',
      title: 'Every decision is interpretable.',
      description: 'All 5 models feed a weighted Ensemble Scorer with SHAP explainability — every fraud decision includes a human-readable explanation. Full audit trail for CBN compliance. Every transaction carries a risk score, AI verdict, Squad reference, and timestamp.',
      buttonText: 'See Dashboard',
      imageSrc: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&h=500&fit=crop',
      imageAlt: 'Audit dashboard',
    },
  },
]

/* ─────────────────────────────────────────────
   AI models grid (slide 5) — 5 models + Squad
───────────────────────────────────────────── */
const aiModels = [
  {
    title: 'Behavioral Transformer',
    icon: Brain as React.FC<React.SVGProps<SVGSVGElement>>,
    description: 'Spending rhythm anomalies, velocity spikes, unusual time-of-day patterns. Deep Learning.',
  },
  {
    title: 'GraphSAGE Network',
    icon: Network as React.FC<React.SVGProps<SVGSVGElement>>,
    description: 'Mule account clusters, circular transaction rings, linked fraud networks. Graph Neural Net.',
  },
  {
    title: 'CNN-GNN Hybrid',
    icon: Eye as React.FC<React.SVGProps<SVGSVGElement>>,
    description: 'API payload tampering, fund flow inconsistencies, injection attacks. Computer Vision + GNN.',
  },
  {
    title: 'Temporal Graph Conv.',
    icon: Clock as React.FC<React.SVGProps<SVGSVGElement>>,
    description: 'SIM swap signatures before transfer completes, session anomalies. Deep Learning.',
  },
  {
    title: 'GAN-Autoencoder',
    icon: Fingerprint as React.FC<React.SVGProps<SVGSVGElement>>,
    description: 'Forged and AI-generated KYC documents at onboarding. Generative Deep Learning.',
  },
  {
    title: 'Squad API — Core',
    icon: Zap as React.FC<React.SVGProps<SVGSVGElement>>,
    description: 'Virtual accounts, NIP payouts, webhooks, and dispute freeze — Squad is not bolted on. It is the infrastructure.',
  },
]

/* ── Animated wrapper ── */
type AnimProps = { delay?: number; className?: string; children: React.ReactNode }
function Anim({ className, delay = 0.1, children }: AnimProps) {
  const reduce = useReducedMotion()
  if (reduce) return <>{children}</>
  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ── Squad wordmark badge ── */
function SquadBadge({ className = '' }: { className?: string }) {
  return (
    <a
      href="https://squadco.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 group ${className}`}
    >
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Powered by</span>
      <span className="inline-flex items-center gap-1 bg-[#0B0B0B] dark:bg-white/90 text-white dark:text-[#0B0B0B] px-2.5 py-0.5 rounded-md text-xs font-black tracking-tight">
        squad
      </span>
    </a>
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
            <a href="#problem"     className="text-muted-foreground hover:text-orange-500 transition-colors">The Problem</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-orange-500 transition-colors">How It Works</a>
            <a href="#ai-models"   className="text-muted-foreground hover:text-orange-500 transition-colors">AI Models</a>
            <a href="#research"    className="text-muted-foreground hover:text-orange-500 transition-colors">Research</a>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Toggle theme">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link to="/dashboard" className="hidden md:block">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" size="sm">
                Launch Demo <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-6 flex flex-col gap-4">
            <a href="#problem"      className="text-muted-foreground hover:text-orange-500" onClick={() => setMobileMenuOpen(false)}>The Problem</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-orange-500" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#ai-models"    className="text-muted-foreground hover:text-orange-500" onClick={() => setMobileMenuOpen(false)}>AI Models</a>
            <a href="#research"     className="text-muted-foreground hover:text-orange-500" onClick={() => setMobileMenuOpen(false)}>Research</a>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Launch Demo</Button>
            </Link>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-32 px-6">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-orange-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-amber-400/8 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-5xl text-center">
          <Anim delay={0}>
            <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
              <Badge variant="outline" className="border-orange-500/50 text-orange-600 dark:text-orange-400 px-4 py-1.5 text-sm">
                Squad Hackathon 3.0 · Challenge 01
              </Badge>
              <SquadBadge />
            </div>
          </Anim>

          <Anim delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
              Real-Time AI Fraud<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">
                Intelligence Engine.
              </span>
            </h1>
          </Anim>

          <Anim delay={0.2}>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
              Every transaction passing through Squad is scored by 5 deep learning models
              in under <strong className="text-foreground">200ms</strong> — before a single kobo moves.
            </p>
            <p className="text-base text-muted-foreground max-w-xl mx-auto mb-10">
              Built by <span className="text-orange-500 font-semibold">The Debuggers</span> for Nigeria's ₦9.5B payment fraud crisis.
            </p>
          </Anim>

          <Anim delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/30 px-8 h-12 text-base">
                  Launch Demo <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button size="lg" variant="outline" className="border-orange-500/30 hover:border-orange-500 hover:text-orange-500 px-8 h-12 text-base">
                  See How It Works
                </Button>
              </a>
            </div>
          </Anim>

          {/* Key stats from pitch deck */}
          <Anim delay={0.5}>
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {[
                { value: '₦9.5B',  label: 'Fraud lost H1 2024',      color: 'text-red-500'    },
                { value: '<200ms', label: 'AI inference speed',       color: 'text-orange-500' },
                { value: '5',      label: 'Deep learning models',     color: 'text-orange-500' },
                { value: '96.9%',  label: 'Nigerians affected',       color: 'text-orange-500' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className={`text-3xl md:text-4xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </Anim>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section id="problem" className="py-20 px-6 bg-muted/30 border-y">
        <div className="container mx-auto max-w-5xl">
          <Anim className="text-center mb-12">
            <Badge variant="outline" className="border-red-500/50 text-red-600 dark:text-red-400 mb-4">01 · The Problem</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Nigeria Has a<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Fraud Crisis.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every day, legitimate Nigerians lose money to fraud that existing systems were never built to catch.
            </p>
          </Anim>

          {/* 4 stats from slide 2 */}
          <Anim delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { icon: TrendingDown, value: '₦9.5B', label: 'Lost to payment fraud in H1 2024 alone', color: 'text-red-500', bg: 'bg-red-500/10' },
                { icon: Users,        value: '33%',   label: 'Youth unemployment rate in Nigeria',     color: 'text-orange-500', bg: 'bg-orange-500/10' },
                { icon: Building2,    value: '40M+',  label: 'Informal businesses with no digital identity', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { icon: CreditCard,   value: '<5%',   label: 'Nigerians who have ever accessed formal credit', color: 'text-orange-500', bg: 'bg-orange-500/10' },
              ].map(({ icon: Icon, value, label, color, bg }) => (
                <div key={label} className="rounded-2xl border bg-card p-6 text-center">
                  <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className={`text-3xl font-black ${color} mb-1`}>{value}</div>
                  <p className="text-xs text-muted-foreground leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </Anim>

          {/* 3 fraud types from slide 2 */}
          <Anim delay={0.3}>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  title: 'SIM Swap Attacks',
                  desc: 'Criminals hijack phone numbers to bypass 2FA and drain accounts before victims notice.',
                },
                {
                  title: 'Synthetic KYC Fraud',
                  desc: 'AI-generated and forged documents pass standard verification checks, opening mule accounts.',
                },
                {
                  title: 'Mule Account Networks',
                  desc: 'Stolen funds routed through chains of accounts that rule-based systems cannot map.',
                },
              ].map(({ title, desc }) => (
                <div key={title} className="flex gap-4 p-5 rounded-2xl border bg-card">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm mb-1">{title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
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
            <Badge variant="outline" className="border-orange-500/50 text-orange-600 dark:text-orange-400 mb-4">06 · User Flow</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              From Transfer Initiation<br />to Decision — Live.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Click any node to explore how AOM processes your transaction with AI intelligence and Squad speed.
            </p>
          </Anim>
        </div>
        <RadialOrbitalTimeline timelineData={timelineData} />
      </section>

      {/* ── AI Models ── */}
      <section id="ai-models" className="py-16 md:py-28">
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4">
          <Anim className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="border-orange-500/50 text-orange-600 dark:text-orange-400 mb-4">04 · AI / Data Intelligence</Badge>
            <h2 className="text-3xl font-bold tracking-wide text-balance md:text-4xl lg:text-5xl">
              5 Deep Learning Models.<br />Running in Parallel.
            </h2>
            <p className="text-muted-foreground mt-4 text-sm tracking-wide text-balance md:text-base">
              All 5 models feed a weighted Ensemble Scorer with SHAP explainability — every decision is interpretable for CBN compliance and audit review.
            </p>
          </Anim>
          <Anim delay={0.3} className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed sm:grid-cols-2 md:grid-cols-3">
            {aiModels.map((feature, i) => (
              <FeatureCard key={i} feature={feature} />
            ))}
          </Anim>
        </div>
      </section>

      {/* ── Squad Integration tabs ── */}
      <div id="security">
        <Feature108 tabs={featureTabs} />
      </div>

      {/* ── Features10 (Squad API endpoints) ── */}
      <Features10 />

      {/* ── Research & Validation ── */}
      <section id="research" className="py-20 px-6 bg-muted/30 border-y">
        <div className="container mx-auto max-w-5xl">
          <Anim className="text-center mb-12">
            <Badge variant="outline" className="border-orange-500/50 text-orange-600 dark:text-orange-400 mb-4">07 · Research & Validation</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              64 Real Nigerians.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">Real Responses.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Primary survey · 64 responses · 8 Nigerian states · May 2026.
              We didn't assume the problem. We measured it.
            </p>
          </Anim>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Stats */}
            <Anim delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '96.9%', label: 'Experienced fraud or had a close call',           color: 'text-red-500'    },
                  { value: '95.3%', label: 'Want AI-powered transaction verification',        color: 'text-orange-500' },
                  { value: '2.3/5', label: 'Average trust score when sending to strangers',  color: 'text-amber-500'  },
                  { value: '₦200K+',label: 'Most common fraud amount lost per victim',       color: 'text-orange-500' },
                ].map(({ value, label, color }) => (
                  <div key={label} className="rounded-2xl border bg-card p-5">
                    <div className={`text-3xl font-black ${color} mb-1`}>{value}</div>
                    <p className="text-xs text-muted-foreground leading-snug">{label}</p>
                  </div>
                ))}
              </div>
            </Anim>

            {/* Quotes */}
            <Anim delay={0.3}>
              <div className="space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Voice of Nigeria — Direct Quotes</p>
                {[
                  { quote: '"Falling victim to sophisticated social engineering scams and unauthorized account takeovers"', who: 'Student, 18–24' },
                  { quote: '"I\'ll send the money and they will claim the item is suddenly out of stock but refuse to refund"', who: 'Trader, 25–34' },
                  { quote: '"The CAC certificate they showed me is fake"', who: 'Student, Ondo' },
                  { quote: '"Sending hard-earned money to a ghost who will stop picking my calls"', who: 'Trader, 35–44' },
                ].map(({ quote, who }) => (
                  <blockquote key={who} className="rounded-xl border-l-4 border-orange-500 bg-card pl-4 pr-4 py-3">
                    <p className="text-sm text-foreground italic leading-relaxed">{quote}</p>
                    <cite className="text-xs text-muted-foreground mt-1 block not-italic">— {who}</cite>
                  </blockquote>
                ))}
              </div>
            </Anim>
          </div>
        </div>
      </section>

      {/* ── Gallery (fraud types in depth) ── */}
      <div id="use-cases">
        <Gallery4
          title="Every Fraud Type. One Engine."
          description="AOM's 5 AI models are trained on Nigeria-specific fraud patterns — from SIM swap to synthetic KYC to mule account networks."
          items={galleryItems}
        />
      </div>

      {/* ── Business model ── */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <Anim className="text-center mb-12">
            <Badge variant="outline" className="border-orange-500/50 text-orange-600 dark:text-orange-400 mb-4">08 · Business Model</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Banks Pay Per API Call.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">We Score Every Transaction.</span>
            </h2>
          </Anim>
          <Anim delay={0.2}>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'API Per-Query Pricing',
                  price: '₦50–200',
                  unit: 'per transaction scored',
                  desc: 'GTCo, UBA, Access Bank, Moniepoint pay per transaction scored. No subscription risk — they pay only when they use it.',
                },
                {
                  title: 'Transaction Fee Share',
                  price: '0.5%',
                  unit: 'on every payment processed',
                  desc: 'After AI verification, we take 0.5% on every payment. Scales directly with transaction volume.',
                },
                {
                  title: 'Enterprise Licensing',
                  price: 'Custom',
                  unit: 'per institution',
                  desc: 'Full fraud intelligence suite licensed to fintechs and neobanks unable to build proprietary ML systems.',
                },
              ].map(({ title, price, unit, desc }) => (
                <div key={title} className="rounded-2xl border bg-card p-6 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
                  <div>
                    <span className="text-4xl font-black text-orange-500">{price}</span>
                    <span className="text-xs text-muted-foreground ml-2">{unit}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </Anim>
          <Anim delay={0.3}>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto text-center">
              {[
                { value: '50K',  label: 'Year 1 · Lagos & Ibadan' },
                { value: '500K', label: 'Year 2 · National' },
                { value: '5M+',  label: 'Year 3 · West Africa' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-2xl font-black text-orange-500">{value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
          </Anim>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-16 px-6 border-t">
        <div className="container mx-auto max-w-4xl text-center">
          <Anim>
            <Badge variant="outline" className="border-orange-500/50 text-orange-600 dark:text-orange-400 mb-4">09 · The Team</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">The Debuggers.</h2>
            <p className="text-muted-foreground mb-10">Three engineers. One mission. Zero tolerance for fraud.</p>
          </Anim>
          <Anim delay={0.2}>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  num: '01', role: 'Backend Engineer',
                  owns: 'FastAPI · PostgreSQL · Redis · Squad API · WebSocket streaming · System architecture',
                },
                {
                  num: '02', role: 'AI Engineer',
                  owns: 'TGT model · GraphSAGE · Transformer · GAN-Autoencoder · SHAP explainability · Model serving',
                },
                {
                  num: '03', role: 'Frontend Engineer',
                  owns: 'React dashboard · Real-time fraud visualization · Squad overlay UX · Transaction history · Mobile-responsive',
                },
              ].map(({ num, role, owns }) => (
                <div key={num} className="rounded-2xl border bg-card p-6 text-left">
                  <div className="text-3xl font-black text-orange-500/30 mb-3">{num}</div>
                  <p className="font-bold text-base mb-2">{role}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{owns}</p>
                </div>
              ))}
            </div>
          </Anim>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6 bg-gradient-to-br from-orange-500 to-amber-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <Anim>
            <p className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-4">Squad Hackathon 3.0 · Challenge 01 · Financial Services</p>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Nigeria loses ₦9.5B<br />every 6 months.
            </h2>
            <p className="text-xl text-white/80 mb-4 max-w-lg mx-auto leading-relaxed">
              We are not building another fintech app. We are building the fraud intelligence infrastructure that every Nigerian financial institution needs.
            </p>
            <p className="text-base text-white/60 mb-10">Built by Nigerians, for Nigeria.</p>
            <Link to="/dashboard">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90 shadow-2xl px-10 h-14 text-lg font-semibold">
                See the Live Demo <ArrowRight className="ml-2 w-5 h-5" />
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
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-4">
                Real-time AI fraud intelligence for Nigerian payment infrastructure. Powered by Squad. Built by The Debuggers.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Squad Hackathon 3.0</Badge>
                <Badge variant="outline" className="text-xs">Challenge 01</Badge>
                <Badge variant="outline" className="text-xs">FastAPI</Badge>
                <Badge variant="outline" className="text-xs">5 AI Models</Badge>
              </div>
              <SquadBadge className="mt-4" />
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#problem"       className="hover:text-orange-500 transition-colors">The Problem</a></li>
                <li><a href="#how-it-works"  className="hover:text-orange-500 transition-colors">How It Works</a></li>
                <li><a href="#ai-models"     className="hover:text-orange-500 transition-colors">AI Models</a></li>
                <li><a href="#research"      className="hover:text-orange-500 transition-colors">Research</a></li>
                <li><Link to="/dashboard"    className="hover:text-orange-500 transition-colors">Live Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Stack</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>React 19 + TypeScript</li>
                <li>FastAPI + SQLite</li>
                <li>Squad Payment API</li>
                <li>GTBank Virtual Accounts</li>
                <li>5 DL Fraud Models</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2026 AOM SecurePay · The Debuggers · Squad Hackathon 3.0</p>
            <p>Powered by <span className="text-orange-500 font-semibold">Squad</span> · GTBank Virtual Accounts · AI Fraud Shield</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
