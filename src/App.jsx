import React from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import TutorRegister from './pages/TutorRegister'
import Profile from './pages/Profile'
import Search from './pages/Search'
import TutorDetails from './pages/TutorDetails'
import BookLesson from './pages/BookLesson'
import Lessons from './pages/Lessons'
import Recordings from './pages/Recordings'
import Reviews from './pages/Reviews'
import Payments from './pages/Payments'

// Tutor pages
import TutorDashboard from './pages/tutor/Dashboard'
import TutorProfile from './pages/tutor/Profile'
import TutorAvailability from './pages/tutor/Availability'
import TutorLessons from './pages/tutor/Lessons'
import TutorRecordings from './pages/tutor/Recordings'
import TutorEarnings from './pages/tutor/Earnings'
import TutorReviews from './pages/tutor/Reviews'

// Admin pages
import AdminUsers from './pages/admin/Users'
import AdminLessons from './pages/admin/Lessons'
import AdminPayments from './pages/admin/Payments'
import Meeting from './pages/Meeting'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

function RoleRoute({ children, allow }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" />
  if (!allow.includes(user?.role)) return <Navigate to="/" />
  return children
}

// Convenience wrappers
const StudentRoute = ({ children }) => <RoleRoute allow={['student']}>{children}</RoleRoute>
const TutorRoute   = ({ children }) => <RoleRoute allow={['tutor']}>{children}</RoleRoute>
const AdminRoute   = ({ children }) => <RoleRoute allow={['admin']}>{children}</RoleRoute>

function Layout({ children }) {
  const { token, user, logout } = useAuth()
  const role = user?.role

  const loggedOut = (
    <>
      <Link to="/register">Student Signup</Link>
      <Link to="/register-tutor">Tutor Signup</Link>
      <Link to="/login">Login</Link>
    </>
  )

  const studentMenu = (
    <>
      <Link to="/search">Find Tutors</Link>
      <Link to="/lessons">My Lessons</Link>
      <Link to="/payments">Payments</Link>
      <Link to="/recordings">Recordings</Link>
      <Link to="/profile">Profile</Link>
      <button onClick={logout} className="px-3 py-1 rounded bg-gray-200">Logout</button>
    </>
  )

  const tutorMenu = (
    <>
      <Link to="/tutor">Tutor</Link>
      <Link to="/tutor/lessons">Lessons</Link>
      <Link to="/tutor/availability">Availability</Link>
      <Link to="/tutor/recordings">Recordings</Link>
      <Link to="/tutor/earnings">Earnings</Link>
      <Link to="/tutor/profile">Profile</Link>
      <button onClick={logout} className="px-3 py-1 rounded bg-gray-200">Logout</button>
    </>
  )

  const adminMenu = (
    <>
      <Link to="/admin/users">Users</Link>
      <Link to="/admin/lessons">Lessons</Link>
      <Link to="/admin/payments">Payments</Link>
      <button onClick={logout} className="px-3 py-1 rounded bg-gray-200">Logout</button>
    </>
  )

  const menu = !token ? loggedOut : role === 'student' ? studentMenu : role === 'tutor' ? tutorMenu : adminMenu

  return (
    <div className="max-w-5xl mx-auto p-4">
      <nav className="flex items-center justify-between py-4">
        <Link to="/" className="font-bold text-xl">LMS</Link>
        <div className="space-x-4">{menu}</div>
      </nav>
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/search" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-tutor" element={<TutorRegister />} />

          {/* Student */}
          <Route path="/search" element={<StudentRoute><Search /></StudentRoute>} />
          <Route path="/tutor/:id" element={<StudentRoute><TutorDetails /></StudentRoute>} />
          <Route path="/book/:tutorId" element={<StudentRoute><BookLesson /></StudentRoute>} />
          <Route path="/lessons" element={<StudentRoute><Lessons /></StudentRoute>} />
          <Route path="/recordings" element={<StudentRoute><Recordings /></StudentRoute>} />
          {/* <Route path="/recordings" element={<PrivateRoute><Recordings /></PrivateRoute>} /> */}
          <Route path="/profile" element={<StudentRoute><Profile /></StudentRoute>} />
          <Route path="/reviews" element={<StudentRoute><Reviews /></StudentRoute>} />
          <Route path="/payments" element={<StudentRoute><Payments /></StudentRoute>} />
          <Route path="/meeting/:lessonId" element={<Meeting />} />
          {/* Tutor */}
          <Route path="/tutor" element={<TutorRoute><TutorDashboard /></TutorRoute>} />
          <Route path="/tutor/profile" element={<TutorRoute><TutorProfile /></TutorRoute>} />
          <Route path="/tutor/availability" element={<TutorRoute><TutorAvailability /></TutorRoute>} />
          <Route path="/tutor/lessons" element={<TutorRoute><TutorLessons /></TutorRoute>} />
          <Route path="/tutor/recordings" element={<TutorRoute><TutorRecordings /></TutorRoute>} />
          {/* <Route path="/tutor/recordings" element={<PrivateRoute><TutorRecordings /></PrivateRoute>} /> */}
          <Route path="/tutor/earnings" element={<TutorRoute><TutorEarnings /></TutorRoute>} />
          <Route path="/tutor/reviews" element={<TutorRoute><TutorReviews /></TutorRoute>} />

          {/* Admin */}
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/lessons" element={<AdminRoute><AdminLessons /></AdminRoute>} />
          <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}