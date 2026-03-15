import { useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import type { Teacher, TeacherQueryParams, TeacherStatus } from '@/types/teacher.types'
import { TEACHER_STATUS_LABEL } from '@/types/teacher.types'
import {
  useTeacherList,
  useCreateTeacher,
  useUpdateTeacher,
  useDeleteTeacher,
  useUpdateTeacherStatus,
} from '@/features/teachers/hooks/useTeachers'
import { TeacherTable } from '@/features/teachers/components/TeacherTable'
import { TeacherForm } from '@/features/teachers/components/TeacherForm'
import { TeacherStatusDialog } from '@/features/teachers/components/TeacherStatusDialog'
import { TeacherAccountDialog } from '@/features/teachers/components/TeacherAccountDialog'
import type { TeacherCreateFormValues, TeacherStatusFormValues } from '@/features/teachers/schemas/teacher.schema'
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
import { authApi, UserAccountStatus } from '@/api/auth.api'

// NOTE: Page animation is handled by AnimatedRoutes in App.tsx

export function TeachersPage() {
  const [params, setParams] = useState<TeacherQueryParams>({ page: 1, page_size: 20 })
  const [searchInput, setSearchInput] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null)
  const [deleteTeacher, setDeleteTeacher] = useState<Teacher | null>(null)
  const [statusTeacher, setStatusTeacher] = useState<Teacher | null>(null)
  const [accountTeacher, setAccountTeacher] = useState<Teacher | null>(null)
  const [accountInfo, setAccountInfo] = useState<UserAccountStatus | null>(null)

  const { data: listData, isLoading, refetch } = useTeacherList(params)
  const createMutation = useCreateTeacher()
  const updateMutation = useUpdateTeacher(editTeacher?.teacher_code ?? '')
  const deleteMutation = useDeleteTeacher()
  const statusMutation = useUpdateTeacherStatus(statusTeacher?.teacher_code ?? '')

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
      employment_status: value === 'all' ? undefined : (value as TeacherStatus),
      page: 1,
    }))
  }

  const handleCreate = (values: TeacherCreateFormValues) => {
    createMutation.mutate(values, { onSuccess: () => setCreateOpen(false) })
  }

  const handleUpdate = (values: TeacherCreateFormValues) => {
    if (!editTeacher) return
    updateMutation.mutate(values, { onSuccess: () => setEditTeacher(null) })
  }

  const handleDelete = () => {
    if (!deleteTeacher) return
    deleteMutation.mutate(deleteTeacher.teacher_code, { onSuccess: () => setDeleteTeacher(null) })
  }

  const handleStatusUpdate = (values: TeacherStatusFormValues) => {
    if (!statusTeacher) return
    statusMutation.mutate(values, { onSuccess: () => setStatusTeacher(null) })
  }

  const handleAccountManage = async (teacher: Teacher) => {
    setAccountTeacher(teacher)
    // Fetch account info if exists
    if (teacher.user_id) {
      try {
        const response = await authApi.getTeacherAccount(teacher.id)
        setAccountInfo(response.data || null)
      } catch {
        setAccountInfo(null)
      }
    } else {
      setAccountInfo(null)
    }
  }

  const handleAccountSuccess = () => {
    refetch()
    setAccountTeacher(null)
    setAccountInfo(null)
  }

  return (
    <div>
      <PageHeader
        title="Quản lý Giáo viên"
        description="Danh sách toàn bộ giáo viên trong hệ thống"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Thêm giáo viên
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
                  placeholder="Tìm mã GV, tên, email..."
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
                {(Object.entries(TEACHER_STATUS_LABEL) as [TeacherStatus, string][]).map(([v, l]) => (
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
          <TeacherTable
            teachers={listData?.items ?? []}
            isLoading={isLoading}
            onEdit={setEditTeacher}
            onDelete={setDeleteTeacher}
            onStatusChange={setStatusTeacher}
            onAccountManage={handleAccountManage}
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
            <DialogTitle>Thêm giáo viên mới</DialogTitle>
          </DialogHeader>
          <TeacherForm
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
            mode="create"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTeacher} onOpenChange={(o) => !o && setEditTeacher(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa giáo viên</DialogTitle>
          </DialogHeader>
          {editTeacher && (
            <TeacherForm
              defaultValues={editTeacher}
              onSubmit={handleUpdate}
              isLoading={updateMutation.isPending}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Status Dialog */}
      {statusTeacher && (
        <TeacherStatusDialog
          open={!!statusTeacher}
          onOpenChange={(o) => !o && setStatusTeacher(null)}
          teacher={statusTeacher}
          onSubmit={handleStatusUpdate}
          isLoading={statusMutation.isPending}
        />
      )}

      {/* Account Dialog */}
      {accountTeacher && (
        <TeacherAccountDialog
          open={!!accountTeacher}
          onOpenChange={(o) => { if (!o) { setAccountTeacher(null); setAccountInfo(null) } }}
          teacherId={accountTeacher.id}
          teacherName={accountTeacher.full_name}
          teacherCode={accountTeacher.teacher_code}
          teacherEmail={accountTeacher.email}
          existingAccount={accountInfo}
          onSuccess={handleAccountSuccess}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDeleteDialog
        open={!!deleteTeacher}
        onOpenChange={(o) => !o && setDeleteTeacher(null)}
        onConfirm={handleDelete}
        title="Xoá giáo viên"
        description={`Bạn có chắc muốn xoá giáo viên "${deleteTeacher?.full_name}"? Thao tác này sẽ ẩn hồ sơ khỏi hệ thống.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
