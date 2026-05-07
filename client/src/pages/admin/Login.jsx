import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Scissors, Lock } from 'lucide-react'
import api from '../../lib/api'

export function Login() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', { username, password })
      login(data.token)
      navigate('/admin')
    } catch {
      setError(t('admin.login.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-4">
            <Scissors className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal">{t('admin.login.title')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="username">{t('admin.login.username')}</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t('admin.login.password')}</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>
          {error && <p className="text-red-600 text-sm text-center font-medium">{error}</p>}
          <Button type="submit" variant="gold" className="w-full" disabled={loading}>
            <Lock className="w-4 h-4 me-2" />{loading ? '...' : t('admin.login.signIn')}
          </Button>
        </form>
      </div>
    </div>
  )
}
