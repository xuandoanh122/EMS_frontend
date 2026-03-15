import { useState } from 'react'
import { Loader2, Mail, UserCog, UserX, UserCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { authApi, CreateTeacherAccountResponse, UserAccountStatus } from '@/api/auth.api'

interface TeacherAccountDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    teacherId: number
    teacherName: string
    teacherCode: string
    teacherEmail: string | null
    existingAccount?: UserAccountStatus | null
    onSuccess?: () => void
}

export function TeacherAccountDialog({
    open,
    onOpenChange,
    teacherId,
    teacherName,
    teacherCode,
    teacherEmail,
    existingAccount,
    onSuccess,
}: TeacherAccountDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [sendEmail, setSendEmail] = useState(true)

    const handleCreateAccount = async () => {
        setIsLoading(true)
        try {
            const response = await authApi.createTeacherAccount(teacherId, { send_email: sendEmail })

            if (response.data) {
                toast.success('Tạo tài khoản thành công!')
                onSuccess?.()
                onOpenChange(false)
            }
        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Tạo tài khoản thất bại'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDisableAccount = async () => {
        if (!existingAccount?.user_id) return

        setIsLoading(true)
        try {
            await authApi.disableUserAccount(existingAccount.user_id)
            toast.success('Vô hiệu hóa tài khoản thành công!')
            onSuccess?.()
        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Thao tác thất bại'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEnableAccount = async () => {
        if (!existingAccount?.user_id) return

        setIsLoading(true)
        try {
            await authApi.enableUserAccount(existingAccount.user_id)
            toast.success('Kích hoạt tài khoản thành công!')
            onSuccess?.()
        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Thao tác thất bại'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!existingAccount?.user_id) return

        if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.')) {
            return
        }

        setIsLoading(true)
        try {
            await authApi.deleteUserAccount(existingAccount.user_id)
            toast.success('Xóa tài khoản thành công!')
            onSuccess?.()
            onOpenChange(false)
        } catch (error: any) {
            const message = error.response?.data?.detail || error.message || 'Thao tác thất bại'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    // If teacher doesn't have an account, show create form
    if (!existingAccount) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserCog className="h-5 w-5" />
                            Tạo tài khoản Giáo viên
                        </DialogTitle>
                        <DialogDescription>
                            Tạo tài khoản đăng nhập cho giáo viên {teacherName} ({teacherCode})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                            <div className="text-sm font-medium">Thông tin giáo viên:</div>
                            <div className="text-sm text-gray-600">Mã: {teacherCode}</div>
                            <div className="text-sm text-gray-600">Tên: {teacherName}</div>
                            {teacherEmail && (
                                <div className="text-sm text-gray-600">Email: {teacherEmail}</div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="sendEmail"
                                checked={sendEmail}
                                onChange={(e) => setSendEmail(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <label htmlFor="sendEmail" className="text-sm text-gray-700">
                                Gửi mật khẩu qua email cho giáo viên
                            </label>
                        </div>

                        {sendEmail && !teacherEmail && (
                            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                                Cảnh báo: Giáo viên chưa có email trong hồ sơ. Vui lòng cập nhật email trước khi gửi.
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Hủy
                        </Button>
                        <Button onClick={handleCreateAccount} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Tạo tài khoản
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    // If teacher has an account, show account info and actions
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCog className="h-5 w-5" />
                        Quản lý tài khoản
                    </DialogTitle>
                    <DialogDescription>
                        Thông tin tài khoản của giáo viên {teacherName} ({teacherCode})
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                        <div className="text-sm font-medium">Thông tin tài khoản:</div>
                        <div className="text-sm text-gray-600">Tên đăng nhập: <span className="font-medium">{existingAccount.username}</span></div>
                        <div className="text-sm text-gray-600">Email: <span className="font-medium">{existingAccount.email || 'N/A'}</span></div>
                        <div className="text-sm text-gray-600">
                            Trạng thái:
                            <span className={`font-medium ml-1 ${existingAccount.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                {existingAccount.is_active ? 'Hoạt động' : 'Vô hiệu hóa'}
                            </span>
                        </div>
                        {existingAccount.must_change_password && (
                            <div className="text-sm text-amber-600">
                                ⚠️ Tài khoản cần đổi mật khẩu lần đầu
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between gap-3">
                    <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isLoading}
                        className="flex items-center gap-1"
                    >
                        <Trash2 className="h-4 w-4" />
                        Xóa tài khoản
                    </Button>

                    {existingAccount.is_active ? (
                        <Button
                            variant="outline"
                            onClick={handleDisableAccount}
                            disabled={isLoading}
                            className="flex items-center gap-1"
                        >
                            <UserX className="h-4 w-4" />
                            Vô hiệu hóa
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={handleEnableAccount}
                            disabled={isLoading}
                            className="flex items-center gap-1"
                        >
                            <UserCheck className="h-4 w-4" />
                            Kích hoạt
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
