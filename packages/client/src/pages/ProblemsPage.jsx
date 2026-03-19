// packages/client/src/pages/ProblemsPage.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, CheckCircle2, Code2, HelpCircle, Bug, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { clsx } from 'clsx'

const TYPE_ICONS = { CODING: Code2, MCQ: HelpCircle, DEBUGGING: Bug, SYSTEM_DESIGN: Filter }
const DIFFICULTIES = ['All', 'EASY', 'MEDIUM', 'HARD', 'BOSS']
const TYPES = ['All', 'CODING', 'MCQ', 'DEBUGGING', 'SYSTEM_DESIGN']

export default function ProblemsPage() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [diff, setDiff] = useState('All')
  const [type, setType] = useState('All')

  useEffect(() => {
    const params = new URLSearchParams()
    if (diff !== 'All') params.set('difficulty', diff)
    if (type !== 'All') params.set('type', type)
    api.get(`/api/problems?${params}&limit=100`)
      .then(r => setProblems(r.data.problems || []))
      .finally(() => setLoading(false))
  }, [diff, type])

  const filtered = problems.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Problems</h1>
        <p className="text-sm text-text-secondary mt-1">{problems.length} problems across all worlds</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input className="input pl-9" placeholder="Search problems or tags..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <select className="input text-sm py-2" value={diff} onChange={e => setDiff(e.target.value)}>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="input text-sm py-2" value={type} onChange={e => setType(e.target.value)}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-brand-blue animate-spin" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-bg-border">
              <tr>
                {['Status', 'Title', 'Difficulty', 'Type', 'XP', 'World'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-text-muted px-4 py-3 first:pl-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-border/50">
              {filtered.map((p, i) => {
                const Icon = TYPE_ICONS[p.type] || Code2
                return (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-bg-elevated/50 transition-colors group"
                  >
                    <td className="px-4 py-3 pl-5 w-10">
                      {p.isSolved
                        ? <CheckCircle2 className="w-4 h-4 text-brand-green" />
                        : <div className="w-4 h-4 rounded-full border-2 border-bg-border group-hover:border-brand-blue/40 transition-colors" />
                      }
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/problems/${p.slug}`} className="text-sm font-medium hover:text-brand-blue transition-colors">
                        {p.title}
                      </Link>
                      {p.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.tags.slice(0, 3).map(t => (
                            <span key={t} className="text-xs px-1.5 py-0.5 bg-bg-elevated rounded text-text-muted">{t}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge-${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <Icon className="w-3.5 h-3.5" />
                        {p.type}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-brand-blue">+{p.xpReward}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-muted">{p.world?.name?.replace('World ', 'W')}</span>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-text-muted text-sm">No problems match your filters.</div>
          )}
        </div>
      )}
    </div>
  )
}
