// packages/client/src/components/layout/AppLayout.jsx
import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Globe, Sword, Code2, Map, BarChart3,
  Trophy, TreePine, User, Shield, LogOut, Menu, X, Zap, Flame
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { clsx } from 'clsx'

const NAV = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/worlds',      icon: Globe,           label: 'Worlds' },
  { to: '/quests',      icon: Sword,           label: 'Quests' },
  { to: '/problems',    icon: Code2,           label: 'Problems' },
  { to: '/skill-tree',  icon: TreePine,        label: 'Skill Tree' },
  { to: '/leaderboard', icon: Trophy,          label: 'Leaderboard' },
  { to: '/analytics',   icon: BarChart3,       label: 'Analytics' },
]

function XPBar({ xp, level }) {
  // XP needed per level: 100 * level^1.5
  const xpForLvl = (l) => Math.floor(100 * Math.pow(l, 1.5))
  const total = (l) => { let t = 0; for (let i = 1; i < l; i++) t += xpForLvl(i); return t; }
  const currentXP = xp - total(level)
  const neededXP  = xpForLvl(level)
  const pct = Math.min(100, Math.round((currentXP / neededXP) * 100))

  return (
    <div className="px-3 py-2 bg-bg-secondary rounded-xl border border-bg-border">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-text-muted font-mono">Level {level}</span>
        <span className="text-xs text-brand-blue font-mono">{currentXP}/{neededXP} XP</span>
      </div>
      <div className="xp-bar-track">
        <motion.div
          className="xp-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function Sidebar({ collapsed, onClose }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className={clsx(
      'flex flex-col h-full bg-bg-secondary border-r border-bg-border',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-bg-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg gradient-text">LevelUp</span>
        )}
      </div>

      {/* XP Bar */}
      {!collapsed && user && (
        <div className="px-3 pt-4">
          <XPBar xp={user.xp} level={user.level} />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={onClose}>
            {({ isActive }) => (
              <div className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer',
                isActive
                  ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
                collapsed && 'justify-center'
              )}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </div>
            )}
          </NavLink>
        ))}

        {user?.role === 'ADMIN' && (
          <NavLink to="/admin" onClick={onClose}>
            {({ isActive }) => (
              <div className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer mt-2 border',
                isActive
                  ? 'bg-brand-amber/10 text-brand-amber border-brand-amber/20'
                  : 'text-brand-amber/60 hover:text-brand-amber border-brand-amber/10 hover:bg-brand-amber/5',
                collapsed && 'justify-center'
              )}>
                <Shield className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>Admin</span>}
              </div>
            )}
          </NavLink>
        )}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-bg-border space-y-1">
        <NavLink to="/profile" onClick={onClose}>
          {({ isActive }) => (
            <div className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all',
              isActive ? 'bg-bg-elevated text-text-primary' : 'hover:bg-bg-elevated text-text-secondary hover:text-text-primary',
              collapsed && 'justify-center'
            )}>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-text-muted">Lv.{user?.level}</p>
                </div>
              )}
            </div>
          )}
        </NavLink>

        <button
          onClick={handleLogout}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-muted hover:text-brand-red hover:bg-brand-red/5 transition-all cursor-pointer',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}

function TopBar({ user, onMenuClick }) {
  return (
    <header className="h-14 bg-bg-secondary/80 backdrop-blur border-b border-bg-border flex items-center justify-between px-4 sticky top-0 z-30">
      <button onClick={onMenuClick} className="lg:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-elevated transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      {/* Stats pill */}
      <div className="flex items-center gap-2">
        {/* Streak */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-elevated rounded-full border border-bg-border">
          <Flame className="w-3.5 h-3.5 text-brand-amber animate-streak-fire" />
          <span className="text-xs font-mono font-medium text-brand-amber">{user?.streak ?? 0}</span>
        </div>

        {/* Coins */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-elevated rounded-full border border-bg-border">
          <span className="text-xs">🪙</span>
          <span className="text-xs font-mono font-medium text-brand-amber">{(user?.coins ?? 0).toLocaleString()}</span>
        </div>

        {/* XP */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-brand-blue/10 rounded-full border border-brand-blue/20">
          <Zap className="w-3.5 h-3.5 text-brand-blue" />
          <span className="text-xs font-mono font-medium text-brand-blue">{(user?.xp ?? 0).toLocaleString()} XP</span>
        </div>
      </div>
    </header>
  )
}

export default function AppLayout() {
  const { user } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar collapsed={false} onClose={() => {}} />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full z-50 w-64 lg:hidden"
            >
              <div className="relative h-full">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-4 right-4 p-1.5 text-text-secondary hover:text-text-primary rounded-lg z-10"
                >
                  <X className="w-4 h-4" />
                </button>
                <Sidebar collapsed={false} onClose={() => setMobileOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
