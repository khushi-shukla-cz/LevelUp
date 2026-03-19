// packages/client/src/pages/LeaderboardPage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Zap, Flame, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { clsx } from 'clsx'

export default function LeaderboardPage() {
  const { user } = useAuthStore()
  const [data, setData] = useState({ leaderboard: [], userRank: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/leaderboard?limit=50').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  const rankIcon = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-brand-amber" /> Leaderboard
        </h1>
        <p className="text-sm text-text-secondary mt-1">Global XP rankings — updated in real-time</p>
      </div>

      {data.userRank && (
        <div className="card border-brand-blue/30 bg-brand-blue/5">
          <p className="text-sm text-text-secondary">Your rank</p>
          <p className="text-3xl font-display font-bold text-brand-blue">#{data.userRank}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-brand-blue animate-spin" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          {data.leaderboard.map((entry, i) => (
            <motion.div key={entry.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className={clsx(
                'flex items-center gap-4 px-5 py-4 border-b border-bg-border/50 last:border-0 transition-colors',
                entry.userId === user?.id ? 'bg-brand-blue/5' : 'hover:bg-bg-elevated/50'
              )}
            >
              <div className="w-8 text-center flex-shrink-0">
                {rankIcon(i)
                  ? <span className="text-xl">{rankIcon(i)}</span>
                  : <span className="text-sm font-mono text-text-muted">#{i + 1}</span>
                }
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">{entry.user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium flex items-center gap-2">
                  {entry.user?.name}
                  {entry.userId === user?.id && <span className="text-xs text-brand-blue">(you)</span>}
                </p>
                <p className="text-xs text-text-muted">Level {entry.level}</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-brand-amber">
                  <Flame className="w-3 h-3" />{entry.streak}d
                </div>
                <div className="flex items-center gap-1 text-brand-blue font-mono font-medium">
                  <Zap className="w-3 h-3" />{entry.xp.toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
