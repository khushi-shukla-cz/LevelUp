// packages/client/src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Flame, Trophy, Code2, Globe, ArrowRight,
  CheckCircle2, Lock, Star, TrendingUp, Target, Calendar, Loader2
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { clsx } from 'clsx'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

// ─── XP Level math (mirrors server) ──────────────────────────────────────────
const xpForLevel = (l) => Math.floor(100 * Math.pow(l, 1.5))
const totalXPForLevel = (l) => { let t = 0; for (let i = 1; i < l; i++) t += xpForLevel(i); return t; }

function LevelProgress({ xp, level }) {
  const current = xp - totalXPForLevel(level)
  const needed = xpForLevel(level)
  const pct = Math.min(100, Math.round((current / needed) * 100))
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-text-muted">Level {level} → {level + 1}</span>
        <span className="text-xs font-mono text-brand-blue">{current} / {needed} XP</span>
      </div>
      <div className="xp-bar-track">
        <motion.div className="xp-bar-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }} />
      </div>
      <div className="text-right text-xs text-text-muted">{pct}%</div>
    </div>
  )
}

// ─── Level-up popup ───────────────────────────────────────────────────────────
function LevelUpToast({ level, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ type: 'spring', damping: 18, stiffness: 200 }}
      className="fixed bottom-8 right-8 z-50 glass px-6 py-4 rounded-2xl border border-brand-purple/40 shadow-glow-purple"
    >
      <div className="flex items-center gap-4">
        <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.6, delay: 0.2 }} className="text-4xl">🎉</motion.div>
        <div>
          <p className="font-display font-bold text-brand-purple text-lg">Level Up!</p>
          <p className="text-sm text-text-secondary">You reached <span className="text-text-primary font-medium">Level {level}</span></p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      className="card flex items-center gap-4"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}/10 border border-${color}/20`}>
        <Icon className={`w-5 h-5 text-${color}`} />
      </div>
      <div>
        <p className="text-xl font-display font-bold">{value}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </motion.div>
  )
}

// ─── Daily quest card ─────────────────────────────────────────────────────────
function DailyQuestCard({ quest, onComplete }) {
  const [completing, setCompleting] = useState(false)
  const done = quest.completedToday

  const handleComplete = async () => {
    if (done || completing) return
    setCompleting(true)
    try {
      const { data } = await api.post(`/api/quests/${quest.id}/complete`)
      onComplete(data)
    } catch { /* handled in parent */ }
    finally { setCompleting(false) }
  }

  return (
    <div className={clsx(
      'flex items-center gap-3 p-3 rounded-xl border transition-all',
      done ? 'bg-brand-green/5 border-brand-green/20 opacity-70' : 'bg-bg-elevated border-bg-border hover:border-brand-blue/30'
    )}>
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
        done ? 'bg-brand-green/20' : 'bg-brand-blue/10'
      )}>
        {done ? <CheckCircle2 className="w-4 h-4 text-brand-green" /> : <Zap className="w-4 h-4 text-brand-blue" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{quest.title}</p>
        <p className="text-xs text-text-muted">+{quest.xpReward} XP · {quest.world?.icon} {quest.world?.name}</p>
      </div>
      {!done && quest.problem && (
        <Link to={`/problems/${quest.problem.slug}`}
          className="flex-shrink-0 text-xs btn-secondary py-1 px-2"
        >
          Go <ArrowRight className="w-3 h-3" />
        </Link>
      )}
      {!done && !quest.problem && (
        <button onClick={handleComplete} disabled={completing}
          className="flex-shrink-0 text-xs btn-primary py-1 px-2"
        >
          {completing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Claim'}
        </button>
      )}
    </div>
  )
}

// ─── Leaderboard mini ─────────────────────────────────────────────────────────
function LeaderboardMini({ entries, userRank }) {
  return (
    <div className="space-y-2">
      {entries.slice(0, 5).map((entry, i) => (
        <div key={entry.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-bg-elevated transition-colors">
          <span className={clsx('w-6 text-xs font-mono font-bold text-center',
            i === 0 ? 'text-brand-amber' : i === 1 ? 'text-text-secondary' : i === 2 ? 'text-brand-amber/60' : 'text-text-muted'
          )}>
            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
          </span>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">{entry.user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{entry.user?.name}</p>
            <p className="text-xs text-text-muted">Lv.{entry.level}</p>
          </div>
          <span className="text-xs font-mono text-brand-blue">{entry.xp.toLocaleString()}</span>
        </div>
      ))}
      {userRank && userRank > 5 && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-brand-blue/5 border border-brand-blue/10 mt-2">
          <span className="w-6 text-xs font-mono font-bold text-brand-blue text-center">#{userRank}</span>
          <span className="text-xs text-text-secondary">Your rank</span>
        </div>
      )}
    </div>
  )
}

// ─── World progress card ──────────────────────────────────────────────────────
function WorldCard({ world, isUnlocked }) {
  return (
    <Link to={isUnlocked ? `/worlds/${world.slug}` : '#'}
      className={clsx(
        'relative flex items-center gap-4 p-4 rounded-xl border transition-all',
        isUnlocked
          ? 'bg-bg-elevated border-bg-border hover:border-brand-blue/30 cursor-pointer'
          : 'bg-bg-elevated/50 border-bg-border/50 opacity-50 cursor-not-allowed'
      )}
      style={{ borderColor: isUnlocked ? `${world.color}22` : undefined }}
    >
      <div className="text-3xl">{world.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: world.color }}>{world.name}</p>
        <p className="text-xs text-text-muted truncate">{world.description?.slice(0, 60)}...</p>
        {!isUnlocked && (
          <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Requires Level {world.unlockLevel}
          </p>
        )}
      </div>
      {isUnlocked && <ArrowRight className="w-4 h-4 text-text-muted flex-shrink-0" />}
    </Link>
  )
}

// ─── Custom chart tooltip ─────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass px-3 py-2 rounded-lg text-xs border border-bg-border">
      <p className="text-text-muted mb-1">{label}</p>
      <p className="text-brand-blue font-mono font-medium">+{payload[0]?.value} XP</p>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, updateUser, refreshUser } = useAuthStore()
  const [analytics, setAnalytics] = useState(null)
  const [dailyQuests, setDailyQuests] = useState([])
  const [leaderboard, setLeaderboard] = useState({ entries: [], userRank: null })
  const [worlds, setWorlds] = useState([])
  const [loading, setLoading] = useState(true)
  const [levelUpPopup, setLevelUpPopup] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, questsRes, lbRes, worldsRes] = await Promise.all([
          api.get('/api/analytics/me'),
          api.get('/api/quests/daily'),
          api.get('/api/leaderboard?limit=10'),
          api.get('/api/worlds'),
        ])
        setAnalytics(analyticsRes.data)
        setDailyQuests(questsRes.data.quests || [])
        setLeaderboard({ entries: lbRes.data.leaderboard || [], userRank: lbRes.data.userRank })
        setWorlds(worldsRes.data.worlds || [])
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleQuestComplete = async (data) => {
    if (data.xpResult) {
      updateUser({ xp: data.xpResult.totalXP, level: data.xpResult.level })
      if (data.xpResult.leveledUp) setLevelUpPopup(data.xpResult.level)
    }
    // Refresh daily quests
    const res = await api.get('/api/quests/daily')
    setDailyQuests(res.data.quests || [])
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
          <p className="text-sm text-text-muted">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const ov = analytics?.overview

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Level up popup */}
      <AnimatePresence>
        {levelUpPopup && (
          <LevelUpToast level={levelUpPopup} onClose={() => setLevelUpPopup(null)} />
        )}
      </AnimatePresence>

      {/* ── Header ────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">
          {greeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {ov?.streak > 0
            ? `🔥 ${ov.streak}-day streak — keep it going!`
            : 'Complete a quest today to start your streak.'}
        </p>
      </motion.div>

      {/* ── Stat cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Zap}     label="Total XP"        value={(ov?.xp ?? 0).toLocaleString()}        color="brand-blue"   delay={0} />
        <StatCard icon={Star}    label="Level"           value={ov?.level ?? 1}                         color="brand-purple" delay={0.05} />
        <StatCard icon={Flame}   label="Day Streak"      value={ov?.streak ?? 0}                        color="brand-amber"  delay={0.1} />
        <StatCard icon={Target}  label="Problems Solved" value={ov?.totalSolved ?? 0}                   color="brand-green"  delay={0.15} />
      </div>

      {/* ── XP progress ───────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold">Level Progress</h2>
          <span className="text-xs text-text-muted">{ov?.questsCompleted ?? 0} quests completed</span>
        </div>
        <LevelProgress xp={ov?.xp ?? 0} level={ov?.level ?? 1} />
      </motion.div>

      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left col (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* XP chart */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-blue" /> XP This Week
              </h2>
              <Link to="/analytics" className="text-xs text-brand-blue hover:underline">View full analytics →</Link>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={analytics?.xpChart?.slice(-7) || []}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#4B5563', fontSize: 10 }}
                  tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="xp" stroke="#3B82F6" strokeWidth={2}
                  fill="url(#xpGrad)" dot={false} activeDot={{ r: 4, fill: '#3B82F6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Daily quests */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-amber" /> Daily Quests
              </h2>
              <Link to="/quests" className="text-xs text-brand-blue hover:underline">All quests →</Link>
            </div>
            {dailyQuests.length > 0 ? (
              <div className="space-y-2">
                {dailyQuests.map(q => (
                  <DailyQuestCard key={q.id} quest={q} onComplete={handleQuestComplete} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-6">No daily quests available yet. Complete onboarding to unlock them.</p>
            )}
          </motion.div>

          {/* Worlds */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-green" /> Worlds
              </h2>
              <Link to="/worlds" className="text-xs text-brand-blue hover:underline">Explore →</Link>
            </div>
            <div className="space-y-2">
              {worlds.map(w => (
                <WorldCard key={w.id} world={w} isUnlocked={w.isUnlocked} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right col (1/3) */}
        <div className="space-y-6">
          {/* Quick actions */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card">
            <h2 className="font-display font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { to: '/problems', icon: Code2,  label: 'Solve a Problem',  color: 'brand-blue',   desc: `${ov?.totalSolved ?? 0} solved` },
                { to: '/worlds',   icon: Globe,  label: 'Enter a World',    color: 'brand-green',  desc: `${worlds.filter(w => w.isUnlocked).length} unlocked` },
                { to: '/skill-tree', icon: Star, label: 'Skill Tree',       color: 'brand-purple', desc: 'Track progress' },
              ].map(({ to, icon: Icon, label, color, desc }) => (
                <Link key={to} to={to}
                  className={`flex items-center gap-3 p-3 rounded-xl bg-bg-elevated border border-bg-border hover:border-${color}/30 transition-all group`}
                >
                  <Icon className={`w-4 h-4 text-${color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium group-hover:text-text-primary transition-colors">{label}</p>
                    <p className="text-xs text-text-muted">{desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-text-secondary transition-colors" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Leaderboard */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-brand-amber" /> Leaderboard
              </h2>
              <Link to="/leaderboard" className="text-xs text-brand-blue hover:underline">Full →</Link>
            </div>
            <LeaderboardMini entries={leaderboard.entries} userRank={leaderboard.userRank} />
          </motion.div>

          {/* Stats breakdown */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="card">
            <h2 className="font-display font-semibold mb-4">Performance</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Accuracy</span>
                <span className="font-mono text-brand-green">{ov?.accuracy ?? 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Submissions</span>
                <span className="font-mono">{ov?.totalSubmissions ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Days Active</span>
                <span className="font-mono">{ov?.daysActive ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Coins</span>
                <span className="font-mono text-brand-amber">🪙 {(user?.coins ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
