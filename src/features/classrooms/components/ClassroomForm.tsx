import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { classroomCreateSchema, type ClassroomCreateFormValues } from '../schemas/classroom.schema'
import type { Classroom } from '@/types/classroom.types'
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

interface ClassroomFormProps {
  defaultValues?: Partial<Classroom>
  onSubmit: (values: ClassroomCreateFormValues) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export function ClassroomForm({ defaultValues, onSubmit, isLoading, mode = 'create' }: ClassroomFormProps) {
  const form = useForm<ClassroomCreateFormValues>({
    resolver: zodResolver(classroomCreateSchema),
    defaultValues: {
      class_code: defaultValues?.class_code ?? '',
      class_name: defaultValues?.class_name ?? '',
      class_type: defaultValues?.class_type ?? 'standard',
      academic_year: defaultValues?.academic_year ?? '',
      grade_level: defaultValues?.grade_level ?? ('' as unknown as number),
      max_capacity: defaultValues?.max_capacity ?? 40,
      homeroom_teacher_id: defaultValues?.homeroom_teacher_id ?? ('' as unknown as number),
      room_number: defaultValues?.room_number ?? '',
      description: defaultValues?.description ?? '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin lớp học</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="class_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã lớp <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="VD: 10A1-2024" {...field} disabled={mode === 'edit'} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="class_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên lớp <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Lớp 10A1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="academic_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Năm học <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="VD: 2024-2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="grade_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Khối lớp <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={13} placeholder="VD: 10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="class_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại lớp</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại lớp" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="standard">Lớp thường</SelectItem>
                      <SelectItem value="specialized">Lớp chuyên</SelectItem>
                      <SelectItem value="advanced">Lớp nâng cao</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sĩ số tối đa</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={200} placeholder="40" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="homeroom_teacher_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Giáo viên chủ nhiệm</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} placeholder="ID giáo viên" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="room_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phòng học</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: P.201" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Input placeholder="Mô tả thêm về lớp..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Đang lưu...' : mode === 'create' ? 'Tạo lớp học' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
