import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import './Login.css'

const API_BASE_URL = 'http://192.168.124.50:30500/api/auth/login'
const DEFAULT_REDIRECT = '/dashboard'

// Map voor app paths naar hun respectievelijke domeinen
const APP_DOMAINS = {
  '/eutype': 'http://192.168.124.50:30081',
  '/eucloud': 'http://192.168.124.50:30080',
  '/dashboard': 'http://192.168.124.50:30091',
}

function Login() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Lees de redirect parameter uit de URL of gebruik default
      const redirectUrl = searchParams.get('redirect') || DEFAULT_REDIRECT
      
      // Stuur POST request naar backend MET redirect query parameter
      const apiUrl = `${API_BASE_URL}?redirect=${encodeURIComponent(redirectUrl)}`
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // BELANGRIJK: zorgt dat SSO-cookie wordt teruggestuurd
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.detail || data.message || 'Login failed')
      }

      // Login succesvol! Redirect naar de gevraagde app
      // Check of redirect een volledige URL is of een relatief pad
      if (redirectUrl.startsWith('http://') || redirectUrl.startsWith('https://')) {
        // Absolute URL - gebruik direct
        window.location.href = redirectUrl
      } else {
        // Relatief pad - zoek het juiste domein op basis van het pad
        // Extract het basis pad (bvb /eutype/settings -> /eutype)
        const basePath = '/' + redirectUrl.split('/').filter(Boolean)[0]
        const targetDomain = APP_DOMAINS[basePath] || 'http://192.168.124.50:30091'
        
        window.location.href = `${targetDomain}${redirectUrl}`
      }

    } catch (err) {
      setError(err.message || 'Er ging iets mis. Probeer opnieuw.')
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/logo.png" alt="EUsuite Logo" className="logo" />
          <h1>EUsuite</h1>
          <p>Centraal inloggen voor alle EUsuite apps</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">E-mailadres</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
              placeholder="jouw@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Wachtwoord</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                placeholder="Voer je wachtwoord in"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Inloggen...' : 'Inloggen'}
          </button>

          <div className="switch-auth">
            <p>Nog geen account?</p>
            <button 
              type="button" 
              className="switch-button"
              onClick={() => {
                const redirect = searchParams.get('redirect')
                navigate(redirect ? `/register?redirect=${redirect}` : '/register')
              }}
              disabled={loading}
            >
              Registreren
            </button>
          </div>
        </form>

        <div className="login-footer">
          <p>© 2025 EUsuite Platform</p>
          <p className="version">v1.0.0</p>
        </div>
      </div>
    </div>
  )
}

export default Login
