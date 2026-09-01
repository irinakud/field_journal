import * as Toast from '@radix-ui/react-toast'
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface ToastMessage {
  id: string
  title: string
  description?: string
  variant?: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  toast: (msg: Omit<ToastMessage, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const toast = useCallback((msg: Omit<ToastMessage, 'id'>) => {
    setMessages((prev) => [...prev, { ...msg, id: crypto.randomUUID() }])
  }, [])

  const remove = (id: string) => setMessages((prev) => prev.filter((m) => m.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      <Toast.Provider swipeDirection="right">
        {children}
        {messages.map((m) => (
          <Toast.Root
            key={m.id}
            open
            onOpenChange={(open) => { if (!open) remove(m.id) }}
            className={clsx(
              'flex items-start gap-3 rounded-xl p-4 shadow-lg border',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full',
              m.variant === 'error' ? 'bg-red-50 border-red-200' :
              m.variant === 'success' ? 'bg-emerald-50 border-emerald-200' :
              'bg-white border-gray-200',
            )}
          >
            <div className="flex-1">
              <Toast.Title className="text-sm font-semibold text-gray-900">{m.title}</Toast.Title>
              {m.description && (
                <Toast.Description className="mt-0.5 text-sm text-gray-600">{m.description}</Toast.Description>
              )}
            </div>
            <Toast.Close className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2" />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
