import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { teacherStatusSchema, type TeacherStatusFormValues } from '../schemas/teacher.schema'
import type { Teacher } from '@/types/teacher.types'
import { TEACHER_STATUS_LABEL, VALID_TEACHER_STATUS_TRANSITIONS } from '@/types/teacher.types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { TeacherStatusBadge } from '@/components/shared/StatusBadge'

interface TeacherStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher: Teacher
  onSubmit: (values: TeacherStatusFormValues) => void
  isLoading?: boolean
}

export function TeacherStatusDialog({
  open,
  onOpenChange,
  teacher,
  onSubmit,
  isLoading,
}: TeacherStatusDialogProps) {
  const allowedTransitions = VALID_TEACHER_STATUS_TRANSITIONS[teacher.employment_status]
  const form = useForm<TeacherStatusFormValues>({
    resolver: zodResolver(teacherStatusSchema),
    defaultValues: { new_status: allowedTransitions[0] ?? 'active', reason: '' },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái công tác</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-2">
          Giáo viên: <span className="font-medium text-foreground">{teacher.full_name}</span>
          {' — '}Trạng thái hiện tại: <TeacherStatusBadge status={teacher.employment_status} />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="new_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái mới</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allowedTransitions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {TEACHER_STATUS_LABEL[s]}
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mô tả lý do thay đổi trạng thái..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Huỷ
              </Button>
              <Button type="submit" disabled={isLoading || allowedTransitions.length === 0}>
                {isLoading ? 'Đang lưu...' : 'Xác nhận'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
