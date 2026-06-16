import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/auth'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const login = useAuthStore((s) => s.login)
  const location = useLocation()
  const { isSignedIn, getToken } = useAuth()
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (isSignedIn && !isAuthenticated && !syncing) {
      setSyncing(true)
      getToken().then((token) => {
        if (!token) return
        authService.syncUser('', '', '').then((res) => {
          login(res.user, res.token, res.refreshToken)
        }).catch(() => {
          setSyncing(false)
        })
      }).catch(() => {
        setSyncing(false)
      })
    }
  }, [isSignedIn, isAuthenticated, syncing, getToken, login])

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return <>{children}</>
}
