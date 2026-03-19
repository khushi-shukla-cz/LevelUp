// packages/client/src/pages/LandingPage.jsx
import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  Zap, Code2, Globe, Trophy, GitBranch, BarChart3,
  ChevronRight, ArrowRight, Star, CheckCircle2, Play, Shield
} from 'lucide-react'

// ── Animation helpers ──────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] } })
}

const FadeUp = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} custom={delay} className={className}>
      {children}
    </motion.div>
  )
}

// ── Animated grid background ───────────────────────────────────────────────────
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute inset-0 bg-hero-glow" />
      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.08) 0%, transparent 70%)' }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

// ── Code snippet animation ─────────────────────────────────────────────────────
const codeLines = [
  { indent: 0, text: 'def two_sum(nums, target):', color: 'text-brand-blue' },
  { indent: 1, text: 'seen = {}', color: 'text-text-primary' },
  { indent: 1, text: 'for i, n in enumerate(nums):', color: 'text-brand-purple' },
  { indent: 2, text: 'if target - n in seen:', color: 'text-brand-cyan' },
  { indent: 3, text: 'return [seen[target-n], i]', color: 'text-brand-green' },
  { indent: 2, text: 'seen[n] = i', color: 'text-text-primary' },
]

function FloatingCodeCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60, rotate: 3 }}
      animate={{ opacity: 1, x: 0, rotate: 3 }}
      transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-0 top-8 w-72 glass rounded-xl overflow-hidden shadow-glow-blue"
    >
      {/* Terminal bar */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-bg-elevated border-b border-bg-border">
        <div className="w-2.5 h-2.5 rounded-full bg-brand-red/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-brand-amber/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-brand-green/70" />
        <span className="ml-2 text-xs text-text-muted font-mono">two_sum.py</span>
      </div>
      <div className="p-4 font-mono text-xs space-y-1">
        {codeLines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            style={{ paddingLeft: `${line.indent * 16}px` }}
            className={line.color}
          >
            {line.text}
          </motion.div>
        ))}
      </div>
      {/* Result badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.6 }}
        className="mx-4 mb-4 flex items-center gap-2 px-3 py-2 bg-brand-green/10 border border-brand-green/30 rounded-lg"
      >
        <CheckCircle2 className="w-4 h-4 text-brand-green" />
        <span className="text-xs text-brand-green font-mono font-medium">✓ All tests passed — +200 XP</span>
      </motion.div>
    </motion.div>
  )
}

// ── Features data ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: GitBranch,
    color: 'brand-blue',
    title: 'Skill Tree',
    desc: 'Graph-based progression. Every concept unlocks from your growing foundation — no random jumps.',
  },
  {
    icon: Zap,
    color: 'brand-purple',
    title: 'AI Mentor',
    desc: 'Personalized roadmap from your onboarding test. The right problems, at the right time.',
  },
  {
    icon: Code2,
    color: 'brand-cyan',
    title: 'Real Execution',
    desc: 'Python and Java run in isolated Docker sandboxes. Real compile errors. Real test cases.',
  },
  {
    icon: Globe,
    color: 'brand-green',
    title: 'World System',
    desc: '4 narrative worlds with boss fights. Progress feels like an RPG, not a checklist.',
  },
  {
    icon: Trophy,
    color: 'brand-amber',
    title: 'Live Leaderboard',
    desc: 'Global XP rankings updated in real-time. Climb from Recruit to Architect.',
  },
  {
    icon: BarChart3,
    color: 'brand-red',
    title: 'Analytics',
    desc: 'Skill heatmaps, accuracy curves, weak area detection. Know exactly what to fix.',
  },
]

// ── How it works ──────────────────────────────────────────────────────────────
const STEPS = [
  { num: '01', title: 'Choose Your Path', desc: 'Web Dev, DSA, AI/ML, or System Design. A mini-test calibrates your level.' },
  { num: '02', title: 'Enter Your World', desc: 'Start in Foundations. Complete quests, solve problems, collect XP.' },
  { num: '03', title: 'Defeat the Boss', desc: 'Each world ends with a boss challenge — real code, real pressure.' },
  { num: '04', title: 'Unlock & Advance', desc: 'Clear the boss, unlock the next world. Repeat until you\'re an architect.' },
]

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    text: "Went from writing basic scripts to landing a backend role in 4 months. The world progression kept me accountable.",
    name: "Aryan S.",
    role: "Backend Engineer @ Razorpay",
    stars: 5,
  },
  {
    text: "The DSA track with real code execution changed how I prepare for interviews. LeetCode never gave me this context.",
    name: "Priya M.",
    role: "SDE-II @ Flipkart",
    stars: 5,
  },
  {
    text: "The skill tree makes the roadmap visual and achievable. I always know what to work on next.",
    name: "Rahul K.",
    role: "Full Stack Dev",
    stars: 5,
  },
]

// ── Navbar ─────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 lg:px-12 glass-strong border-b border-bg-border/50">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-base gradient-text">LevelUp</span>
      </Link>

      <div className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
        <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-text-primary transition-colors">How it works</a>
        <a href="#testimonials" className="hover:text-text-primary transition-colors">Stories</a>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
        <Link to="/register" className="btn-primary text-sm">
          Start Free <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </nav>
  )
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16">
      <GridBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-xs text-brand-blue font-medium mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
              Real Code Execution · Python & Java · 4 Worlds
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl lg:text-6xl font-display font-bold leading-[1.05] mb-6"
            >
              Stop Watching{' '}
              <span className="gradient-text">Tutorials.</span>
              <br />
              Start Building{' '}
              <span className="gradient-text-gold">Skills.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-lg text-text-secondary leading-relaxed mb-10 max-w-lg"
            >
              LevelUp is a story-driven engineering platform where you progress through
              worlds, defeat boss challenges, and prove real skills — not just watch videos.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/register" className="btn-primary px-6 py-3 text-base shadow-glow-blue">
                Start Your Journey <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary px-6 py-3 text-base">
                <Play className="w-4 h-4" /> Demo Login
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-8 mt-12"
            >
              {[
                { val: '4', label: 'Worlds' },
                { val: '15+', label: 'Problems' },
                { val: '2', label: 'Languages' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <div className="text-2xl font-display font-bold gradient-text">{val}</div>
                  <div className="text-xs text-text-muted">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — code card */}
          <div className="relative hidden lg:block h-80">
            <FloatingCodeCard />

            {/* XP popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
              className="absolute left-0 bottom-0 glass px-4 py-3 rounded-xl border border-brand-purple/30 shadow-glow-purple"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl animate-level-up">🎉</div>
                <div>
                  <p className="text-xs font-bold text-brand-purple">LEVEL UP!</p>
                  <p className="text-xs text-text-secondary">You reached Level 6</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted"
      >
        <ChevronRight className="w-5 h-5 rotate-90" />
      </motion.div>
    </section>
  )
}

// ── Features Grid ──────────────────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <FadeUp className="text-center mb-16">
          <span className="text-xs font-medium text-brand-blue uppercase tracking-widest">Platform</span>
          <h2 className="text-4xl font-display font-bold mt-3 mb-4">
            Everything an engineer needs
          </h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Not a tutorial site. Not a competitive judge. A complete progression system built around how engineers actually grow.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, color, title, desc }, i) => (
            <FadeUp key={title} delay={i * 0.05}>
              <div className="card-hover group h-full">
                <div className={`w-10 h-10 rounded-xl bg-${color}/10 border border-${color}/20 flex items-center justify-center mb-4 group-hover:shadow-glow-blue transition-all`}>
                  <Icon className={`w-5 h-5 text-${color}`} />
                </div>
                <h3 className="font-display font-semibold text-base mb-2">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-bg-secondary/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <FadeUp className="text-center mb-16">
          <span className="text-xs font-medium text-brand-purple uppercase tracking-widest">The Journey</span>
          <h2 className="text-4xl font-display font-bold mt-3 mb-4">How LevelUp works</h2>
          <p className="text-text-secondary max-w-md mx-auto">
            A structured path from zero to production engineer. No shortcuts, no fluff.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ num, title, desc }, i) => (
            <FadeUp key={num} delay={i * 0.1}>
              <div className="relative">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-bg-border to-transparent z-0" style={{ width: 'calc(100% - 2rem)', left: 'calc(100% - 1rem)' }} />
                )}
                <div className="glass rounded-xl p-6 relative z-10">
                  <div className="text-xs font-mono text-text-muted mb-3">{num}</div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue/20 to-brand-purple/20 border border-brand-blue/20 flex items-center justify-center mb-4">
                    <span className="text-lg">{['🧭', '⚔️', '🐉', '🚀'][i]}</span>
                  </div>
                  <h3 className="font-display font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        {/* World preview strip */}
        <FadeUp className="mt-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: '🌱', name: 'Foundations',       color: '#22C55E', req: 'Level 1' },
              { icon: '⚙️', name: 'Core Engineering',  color: '#3B82F6', req: 'Level 5' },
              { icon: '🧠', name: 'Advanced Systems',  color: '#8B5CF6', req: 'Level 15' },
              { icon: '🚀', name: 'Real World',         color: '#F59E0B', req: 'Level 30' },
            ].map(({ icon, name, color, req }) => (
              <div
                key={name}
                className="glass rounded-xl p-4 flex items-center gap-3 border"
                style={{ borderColor: `${color}22` }}
              >
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color }}>{name}</p>
                  <p className="text-xs text-text-muted">{req}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <FadeUp className="text-center mb-16">
          <span className="text-xs font-medium text-brand-green uppercase tracking-widest">Engineers</span>
          <h2 className="text-4xl font-display font-bold mt-3">Built by engineers, for engineers</h2>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ text, name, role, stars }, i) => (
            <FadeUp key={name} delay={i * 0.1}>
              <div className="card h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-brand-amber text-brand-amber" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed flex-1 mb-6">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{name[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-text-muted">{role}</p>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA ────────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-blue pointer-events-none" />
      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <FadeUp>
          <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6">
            Ready to level up?
          </h2>
          <p className="text-text-secondary text-lg mb-10">
            Join engineers building real skills. Free to start.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="btn-primary px-8 py-4 text-base shadow-glow-blue animate-pulse-glow">
              Begin Your Journey <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-xs text-text-muted mt-6 flex items-center justify-center gap-2">
            <Shield className="w-3 h-3" />
            No credit card. No ads. Just engineering.
          </p>
        </FadeUp>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-bg-border py-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium gradient-text">LevelUp</span>
        </div>
        <p className="text-xs text-text-muted">Built for engineers who build.</p>
      </div>
    </footer>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <Hero />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  )
}
