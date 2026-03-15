import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, ArrowLeft, Loader2, Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { authApi } from '@/api/auth.api'
import { toast } from 'sonner'

export function ForgotPasswordPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email.trim()) {
            setError('Vui lòng nhập địa chỉ email')
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setError('Vui lòng nhập địa chỉ email hợp lệ')
            return
        }

        setIsLoading(true)
        try {
            const response = await authApi.forgotPassword({ email })

            if (response.data?.success) {
                setSuccess(true)
                toast.success('Vui lòng kiểm tra email để đặt lại mật khẩu!')
            } else {
                setError(response.data?.message || 'Gửi yêu cầu thất bại')
            }
        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Gửi yêu cầu thất bại'
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
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
                        <CardContent className="pt-6 pb-6">
                            <div className="text-center">
                                <div className="flex justify-center mb-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                        <Mail className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Kiểm tra email của bạn
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Chúng tôi đã gửi link đặt lại mật khẩu đến email <br />
                                    <span className="font-medium text-gray-900">{email}</span>
                                </p>
                                <Button variant="outline" onClick={() => navigate('/login')}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Quay lại đăng nhập
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
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
                        <CardTitle>Quên mật khẩu</CardTitle>
                        <CardDescription>
                            Nhập địa chỉ email đã đăng ký để nhận link đặt lại mật khẩu
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
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Nhập địa chỉ email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="email"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang gửi...
                                    </>
                                ) : (
                                    'Gửi yêu cầu'
                                )}
                            </Button>
                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Quay lại đăng nhập
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
