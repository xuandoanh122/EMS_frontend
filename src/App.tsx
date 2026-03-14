import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/sonner'
import { AdminLayout } from '@/components/layout/AppLayout'
import { TeacherLayout } from '@/components/layout/TeacherLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { TeacherPortalPage } from '@/pages/TeacherPortalPage'
import { StudentsPage } from '@/pages/StudentsPage'
import { TeachersPage } from '@/pages/TeachersPage'
import { ClassroomsPage } from '@/pages/ClassroomsPage'
import { GradingPage } from '@/pages/GradingPage'
import { SalaryPage } from '@/pages/SalaryPage'
import { LoginPage } from '@/pages/LoginPage'
import { useAuthStore } from '@/stores/auth.store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

type Role = 'admin' | 'teacher' | 'accountant' | 'student'
const ADMIN_ROLES: Role[] = ['admin', 'accountant']
const TEACHER_ROLES: Role[] = ['teacher']

function getHomePath(role: Role) {
  if (role === 'teacher') return '/teacher/dashboard'
  if (ADMIN_ROLES.includes(role)) return '/admin/dashboard'
  return '/login'
}

function RequireRole({ allow }: { allow: Role[] }) {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  if (!allow.includes(user.role)) return <Navigate to={getHomePath(user.role)} replace />
  return <Outlet />
}

function AuthRedirect() {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  return <Navigate to={getHomePath(user.role)} replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AuthRedirect />} />
          <Route element={<RequireRole allow={ADMIN_ROLES} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="classrooms" element={<ClassroomsPage />} />
              <Route path="grading" element={<GradingPage />} />
              <Route path="salary" element={<SalaryPage />} />
            </Route>
          </Route >
          <Route element={<RequireRole allow={TEACHER_ROLES} />}>
            <Route path="/teacher" element={<TeacherLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TeacherPortalPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes >
      </BrowserRouter >
      <Toaster position="top-right" richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider >
  )
}
