import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  studentCreateSchema,
  studentUpdateSchema,
  type StudentCreateFormValues,
  type StudentUpdateFormValues,
} from '../schemas/student.schema'
import type { Student } from '@/types/student.types'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { MultiLookupSelect } from '@/components/shared/MultiLookupSelect'
import { lookupsApi } from '@/api/lookups.api'

interface StudentFormProps {
  defaultValues?: Partial<Student>
  onSubmit: (values: StudentCreateFormValues | StudentUpdateFormValues) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export function StudentForm({ defaultValues, onSubmit, isLoading, mode = 'create' }: StudentFormProps) {
  const schema = mode === 'create' ? studentCreateSchema : studentUpdateSchema
  const form = useForm<StudentCreateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: defaultValues?.full_name ?? '',
      date_of_birth: defaultValues?.date_of_birth ?? '',
      gender: defaultValues?.gender ?? undefined,
      national_id: defaultValues?.national_id ?? '',
      email: defaultValues?.email ?? '',
      phone_number: defaultValues?.phone_number ?? '',
      address: defaultValues?.address ?? '',
      enrollment_date: defaultValues?.enrollment_date ?? '',
      academic_status: defaultValues?.academic_status ?? 'active',
      class_ids: [],
      parent_full_name: defaultValues?.parent_full_name ?? '',
      parent_phone: defaultValues?.parent_phone ?? '',
      parent_email: defaultValues?.parent_email ?? '',
      medical_notes: defaultValues?.medical_notes ?? '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as (v: StudentCreateFormValues) => void)} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin cơ bản</h3>
          {mode === 'create' && (
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 border rounded-md px-3 py-2">
              <span className="font-mono font-medium">Mã học sinh</span>
              <span>–</span>
              <span>Hệ thống tự cấp theo format <code className="bg-background px-1 rounded">StudYYMMxxx</code></span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="full_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Nguyễn Văn A" {...field} /></FormControl>
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
                <FormControl><Input type="email" placeholder="hocsinh@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="enrollment_date" render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày nhập học</FormLabel>
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

        {/* Xếp lớp – chỉ hiện khi tạo mới */}
        {mode === 'create' && (
          <>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Xếp lớp (tuỳ chọn)</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Chọn 1 hoặc nhiều lớp. Bỏ qua nếu muốn xếp lớp sau.
              </p>
              <Controller
                control={form.control}
                name="class_ids"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lớp học</FormLabel>
                    <MultiLookupSelect
                      value={field.value ?? []}
                      onChange={field.onChange}
                      fetchFn={(search) => lookupsApi.classrooms({ search, limit: 100 })}
                      queryKey={['lookups', 'classrooms']}
                      placeholder="Tìm tên lớp..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator />
          </>
        )}

        {/* Phụ huynh */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin phụ huynh</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="parent_full_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Họ tên phụ huynh</FormLabel>
                <FormControl><Input placeholder="Nguyễn Văn B" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="parent_phone" render={({ field }) => (
              <FormItem>
                <FormLabel>SĐT phụ huynh</FormLabel>
                <FormControl><Input placeholder="0901234567" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="parent_email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email phụ huynh</FormLabel>
                <FormControl><Input type="email" placeholder="phuhuynh@example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </div>

        <Separator />

        <FormField control={form.control} name="medical_notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Ghi chú y tế</FormLabel>
            <FormControl>
              <Textarea placeholder="Dị ứng, bệnh lý đặc biệt cần lưu ý..." className="resize-none" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Đang lưu...' : mode === 'create' ? 'Tạo học sinh' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
