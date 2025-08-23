import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LoginForm } from '@/components/login-form'
import { adminAuth } from '@/app/api'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [debugInfo, setDebugInfo] = useState<string>('')

  const handleLoginSuccess = () => {
    const from = location.state?.from?.pathname || '/admin/dashboard'
    navigate(from, { replace: true })
  }

  const handleDebugAuth = async () => {
    try {
      const isAuth = await adminAuth.checkAuth()
      setDebugInfo(`
        Server Auth Check: ${isAuth ? 'Authenticated' : 'Not authenticated'}
        Note: Using HttpOnly cookies - cannot check from JavaScript
        Cookie will be automatically sent with requests
      `)
    } catch (error) {
      setDebugInfo(`
        Auth Check Error: ${error}
        Note: Using HttpOnly cookies for security
      `)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            OneTee Admin Panel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your admin account
          </p>
        </div>
        
        <LoginForm onLoginSuccess={handleLoginSuccess} />
        
        {/* Debug section - remove in production */}
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <button
            onClick={handleDebugAuth}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Debug Auth State
          </button>
          {debugInfo && (
            <pre className="mt-2 text-xs text-gray-700 whitespace-pre-wrap">
              {debugInfo}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
} 