import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'

export function ChangePasswordPage() {
    const navigate = useNavigate()
    const { logout, setMustChangePassword } = useAuthStore()
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!newPassword.trim()) {
            setError('Vui lòng nhập mật khẩu mới')
            return
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp')
            return
        }

        setIsLoading(true)
        try {
            const response = await authApi.changePassword({ new_password: newPassword })

            if (response.data?.success) {
                toast.success('Đổi mật khẩu thành công!')
                setMustChangePassword(false)

                // Navigate based on role
                const user = useAuthStore.getState().user
                const redirectPath = user?.role === 'teacher' ? '/teacher/dashboard' : '/admin/dashboard'
                navigate(redirectPath, { replace: true })
            } else {
                setError(response.data?.message || 'Đổi mật khẩu thất bại')
            }
        } catch (error: any) {
            // Error toast is already shown by API interceptor
            // Just show a form-level error for user awareness
            setError('Đổi mật khẩu thất bại. Vui lòng thử lại.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = async () => {
        await logout()
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
                        <div className="flex justify-center mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                                <Lock className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <CardTitle>Đổi mật khẩu</CardTitle>
                        <CardDescription>
                            Đây là lần đầu bạn đăng nhập. Vui lòng đổi mật khẩu để tiếp tục.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                                    Mật khẩu mới
                                </label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Nhập mật khẩu mới"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        disabled={isLoading}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                    Xác nhận mật khẩu
                                </label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Nhập lại mật khẩu mới"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                            <div className="text-xs text-gray-500">
                                Mật khẩu phải có ít nhất 6 ký tự
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Đổi mật khẩu'
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={handleLogout}
                                disabled={isLoading}
                            >
                                Đăng xuất
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
