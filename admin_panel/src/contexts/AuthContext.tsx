import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { adminAuth } from '@/app/api'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async (): Promise<boolean> => {
    try {
      const authStatus = await adminAuth.checkAuth()
      setIsAuthenticated(authStatus)
      return authStatus
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
      return false
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const success = await adminAuth.login(username, password)
      if (success) {
        setIsAuthenticated(true)
      }
      return success
    } catch (error) {
      console.error('Login failed:', error)
      setIsAuthenticated(false)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await adminAuth.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      await checkAuth()
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 