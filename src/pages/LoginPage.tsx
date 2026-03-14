import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth.store'

export function LoginPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, setAuth } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'teacher' ? '/teacher/dashboard' : '/admin/dashboard', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const handleDemoLogin = (role: 'admin' | 'teacher') => {
    const demoUser = {
      id: role === 'admin' ? 1 : 2,
      username: role === 'admin' ? 'admin.demo' : 'teacher.demo',
      full_name: role === 'admin' ? 'Admin Demo' : 'Teacher Demo',
      role,
    }
    setAuth(demoUser, 'dev-token')
    navigate(role === 'teacher' ? '/teacher/dashboard' : '/admin/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg mb-4">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">EMS</h1>
          <p className="text-sm text-gray-500">Hệ thống Quản lý Giáo dục</p>
        </div>

        <Card className="shadow-md">
          <CardHeader className="text-center">
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>
              Tính năng xác thực đang được phát triển.
              <br />
              Vui lòng bấm nút bên dưới để tiếp tục.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                <strong>Lưu ý:</strong> Module Auth (JWT/OAuth2) chưa được triển khai ở backend.
                Khi API auth sẵn sàng, form đăng nhập sẽ được kết nối tại đây.
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => handleDemoLogin('admin')}
                  className="w-full h-10 rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Tiếp tục như Admin
                </button>
                <button
                  onClick={() => handleDemoLogin('teacher')}
                  className="w-full h-10 rounded-md border border-blue-200 bg-white text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  Tiếp tục như Giáo viên
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
