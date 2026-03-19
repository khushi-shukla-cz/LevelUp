// packages/client/src/pages/WorldDetailPage.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, CheckCircle2, Lock, ArrowRight, Sword, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { clsx } from 'clsx'

const TYPE_COLORS = { DAILY: 'brand-amber', STORY: 'brand-blue', BOSS: 'brand-purple', EVENT: 'brand-cyan' }

export default function WorldDetailPage() {
  const { slug } = useParams()
  const [world, setWorld] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/worlds/${slug}`).then(r => setWorld(r.data.world)).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-7 h-7 text-brand-blue animate-spin" /></div>
  if (!world) return <div className="p-8 text-center text-text-muted">World not found.</div>

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <Link to="/worlds" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
        <ChevronLeft className="w-4 h-4" /> All Worlds
      </Link>

      {/* World header */}
      <div className="card relative overflow-hidden" style={{ borderColor: `${world.color}33` }}>
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: world.color }} />
        <div className="flex items-start gap-5 pt-2">
          <span className="text-5xl">{world.icon}</span>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold mb-1" style={{ color: world.color }}>{world.name}</h1>
            <p className="text-sm text-text-secondary mb-4">{world.description}</p>
            {world.progressPercent !== undefined && (
              <div>
                <div className="flex justify-between text-xs text-text-muted mb-1">
                  <span>Progress</span><span>{world.progressPercent}%</span>
                </div>
                <div className="xp-bar-track">
                  <motion.div className="xp-bar-fill" initial={{ width: 0 }}
                    animate={{ width: `${world.progressPercent}%` }} transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="mt-4 text-xs text-text-muted italic border-t border-bg-border pt-3">{world.narrative}</p>
      </div>

      {/* Quests */}
      <div>
        <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Sword className="w-4 h-4 text-brand-blue" /> Quests ({world.quests?.length ?? 0})
        </h2>
        <div className="space-y-3">
          {world.quests?.map((q, i) => {
            const done = q.userProgress?.completed
            const locked = !q.isUnlocked
            const color = TYPE_COLORS[q.type] || 'brand-blue'
            return (
              <motion.div key={q.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className={clsx(
                  'flex items-center gap-4 p-4 rounded-xl border transition-all',
                  done ? 'bg-brand-green/5 border-brand-green/20' :
                  locked ? 'opacity-50 bg-bg-elevated border-bg-border/50' :
                  'bg-bg-elevated border-bg-border hover:border-brand-blue/30'
                )}
              >
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  done ? 'bg-brand-green/20' : `bg-${color}/10`
                )}>
                  {done ? <CheckCircle2 className="w-5 h-5 text-brand-green" /> :
                   locked ? <Lock className="w-5 h-5 text-text-muted" /> :
                   <span className="text-lg">{q.type === 'BOSS' ? '🐉' : q.type === 'DAILY' ? '☀️' : '⚔️'}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-medium text-${color}`}>{q.type}</span>
                    <span className={`badge-${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
                  </div>
                  <p className="text-sm font-medium">{q.title}</p>
                  <p className="text-xs text-text-muted">{q.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-mono text-brand-blue">+{q.xpReward} XP</p>
                  {!done && !locked && q.problem && (
                    <Link to={`/problems/${q.problem.slug}`}
                      className="inline-flex items-center gap-1 text-xs btn-primary mt-2 py-1 px-2"
                    >
                      Solve <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
