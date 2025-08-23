import { createContext, useState, useEffect, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'
import { adminAuth } from '@/app/api'

export interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start with false since we can't check HttpOnly cookies from JavaScript
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const authStatus = await adminAuth.checkAuth()
      setIsAuthenticated(authStatus)
      return authStatus
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
      return false
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const success = await adminAuth.login(username, password)
      if (success) {
        setIsAuthenticated(true)
        // Start session refresh
        startSessionRefresh()
      }
      return success
    } catch (error) {
      console.error('Login failed:', error)
      setIsAuthenticated(false)
      return false
    }
  }

  const stopSessionRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
      refreshIntervalRef.current = null
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    try {
      await adminAuth.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsAuthenticated(false)
      // Stop session refresh
      stopSessionRefresh()
    }
  }, [stopSessionRefresh])

  const startSessionRefresh = useCallback(() => {
    // Clear any existing interval
    stopSessionRefresh()
    
    // Refresh session every 5 minutes to keep HttpOnly cookie alive
    refreshIntervalRef.current = setInterval(async () => {
      if (isAuthenticated) {
        try {
          // Try to refresh the session first
          const refreshSuccess = await adminAuth.refresh()
          if (!refreshSuccess) {
            // If refresh fails, check if still authenticated
            await checkAuth()
          }
        } catch (error) {
          console.error('Session refresh failed:', error)
          // If refresh fails, logout
          await logout()
        }
      }
    }, 5 * 60 * 1000) // 5 minutes
  }, [isAuthenticated, checkAuth, logout, stopSessionRefresh])

  useEffect(() => {
    const initializeAuth = async () => {
      // Always check with server since we use HttpOnly cookies
      await checkAuth()
      
      // Start session refresh if authenticated
      if (isAuthenticated) {
        startSessionRefresh()
      }
      
      setIsLoading(false)
    }

    initializeAuth()

    // Add window focus listener to refresh auth when user returns to tab
    const handleWindowFocus = () => {
      if (isAuthenticated) {
        checkAuth()
      }
    }

    window.addEventListener('focus', handleWindowFocus)

    // Cleanup on unmount
    return () => {
      stopSessionRefresh()
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [isAuthenticated, checkAuth, startSessionRefresh, stopSessionRefresh])

  // Update session refresh when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      startSessionRefresh()
    } else {
      stopSessionRefresh()
    }
  }, [isAuthenticated, startSessionRefresh, stopSessionRefresh])

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 