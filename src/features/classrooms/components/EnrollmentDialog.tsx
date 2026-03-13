import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus, ArrowLeftRight } from 'lucide-react'
import { enrollmentCreateSchema, type EnrollmentCreateFormValues } from '../schemas/classroom.schema'
import { useClassroomEnrollments, useAddEnrollment, useUpdateEnrollmentStatus } from '../hooks/useClassrooms'
import type { Classroom, Enrollment, EnrollmentStatus } from '@/types/classroom.types'
import { ENROLLMENT_STATUS_LABEL, VALID_ENROLLMENT_STATUS_TRANSITIONS } from '@/types/classroom.types'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { TablePagination } from '@/components/shared/TablePagination'
import { SearchCombobox } from '@/components/shared/SearchCombobox'
import { lookupsApi } from '@/api/lookups.api'

const ENROLLMENT_STATUS_VARIANT: Record<EnrollmentStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  transferred: 'secondary',
  withdrawn: 'destructive',
  completed: 'outline',
}

interface EnrollmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classroom: Classroom
}

export function EnrollmentDialog({ open, onOpenChange, classroom }: EnrollmentDialogProps) {
  const [page, setPage] = useState(1)
  const [statusTarget, setStatusTarget] = useState<Enrollment | null>(null)
  const [newStatus, setNewStatus] = useState<EnrollmentStatus>('transferred')

  const { data: enrollmentData, isLoading } = useClassroomEnrollments(classroom.class_code, {
    page,
    page_size: 10,
  })

  const addMutation = useAddEnrollment(classroom.class_code)
  const statusMutation = useUpdateEnrollmentStatus(classroom.class_code)

  const form = useForm<EnrollmentCreateFormValues>({
    resolver: zodResolver(enrollmentCreateSchema),
    defaultValues: { student_id: '' as unknown as number, enrollment_type: 'primary', enrolled_date: '', notes: '' },
  })

  const handleAdd = (values: EnrollmentCreateFormValues) => {
    addMutation.mutate(
      {
        student_id: values.student_id,
        enrollment_type: values.enrollment_type,
        enrolled_date: values.enrolled_date || undefined,
        notes: values.notes || undefined,
      },
      { onSuccess: () => form.reset() },
    )
  }

  const handleStatusChange = () => {
    if (!statusTarget) return
    statusMutation.mutate(
      { enrollment_id: statusTarget.id, payload: { new_status: newStatus } },
      { onSuccess: () => setStatusTarget(null) },
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Học sinh lớp {classroom.class_name}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({classroom.current_enrollment}/{classroom.max_capacity} học sinh)
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* Add student form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Thêm học sinh vào lớp</h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="student_id"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Tìm học sinh <span className="text-destructive">*</span></FormLabel>
                      <SearchCombobox
                        value={field.value as number | undefined}
                        onChange={(id) => field.onChange(id ?? '')}
                        fetchFn={(search) => lookupsApi.students({ search, limit: 100 })}
                        queryKey={['lookups', 'students']}
                        placeholder="Tìm theo tên hoặc mã học sinh..."
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="enrollment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại đăng ký</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="primary">Lớp chính</SelectItem>
                          <SelectItem value="secondary">Lớp phụ</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="enrolled_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày vào lớp</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Input placeholder="Ghi chú..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={addMutation.isPending} size="sm">
                  <UserPlus className="h-4 w-4 mr-1" />
                  {addMutation.isPending ? 'Đang thêm...' : 'Thêm học sinh'}
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
                {(enrollmentData?.items ?? []).map((enrollment) => {
                  const status = enrollment.status ?? enrollment.enrollment_status ?? 'active'
                  return (
                    <div key={enrollment.id} className="flex items-center justify-between px-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium">{enrollment.student_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {enrollment.student_code} · {enrollment.enrollment_type === 'primary' ? 'Lớp chính' : 'Lớp phụ'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={ENROLLMENT_STATUS_VARIANT[status]}>
                          {ENROLLMENT_STATUS_LABEL[status]}
                        </Badge>
                        {VALID_ENROLLMENT_STATUS_TRANSITIONS[status]?.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setStatusTarget(enrollment)
                              setNewStatus(VALID_ENROLLMENT_STATUS_TRANSITIONS[status][0])
                            }}
                            title="Đổi trạng thái"
                          >
                            <ArrowLeftRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
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

      {/* Status Change Dialog */}
      <Dialog open={!!statusTarget} onOpenChange={(o) => !o && setStatusTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Đổi trạng thái đăng ký</DialogTitle>
          </DialogHeader>
          {statusTarget && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Học sinh: <span className="font-medium text-foreground">{statusTarget.student_name}</span>
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái mới</label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as EnrollmentStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VALID_ENROLLMENT_STATUS_TRANSITIONS[statusTarget.enrollment_status].map((s) => (
                      <SelectItem key={s} value={s}>{ENROLLMENT_STATUS_LABEL[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setStatusTarget(null)}>Huỷ</Button>
                <Button size="sm" disabled={statusMutation.isPending} onClick={handleStatusChange}>
                  {statusMutation.isPending ? 'Đang lưu...' : 'Xác nhận'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
