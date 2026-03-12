import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { studentStatusSchema, type StudentStatusFormValues } from '../schemas/student.schema'
import type { Student } from '@/types/student.types'
import { STUDENT_STATUS_LABEL, VALID_STUDENT_STATUS_TRANSITIONS } from '@/types/student.types'
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
import { StudentStatusBadge } from '@/components/shared/StatusBadge'

interface StudentStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: Student
  onSubmit: (values: StudentStatusFormValues) => void
  isLoading?: boolean
}

export function StudentStatusDialog({
  open,
  onOpenChange,
  student,
  onSubmit,
  isLoading,
}: StudentStatusDialogProps) {
  const allowedTransitions = VALID_STUDENT_STATUS_TRANSITIONS[student.academic_status]
  const form = useForm<StudentStatusFormValues>({
    resolver: zodResolver(studentStatusSchema),
    defaultValues: { new_status: allowedTransitions[0] ?? 'active', reason: '' },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái học tập</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-2">
          Học sinh: <span className="font-medium text-foreground">{student.full_name}</span>
          {' — '}Trạng thái hiện tại: <StudentStatusBadge status={student.academic_status} />
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
                          {STUDENT_STATUS_LABEL[s]}
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
