import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown, RefreshCw } from 'lucide-react'
import type { Student } from '@/types/student.types'
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
import { StudentStatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'

interface StudentTableProps {
  students: Student[]
  isLoading?: boolean
  onEdit: (student: Student) => void
  onDelete: (student: Student) => void
  onStatusChange: (student: Student) => void
}

export function StudentTable({
  students,
  isLoading,
  onEdit,
  onDelete,
  onStatusChange,
}: StudentTableProps) {
  const [sortField, setSortField] = useState<keyof Student | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const toggleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sorted = [...students].sort((a, b) => {
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
    return <EmptyState title="Không có học sinh" description="Thêm học sinh mới để bắt đầu." />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 font-medium"
              onClick={() => toggleSort('student_code')}
            >
              Mã HS
              <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
            </Button>
          </TableHead>
          <TableHead>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 font-medium"
              onClick={() => toggleSort('full_name')}
            >
              Họ và tên
              <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
            </Button>
          </TableHead>
          <TableHead>Lớp</TableHead>
          <TableHead>Ngày sinh</TableHead>
          <TableHead>Số điện thoại</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="w-[60px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((student) => (
          <TableRow key={student.id}>
            <TableCell className="font-mono text-xs font-medium">{student.student_code}</TableCell>
            <TableCell>
              <div className="font-medium">{student.full_name}</div>
              {student.email && (
                <div className="text-xs text-muted-foreground">{student.email}</div>
              )}
            </TableCell>
            <TableCell>{student.class_name ?? '—'}</TableCell>
            <TableCell className="text-sm">{formatDate(student.date_of_birth)}</TableCell>
            <TableCell className="text-sm">{student.phone_number ?? '—'}</TableCell>
            <TableCell>
              <StudentStatusBadge status={student.academic_status} />
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(student)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(student)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Đổi trạng thái
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(student)}
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
