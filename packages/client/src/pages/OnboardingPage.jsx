// packages/client/src/pages/OnboardingPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, Zap } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

// ─── Step data ────────────────────────────────────────────────────────────────
const PATHS = [
  { id: 'DSA',           icon: '⚔️',  title: 'DSA & Algorithms',   desc: 'Arrays, trees, DP, interview prep' },
  { id: 'WEB_DEV',       icon: '🌐',  title: 'Web Development',     desc: 'Frontend, backend, APIs, full-stack' },
  { id: 'AI_ML',         icon: '🧠',  title: 'AI / Machine Learning', desc: 'ML fundamentals, models, pipelines' },
  { id: 'SYSTEM_DESIGN', icon: '🏗️', title: 'System Design',       desc: 'Scale, architecture, distributed systems' },
]

const LEVELS = [
  { id: 'BEGINNER',     icon: '🌱', title: 'Beginner',     desc: 'New to this domain — starting fresh' },
  { id: 'INTERMEDIATE', icon: '⚙️', title: 'Intermediate', desc: 'Know the basics, want to go deeper' },
  { id: 'ADVANCED',     icon: '🚀', title: 'Advanced',     desc: 'Strong foundation, targeting mastery' },
]

const HOURS = [
  { id: 1, icon: '☕', title: '1 hour/day',  desc: 'Light pace — steady progress' },
  { id: 2, icon: '💻', title: '2 hours/day', desc: 'Balanced — recommended' },
  { id: 4, icon: '🔥', title: '4 hours/day', desc: 'Intense — fast track' },
]

// ─── Mini-test questions ──────────────────────────────────────────────────────
const MINI_TEST = [
  {
    id: 'q1', type: 'mcq',
    question: 'What is the time complexity of binary search on a sorted array of n elements?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correct: 1,
  },
  {
    id: 'q2', type: 'mcq',
    question: 'Which data structure uses LIFO (Last In, First Out) order?',
    options: ['Queue', 'Heap', 'Stack', 'Graph'],
    correct: 2,
  },
  {
    id: 'q3', type: 'logic',
    question: 'What does the following Python snippet print?\n\nfor i in range(3):\n    print(i * 2, end=" ")',
    options: ['1 2 3', '0 2 4', '0 1 2', '2 4 6'],
    correct: 1,
  },
]

// ─── Selectable card ──────────────────────────────────────────────────────────
function OptionCard({ icon, title, desc, selected, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={clsx(
        'w-full text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer',
        selected
          ? 'bg-brand-blue/10 border-brand-blue/60 shadow-glow-blue'
          : 'bg-bg-elevated border-bg-border hover:border-brand-blue/30'
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{title}</p>
            {selected && <CheckCircle2 className="w-4 h-4 text-brand-blue flex-shrink-0" />}
          </div>
          <p className="text-xs text-text-muted mt-0.5 truncate">{desc}</p>
        </div>
      </div>
    </motion.button>
  )
}

// ─── Progress dots ────────────────────────────────────────────────────────────
function StepDots({ current, total }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ width: i === current ? 24 : 8, opacity: i <= current ? 1 : 0.3 }}
          className="h-2 rounded-full bg-brand-blue"
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  )
}

