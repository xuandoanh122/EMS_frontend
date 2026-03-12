import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { classroomStatusSchema, type ClassroomStatusFormValues } from '../schemas/classroom.schema'
import type { Classroom } from '@/types/classroom.types'
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
  const form = useForm<ClassroomStatusFormValues>({
    resolver: zodResolver(classroomStatusSchema),
    defaultValues: { new_status: '', reason: '' },
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
              Trạng thái lớp là thông tin nội bộ. Nhập trạng thái mới và lý do thay đổi.
            </p>
            <FormField
              control={form.control}
              name="new_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái mới <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="VD: inactive" {...field} />
                  </FormControl>
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
