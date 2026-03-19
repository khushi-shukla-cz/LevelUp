// packages/client/src/pages/SkillTreePage.jsx
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { TreePine, Lock, CheckCircle2, Loader2, Zap } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const CATEGORY_COLORS = {
  DSA:     { stroke: '#3B82F6', fill: '#1D3A6A', text: '#3B82F6' },
  BACKEND: { stroke: '#22C55E', fill: '#14532D', text: '#22C55E' },
  FRONTEND:{ stroke: '#8B5CF6', fill: '#3B1D6A', text: '#8B5CF6' },
  SYSTEM:  { stroke: '#F59E0B', fill: '#6A3B1D', text: '#F59E0B' },
  AI:      { stroke: '#06B6D4', fill: '#0C4A6E', text: '#06B6D4' },
}

function SkillNode({ node, onUnlock, userXP }) {
  const [hovering, setHovering] = useState(false)
  const colors = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.DSA
  const unlocked = node.userStatus?.unlocked
  const canUnlock = !unlocked && userXP >= node.unlockXP

  return (
    <g
      transform={`translate(${node.xPosition}, ${node.yPosition})`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ cursor: canUnlock ? 'pointer' : 'default' }}
      onClick={() => canUnlock && onUnlock(node)}
    >
      {/* Glow ring for unlocked */}
      {unlocked && (
        <circle r="28" fill="none" stroke={colors.stroke} strokeWidth="1.5" strokeOpacity="0.3" />
      )}

      {/* Main circle */}
      <circle
        r="24"
        fill={unlocked ? colors.fill : '#161D2B'}
        stroke={unlocked ? colors.stroke : canUnlock ? colors.stroke : '#1E2A3A'}
        strokeWidth={hovering ? 2.5 : 2}
        strokeOpacity={unlocked ? 1 : canUnlock ? 0.6 : 0.3}
        style={{ transition: 'all 0.2s' }}
      />

      {/* Icon / lock */}
      <text x="0" y="5" textAnchor="middle" fontSize="16" style={{ userSelect: 'none' }}>
        {unlocked ? node.icon : canUnlock ? node.icon : '🔒'}
      </text>

      {/* Label */}
      <text x="0" y="38" textAnchor="middle" fontSize="10" fill={unlocked ? colors.text : '#4B5563'}
        fontFamily="Space Grotesk, sans-serif" fontWeight="600"
      >
        {node.name.length > 12 ? node.name.slice(0, 11) + '…' : node.name}
      </text>

      {/* XP badge */}
      {!unlocked && (
        <g transform="translate(0, -28)">
          <rect x="-18" y="-8" width="36" height="14" rx="7" fill="#080C14" stroke="#1E2A3A" strokeWidth="1" />
          <text x="0" y="3" textAnchor="middle" fontSize="8" fill="#3B82F6" fontFamily="JetBrains Mono, monospace">
            {node.unlockXP} XP
          </text>
        </g>
      )}

      {/* Hover tooltip */}
      {hovering && (
        <g transform="translate(30, -20)">
          <rect x="0" y="0" width="130" height="44" rx="6" fill="#111827" stroke="#1E2A3A" strokeWidth="1" />
          <text x="8" y="16" fontSize="10" fill="#F0F4FF" fontFamily="Space Grotesk, sans-serif" fontWeight="600">{node.name}</text>
          <text x="8" y="30" fontSize="9" fill="#94A3B8" fontFamily="Inter, sans-serif">{node.description?.slice(0, 30)}...</text>
        </g>
      )}
    </g>
  )
}

