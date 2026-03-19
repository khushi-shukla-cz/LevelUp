// packages/client/src/pages/AdminPage.jsx
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Users, Code2, Globe, Sword, BarChart3,
  Trash2, Edit2, Loader2, Plus, Search
} from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const TABS = [
  { id: 'overview', label: 'Overview',  icon: BarChart3 },
  { id: 'users',    label: 'Users',     icon: Users },
  { id: 'problems', label: 'Problems',  icon: Code2 },
  { id: 'quests',   label: 'Quests',    icon: Sword },
  { id: 'worlds',   label: 'Worlds',    icon: Globe },
]

function StatBox({ label, value, color }) {
  return (
    <div className="card">
      <p className={`text-3xl font-display font-bold text-${color}`}>{value}</p>
      <p className="text-xs text-text-muted mt-1">{label}</p>
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const params = search ? `?search=${encodeURIComponent(search)}` : ''
    const r = await api.get(`/api/admin/users${params}`)
    setUsers(r.data.users || [])
    setTotal(r.data.total || 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [search])

  const deleteUser = async (id, name) => {
    if (!confirm(`Delete user ${name}? This is irreversible.`)) return
    try {
      await api.delete(`/api/admin/users/${id}`)
      toast.success('User deleted')
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{total} total users</p>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input className="input pl-9 text-sm py-2" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      {loading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-brand-blue" /></div> : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-bg-border">
              <tr>{['Name', 'Email', 'Role', 'Level', 'XP', 'Submissions', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs font-medium text-text-muted px-4 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-bg-border/50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-bg-elevated/40 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-text-muted text-xs font-mono">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('badge', u.role === 'ADMIN' ? 'bg-brand-amber/10 text-brand-amber border-brand-amber/20' : 'bg-bg-elevated text-text-muted border-bg-border')}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{u.level}</td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-blue">{u.xp.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">{u._count?.submissions ?? 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteUser(u.id, u.name)} className="btn-danger py-1 px-2 text-xs">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ProblemsTab() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/admin/problems').then(r => setProblems(r.data.problems || [])).finally(() => setLoading(false))
  }, [])

  const deleteProblem = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return
    try {
      await api.delete(`/api/admin/problems/${id}`)
      toast.success('Problem deleted')
      setProblems(ps => ps.filter(p => p.id !== id))
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-text-muted">{problems.length} problems</p>
        <button className="btn-primary text-xs py-1.5 px-3" disabled>
          <Plus className="w-3.5 h-3.5" /> Add Problem
        </button>
      </div>
      {loading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-brand-blue" /></div> : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-bg-border">
              <tr>{['Title', 'World', 'Type', 'Difficulty', 'XP', 'Submissions', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs font-medium text-text-muted px-4 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-bg-border/50">
              {problems.map(p => (
                <tr key={p.id} className="hover:bg-bg-elevated/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-sm">{p.title}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">{p.world?.name?.replace('World ', 'W')}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">{p.type}</td>
                  <td className="px-4 py-3"><span className={`badge-${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span></td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-blue">{p.xpReward}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">{p._count?.submissions ?? 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteProblem(p.id, p.title)} className="btn-danger py-1 px-2 text-xs">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/api/admin/stats').then(r => setStats(r.data))
  }, [])

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-brand-amber" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold">Admin Panel</h1>
          <p className="text-sm text-text-muted">Platform management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-bg-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={clsx('flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              tab === id ? 'border-brand-blue text-brand-blue' : 'border-transparent text-text-muted hover:text-text-primary'
            )}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {tab === 'overview' && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatBox label="Total Users"     value={stats.users}       color="brand-blue" />
            <StatBox label="Submissions"     value={stats.submissions} color="brand-purple" />
            <StatBox label="Accepted"        value={stats.accepted}    color="brand-green" />
            <StatBox label="Problems"        value={stats.problems}    color="brand-amber" />
            <StatBox label="Quests"          value={stats.quests}      color="brand-cyan" />
            <StatBox label="Active Today"    value={stats.activeToday} color="brand-red" />
          </div>
        )}
        {tab === 'users'    && <UsersTab />}
        {tab === 'problems' && <ProblemsTab />}
        {tab === 'quests'   && <div className="text-center py-12 text-text-muted text-sm">Quest management UI — use API directly or extend this panel.</div>}
        {tab === 'worlds'   && <div className="text-center py-12 text-text-muted text-sm">World management UI — use API directly or extend this panel.</div>}
      </div>
    </div>
  )
}
