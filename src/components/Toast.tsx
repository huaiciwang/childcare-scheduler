import { useState, useCallback } from 'react'

interface ToastMessage {
  id: number
  text: string
  type: 'success' | 'warning' | 'info'
}

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, text, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 2500)
  }, [])

  return { toasts, showToast }
}

interface ToastContainerProps {
  toasts: ToastMessage[]
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast ${
            toast.type === 'success' ? 'bg-both text-both-foreground' :
            toast.type === 'warning' ? 'bg-warning text-warning-foreground' :
            'bg-primary text-primary-foreground'
          }`}
        >
          <span className="text-sm">{toast.text}</span>
        </div>
      ))}
    </div>
  )
}
