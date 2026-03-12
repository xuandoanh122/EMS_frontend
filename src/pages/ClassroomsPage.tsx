import { useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import type { Classroom, ClassroomQueryParams, ClassroomStatus } from '@/types/classroom.types'
import { CLASSROOM_STATUS_LABEL } from '@/types/classroom.types'
import {
  useClassroomList,
  useCreateClassroom,
  useUpdateClassroom,
  useDeleteClassroom,
  useUpdateClassroomStatus,
} from '@/features/classrooms/hooks/useClassrooms'
import { ClassroomTable } from '@/features/classrooms/components/ClassroomTable'
import { ClassroomForm } from '@/features/classrooms/components/ClassroomForm'
import { ClassroomStatusDialog } from '@/features/classrooms/components/ClassroomStatusDialog'
import { EnrollmentDialog } from '@/features/classrooms/components/EnrollmentDialog'
import type { ClassroomCreateFormValues, ClassroomStatusFormValues } from '@/features/classrooms/schemas/classroom.schema'
import { PageHeader } from '@/components/shared/PageHeader'
import { TablePagination } from '@/components/shared/TablePagination'
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export function ClassroomsPage() {
  const [params, setParams] = useState<ClassroomQueryParams>({ page: 1, page_size: 20 })
  const [searchInput, setSearchInput] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [editClassroom, setEditClassroom] = useState<Classroom | null>(null)
  const [deleteClassroom, setDeleteClassroom] = useState<Classroom | null>(null)
  const [statusClassroom, setStatusClassroom] = useState<Classroom | null>(null)
  const [enrollmentClassroom, setEnrollmentClassroom] = useState<Classroom | null>(null)

  const { data: listData, isLoading } = useClassroomList(params)
  const createMutation = useCreateClassroom()
  const updateMutation = useUpdateClassroom(editClassroom?.class_code ?? '')
  const deleteMutation = useDeleteClassroom()
  const statusMutation = useUpdateClassroomStatus(statusClassroom?.class_code ?? '')

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
      status: value === 'all' ? undefined : (value as ClassroomStatus),
      page: 1,
    }))
  }

  const handleCreate = (values: ClassroomCreateFormValues) => {
    createMutation.mutate(values, { onSuccess: () => setCreateOpen(false) })
  }

  const handleUpdate = (values: ClassroomCreateFormValues) => {
    if (!editClassroom) return
    updateMutation.mutate(values, { onSuccess: () => setEditClassroom(null) })
  }

  const handleDelete = () => {
    if (!deleteClassroom) return
    deleteMutation.mutate(deleteClassroom.class_code, { onSuccess: () => setDeleteClassroom(null) })
  }

  const handleStatusUpdate = (values: ClassroomStatusFormValues) => {
    if (!statusClassroom) return
    statusMutation.mutate(values, { onSuccess: () => setStatusClassroom(null) })
  }

  return (
    <div>
      <PageHeader
        title="Quản lý Lớp học"
        description="Danh sách toàn bộ lớp học trong hệ thống"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Thêm lớp học
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
                  placeholder="Tìm mã lớp, tên lớp..."
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
            <Select onValueChange={handleStatusFilter} defaultValue="all">
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {(Object.entries(CLASSROOM_STATUS_LABEL) as [ClassroomStatus, string][]).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <ClassroomTable
            classrooms={listData?.items ?? []}
            isLoading={isLoading}
            onEdit={setEditClassroom}
            onDelete={setDeleteClassroom}
            onStatusChange={setStatusClassroom}
            onViewEnrollments={setEnrollmentClassroom}
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
            <DialogTitle>Thêm lớp học mới</DialogTitle>
          </DialogHeader>
          <ClassroomForm
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
            mode="create"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editClassroom} onOpenChange={(o) => !o && setEditClassroom(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
          </DialogHeader>
          {editClassroom && (
            <ClassroomForm
              defaultValues={editClassroom}
              onSubmit={handleUpdate}
              isLoading={updateMutation.isPending}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Status Dialog */}
      {statusClassroom && (
        <ClassroomStatusDialog
          open={!!statusClassroom}
          onOpenChange={(o) => !o && setStatusClassroom(null)}
          classroom={statusClassroom}
          onSubmit={handleStatusUpdate}
          isLoading={statusMutation.isPending}
        />
      )}

      {/* Enrollment Dialog */}
      {enrollmentClassroom && (
        <EnrollmentDialog
          open={!!enrollmentClassroom}
          onOpenChange={(o) => !o && setEnrollmentClassroom(null)}
          classroom={enrollmentClassroom}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDeleteDialog
        open={!!deleteClassroom}
        onOpenChange={(o) => !o && setDeleteClassroom(null)}
        onConfirm={handleDelete}
        title="Xoá lớp học"
        description={`Bạn có chắc muốn xoá lớp "${deleteClassroom?.class_name}"? Thao tác này sẽ ẩn lớp khỏi hệ thống.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
