// packages/client/src/pages/AnalyticsPage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Target, Calendar, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass px-3 py-2 rounded-lg text-xs border border-bg-border">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }} className="font-mono">{p.name}: {p.value}</p>)}
    </div>
  )
}

const DIFF_COLORS = { EASY: '#22C55E', MEDIUM: '#F59E0B', HARD: '#EF4444', BOSS: '#8B5CF6' }
const TYPE_COLORS = { CODING: '#3B82F6', MCQ: '#06B6D4', DEBUGGING: '#F59E0B' }

export default function AnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/analytics/me').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-7 h-7 text-brand-blue animate-spin" /></div>

  const ov = data?.overview

  const diffData = Object.entries(data?.solvedByDifficulty || {}).map(([name, value]) => ({ name, value }))
  const typeData = Object.entries(data?.typeBreakdown || {}).map(([name, value]) => ({ name, value }))

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-blue" /> Analytics
        </h1>
        <p className="text-sm text-text-secondary mt-1">Your engineering performance breakdown</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Problems Solved', value: ov?.totalSolved ?? 0,     color: 'brand-green' },
          { label: 'Accuracy',        value: `${ov?.accuracy ?? 0}%`,   color: 'brand-blue' },
          { label: 'Quests Done',     value: ov?.questsCompleted ?? 0,  color: 'brand-purple' },
          { label: 'Days Active',     value: ov?.daysActive ?? 0,       color: 'brand-amber' },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card"
          >
            <p className={`text-2xl font-display font-bold text-${color}`}>{value}</p>
            <p className="text-xs text-text-muted mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* XP Chart */}
      <div className="card">
        <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-blue" /> XP Over 14 Days
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data?.xpChart || []}>
            <defs>
              <linearGradient id="xpArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: '#4B5563', fontSize: 10 }} tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4B5563', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="xp" name="XP" stroke="#3B82F6" strokeWidth={2} fill="url(#xpArea)" dot={false} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* By difficulty */}
        <div className="card">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-green" /> Solved by Difficulty
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={diffData} barSize={32}>
              <XAxis dataKey="name" tick={{ fill: '#4B5563', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Solved" radius={[6, 6, 0, 0]}>
                {diffData.map((entry) => (
                  <Cell key={entry.name} fill={DIFF_COLORS[entry.name] || '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By type */}
        <div className="card">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-purple" /> Submissions by Type
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''} labelLine={false}>
                {typeData.map((entry) => (
                  <Cell key={entry.name} fill={TYPE_COLORS[entry.name] || '#3B82F6'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Level progress */}
      <div className="card">
        <h2 className="font-display font-semibold mb-4">Level Progress</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {[
            { label: 'Current XP',  value: (ov?.xp ?? 0).toLocaleString() },
            { label: 'Level',       value: ov?.level ?? 1 },
            { label: 'XP to Next',  value: (ov?.xpNeeded ?? 0).toLocaleString() },
            { label: 'Progress',    value: `${ov?.levelProgress ?? 0}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-bg-elevated rounded-xl p-3">
              <p className="text-text-muted text-xs">{label}</p>
              <p className="font-mono font-bold text-lg mt-1">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 xp-bar-track">
          <motion.div className="xp-bar-fill" initial={{ width: 0 }}
            animate={{ width: `${ov?.levelProgress ?? 0}%` }} transition={{ duration: 1 }}
          />
        </div>
      </div>
    </div>
  )
}
