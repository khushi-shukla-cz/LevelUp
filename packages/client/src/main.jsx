// packages/client/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

// Sentry (optional, enabled when VITE_SENTRY_DSN is set)
let Sentry
try {
  // lazy import so builds without Sentry still work
  Sentry = await import('@sentry/react')
  const { BrowserTracing } = await import('@sentry/tracing')
  const dsn = import.meta.env.VITE_SENTRY_DSN || ''
  const release = import.meta.env.VITE_SENTRY_RELEASE || import.meta.env.VITE_COMMIT_SHA || ''
  if (dsn) {
    Sentry.init({
      dsn,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 0.02,
      release,
    })
  } else {
    Sentry = null
  }
} catch (e) {
  Sentry = null
}

const root = ReactDOM.createRoot(document.getElementById('root'))

function AppRoot() {
  if (Sentry && Sentry.ErrorBoundary) {
    const Fallback = ({ error }) => <div>Something went wrong.</div>
    return (
      <Sentry.ErrorBoundary fallback={Fallback}>
        <App />
      </Sentry.ErrorBoundary>
    )
  }
  return <App />
}

root.render(
  <React.StrictMode>
    <AppRoot />
  </React.StrictMode>
)
