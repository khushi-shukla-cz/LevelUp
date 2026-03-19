// packages/client/src/pages/ProfilePage.jsx
import { useAuthStore } from '@/store/authStore'
import { motion } from 'framer-motion'
import { Zap, Flame, Trophy, Code2 } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuthStore()
  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-display font-bold">Profile</h1>
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-2xl font-bold text-white">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-display font-bold">{user?.name}</h2>
          <p className="text-sm text-text-muted">{user?.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="badge bg-brand-blue/10 text-brand-blue border-brand-blue/20">Level {user?.level}</span>
            {user?.selectedPath && <span className="badge bg-bg-elevated text-text-secondary border-bg-border">{user.selectedPath}</span>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Zap,    label: 'Total XP',   value: (user?.xp ?? 0).toLocaleString(),    color: 'brand-blue' },
          { icon: Flame,  label: 'Streak',     value: `${user?.streak ?? 0} days`,          color: 'brand-amber' },
          { icon: Trophy, label: 'Coins',      value: (user?.coins ?? 0).toLocaleString(),  color: 'brand-amber' },
          { icon: Code2,  label: 'Skill Level',value: user?.skillLevel || 'N/A',            color: 'brand-green' },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card text-center"
          >
            <Icon className={`w-5 h-5 text-${color} mx-auto mb-2`} />
            <p className="text-lg font-display font-bold">{value}</p>
            <p className="text-xs text-text-muted">{label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