export default function SkillTreePage() {
  const { user, updateUser } = useAuthStore()
  const [nodes, setNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const svgRef = useRef(null)

  useEffect(() => {
    api.get('/api/users/me/skill-tree').then(r => setNodes(r.data.nodes || [])).finally(() => setLoading(false))
  }, [])

  const handleUnlock = async (node) => {
    try {
      await api.post(`/api/users/me/skill-tree/${node.id}/unlock`)
      toast.success(`${node.name} unlocked!`)
      // Refresh nodes
      const r = await api.get('/api/users/me/skill-tree')
      setNodes(r.data.nodes || [])
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot unlock yet')
    }
  }

  const categories = ['All', ...new Set(nodes.map(n => n.category))]
  const filtered = selectedCategory === 'All' ? nodes : nodes.filter(n => n.category === selectedCategory)

  const unlockedCount = nodes.filter(n => n.userStatus?.unlocked).length

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-7 h-7 text-brand-blue animate-spin" /></div>

  // Compute SVG viewport
  const maxX = Math.max(...nodes.map(n => n.xPosition), 0) + 80
  const maxY = Math.max(...nodes.map(n => n.yPosition), 0) + 80

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <TreePine className="w-6 h-6 text-brand-green" /> Skill Tree
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {unlockedCount} / {nodes.length} skills unlocked · {(user?.xp ?? 0).toLocaleString()} XP total
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 bg-brand-blue/10 rounded-xl border border-brand-blue/20">
          <Zap className="w-4 h-4 text-brand-blue" />
          <span className="text-sm font-mono text-brand-blue font-medium">{(user?.xp ?? 0).toLocaleString()} XP</span>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const colors = CATEGORY_COLORS[cat]
          return (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                selectedCategory === cat
                  ? 'text-white border-transparent'
                  : 'bg-bg-elevated border-bg-border text-text-secondary hover:text-text-primary'
              )}
              style={selectedCategory === cat && colors ? { background: colors.stroke, borderColor: colors.stroke } : {}}
            >{cat}</button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-text-muted">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-brand-blue" /> Unlocked</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-bg-elevated border border-brand-blue/50" /> Can unlock</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-bg-elevated border border-bg-border" /> Locked</span>
        <span>Click a node to unlock it (costs XP)</span>
      </div>

      {/* SVG Tree */}
      <div className="card p-0 overflow-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${maxX + 50} ${maxY + 50}`}
          width="100%"
          style={{ minHeight: 500, background: 'transparent' }}
        >
          {/* Connection lines */}
          {filtered.map(node =>
            node.prerequisites.map(preId => {
              const pre = nodes.find(n => n.id === preId)
              if (!pre || (selectedCategory !== 'All' && pre.category !== selectedCategory)) return null
              return (
                <line key={`${preId}-${node.id}`}
                  x1={pre.xPosition} y1={pre.yPosition}
                  x2={node.xPosition} y2={node.yPosition}
                  stroke="#1E2A3A" strokeWidth="1.5" strokeDasharray="4 3"
                />
              )
            })
          )}

          {/* Nodes */}
          {filtered.map(node => (
            <SkillNode key={node.id} node={node} onUnlock={handleUnlock} userXP={user?.xp ?? 0} />
          ))}
        </svg>
      </div>

      {/* Node list */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(node => {
          const colors = CATEGORY_COLORS[node.category] || CATEGORY_COLORS.DSA
          const unlocked = node.userStatus?.unlocked
          const canUnlock = !unlocked && (user?.xp ?? 0) >= node.unlockXP
          return (
            <div key={node.id}
              className={clsx(
                'flex items-center gap-3 p-3 rounded-xl border transition-all',
                unlocked ? 'border-opacity-30 bg-opacity-5' : canUnlock ? 'border-bg-border hover:border-opacity-50 cursor-pointer' : 'border-bg-border opacity-50',
              )}
              style={{ borderColor: unlocked ? colors.stroke : undefined, backgroundColor: unlocked ? `${colors.fill}44` : undefined }}
              onClick={() => canUnlock && handleUnlock(node)}
            >
              <span className="text-xl">{node.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: unlocked ? colors.text : undefined }}>{node.name}</p>
                <p className="text-xs text-text-muted">{node.unlockXP} XP required</p>
              </div>
              {unlocked
                ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: colors.stroke }} />
                : <Lock className="w-4 h-4 text-text-muted flex-shrink-0" />
              }
            </div>
          )
        })}
      </div>
    </div>
  )
}
