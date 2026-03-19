// packages/client/src/pages/ProblemPage.jsx
import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { oneDark } from '@codemirror/theme-one-dark'
import {
  Play, ChevronLeft, CheckCircle2, XCircle, Clock, AlertTriangle,
  Loader2, ChevronDown, ChevronUp, RotateCcw, Zap, BookOpen
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const LANG_OPTIONS = [
  { id: 'PYTHON', label: 'Python 3.11' },
  { id: 'JAVA',   label: 'Java 17' },
]

const RESULT_CONFIG = {
  ACCEPTED:      { icon: CheckCircle2, color: 'brand-green',  label: 'Accepted',           cls: 'result-accepted' },
  WRONG_ANSWER:  { icon: XCircle,      color: 'brand-red',    label: 'Wrong Answer',        cls: 'result-wrong' },
  TIME_LIMIT:    { icon: Clock,        color: 'brand-amber',  label: 'Time Limit Exceeded', cls: 'result-tle' },
  RUNTIME_ERROR: { icon: AlertTriangle,color: 'brand-red',    label: 'Runtime Error',       cls: 'result-error' },
  COMPILE_ERROR: { icon: AlertTriangle,color: 'brand-red',    label: 'Compile Error',       cls: 'result-error' },
  PENDING:       { icon: Loader2,      color: 'text-secondary',label: 'Running...',         cls: 'result-pending' },
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────
function DiffBadge({ diff }) {
  return <span className={`badge-${diff?.toLowerCase()}`}>{diff}</span>
}

// ─── Problem description panel ────────────────────────────────────────────────
function DescriptionPanel({ problem }) {
  const [tab, setTab] = useState('description')

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex gap-1 px-4 pt-4 border-b border-bg-border">
        {['description', 'submissions'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={clsx('px-3 py-2 text-xs font-medium rounded-t-lg transition-colors capitalize',
              tab === t ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-text-secondary hover:text-text-primary'
            )}
          >{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'description' && (
          <div className="space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DiffBadge diff={problem.difficulty} />
                <span className="badge bg-bg-elevated text-text-secondary border border-bg-border">{problem.type}</span>
                <span className="text-xs text-brand-blue font-mono">+{problem.xpReward} XP</span>
              </div>
              <h1 className="text-lg font-display font-bold">{problem.title}</h1>
            </div>

            {/* Tags */}
            {problem.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {problem.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-bg-elevated border border-bg-border text-text-muted">{tag}</span>
                ))}
              </div>
            )}

            {/* Description - rendered as pre-formatted */}
            <div className="prose-custom text-sm text-text-secondary leading-relaxed">
              {problem.description?.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h3 key={i} className="text-base font-display font-semibold text-text-primary mt-4 mb-2">{line.slice(3)}</h3>
                if (line.startsWith('### ')) return <h4 key={i} className="text-sm font-semibold text-text-primary mt-3 mb-1">{line.slice(4)}</h4>
                if (line.startsWith('```')) return null
                if (line.startsWith('|')) {
                  const cells = line.split('|').filter(Boolean).map(c => c.trim())
                  return (
                    <div key={i} className="flex gap-4 text-xs font-mono py-1 border-b border-bg-border/50">
                      {cells.map((c, j) => <span key={j} className="flex-1">{c}</span>)}
                    </div>
                  )
                }
                if (line.trim() === '') return <br key={i} />
                return <p key={i} className="mb-1">{line}</p>
              })}
            </div>

            {/* Test cases (visible) */}
            {problem.testCases?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3">Examples</h4>
                <div className="space-y-3">
                  {problem.testCases.filter(tc => !tc.isHidden).slice(0, 2).map((tc, i) => (
                    <div key={i} className="bg-bg-elevated rounded-xl p-3 border border-bg-border space-y-2">
                      <div>
                        <span className="text-xs text-text-muted">Input:</span>
                        <pre className="text-xs font-mono text-text-primary mt-1 whitespace-pre-wrap">{tc.input || '(none)'}</pre>
                      </div>
                      <div>
                        <span className="text-xs text-text-muted">Expected Output:</span>
                        <pre className="text-xs font-mono text-brand-green mt-1">{tc.expectedOutput}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints */}
            {problem.constraints && (
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">Constraints</h4>
                <div className="bg-bg-elevated rounded-xl p-3 border border-bg-border">
                  <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap">{problem.constraints}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'submissions' && <SubmissionsTab problemId={problem.id} />}
      </div>
    </div>
  )
}

// ─── Submissions history tab ──────────────────────────────────────────────────
function SubmissionsTab({ problemId }) {
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/submissions?problemId=${problemId}`)
      .then(r => setSubs(r.data.submissions || []))
      .finally(() => setLoading(false))
  }, [problemId])

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-brand-blue" /></div>
  if (!subs.length) return <p className="text-sm text-text-muted text-center py-8">No submissions yet.</p>

  return (
    <div className="space-y-2">
      {subs.map(sub => {
        const cfg = RESULT_CONFIG[sub.result] || RESULT_CONFIG.PENDING
        const Icon = cfg.icon
        return (
          <div key={sub.id} className={clsx('flex items-center gap-3 p-3 rounded-xl border text-xs', cfg.cls)}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium flex-1">{cfg.label}</span>
            <span className="font-mono text-text-muted">{sub.language}</span>
            <span className="font-mono text-text-muted">{sub.testsPassed}/{sub.testsTotal}</span>
            {sub.runtime && <span className="font-mono text-text-muted">{sub.runtime}ms</span>}
          </div>
        )
      })}
    </div>
  )
}

// ─── MCQ problem ──────────────────────────────────────────────────────────────
function MCQPanel({ problem, onResult }) {
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selected || submitting) return
    setSubmitting(true)
    try {
      const { data } = await api.post('/api/submissions/mcq', { problemId: problem.id, selectedOption: selected })
      setResult(data)
      onResult(data)
    } catch (err) {
      toast.error('Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold">Select your answer:</h3>
      <div className="space-y-2">
        {(problem.mcqOptions || []).map(opt => {
          const isSelected = selected === opt.id
          const showCorrect = result && opt.isCorrect
          const showWrong = result && isSelected && !opt.isCorrect
          return (
            <button key={opt.id} onClick={() => !result && setSelected(opt.id)}
              className={clsx(
                'w-full text-left p-3 rounded-xl border text-sm transition-all',
                showCorrect ? 'bg-brand-green/10 border-brand-green/40 text-brand-green' :
                showWrong   ? 'bg-brand-red/10 border-brand-red/40 text-brand-red' :
                isSelected  ? 'bg-brand-blue/10 border-brand-blue/40 text-text-primary' :
                              'bg-bg-elevated border-bg-border text-text-secondary hover:border-brand-blue/30',
                result && 'cursor-default'
              )}
            >
              <span className="font-mono text-text-muted mr-2">{opt.id.toUpperCase()}.</span>
              {opt.text}
            </button>
          )
        })}
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className={clsx('p-3 rounded-xl border text-sm', result.isCorrect ? 'bg-brand-green/10 border-brand-green/30 text-brand-green' : 'bg-brand-red/10 border-brand-red/30 text-brand-red')}
        >
          <p className="font-medium mb-1">{result.isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
          {result.explanation && <p className="text-xs text-text-secondary mt-1">{result.explanation}</p>}
          {result.xpResult && <p className="text-xs text-brand-blue mt-2">+{result.xpResult.xpGained} XP earned!</p>}
        </motion.div>
      )}

      {!result && (
        <button onClick={handleSubmit} disabled={!selected || submitting}
          className="btn-primary w-full justify-center disabled:opacity-40"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Answer'}
        </button>
      )}
    </div>
  )
}

// ─── Results panel ────────────────────────────────────────────────────────────
function ResultsPanel({ result, loading }) {
  const [expanded, setExpanded] = useState(null)

  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      <p className="text-sm text-text-secondary font-mono">Running your code...</p>
    </div>
  )

  if (!result) return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-text-muted">
      <Play className="w-10 h-10 opacity-30" />
      <p className="text-sm">Submit your solution to see results</p>
    </div>
  )

  const cfg = RESULT_CONFIG[result.summary?.result] || RESULT_CONFIG.WRONG_ANSWER
  const Icon = cfg.icon

  return (
    <div className="p-4 space-y-4">
      {/* Verdict */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className={clsx('flex items-center gap-3 p-4 rounded-xl border', cfg.cls)}
      >
        <Icon className="w-6 h-6 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-display font-bold">{cfg.label}</p>
          <p className="text-xs opacity-80">
            {result.summary?.passed}/{result.summary?.total} test cases passed
            {result.summary?.runtime && ` · ${result.summary.runtime}ms`}
          </p>
        </div>
        {result.xpResult?.xpGained > 0 && (
          <div className="flex items-center gap-1 text-brand-blue">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-bold">+{result.xpResult.xpGained}</span>
          </div>
        )}
      </motion.div>

      {/* Level up */}
      {result.xpResult?.leveledUp && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl border border-brand-purple/40 bg-brand-purple/10 text-brand-purple text-sm font-medium text-center"
        >
          🎉 Level Up! You reached Level {result.xpResult.level}
        </motion.div>
      )}

      {/* Error */}
      {result.summary?.errorMessage && (
        <div className="bg-brand-red/5 border border-brand-red/20 rounded-xl p-3">
          <p className="text-xs text-brand-red font-mono whitespace-pre-wrap">{result.summary.errorMessage}</p>
        </div>
      )}

      {/* Test case results */}
      {result.results?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-text-secondary">Test Cases</p>
          {result.results.map((tc, i) => (
            <div key={i} className="border border-bg-border rounded-xl overflow-hidden">
              <button onClick={() => setExpanded(expanded === i ? null : i)}
                className={clsx(
                  'w-full flex items-center gap-2 p-3 text-xs transition-colors hover:bg-bg-elevated',
                  tc.passed ? 'text-brand-green' : 'text-brand-red'
                )}
              >
                {tc.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span className="font-medium">Test {tc.testCase}</span>
                {tc.runtime && <span className="text-text-muted ml-auto">{tc.runtime}ms</span>}
                {expanded === i ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <AnimatePresence>
                {expanded === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2 text-xs font-mono bg-bg-elevated/50">
                      <div><span className="text-text-muted">Input: </span><span className="text-text-secondary">{tc.input || '(none)'}</span></div>
                      <div><span className="text-text-muted">Expected: </span><span className="text-brand-green">{tc.expectedOutput}</span></div>
                      <div><span className="text-text-muted">Got: </span><span className={tc.passed ? 'text-brand-green' : 'text-brand-red'}>{tc.actualOutput || '(empty)'}</span></div>
                      {tc.errorMessage && <div><span className="text-text-muted">Error: </span><span className="text-brand-red">{tc.errorMessage}</span></div>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Problem Page ────────────────────────────────────────────────────────
export default function ProblemPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { updateUser } = useAuthStore()

  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)

  const [language, setLanguage] = useState('PYTHON')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [activePanel, setActivePanel] = useState('results') // 'results'

  useEffect(() => {
    api.get(`/api/problems/${slug}`)
      .then(r => {
        const p = r.data.problem
        setProblem(p)
        // Set starter code
        const starter = p.starterCode || p.buggyCode
        if (starter) setCode(starter[language.toLowerCase()] || starter.python || '')
      })
      .catch(() => { toast.error('Problem not found'); navigate('/problems') })
      .finally(() => setLoading(false))
  }, [slug])

  // Update code when language changes
  useEffect(() => {
    if (!problem) return
    const starter = problem.starterCode || problem.buggyCode
    if (starter) setCode(starter[language.toLowerCase()] || starter.python || '')
  }, [language])

  const handleSubmit = async () => {
    if (!code.trim() || submitting) return
    setSubmitting(true)
    setResult(null)

    try {
      const { data } = await api.post('/api/submissions', { problemId: problem.id, code, language })
      setResult(data)
      if (data.xpResult) updateUser({ xp: data.xpResult.totalXP, level: data.xpResult.level })
      if (data.summary?.result === 'ACCEPTED') toast.success('✓ Accepted! Great work.')
      else toast.error(`${RESULT_CONFIG[data.summary?.result]?.label || 'Failed'}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    const starter = problem?.starterCode || problem?.buggyCode
    if (starter) setCode(starter[language.toLowerCase()] || starter.python || '')
    setResult(null)
  }

  const cmExtensions = language === 'PYTHON' ? [python()] : [java()]

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
    </div>
  )

  if (!problem) return null

  // MCQ / System Design — simpler layout
  if (problem.type === 'MCQ') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Link to="/problems" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Problems
        </Link>
        <div className="card">
          <DescriptionPanel problem={problem} />
          <div className="border-t border-bg-border">
            <MCQPanel problem={problem} onResult={(r) => { if (r.xpResult) updateUser({ xp: r.xpResult.totalXP, level: r.xpResult.level }) }} />
          </div>
        </div>
      </div>
    )
  }

  // Coding / Debugging — split layout
  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Left — problem description */}
      <div className="w-[420px] flex-shrink-0 border-r border-bg-border bg-bg-secondary overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-bg-border">
          <Link to="/problems" className="text-text-muted hover:text-text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <BookOpen className="w-4 h-4 text-text-muted" />
          <span className="text-xs text-text-muted font-medium truncate">{problem.world?.name}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <DescriptionPanel problem={problem} />
        </div>
      </div>

      {/* Right — editor + results */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-bg-secondary border-b border-bg-border">
          <div className="flex items-center gap-2">
            {LANG_OPTIONS.map(({ id, label }) => (
              <button key={id} onClick={() => setLanguage(id)}
                className={clsx('px-3 py-1 rounded-lg text-xs font-medium transition-all',
                  language === id
                    ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-elevated'
                )}
              >{label}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="btn-ghost text-xs py-1 px-2">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="btn-primary text-xs py-1.5 px-4 disabled:opacity-50"
            >
              {submitting
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running...</>
                : <><Play className="w-3.5 h-3.5" /> Submit</>
              }
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden" style={{ height: '55%' }}>
          <CodeMirror
            value={code}
            height="100%"
            theme={oneDark}
            extensions={cmExtensions}
            onChange={setCode}
            style={{ height: '100%', fontSize: '13px' }}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              autocompletion: true,
              bracketMatching: true,
              indentOnInput: true,
            }}
          />
        </div>

        {/* Results panel */}
        <div className="border-t border-bg-border bg-bg-secondary overflow-y-auto" style={{ height: '45%' }}>
          <div className="px-4 pt-3 pb-1 border-b border-bg-border">
            <span className="text-xs font-medium text-text-secondary">Results</span>
          </div>
          <ResultsPanel result={result} loading={submitting} />
        </div>
      </div>
    </div>
  )
}
