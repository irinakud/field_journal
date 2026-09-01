import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/ToastProvider'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const { login, register } = useAuth()
  const { toast } = useToast()
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  const validate = () => {
    const e: Partial<typeof form> = {}
    if (mode === 'register' && !form.username.trim()) e.username = 'Username is required'
    if (!form.email.includes('@')) e.email = 'Valid email is required'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    return e
  }

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.username, form.email, form.password)
      }
      toast({ title: mode === 'login' ? 'Welcome back!' : 'Account created!', variant: 'success' })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Something went wrong'
      toast({ title: 'Error', description: msg, variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          {mode === 'login' ? 'Log nature observations with the community.' : 'Join Field Journal today.'}
        </p>

        <form onSubmit={handle} className="flex flex-col gap-4">
          {mode === 'register' && (
            <Input
              label="Username"
              value={form.username}
              onChange={set('username')}
              error={errors.username}
              placeholder="naturelover42"
              autoComplete="username"
            />
          )}
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            placeholder="••••••••"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">
            {mode === 'login' ? 'Sign in' : 'Register'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="font-medium text-emerald-600 hover:underline"
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
