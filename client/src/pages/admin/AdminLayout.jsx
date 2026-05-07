import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AdminNav } from '../../components/admin/AdminNav'

export function AdminLayout() {
  const { isAuth } = useAuth()
  if (!isAuth) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNav />
      <main className="flex-1 overflow-auto p-6 lg:ps-6">
        <Outlet />
      </main>
    </div>
  )
}
