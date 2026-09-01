import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './components/ui/ToastProvider'
import Navbar from './components/Navbar'
import AuthPage from './pages/AuthPage'
import JournalPage from './pages/JournalPage'

function AppContent() {
  const { isAuthenticated } = useAuth()
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {isAuthenticated ? <JournalPage /> : <AuthPage />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  )
}
