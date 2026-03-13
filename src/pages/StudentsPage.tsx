import { useState } from 'react'
import { Plus, Search, X, Clock } from 'lucide-react'
import type { Student, StudentQueryParams, StudentStatus } from '@/types/student.types'
import { STUDENT_STATUS_LABEL } from '@/types/student.types'
import {
  useStudentList,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  useUpdateStudentStatus,
} from '@/features/students/hooks/useStudents'
import { StudentTable } from '@/features/students/components/StudentTable'
import { StudentForm } from '@/features/students/components/StudentForm'
import { StudentStatusDialog } from '@/features/students/components/StudentStatusDialog'
import type { StudentCreateFormValues, StudentUpdateFormValues, StudentStatusFormValues } from '@/features/students/schemas/student.schema'
import { PageHeader } from '@/components/shared/PageHeader'
import { TablePagination } from '@/components/shared/TablePagination'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'

export function StudentsPage() {
  const [params, setParams] = useState<StudentQueryParams>({ page: 1, page_size: 20 })
  const [searchInput, setSearchInput] = useState('')
  const [pendingOnly, setPendingOnly] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null)
  const [statusStudent, setStatusStudent] = useState<Student | null>(null)

  const { data: listData, isLoading } = useStudentList(params)
  const createMutation = useCreateStudent()
  const updateMutation = useUpdateStudent(editStudent?.student_code ?? '')
  const deleteMutation = useDeleteStudent()
  const statusMutation = useUpdateStudentStatus(statusStudent?.student_code ?? '')

  const handleSearch = () => {
    setParams((p) => ({ ...p, search: searchInput || undefined, page: 1 }))
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setParams((p) => ({ ...p, search: undefined, page: 1 }))
  }

  const handleStatusFilter = (value: string) => {
    setParams((p) => ({
      ...p,
      academic_status: value === 'all' ? undefined : (value as StudentStatus),
      page: 1,
    }))
  }

  const handleTogglePending = () => {
    const next = !pendingOnly
    setPendingOnly(next)
    setParams((p) => ({
      ...p,
      has_enrollment: next ? false : undefined,
      academic_status: next ? 'active' : p.academic_status,
      page: 1,
    }))
  }

  const handleCreate = (values: StudentCreateFormValues) => {
    createMutation.mutate(values, { onSuccess: () => setCreateOpen(false) })
  }

  const handleUpdate = (values: StudentCreateFormValues | StudentUpdateFormValues) => {
    if (!editStudent) return
    updateMutation.mutate(values as StudentUpdateFormValues, { onSuccess: () => setEditStudent(null) })
  }

  const handleDelete = () => {
    if (!deleteStudent) return
    deleteMutation.mutate(deleteStudent.student_code, { onSuccess: () => setDeleteStudent(null) })
  }

  const handleStatusUpdate = (values: StudentStatusFormValues) => {
    if (!statusStudent) return
    statusMutation.mutate(values, { onSuccess: () => setStatusStudent(null) })
  }

  return (
    <div>
      <PageHeader
        title="Quản lý Học sinh"
        description="Danh sách toàn bộ học sinh trong hệ thống"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Thêm học sinh
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm mã HS, tên, email..."
                  className="pl-9"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                {searchInput && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button variant="outline" onClick={handleSearch}>Tìm kiếm</Button>
            </div>

            <Select onValueChange={handleStatusFilter} defaultValue="all" disabled={pendingOnly}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {(Object.entries(STUDENT_STATUS_LABEL) as [StudentStatus, string][]).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter chờ xếp lớp */}
            <Button
              variant={pendingOnly ? 'default' : 'outline'}
              size="sm"
              onClick={handleTogglePending}
              className="gap-1.5"
            >
              <Clock className="h-4 w-4" />
              Chờ xếp lớp
              {listData && pendingOnly && (
                <Badge variant="secondary" className="ml-1 h-5 text-xs">
                  {listData.total}
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <StudentTable
            students={listData?.items ?? []}
            isLoading={isLoading}
            onEdit={setEditStudent}
            onDelete={setDeleteStudent}
            onStatusChange={setStatusStudent}
          />
          {listData && listData.total_pages > 1 && (
            <TablePagination
              page={listData.page}
              totalPages={listData.total_pages}
              total={listData.total}
              pageSize={listData.page_size}
              onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
            />
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm học sinh mới</DialogTitle>
          </DialogHeader>
          <StudentForm
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
            mode="create"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editStudent} onOpenChange={(o) => !o && setEditStudent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Chỉnh sửa học sinh
              {editStudent && (
                <span className="ml-2 text-sm font-mono font-normal text-muted-foreground">
                  {editStudent.student_code}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {editStudent && (
            <StudentForm
              defaultValues={editStudent}
              onSubmit={handleUpdate}
              isLoading={updateMutation.isPending}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Status Dialog */}
      {statusStudent && (
        <StudentStatusDialog
          open={!!statusStudent}
          onOpenChange={(o) => !o && setStatusStudent(null)}
          student={statusStudent}
          onSubmit={handleStatusUpdate}
          isLoading={statusMutation.isPending}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDeleteDialog
        open={!!deleteStudent}
        onOpenChange={(o) => !o && setDeleteStudent(null)}
        onConfirm={handleDelete}
        title="Xoá học sinh"
        description={`Bạn có chắc muốn xoá học sinh "${deleteStudent?.full_name}"? Thao tác này sẽ ẩn hồ sơ khỏi hệ thống.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
