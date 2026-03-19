// packages/client/src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="text-8xl mb-6">🌌</div>
        <h1 className="text-4xl font-display font-bold gradient-text mb-3">404</h1>
        <p className="text-xl font-display font-semibold mb-2">Page Not Found</p>
        <p className="text-text-secondary mb-8">This page doesn't exist in any of the four worlds.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-secondary"><Home className="w-4 h-4" /> Home</Link>
          <Link to="/dashboard" className="btn-primary"><ArrowLeft className="w-4 h-4" /> Dashboard</Link>
        </div>
      </motion.div>
    </div>
  )
}
