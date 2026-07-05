import { Suspense, lazy } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider, useAuth } from './features/auth'

// Lazy load pages
const SignIn = lazy(() => import('./features/auth/components/SignIn/SignIn'))
const SignUp = lazy(() => import('./features/auth/components/SignUp/SignUp'))
const VerifyEmail = lazy(() => import('./features/auth/components/VerifyEmail/VerifyEmail'))
const Dashboard = lazy(() => import('./features/dashboard/components/Dashboard/Dashboard'))
const MyProfile = lazy(() => import('./features/profile/components/MyProfile/MyProfile'))
const EmployeeProfile = lazy(() => import('./features/profile/components/EmployeeProfile/EmployeeProfile'))
const Attendance = lazy(() => import('./features/attendance/components/Attendance/Attendance'))
const TimeOff = lazy(() => import('./features/leave/components/TimeOff/TimeOff'))

// Loader component for Suspense fallback
const PageLoader = () => (
  <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0f', color: '#f0f0f5', flexDirection: 'column', gap: '16px' }}>
    <div className="w-8 h-8 border-4 border-primary-purple/30 border-t-primary-purple rounded-full animate-spin"></div>
    <p style={{ fontSize: '1rem', fontWeight: 600, color: '#a0a0b8' }}>Loading...</p>
  </div>
)

// ProtectedRoute: Redirect to sign-in if the user is not logged in
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) {
    return <PageLoader />
  }
  if (!token) {
    return <Navigate to="/sign-in" replace />
  }
  return children
}

// PublicRoute: Redirect to dashboard if the user is already logged in
const PublicRoute = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) {
    return <PageLoader />
  }
  if (token) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/sign-in" replace />} />
            <Route
              path="/sign-in"
              element={
                <PublicRoute>
                  <SignIn />
                </PublicRoute>
              }
            />
            <Route
              path="/sign-up"
              element={
                <PublicRoute>
                  <SignUp />
                </PublicRoute>
              }
            />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-profile"
              element={
                <ProtectedRoute>
                  <MyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee/:id"
              element={
                <ProtectedRoute>
                  <EmployeeProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/timeoff"
              element={
                <ProtectedRoute>
                  <TimeOff />
                </ProtectedRoute>
              }
            />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/sign-in" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App
