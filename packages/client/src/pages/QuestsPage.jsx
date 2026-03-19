// packages/client/src/pages/QuestsPage.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Lock, ArrowRight, Loader2, Filter } from 'lucide-react'
import api from '@/lib/api'
import { clsx } from 'clsx'

const TYPE_OPTS = ['All', 'DAILY', 'STORY', 'BOSS', 'EVENT']
const TYPE_COLORS = { DAILY: 'brand-amber', STORY: 'brand-blue', BOSS: 'brand-purple', EVENT: 'brand-cyan' }

export default function QuestsPage() {
  const [quests, setQuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('All')

  useEffect(() => {
    const params = typeFilter !== 'All' ? `?type=${typeFilter}` : ''
    api.get(`/api/quests${params}`).then(r => setQuests(r.data.quests || [])).finally(() => setLoading(false))
  }, [typeFilter])

  const grouped = quests.reduce((acc, q) => {
    const key = q.world?.name || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(q)
    return acc
  }, {})

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Quests</h1>
          <p className="text-sm text-text-secondary mt-1">{quests.length} quests available</p>
        </div>
        <div className="flex gap-2">
          {TYPE_OPTS.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                typeFilter === t ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30' : 'btn-ghost'
              )}
            >{t}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-brand-blue animate-spin" /></div>
      ) : (
        Object.entries(grouped).map(([worldName, worldQuests]) => (
          <div key={worldName}>
            <h2 className="text-sm font-medium text-text-muted mb-3">{worldName}</h2>
            <div className="space-y-2">
              {worldQuests.map((q, i) => {
                const done = q.userProgress?.completed
                const locked = !q.isUnlocked
                const color = TYPE_COLORS[q.type] || 'brand-blue'
                return (
                  <motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className={clsx(
                      'flex items-center gap-4 p-4 rounded-xl border transition-all',
                      done ? 'bg-brand-green/5 border-brand-green/20 opacity-70' :
                      locked ? 'opacity-40 bg-bg-elevated border-bg-border/50' :
                      'bg-bg-elevated border-bg-border hover:border-brand-blue/30'
                    )}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-${color}/10`}>
                      {done ? <CheckCircle2 className="w-4 h-4 text-brand-green" /> :
                       locked ? <Lock className="w-4 h-4 text-text-muted" /> :
                       <span>{q.type === 'BOSS' ? '🐉' : q.type === 'DAILY' ? '☀️' : '⚔️'}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs text-${color} font-medium`}>{q.type}</span>
                        <span className={`badge-${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
                      </div>
                      <p className="text-sm font-medium truncate">{q.title}</p>
                      <p className="text-xs text-text-muted truncate">{q.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-mono text-brand-blue">+{q.xpReward} XP</p>
                      {q.coinReward > 0 && <p className="text-xs text-brand-amber">🪙 {q.coinReward}</p>}
                      {!done && !locked && q.problem && (
                        <Link to={`/problems/${q.problem.slug}`}
                          className="inline-flex items-center gap-1 mt-1 text-xs btn-primary py-1 px-2"
                        >
                          Go <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
