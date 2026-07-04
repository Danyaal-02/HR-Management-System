import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import SignIn from './pages/SignIn/SignIn'
import SignUp from './pages/SignUp/SignUp'
import Dashboard from './pages/Dashboard/Dashboard'
import MyProfile from './pages/MyProfile/MyProfile'
import EmployeeProfile from './pages/EmployeeProfile/EmployeeProfile'
import Attendance from './pages/Attendance/Attendance'
import TimeOff from './pages/TimeOff/TimeOff'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/sign-in" replace />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/employee/:id" element={<EmployeeProfile />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/timeoff" element={<TimeOff />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/sign-in" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
