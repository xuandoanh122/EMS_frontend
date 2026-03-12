import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus, Trash2 } from 'lucide-react'
import { enrollmentCreateSchema, type EnrollmentCreateFormValues } from '../schemas/classroom.schema'
import { useClassroomEnrollments, useAddEnrollment, useRemoveEnrollment } from '../hooks/useClassrooms'
import type { Classroom } from '@/types/classroom.types'
import type { Student } from '@/types/student.types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { StudentStatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { TablePagination } from '@/components/shared/TablePagination'

interface EnrollmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classroom: Classroom
}

export function EnrollmentDialog({ open, onOpenChange, classroom }: EnrollmentDialogProps) {
  const [page, setPage] = useState(1)
  const [removeStudent, setRemoveStudent] = useState<Student | null>(null)

  const { data: enrollmentData, isLoading } = useClassroomEnrollments(classroom.class_code, {
    page,
    page_size: 10,
  })

  const addMutation = useAddEnrollment(classroom.class_code)
  const removeMutation = useRemoveEnrollment(classroom.class_code)

  const form = useForm<EnrollmentCreateFormValues>({
    resolver: zodResolver(enrollmentCreateSchema),
    defaultValues: { student_code: '', enrollment_date: '', notes: '' },
  })

  const handleAdd = (values: EnrollmentCreateFormValues) => {
    addMutation.mutate(
      { student_code: values.student_code, enrollment_date: values.enrollment_date || undefined, notes: values.notes || undefined },
      { onSuccess: () => form.reset() },
    )
  }

  const handleRemove = () => {
    if (!removeStudent) return
    removeMutation.mutate(removeStudent.student_code, { onSuccess: () => setRemoveStudent(null) })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Học sinh lớp {classroom.class_name}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({classroom.current_enrollment}/{classroom.max_students} học sinh)
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* Add student form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Thêm học sinh vào lớp</h4>
              <div className="flex items-end gap-3">
                <FormField
                  control={form.control}
                  name="student_code"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Mã học sinh</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: HS2024001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="enrollment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày vào lớp</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={addMutation.isPending} className="mb-0.5">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Thêm
                </Button>
              </div>
            </form>
          </Form>

          <Separator />

          {/* Enrollment list */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Danh sách học sinh hiện tại</h4>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : enrollmentData?.items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Lớp chưa có học sinh nào.</p>
            ) : (
              <div className="divide-y border rounded-md">
                {enrollmentData?.items.map((student) => (
                  <div key={student.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium">{student.full_name}</p>
                      <p className="text-xs text-muted-foreground">{student.student_code}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StudentStatusBadge status={student.academic_status} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setRemoveStudent(student)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {enrollmentData && enrollmentData.total_pages > 1 && (
              <TablePagination
                page={enrollmentData.page}
                totalPages={enrollmentData.total_pages}
                total={enrollmentData.total}
                pageSize={enrollmentData.page_size}
                onPageChange={setPage}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!removeStudent}
        onOpenChange={(o) => !o && setRemoveStudent(null)}
        onConfirm={handleRemove}
        title="Xoá học sinh khỏi lớp"
        description={`Bạn có chắc muốn xoá học sinh "${removeStudent?.full_name}" khỏi lớp ${classroom.class_name}?`}
        isLoading={removeMutation.isPending}
      />
    </>
  )
}
