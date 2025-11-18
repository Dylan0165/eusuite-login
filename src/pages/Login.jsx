import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import './Login.css'

const API_URL = 'http://192.168.124.50:30500/api/auth/login'
const DEFAULT_REDIRECT = 'http://192.168.124.50:30080'

function Login() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // BELANGRIJK: voor SSO cookie
        body: JSON.stringify({
          username,
          password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Login failed')
      }

      // Login succesvol! Nu redirecten
      const redirectUrl = searchParams.get('redirect') || DEFAULT_REDIRECT
      
      // Redirect naar de gevraagde app (of EuCloud als default)
      window.location.href = redirectUrl

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
            <label htmlFor="username">Gebruikersnaam</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
              placeholder="Voer je gebruikersnaam in"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Wachtwoord</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
              placeholder="Voer je wachtwoord in"
            />
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
