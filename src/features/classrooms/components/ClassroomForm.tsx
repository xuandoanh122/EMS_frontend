import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { classroomCreateSchema, type ClassroomCreateFormValues } from '../schemas/classroom.schema'
import type { Classroom } from '@/types/classroom.types'
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

interface ClassroomFormProps {
  defaultValues?: Partial<Classroom>
  onSubmit: (values: ClassroomCreateFormValues) => void
  isLoading?: boolean
  mode?: 'create' | 'edit'
  teachers?: Teacher[]
  teachersLoading?: boolean
}

export function ClassroomForm({
  defaultValues,
  onSubmit,
  isLoading,
  mode = 'create',
  teachers,
  teachersLoading,
}: ClassroomFormProps) {
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
        {/* ThÃ´ng tin cÆ¡ báº£n */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">ThÃ´ng tin lá»›p há»c</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="class_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MÃ£ lá»›p <span className="text-destructive">*</span></FormLabel>
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
                  <FormLabel>TÃªn lá»›p <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Lá»›p 10A1" {...field} />
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
                  <FormLabel>NÄƒm há»c <span className="text-destructive">*</span></FormLabel>
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
                  <FormLabel>Khá»‘i lá»›p <span className="text-destructive">*</span></FormLabel>
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
                  <FormLabel>Loáº¡i lá»›p</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chá»n loáº¡i lá»›p" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="standard">Lá»›p thÆ°á»ng</SelectItem>
                      <SelectItem value="specialized">Lá»›p chuyÃªn</SelectItem>
                      <SelectItem value="advanced">Lá»›p nÃ¢ng cao</SelectItem>
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
                  <FormLabel>SÄ© sá»‘ tá»‘i Ä‘a</FormLabel>
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
                  <FormLabel>Giáo viên chủ nhiệm</FormLabel>
                  <Select
                    value={field.value ? String(field.value) : 'none'}
                    onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giáo viên" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Chưa chọn</SelectItem>
                      {teachersLoading && (
                        <SelectItem value="loading" disabled>Đang tải danh sách...</SelectItem>
                      )}
                      {teachers?.map((teacher) => (
                        <SelectItem key={teacher.id} value={String(teacher.id)}>
                          {teacher.full_name} - {teacher.teacher_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="room_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PhÃ²ng há»c</FormLabel>
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
                <FormLabel>MÃ´ táº£</FormLabel>
                <FormControl>
                  <Input placeholder="MÃ´ táº£ thÃªm vá» lá»›p..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Äang lÆ°u...' : mode === 'create' ? 'Táº¡o lá»›p há»c' : 'LÆ°u thay Ä‘á»•i'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
