import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { teacherCreateSchema, type TeacherCreateFormValues } from '../schemas/teacher.schema'
import type { Teacher } from '@/types/teacher.types'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface TeacherFormProps {
  defaultValues?: Partial<Teacher>
  onSubmit: (values: TeacherCreateFormValues) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export function TeacherForm({ defaultValues, onSubmit, isLoading, mode = 'create' }: TeacherFormProps) {
  const form = useForm<TeacherCreateFormValues>({
    resolver: zodResolver(teacherCreateSchema),
    defaultValues: {
      full_name: defaultValues?.full_name ?? '',
      date_of_birth: defaultValues?.date_of_birth ?? '',
      gender: defaultValues?.gender ?? undefined,
      national_id: defaultValues?.national_id ?? '',
      email: defaultValues?.email ?? '',
      phone_number: defaultValues?.phone_number ?? '',
      address: defaultValues?.address ?? '',
      specialization: defaultValues?.specialization ?? '',
      qualification: defaultValues?.qualification ?? '',
      join_date: defaultValues?.join_date ?? '',
      employment_status: defaultValues?.employment_status ?? 'active',
      department: defaultValues?.department ?? '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin cơ bản</h3>
          {mode === 'create' && (
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border rounded-md px-3 py-2">
              <span className="font-mono font-medium">Mã giáo viên</span>
              <span>–</span>
              <span>Hệ thống tự cấp theo format <code className="bg-background px-1 rounded">TchrYYMMxxx</code></span>
            </div>
          )}
          {mode === 'edit' && defaultValues?.teacher_code && (
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border rounded-md px-3 py-2">
              <span className="font-mono font-medium">Mã GV:</span>
              <code className="font-mono font-semibold text-foreground">{defaultValues.teacher_code}</code>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="full_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Nguyễn Thị C" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="date_of_birth" render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày sinh</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem>
                <FormLabel>Giới tính</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Chọn giới tính" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="national_id" render={({ field }) => (
              <FormItem>
                <FormLabel>CCCD / CMND</FormLabel>
                <FormControl><Input placeholder="012345678901" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone_number" render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl><Input placeholder="0901234567" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" placeholder="giaovien@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="join_date" render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày vào trường</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="mt-4">
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ</FormLabel>
                <FormControl><Input placeholder="123 Đường ABC, Quận 1, TP.HCM" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <Separator />

        {/* Nghiệp vụ */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin nghiệp vụ</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="department" render={({ field }) => (
              <FormItem>
                <FormLabel>Bộ môn / Phòng ban</FormLabel>
                <FormControl><Input placeholder="VD: Tiếng Anh" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="specialization" render={({ field }) => (
              <FormItem>
                <FormLabel>Chuyên môn</FormLabel>
                <FormControl><Input placeholder="VD: IELTS, TOEIC" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="qualification" render={({ field }) => (
              <FormItem>
                <FormLabel>Bằng cấp cao nhất</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Chọn bằng cấp" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="cao_dang">Cao đẳng</SelectItem>
                    <SelectItem value="dai_hoc">Đại học</SelectItem>
                    <SelectItem value="thac_si">Thạc sĩ</SelectItem>
                    <SelectItem value="tien_si">Tiến sĩ</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Đang lưu...' : mode === 'create' ? 'Tạo giáo viên' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
