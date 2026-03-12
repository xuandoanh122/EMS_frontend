import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginPage() {
  const navigate = useNavigate()

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
              <button
                onClick={() => navigate('/')}
                className="w-full h-10 rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Tiếp tục (Bỏ qua đăng nhập)
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
