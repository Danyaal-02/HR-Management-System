import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import SignIn from './pages/SignIn/SignIn'
import SignUp from './pages/SignUp/SignUp'
import VerifyEmail from './pages/VerifyEmail/VerifyEmail'
import Dashboard from './pages/Dashboard/Dashboard'
import MyProfile from './pages/MyProfile/MyProfile'
import EmployeeProfile from './pages/EmployeeProfile/EmployeeProfile'
import Attendance from './pages/Attendance/Attendance'
import TimeOff from './pages/TimeOff/TimeOff'

import { useAuth } from './context/AuthContext'

// ProtectedRoute: Redirect to sign-in if the user is not logged in
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0f', color: '#f0f0f5' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading Session...</p>
      </div>
    )
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
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0f', color: '#f0f0f5' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading Session...</p>
      </div>
    )
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
      </Router>
    </AuthProvider>
  )
}

export default App
