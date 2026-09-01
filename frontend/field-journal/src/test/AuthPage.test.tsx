import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../components/ui/ToastProvider'
import AuthPage from '../pages/AuthPage'
import * as client from '../api/client'

vi.mock('../api/client', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
  },
  observationsApi: {
    getAll: vi.fn().mockResolvedValue({ data: [] }),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  default: { interceptors: { request: { use: vi.fn() } } },
}))

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  )
}

describe('AuthPage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders sign-in form by default', () => {
    render(<AuthPage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('switches to register mode', () => {
    render(<AuthPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /register/i }))
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    render(<AuthPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/valid email is required/i)).toBeInTheDocument()
    })
  })

  it('calls login with credentials', async () => {
    const mockLogin = vi.mocked(client.authApi.login).mockResolvedValueOnce({
      data: { token: 'tok', username: 'alice', email: 'alice@example.com' },
    } as never)

    render(<AuthPage />, { wrapper: Wrapper })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'alice@example.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('alice@example.com', 'password123'))
  })
})
