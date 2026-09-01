import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { RequireAuth } from './components/RequireAuth'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import BookingsPage from './pages/BookingsPage'
import MechanicsPage from './pages/MechanicsPage'
import CustomersPage from './pages/CustomersPage'
import MyBookingsPage from './pages/MyBookingsPage'
import BookServicePage from './pages/BookServicePage'
import MyJobsPage from './pages/MyJobsPage'

function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />

      <Route element={<Layout />}>
        <Route element={<RequireAuth roles={['ops']} />}>
          <Route index element={<DashboardPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="mechanics" element={<MechanicsPage />} />
          <Route path="customers" element={<CustomersPage />} />
        </Route>

        <Route element={<RequireAuth roles={['customer']} />}>
          <Route path="my-bookings" element={<MyBookingsPage />} />
          <Route path="book" element={<BookServicePage />} />
        </Route>

        <Route element={<RequireAuth roles={['mechanic']} />}>
          <Route path="my-jobs" element={<MyJobsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
