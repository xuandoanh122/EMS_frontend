import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, RefreshCw, ArrowUpDown } from 'lucide-react'
import type { Teacher } from '@/types/teacher.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TeacherStatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'

interface TeacherTableProps {
  teachers: Teacher[]
  isLoading?: boolean
  onEdit: (teacher: Teacher) => void
  onDelete: (teacher: Teacher) => void
  onStatusChange: (teacher: Teacher) => void
}

export function TeacherTable({
  teachers,
  isLoading,
  onEdit,
  onDelete,
  onStatusChange,
}: TeacherTableProps) {
  const [sortField, setSortField] = useState<keyof Teacher | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const toggleSort = (field: keyof Teacher) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const sorted = [...teachers].sort((a, b) => {
    if (!sortField) return 0
    const va = String(a[sortField] ?? '')
    const vb = String(b[sortField] ?? '')
    return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (sorted.length === 0) {
    return <EmptyState title="Không có giáo viên" description="Thêm giáo viên mới để bắt đầu." />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">
            <Button variant="ghost" size="sm" className="-ml-3 h-8 font-medium" onClick={() => toggleSort('teacher_code')}>
              Mã GV <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" size="sm" className="-ml-3 h-8 font-medium" onClick={() => toggleSort('full_name')}>
              Họ và tên <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
            </Button>
          </TableHead>
          <TableHead>Bộ môn</TableHead>
          <TableHead>Chuyên môn</TableHead>
          <TableHead>Bằng cấp</TableHead>
          <TableHead>Ngày vào</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="w-[60px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((teacher) => (
          <TableRow key={teacher.id}>
            <TableCell className="font-mono text-xs font-medium">{teacher.teacher_code}</TableCell>
            <TableCell>
              <div className="font-medium">{teacher.full_name}</div>
              {teacher.email && <div className="text-xs text-muted-foreground">{teacher.email}</div>}
            </TableCell>
            <TableCell className="text-sm">{teacher.department ?? '—'}</TableCell>
            <TableCell className="text-sm">{teacher.specialization ?? '—'}</TableCell>
            <TableCell className="text-sm">{teacher.qualification ?? '—'}</TableCell>
            <TableCell className="text-sm">{formatDate(teacher.join_date)}</TableCell>
            <TableCell>
              <TeacherStatusBadge status={teacher.employment_status} />
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(teacher)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(teacher)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Đổi trạng thái
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(teacher)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xoá
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
