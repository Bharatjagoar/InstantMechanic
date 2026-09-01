import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import BookingsPage from './pages/BookingsPage'
import MechanicsPage from './pages/MechanicsPage'
import CustomersPage from './pages/CustomersPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="mechanics" element={<MechanicsPage />} />
        <Route path="customers" element={<CustomersPage />} />
      </Route>
    </Routes>
  )
}

export default App
