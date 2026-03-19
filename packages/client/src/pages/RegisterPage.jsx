// packages/client/src/pages/RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const requirements = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains a number', test: (p) => /\d/.test(p) },
]

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Let\'s set up your path.')
      navigate('/onboarding')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">LevelUp</span>
        </Link>

        <div className="card">
          <h1 className="text-xl font-display font-bold mb-1">Create your account</h1>
          <p className="text-sm text-text-secondary mb-6">Join and start your engineering journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-text-secondary mb-1.5 block">Display name</label>
              <input type="text" className="input" placeholder="Your name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required minLength={2} maxLength={50}
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1.5 block">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} className="input pr-10"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  {requirements.map(({ label, test }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3 h-3 ${test(form.password) ? 'text-brand-green' : 'text-text-muted'}`} />
                      <span className={`text-xs ${test(form.password) ? 'text-brand-green' : 'text-text-muted'}`}>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-2.5 disabled:opacity-50 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-blue hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
