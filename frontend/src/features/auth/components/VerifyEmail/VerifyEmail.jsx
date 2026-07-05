import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { verifyEmailFn } from '../../api/auth.api'

function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const effectRan = useRef(false)

  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('Verifying your email address. Please wait...')

  useEffect(() => {
    if (!token) {
      // Don't set effectRan.current to true if there's no token yet,
      // as it might be loading/parsing the URL.
      setStatus('error')
      setMessage('Missing verification token. Please use the link sent to your email.')
      return
    }

    // Avoid double execution in React 18 StrictMode when token is present
    if (effectRan.current) return
    effectRan.current = true

    const verify = async () => {
      try {
        const response = await verifyEmailFn(token)
        if (response.success) {
          setStatus('success')
          setMessage(response.message || 'Your email has been verified successfully!')
        } else {
          setStatus('error')
          setMessage(response.message || 'Verification failed. The link might be invalid or expired.')
        }
      } catch (err) {
        console.error('Email verification error:', err)
        const errMsg = err?.response?.data?.message || 'An error occurred during verification. Please try again.'
        setStatus('error')
        setMessage(errMsg)
      }
    }

    verify()
  }, [token])

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center relative overflow-hidden p-5 z-10">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        <div className="absolute rounded-full blur-[80px] opacity-40 animate-pulse w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(168,85,247,0.3),transparent_70%)] -top-[100px] -right-[100px]"></div>
        <div className="absolute rounded-full blur-[80px] opacity-40 animate-pulse w-[350px] h-[350px] bg-[radial-gradient(circle,rgba(217,70,239,0.25),transparent_70%)] -bottom-[80px] -left-[80px]"></div>
      </div>

      <div className="w-full max-w-[480px] relative z-10">
        <div className="bg-[#13131a]/70 backdrop-blur-md border border-white/8 rounded-2xl p-10 shadow-card text-center relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-primary">
          <div className="mb-[30px]">
            <h1 className="text-[2.2rem] font-extrabold tracking-tight text-text-primary">HR<span className="bg-gradient-primary bg-clip-text text-transparent">MS</span></h1>
          </div>

          <div className="mt-2.5">
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-5">
                <div className="absolute w-20 h-20 bg-[radial-gradient(circle,rgba(217,70,239,0.2),transparent_70%)] blur-[8px] animate-pulse"></div>
                <div className="w-16 h-16 border-4 border-primary-purple/10 border-l-primary-purple border-r-primary-pink rounded-full animate-spin relative z-10"></div>
                <h2 className="text-[1.6rem] font-bold text-text-primary mt-2">Verifying Email</h2>
                <p className="text-text-secondary text-[1rem] leading-relaxed max-w-[320px]">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center gap-5">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(0,0,0,0.2)] bg-status-success/10 border-2 border-status-success text-status-success shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h2 className="text-[1.6rem] font-bold text-text-primary mt-2">Verification Success</h2>
                <p className="text-text-secondary text-[1rem] leading-relaxed max-w-[320px]">{message}</p>
                <button className="w-full bg-gradient-primary hover:bg-gradient-hover text-white rounded-md text-[1rem] font-semibold transition-all duration-200 shadow-button hover:shadow-button-hover hover:-translate-y-0.5 active:translate-y-0 mt-3.5 flex items-center justify-center h-12" onClick={() => navigate('/sign-in')}>
                  Proceed to Sign In
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center gap-5">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(0,0,0,0.2)] bg-status-error/10 border-2 border-status-error text-status-error shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
                <h2 className="text-[1.6rem] font-bold text-text-primary mt-2">Verification Failed</h2>
                <p className="text-text-secondary text-[1rem] leading-relaxed max-w-[320px]">{message}</p>
                <Link to="/sign-in" className="w-full bg-white/5 border border-white/10 text-text-primary rounded-md text-[1rem] font-semibold transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 active:translate-y-0 mt-3.5 flex items-center justify-center h-12">
                  Back to Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
