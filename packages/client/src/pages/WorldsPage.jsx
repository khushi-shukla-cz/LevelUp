// packages/client/src/pages/WorldsPage.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { clsx } from 'clsx'

export default function WorldsPage() {
  const [worlds, setWorlds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/worlds').then(r => setWorlds(r.data.worlds || [])).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-7 h-7 text-brand-blue animate-spin" /></div>

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Worlds</h1>
        <p className="text-sm text-text-secondary mt-1">Progress through narrative worlds. Each world unlocks new challenges.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {worlds.map((w, i) => (
          <motion.div key={w.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link to={w.isUnlocked ? `/worlds/${w.slug}` : '#'}
              className={clsx(
                'block card-hover relative overflow-hidden',
                !w.isUnlocked && 'opacity-60 cursor-not-allowed pointer-events-none'
              )}
              style={{ borderColor: w.isUnlocked ? `${w.color}33` : undefined }}
            >
              {/* Color accent */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: w.color }} />

              <div className="flex items-start gap-4 pt-2">
                <span className="text-4xl">{w.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-display font-bold text-base" style={{ color: w.color }}>{w.name}</h3>
                    {!w.isUnlocked
                      ? <span className="flex items-center gap-1 text-xs text-text-muted"><Lock className="w-3 h-3" /> Lv.{w.unlockLevel}</span>
                      : <ArrowRight className="w-4 h-4 text-text-muted" />
                    }
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{w.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-text-muted">
                    <span>{w._count?.quests ?? 0} quests</span>
                    <span>{w._count?.problems ?? 0} problems</span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-text-muted italic border-t border-bg-border pt-3">{w.narrative?.slice(0, 100)}...</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
