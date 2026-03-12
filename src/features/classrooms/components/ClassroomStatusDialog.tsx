import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { classroomStatusSchema, type ClassroomStatusFormValues } from '../schemas/classroom.schema'
import type { Classroom, ClassroomStatus } from '@/types/classroom.types'
import { VALID_CLASSROOM_STATUS_TRANSITIONS, CLASSROOM_STATUS_LABEL } from '@/types/classroom.types'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ClassroomStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classroom: Classroom
  onSubmit: (values: ClassroomStatusFormValues) => void
  isLoading?: boolean
}

export function ClassroomStatusDialog({
  open,
  onOpenChange,
  classroom,
  onSubmit,
  isLoading,
}: ClassroomStatusDialogProps) {
  const allowedTransitions = VALID_CLASSROOM_STATUS_TRANSITIONS[classroom.status] ?? []

  const form = useForm<ClassroomStatusFormValues>({
    resolver: zodResolver(classroomStatusSchema),
    defaultValues: { new_status: allowedTransitions[0], reason: '' },
  })

  const handleSubmit = (values: ClassroomStatusFormValues) => {
    onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Đổi trạng thái lớp: {classroom.class_name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Trạng thái hiện tại:{' '}
              <span className="font-medium text-foreground">
                {CLASSROOM_STATUS_LABEL[classroom.status]}
              </span>
            </p>
            {allowedTransitions.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                Không có trạng thái nào có thể chuyển từ trạng thái hiện tại.
              </p>
            ) : (
              <>
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
                          {allowedTransitions.map((s: ClassroomStatus) => (
                            <SelectItem key={s} value={s}>
                              {CLASSROOM_STATUS_LABEL[s]}
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
                      <FormLabel>Lý do (tuỳ chọn)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập lý do thay đổi..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Huỷ
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Đang lưu...' : 'Xác nhận'}
                  </Button>
                </DialogFooter>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