// ─── Slide variants ───────────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { completeOnboarding, user } = useAuthStore()

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(false)

  const [selectedPath, setSelectedPath] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [selectedHours, setSelectedHours] = useState(null)
  const [testAnswers, setTestAnswers] = useState({})

  const TOTAL_STEPS = 4

  const canAdvance = [
    () => !!selectedPath,
    () => !!selectedLevel,
    () => !!selectedHours,
    () => Object.keys(testAnswers).length === MINI_TEST.length,
  ]

  const go = (dir) => {
    setDirection(dir)
    setStep(s => s + dir)
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      // Fetch worlds to find the first world's ID
      const { data: worldsData } = await api.get('/api/worlds')
      const firstWorld = worldsData.worlds?.[0]

      // Score the mini test
      const score = MINI_TEST.reduce((acc, q) => {
        return acc + (testAnswers[q.id] === q.correct ? 1 : 0)
      }, 0)

      await completeOnboarding({
        selectedPath,
        skillLevel: selectedLevel,
        dailyGoalHours: selectedHours,
        currentWorldId: firstWorld?.id || null,
      })

      toast.success(`Welcome to LevelUp, ${user?.name}! You scored ${score}/${MINI_TEST.length} on the test.`)
      navigate('/dashboard')
    } catch (err) {
      toast.error('Failed to save preferences. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    // Step 0: Choose path
    {
      title: 'Choose Your Path',
      subtitle: 'What do you want to master first?',
      content: (
        <div className="space-y-3">
          {PATHS.map(p => (
            <OptionCard key={p.id} {...p} selected={selectedPath === p.id} onClick={() => setSelectedPath(p.id)} />
          ))}
        </div>
      )
    },
    // Step 1: Skill level
    {
      title: 'Your Current Level',
      subtitle: 'Honest assessment — we\'ll calibrate your roadmap.',
      content: (
        <div className="space-y-3">
          {LEVELS.map(l => (
            <OptionCard key={l.id} {...l} selected={selectedLevel === l.id} onClick={() => setSelectedLevel(l.id)} />
          ))}
        </div>
      )
    },
    // Step 2: Time commitment
    {
      title: 'Daily Commitment',
      subtitle: 'How much time can you dedicate each day?',
      content: (
        <div className="space-y-3">
          {HOURS.map(h => (
            <OptionCard key={h.id} {...h} selected={selectedHours === h.id} onClick={() => setSelectedHours(h.id)} />
          ))}
        </div>
      )
    },
    // Step 3: Mini test
    {
      title: 'Quick Calibration',
      subtitle: 'Three questions to fine-tune your roadmap. No pressure.',
      content: (
        <div className="space-y-6">
          {MINI_TEST.map((q, qi) => (
            <div key={q.id}>
              <p className="text-sm font-medium mb-3">
                <span className="text-brand-blue font-mono mr-2">Q{qi + 1}.</span>
                {q.question.includes('\n')
                  ? <>{q.question.split('\n')[0]}<pre className="mt-2 text-xs bg-bg-elevated rounded-lg p-3 font-mono text-text-secondary">{q.question.split('\n').slice(1).join('\n')}</pre></>
                  : q.question
                }
              </p>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    onClick={() => setTestAnswers(a => ({ ...a, [q.id]: oi }))}
                    className={clsx(
                      'text-left p-3 rounded-xl border text-xs font-medium transition-all',
                      testAnswers[q.id] === oi
                        ? 'bg-brand-purple/10 border-brand-purple/60 text-brand-purple'
                        : 'bg-bg-elevated border-bg-border text-text-secondary hover:border-brand-purple/30 hover:text-text-primary'
                    )}
                  >
                    <span className="font-mono text-text-muted mr-2">{String.fromCharCode(65 + oi)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    }
  ]

  const current = steps[step]

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold gradient-text">LevelUp</span>
          </div>
          <span className="text-xs text-text-muted font-mono">{step + 1} / {TOTAL_STEPS}</span>
        </div>

        <StepDots current={step} total={TOTAL_STEPS} />

        {/* Card */}
        <div className="card mt-6 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="text-2xl font-display font-bold mb-1">{current.title}</h2>
              <p className="text-sm text-text-secondary mb-6">{current.subtitle}</p>
              <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-1">
                {current.content}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-bg-border">
            {step > 0 && (
              <button onClick={() => go(-1)} className="btn-secondary flex-1 justify-center">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}

            {step < TOTAL_STEPS - 1 ? (
              <button
                onClick={() => go(1)}
                disabled={!canAdvance[step]()}
                className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!canAdvance[step]() || loading}
                className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</>
                  : <>Enter LevelUp <Zap className="w-4 h-4" /></>
                }
              </button>
            )}
          </div>
        </div>

        {/* Skip */}
        <p className="text-center text-xs text-text-muted mt-4">
          You can update these preferences anytime from your profile.
        </p>
      </div>
    </div>
  )
}
