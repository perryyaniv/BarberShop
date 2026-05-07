import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CustomerProvider } from './context/CustomerContext'
import { HomePage } from './pages/HomePage'
import { BookPage } from './pages/BookPage'
import { CustomerLoginPage } from './pages/CustomerLoginPage'
import { MyAppointmentsPage } from './pages/MyAppointmentsPage'
import { Login } from './pages/admin/Login'
import { AdminLayout } from './pages/admin/AdminLayout'
import { Dashboard } from './pages/admin/Dashboard'
import { Appointments } from './pages/admin/Appointments'
import { Services } from './pages/admin/Services'
import { Hours } from './pages/admin/Hours'
import { Blocked } from './pages/admin/Blocked'
import { Customers } from './pages/admin/Customers'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomerProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<CustomerLoginPage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/my-appointments" element={<MyAppointmentsPage />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="services" element={<Services />} />
              <Route path="hours" element={<Hours />} />
              <Route path="blocked" element={<Blocked />} />
              <Route path="customers" element={<Customers />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CustomerProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
